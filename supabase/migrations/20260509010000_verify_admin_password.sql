-- RPC para verificar a senha do admin (usada pelo painel /admin)
-- Retorna true se a senha estiver correta, false caso contrário
CREATE OR REPLACE FUNCTION public.verify_admin_password(p_password text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_expected text;
BEGIN
  SELECT admin_password INTO v_expected FROM public.admin_config WHERE id = 1;
  RETURN p_password IS NOT DISTINCT FROM v_expected;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_admin_password(text) TO anon, authenticated;
