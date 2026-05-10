import { ClassData, BackgroundData, AlignmentData, Feat, ClassName, Attributes } from './types';

export const CLASSES: ClassData[] = [
  {
    name: 'PM',
    equivalent: 'Bard',
    primaryAttribute: 'INF',
    bonuses: { INF: 2, AWA: 1 },
    penalty: '-2 em checks técnicos solo (sem engineer)',
    resources: { energy: 10, politicalCapital: 3, reputation: 0 },
    abilities: [
      { name: 'Alinhamento Forçado', description: 'Re-roll social se mencionar framework (OKR, RICE, etc.)', uses: '1x/sessão' },
      { name: 'Visão de Roadmap', description: '+2 em checks de planejamento', uses: 'Passiva' },
    ],
    inventory: ['Laptop com 47 abas', 'Caderno com anotações ilegíveis', 'Café frio', 'Acesso ao Jira'],
    flavor: 'Você não escreve código nem fecha deal, mas sem você nada acontece.',
    icon: '📋',
  },
  {
    name: 'Engineer',
    equivalent: 'Wizard',
    primaryAttribute: 'TEC',
    bonuses: { TEC: 3, EXE: 1 },
    penalty: '-2 em checks políticos puros',
    resources: { energy: 8, politicalCapital: 1, reputation: 0 },
    abilities: [
      { name: 'Debug da Realidade', description: 'Pedir detalhes técnicos específicos ao DM', uses: '2x/sessão' },
      { name: 'Sentir Dívida Técnica', description: 'Percebe riscos técnicos automaticamente', uses: 'Passiva' },
    ],
    inventory: ['Laptop com terminal customizado', 'Fone noise-canceling', 'Caneca de framework obscuro'],
    flavor: 'Você constrói o que outros só sonham. E conserta o que outros quebram.',
    icon: '💻',
  },
  {
    name: 'Designer',
    equivalent: 'Sorcerer',
    primaryAttribute: 'CRE',
    bonuses: { CRE: 3, INF: 1 },
    penalty: '-1 em tasks repetitivas (drenam mais energia)',
    resources: { energy: 10, politicalCapital: 2, reputation: 0 },
    abilities: [
      { name: 'Mostrar é Melhor', description: 'Substitui INF por CRE se tiver visual', uses: '1x/sessão' },
      { name: 'Empatia com Usuário', description: '+2 em argumentos de UX', uses: 'Passiva' },
    ],
    inventory: ['MacBook com Figma', 'Sketch pad', 'Post-its coloridos'],
    flavor: 'Você vê o mundo como deveria ser.',
    icon: '🎨',
  },
  {
    name: 'Data Analyst',
    equivalent: 'Cleric',
    primaryAttribute: 'TEC',
    bonuses: { TEC: 2, AWA: 2 },
    penalty: '-1 em checks que exigem resposta imediata',
    resources: { energy: 10, politicalCapital: 2, reputation: 0 },
    abilities: [
      { name: 'Verdade dos Dados', description: 'Pedir fato numérico ao DM', uses: '2x/sessão' },
      { name: 'Imunidade à Paralisia', description: 'Sem penalidade por pedir tempo de análise', uses: 'Passiva' },
    ],
    inventory: ['Laptop com 15 queries salvas', 'Dashboard bookmarkado', 'Planilha com macros'],
    flavor: 'Enquanto outros opinam, você sabe.',
    icon: '📊',
  },
  {
    name: 'Sales',
    equivalent: 'Rogue',
    primaryAttribute: 'INF',
    bonuses: { INF: 3, CRE: 1 },
    penalty: '-3 TEC (não fala essa língua)',
    resources: { energy: 12, politicalCapital: 4, reputation: 1 },
    abilities: [
      { name: 'Fechar Qualquer Coisa', description: 'Vantagem em INF se tiver algo em jogo', uses: '1x/sessão' },
      { name: 'Alavancagem de Relação', description: 'Gastar PC para +2 em check social', uses: 'Passiva' },
    ],
    inventory: ['Celular com 200 contatos', 'CRM atualizado', 'Casaco na cadeira', 'Energy drink'],
    flavor: 'Você promete a lua. O resto é problema de produto.',
    icon: '🤝',
  },
  {
    name: 'Manager',
    equivalent: 'Fighter',
    primaryAttribute: 'RES',
    bonuses: { RES: 3, INF: 1 },
    penalty: '-2 em checks para ganhar crédito individual',
    resources: { energy: 12, politicalCapital: 3, reputation: 1 },
    abilities: [
      { name: 'Absorver o Golpe', description: 'Assumir consequência negativa de membro do time', uses: '2x/sessão' },
      { name: 'Escudo Burocrático', description: '+2 contra pedidos que prejudicariam o time', uses: 'Passiva' },
    ],
    inventory: ['Agenda de 1:1s', 'Template de feedback', 'Ibuprofeno', 'Foto do time'],
    flavor: 'Você não brilha. Você faz os outros brilharem.',
    icon: '🛡️',
  },
];

