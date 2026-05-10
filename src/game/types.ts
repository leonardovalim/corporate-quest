export type AttributeName = 'EXE' | 'INF' | 'TEC' | 'RES' | 'CRE' | 'AWA';

export type ClassName = 'PM' | 'Engineer' | 'Designer' | 'Data Analyst' | 'Sales' | 'Manager';

export type BackgroundName = 'Startup Survivor' | 'Corporate Lifer' | 'Consultancy Refugee' | 'Academia Escapee' | 'Freelance Convert' | 'Career Switcher';

export type AlignmentLaw = 'Lawful' | 'Neutral' | 'Chaotic';
export type AlignmentMoral = 'Good' | 'Neutral' | 'Evil';
export type Alignment = `${AlignmentLaw} ${AlignmentMoral}` | 'True Neutral';

export interface Attributes {
  EXE: number;
  INF: number;
  TEC: number;
  RES: number;
  CRE: number;
  AWA: number;
}

export interface Resources {
  energy: number;
  maxEnergy: number;
  politicalCapital: number;
  reputation: number;
  xp: number;
  level: number;
}

export interface Feat {
  name: string;
  description: string;
  effect: string;
  category: 'communication' | 'technical' | 'creative' | 'leadership';
  classes?: ClassName[];
}

export interface ClassData {
  name: ClassName;
  equivalent: string;
  primaryAttribute: AttributeName;
  bonuses: Partial<Attributes>;
  penalty: string;
  resources: { energy: number; politicalCapital: number; reputation: number };
  abilities: { name: string; description: string; uses: string }[];
  inventory: string[];
  flavor: string;
  icon: string;
}

export interface BackgroundData {
  name: BackgroundName;
  bonus: string;
  description: string;
  attributeBonus: Partial<Attributes>;
}

export interface AlignmentData {
  alignment: Alignment;
  translation: string;
  law: AlignmentLaw;
  moral: AlignmentMoral;
}

export interface Character {
  name: string;
  className: ClassName;
  background: BackgroundName;
  alignment: Alignment;
  attributes: Attributes;
  resources: Resources;
  feats: Feat[];
  inventory: string[];
  level: number;
  tendency?: Tendency;
  loadout?: LoadoutState;
}

export interface CheckResult {
  roll: number;
  modifier: number;
  bonus: number;
  total: number;
  dc: number;
  success: boolean;
  critical: 'success' | 'failure' | null;
  advantage: boolean;
  disadvantage: boolean;
  rolls?: number[];
}

export interface DiceRoll {
  id: string;
  type: string;
  rolls: number[];
  result: number;
  modifier: number;
  total: number;
  timestamp: number;
  attribute?: AttributeName;
  dc?: number;
  success?: boolean;
}

export interface GameMessage {
  id: string;
  role: 'dm' | 'player' | 'system';
  content: string;
  timestamp: number;
  diceRoll?: DiceRoll;
  options?: string[];
}

export interface EncounterState {
  name: string;
  description: string;
  phase: number;
  totalPhases: number;
  completed: boolean;
  outcome?: 'victory' | 'defeat' | 'fired';
  fireReason?: string;
  rewards?: { xp: number; pc: number; reputation: number };
  rewardsApplied?: boolean; // prevents double-apply on snapshot restore
  phaseStraining?: boolean; // true when phase is being forced to advance soon
}

export type Tendency = 'ethical' | 'neutral' | 'unethical';

export type BonusType = 'passive' | 'active';

export interface Bonus {
  id: string;
  name: string;
  cost: number;
  tier: number;
  bonusType: BonusType;
  effect: string;
  tendencies: Tendency[];
  uses?: number;
  rules?: string[];
  flavor?: string;
  excludes?: string[];
}

export interface BonusInstance {
  bonus: Bonus;
  usesRemaining: number | null; // null = passive
}

export interface LoadoutState {
  politicalCapitalRemaining: number;
  tendency: Tendency;
  slots: number;
  activeBonuses: BonusInstance[];
  carryOver: number;
  isFirstRollDone: boolean;
}
