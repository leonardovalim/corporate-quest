UPDATE public.admin_config
SET ai_config = jsonb_build_object(
  'provider', 'lovable',
  'model', 'google/gemini-3-flash-preview',
  'apiKey', '',
  'baseUrl', ''
),
updated_at = now()
WHERE id = 1;