export const BACKGROUNDS: BackgroundData[] = [
  { name: 'Startup Survivor', bonus: '+2 RES, +1 CRE', description: 'Sobreviveu a 3 pivots e um layoff', attributeBonus: { RES: 2, CRE: 1 } },
  { name: 'Corporate Lifer', bonus: '+2 AWA, +1 INF', description: 'Conhece todos os atalhos políticos', attributeBonus: { AWA: 2, INF: 1 } },
  { name: 'Consultancy Refugee', bonus: '+2 INF, +1 EXE', description: 'Slides bonitos, entrega questionável', attributeBonus: { INF: 2, EXE: 1 } },
  { name: 'Academia Escapee', bonus: '+2 TEC, +1 CRE', description: 'PhD incompleto, paciência completa', attributeBonus: { TEC: 2, CRE: 1 } },
  { name: 'Freelance Convert', bonus: '+2 EXE, +1 CRE', description: 'Saudade de trabalhar de pijama', attributeBonus: { EXE: 2, CRE: 1 } },
  { name: 'Career Switcher', bonus: '+2 CRE, +1 AWA', description: 'Saiu de analytics, quer mais ownership', attributeBonus: { CRE: 2, AWA: 1 } },
];

export const ALIGNMENTS: AlignmentData[] = [
  { alignment: 'Lawful Good', translation: 'Segue as regras e protege o time', law: 'Lawful', moral: 'Good' },
  { alignment: 'Neutral Good', translation: 'Faz o certo, flexível no como', law: 'Neutral', moral: 'Good' },
  { alignment: 'Chaotic Good', translation: '"Peço perdão, não permissão"', law: 'Chaotic', moral: 'Good' },
  { alignment: 'Lawful Neutral', translation: 'Vive pelo processo, morre pelo processo', law: 'Lawful', moral: 'Neutral' },
  { alignment: 'True Neutral', translation: 'Sobrevivente político puro', law: 'Neutral', moral: 'Neutral' },
  { alignment: 'Chaotic Neutral', translation: 'Wildcard. Pode salvar ou explodir o projeto', law: 'Chaotic', moral: 'Neutral' },
  { alignment: 'Lawful Evil', translation: 'Sobe na carreira sem quebrar regras (assustador)', law: 'Lawful', moral: 'Evil' },
  { alignment: 'Neutral Evil', translation: 'Oportunista frio', law: 'Neutral', moral: 'Evil' },
  { alignment: 'Chaotic Evil', translation: 'Liderança tóxica em pessoa', law: 'Chaotic', moral: 'Evil' },
];

export const SUGGESTED_ARRAYS: Record<ClassName, Attributes> = {
  PM:             { EXE: 12, INF: 15, TEC: 8, RES: 10, CRE: 13, AWA: 14 },
  Engineer:       { EXE: 13, INF: 8, TEC: 15, RES: 10, CRE: 12, AWA: 14 },
  Designer:       { EXE: 10, INF: 13, TEC: 8, RES: 12, CRE: 15, AWA: 14 },
  'Data Analyst': { EXE: 12, INF: 8, TEC: 15, RES: 10, CRE: 13, AWA: 14 },
  Sales:          { EXE: 12, INF: 15, TEC: 8, RES: 10, CRE: 14, AWA: 13 },
  Manager:        { EXE: 13, INF: 14, TEC: 8, RES: 15, CRE: 10, AWA: 12 },
};

