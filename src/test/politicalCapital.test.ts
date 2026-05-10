import { describe, it, expect } from 'vitest';
import {
  calculateSessionPC,
  calculateSlots,
  calculateCarryOverLimit,
  canEquipBonus,
  getAvailableBonuses,
  getTendency,
  applyLoadout,
  applySessionStartEffects,
  onRoll,
  consumeBonus,
  applyExecutiveSponsor,
  applyClutchMoment,
  onSessionEnd,
  BONUSES,
  getBonusById,
} from '../game/politicalCapital';
import type { Character, CheckResult, LoadoutState } from '../game/types';

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    name: 'Test',
    className: 'PM',
    background: 'Startup Survivor',
    alignment: 'True Neutral',
    attributes: { EXE: 10, INF: 12, TEC: 8, RES: 10, CRE: 10, AWA: 10 },
    resources: { energy: 10, maxEnergy: 10, politicalCapital: 5, reputation: 0, xp: 0, level: 1 },
    feats: [],
    inventory: [],
    level: 8,
    tendency: 'neutral',
    ...overrides,
  };
}

function makeResult(overrides: Partial<CheckResult> = {}): CheckResult {
  return {
    roll: 10,
    modifier: 1,
    bonus: 0,
    total: 11,
    dc: 12,
    success: false,
    critical: null,
    advantage: false,
    disadvantage: false,
    ...overrides,
  };
}

// ── Economy ───────────────────────────────────────────────────────────────────

describe('calculateSessionPC', () => {
  it.each([
    [1, 3], [4, 3],
    [5, 4], [9, 4],
    [10, 5], [14, 5],
    [15, 6], [19, 6],
    [20, 7],
  ])('level %i → %i PC', (level, expected) => {
    expect(calculateSessionPC(level)).toBe(expected);
  });
});

describe('calculateSlots', () => {
  it('level 1-10 → 1 slot', () => {
    expect(calculateSlots(1)).toBe(1);
    expect(calculateSlots(10)).toBe(1);
  });
  it('level 11-30 → 2 slots', () => {
    expect(calculateSlots(11)).toBe(2);
    expect(calculateSlots(30)).toBe(2);
  });
  it('level 31+ → 3 slots', () => {
    expect(calculateSlots(31)).toBe(3);
    expect(calculateSlots(50)).toBe(3);
  });
});

describe('calculateCarryOverLimit', () => {
  it('level 1-10 → no carry over', () => {
    expect(calculateCarryOverLimit(1)).toBe(0);
    expect(calculateCarryOverLimit(10)).toBe(0);
  });
  it('level 11-30 → max 3', () => {
    expect(calculateCarryOverLimit(11)).toBe(3);
    expect(calculateCarryOverLimit(30)).toBe(3);
  });
  it('level 31+ → max 5', () => {
    expect(calculateCarryOverLimit(31)).toBe(5);
  });
});

// ── getTendency ───────────────────────────────────────────────────────────────

describe('getTendency', () => {
  it('Good alignments → ethical', () => {
    expect(getTendency('Lawful Good')).toBe('ethical');
    expect(getTendency('Neutral Good')).toBe('ethical');
    expect(getTendency('Chaotic Good')).toBe('ethical');
  });

  it('Evil alignments → unethical', () => {
    expect(getTendency('Lawful Evil')).toBe('unethical');
    expect(getTendency('Neutral Evil')).toBe('unethical');
    expect(getTendency('Chaotic Evil')).toBe('unethical');
  });

  it('Neutral and True Neutral → neutral', () => {
    expect(getTendency('True Neutral')).toBe('neutral');
    expect(getTendency('Lawful Neutral')).toBe('neutral');
    expect(getTendency('Chaotic Neutral')).toBe('neutral');
  });
});

// ── Tendency ──────────────────────────────────────────────────────────────────

