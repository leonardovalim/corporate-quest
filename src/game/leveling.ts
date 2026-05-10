// XP curve: cumulative thresholds. Easy at start, harder later.
// Index 0 = level 1 (0 XP). Index N = total XP needed to *reach* level N+1.
const CUMULATIVE_THRESHOLDS = [
  0, // Lv 1
  30, // Lv 2
  50, // Lv 3
  80, // Lv 4
  120, // Lv 5
  250, // Lv 6
  550, // Lv 7
  1500, // Lv 8
  2700, // Lv 9
  3800, // Lv 10
];

const POST_10_INCREMENT = 2000;

/** Returns total XP required to *reach* the given level (cumulative). */
export function getTotalXPForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level <= CUMULATIVE_THRESHOLDS.length) {
    return CUMULATIVE_THRESHOLDS[level - 1];
  }
  const last = CUMULATIVE_THRESHOLDS[CUMULATIVE_THRESHOLDS.length - 1];
  const extra = level - CUMULATIVE_THRESHOLDS.length;
  return last + extra * POST_10_INCREMENT;
}

/** Computes the current level from total accumulated XP. */
export function getLevelFromXP(xp: number): number {
  let level = 1;
  while (getTotalXPForLevel(level + 1) <= xp) {
    level++;
    if (level > 999) break; // safety
  }
  return level;
}

/** XP required to advance from `level` to `level + 1`. */
export function getXPForNextLevel(level: number): number {
  return getTotalXPForLevel(level + 1) - getTotalXPForLevel(level);
}

export interface LevelProgress {
  currentLevel: number;
  xpIntoLevel: number;
  xpForNext: number;
  percent: number;
}

/** Progress within the current level. */
export function getCurrentLevelProgress(xp: number): LevelProgress {
  const currentLevel = getLevelFromXP(xp);
  const base = getTotalXPForLevel(currentLevel);
  const xpForNext = getXPForNextLevel(currentLevel);
  const xpIntoLevel = xp - base;
  const percent = Math.min(100, Math.max(0, (xpIntoLevel / xpForNext) * 100));
  return { currentLevel, xpIntoLevel, xpForNext, percent };
}