export const FREE_POINTS = 2;

export const ALIGNMENT_TRANSLATIONS: Record<ClassName, Record<string, string>> = {
  PM: {
    'Lawful Good': 'O PM que todo mundo ama mas nunca promovem',
    'Neutral Good': 'Prioriza o usuário, negocia o escopo',
    'Chaotic Good': 'Ignora o backlog e resolve o que importa',
    'Lawful Neutral': 'Segue o roadmap custe o que custar',
    'True Neutral': 'Balanceia stakeholders como um malabarista',
    'Chaotic Neutral': 'Muda a prioridade toda segunda-feira',
    'Lawful Evil': 'Usa métricas para justificar qualquer decisão',
    'Neutral Evil': 'Rouba crédito do time com maestria',
    'Chaotic Evil': 'Promete features impossíveis e culpa engenharia',
  },
  Engineer: {
    'Lawful Good': 'Escreve testes, documenta e faz code review justo',
    'Neutral Good': 'Resolve o bug em prod às 3h da manhã sem reclamar',
    'Chaotic Good': 'Refatora tudo sem avisar, mas fica melhor',
    'Lawful Neutral': 'Segue o padrão do time religiosamente',
    'True Neutral': 'Código compila, tarefa fechada, tchau',
    'Chaotic Neutral': 'Usa framework novo em prod "pra testar"',
    'Lawful Evil': 'Cria dívida técnica proposital pra ser indispensável',
    'Neutral Evil': 'Faz deploy na sexta e sai de férias',
    'Chaotic Evil': 'Força push na main sem remorso',
  },
  Designer: {
    'Lawful Good': 'Design system impecável, acessibilidade sempre',
    'Neutral Good': 'Defende o usuário nas reuniões com dados',
    'Chaotic Good': 'Redesenha a tela inteira sem pedir',
    'Lawful Neutral': 'Pixel perfect ou não entrega',
    'True Neutral': 'Entrega o Figma e deixa o dev se virar',
    'Chaotic Neutral': 'Muda a paleta de cores toda sprint',
    'Lawful Evil': 'Dark patterns "sutis" que ninguém nota',
    'Neutral Evil': 'Entrega mockup lindo que é impossível de implementar',
    'Chaotic Evil': 'Remove o botão de cancelar assinatura',
  },
  'Data Analyst': {
    'Lawful Good': 'Dashboard transparente com todos os dados',
    'Neutral Good': 'Encontra o insight que salva o quarter',
    'Chaotic Good': 'Prova que o chefe está errado com dados',
    'Lawful Neutral': 'Só reporta o que o SQL retorna',
    'True Neutral': 'Os dados são os dados, sem opinião',
    'Chaotic Neutral': 'Muda a métrica de sucesso toda semana',
    'Lawful Evil': 'Cherry-pick de dados pra confirmar qualquer tese',
    'Neutral Evil': 'Esconde o dado que prejudica seu time',
    'Chaotic Evil': 'Manipula o dashboard antes da board meeting',
  },
  Sales: {
    'Lawful Good': 'Vende só o que o produto realmente faz',
    'Neutral Good': 'Fecha deal bom pro cliente e pra empresa',
    'Chaotic Good': 'Dá desconto sem autorização pra ajudar o cliente',
    'Lawful Neutral': 'Segue o playbook de vendas à risca',
    'True Neutral': 'Bate meta, vai embora, sem drama',
    'Chaotic Neutral': 'Promete a lua e deixa o CS resolver',
    'Lawful Evil': 'Upsell agressivo dentro do contrato',
    'Neutral Evil': 'Rouba lead do colega na cara dura',
    'Chaotic Evil': 'Vende feature que não existe e sai da empresa',
  },
  Manager: {
    'Lawful Good': 'Protege o time e dá crédito a quem merece',
    'Neutral Good': 'Bloqueia reunião inútil pra equipe focar',
    'Chaotic Good': 'Ignora processo pra dar promoção merecida',
    'Lawful Neutral': 'Segue o handbook de RH sem questionar',
    'True Neutral': 'Gerencia pelo mínimo esforço necessário',
    'Chaotic Neutral': 'Muda a estrutura do time toda sprint',
    'Lawful Evil': 'Usa o PIP como ferramenta de poder',
    'Neutral Evil': 'Toma crédito do time na reunião de diretoria',
    'Chaotic Evil': 'Microgerencia e culpa o time pelo burnout',
  },
};

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export const ATTRIBUTE_NAMES: { key: string; name: string; abbr: string; description: string }[] = [
  { key: 'EXE', name: 'Execução', abbr: 'EXE', description: 'Capacidade de entregar, tirar do papel' },
  { key: 'INF', name: 'Influência', abbr: 'INF', description: 'Persuasão, negociação, política' },
  { key: 'TEC', name: 'Técnica', abbr: 'TEC', description: 'Profundidade técnica, código, dados' },
  { key: 'RES', name: 'Resiliência', abbr: 'RES', description: 'Resistência a burnout e pressão' },
  { key: 'CRE', name: 'Criatividade', abbr: 'CRE', description: 'Pensamento lateral, soluções inesperadas' },
  { key: 'AWA', name: 'Percepção', abbr: 'AWA', description: 'Leitura de sala, timing político' },
];

