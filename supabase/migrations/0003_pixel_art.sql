-- Pixel art cache for encounter scenes (DALL-E 3 generated, keyed by encounter+phase)
CREATE TABLE IF NOT EXISTS public.pixel_art_cache (
  encounter_name text        NOT NULL,
  phase          int         NOT NULL,
  image_url      text        NOT NULL,
  storage_path   text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (encounter_name, phase)
);

ALTER TABLE public.pixel_art_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pixel_art_cache_select_authenticated"
  ON public.pixel_art_cache FOR SELECT TO authenticated USING (true);

-- Storage bucket (public read, edge function writes via service_role)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pixel-art', 'pixel-art', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "pixel_art_public_read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'pixel-art');
