-- Fix: pgcrypto lives in the 'extensions' schema on Supabase.
-- Functions with SET search_path = public can't find crypt() without the full path.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.verify_admin_password(p_password text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE v_hash text;
BEGIN
  SELECT admin_password_hash INTO v_hash FROM public.admin_config WHERE id = 1;
  RETURN extensions.crypt(p_password, v_hash) = v_hash;
END;
$$;

CREATE OR REPLACE FUNCTION public.change_admin_password(
  p_current_password text,
  p_new_password     text
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE v_hash text;
BEGIN
  SELECT admin_password_hash INTO v_hash FROM public.admin_config WHERE id = 1;
  IF extensions.crypt(p_current_password, v_hash) != v_hash THEN
    RAISE EXCEPTION 'Senha atual incorreta';
  END IF;
  IF length(trim(p_new_password)) < 6 THEN
    RAISE EXCEPTION 'Nova senha deve ter ao menos 6 caracteres';
  END IF;
  UPDATE public.admin_config
  SET admin_password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf')), updated_at = now()
  WHERE id = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_profiles_for_admin(p_password text)
RETURNS TABLE (
  id uuid, full_name text, email text, phone text, company_name text,
  linkedin_url text, has_product_openings boolean, rating smallint,
  feedback text, character_snapshot jsonb, created_at timestamptz,
  updated_at timestamptz, last_sign_in_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE v_hash text;
BEGIN
  SELECT admin_password_hash INTO v_hash FROM public.admin_config WHERE id = 1;
  IF extensions.crypt(p_password, v_hash) != v_hash THEN
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

CREATE OR REPLACE FUNCTION public.update_admin_ai_config(p_password text, p_config jsonb)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE v_hash text;
BEGIN
  SELECT admin_password_hash INTO v_hash FROM public.admin_config WHERE id = 1;
  IF extensions.crypt(p_password, v_hash) != v_hash THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE public.admin_config SET ai_config = p_config, updated_at = now() WHERE id = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_game_logs_for_admin(
  p_password text,
  p_limit    integer DEFAULT 200,
  p_event    text    DEFAULT NULL
)
RETURNS SETOF public.game_logs
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE v_hash text;
BEGIN
  SELECT admin_password_hash INTO v_hash FROM public.admin_config WHERE id = 1;
  IF extensions.crypt(p_password, v_hash) != v_hash THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY
    SELECT * FROM public.game_logs
    WHERE (p_event IS NULL OR event = p_event)
    ORDER BY created_at DESC
    LIMIT p_limit;
END;
$$;
