import type { Character, ClassName, BackgroundName, Alignment, Attributes, Feat } from './types';
import { CLASSES, BACKGROUNDS } from './gameData';

export function createCharacter(
  name: string,
  className: ClassName,
  background: BackgroundName,
  alignment: Alignment,
  baseAttributes: Attributes,
  feats: Feat[]
): Character {
  const classData = CLASSES.find(c => c.name === className)!;
  const bgData = BACKGROUNDS.find(b => b.name === background)!;

  const attributes: Attributes = { ...baseAttributes };

  // Apply class bonuses
  for (const [key, val] of Object.entries(classData.bonuses)) {
    attributes[key as keyof Attributes] += val as number;
  }

  // Apply background bonuses
  for (const [key, val] of Object.entries(bgData.attributeBonus)) {
    attributes[key as keyof Attributes] += val as number;
  }

  return {
    name,
    className,
    background,
    alignment,
    attributes,
    resources: {
      energy: classData.resources.energy,
      maxEnergy: classData.resources.energy,
      politicalCapital: classData.resources.politicalCapital,
      reputation: classData.resources.reputation,
      xp: 0,
      level: 1,
    },
    feats,
    inventory: [...classData.inventory],
    level: 1,
  };
}
