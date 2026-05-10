import type { Character, CheckResult, Tendency, Bonus, BonusInstance, LoadoutState, Alignment } from './types';

export const BONUSES: Bonus[] = [
  // ── Tier 1 ──────────────────────────────────────────────────────────────────
  {
    id: 'COFFEE_BOOST',
    name: 'Coffee Boost',
    cost: 1,
    tier: 1,
    bonusType: 'passive',
    effect: '+2 Energy máxima nesta sessão (12 total)',
    tendencies: ['ethical', 'neutral', 'unethical'],
    flavor: 'Café premium. Vale cada centavo.',
  },
  {
    id: 'EARLY_BIRD',
    name: 'Early Bird',
    cost: 1,
    tier: 1,
    bonusType: 'passive',
    effect: '+1 no primeiro roll da sessão',
    tendencies: ['ethical', 'neutral', 'unethical'],
    flavor: 'Você chegou antes de todo mundo.',
  },
  {
    id: 'SMALL_TALK_PREP',
    name: 'Small Talk Prep',
    cost: 1,
    tier: 1,
    bonusType: 'active',
    uses: 1,
    effect: 'Sabe 1 interesse pessoal de um NPC (pergunta ao DM)',
    tendencies: ['ethical', 'neutral'],
    flavor: 'Você stalkeou o LinkedIn dele.',
  },
  // ── Tier 2 ──────────────────────────────────────────────────────────────────
  {
    id: 'MINOR_EDGE',
    name: 'Minor Edge',
    cost: 2,
    tier: 2,
    bonusType: 'passive',
    effect: '+1 em todos os rolls da sessão',
    tendencies: ['ethical', 'neutral', 'unethical'],
    excludes: ['MAJOR_EDGE'],
    flavor: 'Você está num bom dia.',
  },
  {
    id: 'MEETING_NOTES',
    name: 'Meeting Notes',
    cost: 2,
    tier: 2,
    bonusType: 'active',
    uses: 2,
    effect: 'Vê a DC antes de escolher sua abordagem',
    tendencies: ['ethical', 'neutral'],
    flavor: 'Você leu a pauta. Sabe o que esperar.',
  },
  {
    id: 'SECOND_WIND',
    name: 'Second Wind',
    cost: 2,
    tier: 2,
    bonusType: 'active',
    uses: 1,
    effect: 'Recupera 3 Energy imediatamente (ação livre)',
    tendencies: ['ethical', 'neutral', 'unethical'],
    flavor: 'Respira fundo. Foco. Vamos.',
  },
  {
    id: 'RUMOR_MILL',
    name: 'Rumor Mill',
    cost: 2,
    tier: 2,
    bonusType: 'active',
    uses: 1,
    effect: 'Sabe a disposition inicial de todos NPCs na cena',
    tendencies: ['neutral', 'unethical'],
    flavor: 'O pessoal do café te contou quem tá de mal humor.',
  },
  {
    id: 'COFFEE_CHAT_INTEL',
    name: 'Coffee Chat Intel',
    cost: 2,
    tier: 2,
    bonusType: 'active',
    uses: 1,
    effect: 'Sabe qual NPC tem mais influência na decisão da cena',
    tendencies: ['ethical', 'neutral', 'unethical'],
    flavor: 'O pessoal do café sempre sabe quem manda de verdade.',
  },
  // ── Tier 3 ──────────────────────────────────────────────────────────────────
  {
    id: 'PREPARED_ARGUMENT',
    name: 'Prepared Argument',
    cost: 3,
    tier: 3,
    bonusType: 'active',
    uses: 1,
    effect: '+4 em um único roll (declarar ANTES de rolar)',
    tendencies: ['ethical', 'neutral'],
    rules: ['Declara ANTES de rolar'],
    flavor: 'Você ensaiou isso no espelho. Três vezes.',
  },
  {
    id: 'SECOND_CHANCE',
    name: 'Second Chance',
    cost: 3,
    tier: 3,
    bonusType: 'active',
    uses: 1,
    effect: 'Reroll 1 dado, fica com o MELHOR resultado',
    tendencies: ['neutral', 'unethical'],
    rules: ['Declara DEPOIS de ver o resultado', 'Fica com o melhor dos dois'],
    flavor: '"Deixa eu reformular isso..."',
  },
  {
    id: 'NETWORK_PING',
    name: 'Network Ping',
    cost: 3,
    tier: 3,
    bonusType: 'active',
    uses: 1,
    effect: '1 NPC neutro/hostil começa com +2 disposition',
    tendencies: ['ethical', 'neutral'],
    rules: ['Escolhe o NPC no momento do encontro', 'Não funciona em NPCs já aliados'],
    flavor: 'Vocês têm um amigo em comum. Ele falou bem de você.',
  },
  {
    id: 'SAFETY_NET',
    name: 'Safety Net',
    cost: 3,
    tier: 3,
    bonusType: 'active',
    uses: 1,
    effect: 'Nat 1 (falha crítica) vira falha normal',
    tendencies: ['neutral', 'unethical'],
    rules: ['Ativa automaticamente no primeiro nat 1', 'Falha ainda acontece, mas sem consequência extra'],
    flavor: 'Seu colega cobre sua gafe sem perceber.',
  },
  {
    id: 'DELEGATE_TASK',
    name: 'Delegate Task',
    cost: 3,
    tier: 3,
    bonusType: 'active',
    uses: 1,
    effect: 'Passa 1 check pra um NPC aliado fazer por você',
    tendencies: ['ethical', 'neutral'],
    rules: [
      'NPC precisa estar presente e aliado',
      'NPC usa os stats dele (pode ser melhor ou pior)',
      'Sucesso/falha afeta reputação do NPC, não sua',
    ],
    flavor: '"Fulano, você é melhor nisso que eu. Pode apresentar?"',
  },
  {
    id: 'PAPER_TRAIL',
    name: 'Paper Trail',
    cost: 3,
    tier: 3,
    bonusType: 'active',
    uses: 1,
    effect: '+3 em 1 check de TEC ou AWA (com evidência)',
    tendencies: ['ethical', 'neutral'],
    rules: ['Só funciona para checks de TEC ou AWA', 'Declara antes de rolar'],
    flavor: '"Tenho os dados aqui. Olha o gráfico."',
  },
  // ── Tier 4 ──────────────────────────────────────────────────────────────────
  {
    id: 'MAJOR_EDGE',
    name: 'Major Edge',
    cost: 4,
    tier: 4,
    bonusType: 'passive',
    effect: '+2 em todos os rolls da sessão',
    tendencies: ['ethical', 'neutral'],
    excludes: ['MINOR_EDGE'],
    rules: ['Não stacka com MINOR_EDGE (substitui)'],
    flavor: 'Você está no auge. Tudo flui.',
  },
  {
    id: 'CLUTCH_MOMENT',
    name: 'Clutch Moment',
    cost: 4,
    tier: 4,
    bonusType: 'active',
    uses: 1,
    effect: 'Transforma 1 falha em sucesso (se errou por ≤3)',
    tendencies: ['ethical', 'neutral'],
    rules: ['Só funciona se roll ficou 1-3 abaixo da DC', 'Declara DEPOIS de ver resultado'],
    flavor: 'Aquele momento de clareza quando tudo importa.',
  },
  {
    id: 'INSURANCE_POLICY',
    name: 'Insurance Policy',
    cost: 4,
    tier: 4,
    bonusType: 'active',
    uses: 1,
    effect: 'Ignora 1 falha completamente (Energy devolvida)',
    tendencies: ['neutral', 'unethical'],
    rules: ['Falha simplesmente não aconteceu', 'Energy da ação é devolvida'],
    flavor: '"Era um teste. Você passou." (não era um teste)',
  },
  {
    id: 'DIRT_FILE',
    name: 'Dirt File',
    cost: 4,
    tier: 4,
    bonusType: 'passive',
    effect: '1 NPC específico tem -3 em resistir sua Influência',
    tendencies: ['unethical'],
    rules: ['Escolhe o NPC no loadout (antes da sessão)', 'Se descoberto, vira inimigo permanente'],
    flavor: 'Você sabe algo que ele prefere esconder.',
  },
  {
    id: 'SCAPEGOAT_READY',
    name: 'Scapegoat Ready',
    cost: 4,
    tier: 4,
    bonusType: 'active',
    uses: 1,
    effect: 'Se falhar, pode tentar de novo imediatamente (nova abordagem)',
    tendencies: ['neutral', 'unethical'],
    rules: [
      'Segundo attempt é narrativamente diferente',
      'Gasta Energy normal da segunda tentativa',
      'DC pode aumentar em 2 (DM decide)',
      'Só funciona 1x por check',
    ],
    flavor: '"Ok, isso não funcionou. Mas e se a gente olhar por outro ângulo?"',
  },
  // ── Tier 5 ──────────────────────────────────────────────────────────────────
  {
    id: 'EXECUTIVE_SPONSOR',
    name: 'Executive Sponsor',
    cost: 5,
    tier: 5,
    bonusType: 'active',
    uses: 1,
    effect: '+6 em qualquer roll (pode declarar DEPOIS de rolar)',
    tendencies: ['ethical', 'neutral'],
    rules: ['Pode usar depois de ver o resultado'],
    flavor: 'Seu sponsor aparece na hora certa. "Eu confio nele."',
  },
  {
    id: 'BLAME_SHIFT',
    name: 'Blame Shift',
    cost: 5,
    tier: 5,
    bonusType: 'active',
    uses: 1,
    effect: 'Transfere consequência de 1 falha para NPC presente',
    tendencies: ['unethical'],
    rules: [
      'NPC precisa estar presente na cena',
      'Relacionamento com NPC cai 2 pontos',
      'Se NPC descobrir a verdade = inimigo permanente',
    ],
    flavor: '"Mas foi o João que sugeriu isso na última reunião..."',
  },
  {
    id: 'AUTO_SUCCESS',
    name: 'Auto Success',
    cost: 6,
    tier: 5,
    bonusType: 'active',
    uses: 1,
    effect: '1 check é sucesso automático (conta como roll 18)',
    tendencies: ['unethical'],
    rules: [
      'NÃO funciona em DC 20+',
      'NÃO funciona em checks contestados (PvP)',
      'Conta como natural 18 (não é crítico)',
    ],
    flavor: 'Você "resolveu" isso antes da reunião. Não pergunte como.',
  },
  {
    id: 'PERFECT_TIMING',
    name: 'Perfect Timing',
    cost: 5,
    tier: 5,
    bonusType: 'active',
    uses: 1,
    effect: 'Interrompe a vez de outro pra agir primeiro',
    tendencies: ['neutral', 'unethical'],
    rules: [
      'Funciona como "readied action" instantânea',
      'Sua ação acontece ANTES da ação interrompida',
      'Não pode interromper o próprio turno',
    ],
    flavor: 'Você antecipou o movimento dele.',
  },
];

