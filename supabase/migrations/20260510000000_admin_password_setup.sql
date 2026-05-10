-- Add admin_password column and migrate from hardcoded password to DB-stored password
ALTER TABLE public.admin_config
  ADD COLUMN IF NOT EXISTS admin_password text;

-- Seed 'admin' for fresh installs (existing prod instance needs manual update via SQL)
UPDATE public.admin_config
SET admin_password = 'admin'
WHERE id = 1 AND admin_password IS NULL;

-- Verify admin password against DB (replaces client-side hardcoded check)
CREATE OR REPLACE FUNCTION public.verify_admin_password(p_password text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_stored text;
BEGIN
  SELECT admin_password INTO v_stored FROM public.admin_config WHERE id = 1;
  RETURN p_password IS NOT DISTINCT FROM v_stored;
END;
$$;
GRANT EXECUTE ON FUNCTION public.verify_admin_password(text) TO anon, authenticated;

-- Change admin password (requires current password)
CREATE OR REPLACE FUNCTION public.change_admin_password(
  p_current_password text,
  p_new_password     text
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_expected text;
BEGIN
  SELECT admin_password INTO v_expected FROM public.admin_config WHERE id = 1;
  IF p_current_password IS DISTINCT FROM v_expected THEN
    RAISE EXCEPTION 'Senha atual incorreta';
  END IF;
  IF length(trim(p_new_password)) < 6 THEN
    RAISE EXCEPTION 'Nova senha deve ter ao menos 6 caracteres';
  END IF;
  UPDATE public.admin_config SET admin_password = p_new_password, updated_at = now() WHERE id = 1;
END;
$$;
GRANT EXECUTE ON FUNCTION public.change_admin_password(text, text) TO anon, authenticated;

-- Update existing RPCs to check against DB column instead of hardcoded 'REDACTED'
CREATE OR REPLACE FUNCTION public.get_all_profiles_for_admin(p_password text)
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  phone text,
  company_name text,
  linkedin_url text,
  has_product_openings boolean,
  rating smallint,
  feedback text,
  character_snapshot jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  last_sign_in_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_stored text;
BEGIN
  SELECT admin_password INTO v_stored FROM public.admin_config WHERE id = 1;
  IF p_password IS DISTINCT FROM v_stored THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY
    SELECT
      p.id, p.full_name, p.email, p.phone, p.company_name, p.linkedin_url,
      p.has_product_openings, p.rating, p.feedback, p.character_snapshot,
      p.created_at, p.updated_at, u.last_sign_in_at
    FROM public.profiles p
    LEFT JOIN auth.users u ON u.id = p.id
    ORDER BY p.created_at DESC;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_all_profiles_for_admin(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.update_admin_ai_config(p_password text, p_config jsonb)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_stored text;
BEGIN
  SELECT admin_password INTO v_stored FROM public.admin_config WHERE id = 1;
  IF p_password IS DISTINCT FROM v_stored THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE public.admin_config SET ai_config = p_config, updated_at = now() WHERE id = 1;
END;
$$;
GRANT EXECUTE ON FUNCTION public.update_admin_ai_config(text, jsonb) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_game_logs_for_admin(
  p_password text,
  p_limit    integer DEFAULT 200,
  p_event    text    DEFAULT NULL
)
RETURNS SETOF public.game_logs
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_stored text;
BEGIN
  SELECT admin_password INTO v_stored FROM public.admin_config WHERE id = 1;
  IF p_password IS DISTINCT FROM v_stored THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY
    SELECT * FROM public.game_logs
    WHERE (p_event IS NULL OR event = p_event)
    ORDER BY created_at DESC
    LIMIT p_limit;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_game_logs_for_admin(text, integer, text) TO anon, authenticated;