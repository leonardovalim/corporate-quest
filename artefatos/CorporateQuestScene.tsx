/**
 * CORPORATE QUEST - Scene Renderer Component
 * 
 * Componente React que renderiza uma cena do jogo com:
 * - Canvas de pixel art com personagens e cenário
 * - Caixa de diálogo
 * - Opções clicáveis
 * - Campo de texto para ação livre
 * - Barra de status do jogador
 * 
 * Para usar no projeto, instale as dependências:
 * npm install react framer-motion
 */

import React, { useState, useEffect, useRef } from 'react';

// ============================================================
// TIPOS
// ============================================================

interface Character {
  id: string;
  position: number;
  state: string;
  expression: string;
  speech_bubble?: boolean;
  is_player?: boolean;
  turn_indicator?: boolean;
  highlight_danger?: boolean;
  accessories?: string[];
}

interface Option {
  id: string;
  text: string;
  attribute: string;
  modifier: string;
  hint?: string;
  feat_highlight?: string;
  tags?: string[];
}

interface PlayerStatus {
  energy: number;
  energy_max: number;
  political_capital: number;
  reputation: number;
  active_feats: string[];
  used_feats: string[];
}

interface SceneData {
  scene: {
    id: string;
    background: string;
    mood: string;
    time?: string;
    characters: Character[];
  };
  dialogue: {
    speaker: string;
    text: string;
    tone?: string;
  };
  prompt: {
    text: string;
    options: Option[];
    allow_custom: boolean;
    custom_placeholder?: string;
  };
  player_status: PlayerStatus;
}

interface DiceResult {
  roll: number;
  modifier: number;
  total: number;
  dc: number;
  success: boolean;
  critical?: 'success' | 'failure';
}

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

// Sprite placeholder (em produção, carregar imagens reais)
const CharacterSprite: React.FC<{
  character: Character;
  slotIndex: number;
  totalSlots: number;
}> = ({ character, slotIndex, totalSlots }) => {
  const spriteColors: Record<string, string> = {
    marina: '#6B7280',
    caio: '#F59E0B',
    joao: '#3B82F6',
    player: '#10B981',
    geraldo_vp: '#7C3AED',
    patricia_hr: '#EC4899',
    thiago_rival: '#EF4444',
  };

  const expressionEmojis: Record<string, string> = {
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
  };

  const slotWidth = 100 / totalSlots;
  const leftPosition = slotIndex * slotWidth + slotWidth / 2;

  return (
    <div
      className="absolute bottom-4 transform -translate-x-1/2 flex flex-col items-center"
      style={{ left: `${leftPosition}%` }}
    >
      {/* Turn indicator */}
      {character.turn_indicator && (
        <div className="absolute -top-8 animate-bounce">
          <span className="text-2xl">👇</span>
        </div>
      )}
      
      {/* Danger highlight */}
      {character.highlight_danger && (
        <div className="absolute -top-6 animate-pulse">
          <span className="text-xl">⚠️</span>
        </div>
      )}
      
      {/* Speech bubble */}
      {character.speech_bubble && (
        <div className="absolute -top-6">
          <span className="text-xl">💬</span>
        </div>
      )}
      
      {/* Character avatar */}
      <div
        className={`
          w-16 h-16 rounded-lg flex items-center justify-center text-2xl
          border-4 ${character.is_player ? 'border-yellow-400 ring-2 ring-yellow-300' : 'border-gray-600'}
          ${character.turn_indicator ? 'animate-pulse' : ''}
        `}
        style={{ backgroundColor: spriteColors[character.id] || '#9CA3AF' }}
      >
        {expressionEmojis[character.expression] || expressionEmojis[character.state] || '😐'}
      </div>
      
      {/* Name tag */}
      <div className={`
        mt-1 px-2 py-0.5 rounded text-xs font-pixel
        ${character.is_player ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-white'}
      `}>
        {character.id === 'player' ? 'VOCÊ' : character.id.toUpperCase()}
      </div>
      
      {/* Accessories */}
      {character.accessories?.includes('typing_indicator') && (
        <div className="mt-1 flex gap-0.5">
          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
        </div>
      )}
    </div>
  );
};

