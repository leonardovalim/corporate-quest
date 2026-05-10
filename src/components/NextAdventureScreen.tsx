import { useEffect, useMemo, useRef } from 'react';
import { useGame } from '@/game/GameContext';
import { createEncounterFromTemplate, pickNextEncounters, type EncounterTemplate } from '@/game/encounter';
import { getLevelFromXP } from '@/game/leveling';

export default function NextAdventureScreen() {
  const {
    character,
    encounter,
    diceLog,
    recentEncounters,
    pushRecentEncounter,
    setEncounter,
    setScreen,
    updateCharacter,
    clearMessages,
    clearDiceLog,
    setIsStreaming,
  } = useGame();

  const appliedRef = useRef(false);

  // Ensure rewards/penalties are applied even if the user resumes after completing an encounter
  // without opening the result screen.
  useEffect(() => {
    if (appliedRef.current) return;
    if (!character || !encounter?.completed) return;
    if (encounter.rewardsApplied) {
      appliedRef.current = true;
      return;
    }

    const outcome = encounter.outcome || 'victory';
    const rewards = encounter.rewards || { xp: 0, pc: 0, reputation: 0 };

    // Mark as applied first so autosave captures it even if something else triggers a refresh.
    appliedRef.current = true;
    setEncounter({ ...encounter, rewardsApplied: true });

    if (outcome === 'victory') {
      const rolls = diceLog.filter(d => typeof d.success === 'boolean');
      const total = rolls.length;
      const energyBonus = (() => {
        if (total === 0) return 1;
        const rate = rolls.filter(d => d.success).length / total;
        return rate >= 0.75 ? 3 : rate >= 0.5 ? 2 : 1;
      })();

      updateCharacter((c) => {
        const newXP = c.resources.xp + rewards.xp;
        const oldLevel = getLevelFromXP(c.resources.xp);
        const newLevel = getLevelFromXP(newXP);
        const levelsGained = Math.max(0, newLevel - oldLevel);

        const newMaxEnergy = c.resources.maxEnergy + (levelsGained > 0 ? 2 * levelsGained : 0);
        const newEnergy = levelsGained > 0
          ? newMaxEnergy
          : Math.min(c.resources.maxEnergy, c.resources.energy + energyBonus);

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
    }

    if (outcome === 'defeat') {
      updateCharacter((c) => ({
        ...c,
        resources: { ...c.resources, reputation: c.resources.reputation - 1 },
      }));
    }
  }, [character, encounter, diceLog, setEncounter, updateCharacter]);

  const nextEncounters = useMemo(() => {
    if (!character) return [];
    const exclude = [
      ...(encounter?.name ? [encounter.name] : []),
      ...recentEncounters,
    ];
    return pickNextEncounters(character.level, 3, exclude);
  }, [character, encounter?.name, recentEncounters]);

  if (!character) return null;

  const handleChooseNext = (template: EncounterTemplate) => {
    clearMessages();
    clearDiceLog();
    const next = createEncounterFromTemplate(template, character.level);
    pushRecentEncounter(next.name);
    setEncounter(next);
    setIsStreaming(false);
    setScreen('game');
  };

  const handleReturnHome = () => {
    clearMessages();
    clearDiceLog();
    setIsStreaming(false);
    setScreen('home');
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'var(--font-mono)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <p
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 'var(--fs-h4)',
              color: 'var(--warn)',
              letterSpacing: 0,
              lineHeight: 'var(--lh-pixel)',
              marginBottom: '10px',
            }}
          >
            PRÓXIMA AVENTURA
          </p>
          <p style={{ color: 'var(--fg-dim)', fontSize: '14px' }}>
            Escolha o próximo encounter para {character.name}.
          </p>
        </div>

        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          {nextEncounters.map((enc) => (
            <button
              key={enc.name}
              className="opt"
              style={{
                width: '100%',
                textAlign: 'left',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '4px',
                marginBottom: '6px',
              }}
              onClick={() => handleChooseNext(enc)}
            >
              <span className="opt-text" style={{ fontWeight: 600 }}>{enc.name}</span>
              <span style={{ color: 'var(--fg-dim)', fontSize: '13px', lineHeight: 1.4 }}>{enc.description}</span>
            </button>
          ))}

          <button className="btn ghost" style={{ width: '100%', marginTop: '10px' }} onClick={handleReturnHome}>
            VOLTAR AO MENU
          </button>
        </div>
      </div>
    </div>
  );
}