// ── Tendency derivation ──────────────────────────────────────────────────────

/**
 * Derives Tendency from the moral axis of the alignment system.
 * Good → ethical, Evil → unethical, everything else → neutral.
 */
export function getTendency(alignment: Alignment): Tendency {
  if (alignment === 'True Neutral') return 'neutral';
  if (alignment.endsWith('Good')) return 'ethical';
  if (alignment.endsWith('Evil')) return 'unethical';
  return 'neutral';
}

// ── Economy ──────────────────────────────────────────────────────────────────

export function calculateSessionPC(level: number): number {
  return 3 + Math.floor(level / 5);
}

export function calculateSlots(level: number): number {
  if (level <= 10) return 1;
  if (level <= 30) return 2;
  return 3;
}

export function calculateCarryOverLimit(level: number): number {
  if (level <= 10) return 0;
  if (level <= 30) return 3;
  return 5;
}

// ── Tendency helpers ─────────────────────────────────────────────────────────

export function canEquipBonus(bonus: Bonus, tendency: Tendency): boolean {
  return bonus.tendencies.includes(tendency);
}

export function getAvailableBonuses(tendency: Tendency): Bonus[] {
  return BONUSES.filter(b => canEquipBonus(b, tendency));
}

export function getBonusById(id: string): Bonus | undefined {
  return BONUSES.find(b => b.id === id);
}

