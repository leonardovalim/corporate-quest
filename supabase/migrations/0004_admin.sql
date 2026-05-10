CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ── Admin config (singleton) ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_config (
  id                      integer     PRIMARY KEY DEFAULT 1,
  ai_config               jsonb,
  admin_password_hash     text,
  admin_session_token     text,
  admin_session_expires_at timestamptz,
  updated_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO public.admin_config (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Seed default password 'admin' for fresh installs — change via /admin → Segurança
UPDATE public.admin_config
SET admin_password_hash = extensions.crypt('admin', extensions.gen_salt('bf'))
WHERE id = 1 AND admin_password_hash IS NULL;

ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read admin config"
  ON public.admin_config FOR SELECT USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_config;

-- ── Game logs ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.game_logs (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  session_id text        NOT NULL,
  user_id    uuid,
  provider   text,
  model      text,
  event      text        NOT NULL,
  encounter  text,
  phase      integer,
  data       jsonb       NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS game_logs_created_at_idx ON public.game_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS game_logs_session_id_idx ON public.game_logs(session_id);

ALTER TABLE public.game_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert game logs"
  ON public.game_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ── Admin RPCs ────────────────────────────────────────────────────────────────

-- Login: verify password once, return a session token valid for 8 hours.
-- The token is stored in the DB and passed by the client on subsequent calls.
CREATE OR REPLACE FUNCTION public.create_admin_session(p_password text)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  v_hash  text;
  v_token text;
BEGIN
  SELECT admin_password_hash INTO v_hash FROM public.admin_config WHERE admin_config.id = 1;
  IF extensions.crypt(p_password, v_hash) != v_hash THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  v_token := gen_random_uuid()::text;
  UPDATE public.admin_config
  SET admin_session_token      = v_token,
      admin_session_expires_at = now() + interval '8 hours'
  WHERE admin_config.id = 1;
  RETURN v_token;
END;
$$;

-- Change password (called from Security tab with current + new password)
CREATE OR REPLACE FUNCTION public.change_admin_password(p_current_password text, p_new_password text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE v_hash text;
BEGIN
  SELECT admin_password_hash INTO v_hash FROM public.admin_config WHERE admin_config.id = 1;
  IF extensions.crypt(p_current_password, v_hash) != v_hash THEN
    RAISE EXCEPTION 'Senha atual incorreta';
  END IF;
  IF length(trim(p_new_password)) < 6 THEN
    RAISE EXCEPTION 'Nova senha deve ter ao menos 6 caracteres';
  END IF;
  UPDATE public.admin_config
  SET admin_password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf')),
      updated_at          = now()
  WHERE admin_config.id = 1;
END;
$$;

-- List all user profiles (bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_all_profiles_for_admin(p_token text)
RETURNS TABLE (
  id uuid, full_name text, email text, phone text, company_name text,
  linkedin_url text, has_product_openings boolean, rating smallint,
  feedback text, character_snapshot jsonb, created_at timestamptz,
  updated_at timestamptz, last_sign_in_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
#variable_conflict use_column
DECLARE v_token text; v_expires timestamptz;
BEGIN
  SELECT admin_session_token, admin_session_expires_at INTO v_token, v_expires
  FROM public.admin_config WHERE admin_config.id = 1;
  IF p_token IS DISTINCT FROM v_token OR now() > v_expires THEN
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

-- Update global AI config
CREATE OR REPLACE FUNCTION public.update_admin_ai_config(p_token text, p_config jsonb)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE v_token text; v_expires timestamptz;
BEGIN
  SELECT admin_session_token, admin_session_expires_at INTO v_token, v_expires
  FROM public.admin_config WHERE admin_config.id = 1;
  IF p_token IS DISTINCT FROM v_token OR now() > v_expires THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE public.admin_config SET ai_config = p_config, updated_at = now()
  WHERE admin_config.id = 1;
END;
$$;

-- Fetch game logs
CREATE OR REPLACE FUNCTION public.get_game_logs_for_admin(
  p_token text, p_limit integer DEFAULT 200, p_event text DEFAULT NULL
)
RETURNS SETOF public.game_logs
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE v_token text; v_expires timestamptz;
BEGIN
  SELECT admin_session_token, admin_session_expires_at INTO v_token, v_expires
  FROM public.admin_config WHERE admin_config.id = 1;
  IF p_token IS DISTINCT FROM v_token OR now() > v_expires THEN
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
