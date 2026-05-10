import React, { useState, useEffect } from 'react';

const spriteColors = {
  marina: '#6B7280',
  caio: '#F59E0B',
  joao: '#3B82F6',
  player: '#10B981',
  geraldo_vp: '#7C3AED',
  patricia_hr: '#EC4899',
  thiago_rival: '#EF4444',
};

const expressionEmojis = {
  idle: '😐',
  talking: '🗣️',
  thinking: '🤔',
  happy: '😊',
  stressed: '😰',
  confused: '😕',
  angry: '😠',
  typing: '⌨️',
  frustrated: '😤',
  excited: '🤩',
  nervous: '😬',
  listening: '👂',
};

const sceneData = {
  scene: {
    background: 'video_call',
    time: '09:47',
    characters: [
      { id: 'marina', expression: 'frustrated', speech_bubble: true },
      { id: 'joao', expression: 'nervous' },
      { id: 'caio', expression: 'excited', highlight_danger: true },
      { id: 'player', expression: 'thinking', is_player: true, turn_indicator: true },
    ],
  },
  dialogue: {
    speaker: 'Marina',
    text: '…débito técnico que pode explodir se o volume subir.',
  },
  prompt: {
    text: 'Todo mundo olha pra você. É sua vez.',
    options: [
      { id: 'A', text: 'Perguntar detalhes técnicos', attribute: 'TEC', modifier: '+3', hint: 'Seu ponto forte' },
      { id: 'B', text: 'Acalmar Caio', attribute: 'INF', modifier: '+1', hint: null },
      { id: 'C', text: 'Minimizar e seguir', attribute: 'INF', modifier: '+1', hint: 'Risco: problema continua' },
      { id: 'D', text: 'Pedir números concretos', attribute: 'AWA', modifier: '-1', hint: 'Ativa seu feat!', feat: true },
    ],
  },
  player: { energy: 10, energyMax: 10, pc: 3, rep: 0, feats: ['data_driven', 'forced_alignment'] },
};

