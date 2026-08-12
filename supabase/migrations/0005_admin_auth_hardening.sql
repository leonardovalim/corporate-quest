-- ─────────────────────────────────────────────────────────────────────────────
-- 0005 — Hardening do painel admin
--
-- Problema corrigido aqui:
--   admin_config tinha a policy "Anyone can read admin config" (USING true) e
--   guardava admin_password_hash + admin_session_token na MESMA tabela. Como a
--   publishable key é pública por natureza (vai no bundle do front), qualquer
--   pessoa conseguia ler o hash da senha e um token de sessão admin válido — e
--   com esse token chamar get_all_profiles_for_admin(), que tem GRANT TO anon,
--   levando nome/email/telefone/empresa/LinkedIn de todos os jogadores.
--
-- Correção: os segredos saem para admin_auth, que não tem policy nenhuma e
-- portanto é inalcançável via PostgREST. admin_config fica só com ai_config,
-- que é o que o jogo legitimamente precisa ler (e observar via realtime).
--
-- Também corrige um bypass de autenticação: em create_admin_session, com
-- admin_password_hash NULL, crypt() retornava NULL, "NULL != NULL" avaliava
-- NULL, o IF não disparava e QUALQUER senha era aceita.
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

-- ── Cofre dos segredos do admin ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_auth (
  id                       integer     PRIMARY KEY DEFAULT 1,
  admin_password_hash      text,
  admin_session_token      text,
  admin_session_expires_at timestamptz,
  updated_at               timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admin_auth_single_row CHECK (id = 1)
);

ALTER TABLE public.admin_auth ENABLE ROW LEVEL SECURITY;

-- Nenhuma policy é criada de propósito: RLS ligada sem policy nega tudo.
-- Só service_role e as funções SECURITY DEFINER abaixo enxergam esta tabela.
REVOKE ALL ON public.admin_auth FROM anon, authenticated;

