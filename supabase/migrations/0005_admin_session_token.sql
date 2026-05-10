-- Replace password-per-request pattern with a session token.
-- On login: create_admin_session() verifies password once, returns a UUID token (8h TTL).
-- All admin RPCs now verify the token instead of re-checking the password.

ALTER TABLE public.admin_config
  ADD COLUMN IF NOT EXISTS admin_session_token      text,
  ADD COLUMN IF NOT EXISTS admin_session_expires_at timestamptz;

-- create_admin_session: verify password, issue session token
CREATE OR REPLACE FUNCTION public.create_admin_session(p_password text)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  v_hash  text;
  v_token text;
BEGIN
  SELECT admin_password_hash INTO v_hash FROM public.admin_config WHERE id = 1;
  IF extensions.crypt(p_password, v_hash) != v_hash THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  v_token := gen_random_uuid()::text;
  UPDATE public.admin_config
  SET admin_session_token      = v_token,
      admin_session_expires_at = now() + interval '8 hours'
  WHERE id = 1;
  RETURN v_token;
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_admin_session(text) TO anon, authenticated;

-- get_all_profiles_for_admin: verify token
CREATE OR REPLACE FUNCTION public.get_all_profiles_for_admin(p_token text)
RETURNS TABLE (
  id uuid, full_name text, email text, phone text, company_name text,
  linkedin_url text, has_product_openings boolean, rating smallint,
  feedback text, character_snapshot jsonb, created_at timestamptz,
  updated_at timestamptz, last_sign_in_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE v_token text; v_expires timestamptz;
BEGIN
  SELECT admin_session_token, admin_session_expires_at INTO v_token, v_expires FROM public.admin_config WHERE id = 1;
  IF p_token IS DISTINCT FROM v_token OR now() > v_expires THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  RETURN QUERY
    SELECT
      p.id        AS id,
      p.full_name, p.email, p.phone, p.company_name, p.linkedin_url,
      p.has_product_openings, p.rating, p.feedback, p.character_snapshot,
      p.created_at, p.updated_at, u.last_sign_in_at
    FROM public.profiles p
    LEFT JOIN auth.users u ON (u.id = p.id)
    ORDER BY p.created_at DESC;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_all_profiles_for_admin(text) TO anon, authenticated;

-- update_admin_ai_config: verify token
CREATE OR REPLACE FUNCTION public.update_admin_ai_config(p_token text, p_config jsonb)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE v_token text; v_expires timestamptz;
BEGIN
  SELECT admin_session_token, admin_session_expires_at INTO v_token, v_expires FROM public.admin_config WHERE id = 1;
  IF p_token IS DISTINCT FROM v_token OR now() > v_expires THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  UPDATE public.admin_config SET ai_config = p_config, updated_at = now() WHERE id = 1;
END;
$$;
GRANT EXECUTE ON FUNCTION public.update_admin_ai_config(text, jsonb) TO anon, authenticated;

-- get_game_logs_for_admin: verify token
CREATE OR REPLACE FUNCTION public.get_game_logs_for_admin(
  p_token text, p_limit integer DEFAULT 200, p_event text DEFAULT NULL
)
RETURNS SETOF public.game_logs
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE v_token text; v_expires timestamptz;
BEGIN
  SELECT admin_session_token, admin_session_expires_at INTO v_token, v_expires FROM public.admin_config WHERE id = 1;
  IF p_token IS DISTINCT FROM v_token OR now() > v_expires THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  RETURN QUERY
    SELECT * FROM public.game_logs
    WHERE (p_event IS NULL OR event = p_event)
    ORDER BY created_at DESC LIMIT p_limit;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_game_logs_for_admin(text, integer, text) TO anon, authenticated;
