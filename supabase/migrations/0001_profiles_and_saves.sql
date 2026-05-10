-- Shared trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ── Profiles ─────────────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id                  uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name           text        NOT NULL,
  phone               text        NOT NULL,
  company_name        text        NOT NULL,
  email               text        NOT NULL,
  linkedin_url        text,
  has_product_openings boolean    NOT NULL DEFAULT false,
  rating              smallint,
  feedback            text,
  character_snapshot  jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_rating_range   CHECK (rating IS NULL OR (rating BETWEEN 1 AND 10)),
  CONSTRAINT profiles_full_name_len  CHECK (char_length(full_name)    <= 255),
  CONSTRAINT profiles_phone_len      CHECK (char_length(phone)         <= 32),
  CONSTRAINT profiles_company_len    CHECK (char_length(company_name)  <= 255),
  CONSTRAINT profiles_email_len      CHECK (char_length(email)         <= 255),
  CONSTRAINT profiles_linkedin_len   CHECK (linkedin_url IS NULL OR char_length(linkedin_url) <= 500),
  CONSTRAINT profiles_feedback_len   CHECK (feedback IS NULL OR char_length(feedback) <= 1000)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"   ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── Game saves ────────────────────────────────────────────────────────────────
CREATE TABLE public.game_saves (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text        NOT NULL,
  character_name  text        NOT NULL,
  class_name      text,
  level           integer     NOT NULL DEFAULT 1,
  snapshot        jsonb       NOT NULL,
  last_played_at  timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT game_saves_name_len      CHECK (char_length(name)           <= 120),
  CONSTRAINT game_saves_character_len CHECK (char_length(character_name) <= 120)
);

ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saves"   ON public.game_saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saves" ON public.game_saves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own saves" ON public.game_saves FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saves" ON public.game_saves FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX game_saves_user_last_played_idx ON public.game_saves(user_id, last_played_at DESC);

CREATE TRIGGER game_saves_updated_at
  BEFORE UPDATE ON public.game_saves
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