-- ── Migra o hash e DESCARTA o token ──────────────────────────────────────────
-- O token é deliberadamente perdido: qualquer sessão admin que tenha vazado
-- pela leitura pública morre nesta migration.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'admin_config'
      AND column_name  = 'admin_password_hash'
  ) THEN
    EXECUTE $mig$
      INSERT INTO public.admin_auth (id, admin_password_hash, admin_session_token, admin_session_expires_at)
      SELECT 1, admin_password_hash, NULL, NULL
      FROM public.admin_config WHERE id = 1
      ON CONFLICT (id) DO NOTHING
    $mig$;
  ELSE
    INSERT INTO public.admin_auth (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- ── Neutraliza a senha padrão ────────────────────────────────────────────────
-- 0004_admin.sql semeia a senha 'admin'. Em repositório público isso equivale a
-- não ter senha. Se a instalação ainda estiver na padrão, o hash é zerado e o
-- painel fica trancado até o operador definir uma senha real via SQL editor:
--
--   UPDATE public.admin_auth
--   SET admin_password_hash = extensions.crypt('SUA_SENHA_FORTE', extensions.gen_salt('bf')),
--       updated_at = now()
--   WHERE id = 1;
--
-- (Não existe RPC de bootstrap chamável por anon de propósito — seria uma
-- corrida para quem definisse a senha primeiro.)
UPDATE public.admin_auth
SET admin_password_hash = NULL,
    updated_at          = now()
WHERE id = 1
  AND admin_password_hash IS NOT NULL
  AND extensions.crypt('admin', admin_password_hash) = admin_password_hash;

-- ── Remove os segredos da tabela de leitura pública ──────────────────────────
ALTER TABLE public.admin_config
  DROP COLUMN IF EXISTS admin_password_hash,
  DROP COLUMN IF EXISTS admin_session_token,
  DROP COLUMN IF EXISTS admin_session_expires_at,
  DROP COLUMN IF EXISTS admin_password;  -- coluna de schema legado, se existir

-- ── Validação de token centralizada ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_token_is_valid(p_token text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, extensions AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_auth
    WHERE id = 1
      AND p_token                  IS NOT NULL
      AND admin_session_token      IS NOT NULL
      AND admin_session_expires_at IS NOT NULL
      AND admin_session_token = p_token
      AND admin_session_expires_at > now()
  );
$$;

-- Não é chamável de fora; serve só às funções SECURITY DEFINER abaixo.
REVOKE EXECUTE ON FUNCTION public.admin_token_is_valid(text) FROM PUBLIC;

-- ── RPCs reescritas para ler de admin_auth ───────────────────────────────────
-- DROP antes de CREATE (em vez de CREATE OR REPLACE) porque instalações mais
-- antigas podem ter estas funções com outro NOME de parâmetro (p_password em
-- vez de p_token) — e CREATE OR REPLACE falha com "cannot change name of input
-- parameter". A assinatura no DROP é por tipo, então cobre as duas variantes.
DROP FUNCTION IF EXISTS public.create_admin_session(text);
DROP FUNCTION IF EXISTS public.change_admin_password(text, text);
DROP FUNCTION IF EXISTS public.get_all_profiles_for_admin(text);
DROP FUNCTION IF EXISTS public.update_admin_ai_config(text, jsonb);
DROP FUNCTION IF EXISTS public.get_game_logs_for_admin(text, integer, text);
-- Função de schema legado: verificava a senha e devolvia boolean, exposta a
-- anon. Não é usada pelo painel atual — some para reduzir superfície.
DROP FUNCTION IF EXISTS public.verify_admin_password(text);

CREATE FUNCTION public.create_admin_session(p_password text)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  v_hash  text;
  v_token text;
BEGIN
  SELECT admin_password_hash INTO v_hash FROM public.admin_auth WHERE id = 1;

  -- Hash ausente nunca autentica (era o bypass do 0004).
  IF v_hash IS NULL OR length(v_hash) = 0 THEN
    RAISE EXCEPTION 'Senha de admin não configurada';
  END IF;

  IF extensions.crypt(p_password, v_hash) IS DISTINCT FROM v_hash THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  v_token := gen_random_uuid()::text;
  UPDATE public.admin_auth
  SET admin_session_token      = v_token,
      admin_session_expires_at = now() + interval '8 hours',
      updated_at               = now()
  WHERE id = 1;

  RETURN v_token;
END;
$$;

CREATE FUNCTION public.change_admin_password(p_current_password text, p_new_password text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE v_hash text;
BEGIN
  SELECT admin_password_hash INTO v_hash FROM public.admin_auth WHERE id = 1;

  IF v_hash IS NULL OR length(v_hash) = 0 THEN
    RAISE EXCEPTION 'Senha de admin não configurada';
  END IF;

  IF extensions.crypt(p_current_password, v_hash) IS DISTINCT FROM v_hash THEN
    RAISE EXCEPTION 'Senha atual incorreta';
  END IF;

  IF length(trim(p_new_password)) < 6 THEN
    RAISE EXCEPTION 'Nova senha deve ter ao menos 6 caracteres';
  END IF;

  UPDATE public.admin_auth
  SET admin_password_hash      = extensions.crypt(p_new_password, extensions.gen_salt('bf')),
      -- trocar a senha derruba as sessões abertas
      admin_session_token      = NULL,
      admin_session_expires_at = NULL,
      updated_at               = now()
  WHERE id = 1;
END;
$$;

CREATE FUNCTION public.get_all_profiles_for_admin(p_token text)
RETURNS TABLE (
  id uuid, full_name text, email text, phone text, company_name text,
  linkedin_url text, has_product_openings boolean, rating smallint,
  feedback text, character_snapshot jsonb, created_at timestamptz,
  updated_at timestamptz, last_sign_in_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
#variable_conflict use_column
BEGIN
  IF NOT public.admin_token_is_valid(p_token) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
    SELECT
      p.id AS id,
      p.full_name, p.email, p.phone, p.company_name, p.linkedin_url,
      p.has_product_openings, p.rating, p.feedback, p.character_snapshot,
      p.created_at, p.updated_at, u.last_sign_in_at
    FROM public.profiles p
    LEFT JOIN auth.users u ON (u.id = p.id)
    ORDER BY p.created_at DESC;
END;
$$;

CREATE FUNCTION public.update_admin_ai_config(p_token text, p_config jsonb)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
BEGIN
  IF NOT public.admin_token_is_valid(p_token) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.admin_config SET ai_config = p_config, updated_at = now()
  WHERE admin_config.id = 1;
END;
$$;

CREATE FUNCTION public.get_game_logs_for_admin(
  p_token text, p_limit integer DEFAULT 200, p_event text DEFAULT NULL
)
RETURNS SETOF public.game_logs
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
BEGIN
  IF NOT public.admin_token_is_valid(p_token) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
    SELECT * FROM public.game_logs
    WHERE (p_event IS NULL OR event = p_event)
    ORDER BY created_at DESC LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_admin_session(text)                   TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.change_admin_password(text, text)            TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_profiles_for_admin(text)             TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_admin_ai_config(text, jsonb)          TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_game_logs_for_admin(text, integer, text) TO anon, authenticated;

COMMIT;
