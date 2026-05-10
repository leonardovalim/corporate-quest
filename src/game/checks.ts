import { rollD20, rollWithAdvantage, rollWithDisadvantage, getModifier } from './dice';
import type { CheckResult, AttributeName, Character, DiceRoll } from './types';

/** Returns energy cost for a check based on critical result */
export function getEnergyCost(critical: 'success' | 'failure' | null): number {
  if (critical === 'success') return 0; // flow state!
  if (critical === 'failure') return 2; // wasted effort
  return 1;
}

/** Get energy status and penalties */
export function getEnergyStatus(character: Character): {
  percent: number;
  exhausted: boolean;
  burnout: boolean;
  penalty: number;
  forceDisadvantage: boolean;
  label: string;
  color: 'green' | 'yellow' | 'red';
} {
  const percent = (character.resources.energy / character.resources.maxEnergy) * 100;
  const exhausted = percent <= 30 && character.resources.energy > 0;
  const burnout = character.resources.energy <= 0;

  return {
    percent,
    exhausted,
    burnout,
    penalty: burnout ? -3 : 0,
    forceDisadvantage: exhausted || burnout,
    label: burnout ? '💀 Burnout!' : exhausted ? '⚠️ Exausto!' : '',
    color: percent <= 30 ? 'red' : percent <= 50 ? 'yellow' : 'green',
  };
}

export function resolveCheck(
  character: Character,
  attribute: AttributeName,
  dc: number,
  bonus: number = 0,
  advantage: boolean = false,
  disadvantage: boolean = false
): CheckResult {
  // Apply energy penalties
  const status = getEnergyStatus(character);
  if (status.forceDisadvantage) disadvantage = true;
  const energyPenalty = status.penalty;

  let roll: number;
  let rolls: number[] | undefined;

  if (advantage && !disadvantage) {
    const r = rollWithAdvantage();
    roll = r.result;
    rolls = r.rolls;
  } else if (disadvantage && !advantage) {
    const r = rollWithDisadvantage();
    roll = r.result;
    rolls = r.rolls;
  } else {
    roll = rollD20();
    rolls = [roll];
  }

  const modifier = getModifier(character.attributes[attribute]);
  const total = roll + modifier + bonus + energyPenalty;
  const critical = roll === 20 ? 'success' : roll === 1 ? 'failure' : null;
  const success = critical === 'success' ? true : critical === 'failure' ? false : total >= dc;

  return { roll, modifier, bonus: bonus + energyPenalty, total, dc, success, critical, advantage, disadvantage, rolls };
}

export function createDiceLog(
  result: CheckResult,
  attribute: AttributeName,
  type: string = 'd20'
): DiceRoll {
  return {
    id: crypto.randomUUID(),
    type,
    rolls: result.rolls || [result.roll],
    result: result.roll,
    modifier: result.modifier + result.bonus,
    total: result.total,
    timestamp: Date.now(),
    attribute,
    dc: result.dc,
    success: result.success,
  };
}
