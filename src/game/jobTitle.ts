/**
 * Career progression by level.
 * Tier changes every 5 levels: Junior (1-5), Pleno (6-10), Senior (11-15),
 * Especialista (16-20), Head (21-25), Diretor (26-30), CEO (31+).
 *
 * The class name (PM, Engineer, …) is preserved alongside the rank so
 * "Engineer Junior" → "Engineer Pleno" → … → "CEO".
 */
export const JOB_TIERS = [
  { minLevel: 1,  maxLevel: 5,  rank: 'Junior',       icon: '🌱' },
  { minLevel: 6,  maxLevel: 10, rank: 'Pleno',        icon: '🌿' },
  { minLevel: 11, maxLevel: 15, rank: 'Senior',       icon: '🌳' },
  { minLevel: 16, maxLevel: 20, rank: 'Especialista', icon: '🎯' },
  { minLevel: 21, maxLevel: 25, rank: 'Head',         icon: '🧭' },
  { minLevel: 26, maxLevel: 30, rank: 'Diretor',      icon: '🏛️' },
  { minLevel: 31, maxLevel: Infinity, rank: 'CEO',    icon: '👑' },
] as const;

export type JobTier = typeof JOB_TIERS[number];

export function getJobTier(level: number): JobTier {
  return JOB_TIERS.find(t => level >= t.minLevel && level <= t.maxLevel) ?? JOB_TIERS[0];
}

/** Full title combining rank + class. CEO doesn't carry the class suffix. */
export function getJobTitle(level: number, className: string): string {
  const tier = getJobTier(level);
  if (tier.rank === 'CEO') return 'CEO';
  return `${className} ${tier.rank}`;
}

/** True when crossing from `from` to `to` enters a new tier. */
export function didPromote(from: number, to: number): boolean {
  return getJobTier(from).rank !== getJobTier(to).rank;
}
