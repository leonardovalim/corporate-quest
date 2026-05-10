import type { EncounterState } from './types';

export type EncounterDifficulty = 'easy' | 'medium' | 'hard' | 'absurd';

export interface EncounterTemplate {
  name: string;
  description: string;
  totalPhases: number;
  rewards: { xp: number; pc: number; reputation: number };
  openingPrompt: string;
  difficulty: EncounterDifficulty;
  minLevel: number;
}

export const ENCOUNTERS: EncounterTemplate[] = [
  {
    name: 'A Daily que Virou Tribunal',
    description: 'Uma daily standup que escala para um tribunal corporativo quando um bug crítico é descoberto em produção.',
    totalPhases: 5,
    rewards: { xp: 25, pc: 1, reputation: 0 },
    openingPrompt: 'Comece a narrar o encounter "A Daily que Virou Tribunal". Uma daily standup de rotina que escala quando um bug crítico é descoberto. Descreva a cena de abertura e me dê opções de ação.',
    difficulty: 'easy',
    minLevel: 1,
  },
  {
    name: 'O Deploy de Sexta-Feira',
    description: 'Alguém quer fazer deploy na sexta às 17h. Você precisa decidir se apoia, sabota ou assume o risco.',
    totalPhases: 4,
    rewards: { xp: 30, pc: 2, reputation: 1 },
    openingPrompt: 'Comece a narrar o encounter "O Deploy de Sexta-Feira". São 17h de sexta, alguém quer fazer deploy urgente. Invente nomes brasileiros para os NPCs: DevOps cautelosa, Junior Dev ansioso (é o PR dele), CTO que quer resultado. Descreva a cena e me dê opções.',
    difficulty: 'medium',
    minLevel: 1,
  },
  {
    name: 'A Reunião que Podia Ser um Email',
    description: 'Uma reunião de 2h que ninguém sabe por que foi marcada. Sobreviva, descubra o motivo real, ou transforme em algo útil.',
    totalPhases: 4,
    rewards: { xp: 20, pc: 1, reputation: 1 },
    openingPrompt: 'Comece a narrar o encounter "A Reunião que Podia Ser um Email". Uma reunião misteriosa de 2h marcada por um VP sem pauta. Invente nomes brasileiros para: VP com agenda oculta, Coordenadora que quer sair logo, Estagiário fazendo ata. Descreva a cena e opções.',
    difficulty: 'easy',
    minLevel: 1,
  },
  {
    name: 'Hackathon Corporativo',
    description: 'A empresa organizou um hackathon de 24h. Monte seu time, escolha o projeto e sobreviva à apresentação final.',
    totalPhases: 5,
    rewards: { xp: 40, pc: 3, reputation: 2 },
    openingPrompt: 'Comece a narrar o encounter "Hackathon Corporativo". A empresa anunciou um hackathon de 24h com prêmio. Invente nomes brasileiros: Rival que quer ganhar a todo custo, Designer talentosa mas indecisa, Mentor júri exigente. Descreva o início e opções de time/projeto.',
    difficulty: 'hard',
    minLevel: 2,
  },
  {
    name: 'PR que Quebrou Produção no Natal',
    description: 'Véspera de Natal, 20h. Um PR seu (ou que você aprovou?) derrubou produção. O on-call está te ligando.',
    totalPhases: 4,
    rewards: { xp: 35, pc: 2, reputation: 1 },
    openingPrompt: 'Comece a narrar o encounter "PR que Quebrou Produção no Natal". Véspera de Natal, 20h, produção caiu por causa de um PR aprovado por você ontem. Invente nomes brasileiros: SRE on-call irritado, Gerente que quer culpado, Diretor que estava no jantar com a família. Descreva a cena e opções.',
    difficulty: 'medium',
    minLevel: 2,
  },
  {
    name: 'All-Hands com Layoff Surpresa',
    description: 'O CEO convocou um all-hands de emergência. Os boatos de REDACTED em massa correm pelos corredores.',
    totalPhases: 5,
    rewards: { xp: 50, pc: 3, reputation: 2 },
    openingPrompt: 'Comece a narrar o encounter "All-Hands com Layoff Surpresa". CEO convocou all-hands de emergência, rumores de layoff. Invente nomes brasileiros: CEO com cara fechada, Head of People nervosa, colega de equipe em pânico, jornalista interno tentando confirmar a notícia. Descreva e dê opções.',
    difficulty: 'hard',
    minLevel: 3,
  },
  {
    name: 'Cliente VIP no WhatsApp do CEO',
    description: 'O cliente mais importante mandou áudio de 7 minutos pro CEO às 23h. O CEO te encaminhou agora.',
    totalPhases: 4,
    rewards: { xp: 45, pc: 3, reputation: 2 },
    openingPrompt: 'Comece a narrar o encounter "Cliente VIP no WhatsApp do CEO". 23h, CEO encaminha áudio de 7min do maior cliente da empresa, furioso. Invente nomes brasileiros: CEO ansioso, Account Manager defensiva, cliente VIP grosso. Descreva o momento em que você ouve o áudio e dê opções.',
    difficulty: 'hard',
    minLevel: 3,
  },
  {
    name: 'Auditoria Externa Sem Aviso',
    description: 'Dois auditores aparecem na recepção pedindo acesso aos seus repositórios e logs dos últimos 6 meses.',
    totalPhases: 5,
    rewards: { xp: 55, pc: 4, reputation: 3 },
    openingPrompt: 'Comece a narrar o encounter "Auditoria Externa Sem Aviso". Dois auditores externos chegam de surpresa pedindo acesso a tudo. Invente nomes brasileiros: auditor sênior frio, auditora júnior detalhista, jurídico interno tenso, Compliance Officer que sumiu convenientemente. Descreva e dê opções.',
    difficulty: 'hard',
    minLevel: 4,
  },
  {
    name: 'Pitch para o Board com 5min de Aviso',
    description: 'O VP foi ao banheiro e te empurrou o slide deck. O Board está te esperando agora.',
    totalPhases: 4,
    rewards: { xp: 50, pc: 4, reputation: 3 },
    openingPrompt: 'Comece a narrar o encounter "Pitch para o Board com 5min de Aviso". VP "passou mal", você herda o pitch para o Board em 5min. Invente nomes brasileiros: presidente do Board cético, board member investidor agressivo, board member ESG questionadora, secretária do board. Descreva e dê opções.',
    difficulty: 'hard',
    minLevel: 4,
  },
  {
    name: 'Reorg às 23h59 de Sexta',
    description: 'Email do RH às 23h59 de sexta: nova estrutura, novo chefe, novo "desafio". Segunda começa em 32h.',
    totalPhases: 5,
    rewards: { xp: 65, pc: 4, reputation: 3 },
    openingPrompt: 'Comece a narrar o encounter "Reorg às 23h59 de Sexta". Email do RH cai sexta 23h59 anunciando reorg total: novo chefe, nova área, time desfeito. Invente nomes brasileiros: novo chefe que você nem conhece, ex-chefe ressentido, colega que virou seu par, RH que sumiu do Slack. Descreva a noite caótica e dê opções.',
    difficulty: 'absurd',
    minLevel: 5,
  },
  {
    name: 'Ex-funcionário Voltou como Seu Chefe',
    description: 'Aquele cara que você ajudou a demitir há 2 anos voltou. Como VP. Da sua área.',
    totalPhases: 5,
    rewards: { xp: 70, pc: 5, reputation: 4 },
    openingPrompt: 'Comece a narrar o encounter "Ex-funcionário Voltou como Seu Chefe". O cara que você ajudou a demitir há 2 anos voltou como VP da sua área. Hoje é o 1on1 inaugural. Invente nomes brasileiros: o ex-demitido agora VP (lembra de tudo), aliada antiga sua que ficou neutra, RH que aprovou a contratação. Descreva a tensão e dê opções.',
    difficulty: 'absurd',
    minLevel: 6,
  },
  {
    name: 'Vazamento Interno na Imprensa',
    description: 'Sua mensagem privada do Slack está na manchete do portal de tecnologia mais lido do Brasil.',
    totalPhases: 5,
    rewards: { xp: 80, pc: 6, reputation: 5 },
    openingPrompt: 'Comece a narrar o encounter "Vazamento Interno na Imprensa". Print da sua mensagem privada do Slack está na capa do maior portal tech do país, fora de contexto. Invente nomes brasileiros: jornalista que assinou, head de comunicação em surto, jurídico procurando culpado, CEO que ainda nem leu mas vai. Descreva o momento em que descobre e dê opções.',
    difficulty: 'absurd',
    minLevel: 7,
  },
];