function DiceRoll({ result, onClose }) {
  const [phase, setPhase] = useState('rolling');
  const [displayNum, setDisplayNum] = useState(1);

  useEffect(() => {
    let interval;
    let stopTimer;
    let closeTimer;

    interval = setInterval(() => {
      setDisplayNum(Math.floor(Math.random() * 20) + 1);
    }, 60);

    stopTimer = setTimeout(() => {
      clearInterval(interval);
      setDisplayNum(result.roll);
      setPhase('result');
    }, 1200);

    closeTimer = setTimeout(() => {
      onClose();
    }, 3500);

    return () => {
      clearInterval(interval);
      clearTimeout(stopTimer);
      clearTimeout(closeTimer);
    };
  }, [result, onClose]);

  const bgColor = result.success ? '#166534' : '#991b1b';
  const borderColor = result.critical === 'success' ? '#fbbf24' : result.critical === 'failure' ? '#ef4444' : '#6b7280';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.85)',
      zIndex: 1000,
    }}>
      <div style={{
        padding: '24px 32px',
        borderRadius: '16px',
        textAlign: 'center',
        backgroundColor: bgColor,
        minWidth: '200px',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 16px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
          fontWeight: 'bold',
          backgroundColor: '#ffffff',
          color: '#000000',
          border: `4px solid ${borderColor}`,
          boxShadow: result.critical ? `0 0 20px ${borderColor}` : 'none',
          transform: phase === 'rolling' ? 'rotate(5deg)' : 'rotate(0deg)',
          transition: 'transform 0.1s',
        }}>
          {displayNum}
        </div>

        {phase === 'result' && (
          <div>
            <div style={{ color: '#ffffff', fontSize: '16px', marginBottom: '8px' }}>
              <span style={{ fontSize: '22px', fontWeight: 'bold' }}>{result.roll}</span>
              <span style={{ margin: '0 6px' }}>+</span>
              <span>{result.modifier}</span>
              <span style={{ margin: '0 6px' }}>=</span>
              <span style={{ fontSize: '22px', fontWeight: 'bold' }}>{result.total}</span>
              <span style={{ margin: '0 6px' }}>vs DC</span>
              <span style={{ fontSize: '18px' }}>{result.dc}</span>
            </div>

            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginTop: '12px',
              color: result.success ? '#86efac' : '#fca5a5',
            }}>
              {result.critical === 'success' && '🎉 CRÍTICO!'}
              {result.critical === 'failure' && '💀 FALHA CRÍTICA!'}
              {!result.critical && (result.success ? '✅ SUCESSO!' : '❌ FALHA!')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CharacterSprite({ character, index, total }) {
  const width = 100 / total;
  const left = index * width + width / 2;
  const bgColor = spriteColors[character.id] || '#9ca3af';
  const emoji = expressionEmojis[character.expression] || '😐';

  return (
    <div style={{
      position: 'absolute',
      bottom: '12px',
      left: `${left}%`,
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {character.turn_indicator && (
        <div style={{ marginBottom: '2px', fontSize: '18px', animation: 'bounce 1s infinite' }}>👇</div>
      )}
      {character.highlight_danger && (
        <div style={{ marginBottom: '2px', fontSize: '14px' }}>⚠️</div>
      )}
      {character.speech_bubble && (
        <div style={{ marginBottom: '2px', fontSize: '14px' }}>💬</div>
      )}

      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        backgroundColor: bgColor,
        border: character.is_player ? '3px solid #facc15' : '3px solid #4b5563',
        boxShadow: character.is_player ? '0 0 8px rgba(250,204,21,0.6)' : 'none',
      }}>
        {emoji}
      </div>

      <div style={{
        marginTop: '4px',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '9px',
        fontWeight: 'bold',
        backgroundColor: character.is_player ? '#facc15' : '#1f2937',
        color: character.is_player ? '#000000' : '#ffffff',
      }}>
        {character.id === 'player' ? 'VOCÊ' : character.id.toUpperCase()}
      </div>
    </div>
  );
}

export default function CorporateQuestScene() {
  const [selected, setSelected] = useState(null);
  const [diceResult, setDiceResult] = useState(null);
  const [showDice, setShowDice] = useState(false);
  const [history, setHistory] = useState([]);
  const [customAction, setCustomAction] = useState('');

  const { scene, dialogue, prompt, player } = sceneData;

  const handleOptionClick = (option) => {
    if (selected !== null) return;

    setSelected(option.id);

    const roll = Math.floor(Math.random() * 20) + 1;
    const mod = parseInt(option.modifier) || 0;
    const total = roll + mod;
    const dc = 12;

    const result = {
      roll: roll,
      modifier: mod,
      total: total,
      dc: dc,
      success: total >= dc,
      critical: roll === 20 ? 'success' : roll === 1 ? 'failure' : null,
      optionText: option.text,
      attribute: option.attribute,
    };

    setDiceResult(result);
    setShowDice(true);
  };

  const handleDiceClose = () => {
    setShowDice(false);
    if (diceResult) {
      setHistory(prev => [...prev, diceResult]);
    }
    setSelected(null);
    setDiceResult(null);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customAction.trim() && selected === null) {
      const roll = Math.floor(Math.random() * 20) + 1;
      const mod = 0;
      const total = roll + mod;
      const dc = 13;

      const result = {
        roll: roll,
        modifier: mod,
        total: total,
        dc: dc,
        success: total >= dc,
        critical: roll === 20 ? 'success' : roll === 1 ? 'failure' : null,
        optionText: customAction,
        attribute: '???',
      };

      setDiceResult(result);
      setShowDice(true);
      setSelected('custom');
      setCustomAction('');
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '0 auto',
      backgroundColor: '#111827',
      borderRadius: '12px',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    }}>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      {showDice && diceResult && (
        <DiceRoll result={diceResult} onClose={handleDiceClose} />
      )}

      {/* Cena */}
      <div style={{
        height: '150px',
        background: 'linear-gradient(to bottom, #1f2937, #111827)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          fontSize: '10px',
          color: '#6b7280',
          fontFamily: 'monospace',
        }}>
          VIDEO CALL
        </div>
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          padding: '3px 8px',
          backgroundColor: 'rgba(0,0,0,0.5)',
          borderRadius: '4px',
          fontSize: '11px',
          color: '#ffffff',
          fontFamily: 'monospace',
        }}>
          🕐 {scene.time}
        </div>

        {scene.characters.map((char, idx) => (
          <CharacterSprite
            key={char.id}
            character={char}
            index={idx}
            total={scene.characters.length}
          />
        ))}
      </div>

      {/* Diálogo */}
      <div style={{
        backgroundColor: '#1f2937',
        padding: '12px',
        borderTop: '3px solid #374151',
      }}>
        <span style={{ color: '#facc15', fontWeight: 'bold', fontSize: '12px' }}>
          {dialogue.speaker}:
        </span>
        <span style={{ color: '#ffffff', marginLeft: '8px', fontSize: '13px' }}>
          "{dialogue.text}"
        </span>
      </div>

      {/* Prompt e Opções */}
      <div style={{
        backgroundColor: '#1a1f2e',
        padding: '12px',
      }}>
        <div style={{
          color: '#9ca3af',
          fontSize: '12px',
          fontStyle: 'italic',
          marginBottom: '10px',
        }}>
          {prompt.text}
        </div>

        {prompt.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleOptionClick(opt)}
            disabled={selected !== null}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '10px',
              marginBottom: '6px',
              borderRadius: '8px',
              border: selected === opt.id ? '2px solid #facc15' : '2px solid #4b5563',
              backgroundColor: selected === opt.id ? 'rgba(250,204,21,0.15)' : '#1f2937',
              opacity: selected !== null && selected !== opt.id ? 0.5 : 1,
              cursor: selected !== null ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  backgroundColor: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                }}>
                  {opt.id}
                </span>
                <span style={{ color: '#ffffff', fontSize: '12px' }}>{opt.text}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: opt.modifier.startsWith('+') && parseInt(opt.modifier) >= 3 ? '#16a34a' :
                                  opt.modifier.startsWith('-') ? '#dc2626' : '#4b5563',
                  color: '#ffffff',
                }}>
                  {opt.attribute} {opt.modifier}
                </span>
                {opt.feat && <span style={{ color: '#facc15', fontSize: '12px' }}>⚡</span>}
                {opt.hint === 'Seu ponto forte' && <span style={{ color: '#facc15', fontSize: '12px' }}>★</span>}
              </div>
            </div>
            {opt.hint && (
              <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', marginLeft: '28px' }}>
                {opt.hint}
              </div>
            )}
          </button>
        ))}

        {/* Input customizado */}
        <form onSubmit={handleCustomSubmit} style={{ marginTop: '10px', display: 'flex', gap: '6px' }}>
          <input
            type="text"
            value={customAction}
            onChange={(e) => setCustomAction(e.target.value)}
            placeholder="Ou descreva sua ação..."
            disabled={selected !== null}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #4b5563',
              backgroundColor: '#1f2937',
              color: '#ffffff',
              fontSize: '12px',
              opacity: selected !== null ? 0.5 : 1,
            }}
          />
          <button
            type="submit"
            disabled={!customAction.trim() || selected !== null}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#eab308',
              color: '#000000',
              fontWeight: 'bold',
              fontSize: '11px',
              cursor: !customAction.trim() || selected !== null ? 'not-allowed' : 'pointer',
              opacity: !customAction.trim() || selected !== null ? 0.5 : 1,
            }}
          >
            Agir
          </button>
        </form>
      </div>

      {/* Status Bar */}
      <div style={{
        backgroundColor: '#030712',
        padding: '10px 12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        borderTop: '1px solid #1f2937',
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span style={{ color: '#d1d5db' }}>
            ⚡ <b style={{ color: '#facc15' }}>{player.energy}/{player.energyMax}</b>
          </span>
          <span style={{ color: '#d1d5db' }}>
            🏛️ <b style={{ color: '#60a5fa' }}>PC: {player.pc}</b>
          </span>
          <span style={{ color: '#d1d5db' }}>
            ⭐ <b style={{ color: player.rep > 0 ? '#4ade80' : player.rep < 0 ? '#f87171' : '#9ca3af' }}>
              Rep: {player.rep > 0 ? '+' : ''}{player.rep}
            </b>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {player.feats.map((feat) => (
            <span
              key={feat}
              style={{
                fontSize: '9px',
                padding: '2px 5px',
                borderRadius: '3px',
                backgroundColor: '#ca8a04',
                color: '#ffffff',
              }}
            >
              {feat.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Histórico */}
      {history.length > 0 && (
        <div style={{
          backgroundColor: '#0a0f1a',
          padding: '10px 12px',
          borderTop: '1px solid #1f2937',
        }}>
          <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '6px', fontWeight: 'bold' }}>
            📜 HISTÓRICO
          </div>
          {history.slice(-3).map((h, i) => (
            <div
              key={i}
              style={{
                fontSize: '10px',
                padding: '4px 8px',
                marginBottom: '3px',
                borderRadius: '4px',
                backgroundColor: h.success ? '#14532d' : '#7f1d1d',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>{h.optionText}</span>
              <span>
                {h.roll}+{h.modifier}={h.total} vs {h.dc} → {h.success ? '✅' : '❌'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
