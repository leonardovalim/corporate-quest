import { useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '@/game/GameContext';
import { ENCOUNTERS, createEncounterFromTemplate, pickNextEncounters, type EncounterTemplate } from '@/game/encounter';
import { getLevelFromXP } from '@/game/leveling';
import LevelUpOverlay from './LevelUpOverlay';
import SaveProgressCard from './SaveProgressCard';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function EncounterResultScreen() {
  const { encounter, setEncounter, character, updateCharacter, clearMessages, setIsStreaming, setScreen, diceLog, clearDiceLog, recentEncounters, pushRecentEncounter } = useGame();
  const appliedRef = useRef(false);
  const [levelUp, setLevelUp] = useState<{ from: number; to: number } | null>(null);
  const [showSaveCard, setShowSaveCard] = useState(false);
  const [showExitSaveCard, setShowExitSaveCard] = useState(false);
  const defeatAppliedRef = useRef(false);
  const [firedByAccumulation, setFiredByAccumulation] = useState(false);

  const outcome = encounter?.outcome || 'victory';
  const rewards = encounter?.rewards || { xp: 0, pc: 0, reputation: 0 };

  // Calculate energy bonus from this encounter's dice rolls (only for victory)
  const energyBonus = useMemo(() => {
    if (outcome !== 'victory') return 0;
    const rolls = diceLog.filter(d => typeof d.success === 'boolean');
    const total = rolls.length;
    if (total === 0) return 1;
    const rate = rolls.filter(d => d.success).length / total;
    return rate >= 0.75 ? 3 : rate >= 0.5 ? 2 : 1;
  }, [diceLog, outcome]);

  // Auto-apply rewards once on mount (victory only) — idempotent via ref + rewardsApplied flag
  useEffect(() => {
    if (appliedRef.current) return;
    if (!encounter || !character) return;
    if (outcome !== 'victory') return;
    // Skip if rewards were already applied in a previous session (snapshot restore)
    if (encounter.rewardsApplied) {
      appliedRef.current = true;
      return;
    }
    appliedRef.current = true;

    // Mark rewards as applied in encounter state so autosave captures it
    setEncounter({ ...encounter, rewardsApplied: true });

    // Use functional update to avoid stale-closure overwrites between encounters
    updateCharacter(c => {
      const newXP = c.resources.xp + rewards.xp;
      const oldLevel = getLevelFromXP(c.resources.xp);
      const newLevel = getLevelFromXP(newXP);
      const didLevelUp = newLevel > oldLevel;

      const levelsGained = newLevel - oldLevel;
      const newMaxEnergy = c.resources.maxEnergy + (didLevelUp ? 2 * levelsGained : 0);
      const newEnergy = didLevelUp
        ? newMaxEnergy // full refill on level up
        : Math.min(c.resources.maxEnergy, c.resources.energy + energyBonus);

      if (didLevelUp) {
        setLevelUp({ from: oldLevel, to: newLevel });
      }

      return {
        ...c,
        level: newLevel,
        resources: {
          ...c.resources,
          xp: newXP,
          level: newLevel,
          politicalCapital: c.resources.politicalCapital + rewards.pc,
          reputation: c.resources.reputation + rewards.reputation,
          maxEnergy: newMaxEnergy,
          energy: newEnergy,
        },
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply -1 REP penalty on defeat; trigger REDACTED when REP ≤ -3
  useEffect(() => {
    if (outcome !== 'defeat') return;
    if (!encounter || !character) return;
    if (defeatAppliedRef.current) return;
    defeatAppliedRef.current = true;

    if (!encounter.rewardsApplied) {
      const newRep = character.resources.reputation - 1;
      setEncounter({ ...encounter, rewardsApplied: true });
      updateCharacter(c => ({ ...c, resources: { ...c.resources, reputation: c.resources.reputation - 1 } }));
      if (newRep <= -3) setFiredByAccumulation(true);
    } else {
      if (character.resources.reputation <= -3) setFiredByAccumulation(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show save-progress card after any encounter (victory or defeat), every 3 matches.
  useEffect(() => {
    if (outcome === 'fired') return; // fired screens handle their own CTA
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) return; // already logged in
      const matchCount = Number(localStorage.getItem('cq.saveMatchCount') || 0) + 1;
      localStorage.setItem('cq.saveMatchCount', String(matchCount));
      const lastShown = Number(localStorage.getItem('cq.saveCardLastShownAtMatch') ?? -99);
      if (matchCount - lastShown >= 3) {
        localStorage.setItem('cq.saveCardLastShownAtMatch', String(matchCount));
        setShowSaveCard(true);
      }
    });
    return () => { cancelled = true; };
  }, [outcome]);

  // Pick fresh next-adventure suggestions, excluding the current one + recent history.
  // Memoized so they don't reshuffle on every render. Must run before any early return.
  const nextEncounters = useMemo(
    () => {
      if (!character || !encounter) return [];
      return pickNextEncounters(character.level, 3, [encounter.name, ...recentEncounters]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [encounter?.name, character?.level],
  );

  if (!encounter || !character) return null;

  const handleChooseNext = (template: EncounterTemplate) => {
    clearMessages();
    clearDiceLog();
    const next = createEncounterFromTemplate(template, character.level);
    pushRecentEncounter(next.name);
    setEncounter(next);
    setIsStreaming(false);
  };

  const handleReturnHome = () => {
    clearMessages();
    clearDiceLog();
    setScreen('home');
  };

  const handleReturnHomeIntent = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      handleReturnHome();
      return;
    }
    setShowExitSaveCard(true);
  };

  const DIFF_LABEL: Record<string, string> = { easy: 'FÁCIL', medium: 'MÉDIO', hard: 'DIFÍCIL', absurd: 'ABSURDO' };
  const DIFF_CLASS: Record<string, string> = { easy: 'fav', medium: '', hard: 'risk', absurd: 'risk' };

  const exitSaveDialog = (
    <Dialog open={showExitSaveCard} onOpenChange={setShowExitSaveCard}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-transparent border-0 shadow-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Salvar progresso</DialogTitle>
          <DialogDescription>Cadastre-se para não perder seu personagem</DialogDescription>
        </DialogHeader>
        <SaveProgressCard
          onDismiss={() => setShowExitSaveCard(false)}
          onGoHome={handleReturnHome}
        />
      </DialogContent>
    </Dialog>
  );

  // ─── FIRED BY ACCUMULATION ───
  if (firedByAccumulation) {
    const handleRestart = () => {
      clearMessages();
      clearDiceLog();
      setEncounter(null);
      setScreen('onboarding');
    };
    return (
      <>
        {exitSaveDialog}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '480px', width: '100%', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-pixel)', fontSize: 'var(--fs-h4)', color: 'var(--danger)', marginBottom: '20px', letterSpacing: 0, lineHeight: 'var(--lh-pixel)' }}>
            DEMITIDO POR ACUMULAÇÃO
          </p>
          <p style={{ color: 'var(--fg-dim)', marginBottom: '24px', fontSize: '15px' }}>
            Sua reputação chegou ao limite. A empresa não pode mais ignorar os resultados.
          </p>
          <div style={{ border: '1px solid var(--rule)', padding: '20px', marginBottom: '24px' }}>
            <p className="kicker" style={{ marginBottom: '10px' }}>Reputação</p>
            <p style={{ color: 'var(--danger)', fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>
              {character.resources.reputation}
            </p>
            <p style={{ color: 'var(--fg-dim)', fontStyle: 'italic', fontSize: '13px' }}>
              "O RH agenda uma reunião. Você já sabe o que vem a seguir. Uma carta, uma caixa de papelão, um estacionamento vazio."
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button className="btn" style={{ width: '100%' }} onClick={handleRestart}>
              ▶ RECOMEÇAR DO ZERO
            </button>
            <button className="btn ghost" style={{ width: '100%' }} onClick={handleReturnHomeIntent}>
              VOLTAR AO MENU
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  // ─── DEFEAT: Burnout / Performance ───
  if (outcome === 'defeat') {
    const isBurnout = character.resources.energy <= 0;
    return (
      <>
        {exitSaveDialog}
        <Dialog open={showSaveCard} onOpenChange={setShowSaveCard}>
          <DialogContent className="max-w-lg p-0 overflow-hidden bg-transparent border-0 shadow-none">
            <DialogHeader className="sr-only">
              <DialogTitle>Salvar progresso</DialogTitle>
              <DialogDescription>Cadastre-se para salvar seu personagem</DialogDescription>
            </DialogHeader>
            <SaveProgressCard onDismiss={() => setShowSaveCard(false)} />
          </DialogContent>
        </Dialog>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ maxWidth: '480px', width: '100%', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-pixel)', fontSize: 'var(--fs-h4)', color: 'var(--danger)', marginBottom: '20px', letterSpacing: 0, lineHeight: 'var(--lh-pixel)' }}>
              {isBurnout ? 'BURNOUT TOTAL' : 'DERROTA'}
            </p>
            <p style={{ color: 'var(--fg-dim)', marginBottom: '24px', fontSize: '15px' }}>
              {isBurnout
                ? 'Você colapsou na cadeira do escritório. Sua energia chegou a zero.'
                : 'Suas decisões custaram caro. O encontro terminou contra você.'}
            </p>
            <div style={{ border: '1px solid var(--rule)', padding: '20px', marginBottom: '16px' }}>
              <p style={{ color: 'var(--fg-dim)', fontStyle: 'italic', fontSize: '14px' }}>
                {isBurnout
                  ? '"Seus olhos pesam, o café não funciona mais. O monitor vira um borrão. Alguém do RH aparece com um formulário de licença médica..."'
                  : '"A reunião encerrou e você saiu sem o que precisava. Mas amanhã é outro dia."'}
              </p>
            </div>
            <div className="result-rewards" style={{ maxWidth: '100%', marginBottom: '20px' }}>
              <div className="rw">
                <p className="l">Reputação</p>
                <p className="v" style={{ color: 'var(--danger)' }}><em>-1</em></p>
              </div>
            </div>
            <button className="btn" style={{ width: '100%' }} onClick={handleReturnHomeIntent}>
              ▶ VOLTAR AO MENU
            </button>
          </div>
        </div>
      </>
    );
  }

  // ─── FIRED: Demissão por Justa Causa ───
  if (outcome === 'fired') {
    return (
      <>
        {exitSaveDialog}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '480px', width: '100%', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-pixel)', fontSize: 'var(--fs-h4)', color: 'var(--warn)', marginBottom: '20px', letterSpacing: 0, lineHeight: 'var(--lh-pixel)' }}>
            DEMITIDO POR JUSTA CAUSA
          </p>
          <p style={{ color: 'var(--fg-dim)', marginBottom: '24px', fontSize: '15px' }}>
            Suas ações tiveram consequências irreversíveis.
          </p>
          <div style={{ border: '1px solid var(--rule)', padding: '20px', marginBottom: '24px' }}>
            <p className="kicker" style={{ marginBottom: '10px' }}>Motivo</p>
            <p style={{ color: 'var(--fg)', marginBottom: '12px', fontSize: '15px' }}>
              {encounter.fireReason || 'Conduta inadequada no ambiente de trabalho'}
            </p>
            <p style={{ color: 'var(--fg-dim)', fontStyle: 'italic', fontSize: '13px' }}>
              "O segurança te escolta até a saída. Sua caixa de pertences já está pronta na recepção."
            </p>
          </div>
          <button className="btn" style={{ width: '100%' }} onClick={handleReturnHomeIntent}>
            ▶ VOLTAR AO MENU
          </button>
        </div>
      </div>
      </>
    );
  }

  // ─── VICTORY ───
  return (
    <>
      {exitSaveDialog}
      <LevelUpOverlay
        show={!!levelUp}
        fromLevel={levelUp?.from ?? 1}
        toLevel={levelUp?.to ?? 1}
        onDismiss={() => setLevelUp(null)}
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          {/* ── Header ── */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <p style={{ fontFamily: 'var(--font-pixel)', fontSize: 'var(--fs-h4)', color: 'var(--warn)', letterSpacing: 0, lineHeight: 'var(--lh-pixel)', marginBottom: '10px' }}>
              ENCONTRO COMPLETO
            </p>
            <p style={{ color: 'var(--fg-dim)', fontSize: '15px' }}>{encounter.name}</p>
          </div>

          {/* Save-progress modal */}
          <Dialog open={showSaveCard} onOpenChange={setShowSaveCard}>
            <DialogContent className="max-w-lg p-0 overflow-hidden bg-transparent border-0 shadow-none">
              <DialogHeader className="sr-only">
                <DialogTitle>Salvar progresso</DialogTitle>
                <DialogDescription>Cadastre-se para salvar seu personagem</DialogDescription>
              </DialogHeader>
              <SaveProgressCard onDismiss={() => setShowSaveCard(false)} />
            </DialogContent>
          </Dialog>

          {/* ── Rewards ── */}
          <p className="kicker" style={{ textAlign: 'center', marginBottom: '10px' }}>Recompensas</p>
          <div className="result-rewards" style={{ maxWidth: '480px', margin: '0 auto 24px' }}>
            <div className="rw">
              <p className="l">XP</p>
              <p className="v"><em>+{rewards.xp}</em></p>
            </div>
            <div className="rw">
              <p className="l">Cap. Político</p>
              <p className="v"><em>+{rewards.pc}</em></p>
            </div>
            <div className="rw">
              <p className="l">Reputação</p>
              <p className="v"><em>+{rewards.reputation}</em></p>
            </div>
            <div className="rw">
              <p className="l">Energia</p>
              <p className="v"><em>+{energyBonus}</em></p>
            </div>
          </div>
          <p className="meta" style={{ textAlign: 'center', marginBottom: '28px', fontStyle: 'italic' }}>
            {energyBonus === 3 && 'Performance impecável — você sai revigorado.'}
            {energyBonus === 2 && 'Bom desempenho. Você recupera o fôlego.'}
            {energyBonus === 1 && 'Sobreviveu, mas a poeira ficou.'}
          </p>

          {/* ── Next encounter choices ── */}
          <p className="kicker" style={{ textAlign: 'center', marginBottom: '12px' }}>Próxima Aventura</p>
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            {nextEncounters.map((enc) => {
              const diffTag = DIFF_CLASS[enc.difficulty] || '';
              return (
                <button
                  key={enc.name}
                  className="opt"
                  style={{ width: '100%', textAlign: 'left', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginBottom: '6px' }}
                  onClick={() => handleChooseNext(enc)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                    <span className="opt-text" style={{ fontWeight: 600 }}>{enc.name}</span>
                    <span className={`tag${diffTag ? ` ${diffTag}` : ''}`} style={{ marginLeft: 'auto', flexShrink: 0 }}>
                      {DIFF_LABEL[enc.difficulty] ?? enc.difficulty}
                    </span>
                  </div>
                  <span style={{ color: 'var(--fg-dim)', fontSize: '13px', lineHeight: 1.4 }}>{enc.description}</span>
                  <span className="meta">▸ {enc.rewards.xp} XP · {enc.rewards.pc} PC · {enc.rewards.reputation} REP</span>
                </button>
              );
            })}
            <button className="btn ghost" style={{ width: '100%', marginTop: '8px' }} onClick={handleReturnHomeIntent}>
              VOLTAR AO MENU
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
