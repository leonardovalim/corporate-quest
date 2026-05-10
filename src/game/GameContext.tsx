import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Character, GameMessage, EncounterState, DiceRoll } from './types';

// 'adventure' = post-encounter hub to pick the next encounter (used on resume to avoid showing stale narrative/result)
type GameScreen = 'home' | 'onboarding' | 'game' | 'result' | 'adventure';

export interface GameSnapshot {
  character: Character;
  messages?: GameMessage[];
  encounter?: EncounterState | null;
  recentEncounters?: string[];
  diceLog?: DiceRoll[];
  savedAt?: string;
}

interface GameContextType {
  activeSaveId: string | null;
  setActiveSaveId: (id: string | null) => void;
  screen: GameScreen;
  setScreen: (s: GameScreen) => void;
  character: Character | null;
  setCharacter: (c: Character | null) => void;
  updateCharacter: (updater: (c: Character) => Character) => void;
  messages: GameMessage[];
  addMessage: (msg: GameMessage) => void;
  updateLastAssistant: (content: string) => void;
  clearMessages: () => void;
  diceLog: DiceRoll[];
  addDiceRoll: (d: DiceRoll) => void;
  clearDiceLog: () => void;
  encounter: EncounterState | null;
  setEncounter: (e: EncounterState | null) => void;
  recentEncounters: string[];
  pushRecentEncounter: (name: string) => void;
  isStreaming: boolean;
  setIsStreaming: (b: boolean) => void;
  hydrateFromSnapshot: (snap: GameSnapshot) => void;
}

const GameContext = createContext<GameContextType>(null!);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreenState] = useState<GameScreen>('home');
  const [activeSaveId, setActiveSaveId] = useState<string | null>(null);

  const setScreen = useCallback((s: GameScreen) => {
    setScreenState(s);
  }, []);
  const [character, setCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<GameMessage[]>([]);
  const [diceLog, setDiceLog] = useState<DiceRoll[]>([]);
  const [encounter, setEncounter] = useState<EncounterState | null>(null);
  const [recentEncounters, setRecentEncounters] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const pushRecentEncounter = useCallback((name: string) => {
    setRecentEncounters(prev => {
      if (prev[0] === name) return prev;
      return [name, ...prev.filter(n => n !== name)].slice(0, 3);
    });
  }, []);

  const updateCharacter = useCallback((updater: (c: Character) => Character) => {
    setCharacter(prev => prev ? updater(prev) : prev);
  }, []);

  const addMessage = useCallback((msg: GameMessage) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const updateLastAssistant = useCallback((content: string) => {
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last?.role === 'dm') {
        return prev.map((m, i) => i === prev.length - 1 ? { ...m, content } : m);
      }
      return [...prev, { id: crypto.randomUUID(), role: 'dm', content, timestamp: Date.now() }];
    });
  }, []);

  const addDiceRoll = useCallback((d: DiceRoll) => {
    setDiceLog(prev => [d, ...prev]);
  }, []);

  const clearDiceLog = useCallback(() => {
    setDiceLog([]);
  }, []);

  const hydrateFromSnapshot = useCallback((snap: GameSnapshot) => {
    if (!snap?.character) return;
    setCharacter(snap.character);
    setMessages(snap.messages ?? []);
    setEncounter(snap.encounter ?? null);
    setRecentEncounters(snap.recentEncounters ?? []);
    setDiceLog(snap.diceLog ?? []);
    setIsStreaming(false);
  }, []);

  return (
    <GameContext.Provider value={{
      screen, setScreen, activeSaveId, setActiveSaveId, character, setCharacter, updateCharacter,
      messages, addMessage, updateLastAssistant, clearMessages,
      diceLog, addDiceRoll, clearDiceLog,
      encounter, setEncounter,
      recentEncounters, pushRecentEncounter,
      isStreaming, setIsStreaming,
      hydrateFromSnapshot,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
