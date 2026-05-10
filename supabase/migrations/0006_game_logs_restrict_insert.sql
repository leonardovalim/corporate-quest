-- Restrict game_logs INSERT to authenticated users to prevent table flood by anon.
DROP POLICY IF EXISTS "Anyone can insert game logs" ON public.game_logs;

CREATE POLICY "Authenticated users can insert game logs"
  ON public.game_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);