describe('canEquipBonus', () => {
  const minor = getBonusById('MINOR_EDGE')!;
  const rumor = getBonusById('RUMOR_MILL')!;
  const dirt = getBonusById('DIRT_FILE')!;
  const auto = getBonusById('AUTO_SUCCESS')!;
  const smallTalk = getBonusById('SMALL_TALK_PREP')!;

  it('MINOR_EDGE is available to all tendencies', () => {
    expect(canEquipBonus(minor, 'ethical')).toBe(true);
    expect(canEquipBonus(minor, 'neutral')).toBe(true);
    expect(canEquipBonus(minor, 'unethical')).toBe(true);
  });

  it('RUMOR_MILL is neutral/unethical only', () => {
    expect(canEquipBonus(rumor, 'ethical')).toBe(false);
    expect(canEquipBonus(rumor, 'neutral')).toBe(true);
    expect(canEquipBonus(rumor, 'unethical')).toBe(true);
  });

  it('DIRT_FILE is unethical only', () => {
    expect(canEquipBonus(dirt, 'ethical')).toBe(false);
    expect(canEquipBonus(dirt, 'neutral')).toBe(false);
    expect(canEquipBonus(dirt, 'unethical')).toBe(true);
  });

  it('AUTO_SUCCESS is unethical only', () => {
    expect(canEquipBonus(auto, 'ethical')).toBe(false);
    expect(canEquipBonus(auto, 'neutral')).toBe(false);
    expect(canEquipBonus(auto, 'unethical')).toBe(true);
  });

  it('SMALL_TALK_PREP is not available to unethical', () => {
    expect(canEquipBonus(smallTalk, 'unethical')).toBe(false);
  });
});

describe('getAvailableBonuses', () => {
  it('neutral has more options than ethical', () => {
    const neutral = getAvailableBonuses('neutral');
    const ethical = getAvailableBonuses('ethical');
    expect(neutral.length).toBeGreaterThan(ethical.length);
  });

  it('neutral excludes DIRT_FILE, BLAME_SHIFT, AUTO_SUCCESS', () => {
    const neutral = getAvailableBonuses('neutral');
    const ids = neutral.map(b => b.id);
    expect(ids).not.toContain('DIRT_FILE');
    expect(ids).not.toContain('BLAME_SHIFT');
    expect(ids).not.toContain('AUTO_SUCCESS');
  });

  it('unethical excludes SMALL_TALK_PREP, MEETING_NOTES, MAJOR_EDGE, EXECUTIVE_SPONSOR', () => {
    const unethical = getAvailableBonuses('unethical');
    const ids = unethical.map(b => b.id);
    expect(ids).not.toContain('SMALL_TALK_PREP');
    expect(ids).not.toContain('MEETING_NOTES');
    expect(ids).not.toContain('MAJOR_EDGE');
    expect(ids).not.toContain('EXECUTIVE_SPONSOR');
  });
});

// ── applyLoadout ──────────────────────────────────────────────────────────────

describe('applyLoadout', () => {
  it('creates loadout and deducts PC', () => {
    const char = makeCharacter({ resources: { energy: 10, maxEnergy: 10, politicalCapital: 5, reputation: 0, xp: 0, level: 1 } });
    const minor = getBonusById('MINOR_EDGE')!;
    const loadout = applyLoadout(char, [minor]);
    expect(loadout.politicalCapitalRemaining).toBe(3); // 5 - 2
    expect(loadout.activeBonuses).toHaveLength(1);
    expect(loadout.activeBonuses[0].bonus.id).toBe('MINOR_EDGE');
    expect(loadout.activeBonuses[0].usesRemaining).toBeNull(); // passive
  });

  it('active bonuses have usesRemaining set', () => {
    const char = makeCharacter({ resources: { energy: 10, maxEnergy: 10, politicalCapital: 5, reputation: 0, xp: 0, level: 1 } });
    const meeting = getBonusById('MEETING_NOTES')!;
    const loadout = applyLoadout(char, [meeting]);
    expect(loadout.activeBonuses[0].usesRemaining).toBe(2);
  });

  it('throws on PC overflow', () => {
    const char = makeCharacter({ resources: { energy: 10, maxEnergy: 10, politicalCapital: 1, reputation: 0, xp: 0, level: 1 } });
    const minor = getBonusById('MINOR_EDGE')!; // cost 2
    expect(() => applyLoadout(char, [minor])).toThrow('PC insuficiente');
  });

  it('throws on slot overflow', () => {
    const char = makeCharacter({ level: 5 }); // 1 slot
    const minor = getBonusById('MINOR_EDGE')!;
    const coffee = getBonusById('COFFEE_BOOST')!;
    expect(() => applyLoadout(char, [minor, coffee])).toThrow('Slots insuficientes');
  });

  it('throws on tendency mismatch', () => {
    const char = makeCharacter({ tendency: 'ethical' });
    const dirt = getBonusById('DIRT_FILE')!;
    expect(() => applyLoadout(char, [dirt])).toThrow('Tendência ethical não permite DIRT_FILE');
  });

  it('throws when MINOR_EDGE and MAJOR_EDGE are combined', () => {
    const char = makeCharacter({ level: 15 }); // 2 slots
    const minor = getBonusById('MINOR_EDGE')!;
    const major = getBonusById('MAJOR_EDGE')!;
    expect(() => applyLoadout(char, [minor, major])).toThrow('MINOR_EDGE não pode ser combinado com MAJOR_EDGE');
  });

  it('derives tendency from alignment when tendency field is absent', () => {
    const char: Character = { ...makeCharacter({ tendency: undefined }), alignment: 'Lawful Evil' };
    const dirt = getBonusById('DIRT_FILE')!; // unethical only
    const loadout = applyLoadout(char, [dirt]);
    expect(loadout.tendency).toBe('unethical');
  });

  it('includes carry over in available PC', () => {
    const char = makeCharacter({ resources: { energy: 10, maxEnergy: 10, politicalCapital: 1, reputation: 0, xp: 0, level: 1 } });
    const minor = getBonusById('MINOR_EDGE')!; // cost 2
    const loadout = applyLoadout(char, [minor], 1); // 1 + 1 carry = 2
    expect(loadout.politicalCapitalRemaining).toBe(0);
  });
});

