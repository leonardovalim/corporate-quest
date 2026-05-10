import NarrativeChat from '@/components/NarrativeChat';
import CharacterSidebar from '@/components/CharacterSidebar';
import EncounterResultScreen from '@/components/EncounterResultScreen';
import { useGame } from '@/game/GameContext';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { getCurrentLevelProgress } from '@/game/leveling';
import { getEnergyStatus } from '@/game/checks';
import { useAuthSession } from '@/hooks/useAuthSession';
import LoginDialog from './LoginDialog';

export default function GameScreen() {
  const { character, encounter, diceLog, setScreen } = useGame();
  const { user, signOut } = useAuthSession();

  const handleExit = async () => {
    await signOut();
    setScreen('home');
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resultReady, setResultReady] = useState(false);

  const rolls = diceLog.filter(d => typeof d.success === 'boolean');
  const successRate = rolls.length > 0 ? rolls.filter(d => d.success).length / rolls.length : 0.5;

  // Reset gate on new encounter; no auto-advance — player clicks when ready
  useEffect(() => {
    if (!encounter?.completed) setResultReady(false);
  }, [encounter?.name, encounter?.completed]);

  if (!character) return null;

  const energy = getEnergyStatus(character);
  const xp = getCurrentLevelProgress(character.resources.xp);
  const { energy: nrg, maxEnergy, politicalCapital: pc, reputation: rep } = character.resources;

  const energyClass = energy.color === 'red' ? ' danger' : energy.color === 'yellow' ? ' warn' : '';

  return (
    <div className="cabinet" style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <div className="cabinet-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

        {/* ── Slim Bar ── */}
        <div className="slim-bar">
          <span className="crumb" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60vw', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              ~/encounters/<b>{encounter?.name ?? 'Corporate Quest'}</b>
              {encounter && ` · fase ${encounter.phase}/${encounter.totalPhases}`}
            </span>
            {!encounter?.completed && encounter && (
              encounter.phase >= encounter.totalPhases
                ? <span style={{ color: 'var(--warn)', fontSize: '9px', letterSpacing: '0.1em', flexShrink: 0, animation: 'blink 1s step-end infinite' }}>⚠ FASE FINAL</span>
                : null
            )}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user ? (
              <button className="btn ghost" style={{ fontSize: '10px', padding: '4px 10px' }} onClick={handleExit}>SAIR</button>
            ) : (
              <LoginDialog
                trigger={<button className="btn ghost" style={{ fontSize: '10px', padding: '4px 10px' }}>ENTRAR</button>}
              />
            )}
            {/* Mobile sidebar toggle */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <button
                  className="md:hidden"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--fg-dim)', background: 'transparent', border: '1px solid var(--rule)', padding: '4px 10px', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                >
                  FICHA
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-72">
                <SheetTitle className="sr-only">Ficha do Personagem</SheetTitle>
                <CharacterSidebar />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* ── HUD ── */}
        <div className="hud">
          <span className={energyClass}><span style={{ color: 'var(--warn)' }}>⚡</span> <b>{nrg}</b>/{maxEnergy}{energy.label && <> · <span style={{ color: energy.color === 'red' ? 'var(--danger)' : 'var(--warn)' }}>{energy.label}</span></>}</span>
          <span>CP · <b>{pc}</b></span>
          <span>REP · <b>{rep}</b></span>
          <span>XP · <b>{xp.xpIntoLevel}</b>/{xp.xpForNext}</span>
          {rolls.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '9px', color: 'var(--fg-dim)', letterSpacing: '0.08em' }}>PERF</span>
              <span style={{ width: '48px', height: '5px', background: 'var(--danger)', borderRadius: '2px', overflow: 'hidden', flexShrink: 0 }}>
                <span style={{ display: 'block', width: `${successRate * 100}%`, height: '100%', background: successRate >= 0.5 ? 'var(--ok)' : 'var(--warn)', transition: 'width 0.4s ease' }} />
              </span>
            </span>
          )}
          <span className="hidden md:inline">{character.name} · {character.className} · Lv {character.level}</span>
        </div>

        {/* ── Content area ── */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* Main chat / result */}
          <div style={{ flex: 1, overflow: 'hidden', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {encounter?.completed && resultReady ? (
              <EncounterResultScreen />
            ) : (
              <>
                {/* Wrapper gives NarrativeChat flex shrink room so the button below is visible */}
                <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                  <NarrativeChat />
                </div>
                {encounter?.completed && !resultReady && (
                  <div style={{ padding: '12px 16px', borderTop: '2px solid var(--ok)', flexShrink: 0 }}>
                    <button
                      className="btn"
                      style={{ width: '100%', fontSize: 'var(--fs-label)', padding: '12px', letterSpacing: '0.15em', borderColor: 'var(--ok)', color: 'var(--ok)', animation: 'blink 1s step-end infinite' }}
                      onClick={() => setResultReady(true)}
                    >
                      ☕ BATER O PONTO
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Desktop sidebar */}
          <div
            className="hidden md:block"
            style={{ width: '272px', flexShrink: 0, borderLeft: '1px solid var(--rule)', overflowY: 'auto' }}
          >
            <CharacterSidebar />
          </div>
        </div>

      </div>
    </div>
  );
}
