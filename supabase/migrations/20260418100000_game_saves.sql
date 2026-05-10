CREATE TABLE public.game_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  character_name text NOT NULL,
  class_name text,
  level integer NOT NULL DEFAULT 1,
  snapshot jsonb NOT NULL,
  last_played_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT game_saves_name_len CHECK (char_length(name) <= 120),
  CONSTRAINT game_saves_character_len CHECK (char_length(character_name) <= 120)
);

ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saves"
  ON public.game_saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saves"
  ON public.game_saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saves"
  ON public.game_saves FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saves"
  ON public.game_saves FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX game_saves_user_last_played_idx ON public.game_saves(user_id, last_played_at DESC);

CREATE TRIGGER game_saves_updated_at
  BEFORE UPDATE ON public.game_saves
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