// Background placeholder
const SceneBackground: React.FC<{ background: string; mood: string }> = ({ background, mood }) => {
  const backgroundStyles: Record<string, string> = {
    video_call: 'from-gray-800 to-gray-900',
    meeting_room: 'from-blue-900 to-gray-800',
    open_office: 'from-gray-700 to-blue-900',
    ceo_office: 'from-purple-900 to-gray-900',
    break_room: 'from-amber-900 to-gray-800',
    slack_dm: 'from-purple-800 to-gray-900',
    retro_room: 'from-red-900 to-gray-800',
  };

  const moodOverlays: Record<string, string> = {
    tense: 'bg-red-500/10',
    casual: 'bg-green-500/10',
    intimidating: 'bg-purple-500/20',
    neutral: '',
  };

  return (
    <div className={`
      absolute inset-0 bg-gradient-to-b ${backgroundStyles[background] || 'from-gray-800 to-gray-900'}
    `}>
      <div className={`absolute inset-0 ${moodOverlays[mood] || ''}`} />
      
      {/* Grid lines for video call */}
      {background === 'video_call' && (
        <div className="absolute inset-4 grid grid-cols-4 gap-2 opacity-30">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-gray-500 rounded" />
          ))}
        </div>
      )}
      
      {/* Decorative elements */}
      <div className="absolute top-2 left-2 text-xs text-gray-500 font-mono">
        {background.replace('_', ' ').toUpperCase()}
      </div>
    </div>
  );
};