const DIFFICULTY_WEIGHTS: Record<EncounterDifficulty, [number, number, number, number]> = {
  // [easy, medium, hard, absurd] for level brackets [1-2, 3-5, 6-7, 8+]
  easy:   [5, 2, 1, 0],
  medium: [3, 4, 2, 1],
  hard:   [1, 3, 4, 2],
  absurd: [0, 1, 3, 5],
};

function difficultyWeightForLevel(diff: EncounterDifficulty, level: number): number {
  const bracket = level <= 2 ? 0 : level <= 5 ? 1 : level <= 7 ? 2 : 3;
  return DIFFICULTY_WEIGHTS[diff][bracket];
}

/**
 * Picks an encounter template appropriate for the player's level,
 * avoiding recently played names and weighting by difficulty bracket.
 */
export function pickEncounterTemplate(level: number, recentNames: string[] = []): EncounterTemplate {
  const eligible = ENCOUNTERS.filter(t => t.minLevel <= level);
  const fresh = eligible.filter(t => !recentNames.includes(t.name));
  const pool = fresh.length > 0 ? fresh : eligible;

  const weights = pool.map(t => Math.max(1, difficultyWeightForLevel(t.difficulty, level)));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

/** Picks N distinct templates for "next adventure" suggestions. */
export function pickNextEncounters(level: number, n: number, excludeNames: string[] = []): EncounterTemplate[] {
  const picked: EncounterTemplate[] = [];
  const exclude = [...excludeNames];
  for (let i = 0; i < n; i++) {
    const eligible = ENCOUNTERS.filter(t => t.minLevel <= level && !exclude.includes(t.name));
    if (eligible.length === 0) break;
    const weights = eligible.map(t => Math.max(1, difficultyWeightForLevel(t.difficulty, level)));
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    let chosen = eligible[eligible.length - 1];
    for (let j = 0; j < eligible.length; j++) {
      r -= weights[j];
      if (r <= 0) { chosen = eligible[j]; break; }
    }
    picked.push(chosen);
    exclude.push(chosen.name);
  }
  return picked;
}

export function createEncounterFromTemplate(template: EncounterTemplate, level: number = 1): EncounterState {
  return {
    name: template.name,
    description: template.description,
    phase: 1,
    totalPhases: template.totalPhases,
    completed: false,
    rewards: template.rewards,
  };
}

export function createTutorialEncounter(level: number = 1): EncounterState {
  return createEncounterFromTemplate(ENCOUNTERS[0], level);
}

/** Picks a fresh encounter for the player's level, avoiding recent ones. */
export function pickEncounterForLevel(level: number, recentNames: string[] = []): EncounterState {
  const template = pickEncounterTemplate(level, recentNames);
  return createEncounterFromTemplate(template, level);
}

export function advancePhase(encounter: EncounterState): EncounterState {
  const next = encounter.phase + 1;
  if (next > encounter.totalPhases) {
    return { ...encounter, completed: true };
  }
  return { ...encounter, phase: next };
}
