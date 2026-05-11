import { useState, useEffect, useMemo } from 'react';
import { useGame } from '@/game/GameContext';
import { createCharacter } from '@/game/character';
import { CLASSES, BACKGROUNDS, ALIGNMENTS, ALIGNMENT_TRANSLATIONS, SUGGESTED_ARRAYS, FREE_POINTS, ATTRIBUTE_NAMES, FEATS } from '@/game/gameData';
import { getModifier } from '@/game/dice';
import type { ClassName, BackgroundName, Alignment, Attributes, Feat } from '@/game/types';

const steps = ['Nome', 'Classe', 'Origem', 'Tendência', 'Atributos', 'Habilidade', 'Resumo'];

export default function OnboardingWizard() {
  const { setCharacter, setScreen, setEncounter, clearMessages, clearDiceLog } = useGame();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassName | null>(null);
  const [selectedBg, setSelectedBg] = useState<BackgroundName | null>(null);
  const [selectedAlignment, setSelectedAlignment] = useState<Alignment | null>(null);
  const [bonusPoints, setBonusPoints] = useState<Record<string, number>>({
    EXE: 0, INF: 0, TEC: 0, RES: 0, CRE: 0, AWA: 0,
  });
  const [selectedFeat, setSelectedFeat] = useState<Feat | null>(null);
  const [focusIdx, setFocusIdx] = useState(0);

  const totalBonusUsed = Object.values(bonusPoints).reduce((a, b) => a + b, 0);
  const bonusRemaining = FREE_POINTS - totalBonusUsed;

  const baseAttributes = selectedClass ? SUGGESTED_ARRAYS[selectedClass] : null;

  const classData = selectedClass ? CLASSES.find(c => c.name === selectedClass) : null;
  const bgData = selectedBg ? BACKGROUNDS.find(b => b.name === selectedBg) : null;

  const getEffectiveValue = (attr: string) => {
    if (!baseAttributes) return null;
    const base = baseAttributes[attr as keyof Attributes];
    const bonus = bonusPoints[attr] || 0;
    let val = base + bonus;
    if (classData?.bonuses[attr as keyof Attributes]) val += classData.bonuses[attr as keyof Attributes]!;
    if (bgData?.attributeBonus[attr as keyof Attributes]) val += bgData.attributeBonus[attr as keyof Attributes]!;
    return val;
  };

  const canNext = () => {
    switch (step) {
      case 0: return name.trim().length >= 2;
      case 1: return !!selectedClass;
      case 2: return !!selectedBg;
      case 3: return !!selectedAlignment;
      case 4: return !!baseAttributes && bonusRemaining === 0;
      case 5: return !!selectedFeat;
      default: return true;
    }
  };

  const availableFeats = FEATS.filter(f => !f.classes || (selectedClass && f.classes.includes(selectedClass)));

  // Items in the current step (for keyboard navigation)
  const stepItems = useMemo(() => {
    switch (step) {
      case 1: return CLASSES.map(c => ({ key: c.name, action: () => { setSelectedClass(c.name); setTimeout(() => { setStep(2); setFocusIdx(0); }, 200); } }));
      case 2: return BACKGROUNDS.map(b => ({ key: b.name, action: () => { setSelectedBg(b.name); setTimeout(() => { setStep(3); setFocusIdx(0); }, 200); } }));
      case 3: return ALIGNMENTS.map(a => ({ key: a.alignment, action: () => { setSelectedAlignment(a.alignment); setTimeout(() => { setStep(4); setFocusIdx(0); }, 200); } }));
      case 5: return availableFeats.map(f => ({ key: f.name, action: () => { setSelectedFeat(f); setTimeout(() => { setStep(6); setFocusIdx(0); }, 200); } }));
      default: return [];
    }
  }, [step, availableFeats]);

  // Reset focus when step changes
  useEffect(() => { setFocusIdx(0); }, [step]);

  // Keyboard handler: arrows navigate, Enter confirms/advances
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

      // Step 0 (name input): Enter advances if valid
      if (step === 0) {
        if (e.key === 'Enter' && canNext()) { e.preventDefault(); setStep(1); }
        return;
      }

      // Don't intercept arrows/enter if user is typing somewhere
      if (isTyping) return;

      // Card-grid steps (1, 2, 3, 5)
      if (stepItems.length > 0) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          setFocusIdx(i => (i + 1) % stepItems.length);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          setFocusIdx(i => (i <= 0 ? stepItems.length - 1 : i - 1));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          stepItems[focusIdx]?.action();
        }
        return;
      }

      // Steps 4 (attributes) and 6 (summary): Enter advances/finishes
      if (e.key === 'Enter' && canNext()) {
        e.preventDefault();
        if (step === steps.length - 1) handleFinish();
        else setStep(step + 1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [step, stepItems, focusIdx, name, baseAttributes, selectedFeat]);

  const handleFinish = () => {
    if (!baseAttributes) return;
    const attrs: Attributes = {
      EXE: baseAttributes.EXE + (bonusPoints.EXE || 0),
      INF: baseAttributes.INF + (bonusPoints.INF || 0),
      TEC: baseAttributes.TEC + (bonusPoints.TEC || 0),
      RES: baseAttributes.RES + (bonusPoints.RES || 0),
      CRE: baseAttributes.CRE + (bonusPoints.CRE || 0),
      AWA: baseAttributes.AWA + (bonusPoints.AWA || 0),
    };
    const char = createCharacter(name, selectedClass!, selectedBg!, selectedAlignment!, attrs, [selectedFeat!]);
    // Fresh journey: wipe any leftover encounter/messages/dice from a previous session
    setEncounter(null);
    clearMessages();
    clearDiceLog();
    setCharacter(char);
    setScreen('game');
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Slim bar ── */}
      <div className="slim-bar">
        <span className="crumb">~/onboarding/<b>{steps[step].toLowerCase()}</b></span>
        <span style={{ color: 'var(--fg-dim)' }}>{step + 1}/{steps.length}</span>
      </div>

      {/* ── Progress dots ── */}
      <div style={{ padding: '12px 20px 0', borderBottom: '1px solid var(--rule)' }}>
        <div className="progress-dots" style={{ maxWidth: '640px', margin: '0 auto' }}>
          {steps.map((_, i) => (
            <div
              key={i}
              className={`dot${i < step ? ' done' : i === step ? ' active' : ''}`}
            />
          ))}
        </div>
        <div style={{ display: 'flex', maxWidth: '640px', margin: '6px auto 10px', gap: '0' }}>
          {steps.map((s, i) => (
            <div key={s} style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', letterSpacing: '0.1em', textTransform: 'uppercase', color: i === step ? 'var(--warn)' : 'var(--fg-faint)' }}>
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Step content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

          {/* Step 0: Name */}
          {step === 0 && (
            <div style={{ textAlign: 'center', paddingTop: '32px' }}>
              <p className="pixel-h" style={{ fontSize: 'var(--fs-h4)', marginBottom: '16px' }}>Bem-vindo</p>
              <p style={{ color: 'var(--fg-dim)', marginBottom: '28px', fontSize: '15px' }}>Primeiro dia no novo emprego. Como vão te chamar?</p>
              <div className="input-line" style={{ maxWidth: '360px', margin: '0 auto 16px' }}>
                <span className="prompt">$</span>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="seu nome corporativo..."
                  autoFocus
                  style={{ textAlign: 'left', fontSize: '16px' }}
                />
                {name && <span className="cur" />}
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--fg-faint)', fontStyle: 'italic' }}>
                "Prefira algo que caiba num crachá."
              </p>
            </div>
          )}

          {/* Step 1: Class */}
          {step === 1 && (
            <div>
              <p className="pixel-h" style={{ fontSize: 'var(--fs-h4)', textAlign: 'center', marginBottom: '8px' }}>Classe</p>
              <p style={{ color: 'var(--fg-dim)', textAlign: 'center', marginBottom: '20px', fontSize: '14px' }}>Qual é a sua função nessa empresa?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {CLASSES.map((cls, idx) => (
                  <button
                    key={cls.name}
                    className={`sel-card${selectedClass === cls.name ? ' sel-selected' : ''}${focusIdx === idx ? ' sel-focused' : ''}`}
                    onClick={() => { setSelectedClass(cls.name); setTimeout(() => { setStep(2); setFocusIdx(0); }, 200); }}
                    onMouseEnter={() => setFocusIdx(idx)}
                  >
                    <span className="sel-icon">{cls.icon}</span>
                    <span className="sel-title">{cls.name}</span>
                    <span className="sel-sub">≈ {cls.equivalent} do D&D</span>
                    <span className="sel-desc">"{cls.flavor}"</span>
                    <span className="sel-tag">primário: {cls.primaryAttribute} · bônus: {Object.entries(cls.bonuses).map(([k, v]) => `+${v}${k}`).join(' ')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Background */}
          {step === 2 && (
            <div>
              <p className="pixel-h" style={{ fontSize: 'var(--fs-h4)', textAlign: 'center', marginBottom: '8px' }}>Origem</p>
              <p style={{ color: 'var(--fg-dim)', textAlign: 'center', marginBottom: '20px', fontSize: '14px' }}>De onde você veio antes desse emprego?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {BACKGROUNDS.map((bg, idx) => (
                  <button
                    key={bg.name}
                    className={`sel-card${selectedBg === bg.name ? ' sel-selected' : ''}${focusIdx === idx ? ' sel-focused' : ''}`}
                    onClick={() => { setSelectedBg(bg.name); setTimeout(() => { setStep(3); setFocusIdx(0); }, 200); }}
                    onMouseEnter={() => setFocusIdx(idx)}
                  >
                    <span className="sel-title">{bg.name}</span>
                    <span className="sel-desc">"{bg.description}"</span>
                    <span className="sel-tag">{bg.bonus}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Alignment */}
          {step === 3 && (
            <div>
              <p className="pixel-h" style={{ fontSize: 'var(--fs-h4)', textAlign: 'center', marginBottom: '8px' }}>Tendência</p>
              <p style={{ color: 'var(--fg-dim)', textAlign: 'center', marginBottom: '20px', fontSize: '14px' }}>Como você joga o jogo corporativo?</p>
              <div className="grid grid-cols-3 gap-2">
                {ALIGNMENTS.map((a, idx) => (
                  <button
                    key={a.alignment}
                    className={`sel-card${selectedAlignment === a.alignment ? ' sel-selected' : ''}${focusIdx === idx ? ' sel-focused' : ''}`}
                    style={{ textAlign: 'center' }}
                    onClick={() => { setSelectedAlignment(a.alignment); setTimeout(() => { setStep(4); setFocusIdx(0); }, 200); }}
                    onMouseEnter={() => setFocusIdx(idx)}
                  >
                    <span className="sel-title" style={{ display: 'block' }}>{a.alignment}</span>
                    <span className="sel-desc" style={{ display: 'block' }}>
                      "{selectedClass && ALIGNMENT_TRANSLATIONS[selectedClass]?.[a.alignment]
                        ? ALIGNMENT_TRANSLATIONS[selectedClass][a.alignment]
                        : a.translation}"
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Attributes */}
          {step === 4 && baseAttributes && (
            <div>
              <p className="pixel-h" style={{ fontSize: 'var(--fs-h4)', textAlign: 'center', marginBottom: '8px' }}>Atributos</p>
              <p style={{ color: 'var(--fg-dim)', textAlign: 'center', marginBottom: '20px', fontSize: '14px' }}>
                Distribua{' '}
                <span style={{ color: bonusRemaining === 0 ? 'var(--ok)' : 'var(--warn)', fontWeight: 600 }}>
                  {bonusRemaining}
                </span>
                {' '}ponto{bonusRemaining !== 1 ? 's' : ''} bônus.
              </p>
              <div style={{ maxWidth: '520px', margin: '0 auto' }}>
                {ATTRIBUTE_NAMES.map(attr => {
                  const base = baseAttributes[attr.key as keyof Attributes];
                  const bonus = bonusPoints[attr.key] || 0;
                  const eff = getEffectiveValue(attr.key);
                  const isPrimary = classData?.primaryAttribute === attr.key;
                  return (
                    <div key={attr.key} className={`attr-bonus-row${isPrimary ? ' primary-attr' : ''}`}>
                      <div className="abr-key">
                        <strong>{attr.abbr}</strong>
                        <small>{attr.name}</small>
                      </div>
                      <div className="abr-base">{base}</div>
                      <div className="abr-ctrl">
                        <button
                          type="button"
                          className="abr-btn"
                          disabled={bonus <= 0}
                          onClick={() => setBonusPoints(prev => ({ ...prev, [attr.key]: prev[attr.key] - 1 }))}
                        >−</button>
                        <span className="abr-delta">{bonus > 0 ? `+${bonus}` : '0'}</span>
                        <button
                          type="button"
                          className="abr-btn"
                          disabled={bonusRemaining <= 0 || bonus >= 2}
                          onClick={() => setBonusPoints(prev => ({ ...prev, [attr.key]: prev[attr.key] + 1 }))}
                        >+</button>
                      </div>
                      <div className="abr-total">
                        {eff !== null && (
                          <><span>{eff}</span>{' '}<span className="abr-mod">({getModifier(eff) >= 0 ? '+' : ''}{getModifier(eff)})</span></>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {classData && (
                <p className="meta" style={{ textAlign: 'center', marginTop: '12px' }}>
                  Bônus de classe: {Object.entries(classData.bonuses).map(([k, v]) => `+${v} ${k}`).join(', ')}
                  {bgData && <> · Origem: {Object.entries(bgData.attributeBonus).map(([k, v]) => `+${v} ${k}`).join(', ')}</>}
                </p>
              )}
            </div>
          )}

          {/* Step 5: Feat */}
          {step === 5 && (
            <div>
              <p className="pixel-h" style={{ fontSize: 'var(--fs-h4)', textAlign: 'center', marginBottom: '8px' }}>Habilidade</p>
              <p style={{ color: 'var(--fg-dim)', textAlign: 'center', marginBottom: '20px', fontSize: '14px' }}>Escolha uma habilidade inicial</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {availableFeats.map((feat, idx) => (
                  <button
                    key={feat.name}
                    className={`sel-card${selectedFeat?.name === feat.name ? ' sel-selected' : ''}${focusIdx === idx ? ' sel-focused' : ''}`}
                    onClick={() => { setSelectedFeat(feat); setTimeout(() => { setStep(6); setFocusIdx(0); }, 200); }}
                    onMouseEnter={() => setFocusIdx(idx)}
                  >
                    <span className="sel-title">{feat.name}</span>
                    <span className="sel-desc">{feat.description}</span>
                    <span className="sel-tag">{feat.effect}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Summary */}
          {step === 6 && (
            <div style={{ textAlign: 'center' }}>
              <p className="pixel-h" style={{ fontSize: 'var(--fs-h4)', marginBottom: '24px' }}>Sua Ficha</p>
              <div className="summary-card">
                <p className="sum-name">{name}</p>
                <p className="sum-sub">{selectedClass} · {selectedBg} · {selectedAlignment}</p>

                <div className="attr-grid" style={{ marginBottom: '16px' }}>
                  {ATTRIBUTE_NAMES.map(attr => {
                    const eff = getEffectiveValue(attr.key);
                    return (
                      <div key={attr.key} className="attr">
                        <p className="abbr">{attr.abbr}</p>
                        <p className="v">{eff}</p>
                        <p className="mod">{getModifier(eff!) >= 0 ? '+' : ''}{getModifier(eff!)}</p>
                      </div>
                    );
                  })}
                </div>

                {classData && (
                  <div style={{ borderTop: '1px solid var(--rule)', paddingTop: '12px', marginBottom: '12px' }}>
                    <p className="side-label" style={{ marginBottom: '6px' }}>Recursos</p>
                    <p style={{ color: 'var(--fg-dim)', fontSize: '13px' }}>
                      ⚡ Energia: {classData.resources.energy} · 🏛 Cap. Político: {classData.resources.politicalCapital}
                    </p>
                  </div>
                )}

                {selectedFeat && (
                  <div style={{ borderTop: '1px solid var(--rule)', paddingTop: '12px' }}>
                    <p className="side-label" style={{ marginBottom: '4px' }}>Habilidade</p>
                    <p style={{ color: 'var(--fg)', fontSize: '14px', fontWeight: 600 }}>{selectedFeat.name}</p>
                    <p style={{ color: 'var(--fg-dim)', fontSize: '13px', marginTop: '4px' }}>{selectedFeat.effect}</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Nav buttons ── */}
      <div style={{ borderTop: '1px solid var(--rule)', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
        <button
          className="btn ghost"
          style={{ minWidth: '100px' }}
          onClick={() => step > 0 ? setStep(step - 1) : setScreen('home')}
        >
          ← VOLTAR
        </button>
        {step < steps.length - 1 ? (
          <button
            className="btn"
            style={{ minWidth: '120px' }}
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
          >
            PRÓXIMO →
          </button>
        ) : (
          <button
            className="press-start"
            style={{ fontSize: '11px' }}
            onClick={handleFinish}
          >
            ▶ COMEÇAR
          </button>
        )}
      </div>
    </div>
  );
}
