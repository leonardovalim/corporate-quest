import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import DOMPurify from 'dompurify';
import { useGame } from '@/game/GameContext';
import { streamChat } from '@/game/streamChat';
import { buildSystemPrompt } from '@/game/systemPrompt';
import { resolveCheck, createDiceLog, getEnergyCost, getEnergyStatus } from '@/game/checks';
import { pickEncounterForLevel, ENCOUNTERS, createEncounterFromTemplate, pickEncounterTemplate } from '@/game/encounter';
import { loadAIConfig } from '@/game/aiConfig';
import { useAdminConfig } from '@/hooks/useAdminConfig';
import { useGameLogger } from '@/hooks/useGameLogger';
import { getModifier } from '@/game/dice';
import type { AttributeName, GameMessage, Character } from '@/game/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import ActionPreviewModal from './ActionPreviewModal';

// Accepts both [CHECK:TEC dc=12] and [CHECK: atributo=TEC dc=12] for LLM compatibility
const CHECK_REGEX = /\[CHECK:\s*(?:atributo=)?(\w+)\s+dc=(\d+)\]/i;
const OPTION_CHECK_REGEX = /\[CHECK:\s*(?:atributo=)?(\w+)\s+dc=(\d+)\]/i;
const PHASE_REGEX = /\[PHASE:(\d+)\]/;
const ENCOUNTER_END_REGEX = /\[ENCOUNTER.?END\s*\]/i;
const FIRED_REGEX = /\[FIRED:\s*(.+?)\]/;

const ATTR_LABELS: Record<string, string> = {
  EXE: 'Execução', INF: 'Influência', TEC: 'Técnica',
  RES: 'Resiliência', CRE: 'Criatividade', AWA: 'Percepção',
};

interface ParsedOption {
  text: string;
  hasCheck: boolean;
  attr?: AttributeName;
  dc?: number;
}

function parseOptions(content: string, character: Character | null): ParsedOption[] {
  const options: ParsedOption[] = [];
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed.startsWith('> ')) return;
    const raw = trimmed.slice(2);
    const stripped = raw
      .replace(/^\*{0,2}\d+\.\*{0,2}\s*/, '')   // strip leading numbering
      .replace(/\s*←\s*(COMEBACK|RISCO|RISCO ALTO|COMEBACK FORTE)[^)]*$/i, '')  // strip example labels
      .trim();
    // Skip system control tags the LLM accidentally put inside a "> " line
    if (/\[ENCOUNTER.?END\]|\[FIRED:|\[PHASE:\d/i.test(stripped)) return;
    const checkMatch = stripped.match(OPTION_CHECK_REGEX);
    if (checkMatch) {
      const attr = checkMatch[1] as AttributeName;
      const dc = parseInt(checkMatch[2]);
      const text = stripped.replace(OPTION_CHECK_REGEX, '').trim();
      options.push({ text, hasCheck: true, attr, dc });
    } else if (/^[\s*]*🎲/.test(stripped)) {
      // LLM used 🎲 emoji instead of [CHECK:] format — auto-assign attribute and DC
      const text = stripped.replace(/^[\s*🎲]+/, '').trim();
      options.push({ text, hasCheck: true, attr: guessAttribute(text), dc: estimateDC(text) });
    } else {
      options.push({ text: stripped, hasCheck: false });
    }
  });
  return options;
}

function resolveOutcome(log: { success?: boolean }[]): 'victory' | 'defeat' {
  const rolls = log.filter(d => typeof d.success === 'boolean');
  if (rolls.length === 0) return 'victory';
  const rate = rolls.filter(d => d.success).length / rolls.length;
  return rate >= 0.4 ? 'victory' : 'defeat';
}

function guessAttribute(text: string): AttributeName {
  const lower = text.toLowerCase();
  if (/convenc|persua|negoci|fal|explic|argu|polít/i.test(lower)) return 'INF';
  if (/códig|debug|técnic|hack|program|deploy|sistema/i.test(lower)) return 'TEC';
  if (/resist|aguen|calm|paci|esper|ignor/i.test(lower)) return 'RES';
  if (/criat|idei|invent|improv|design|visual/i.test(lower)) return 'CRE';
  if (/observ|perce|not|ler a sala|aten/i.test(lower)) return 'AWA';
  if (/faz|execut|entreg|termin|resolv|corrig/i.test(lower)) return 'EXE';
  return 'INF';
}

