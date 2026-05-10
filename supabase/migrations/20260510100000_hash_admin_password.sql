-- Hash admin_password with bcrypt via pgcrypto.
-- Removes plaintext column that was exposed by the open SELECT RLS policy.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.admin_config
  ADD COLUMN IF NOT EXISTS admin_password_hash text;

-- Hash whatever password is currently stored
UPDATE public.admin_config
SET admin_password_hash = crypt(admin_password, gen_salt('bf'))
WHERE id = 1 AND admin_password IS NOT NULL;

ALTER TABLE public.admin_config
  DROP COLUMN IF EXISTS admin_password;

-- verify_admin_password: compare against bcrypt hash
CREATE OR REPLACE FUNCTION public.verify_admin_password(p_password text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_hash text;
BEGIN
  SELECT admin_password_hash INTO v_hash FROM public.admin_config WHERE id = 1;
  RETURN crypt(p_password, v_hash) = v_hash;
END;
$$;

-- change_admin_password: verify current, store new hash
CREATE OR REPLACE FUNCTION public.change_admin_password(
  p_current_password text,
  p_new_password     text
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_hash text;
BEGIN
  SELECT admin_password_hash INTO v_hash FROM public.admin_config WHERE id = 1;
  IF crypt(p_current_password, v_hash) != v_hash THEN
    RAISE EXCEPTION 'Senha atual incorreta';
  END IF;
  IF length(trim(p_new_password)) < 6 THEN
    RAISE EXCEPTION 'Nova senha deve ter ao menos 6 caracteres';
  END IF;
  UPDATE public.admin_config
  SET admin_password_hash = crypt(p_new_password, gen_salt('bf')), updated_at = now()
  WHERE id = 1;
END;
$$;

-- get_all_profiles_for_admin: verify via hash
CREATE OR REPLACE FUNCTION public.get_all_profiles_for_admin(p_password text)
RETURNS TABLE (
  id uuid, full_name text, email text, phone text, company_name text,
  linkedin_url text, has_product_openings boolean, rating smallint,
  feedback text, character_snapshot jsonb, created_at timestamptz,
  updated_at timestamptz, last_sign_in_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_hash text;
BEGIN
  SELECT admin_password_hash INTO v_hash FROM public.admin_config WHERE id = 1;
  IF crypt(p_password, v_hash) != v_hash THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY
    SELECT p.id, p.full_name, p.email, p.phone, p.company_name, p.linkedin_url,
           p.has_product_openings, p.rating, p.feedback, p.character_snapshot,
           p.created_at, p.updated_at, u.last_sign_in_at
    FROM public.profiles p
    LEFT JOIN auth.users u ON u.id = p.id
    ORDER BY p.created_at DESC;
END;
$$;

-- update_admin_ai_config: verify via hash
CREATE OR REPLACE FUNCTION public.update_admin_ai_config(p_password text, p_config jsonb)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_hash text;
BEGIN
  SELECT admin_password_hash INTO v_hash FROM public.admin_config WHERE id = 1;
  IF crypt(p_password, v_hash) != v_hash THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE public.admin_config SET ai_config = p_config, updated_at = now() WHERE id = 1;
END;
$$;

-- get_game_logs_for_admin: verify via hash
CREATE OR REPLACE FUNCTION public.get_game_logs_for_admin(
  p_password text,
  p_limit    integer DEFAULT 200,
  p_event    text    DEFAULT NULL
)
RETURNS SETOF public.game_logs
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_hash text;
BEGIN
  SELECT admin_password_hash INTO v_hash FROM public.admin_config WHERE id = 1;
  IF crypt(p_password, v_hash) != v_hash THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY
    SELECT * FROM public.game_logs
    WHERE (p_event IS NULL OR event = p_event)
    ORDER BY created_at DESC
    LIMIT p_limit;
END;
$$;
