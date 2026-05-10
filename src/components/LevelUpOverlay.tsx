import { useEffect, useRef } from 'react';
import { useGame } from '@/game/GameContext';
import { getJobTitle, didPromote, getJobTier } from '@/game/jobTitle';

interface Props {
  show: boolean;
  fromLevel: number;
  toLevel: number;
  onDismiss: () => void;
}

export default function LevelUpOverlay({ show, fromLevel, toLevel, onDismiss }: Props) {
  const { character } = useGame();
  const className = character?.className ?? '';
  const oldTitle = getJobTitle(fromLevel, className);
  const newTitle = getJobTitle(toLevel, className);
  const promoted = didPromote(fromLevel, toLevel);
  const newTier = getJobTier(toLevel);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!show) return;
    timerRef.current = setTimeout(onDismiss, 3200);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [show, onDismiss]);

  if (!show) return null;

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(10,10,11,0.85)', cursor: 'pointer',
      }}
    >
      <div style={{ textAlign: 'center', padding: '0 24px' }}>
        <p style={{
          fontFamily: 'var(--font-pixel)', fontSize: 'var(--fs-h4)',
          color: 'var(--warn)', letterSpacing: 0, lineHeight: 'var(--lh-pixel)',
          marginBottom: '20px',
        }}>
          LEVEL UP!
        </p>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '16px', fontFamily: 'var(--font-pixel)', fontSize: '14px',
          marginBottom: '16px',
        }}>
          <span style={{ color: 'var(--fg-dim)' }}>Lv {fromLevel}</span>
          <span style={{ color: 'var(--fg)' }}>→</span>
          <span style={{ color: 'var(--ok)', fontSize: '18px' }}>Lv {toLevel}</span>
        </div>
        {promoted ? (
          <div style={{ marginBottom: '12px' }}>
            <p className="kicker" style={{ marginBottom: '6px' }}>PROMOÇÃO</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--fg)' }}>
              <span style={{ color: 'var(--fg-dim)' }}>{oldTitle}</span>
              <span style={{ color: 'var(--warn)' }}> → </span>
              <span style={{ color: 'var(--ok)' }}>{newTier.icon} {newTitle}</span>
            </p>
          </div>
        ) : (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--fg-dim)', marginBottom: '12px' }}>
            {newTier.icon} {newTitle}
          </p>
        )}
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--ok)', marginBottom: '16px' }}>
          +2 Energia Máxima · Energia Restaurada
        </p>
        <p className="meta">(clique para fechar)</p>
      </div>
    </div>
  );
}