// ── applySessionStartEffects ──────────────────────────────────────────────────

describe('applySessionStartEffects', () => {
  it('COFFEE_BOOST increases maxEnergy by 2', () => {
    const char = makeCharacter();
    const coffee = getBonusById('COFFEE_BOOST')!;
    const loadout = applyLoadout(char, [coffee]);
    const updated = applySessionStartEffects(char, loadout);
    expect(updated.resources.maxEnergy).toBe(12);
    expect(updated.resources.energy).toBe(12);
  });

  it('unethical tendency grants +1 PC', () => {
    const char = makeCharacter({ tendency: 'unethical', resources: { energy: 10, maxEnergy: 10, politicalCapital: 5, reputation: 0, xp: 0, level: 1 } });
    const early = getBonusById('EARLY_BIRD')!; // cost 1
    const loadout = applyLoadout(char, [early]);
    const updated = applySessionStartEffects(char, loadout);
    expect(updated.resources.politicalCapital).toBe(5); // 5 - 1 + 1
  });
});

// ── onRoll ────────────────────────────────────────────────────────────────────

describe('onRoll — passive bonuses', () => {
  function loadoutWith(bonusIds: string[]): LoadoutState {
    const char = makeCharacter({ level: 15 }); // 2 slots, enough PC
    const bonuses = bonusIds.map(id => getBonusById(id)!);
    return applyLoadout(char, bonuses);
  }

  it('MINOR_EDGE adds +1 to every roll', () => {
    const loadout = loadoutWith(['MINOR_EDGE']);
    const result = makeResult({ total: 11, bonus: 0 });
    const { result: r } = onRoll(result, loadout);
    expect(r.total).toBe(12);
    expect(r.bonus).toBe(1);
  });

  it('MAJOR_EDGE adds +2 to every roll', () => {
    const loadout = loadoutWith(['MAJOR_EDGE']);
    const result = makeResult({ total: 11, bonus: 0 });
    const { result: r } = onRoll(result, loadout);
    expect(r.total).toBe(13);
    expect(r.bonus).toBe(2);
  });

  it('EARLY_BIRD adds +1 on first roll only', () => {
    const loadout = loadoutWith(['EARLY_BIRD']);
    const result = makeResult({ total: 11 });

    const { result: r1, loadout: l1 } = onRoll(result, loadout);
    expect(r1.total).toBe(12);
    expect(l1.isFirstRollDone).toBe(true);

    const { result: r2 } = onRoll(result, l1);
    expect(r2.total).toBe(11); // no bonus on second roll
  });

  it('SAFETY_NET auto-triggers on nat 1 and consumes use', () => {
    const char = makeCharacter({ tendency: 'neutral', resources: { energy: 10, maxEnergy: 10, politicalCapital: 5, reputation: 0, xp: 0, level: 1 } });
    const safety = getBonusById('SAFETY_NET')!;
    const loadout = applyLoadout(char, [safety]);

    const nat1 = makeResult({ roll: 1, critical: 'failure', success: false, total: 2, dc: 15 });
    const { result: r, loadout: l } = onRoll(nat1, loadout);

    expect(r.critical).toBeNull(); // critical failure downgraded
    expect(r.success).toBe(false); // still fails (total < dc)
    expect(l.activeBonuses[0].usesRemaining).toBe(0); // consumed
  });

  it('SAFETY_NET does not trigger on non-nat-1 rolls', () => {
    const char = makeCharacter({ tendency: 'neutral', resources: { energy: 10, maxEnergy: 10, politicalCapital: 5, reputation: 0, xp: 0, level: 1 } });
    const safety = getBonusById('SAFETY_NET')!;
    const loadout = applyLoadout(char, [safety]);

    const normalFail = makeResult({ roll: 5, critical: null, success: false });
    const { loadout: l } = onRoll(normalFail, loadout);
    expect(l.activeBonuses[0].usesRemaining).toBe(1); // not consumed
  });

  it('SAFETY_NET does not trigger if already used', () => {
    const char = makeCharacter({ tendency: 'neutral', resources: { energy: 10, maxEnergy: 10, politicalCapital: 5, reputation: 0, xp: 0, level: 1 } });
    const safety = getBonusById('SAFETY_NET')!;
    const loadout = applyLoadout(char, [safety]);

    const nat1 = makeResult({ roll: 1, critical: 'failure', success: false, total: 2, dc: 15 });
    const { loadout: l1 } = onRoll(nat1, loadout);
    const { result: r2 } = onRoll(nat1, l1);
    expect(r2.critical).toBe('failure'); // still critical, no more safety net
  });
});

