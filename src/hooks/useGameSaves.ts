import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { GameSnapshot } from '@/game/GameContext';

export interface GameSave {
  id: string;
  name: string;
  character_name: string;
  class_name: string | null;
  level: number;
  snapshot: GameSnapshot;
  updated_at: string;
  last_played_at: string;
}

export function useGameSaves(userId: string | null) {
  const [saves, setSaves] = useState<GameSave[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshSaves = useCallback(async () => {
    if (!userId) {
      setSaves([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('game_saves')
      .select('id, name, character_name, class_name, level, snapshot, updated_at, last_played_at')
      .eq('user_id', userId)
      .order('last_played_at', { ascending: false });

    if (error) {
      console.warn('[saves] failed to fetch:', error.message);
      setSaves([]);
    } else {
      setSaves((data ?? []) as unknown as GameSave[]);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refreshSaves();
  }, [refreshSaves]);

  return { saves, loading, refreshSaves };
}
