-- ─────────────────────────────────────────────────────────────────────────────
-- 0006 — A configuração global de IA nunca guarda chave de API
--
-- Problema corrigido aqui:
--   admin_config.ai_config guardava o objeto AIConfig inteiro, incluindo apiKey.
--   A tabela é de leitura pública (o jogo precisa saber provider/model), então
--   uma chave da OpenAI configurada pelo painel ficava legível para qualquer
--   portador da publishable key — que é pública, vai no bundle do front.
--
--   E o vazamento no banco era só metade: o cliente usa aiConfig.apiKey para
--   chamar o provedor DIRETO do navegador, então uma chave global apareceria no
--   DevTools de qualquer jogador de qualquer jeito. Não existe forma segura de
--   ter chave global no cliente.
--
-- Decisão: a configuração global define apenas provider/model/baseUrl. A chave
-- é sempre do próprio jogador (localStorage do navegador dele) ou fica como
-- secret da edge function. Esta migration remove a chave existente e faz a RPC
-- descartar o campo, para que nem um admin distraído consiga plantar segredo
-- num campo de leitura pública.
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

-- ── Remove a chave que já estava gravada ─────────────────────────────────────
UPDATE public.admin_config
SET ai_config  = ai_config - 'apiKey',
    updated_at = now()
WHERE id = 1
  AND ai_config ? 'apiKey';

-- ── A RPC passa a descartar apiKey antes de gravar ───────────────────────────
CREATE OR REPLACE FUNCTION public.update_admin_ai_config(p_token text, p_config jsonb)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
BEGIN
  IF NOT public.admin_token_is_valid(p_token) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Defesa no servidor: mesmo que o painel (ou um script) mande a chave, ela
  -- não entra numa tabela que o mundo inteiro consegue ler.
  UPDATE public.admin_config
  SET ai_config  = p_config - 'apiKey',
      updated_at = now()
  WHERE admin_config.id = 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_admin_ai_config(text, jsonb) TO anon, authenticated;

COMMIT;