function estimateDC(text: string): number {
  const lower = text.toLowerCase();
  if (/fácil|simples|básic/i.test(lower)) return 8;
  if (/difícil|complicad|arriscad|perigolos/i.test(lower)) return 15;
  return 12;
}

/** Pure function to resolve a check — no hooks, no stale closures */
function performCheck(char: Character, attr: AttributeName, dc: number) {
  const result = resolveCheck(char, attr, dc);
  const log = createDiceLog(result, attr);
  const cost = getEnergyCost(result.critical);

  const newEnergy = Math.max(0, char.resources.energy - cost);
  const percent = (newEnergy / char.resources.maxEnergy) * 100;
  const exhausted = percent <= 30 && newEnergy > 0;
  const burnout = newEnergy <= 0;

  const critText = result.critical === 'success' ? ' 🎉 CRITICAL!' : result.critical === 'failure' ? ' 💀 FUMBLE!' : '';
  const energyText = cost > 0 ? ` (-${cost}⚡)` : ' (0⚡ flow!)';
  const statusText = burnout ? ' 💀 Burnout!' : exhausted ? ' ⚠️ Exausto!' : '';

  const sysContent = `⬡ ${attr} (DC${dc}): ${result.rolls?.join(',')} → ${result.total} ${result.success ? '✅' : '❌'}${critText}${energyText}${statusText}`;
  const resultText = `Check: d20=${result.roll} +${result.modifier} = ${result.total} vs DC ${dc} → ${result.success ? 'SUCESSO' : 'FALHA'}${critText}`;

  return { result, log, cost, sysContent, resultText, burnout, exhausted };
}

