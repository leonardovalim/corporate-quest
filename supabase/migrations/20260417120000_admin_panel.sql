-- Tabela singleton de configuração global de IA para o painel admin
CREATE TABLE IF NOT EXISTS public.admin_config (
  id integer PRIMARY KEY DEFAULT 1,
  ai_config jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO public.admin_config (id) VALUES (1) ON CONFLICT DO NOTHING;

ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admin_config' AND policyname = 'Anyone can read admin config'
  ) THEN
    CREATE POLICY "Anyone can read admin config" ON public.admin_config FOR SELECT USING (true);
  END IF;
END;
$$;

-- Habilita Realtime para propagação ao vivo para todos os clientes (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'admin_config'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_config;
  END IF;
END;
$$;

-- RPC: retorna todos os perfis (bypassa RLS com SECURITY DEFINER)
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
BEGIN
  IF p_password != 'REDACTED' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY
    SELECT
      p.id,
      p.full_name,
      p.email,
      p.phone,
      p.company_name,
      p.linkedin_url,
      p.has_product_openings,
      p.rating,
      p.feedback,
      p.character_snapshot,
      p.created_at,
      p.updated_at,
      u.last_sign_in_at
    FROM public.profiles p
    LEFT JOIN auth.users u ON u.id = p.id
    ORDER BY p.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_profiles_for_admin(text) TO anon, authenticated;

-- RPC: atualiza configuração global de IA
CREATE OR REPLACE FUNCTION public.update_admin_ai_config(p_password text, p_config jsonb)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF p_password != 'REDACTED' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE public.admin_config SET ai_config = p_config, updated_at = now() WHERE id = 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_admin_ai_config(text, jsonb) TO anon, authenticated;