// ── consumeBonus ──────────────────────────────────────────────────────────────

describe('consumeBonus', () => {
  it('decrements uses by 1', () => {
    const char = makeCharacter({ resources: { energy: 10, maxEnergy: 10, politicalCapital: 5, reputation: 0, xp: 0, level: 1 } });
    const meeting = getBonusById('MEETING_NOTES')!; // 2 uses
    const loadout = applyLoadout(char, [meeting]);
    const l1 = consumeBonus(loadout, 'MEETING_NOTES');
    expect(l1.activeBonuses[0].usesRemaining).toBe(1);
    const l2 = consumeBonus(l1, 'MEETING_NOTES');
    expect(l2.activeBonuses[0].usesRemaining).toBe(0);
  });

  it('throws when no uses remain', () => {
    const char = makeCharacter({ resources: { energy: 10, maxEnergy: 10, politicalCapital: 5, reputation: 0, xp: 0, level: 1 } });
    const second = getBonusById('SECOND_WIND')!; // 1 use
    const loadout = applyLoadout(char, [second]);
    const l1 = consumeBonus(loadout, 'SECOND_WIND');
    expect(() => consumeBonus(l1, 'SECOND_WIND')).toThrow('não tem usos restantes');
  });

  it('does not consume passive bonuses', () => {
    const char = makeCharacter({ resources: { energy: 10, maxEnergy: 10, politicalCapital: 5, reputation: 0, xp: 0, level: 1 } });
    const minor = getBonusById('MINOR_EDGE')!;
    const loadout = applyLoadout(char, [minor]);
    const l = consumeBonus(loadout, 'MINOR_EDGE');
    expect(l.activeBonuses[0].usesRemaining).toBeNull();
  });
});

// ── applyExecutiveSponsor ────────────────────────────────────────────────────

describe('applyExecutiveSponsor', () => {
  it('adds +6 to total after roll and consumes use', () => {
    const char = makeCharacter({ tendency: 'ethical', resources: { energy: 10, maxEnergy: 10, politicalCapital: 5, reputation: 0, xp: 0, level: 1 } });
    const exec = getBonusById('EXECUTIVE_SPONSOR')!;
    const loadout = applyLoadout(char, [exec]);
    const result = makeResult({ total: 9, dc: 15, success: false });
    const { result: r, loadout: l } = applyExecutiveSponsor(result, loadout);
    expect(r.total).toBe(15);
    expect(r.success).toBe(true);
    expect(l.activeBonuses[0].usesRemaining).toBe(0);
  });

  it('throws if EXECUTIVE_SPONSOR not in loadout', () => {
    const char = makeCharacter();
    const minor = getBonusById('MINOR_EDGE')!;
    const loadout = applyLoadout(char, [minor]);
    expect(() => applyExecutiveSponsor(makeResult(), loadout)).toThrow('EXECUTIVE_SPONSOR não disponível');
  });
});

