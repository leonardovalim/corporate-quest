import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGame } from '@/game/GameContext';
import { buildGameSnapshot } from '@/game/snapshot';

const DEBOUNCE_MS = 3000;

export function useGameAutosave(userId: string | null) {
  const {
    screen,
    character,
    messages,
    encounter,
    recentEncounters,
    diceLog,
    isStreaming,
    activeSaveId,
    setActiveSaveId,
  } = useGame();
  const timerRef = useRef<number | null>(null);
  const lastPayloadRef = useRef<string>('');

  useEffect(() => {
    if (!userId) return;
    if (screen !== 'game') return;
    if (!character) return;
    if (isStreaming) return;

    const snapshot = buildGameSnapshot({ character, messages, encounter, recentEncounters, diceLog });
    if (!snapshot) return;

    const serialized = JSON.stringify(snapshot);
    if (serialized === lastPayloadRef.current) return;

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(async () => {
      if (!activeSaveId) {
        const { data, error } = await supabase
          .from('game_saves')
          .insert({
            user_id: userId,
            name: `${character.name} · Lv ${character.level}`,
            character_name: character.name,
            class_name: character.className,
            level: character.level,
            snapshot: snapshot as any,
          })
          .select('id')
          .single();

        if (error) {
          console.warn('[autosave] failed creating save:', error.message);
          return;
        }

        setActiveSaveId(data.id);
        lastPayloadRef.current = serialized;
        console.log('[autosave] save slot created');
        return;
      }

      const { error } = await supabase
        .from('game_saves')
        .update({
          name: `${character.name} · Lv ${character.level}`,
          character_name: character.name,
          class_name: character.className,
          level: character.level,
          snapshot: snapshot as any,
          last_played_at: new Date().toISOString(),
        })
        .eq('id', activeSaveId)
        .eq('user_id', userId);

      if (!error) {
        lastPayloadRef.current = serialized;
        console.log('[autosave] snapshot saved');
      } else {
        console.warn('[autosave] failed:', error.message);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [userId, screen, character, messages, encounter, recentEncounters, diceLog, isStreaming, activeSaveId, setActiveSaveId]);
}
