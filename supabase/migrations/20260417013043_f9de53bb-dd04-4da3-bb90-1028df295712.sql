-- Generic updated_at trigger function (idempotent)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Profiles table linked to auth.users
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  company_name text NOT NULL,
  email text NOT NULL,
  linkedin_url text,
  has_product_openings boolean NOT NULL DEFAULT false,
  rating smallint,
  feedback text,
  character_snapshot jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_rating_range CHECK (rating IS NULL OR (rating >= 1 AND rating <= 10)),
  CONSTRAINT profiles_full_name_len CHECK (char_length(full_name) <= 255),
  CONSTRAINT profiles_phone_len CHECK (char_length(phone) <= 32),
  CONSTRAINT profiles_company_len CHECK (char_length(company_name) <= 255),
  CONSTRAINT profiles_email_len CHECK (char_length(email) <= 255),
  CONSTRAINT profiles_linkedin_len CHECK (linkedin_url IS NULL OR char_length(linkedin_url) <= 500),
  CONSTRAINT profiles_feedback_len CHECK (feedback IS NULL OR char_length(feedback) <= 1000)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();