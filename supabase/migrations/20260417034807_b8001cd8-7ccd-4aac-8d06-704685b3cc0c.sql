-- Pixel art cache for encounter scenes (DALL-E 3 generated)
-- Keyed by (encounter_name, phase). Images stored in the `pixel-art` bucket.

CREATE TABLE IF NOT EXISTS public.pixel_art_cache (
  encounter_name TEXT NOT NULL,
  phase INT NOT NULL,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (encounter_name, phase)
);

ALTER TABLE public.pixel_art_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pixel_art_cache_select_authenticated" ON public.pixel_art_cache;
CREATE POLICY "pixel_art_cache_select_authenticated"
  ON public.pixel_art_cache
  FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('pixel-art', 'pixel-art', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "pixel_art_public_read" ON storage.objects;
CREATE POLICY "pixel_art_public_read"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'pixel-art');