// Dice roll animation
const DiceRoll: React.FC<{ result: DiceResult; onComplete: () => void }> = ({ result, onComplete }) => {
  const [phase, setPhase] = useState<'rolling' | 'result'>('rolling');
  const [displayNumber, setDisplayNumber] = useState(1);

  useEffect(() => {
    // Rolling animation
    const rollInterval = setInterval(() => {
      setDisplayNumber(Math.floor(Math.random() * 20) + 1);
    }, 50);

    // Stop after 1 second
    const stopTimeout = setTimeout(() => {
      clearInterval(rollInterval);
      setDisplayNumber(result.roll);
      setPhase('result');
    }, 1000);

    // Auto-close after showing result
    const closeTimeout = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearInterval(rollInterval);
      clearTimeout(stopTimeout);
      clearTimeout(closeTimeout);
    };
  }, [result, onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className={`
        p-8 rounded-xl text-center transform transition-all
        ${phase === 'rolling' ? 'scale-110 animate-pulse' : 'scale-100'}
        ${result.success ? 'bg-green-900' : 'bg-red-900'}
      `}>
        {/* Dice */}
        <div className={`
          w-24 h-24 mx-auto mb-4 rounded-xl flex items-center justify-center
          text-4xl font-bold border-4 bg-white text-black
          ${phase === 'rolling' ? 'animate-spin' : ''}
          ${result.critical === 'success' ? 'border-yellow-400 ring-4 ring-yellow-300' : ''}
          ${result.critical === 'failure' ? 'border-red-600 ring-4 ring-red-500' : ''}
        `}>
          {displayNumber}
        </div>

        {phase === 'result' && (
          <>
            {/* Calculation */}
            <div className="text-white text-lg mb-2">
              <span className="text-2xl font-bold">{result.roll}</span>
              <span className="mx-2">+</span>
              <span>{result.modifier}</span>
              <span className="mx-2">=</span>
              <span className="text-2xl font-bold">{result.total}</span>
              <span className="mx-2">vs DC</span>
              <span className="text-xl">{result.dc}</span>
            </div>

            {/* Result */}
            <div className={`
              text-2xl font-bold mt-4
              ${result.success ? 'text-green-400' : 'text-red-400'}
            `}>
              {result.critical === 'success' && '🎉 CRÍTICO! '}
              {result.critical === 'failure' && '💀 FALHA CRÍTICA! '}
              {!result.critical && (result.success ? '✅ SUCESSO!' : '❌ FALHA!')}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export const CorporateQuestScene: React.FC<{
  sceneData: SceneData;
  onAction: (action: { type: 'option' | 'custom'; value: string }) => void;
  onRollComplete?: (result: DiceResult) => void;
}> = ({ sceneData, onAction, onRollComplete }) => {
  const [customAction, setCustomAction] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showDice, setShowDice] = useState(false);
  const [diceResult, setDiceResult] = useState<DiceResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { scene, dialogue, prompt, player_status } = sceneData;

  // Handle option selection
  const handleOptionClick = (option: Option) => {
    setSelectedOption(option.id);
    
    // Simulate dice roll
    const roll = Math.floor(Math.random() * 20) + 1;
    const modifier = parseInt(option.modifier) || 0;
    const total = roll + modifier;
    const dc = 12; // Default DC, would come from game engine
    
    const result: DiceResult = {
      roll,
      modifier,
      total,
      dc,
      success: total >= dc,
      critical: roll === 20 ? 'success' : roll === 1 ? 'failure' : undefined,
    };
    
    setDiceResult(result);
    setShowDice(true);
  };

  // Handle custom action submit
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAction.trim()) {
      onAction({ type: 'custom', value: customAction.trim() });
      setCustomAction('');
    }
  };

  // Handle dice roll complete
  const handleDiceComplete = () => {
    setShowDice(false);
    if (diceResult && selectedOption) {
      onAction({ type: 'option', value: selectedOption });
      onRollComplete?.(diceResult);
    }
    setSelectedOption(null);
    setDiceResult(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-900 rounded-xl overflow-hidden shadow-2xl font-sans">
      
      {/* Dice Roll Overlay */}
      {showDice && diceResult && (
        <DiceRoll result={diceResult} onComplete={handleDiceComplete} />
      )}

      {/* Scene Canvas */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <SceneBackground background={scene.background} mood={scene.mood} />
        
        {/* Characters */}
        {scene.characters.map((char, index) => (
          <CharacterSprite
            key={char.id}
            character={char}
            slotIndex={index}
            totalSlots={scene.characters.length}
          />
        ))}
        
        {/* Time indicator */}
        {scene.time && (
          <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white font-mono">
            🕐 {scene.time}
          </div>
        )}
      </div>

      {/* Dialogue Box */}
      <div className="bg-gray-800 border-t-4 border-gray-700 p-4">
        <div className="flex items-start gap-3">
          <div className="font-bold text-yellow-400 uppercase text-sm">
            {dialogue.speaker}:
          </div>
          <div className="text-white flex-1">
            "{dialogue.text}"
          </div>
        </div>
      </div>

      {/* Action Prompt */}
      <div className="bg-gray-850 p-4 border-t border-gray-700">
        <div className="text-gray-300 mb-3 text-sm italic">
          {prompt.text}
        </div>

        {/* Options */}
        <div className="space-y-2 mb-4">
          {prompt.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option)}
              disabled={selectedOption !== null}
              className={`
                w-full text-left p-3 rounded-lg border-2 transition-all
                ${selectedOption === option.id 
                  ? 'border-yellow-400 bg-yellow-400/20' 
                  : 'border-gray-600 hover:border-gray-400 bg-gray-800 hover:bg-gray-750'
                }
                ${selectedOption !== null && selectedOption !== option.id ? 'opacity-50' : ''}
                disabled:cursor-not-allowed
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                    {option.id}
                  </span>
                  <span className="text-white">{option.text}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`
                    text-xs px-2 py-0.5 rounded
                    ${option.modifier.startsWith('+') && parseInt(option.modifier) >= 3 
                      ? 'bg-green-600 text-white' 
                      : option.modifier.startsWith('-')
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-600 text-gray-200'
                    }
                  `}>
                    {option.attribute} {option.modifier}
                  </span>
                  {option.feat_highlight && (
                    <span className="text-yellow-400">⚡</span>
                  )}
                  {option.hint === 'Seu ponto forte' && (
                    <span className="text-yellow-400">★</span>
                  )}
                </div>
              </div>
              {option.hint && (
                <div className="text-xs text-gray-400 mt-1 ml-8">
                  {option.hint}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Custom Action Input */}
        {prompt.allow_custom && (
          <form onSubmit={handleCustomSubmit} className="mt-4">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={customAction}
                onChange={(e) => setCustomAction(e.target.value)}
                placeholder={prompt.custom_placeholder || "Ou digite sua própria ação..."}
                disabled={selectedOption !== null}
                className="
                  flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2
                  text-white placeholder-gray-500
                  focus:outline-none focus:border-yellow-400
                  disabled:opacity-50
                "
              />
              <button
                type="submit"
                disabled={!customAction.trim() || selectedOption !== null}
                className="
                  px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg
                  hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              >
                Agir
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-950 px-4 py-3 flex items-center justify-between text-sm border-t border-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span>⚡</span>
            <span className="text-yellow-400 font-bold">
              {player_status.energy}/{player_status.energy_max}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>🏛️</span>
            <span className="text-blue-400 font-bold">
              PC: {player_status.political_capital}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span className={`font-bold ${
              player_status.reputation > 0 ? 'text-green-400' :
              player_status.reputation < 0 ? 'text-red-400' : 'text-gray-400'
            }`}>
              Rep: {player_status.reputation > 0 ? '+' : ''}{player_status.reputation}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {player_status.active_feats.map((feat) => (
            <span
              key={feat}
              className={`
                text-xs px-2 py-0.5 rounded
                ${player_status.used_feats.includes(feat)
                  ? 'bg-gray-700 text-gray-500 line-through'
                  : 'bg-yellow-600 text-white'
                }
              `}
            >
              {feat.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// EXEMPLO DE USO
// ============================================================

export const ExampleUsage: React.FC = () => {
  // Dados da cena de exemplo (viria do backend/LLM)
  const exampleSceneData: SceneData = {
    scene: {
      id: "daily_standup_001",
      background: "video_call",
      mood: "tense",
      time: "09:47",
      characters: [
        {
          id: "marina",
          position: 0,
          state: "talking",
          expression: "frustrated",
          speech_bubble: true,
        },
        {
          id: "joao",
          position: 1,
          state: "idle",
          expression: "nervous",
        },
        {
          id: "caio",
          position: 2,
          state: "typing",
          expression: "excited",
          highlight_danger: true,
          accessories: ["typing_indicator"],
        },
        {
          id: "player",
          position: 3,
          state: "listening",
          expression: "thinking",
          is_player: true,
          turn_indicator: true,
        },
      ],
    },
    dialogue: {
      speaker: "Marina",
      text: "...débito técnico que pode explodir se o volume subir.",
      tone: "warning",
    },
    prompt: {
      text: "Todo mundo olha pra você. É sua vez.",
      options: [
        {
          id: "A",
          text: "Perguntar detalhes técnicos pra Marina",
          attribute: "TEC",
          modifier: "+3",
          hint: "Seu ponto forte",
          tags: ["technical"],
        },
        {
          id: "B",
          text: "Acalmar Caio antes que espalhe pânico",
          attribute: "INF",
          modifier: "+1",
          tags: ["social"],
        },
        {
          id: "C",
          text: "Minimizar e seguir a daily",
          attribute: "INF",
          modifier: "+1",
          hint: "Risco: problema continua",
          tags: ["avoidance"],
        },
        {
          id: "D",
          text: "Pedir números concretos",
          attribute: "AWA",
          modifier: "-1",
          hint: "Ativa seu feat!",
          feat_highlight: "data_driven",
        },
      ],
      allow_custom: true,
      custom_placeholder: "Ou descreva sua própria ação...",
    },
    player_status: {
      energy: 10,
      energy_max: 10,
      political_capital: 3,
      reputation: 0,
      active_feats: ["data_driven", "forced_alignment"],
      used_feats: [],
    },
  };

  const handleAction = (action: { type: 'option' | 'custom'; value: string }) => {
    console.log('Ação do jogador:', action);
    // Aqui enviaria para o backend/LLM processar
  };

  const handleRollComplete = (result: DiceResult) => {
    console.log('Resultado do dado:', result);
    // Aqui atualizaria o estado do jogo
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 flex items-center justify-center">
      <CorporateQuestScene
        sceneData={exampleSceneData}
        onAction={handleAction}
        onRollComplete={handleRollComplete}
      />
    </div>
  );
};

export default CorporateQuestScene;