export const FEATS: Feat[] = [
  // ─── Universais (disponíveis para todas as classes) ───
  { name: 'Comunicação Assertiva', description: 'Vantagem em checks de comunicação direta', effect: 'Vantagem em INF direto', category: 'communication' },
  { name: 'Leitura de Sala', description: '+3 AWA em reuniões com 3+ pessoas', effect: '+3 AWA contextual', category: 'communication' },
  { name: 'Pensamento Lateral', description: 'Pode propor solução fora do escopo', effect: 'Solução criativa', category: 'creative' },

  // ─── PM (Product Manager) ───
  { name: 'Scope Defender', description: 'Vantagem contra scope creep e pedidos de última hora', effect: 'Vantagem anti-scope', category: 'leadership', classes: ['PM', 'Manager'] },
  { name: 'Framework Master', description: 'Re-roll social ao citar framework reconhecido (RICE, OKR, JTBD)', effect: 'Re-roll citando framework', category: 'communication', classes: ['PM'] },
  { name: 'Roadmap Visionário', description: '+3 em checks de planejamento de longo prazo', effect: '+3 planejamento', category: 'leadership', classes: ['PM'] },
  { name: 'Stakeholder Whisperer', description: 'Vantagem ao alinhar 2+ stakeholders conflitantes', effect: 'Vantagem multi-stakeholder', category: 'communication', classes: ['PM'] },
  { name: 'Discovery Rápido', description: '+2 AWA ao identificar a verdadeira dor do usuário', effect: '+2 AWA discovery', category: 'creative', classes: ['PM', 'Designer'] },

  // ─── Engineer ───
  { name: 'Debug Master', description: 'Vantagem em checks de troubleshooting e investigação técnica', effect: 'Vantagem TEC debug', category: 'technical', classes: ['Engineer'] },
  { name: 'Refactor Ninja', description: 'Re-roll em checks técnicos se aceitar +1 turno de delay', effect: 'Re-roll TEC com custo', category: 'technical', classes: ['Engineer'] },
  { name: 'Sentir Dívida Técnica', description: '+3 AWA para detectar riscos arquiteturais escondidos', effect: '+3 AWA tech debt', category: 'technical', classes: ['Engineer'] },
  { name: 'Code Review Cirúrgico', description: 'Vantagem ao apontar falhas em proposta técnica alheia', effect: 'Vantagem crítica técnica', category: 'technical', classes: ['Engineer'] },
  { name: 'Prototype Fast', description: '+3 CRE ao entregar MVP funcional em vez de plano', effect: '+3 CRE MVP', category: 'creative', classes: ['Engineer', 'Designer'] },
  { name: 'Jargão Técnico', description: '+2 INF ao defender posição com termos técnicos corretos', effect: '+2 INF técnico', category: 'communication', classes: ['Engineer', 'Data Analyst'] },

  // ─── Designer ───
  { name: 'Mostrar é Melhor', description: 'Substitui INF por CRE quando apresenta visual/protótipo', effect: 'CRE no lugar de INF', category: 'creative', classes: ['Designer'] },
  { name: 'Empatia com Usuário', description: '+3 em argumentos baseados em research de UX', effect: '+3 argumento UX', category: 'communication', classes: ['Designer'] },
  { name: 'Storytelling Visual', description: 'Vantagem ao apresentar narrativa com mockups', effect: 'Vantagem apresentação', category: 'creative', classes: ['Designer'] },
  { name: 'Crítica Construtiva', description: '+2 INF ao dar feedback de design sem ofender', effect: '+2 INF feedback', category: 'communication', classes: ['Designer', 'Manager'] },
  { name: 'Design Systems', description: '+3 EXE em entregas que reusam componentes existentes', effect: '+3 EXE com sistema', category: 'technical', classes: ['Designer'] },

  // ─── Data Analyst ───
  { name: 'Verdade dos Dados', description: 'Vantagem em qualquer check sustentado por dado quantitativo', effect: 'Vantagem com dado', category: 'technical', classes: ['Data Analyst'] },
  { name: 'SQL Sniper', description: '+3 TEC em queries complexas e análise ad-hoc', effect: '+3 TEC query', category: 'technical', classes: ['Data Analyst'] },
  { name: 'Storytelling com Dados', description: '+2 INF ao apresentar insight com gráfico claro', effect: '+2 INF com gráfico', category: 'communication', classes: ['Data Analyst'] },
  { name: 'Detector de Vanity Metric', description: 'Vantagem AWA ao questionar métrica enganosa', effect: 'Vantagem anti-vanity', category: 'technical', classes: ['Data Analyst', 'PM'] },
  { name: 'Automação', description: '+3 EXE em tarefas repetitivas (scripts, relatórios)', effect: '+3 EXE repetitivo', category: 'technical', classes: ['Engineer', 'Data Analyst'] },

  // ─── Sales ───
  { name: 'Fechar Qualquer Coisa', description: 'Vantagem em INF quando há algo concreto em jogo (deal, deadline)', effect: 'Vantagem INF com stakes', category: 'communication', classes: ['Sales'] },
  { name: 'Quebra-Gelo', description: '+3 INF no primeiro contato com pessoa nova', effect: '+3 INF primeira impressão', category: 'communication', classes: ['Sales'] },
  { name: 'Negociador Calejado', description: 'Re-roll ao negociar prazo, preço ou recurso', effect: 'Re-roll negociação', category: 'communication', classes: ['Sales'] },
  { name: 'Network Vasto', description: 'Pode invocar contato relevante 1x/sessão (DM aprova)', effect: 'Invocar contato', category: 'leadership', classes: ['Sales'] },
  { name: 'Faro de Oportunidade', description: '+2 AWA para identificar deal escondido em conversa', effect: '+2 AWA oportunidade', category: 'communication', classes: ['Sales', 'PM'] },
  { name: 'Lidando com Não', description: '+3 RES contra rejeição, segue tentando sem dano', effect: '+3 RES rejeição', category: 'leadership', classes: ['Sales'] },

  // ─── Manager ───
  { name: 'Absorver o Golpe', description: 'Pode tomar consequência negativa no lugar de subordinado', effect: 'Trocar dano por aliado', category: 'leadership', classes: ['Manager'] },
  { name: 'Escudo Burocrático', description: '+3 contra pedidos absurdos vindos de cima', effect: '+3 anti-pedido', category: 'leadership', classes: ['Manager'] },
  { name: 'Mentor Natural', description: '+2 em checks ao ajudar/desbloquear colega', effect: '+2 mentoria', category: 'leadership', classes: ['Manager'] },
  { name: '1:1 Eficaz', description: 'Vantagem em INF em conversa privada com 1 pessoa', effect: 'Vantagem INF 1:1', category: 'communication', classes: ['Manager'] },
  { name: 'Delegação Cirúrgica', description: '+3 EXE ao distribuir tarefa para a pessoa certa do time', effect: '+3 EXE delegando', category: 'leadership', classes: ['Manager'] },
  { name: 'Email Perfeito', description: 'Re-roll em comunicação escrita formal', effect: 'Re-roll escrita', category: 'communication', classes: ['Manager', 'PM'] },
];
