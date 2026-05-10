CREATE OR REPLACE FUNCTION public.verify_admin_password(p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  DECLARE v_expected text;
  BEGIN
    SELECT ac.admin_password INTO v_expected FROM public.admin_config ac WHERE ac.id = 1;
    RETURN v_expected IS NOT NULL AND p_password = v_expected;
  END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_admin_password(text) TO anon, authenticated;