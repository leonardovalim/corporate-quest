import React, { useState, useEffect } from 'react';

const spriteColors = {
  marina: '#6B7280',
  caio: '#F59E0B',
  joao: '#3B82F6',
  player: '#10B981',
};

const expressionEmojis = {
  idle: '😐',
  talking: '🗣️',
  thinking: '🤔',
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
      { id: 'B', text: 'Acalmar Caio', attribute: 'INF', modifier: '+1' },
      { id: 'C', text: 'Minimizar e seguir', attribute: 'INF', modifier: '+1', hint: 'Risco: problema continua' },
      { id: 'D', text: 'Pedir números concretos', attribute: 'AWA', modifier: '-1', feat: true },
    ],
  },
  player: { energy: 10, pc: 3, rep: 0 },
};

function DiceRoll({ result, onClose }) {
  const [rolling, setRolling] = useState(true);
  const [display, setDisplay] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplay(Math.floor(Math.random() * 20) + 1);
    }, 60);

    const stopRoll = setTimeout(() => {
      clearInterval(interval);
      setDisplay(result.roll);
      setRolling(false);
    }, 1200);

    const autoClose = setTimeout(onClose, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(stopRoll);
      clearTimeout(autoClose);
    };
  }, [result, onClose]);

  const bgColor = result.success ? '#166534' : '#991b1b';
  const borderColor = result.critical === 'success' ? '#fbbf24' : 
                      result.critical === 'failure' ? '#ef4444' : '#6b7280';

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
      <div className="p-8 rounded-2xl text-center" style={{ backgroundColor: bgColor }}>
        <div 
          className={`w-24 h-24 mx-auto mb-4 rounded-xl flex items-center justify-center text-4xl font-bold bg-white text-gray-900 ${rolling ? 'animate-spin' : ''}`}
          style={{ 
            border: `4px solid ${borderColor}`,
            boxShadow: result.critical ? `0 0 20px ${borderColor}` : 'none'
          }}
        >
          {display}
        </div>

        {!rolling && (
          <div className="text-white">
            <div className="text-lg mb-2">
              <span className="text-2xl font-bold">{result.roll}</span>
              <span className="mx-2">+</span>
              <span>{result.modifier}</span>
              <span className="mx-2">=</span>
              <span className="text-2xl font-bold">{result.total}</span>
              <span className="mx-2">vs DC</span>
              <span className="text-xl">{result.dc}</span>
            </div>
            <div className={`text-2xl font-bold mt-4 ${result.success ? 'text-green-300' : 'text-red-300'}`}>
              {result.critical === 'success' && '🎉 CRÍTICO! '}
              {result.critical === 'failure' && '💀 FALHA CRÍTICA! '}
              {!result.critical && (result.success ? '✅ SUCESSO!' : '❌ FALHA!')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CorporateQuestDemo() {
  const [selected, setSelected] = useState(null);
  const [diceResult, setDiceResult] = useState(null);
  const [showDice, setShowDice] = useState(false);
  const [history, setHistory] = useState([]);
  const [gamePhase, setGamePhase] = useState('playing');

  const { scene, dialogue, prompt, player } = sceneData;

  const handleOption = (option) => {
    if (selected || gamePhase !== 'playing') return;
    setSelected(option.id);

    const roll = Math.floor(Math.random() * 20) + 1;
    const mod = parseInt(option.modifier) || 0;
    const total = roll + mod;
    const dc = 12;

    const result = {
      roll,
      modifier: mod,
      total,
      dc,
      success: total >= dc || roll === 20,
      critical: roll === 20 ? 'success' : roll === 1 ? 'failure' : null,
      option: option.text,
      attribute: option.attribute,
    };

    setDiceResult(result);
    setShowDice(true);
  };

  const closeDice = () => {
    setShowDice(false);
    if (diceResult) {
      setHistory(prev => [...prev, diceResult]);
    }
    setSelected(null);
    setDiceResult(null);
  };

  const resetGame = () => {
    setHistory([]);
    setSelected(null);
    setDiceResult(null);
    setGamePhase('playing');
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gray-900 rounded-xl overflow-hidden shadow-2xl font-sans">
      {showDice && diceResult && <DiceRoll result={diceResult} onClose={closeDice} />}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-gray-900 px-4 py-2 flex items-center justify-between">
        <span className="text-white font-bold text-sm">🏢 CORPORATE QUEST</span>
        <span className="text-gray-400 text-xs">Demo v1.0</span>
      </div>

      {/* Scene Canvas */}
      <div className="relative h-44 bg-gradient-to-b from-gray-800 to-gray-900 overflow-hidden">
        {/* Time */}
        <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white font-mono">
          🕐 {scene.time}
        </div>
        
        {/* Location */}
        <div className="absolute top-2 left-2 text-xs text-gray-500 font-mono uppercase">
          📹 Video Call
        </div>

        {/* Characters */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-around items-end pb-3 px-2">
          {scene.characters.map((char) => (
            <div key={char.id} className="flex flex-col items-center">
              {char.turn_indicator && (
                <div className="text-xl mb-1 animate-bounce">👇</div>
              )}
              {char.highlight_danger && (
                <div className="text-sm mb-1">⚠️</div>
              )}
              {char.speech_bubble && (
                <div className="text-sm mb-1">💬</div>
              )}
              
              <div 
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${char.is_player ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-900' : ''}`}
                style={{ 
                  backgroundColor: spriteColors[char.id] || '#9ca3af',
                  border: char.is_player ? '3px solid #fbbf24' : '3px solid #4b5563'
                }}
              >
                {expressionEmojis[char.expression] || '😐'}
              </div>
              
              <div className={`mt-1 px-2 py-0.5 rounded text-xs font-bold ${char.is_player ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-white'}`}>
                {char.id === 'player' ? 'VOCÊ' : char.id.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dialogue Box */}
      <div className="bg-gray-800 border-t-4 border-gray-700 p-3">
        <div className="flex items-start gap-2">
          <span className="text-yellow-400 font-bold text-sm uppercase">{dialogue.speaker}:</span>
          <span className="text-white text-sm">"{dialogue.text}"</span>
        </div>
      </div>

      {/* Action Prompt */}
      <div className="bg-gray-850 p-3 border-t border-gray-700" style={{ backgroundColor: '#1a1f2e' }}>
        <div className="text-gray-400 mb-3 text-sm italic">
          {prompt.text}
        </div>

        {/* Options */}
        <div className="space-y-2">
          {prompt.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleOption(opt)}
              disabled={selected !== null}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                selected === opt.id 
                  ? 'border-yellow-400 bg-yellow-400/20' 
                  : 'border-gray-600 hover:border-gray-400 bg-gray-800'
              } ${selected && selected !== opt.id ? 'opacity-40' : ''} disabled:cursor-not-allowed`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                    {opt.id}
                  </span>
                  <span className="text-white text-sm">{opt.text}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    opt.modifier.startsWith('+') && parseInt(opt.modifier) >= 3 
                      ? 'bg-green-600 text-white' 
                      : opt.modifier.startsWith('-')
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-600 text-gray-200'
                  }`}>
                    {opt.attribute} {opt.modifier}
                  </span>
                  {opt.feat && <span className="text-yellow-400">⚡</span>}
                  {opt.hint === 'Seu ponto forte' && <span className="text-yellow-400">★</span>}
                </div>
              </div>
              {opt.hint && (
                <div className="text-xs text-gray-500 mt-1 ml-8">{opt.hint}</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-black px-4 py-2 flex items-center justify-between text-sm border-t border-gray-800">
        <div className="flex items-center gap-4">
          <span>⚡ <b className="text-yellow-400">{player.energy}/10</b></span>
          <span>🏛️ <b className="text-blue-400">PC: {player.pc}</b></span>
          <span>⭐ <b className="text-gray-400">Rep: {player.rep}</b></span>
        </div>
        <button 
          onClick={resetGame}
          className="text-xs text-gray-500 hover:text-white transition-colors"
        >
          🔄 Reset
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-gray-950 p-3 border-t border-gray-800">
          <div className="text-gray-500 text-xs mb-2 font-bold">📜 HISTÓRICO</div>
          <div className="space-y-1">
            {history.slice(-3).map((h, i) => (
              <div 
                key={i} 
                className={`text-xs p-2 rounded ${h.success ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}
              >
                <span className="font-bold">{h.option}</span>
                <span className="text-gray-400 mx-1">|</span>
                <span>{h.attribute}: {h.roll}+({h.modifier})={h.total} vs DC{h.dc}</span>
                <span className="ml-2">{h.success ? '✅' : '❌'}</span>
                {h.critical && <span className="ml-1">{h.critical === 'success' ? '🎉' : '💀'}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
