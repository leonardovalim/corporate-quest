CREATE TABLE IF NOT EXISTS public.game_logs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  session_id  text        NOT NULL,
  user_id     uuid,
  provider    text,
  model       text,
  event       text        NOT NULL,
  encounter   text,
  phase       integer,
  data        jsonb       NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS game_logs_created_at_idx ON public.game_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS game_logs_session_id_idx ON public.game_logs (session_id);

ALTER TABLE public.game_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert game logs"
  ON public.game_logs FOR INSERT WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.get_game_logs_for_admin(
  p_password text,
  p_limit    integer DEFAULT 200,
  p_event    text    DEFAULT NULL
)
RETURNS SETOF public.game_logs
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF p_password != 'REDACTED' THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  RETURN QUERY
    SELECT * FROM public.game_logs
    WHERE (p_event IS NULL OR event = p_event)
    ORDER BY created_at DESC
    LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_game_logs_for_admin(text, integer, text) TO anon, authenticated;
