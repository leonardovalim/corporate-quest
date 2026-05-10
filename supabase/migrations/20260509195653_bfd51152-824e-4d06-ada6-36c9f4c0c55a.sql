ALTER TABLE public.game_saves
  ADD COLUMN IF NOT EXISTS character_name text,
  ADD COLUMN IF NOT EXISTS class_name text,
  ADD COLUMN IF NOT EXISTS level integer,
  ADD COLUMN IF NOT EXISTS last_played_at timestamptz NOT NULL DEFAULT now();