// ── Session start ─────────────────────────────────────────────────────────────

/** Validates and builds a LoadoutState. Throws on constraint violations. */
export function applyLoadout(
  character: Character,
  bonuses: Bonus[],
  carryOver: number = 0,
): LoadoutState {
  const tendency: Tendency = character.tendency ?? getTendency(character.alignment);
  const slots = calculateSlots(character.level);
  const availablePC = character.resources.politicalCapital + carryOver;

  if (bonuses.length > slots) {
    throw new Error(`Slots insuficientes: ${slots} disponível(is), ${bonuses.length} solicitado(s)`);
  }

  for (const bonus of bonuses) {
    if (!canEquipBonus(bonus, tendency)) {
      throw new Error(`Tendência ${tendency} não permite ${bonus.id}`);
    }
    if (bonus.excludes) {
      for (const excludedId of bonus.excludes) {
        if (bonuses.some(b => b.id === excludedId)) {
          throw new Error(`${bonus.id} não pode ser combinado com ${excludedId}`);
        }
      }
    }
  }

  const totalCost = bonuses.reduce((sum, b) => sum + b.cost, 0);
  if (totalCost > availablePC) {
    throw new Error(`PC insuficiente: ${availablePC} disponível, ${totalCost} necessário`);
  }

  const activeBonuses: BonusInstance[] = bonuses.map(b => ({
    bonus: b,
    usesRemaining: b.bonusType === 'active' ? (b.uses ?? 1) : null,
  }));

  return {
    politicalCapitalRemaining: availablePC - totalCost,
    tendency,
    slots,
    activeBonuses,
    carryOver: 0,
    isFirstRollDone: false,
  };
}

