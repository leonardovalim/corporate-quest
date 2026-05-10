import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGame } from '@/game/GameContext';

function getSessionId(): string {
  const KEY = 'cq.session_id';
  let id = sessionStorage.getItem(KEY);
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(KEY, id); }
  return id;
}

export function useGameLogger() {
  const { encounter } = useGame();
  const sessionId = useRef(getSessionId());
  const encounterRef = useRef(encounter);

  useEffect(() => { encounterRef.current = encounter; }, [encounter]);

  // Stable callback — reads encounter via ref so it's always current at call time
  const logEvent = useCallback((
    event: string,
    data: Record<string, unknown>,
    opts?: { provider?: string; model?: string }
  ) => {
    void (async () => {
      try {
        // Sanitize: replace undefined/NaN with null so JSON stays valid for PostgREST
        const safeData = JSON.parse(JSON.stringify(data, (_, v) =>
          v === undefined || (typeof v === 'number' && !isFinite(v)) ? null : v
        )) as Record<string, unknown>;

        const row: Record<string, unknown> = {
          session_id: sessionId.current,
          event,
          data: safeData,
        };
        if (encounterRef.current?.name) row.encounter = encounterRef.current.name;
        if (encounterRef.current?.phase != null) row.phase = encounterRef.current.phase;
        if (opts?.provider) row.provider = opts.provider;
        if (opts?.model) row.model = opts.model;

        await supabase.from('game_logs').insert(row as never);
      } catch {
        /* never block the game */
      }
    })();
  }, []);

  return { logEvent };
}
