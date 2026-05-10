import { useGame } from '@/game/GameContext';
import { getModifier } from '@/game/dice';
import { getEnergyStatus } from '@/game/checks';
import { ATTRIBUTE_NAMES, CLASSES } from '@/game/gameData';
import { getCurrentLevelProgress } from '@/game/leveling';
import { getJobTitle } from '@/game/jobTitle';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function CharacterSidebar() {
  const { character, diceLog } = useGame();
  if (!character) return null;

  const energy = getEnergyStatus(character);
  const jobTitle = getJobTitle(character.level, character.className);
  const xpProgress = getCurrentLevelProgress(character.resources.xp);

  const energyFill = energy.color === 'red' ? 'danger' : energy.color === 'yellow' ? 'warn' : '';

  return (
    <div className="side" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <div className="side-h">
        <p className="name">{character.name}</p>
        <p className="title">{jobTitle} · Lv {character.level}</p>
        <p className="align">{character.alignment}</p>
      </div>

      {/* ── Resources ── */}
      <div className="side-sect">
        <p className="side-label">Recursos</p>

        <div className="bar-row">
          <div className="top">
            <span className="k"><span style={{ color: 'var(--warn)' }}>⚡</span> Energia{energy.label && <> <span style={{ color: energy.color === 'red' ? 'var(--danger)' : 'var(--warn)' }}>{energy.label}</span></>}</span>
            <span>{character.resources.energy}/{character.resources.maxEnergy}</span>
          </div>
          <div className="bar-track">
            <div className={`bar-fill${energyFill ? ` ${energyFill}` : ''}`} style={{ width: `${Math.max(0, energy.percent)}%` }} />
          </div>
        </div>

        <div className="bar-row">
          <div className="top">
            <span className="k">XP</span>
            <span>{xpProgress.xpIntoLevel}/{xpProgress.xpForNext}</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${xpProgress.percent}%` }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-meta)', marginTop: '6px' }}>
          <span style={{ color: 'var(--fg-dim)' }}>Cap. Político</span>
          <span style={{ color: 'var(--fg)', fontWeight: 600 }}>{character.resources.politicalCapital}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-meta)', marginTop: '4px' }}>
          <span style={{ color: 'var(--fg-dim)' }}>Reputação</span>
          <span style={{ color: 'var(--fg)', fontWeight: 600 }}>{character.resources.reputation}</span>
        </div>
      </div>

      {/* ── Attributes ── */}
      <div className="side-sect">
        <p className="side-label">Atributos</p>
        <div className="attr-grid">
          {ATTRIBUTE_NAMES.map(attr => {
            const val = character.attributes[attr.key as keyof typeof character.attributes];
            const mod = getModifier(val);
            return (
              <div key={attr.key} className="attr">
                <p className="abbr">{attr.abbr}</p>
                <p className="v">{val}</p>
                <p className="mod">{mod >= 0 ? '+' : ''}{mod}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Dice Log ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="side-sect" style={{ paddingBottom: '8px' }}>
          <p className="side-label">⬡ Histórico</p>
        </div>
        <ScrollArea style={{ flex: 1 }}>
          <div style={{ padding: '0 20px 16px' }}>
            {diceLog.length === 0 && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--fg-faint)', fontStyle: 'italic' }}>
                Nenhum dado rolado ainda
              </p>
            )}
            {diceLog.slice(0, 20).map(d => (
              <div key={d.id} className="log-row">
                <b>{d.attribute}</b> d20={d.rolls.join(',')}{d.modifier !== 0 && (d.modifier > 0 ? `+${d.modifier}` : d.modifier)}={d.total}
                {d.dc && (
                  <> vs DC{d.dc} <span className={d.success ? 'ok' : 'fail'}>{d.success ? '✓' : '✗'}</span></>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

    </div>
  );
}