/**
 * Applies passive effects that modify the character at session start.
 * Call after applyLoadout. Returns updated character.
 */
export function applySessionStartEffects(character: Character, loadout: LoadoutState): Character {
  let updated = { ...character, resources: { ...character.resources } };

  for (const instance of loadout.activeBonuses) {
    if (instance.bonus.id === 'COFFEE_BOOST') {
      updated.resources.maxEnergy += 2;
      updated.resources.energy = updated.resources.maxEnergy;
    }
  }

  // Unethical passive: +1 PC
  if (loadout.tendency === 'unethical') {
    updated.resources.politicalCapital = loadout.politicalCapitalRemaining + 1;
  } else {
    updated.resources.politicalCapital = loadout.politicalCapitalRemaining;
  }

  return { ...updated, tendency: loadout.tendency, loadout };
}

// ── Roll hook ─────────────────────────────────────────────────────────────────

/**
 * Applies passive bonuses that trigger automatically on every roll.
 * Handles MINOR_EDGE, MAJOR_EDGE, EARLY_BIRD, and auto-triggers SAFETY_NET.
 * Returns the modified result and updated loadout (uses consumed as needed).
 */
export function onRoll(
  result: CheckResult,
  loadout: LoadoutState,
): { result: CheckResult; loadout: LoadoutState } {
  let modified = { ...result };
  let updatedLoadout: LoadoutState = {
    ...loadout,
    activeBonuses: loadout.activeBonuses.map(i => ({ ...i })),
  };

  for (const instance of updatedLoadout.activeBonuses) {
    // Skip exhausted actives
    if (instance.usesRemaining !== null && instance.usesRemaining <= 0) continue;

    switch (instance.bonus.id) {
      case 'MINOR_EDGE':
        modified.total += 1;
        modified.bonus += 1;
        break;

      case 'MAJOR_EDGE':
        modified.total += 2;
        modified.bonus += 2;
        break;

      case 'EARLY_BIRD':
        if (!loadout.isFirstRollDone) {
          modified.total += 1;
          modified.bonus += 1;
          updatedLoadout.isFirstRollDone = true;
        }
        break;

      case 'SAFETY_NET':
        // Auto-triggers on nat 1: downgrade critical failure to normal failure
        if (result.roll === 1 && instance.usesRemaining === 1) {
          modified.critical = null;
          instance.usesRemaining = 0;
        }
        break;
    }
  }

  // Recompute success after passive modifications
  if (modified.critical === 'success') {
    modified.success = true;
  } else if (modified.critical === 'failure') {
    modified.success = false;
  } else {
    modified.success = modified.total >= modified.dc;
  }

  return { result: modified, loadout: updatedLoadout };
}

