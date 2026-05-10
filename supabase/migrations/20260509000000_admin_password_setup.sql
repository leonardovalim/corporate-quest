-- Semente: projetos novos têm admin_password = NULL — define 'admin' como padrão
-- Self-hosters devem trocar imediatamente via /admin → Segurança
UPDATE public.admin_config
SET admin_password = 'admin'
WHERE id = 1 AND admin_password IS NULL;

-- RPC para trocar a senha via painel (sem precisar de SQL manual)
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
  UPDATE public.admin_config
  SET admin_password = p_new_password, updated_at = now()
  WHERE id = 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.change_admin_password(text, text) TO anon, authenticated;
