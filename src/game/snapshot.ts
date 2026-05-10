import type { Character, DiceRoll, EncounterState, GameMessage } from './types';
import type { GameSnapshot } from './GameContext';

const MAX_MESSAGES = 100;
const MAX_DICE = 20;

interface BuildArgs {
  character: Character | null;
  messages: GameMessage[];
  encounter: EncounterState | null;
  recentEncounters: string[];
  diceLog: DiceRoll[];
}

export function buildGameSnapshot({ character, messages, encounter, recentEncounters, diceLog }: BuildArgs): GameSnapshot | null {
  if (!character) return null;

  return {
    character,
    messages: messages.slice(-MAX_MESSAGES),
    encounter,
    recentEncounters,
    diceLog: diceLog.slice(0, MAX_DICE),
    savedAt: new Date().toISOString(),
  };
}
