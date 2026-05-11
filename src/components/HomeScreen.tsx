import { useEffect, useRef } from 'react';
import { useGame } from '@/game/GameContext';
import LoginDialog from './LoginDialog';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useGameSaves } from '@/hooks/useGameSaves';

export default function HomeScreen() {
  const {
    setScreen,
    hydrateFromSnapshot,
    setCharacter,
    setEncounter,
    clearMessages,
    clearDiceLog,
    setActiveSaveId,
  } = useGame();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { user, profile, profileLoading, signOut } = useAuthSession();
  const { saves, loading: savesLoading } = useGameSaves(user?.id ?? null);

  const displayName = profile?.full_name || user?.email || '';
  const latestSave = saves[0] ?? null;
  const hasSnapshot = !!latestSave?.snapshot?.character;
  const buttonsReady = !profileLoading && !savesLoading;

  const pc = hasSnapshot ? (latestSave!.snapshot.character?.resources?.politicalCapital ?? 0) : 0;
  const level = hasSnapshot ? (latestSave!.snapshot.character?.level ?? 1) : 0;
  const cls = hasSnapshot ? latestSave!.snapshot.character?.className : '';

  const handleContinueLatest = () => {
    if (!latestSave?.snapshot?.character) {
      setActiveSaveId(null);
      setScreen('onboarding');
      return;
    }
    hydrateFromSnapshot(latestSave.snapshot);
    setActiveSaveId(latestSave.id);
    setScreen(latestSave.snapshot.encounter?.completed ? 'adventure' : 'game');
  };

  const handleContinueSave = (saveId: string) => {
    const selected = saves.find((s) => s.id === saveId);
    if (!selected?.snapshot?.character) return;
    hydrateFromSnapshot(selected.snapshot);
    setActiveSaveId(selected.id);
    setScreen(selected.snapshot.encounter?.completed ? 'adventure' : 'game');
  };

  const handleNewGame = () => {
    setCharacter(null);
    setEncounter(null);
    clearMessages();
    clearDiceLog();
    setActiveSaveId(null);
    setScreen('onboarding');
  };

  useEffect(() => {
    btnRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t?.tagName === 'INPUT' || t?.tagName === 'TEXTAREA' || t?.isContentEditable) return;
      if (e.key === 'Enter') { e.preventDefault(); handleContinueLatest(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [latestSave?.id, saves.length]);

  return (
    <div className="cabinet" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="cabinet-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="arcade-bar">
          <span className="brand">◆ Corporate Quest</span>
          <div className="coin">
            <span>
              <span className="led" />
              INSERT COIN
            </span>
            {hasSnapshot && <span>CP · {pc}</span>}
            {hasSnapshot && <span>HI-SCORE · LV {level}</span>}
          </div>
        </div>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', textAlign: 'center', gap: '0' }}>
          <h1 className="pixel-h" style={{ fontSize: 'clamp(16px, 4vw, 28px)', color: 'var(--fg)', marginBottom: '20px' }}>
            Corporate Quest
          </h1>

          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-kicker)', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--warn)', marginBottom: '28px' }}>
            The Office RPG
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: 'min(560px, 100%)' }}>
            {!buttonsReady ? (
              <button className="press-start" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                ◌ CARREGANDO
              </button>
            ) : (
              <button ref={btnRef} className="press-start" onClick={handleContinueLatest}>
                {hasSnapshot ? '▶ CONTINUAR ÚLTIMO SAVE' : '▶ INICIAR CARREIRA'}
              </button>
            )}

            {hasSnapshot && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-kicker)', color: 'var(--warn)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {cls} · LV {level}
              </p>
            )}

            {(hasSnapshot || saves.length > 0) && (
              <button className="btn ghost" style={{ marginTop: '4px', fontSize: '11px', padding: '8px 18px' }} onClick={handleNewGame}>
                + NOVO PERSONAGEM
              </button>
            )}

            {user && saves.length > 0 && (
              <div style={{ marginTop: '12px', width: '100%', border: '1px solid var(--rule)', padding: '12px', textAlign: 'left' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--fg-dim)', letterSpacing: '0.1em', marginBottom: '8px' }}>
                  SAVES ({saves.length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                  {saves.map((save) => (
                    <button
                      key={save.id}
                      className="btn ghost"
                      style={{ justifyContent: 'space-between', fontSize: '11px', padding: '8px 12px', gap: '12px' }}
                      onClick={() => handleContinueSave(save.id)}
                    >
                      <span style={{ minWidth: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{save.character_name}</span>
                      <span style={{ color: 'var(--warn)', flexShrink: 0 }}>Lv {save.level}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-kicker)', color: 'var(--fg-faint)', marginTop: '48px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            v0.2 · múltiplos saves habilitados
          </p>
        </main>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderTop: '1px solid var(--rule)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--fg-dim)' }}>
            {user ? (
              <>
                <span style={{ color: 'var(--fg)' }}>▸ {displayName}</span>
                <button
                  onClick={signOut}
                  className="btn ghost"
                  style={{ fontSize: '11px', padding: '6px 14px' }}
                >
                  SAIR
                </button>
              </>
            ) : (
              <LoginDialog
                trigger={
                  <button className="btn ghost" style={{ fontSize: '11px', padding: '6px 14px' }}>
                    ENTRAR
                  </button>
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
