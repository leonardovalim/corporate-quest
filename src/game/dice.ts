export function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

export function rollWithAdvantage(): { rolls: number[]; result: number } {
  const r1 = rollD20();
  const r2 = rollD20();
  return { rolls: [r1, r2], result: Math.max(r1, r2) };
}

export function rollWithDisadvantage(): { rolls: number[]; result: number } {
  const r1 = rollD20();
  const r2 = rollD20();
  return { rolls: [r1, r2], result: Math.min(r1, r2) };
}

export function roll4d6DropLowest(): { rolls: number[]; result: number } {
  const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  const sorted = [...rolls].sort((a, b) => b - a);
  return { rolls, result: sorted[0] + sorted[1] + sorted[2] };
}

export function getModifier(value: number): number {
  return Math.floor((value - 10) / 2);
}