// ── applyClutchMoment ─────────────────────────────────────────────────────────

describe('applyClutchMoment', () => {
  it('converts failure to success when missed by ≤3', () => {
    const char = makeCharacter({ tendency: 'ethical', resources: { energy: 10, maxEnergy: 10, politicalCapital: 5, reputation: 0, xp: 0, level: 1 } });
    const clutch = getBonusById('CLUTCH_MOMENT')!;
    const loadout = applyLoadout(char, [clutch]);
    const result = makeResult({ total: 12, dc: 15, success: false }); // missed by 3
    const { result: r } = applyClutchMoment(result, loadout);
    expect(r.success).toBe(true);
  });

  it('throws when missed by more than 3', () => {
    const char = makeCharacter({ tendency: 'ethical', resources: { energy: 10, maxEnergy: 10, politicalCapital: 5, reputation: 0, xp: 0, level: 1 } });
    const clutch = getBonusById('CLUTCH_MOMENT')!;
    const loadout = applyLoadout(char, [clutch]);
    const result = makeResult({ total: 10, dc: 15, success: false }); // missed by 5
    expect(() => applyClutchMoment(result, loadout)).toThrow('requer falha por ≤3');
  });

  it('throws when result is already a success', () => {
    const char = makeCharacter({ tendency: 'ethical', resources: { energy: 10, maxEnergy: 10, politicalCapital: 5, reputation: 0, xp: 0, level: 1 } });
    const clutch = getBonusById('CLUTCH_MOMENT')!;
    const loadout = applyLoadout(char, [clutch]);
    const result = makeResult({ total: 16, dc: 15, success: true });
    expect(() => applyClutchMoment(result, loadout)).toThrow('só pode ser usado em falhas');
  });
});

// ── onSessionEnd ──────────────────────────────────────────────────────────────

describe('onSessionEnd', () => {
  it('carry over is capped by level limit', () => {
    const char = makeCharacter({ level: 8 }); // level <= 10, no carry over
    const loadout: LoadoutState = {
      politicalCapitalRemaining: 3,
      tendency: 'neutral',
      slots: 1,
      activeBonuses: [],
      carryOver: 0,
      isFirstRollDone: false,
    };
    const { carryOver } = onSessionEnd(char, loadout);
    expect(carryOver).toBe(0);
  });

  it('level 11+ can carry over up to 3', () => {
    const char = makeCharacter({ level: 15 });
    const loadout: LoadoutState = {
      politicalCapitalRemaining: 5,
      tendency: 'neutral',
      slots: 2,
      activeBonuses: [],
      carryOver: 0,
      isFirstRollDone: false,
    };
    const { carryOver } = onSessionEnd(char, loadout);
    expect(carryOver).toBe(3); // capped at 3
  });

  it('reverses COFFEE_BOOST maxEnergy at session end', () => {
    const char = makeCharacter({ resources: { energy: 12, maxEnergy: 12, politicalCapital: 5, reputation: 0, xp: 0, level: 1 } });
    const coffee = getBonusById('COFFEE_BOOST')!;
    const loadout: LoadoutState = {
      politicalCapitalRemaining: 0,
      tendency: 'neutral',
      slots: 1,
      activeBonuses: [{ bonus: coffee, usesRemaining: null }],
      carryOver: 0,
      isFirstRollDone: false,
    };
    const { character } = onSessionEnd(char, loadout);
    expect(character.resources.maxEnergy).toBe(10);
  });
});

// ── BONUSES data integrity ────────────────────────────────────────────────────

describe('BONUSES data integrity', () => {
  it('has 23 bonuses', () => {
    expect(BONUSES).toHaveLength(23);
  });

  it('every bonus has a unique id', () => {
    const ids = BONUSES.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every active bonus has uses defined', () => {
    for (const b of BONUSES) {
      if (b.bonusType === 'active') {
        expect(b.uses).toBeDefined();
        expect(b.uses).toBeGreaterThan(0);
      }
    }
  });

  it('every bonus has at least one tendency', () => {
    for (const b of BONUSES) {
      expect(b.tendencies.length).toBeGreaterThan(0);
    }
  });

  it('tiers are 1–5', () => {
    for (const b of BONUSES) {
      expect(b.tier).toBeGreaterThanOrEqual(1);
      expect(b.tier).toBeLessThanOrEqual(5);
    }
  });
});