export default function NarrativeChat() {
  const { config: adminConfig, loaded: adminConfigLoaded } = useAdminConfig();
  const { logEvent } = useGameLogger();
  const { character, messages, addMessage, updateLastAssistant, addDiceRoll, encounter, setEncounter, isStreaming, setIsStreaming, updateCharacter, recentEncounters, pushRecentEncounter, diceLog, clearDiceLog } = useGame();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const hasInit = useRef(false);
  const streamingContent = useRef('');
  const messagesRef = useRef<GameMessage[]>([]);
  const characterRef = useRef<Character | null>(null);
  const encounterRef = useRef(encounter);
  const diceLogRef = useRef(diceLog);
  const checkRetryRef = useRef(false);
  const optionRetryRef = useRef(false);
  const freeActionRef = useRef(false);
  const phaseTurnsRef = useRef(0);
  const totalTurnsRef = useRef(0);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState('');
  const [previewAttr, setPreviewAttr] = useState<AttributeName>('INF');
  const [previewDC, setPreviewDC] = useState(12);
  const [focusedOption, setFocusedOption] = useState<number>(-1);

  const energyStatus = character ? getEnergyStatus(character) : null;

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    requestAnimationFrame(() => {
      const root = scrollRef.current;
      if (!root) return;
      // Radix ScrollArea wraps content in a viewport div
      const viewport = root.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
      const target = viewport ?? root;
      target.scrollTo({ top: target.scrollHeight, behavior });
    });
  };

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { characterRef.current = character; }, [character]);
  useEffect(() => { encounterRef.current = encounter; }, [encounter]);
  useEffect(() => { diceLogRef.current = diceLog; }, [diceLog]);

  // Dice-roll safety net: fires after streaming ends and roll count hits the limit.
  // diceLog is cleared at encounter start so length = rolls in THIS encounter only.
  // Budget: 2 rolls/phase + 1/level, capped at 15. Level 1, 5 phases = 11 rolls.
  useEffect(() => {
    if (!encounter || encounter.completed || isStreaming) return;
    const lvl = character?.level ?? 1;
    const totalPhases = encounter.totalPhases ?? 5;
    const maxRolls = Math.min(15, totalPhases * 2 + lvl);
    if (diceLog.length >= maxRolls) {
      console.error('[safety-net] dice limit reached', { rolls: diceLog.length, maxRolls, lvl, totalPhases });
      setEncounter({ ...encounter, phase: encounter.totalPhases, completed: true, outcome: resolveOutcome(diceLog) });
    }
  }, [diceLog.length, encounter, isStreaming, character, setEncounter]);

  // Auto-scroll suave sempre que mensagens mudam ou streaming atualiza
  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isStreaming]);

  const deductEnergy = useCallback((cost: number) => {
    updateCharacter(c => ({
      ...c,
      resources: { ...c.resources, energy: Math.max(0, c.resources.energy - cost) },
    }));
  }, [updateCharacter]);

  const handleCoffeeBreak = useCallback(() => {
    if (!character || character.resources.politicalCapital < 1) {
      toast({ title: '☕ Sem capital', description: 'Sem Political Capital pra comprar café!', variant: 'destructive' });
      return;
    }
    updateCharacter(c => ({
      ...c,
      resources: {
        ...c.resources,
        energy: Math.min(c.resources.maxEnergy, c.resources.energy + 3),
        politicalCapital: c.resources.politicalCapital - 1,
      },
    }));
    const sysMsg: GameMessage = { id: crypto.randomUUID(), role: 'system', content: '☕ Coffee Break! +3 Energy, -1 Political Capital', timestamp: Date.now() };
    addMessage(sysMsg);
    toast({ title: '☕ Coffee Break!', description: '+3 Energy recuperado' });
  }, [character, updateCharacter, addMessage, toast]);

  // ─── Core AI send function ───
  const sendToAIRef = useRef<(allMessages: { role: string; content: string }[], isCheckFollowUp?: boolean) => Promise<void>>();

  const sendToAI = useCallback(async (allMessages: { role: string; content: string }[], isCheckFollowUp: boolean = false) => {
    const char = characterRef.current;
    if (!char) return;
    // Bail out if encounter was completed (e.g. by dice safety net) between scheduling and execution
    if (encounterRef.current?.completed) return;
    setIsStreaming(true);
    streamingContent.current = '';

    if (!isCheckFollowUp) {
      checkRetryRef.current = false;
      optionRetryRef.current = false;
    }

    const startTime = Date.now();
    const usedConfig = adminConfig ?? loadAIConfig();

    try {
      const sysPrompt = buildSystemPrompt(char, encounterRef.current, window.innerWidth < 768);
      const apiMessages = [
        { role: 'system', content: sysPrompt },
        ...allMessages.map(m => ({ role: m.role === 'dm' ? 'assistant' : 'user', content: m.content })),
      ];

      if (!isCheckFollowUp) {
        phaseTurnsRef.current += 1;
        totalTurnsRef.current += 1;
      }
      const nudgeEnc = encounterRef.current;
      const isAtFinalPhase = nudgeEnc ? nudgeEnc.phase >= nudgeEnc.totalPhases : false;
      // phaseStraining (UI indicator ⚠) only activates at the final phase
      if (isAtFinalPhase && nudgeEnc && !isCheckFollowUp && !nudgeEnc.phaseStraining) {
        console.log(`[phase] phaseStraining=true (final phase) | phase=${nudgeEnc.phase}/${nudgeEnc.totalPhases} phaseTurns=${phaseTurnsRef.current}`);
        setEncounter({ ...nudgeEnc, phaseStraining: true });
      }
      // Nudge: fires after 2 turns in any phase
      if (phaseTurnsRef.current >= 2 && nudgeEnc && !isCheckFollowUp) {
        const isLastPhase = nudgeEnc.phase >= nudgeEnc.totalPhases;
        console.log(`[phase] nudge fired | phase=${nudgeEnc.phase}/${nudgeEnc.totalPhases} phaseTurns=${phaseTurnsRef.current} isLastPhase=${isLastPhase}`);
        apiMessages.push({
          role: 'user',
          content: isLastPhase
            ? `[LEMBRETE URGENTE: fase final ${nudgeEnc.phase}/${nudgeEnc.totalPhases} há vários turnos. Conclua a narrativa e emita [ENCOUNTER_END] OBRIGATORIAMENTE nesta resposta.]`
            : `[LEMBRETE: fase ${nudgeEnc.phase}/${nudgeEnc.totalPhases} há vários turnos. Emita [PHASE:${nudgeEnc.phase + 1}] nesta resposta se a narrativa evoluiu.]`,
        });
      }
      console.log(`[phase] sendToAI | phase=${nudgeEnc?.phase}/${nudgeEnc?.totalPhases} phaseTurns=${phaseTurnsRef.current} totalTurns=${totalTurnsRef.current} isCheckFollowUp=${isCheckFollowUp}`);

      await streamChat({
        messages: apiMessages,
        aiConfig: usedConfig,
        onDelta: (chunk) => {
          streamingContent.current += chunk;
          updateLastAssistant(streamingContent.current);
          scrollToBottom();
        },
        onDone: () => {
          setIsStreaming(false);
          const content = streamingContent.current;
          const enc = encounterRef.current;

          // Log LLM response for debugging
          const parsedOpts = parseOptions(content, characterRef.current);
          logEvent('llm_response', {
            has_check_in_body: CHECK_REGEX.test(content),
            options_count: parsedOpts.length,
            checks_count: parsedOpts.filter(o => o.hasCheck).length,
            latency_ms: Date.now() - startTime,
            total_turns: totalTurnsRef.current,
            phase: encounterRef.current?.phase,
            total_phases: encounterRef.current?.totalPhases,
            option_retry: optionRetryRef.current,
            check_retry: checkRetryRef.current,
            is_follow_up: isCheckFollowUp,
            content_preview: content.slice(0, 500),
          }, { provider: usedConfig.provider, model: usedConfig.model });

          // FIRED detection
          const firedMatch = content.match(FIRED_REGEX);
          if (firedMatch && enc) {
            console.log(`[encounter] FIRED | reason=${firedMatch[1]}`);
            setEncounter({ ...enc, completed: true, outcome: 'fired', fireReason: firedMatch[1] });
            return;
          }

          // Phase progression
          let didAdvancePhase = false;
          const phaseMatch = content.match(PHASE_REGEX);
          if (phaseMatch && enc) {
            const newPhase = parseInt(phaseMatch[1]);
            if (newPhase > enc.phase && newPhase <= enc.totalPhases) {
              console.log(`[phase] advance | ${enc.phase} → ${newPhase}/${enc.totalPhases} | phaseTurns was ${phaseTurnsRef.current}`);
              didAdvancePhase = true;
              setEncounter({ ...enc, phase: newPhase, phaseStraining: newPhase >= enc.totalPhases });
              phaseTurnsRef.current = 0;
            } else {
              console.warn(`[phase] ignored PHASE tag | newPhase=${newPhase} enc.phase=${enc.phase} totalPhases=${enc.totalPhases}`);
            }
          }

          // Encounter end
          if (ENCOUNTER_END_REGEX.test(content) && enc) {
            console.log(`[encounter] ENCOUNTER_END | phase=${enc.phase}/${enc.totalPhases} totalTurns=${totalTurnsRef.current}`);
            setEncounter({ ...enc, completed: true, outcome: resolveOutcome(diceLogRef.current) });
            return;
          }

          // Final phase force-end: if nudge already fired (phaseTurns >= 2) and LLM didn't emit ENCOUNTER_END → force it
          if (!isCheckFollowUp && !didAdvancePhase && enc && enc.phase >= enc.totalPhases && phaseTurnsRef.current >= 2) {
            console.warn(`[safety-net] final phase force end | phaseTurns=${phaseTurnsRef.current} totalTurns=${totalTurnsRef.current}`);
            setEncounter({ ...enc, completed: true, outcome: resolveOutcome(diceLogRef.current) });
            return;
          }

          // Safety net: hard cap on total turns — skip if phase just advanced (stale enc would conflict)
          const lvl = characterRef.current?.level ?? 1;
          const totalPhases = enc?.totalPhases ?? 5;
          const maxTurns = Math.min(20, totalPhases * 3 + lvl);
          if (!didAdvancePhase && enc && !enc.completed && totalTurnsRef.current >= maxTurns) {
            console.warn(`[safety-net] turn cap | totalTurns=${totalTurnsRef.current} maxTurns=${maxTurns} → force end`);
            setEncounter({ ...enc, phase: enc.totalPhases, completed: true, outcome: resolveOutcome(diceLogRef.current) });
            return;
          }

          // CHECK in body (not inside a "> " option) — never auto-roll, always retry/strip
          const checkMatch = content.match(CHECK_REGEX);

          if (checkMatch) {
            freeActionRef.current = false;
            if (!checkRetryRef.current) {
              checkRetryRef.current = true;
              const cleanContent = content.replace(CHECK_REGEX, '🎲').trim();
              updateLastAssistant(cleanContent);

              // New empty DM slot so the retry streams into a fresh message
              // instead of overwriting the first narration
              addMessage({ id: crypto.randomUUID(), role: 'dm', content: '', timestamp: Date.now() });

              logEvent('llm_retry', {
                trigger: 'check_in_body',
                clean_preview: cleanContent.slice(0, 300),
              }, { provider: usedConfig.provider, model: usedConfig.model });

              const currentMsgs = messagesRef.current;
              const retryMsgs = [
                ...currentMsgs,
                { role: 'dm' as const, content: cleanContent },
                { role: 'player' as const, content: 'Apresente EXATAMENTE 4 opções usando "> ". OBRIGATÓRIO: 2-3 opções com [CHECK:ATTR dc=N] (ex: > [CHECK:EXE dc=10] texto). 1-2 podem ser diálogo puro sem check. Não narre nada antes das opções.' },
              ].map(m => ({ role: m.role, content: m.content }));

              setTimeout(() => {
                sendToAIRef.current?.(retryMsgs, true);
              }, 500);
              return;
            } else {
              const cleanContent = content.replace(CHECK_REGEX, '🎲').trim();
              updateLastAssistant(cleanContent);
            }
          }

          // All options are dialogue (no [CHECK:] tags) — retry once to enforce format
          if (parsedOpts.length > 0
              && parsedOpts.every(o => !o.hasCheck)
              && !optionRetryRef.current
              && !checkRetryRef.current) {
            optionRetryRef.current = true;

            logEvent('llm_retry', {
              trigger: 'no_checks_in_options',
              clean_preview: content.slice(0, 300),
            }, { provider: usedConfig.provider, model: usedConfig.model });

            const currentMsgs = messagesRef.current;
            const retryMsgs = [
              ...currentMsgs,
              { role: 'dm' as const, content },
              { role: 'player' as const, content: 'CORREÇÃO: suas opções não têm [CHECK:ATTR dc=N]. Apresente EXATAMENTE 4 opções "> ". OBRIGATÓRIO: 2-3 com [CHECK:ATTR dc=N] (ex: > [CHECK:INF dc=10] Descrição). 1-2 podem ser diálogo puro. Use exatamente esse formato, nunca 🎲.' },
            ].map(m => ({ role: m.role, content: m.content }));

            addMessage({ id: crypto.randomUUID(), role: 'dm', content: '', timestamp: Date.now() });
            setTimeout(() => {
              sendToAIRef.current?.(retryMsgs, true);
            }, 300);
            return;
          }

          // No options at all — LLM may have wrapped up without [ENCOUNTER_END]
          if (parsedOpts.length === 0 && !optionRetryRef.current && !checkRetryRef.current && !isCheckFollowUp) {
            const lvl2 = characterRef.current?.level ?? 1;
            const maxTurns2 = Math.min(12, 4 + lvl2);
            // At final phase OR past 60% of turn limit → force end
            if (enc && (enc.phase >= enc.totalPhases || totalTurnsRef.current >= Math.ceil(maxTurns2 * 0.6))) {
              console.warn(`[safety-net] no-options force end | phase=${enc.phase}/${enc.totalPhases} totalTurns=${totalTurnsRef.current}`);
              setEncounter({ ...enc, phase: enc.totalPhases, completed: true, outcome: resolveOutcome(diceLogRef.current) });
              return;
            }
            // Otherwise retry: ask for options or [ENCOUNTER_END]
            optionRetryRef.current = true;
            logEvent('llm_retry', { trigger: 'no_options', clean_preview: content.slice(0, 300) }, { provider: usedConfig.provider, model: usedConfig.model });
            const retryMsgs2 = [
              ...messagesRef.current,
              { role: 'dm' as const, content },
              { role: 'player' as const, content: 'Se o encontro terminou, emita [ENCOUNTER_END] agora. Caso contrário, apresente EXATAMENTE 4 opções "> " com 2-3 usando [CHECK:ATTR dc=N].' },
            ].map(m => ({ role: m.role, content: m.content }));
            addMessage({ id: crypto.randomUUID(), role: 'dm', content: '', timestamp: Date.now() });
            setTimeout(() => { sendToAIRef.current?.(retryMsgs2, true); }, 300);
            return;
          }

          // Catch-all: retry (isCheckFollowUp) OR post-retry response also returned no options → force-end
          if (parsedOpts.length === 0 && (isCheckFollowUp || optionRetryRef.current || checkRetryRef.current) && enc && !enc.completed) {
            console.warn(`[safety-net] catch-all force end | phase=${enc.phase}/${enc.totalPhases} totalTurns=${totalTurnsRef.current}`);
            setEncounter({ ...enc, phase: enc.totalPhases, completed: true, outcome: resolveOutcome(diceLogRef.current) });
            return;
          }
        },
      });
    } catch (e: any) {
      setIsStreaming(false);
      logEvent('llm_error', {
        error: e.message,
        latency_ms: Date.now() - startTime,
      }, { provider: usedConfig.provider, model: usedConfig.model });
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  }, [updateLastAssistant, setIsStreaming, toast, setEncounter, addDiceRoll, addMessage, deductEnergy, adminConfig, logEvent]);

  useEffect(() => { sendToAIRef.current = sendToAI; }, [sendToAI]);

  // ─── Init first encounter ───
  useEffect(() => {
    if (!adminConfigLoaded || hasInit.current || !character) return;
    hasInit.current = true;
    totalTurnsRef.current = 0;
    phaseTurnsRef.current = 0;
    clearDiceLog();

    let activeEncounter = encounter;
    if (!activeEncounter) {
      activeEncounter = pickEncounterForLevel(character.level, recentEncounters);
      setEncounter(activeEncounter);
    }
    pushRecentEncounter(activeEncounter.name);

    const template =
      ENCOUNTERS.find(e => e.name === activeEncounter!.name) ||
      pickEncounterTemplate(character.level, recentEncounters);
    sendToAI([{ role: 'user', content: template.openingPrompt }]);
  }, [character, sendToAI, setEncounter, encounter, recentEncounters, pushRecentEncounter, adminConfigLoaded, clearDiceLog]);

  // ─── Handle clicking a structured option WITH a check ───
  const handleCheckOption = (opt: ParsedOption) => {
    if (isStreaming || encounterRef.current?.completed || !opt.hasCheck || !opt.attr || !opt.dc) return;
    const freshChar = characterRef.current;
    if (!freshChar) return;

    // Add player message
    const playerMsg: GameMessage = { id: crypto.randomUUID(), role: 'player', content: opt.text, timestamp: Date.now() };
    addMessage(playerMsg);

    // Roll dice immediately
    const check = performCheck(freshChar, opt.attr, opt.dc);
    addDiceRoll(check.log);
    deductEnergy(check.cost);

    if (check.burnout) {
      toast({ title: '💀 Burnout!', description: 'Você colapsou! Game Over!', variant: 'destructive' });
      const enc = encounterRef.current;
      if (enc) {
        setEncounter({ ...enc, completed: true, outcome: 'defeat' });
      }
      const sysMsg2: GameMessage = {
        id: crypto.randomUUID(), role: 'system', content: check.sysContent, timestamp: Date.now(), diceRoll: check.log,
      };
      addMessage(sysMsg2);
      return;
    } else if (check.exhausted) {
      toast({ title: '⚠️ Exausto!', description: 'Energia baixa! Disadvantage em checks!' });
    }

    const sysMsg: GameMessage = {
      id: crypto.randomUUID(), role: 'system', content: check.sysContent, timestamp: Date.now(), diceRoll: check.log,
    };
    addMessage(sysMsg);

    // Send action + result to AI
    const followUp = `${check.resultText}\n\nNarre a consequência (2-3 frases) e apresente EXATAMENTE 4 opções "> ". OBRIGATÓRIO: 2-3 com [CHECK:ATTR dc=N] — NÃO use 🎲 emoji, use o formato exato. 1-2 podem ser diálogo puro.`;
    const allMsgs = [
      ...messagesRef.current, playerMsg,
      { role: 'player' as const, content: followUp },
    ].map(m => ({ role: m.role, content: m.content }));

    sendToAI(allMsgs);
  };

  // ─── Handle clicking a dialogue option (no check) ───
  // Dialogue choices cost 1⚡ (mental effort) — no roll, no critical
  const handleDialogueOption = (opt: ParsedOption) => {
    if (isStreaming || encounterRef.current?.completed) return;
    const freshChar = characterRef.current;
    if (!freshChar) return;

    const msg: GameMessage = { id: crypto.randomUUID(), role: 'player', content: opt.text, timestamp: Date.now() };
    addMessage(msg);

    // Cost 1 energy for any dialogue/non-check choice
    deductEnergy(1);
    const newEnergy = Math.max(0, freshChar.resources.energy - 1);
    if (newEnergy <= 0) {
      toast({ title: '💀 Burnout!', description: 'Você colapsou! Game Over!', variant: 'destructive' });
      const enc = encounterRef.current;
      if (enc) setEncounter({ ...enc, completed: true, outcome: 'defeat' });
      return;
    }
    const sysMsg: GameMessage = {
      id: crypto.randomUUID(), role: 'system',
      content: `💬 Escolha de diálogo (-1⚡)`, timestamp: Date.now(),
    };
    addMessage(sysMsg);

    const allMsgs = [...messagesRef.current, msg, sysMsg].map(m => ({ role: m.role, content: m.content }));
    sendToAI(allMsgs);
  };

  // ─── Free-text input ───
  const handleSend = () => {
    if (!input.trim() || isStreaming || encounterRef.current?.completed) return;
    const text = input.trim();
    setPendingAction(text);
    setPreviewAttr(guessAttribute(text));
    setPreviewDC(estimateDC(text));
    setPreviewOpen(true);
  };

  const handleConfirmAction = () => {
    setPreviewOpen(false);
    const msg: GameMessage = { id: crypto.randomUUID(), role: 'player', content: pendingAction, timestamp: Date.now() };
    addMessage(msg);
    const allMsgs = [...messagesRef.current, msg].map(m => ({ role: m.role, content: m.content }));
    setInput('');
    // Mark this as a free creative action: energy cost only applies on failure
    freeActionRef.current = true;
    sendToAI(allMsgs);
  };

  // ─── Extract structured options from last DM message ───
  const lastDm = [...messages].reverse().find(m => m.role === 'dm');
  const parsedOptions = lastDm && !isStreaming && !encounter?.completed ? parseOptions(lastDm.content, character) : [];

  // Reset focus when options list changes
  useEffect(() => {
    setFocusedOption(parsedOptions.length > 0 ? 0 : -1);
  }, [parsedOptions.length, lastDm?.id]);

  // ─── Keyboard navigation: ↑/↓ to navigate, Enter to confirm ───
  useEffect(() => {
    if (parsedOptions.length === 0 || isStreaming) return;

    const handleKey = (e: KeyboardEvent) => {
      // Ignore when typing in the free-text input or any input/textarea
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) return;
      if (previewOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedOption(prev => (prev + 1) % parsedOptions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedOption(prev => (prev <= 0 ? parsedOptions.length - 1 : prev - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const idx = focusedOption >= 0 ? focusedOption : 0;
        const opt = parsedOptions[idx];
        if (!opt) return;
        if (opt.hasCheck) handleCheckOption(opt);
        else handleDialogueOption(opt);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [parsedOptions, focusedOption, isStreaming, previewOpen]);

  // Converts DM markdown to HTML for .msg-dm rendering
  const renderDMContent = (content: string): string => {
    let html = '';
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('> ')) continue; // option lines — shown in options panel
      const clean = trimmed
        .replace(/\[CHECK:[^\]]+\]/g, '⬡')
        .replace(/\[PHASE:\d+\]/g, '')
        .replace(/\[ENCOUNTER_END\]/g, '')
        .replace(/\[FIRED:[^\]]+\]/g, '');
      if (!clean) continue;
      if (/^#{1,2}\s/.test(clean)) {
        const text = clean.replace(/^#{1,2}\s/, '')
          .replace(/\*\*(.+?)\*\*/g, '$1')
          .replace(/\*(.+?)\*/g, '$1');
        html += `<h2>${text}</h2>`;
      } else {
        const inlined = clean
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>');
        html += `<p>${inlined}</p>`;
      }
    }
    return html;
  };

  const renderInlineBold = (content: string): ReactNode => {
    const nodes: ReactNode[] = [];
    const re = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;
    while ((match = re.exec(content))) {
      if (match.index > lastIndex) nodes.push(content.slice(lastIndex, match.index));
      nodes.push(<strong key={`b-${key++}`}>{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) nodes.push(content.slice(lastIndex));
    return <>{nodes}</>;
  };

  const renderSysContent = (content: string): string =>
    content
      .replace(/✅/g, '<span class="ok">✓</span>')
      .replace(/❌/g, '<span class="fail">✗</span>')
      .replace(/🎲/g, '⬡')
      .replace(/💀/g, '☠')
      .replace(/⚡/g, '<span style="color:var(--warn)">⚡</span>');

  const OPTION_KEYS = ['a', 'b', 'c', 'd', 'e'];
  // Hide coffee break only when at the final phase (phaseStraining=true) or already completed
  const isEncounterEndingSoon = encounter
    ? encounter.completed || Boolean(encounter.phaseStraining)
    : false;
  const showCoffeeBreak = character
    && energyStatus
    && energyStatus.percent <= 50
    && character.resources.politicalCapital > 0
    && !isEncounterEndingSoon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      <ScrollArea className="flex-1" ref={scrollRef}>
        <div style={{ padding: '20px 20px 8px', maxWidth: '72ch', margin: '0 auto' }}>
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`msg ${msg.role === 'dm' ? 'msg-dm' : msg.role === 'system' ? 'msg-sys' : 'msg-player'}`}
              style={{ animation: 'fadeIn 0.2s ease' }}
            >
              {msg.role === 'dm' && (
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderDMContent(msg.content), { ALLOWED_TAGS: ['h2', 'p', 'strong', 'em'] }) }} />
              )}
              {msg.role === 'player' && (
                <span>{renderInlineBold(msg.content)}</span>
              )}
              {msg.role === 'system' && (
                <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderSysContent(msg.content), { ALLOWED_TAGS: ['span'], ALLOWED_ATTR: ['class', 'style'] }) }} />
              )}
            </div>
          ))}
          {isStreaming && (
            <div className="msg-sys" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="cur" />
              <span>O DM está narrando</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* ── Options ── */}
      {parsedOptions.length > 0 && (
        <div className="opts" style={{ padding: '0 16px 12px', maxHeight: '42vh', overflowY: 'auto' }}>
          <p className="opts-label">— escolha uma ação —</p>
          {parsedOptions.map((opt, i) => {
            const mod = opt.hasCheck && opt.attr && character
              ? getModifier(character.attributes[opt.attr])
              : 0;
            const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
            const isFav = opt.hasCheck && opt.dc !== undefined && (mod + 10 >= opt.dc);

            return (
              <button
                key={i}
                className={`opt ${focusedOption === i ? 'focus' : ''}`}
                style={{ width: '100%', textAlign: 'left' }}
                onClick={() => opt.hasCheck ? handleCheckOption(opt) : handleDialogueOption(opt)}
                disabled={isStreaming}
              >
                <span className={opt.hasCheck ? `opt-dice-icon ${isFav ? 'opt-dice-fav' : 'opt-dice-risk'}` : 'opt-dialogue-icon'}>
                  {opt.hasCheck ? '⬡' : '○'}
                </span>
                <span className="opt-key">[{OPTION_KEYS[i] ?? i + 1}]</span>
                {opt.hasCheck && opt.attr && <span className="opt-attr">{opt.attr}</span>}
                <span className="opt-text">{renderInlineBold(opt.text)}</span>
                {opt.hasCheck && opt.attr && opt.dc && (
                  <span className="opt-meta">
                    {modStr} · DC {opt.dc}
                    <span className={`tag ${isFav ? 'fav' : 'risk'}`}>
                      {isFav ? 'fav' : 'risco'}
                    </span>
                  </span>
                )}
                {!opt.hasCheck && (
                  <span className="opt-meta">diálogo</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Coffee break ── */}
      {showCoffeeBreak && !isStreaming && (
        <div style={{ padding: '0 16px 8px', borderTop: '1px solid var(--rule)' }}>
          <button
            className="btn"
            style={{ width: '100%', fontSize: 'var(--fs-label)', padding: '8px' }}
            onClick={handleCoffeeBreak}
          >
            ☕ PAUSA PRO CAFÉ · −1 CP · +3<span style={{ color: 'var(--warn)' }}>⚡</span>
          </button>
        </div>
      )}

      {/* ── Input line — hidden when encounter is over ── */}
      {!encounter?.completed && <form
        onSubmit={e => { e.preventDefault(); handleSend(); }}
        style={{ padding: '0 16px 16px' }}
      >
        <div className="input-line">
          <span className="prompt">$</span>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="ação criativa livre..."
            disabled={isStreaming}
          />
          {!isStreaming && input.trim() && (
            <button
              type="submit"
              style={{ background: 'transparent', border: 'none', color: 'var(--fg)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', letterSpacing: '0.1em' }}
            >
              ▶
            </button>
          )}
          {(isStreaming || !input.trim()) && <span className="cur" />}
        </div>
      </form>}

      <ActionPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onConfirm={handleConfirmAction}
        action={pendingAction}
        suggestedAttribute={previewAttr}
        estimatedDC={previewDC}
      />
    </div>
  );
}