/** Consume one use of an active bonus. Returns updated loadout or throws if unavailable. */
export function consumeBonus(loadout: LoadoutState, bonusId: string): LoadoutState {
  const activeBonuses = loadout.activeBonuses.map(instance => {
    if (instance.bonus.id !== bonusId) return instance;
    if (instance.usesRemaining === null) return instance; // passive, no consumption
    if (instance.usesRemaining <= 0) throw new Error(`${bonusId} não tem usos restantes`);
    return { ...instance, usesRemaining: instance.usesRemaining - 1 };
  });
  return { ...loadout, activeBonuses };
}

/** Apply EXECUTIVE_SPONSOR: +6 to an already-resolved roll (post-roll). Consumes the bonus. */
export function applyExecutiveSponsor(
  result: CheckResult,
  loadout: LoadoutState,
): { result: CheckResult; loadout: LoadoutState } {
  const instance = loadout.activeBonuses.find(i => i.bonus.id === 'EXECUTIVE_SPONSOR');
  if (!instance || (instance.usesRemaining !== null && instance.usesRemaining <= 0)) {
    throw new Error('EXECUTIVE_SPONSOR não disponível');
  }
  const modified: CheckResult = {
    ...result,
    total: result.total + 6,
    bonus: result.bonus + 6,
  };
  modified.success = modified.critical === 'failure' ? false
    : modified.critical === 'success' ? true
    : modified.total >= modified.dc;
  return { result: modified, loadout: consumeBonus(loadout, 'EXECUTIVE_SPONSOR') };
}

/** Apply CLUTCH_MOMENT: converts a failure into success if missed by ≤3. Consumes the bonus. */
export function applyClutchMoment(
  result: CheckResult,
  loadout: LoadoutState,
): { result: CheckResult; loadout: LoadoutState } {
  if (result.success) throw new Error('CLUTCH_MOMENT só pode ser usado em falhas');
  const gap = result.dc - result.total;
  if (gap > 3) throw new Error(`CLUTCH_MOMENT requer falha por ≤3 (falhou por ${gap})`);
  const modified: CheckResult = { ...result, success: true, critical: null };
  return { result: modified, loadout: consumeBonus(loadout, 'CLUTCH_MOMENT') };
}

// ── Session end ───────────────────────────────────────────────────────────────

export function onSessionEnd(
  character: Character,
  loadout: LoadoutState,
): { character: Character; carryOver: number } {
  const limit = calculateCarryOverLimit(character.level);
  const carryOver = Math.min(loadout.politicalCapitalRemaining, limit);

  const updated: Character = {
    ...character,
    resources: { ...character.resources, maxEnergy: character.resources.maxEnergy },
    loadout: undefined,
  };

  // Reset COFFEE_BOOST energy bonus
  const hasCoffeeBoost = loadout.activeBonuses.some(i => i.bonus.id === 'COFFEE_BOOST');
  if (hasCoffeeBoost) {
    updated.resources = {
      ...updated.resources,
      maxEnergy: updated.resources.maxEnergy - 2,
      energy: Math.min(updated.resources.energy, updated.resources.maxEnergy - 2),
    };
  }

  return { character: updated, carryOver };
}
