# CORPORATE QUEST — Plano de Implementação para Claude Code

> Documento de planejamento técnico para construção do jogo no Claude Code.
> Baseado no GDD de 1892 linhas (GAME_DESIGN.md).

---

## VISÃO GERAL DO PROJETO

### O que é
RPG de comédia corporativa com LLM como Dungeon Master. Mecânicas D&D 3e simplificadas. 
Dois modos: Sessão Única (~1h) e Campanha (multi-sessão com save).

### Stack Final
```
Backend:     Python 3.11+ (engine de regras)
LLM:         LiteLLM (multi-provider)
Database:    SQLite (dev) → PostgreSQL (prod)
Frontend:    React + Canvas (visual)
Data:        YAML (regras, classes, NPCs)
Config:      YAML (settings do usuário)
```

### Estrutura Alvo
```
corporate-quest/
├── engine/           # Core do jogo
│   ├── core.py       # Game loop principal
│   ├── dice.py       # Sistema de dados
│   ├── checks.py     # Resolução d20 + mods
│   ├── character.py  # Criação e gestão de personagem
│   ├── combat.py     # (na verdade "encounter") resolução de cenas
│   ├── resources.py  # Energy, PC, Reputation
│   └── state.py      # Estado do jogo
├── llm/              # Integração com LLM
│   ├── adapter.py    # Interface unificada
│   ├── prompts/      # System prompts
│   └── providers/    # Configurações por provider
├── data/             # Arquivos YAML
│   ├── attributes.yaml
│   ├── classes.yaml
│   ├── feats.yaml
│   ├── backgrounds.yaml
│   ├── alignments.yaml
│   ├── npcs.yaml
│   ├── encounters/
│   │   ├── tutorial/
│   │   └── campaign/
│   └── lores/
│       ├── techcorp.yaml
│       ├── megacorp.yaml
│       ├── creative_chaos.yaml
│       └── consultoria_infinita.yaml
├── saves/            # Saves dos jogadores
├── frontend/         # React app
│   ├── components/
│   │   ├── CorporateQuestScene.jsx
│   │   ├── CharacterSheet.jsx
│   │   ├── DiceRoll.jsx
│   │   └── StatusBar.jsx
│   └── ...
├── tests/            # Testes unitários
├── config.yaml       # Config do usuário
├── requirements.txt
└── README.md
```

---

## FASES DE IMPLEMENTAÇÃO

### Diagrama de Dependências

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  FASE 1: DATA LAYER                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ YAMLs: attributes, classes, feats, backgrounds, NPCs   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  FASE 2: ENGINE CORE                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ dice.py → checks.py → character.py → resources.py      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  FASE 3: GAME LOOP + STATE                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ state.py → core.py → encounter.py                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│              ┌───────────────┼───────────────┐                 │
│              ▼               ▼               ▼                 │
│  FASE 4: CLI         FASE 5: LLM      FASE 6: PERSISTÊNCIA    │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐   │
│  │ cli.py       │   │ adapter.py   │   │ SQLite/Postgres  │   │
│  │ (play test)  │   │ prompts/     │   │ saves/           │   │
│  └──────────────┘   └──────────────┘   └──────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  FASE 7: FRONTEND REACT                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ CorporateQuestScene.jsx (já temos draft)                │   │
│  │ + integração com backend via API                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│              ┌───────────────┼───────────────┐                 │
│              ▼               ▼               ▼                 │
│  FASE 8: ONBOARDING   FASE 9: CAREER   FASE 10: MULTIPLAYER   │
│  ┌──────────────┐    ┌──────────────┐   ┌──────────────────┐  │
│  │ Lores        │    │ Transições   │   │ Turnos simult.   │  │
│  │ Tutorial     │    │ Propostas    │   │ Alianças         │  │
│  └──────────────┘    └──────────────┘   └──────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## FASE 1: DATA LAYER (YAMLs)

### Objetivo
Criar todos os arquivos de dados que a engine vai consumir.

### Arquivos a Criar

#### 1.1 `data/attributes.yaml`
```yaml
attributes:
  - id: EXE
    name: Execution
    description: "Capacidade de entregar, tirar do papel"
    used_in:
      - "Entregas"
      - "Sprints"
      - "Deadlines"

  - id: INF
    name: Influence
    description: "Persuasão, negociação, política"
    used_in:
      - "Reuniões"
      - "Negociações"
      - "Política"

  - id: TEC
    name: Technical
    description: "Profundidade técnica, código, dados"
    used_in:
      - "Discussões técnicas"
      - "Troubleshooting"

  - id: RES
    name: Resilience
    description: "Resistência a burnout e pressão"
    used_in:
      - "Crises"
      - "Conflitos"
      - "Pressão"

  - id: CRE
    name: Creativity
    description: "Pensamento lateral, soluções inesperadas"
    used_in:
      - "Problemas complexos"
      - "Improvisos"

  - id: AWA
    name: Awareness
    description: "Leitura de sala, timing político"
    used_in:
      - "Política"
      - "Reuniões sensíveis"

generation_methods:
  standard_array: [15, 14, 13, 12, 10, 8]
  point_buy:
    points: 27
    min: 8
    max: 15
    costs:
      8: 0
      9: 1
      10: 2
      11: 3
      12: 4
      13: 5
      14: 7
      15: 9
```

#### 1.2 `data/classes.yaml`
```yaml
classes:
  - id: pm
    name: Product Manager
    dnd_equivalent: Bard
    primary_attribute: INF
    bonuses:
      INF: 2
      AWA: 1
    penalties:
      - type: conditional
        condition: "solo_technical_check"
        modifier: -2
    starting_resources:
      energy: 10
      political_capital: 3
      reputation: 0
    abilities:
      - id: forced_alignment
        name: "Alinhamento Forçado"
        type: active
        uses_per_session: 1
        description: "Re-roll social se mencionar framework (OKR, RICE, etc.)"
        trigger: "Mencionar framework de produto"
        effect: "Pode refazer o roll"
      - id: roadmap_vision
        name: "Visão de Roadmap"
        type: passive
        description: "+2 em checks de planejamento"
        effect:
          check_type: "planning"
          modifier: 2
    starting_inventory:
      - "Laptop com 47 abas"
      - "Caderno com anotações ilegíveis"
      - "Café frio"
      - "Acesso ao Jira"
    flavor: "Você não escreve código nem fecha deal, mas sem você nada acontece."

  - id: engineer
    name: Engineer
    dnd_equivalent: Wizard
    primary_attribute: TEC
    bonuses:
      TEC: 3
      EXE: 1
    penalties:
      - type: conditional
        condition: "political_check"
        modifier: -2
    starting_resources:
      energy: 8
      political_capital: 1
      reputation: 0
    abilities:
      - id: debug_reality
        name: "Debug da Realidade"
        type: active
        uses_per_session: 2
        description: "Pedir detalhes técnicos específicos ao DM"
        trigger: "Investigar problema técnico"
        effect: "DM deve fornecer informação técnica adicional"
      - id: tech_debt_sense
        name: "Sentir Dívida Técnica"
        type: passive
        description: "Percebe riscos técnicos automaticamente"
        effect: "DM alerta sobre riscos técnicos ocultos"
    starting_inventory:
      - "Laptop com terminal customizado"
      - "Fone noise-canceling"
      - "Caneca de framework obscuro"
    flavor: "Você constrói o que outros só sonham. E conserta o que outros quebram."

  - id: designer
    name: Designer
    dnd_equivalent: Sorcerer
    primary_attribute: CRE
    bonuses:
      CRE: 3
      INF: 1
    penalties:
      - type: energy_drain
        condition: "repetitive_task"
        modifier: 1  # drena 1 energy extra
    starting_resources:
      energy: 10
      political_capital: 2
      reputation: 0
    abilities:
      - id: show_dont_tell
        name: "Mostrar é Melhor"
        type: active
        uses_per_session: 1
        description: "Substitui INF por CRE se tiver visual"
        trigger: "Apresentar com visual"
        effect: "Usa CRE em vez de INF"
      - id: user_empathy
        name: "Empatia com Usuário"
        type: passive
        description: "+2 em argumentos de UX"
        effect:
          check_type: "ux_argument"
          modifier: 2
    starting_inventory:
      - "MacBook com Figma"
      - "Sketch pad"
      - "Post-its coloridos"
    flavor: "Você vê o mundo como ele deveria ser."

  - id: data_analyst
    name: Data Analyst
    dnd_equivalent: Cleric
    primary_attribute: TEC
    bonuses:
      TEC: 2
      AWA: 2
    penalties:
      - type: conditional
        condition: "immediate_response"
        modifier: -1
    starting_resources:
      energy: 10
      political_capital: 2
      reputation: 0
    abilities:
      - id: data_truth
        name: "Verdade dos Dados"
        type: active
        uses_per_session: 2
        description: "Pedir fato numérico ao DM"
        trigger: "Questionar com dados"
        effect: "DM fornece número relevante"
      - id: analysis_immunity
        name: "Imunidade à Paralisia"
        type: passive
        description: "Sem penalidade por pedir tempo de análise"
        effect: "Pode pedir tempo sem custo de turno"
    starting_inventory:
      - "Laptop com 15 queries salvas"
      - "Dashboard bookmarkado"
      - "Planilha com macros"
    flavor: "Enquanto outros opinam, você sabe."

  - id: sales
    name: Sales
    dnd_equivalent: Rogue
    primary_attribute: INF
    bonuses:
      INF: 3
      CRE: 1
    penalties:
      - type: flat
        attribute: TEC
        modifier: -3
    starting_resources:
      energy: 12
      political_capital: 4
      reputation: 1
    abilities:
      - id: closing_instinct
        name: "Instinto de Fechamento"
        type: active
        uses_per_session: 1
        description: "Forçar decisão imediata"
        trigger: "Negociação arrastada"
        effect: "Força resolução neste turno"
      - id: client_shield
        name: "Escudo de Cliente"
        type: passive
        description: "Invocar 'cliente pediu' dá +3 INF"
        effect:
          trigger: "Mencionar pedido de cliente"
          modifier: 3
    starting_inventory:
      - "Smartphone com 3 baterias externas"
      - "Cartão corporativo"
      - "Slides de deck comercial"
    flavor: "Você transforma 'não' em 'talvez' e 'talvez' em contrato assinado."

  - id: manager
    name: Manager
    dnd_equivalent: Fighter
    primary_attribute: RES
    bonuses:
      RES: 3
      INF: 1
    penalties:
      - type: conditional
        condition: "hands_on_execution"
        modifier: -2
    starting_resources:
      energy: 12
      political_capital: 3
      reputation: 0
    abilities:
      - id: delegation
        name: "Delegar"
        type: active
        uses_per_session: 2
        description: "Passar task pra NPC competente"
        trigger: "Task que pode ser delegada"
        effect: "NPC resolve com seu próprio check"
      - id: air_cover
        name: "Cobertura Aérea"
        type: passive
        description: "Equipe tem +1 em checks enquanto manager presente"
        effect:
          scope: "party"
          modifier: 1
    starting_inventory:
      - "Calendário lotado"
      - "Acesso a budget"
      - "Lista de 1:1s atrasados"
    flavor: "Você não faz o trabalho, você faz o trabalho acontecer."
```

#### 1.3 `data/feats.yaml`
```yaml
feats:
  # Feats de Comunicação
  - id: data_driven
    name: "Data-Driven"
    category: communication
    prerequisite: "TEC ≥ 12 ou classe Data Analyst"
    effect: "+2 em argumentos com números"
    mechanics:
      trigger: "Argumento com dados"
      modifier: 2
      attribute: INF

  - id: storyteller
    name: "Storyteller"
    category: communication
    prerequisite: "CRE ≥ 14"
    effect: "Pode substituir TEC por CRE ao explicar conceitos"
    mechanics:
      trigger: "Explicação técnica"
      replace_attribute:
        from: TEC
        to: CRE

  - id: executive_presence
    name: "Executive Presence"
    category: communication
    prerequisite: "INF ≥ 14, nível 3+"
    effect: "+3 em reuniões com C-level, -1 com ICs"
    mechanics:
      context_modifiers:
        - context: "c_level_meeting"
          modifier: 3
        - context: "ic_interaction"
          modifier: -1

  # Feats de Execução
  - id: crunch_mode
    name: "Crunch Mode"
    category: execution
    prerequisite: "RES ≥ 12"
    effect: "+3 EXE por 1 encounter, depois -2 Energy"
    mechanics:
      type: "toggle"
      duration: "1_encounter"
      bonus:
        attribute: EXE
        modifier: 3
      cost:
        resource: energy
        amount: 2

  - id: scope_creep_immunity
    name: "Scope Creep Immunity"
    category: execution
    prerequisite: "Classe PM ou Manager"
    effect: "Pode recusar escopo extra sem check"
    mechanics:
      trigger: "Tentativa de adicionar escopo"
      effect: "Auto-success em recusar"

  - id: automation_mindset
    name: "Automation Mindset"
    category: execution
    prerequisite: "TEC ≥ 14"
    effect: "Tasks repetitivas não drenam Energy extra"
    mechanics:
      negates: "repetitive_task_energy_drain"

  # Feats Políticos
  - id: coffee_network
    name: "Coffee Network"
    category: political
    prerequisite: "AWA ≥ 10"
    effect: "1x/sessão: saber de fofoca relevante"
    mechanics:
      uses_per_session: 1
      effect: "DM revela informação política"

  - id: blameless
    name: "Blameless"
    category: political
    prerequisite: "INF ≥ 12, AWA ≥ 12"
    effect: "Primeira falha crítica da sessão não afeta Reputation"
    mechanics:
      trigger: "first_critical_failure"
      negates: "reputation_loss"

  - id: political_capital_mastery
    name: "Political Capital Mastery"
    category: political
    prerequisite: "Nível 5+"
    effect: "PC regenera +1 por sessão"
    mechanics:
      resource_regen:
        resource: political_capital
        amount: 1
        frequency: session

  # Feats de Sobrevivência
  - id: burnout_resistant
    name: "Burnout Resistant"
    category: survival
    prerequisite: "RES ≥ 14"
    effect: "Energy mínimo 1 (nunca zera)"
    mechanics:
      floor:
        resource: energy
        minimum: 1

  - id: meeting_survivor
    name: "Meeting Survivor"
    category: survival
    prerequisite: null
    effect: "+2 em checks durante reuniões > 1 hora"
    mechanics:
      context: "long_meeting"
      modifier: 2

  - id: remote_advantage
    name: "Remote Advantage"
    category: survival
    prerequisite: null
    effect: "+1 em todos checks quando trabalhando remoto, -1 presencial"
    mechanics:
      context_modifiers:
        - context: "remote"
          modifier: 1
        - context: "in_person"
          modifier: -1

  # Feats Técnicos
  - id: stack_overflow_warrior
    name: "Stack Overflow Warrior"
    category: technical
    prerequisite: "Classe Engineer"
    effect: "1x/sessão: resolver problema técnico automaticamente (leva tempo)"
    mechanics:
      uses_per_session: 1
      effect: "Auto-success em TEC check"
      cost: "1 turno extra"

  - id: legacy_code_whisperer
    name: "Legacy Code Whisperer"
    category: technical
    prerequisite: "TEC ≥ 16, Engineer nível 5+"
    effect: "+4 em sistemas legados, -2 em greenfield"
    mechanics:
      context_modifiers:
        - context: "legacy_system"
          modifier: 4
        - context: "greenfield"
          modifier: -2
```

#### 1.4 `data/dc_table.yaml`
```yaml
difficulty_classes:
  - level: trivial
    dc: 5
    description: "Qualquer um consegue"
    example: "Encontrar a sala de reunião"

  - level: easy
    dc: 8
    description: "Maioria consegue"
    example: "Pedir mais café"

  - level: moderate
    dc: 10
    description: "Requer algum esforço"
    example: "Conseguir atenção em uma daily"

  - level: challenging
    dc: 13
    description: "Precisa de competência"
    example: "Convencer PM a mudar prioridade"

  - level: difficult
    dc: 15
    description: "Apenas competentes conseguem"
    example: "Negociar deadline com stakeholder irritado"

  - level: very_difficult
    dc: 18
    description: "Experts podem falhar"
    example: "Fazer CEO mudar de ideia"

  - level: nearly_impossible
    dc: 20
    description: "Quase milagre"
    example: "Cancelar projeto pet do VP"

  - level: legendary
    dc: 25
    description: "Lendário"
    example: "Fazer board aprovar algo que não entende"

modifiers:
  advantage:
    description: "Roll 2d20, usa o maior"
    situations:
      - "Apoio de aliado poderoso"
      - "Informação privilegiada"
      - "Preparação extensiva"

  disadvantage:
    description: "Roll 2d20, usa o menor"
    situations:
      - "Oposição ativa"
      - "Sem contexto/preparação"
      - "Reputation negativa com envolvidos"

critical:
  natural_20:
    name: "Sucesso Crítico"
    effects:
      - "Sucesso automático"
      - "+1 Reputation"
      - "Bônus narrativo"

  natural_1:
    name: "Falha Crítica"
    effects:
      - "Falha automática"
      - "Risco de -1 Reputation"
      - "Complicação narrativa"
```

#### 1.5 `data/npcs.yaml`
```yaml
npcs:
  - id: marina
    name: "Marina"
    role: "Tech Lead"
    personality: "Pragmática, direta, levemente cínica"
    visual:
      sprite_color: "#6B7280"
      default_expression: "thinking"
    disposition:
      default: neutral
      likes:
        - "Soluções técnicas elegantes"
        - "Respeito pelo tempo"
      dislikes:
        - "Reuniões desnecessárias"
        - "Scope creep"
    stats:
      TEC: 16
      RES: 14
      INF: 10
    quotes:
      greeting: "Fala. Precisa de algo ou é reunião?"
      annoyed: "Isso poderia ser um Slack."
      pleased: "Finalmente alguém que entende."
    relationship_thresholds:
      ally: 3
      enemy: -3

  - id: caio
    name: "Caio"
    role: "Júnior Ansioso"
    personality: "Entusiasmado demais, tendência a pânico"
    visual:
      sprite_color: "#F59E0B"
      default_expression: "nervous"
    disposition:
      default: friendly
      likes:
        - "Mentoria"
        - "Contexto"
      dislikes:
        - "Ser ignorado"
        - "Ambiguidade"
    stats:
      TEC: 12
      EXE: 14
      AWA: 8
    quotes:
      greeting: "Oi! Precisa de ajuda? Posso ajudar!"
      panic: "Isso vai dar ruim, né? VAI DAR RUIM!"
      calm: "Ah, ok. Então tá tranquilo."
    relationship_thresholds:
      ally: 2
      enemy: -4

  - id: geraldo_vp
    name: "Geraldo"
    role: "VP de Produto"
    personality: "Político, ambicioso, fala em buzzwords"
    visual:
      sprite_color: "#7C3AED"
      default_expression: "confident"
    disposition:
      default: neutral
      likes:
        - "Métricas positivas"
        - "Alinhamento com estratégia"
      dislikes:
        - "Más notícias"
        - "Detalhes técnicos"
    stats:
      INF: 18
      AWA: 16
      TEC: 6
    quotes:
      greeting: "Como estamos performando nos KPIs?"
      pleased: "Isso é exatamente o que o board quer ouvir."
      displeased: "Precisamos alinhar expectativas aqui."
    relationship_thresholds:
      ally: 4
      enemy: -2
    special:
      can_fire: true
      can_promote: true

  - id: patricia_hr
    name: "Patrícia"
    role: "HR Business Partner"
    personality: "Profissional, empática, mas firme"
    visual:
      sprite_color: "#EC4899"
      default_expression: "neutral"
    disposition:
      default: neutral
      likes:
        - "Comunicação clara"
        - "Seguir processos"
      dislikes:
        - "Drama"
        - "Ignorar políticas"
    stats:
      INF: 14
      AWA: 16
      RES: 14
    quotes:
      greeting: "Podemos conversar um minuto?"
      warning: "Isso precisa ser documentado."
      support: "Estou aqui pra ajudar a encontrar uma solução."
    relationship_thresholds:
      ally: 3
      enemy: -3
    special:
      can_fire: true
      can_give_pip: true

  - id: thiago_rival
    name: "Thiago"
    role: "PM Rival"
    personality: "Competitivo, político, sorri enquanto apunhala"
    visual:
      sprite_color: "#EF4444"
      default_expression: "smiling"
    disposition:
      default: unfriendly
      likes:
        - "Quando você falha"
        - "Crédito fácil"
      dislikes:
        - "Você ter sucesso"
        - "Ser exposto"
    stats:
      INF: 16
      AWA: 14
      CRE: 12
    quotes:
      greeting: "E aí, tudo bem? Como tá o projeto?"
      scheming: "Interessante... vou só comentar isso com o Geraldo."
      caught: "Ei, calma, foi mal-entendido!"
    relationship_thresholds:
      ally: 5  # muito difícil
      enemy: -1  # fácil
    special:
      is_rival: true
      steal_credit_threshold: -1
```

### Prompt para Claude Code — Fase 1
```
Leia o arquivo GAME_DESIGN.md.

Crie a estrutura de pastas do projeto corporate-quest.
Depois, crie os seguintes arquivos YAML baseados nas especificações do GDD:

1. data/attributes.yaml — 6 atributos com métodos de geração
2. data/classes.yaml — 6 classes com abilities, recursos, inventário
3. data/feats.yaml — Todos os feats listados no GDD
4. data/dc_table.yaml — Tabela de DCs e modificadores
5. data/npcs.yaml — NPCs principais com stats e quotes

Use o formato YAML mostrado no documento de planejamento.
Garanta que todos os dados sejam parseáveis por Python (PyYAML).
```

---

## FASE 2: ENGINE CORE

### Objetivo
Implementar a engine de regras em Python.

### Arquivos a Criar

#### 2.1 `engine/dice.py`
```python
"""
Sistema de dados para Corporate Quest.
Baseado em d20 system (D&D 3e).
"""
import random
from dataclasses import dataclass
from typing import Optional, Literal

@dataclass
class DiceResult:
    roll: int
    modifier: int
    total: int
    advantage: bool = False
    disadvantage: bool = False
    natural_20: bool = False
    natural_1: bool = False
    
    @property
    def is_critical_success(self) -> bool:
        return self.natural_20
    
    @property
    def is_critical_failure(self) -> bool:
        return self.natural_1

def roll_d20(
    modifier: int = 0,
    advantage: bool = False,
    disadvantage: bool = False
) -> DiceResult:
    """
    Rola 1d20 com modificador.
    Advantage: rola 2d20, usa o maior.
    Disadvantage: rola 2d20, usa o menor.
    """
    if advantage and disadvantage:
        # Se ambos, cancelam
        advantage = False
        disadvantage = False
    
    if advantage:
        rolls = [random.randint(1, 20), random.randint(1, 20)]
        roll = max(rolls)
    elif disadvantage:
        rolls = [random.randint(1, 20), random.randint(1, 20)]
        roll = min(rolls)
    else:
        roll = random.randint(1, 20)
    
    return DiceResult(
        roll=roll,
        modifier=modifier,
        total=roll + modifier,
        advantage=advantage,
        disadvantage=disadvantage,
        natural_20=(roll == 20),
        natural_1=(roll == 1)
    )

def roll_nd6(n: int, drop_lowest: bool = False) -> list[int]:
    """
    Rola Nd6, opcionalmente descartando o menor.
    Usado para geração de atributos.
    """
    rolls = [random.randint(1, 6) for _ in range(n)]
    if drop_lowest and len(rolls) > 1:
        rolls.remove(min(rolls))
    return rolls

def generate_attribute_roll() -> int:
    """
    4d6 drop lowest — método clássico de D&D.
    """
    rolls = roll_nd6(4, drop_lowest=True)
    return sum(rolls)
```

#### 2.2 `engine/checks.py`
```python
"""
Sistema de resolução de checks.
"""
from dataclasses import dataclass
from typing import Optional
from enum import Enum

from .dice import roll_d20, DiceResult

class Difficulty(Enum):
    TRIVIAL = 5
    EASY = 8
    MODERATE = 10
    CHALLENGING = 13
    DIFFICULT = 15
    VERY_DIFFICULT = 18
    NEARLY_IMPOSSIBLE = 20
    LEGENDARY = 25

@dataclass
class CheckResult:
    dice: DiceResult
    dc: int
    success: bool
    margin: int  # Quanto passou/falhou
    critical: Optional[str] = None  # 'success' ou 'failure'
    
    @property
    def description(self) -> str:
        if self.critical == 'success':
            return "Sucesso Crítico!"
        elif self.critical == 'failure':
            return "Falha Crítica!"
        elif self.success:
            return f"Sucesso (por {self.margin})"
        else:
            return f"Falha (por {abs(self.margin)})"

def resolve_check(
    attribute_modifier: int,
    dc: int,
    bonus: int = 0,
    advantage: bool = False,
    disadvantage: bool = False
) -> CheckResult:
    """
    Resolve um check: d20 + modificador + bônus vs DC.
    """
    total_modifier = attribute_modifier + bonus
    dice = roll_d20(total_modifier, advantage, disadvantage)
    
    # Críticos sempre sucesso/falha
    if dice.natural_20:
        return CheckResult(
            dice=dice,
            dc=dc,
            success=True,
            margin=dice.total - dc,
            critical='success'
        )
    elif dice.natural_1:
        return CheckResult(
            dice=dice,
            dc=dc,
            success=False,
            margin=dice.total - dc,
            critical='failure'
        )
    
    success = dice.total >= dc
    return CheckResult(
        dice=dice,
        dc=dc,
        success=success,
        margin=dice.total - dc
    )

def get_dc(difficulty: Difficulty | int) -> int:
    """Retorna DC numérico."""
    if isinstance(difficulty, Difficulty):
        return difficulty.value
    return difficulty
```

#### 2.3 `engine/character.py`
```python
"""
Sistema de criação e gestão de personagens.
"""
from dataclasses import dataclass, field
from typing import Optional
import yaml

from .dice import generate_attribute_roll

@dataclass
class Attributes:
    EXE: int = 10
    INF: int = 10
    TEC: int = 10
    RES: int = 10
    CRE: int = 10
    AWA: int = 10
    
    def get_modifier(self, attr: str) -> int:
        """Calcula modificador: (valor - 10) / 2"""
        value = getattr(self, attr)
        return (value - 10) // 2
    
    def apply_class_bonuses(self, bonuses: dict[str, int]):
        """Aplica bônus de classe."""
        for attr, bonus in bonuses.items():
            current = getattr(self, attr)
            setattr(self, attr, current + bonus)

@dataclass
class Resources:
    energy: int = 10
    energy_max: int = 10
    political_capital: int = 2
    reputation: int = 0
    
    def spend_energy(self, amount: int) -> bool:
        """Gasta energy. Retorna False se não tiver."""
        if self.energy >= amount:
            self.energy -= amount
            return True
        return False
    
    def spend_pc(self, amount: int) -> bool:
        """Gasta Political Capital."""
        if self.political_capital >= amount:
            self.political_capital -= amount
            return True
        return False
    
    def modify_reputation(self, amount: int):
        """Modifica reputation (range -5 a +5)."""
        self.reputation = max(-5, min(5, self.reputation + amount))
    
    def rest(self):
        """Recupera recursos (fim de sessão)."""
        self.energy = self.energy_max
        # PC não recupera automaticamente

@dataclass
class Character:
    name: str
    class_id: str
    class_name: str
    level: int = 1
    xp: int = 0
    attributes: Attributes = field(default_factory=Attributes)
    resources: Resources = field(default_factory=Resources)
    feats: list[str] = field(default_factory=list)
    used_abilities: list[str] = field(default_factory=list)
    inventory: list[str] = field(default_factory=list)
    background: Optional[str] = None
    alignment: Optional[str] = None
    
    def get_check_modifier(self, attribute: str) -> int:
        """Retorna modificador total para um check."""
        base = self.attributes.get_modifier(attribute)
        # TODO: adicionar bônus de feats, itens, etc.
        return base
    
    def gain_xp(self, amount: int) -> bool:
        """Ganha XP. Retorna True se subiu de nível."""
        self.xp += amount
        if self.xp >= 100:
            self.xp -= 100
            self.level += 1
            return True
        return False
    
    def use_ability(self, ability_id: str) -> bool:
        """Marca ability como usada."""
        if ability_id in self.used_abilities:
            return False
        self.used_abilities.append(ability_id)
        return True
    
    def reset_session(self):
        """Reset de início de sessão."""
        self.used_abilities.clear()
        self.resources.rest()

def create_character(
    name: str,
    class_data: dict,
    attributes: Attributes,
    background: Optional[str] = None,
    alignment: Optional[str] = None
) -> Character:
    """
    Cria um novo personagem.
    
    Args:
        name: Nome do personagem
        class_data: Dados da classe (do YAML)
        attributes: Atributos já gerados
        background: Background opcional
        alignment: Tendência opcional
    """
    # Aplica bônus de classe
    attributes.apply_class_bonuses(class_data.get('bonuses', {}))
    
    # Configura recursos iniciais
    starting = class_data.get('starting_resources', {})
    resources = Resources(
        energy=starting.get('energy', 10),
        energy_max=starting.get('energy', 10),
        political_capital=starting.get('political_capital', 2),
        reputation=starting.get('reputation', 0)
    )
    
    return Character(
        name=name,
        class_id=class_data['id'],
        class_name=class_data['name'],
        attributes=attributes,
        resources=resources,
        inventory=class_data.get('starting_inventory', []).copy(),
        background=background,
        alignment=alignment
    )
```

### Prompt para Claude Code — Fase 2
```
Leia o arquivo GAME_DESIGN.md e os YAMLs em data/.

Crie a engine core em Python:

1. engine/dice.py — Sistema de dados (d20, 4d6 drop lowest, advantage/disadvantage)
2. engine/checks.py — Resolução de checks (d20 + mod vs DC, críticos)
3. engine/character.py — Criação e gestão de personagens
4. engine/resources.py — Sistema de Energy, PC, Reputation

Cada arquivo deve:
- Usar dataclasses
- Ter type hints
- Ter docstrings
- Ser testável isoladamente

Crie também tests/test_dice.py com testes unitários básicos.
```

---

## FASE 3: GAME LOOP + STATE

### Objetivo
Implementar o loop principal do jogo e persistência de estado.

### Arquivos a Criar

#### 3.1 `engine/state.py`
```python
"""
Gerenciamento de estado do jogo.
"""
from dataclasses import dataclass, field, asdict
from typing import Optional, Any
from datetime import datetime
import json
import os

from .character import Character

@dataclass
class GameState:
    """Estado completo de uma partida."""
    character: Character
    session_id: str
    turn: int = 0
    current_encounter_id: Optional[str] = None
    encounter_history: list[str] = field(default_factory=list)
    npc_relationships: dict[str, int] = field(default_factory=dict)
    flags: dict[str, Any] = field(default_factory=dict)
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())
    
    def advance_turn(self):
        self.turn += 1
        self.updated_at = datetime.now().isoformat()
    
    def set_flag(self, key: str, value: Any):
        self.flags[key] = value
    
    def get_flag(self, key: str, default: Any = None) -> Any:
        return self.flags.get(key, default)
    
    def modify_relationship(self, npc_id: str, amount: int):
        current = self.npc_relationships.get(npc_id, 0)
        self.npc_relationships[npc_id] = max(-5, min(5, current + amount))
    
    def to_dict(self) -> dict:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: dict) -> 'GameState':
        # Reconstruct nested objects
        char_data = data.pop('character')
        character = Character(**char_data)
        return cls(character=character, **data)

def save_game(state: GameState, filepath: str):
    """Salva estado em JSON."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w') as f:
        json.dump(state.to_dict(), f, indent=2)

def load_game(filepath: str) -> GameState:
    """Carrega estado de JSON."""
    with open(filepath, 'r') as f:
        data = json.load(f)
    return GameState.from_dict(data)
```

#### 3.2 `engine/core.py`
```python
"""
Game loop principal do Corporate Quest.
"""
from dataclasses import dataclass
from typing import Callable, Optional
import yaml

from .state import GameState
from .character import Character, create_character
from .checks import resolve_check, Difficulty
from .dice import roll_d20

@dataclass
class GameOption:
    """Uma opção de ação para o jogador."""
    id: str
    text: str
    attribute: str
    modifier: int
    dc: int
    hint: Optional[str] = None
    feat_highlight: Optional[str] = None

@dataclass
class GamePrompt:
    """Prompt apresentado ao jogador."""
    text: str
    options: list[GameOption]
    allow_custom: bool = True

@dataclass
class ActionResult:
    """Resultado de uma ação do jogador."""
    success: bool
    roll: int
    total: int
    dc: int
    critical: Optional[str]
    narrative: str
    consequences: dict

class CorporateQuestGame:
    """
    Engine principal do jogo.
    """
    
    def __init__(self, data_path: str = 'data/'):
        self.data_path = data_path
        self.classes = self._load_yaml('classes.yaml')
        self.attributes = self._load_yaml('attributes.yaml')
        self.feats = self._load_yaml('feats.yaml')
        self.npcs = self._load_yaml('npcs.yaml')
        self.state: Optional[GameState] = None
        self.llm_callback: Optional[Callable] = None
    
    def _load_yaml(self, filename: str) -> dict:
        with open(f"{self.data_path}/{filename}", 'r') as f:
            return yaml.safe_load(f)
    
    def set_llm_callback(self, callback: Callable):
        """Define callback para chamar o LLM."""
        self.llm_callback = callback
    
    def create_new_game(
        self,
        character_name: str,
        class_id: str,
        attributes: dict,
        session_id: str
    ) -> GameState:
        """Cria uma nova partida."""
        class_data = next(
            c for c in self.classes['classes'] 
            if c['id'] == class_id
        )
        
        from .character import Attributes
        attrs = Attributes(**attributes)
        
        character = create_character(
            name=character_name,
            class_data=class_data,
            attributes=attrs
        )
        
        self.state = GameState(
            character=character,
            session_id=session_id
        )
        
        return self.state
    
    def resolve_action(
        self,
        option: GameOption,
        custom_text: Optional[str] = None
    ) -> ActionResult:
        """Resolve uma ação do jogador."""
        if not self.state:
            raise ValueError("No active game state")
        
        # Calcula modificador do personagem
        char_mod = self.state.character.get_check_modifier(option.attribute)
        total_mod = char_mod + option.modifier
        
        # Resolve o check
        result = resolve_check(
            attribute_modifier=total_mod,
            dc=option.dc
        )
        
        # Gera narrativa via LLM se disponível
        if self.llm_callback:
            narrative = self.llm_callback(
                action=option.text,
                result=result,
                character=self.state.character,
                custom_text=custom_text
            )
        else:
            narrative = self._generate_basic_narrative(option, result)
        
        # Aplica consequências
        consequences = self._apply_consequences(result)
        
        self.state.advance_turn()
        
        return ActionResult(
            success=result.success,
            roll=result.dice.roll,
            total=result.dice.total,
            dc=option.dc,
            critical=result.critical,
            narrative=narrative,
            consequences=consequences
        )
    
    def _generate_basic_narrative(self, option: GameOption, result) -> str:
        """Narrativa básica sem LLM."""
        if result.critical == 'success':
            return f"Você executa '{option.text}' com maestria absoluta!"
        elif result.critical == 'failure':
            return f"Sua tentativa de '{option.text}' dá terrivelmente errado..."
        elif result.success:
            return f"Você consegue: {option.text}"
        else:
            return f"Sua tentativa falha: {option.text}"
    
    def _apply_consequences(self, result) -> dict:
        """Aplica consequências mecânicas."""
        consequences = {}
        
        if result.critical == 'success':
            self.state.character.resources.modify_reputation(1)
            consequences['reputation'] = 1
        elif result.critical == 'failure':
            self.state.character.resources.modify_reputation(-1)
            consequences['reputation'] = -1
        
        return consequences
```

### Prompt para Claude Code — Fase 3
```
Leia o arquivo GAME_DESIGN.md e os arquivos em engine/.

Implemente:

1. engine/state.py — GameState com save/load JSON
2. engine/core.py — CorporateQuestGame com:
   - Criação de partida
   - Resolução de ações
   - Aplicação de consequências
   - Hook para LLM

3. engine/encounter.py — Sistema de encounters com:
   - Carregamento de YAML
   - Geração de opções
   - Tracking de progresso

Mantenha compatibilidade com os arquivos anteriores.
```

---

## FASE 4: CLI (Playtest)

### Objetivo
Interface de linha de comando para testar o jogo.

### Arquivo Principal

#### 4.1 `cli.py`
```python
"""
CLI para playtest do Corporate Quest.
"""
import click
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, IntPrompt
from rich.table import Table

from engine.core import CorporateQuestGame
from engine.character import Attributes

console = Console()

@click.group()
def cli():
    """Corporate Quest - The Office RPG"""
    pass

@cli.command()
def new_game():
    """Inicia uma nova partida."""
    console.print(Panel("🏢 CORPORATE QUEST", style="bold blue"))
    
    game = CorporateQuestGame()
    
    # Nome
    name = Prompt.ask("Nome do personagem")
    
    # Classe
    console.print("\n[bold]Classes disponíveis:[/bold]")
    for i, cls in enumerate(game.classes['classes'], 1):
        console.print(f"  {i}. {cls['name']} - {cls['flavor']}")
    
    class_idx = IntPrompt.ask("Escolha a classe", choices=[str(i) for i in range(1, 7)])
    class_data = game.classes['classes'][class_idx - 1]
    
    # Atributos (standard array simplificado)
    console.print("\n[bold]Distribuindo atributos (Standard Array):[/bold]")
    attrs = Attributes(EXE=12, INF=14, TEC=13, RES=10, CRE=15, AWA=8)
    
    # Cria partida
    import uuid
    state = game.create_new_game(
        character_name=name,
        class_id=class_data['id'],
        attributes=attrs.__dict__,
        session_id=str(uuid.uuid4())
    )
    
    console.print(f"\n✅ Personagem criado: {state.character.name}, {state.character.class_name}")
    console.print(f"   Energy: {state.character.resources.energy}")
    console.print(f"   PC: {state.character.resources.political_capital}")

if __name__ == '__main__':
    cli()
```

### Prompt para Claude Code — Fase 4
```
Crie uma CLI para playtest usando click e rich:

1. cli.py com comandos:
   - new_game: Criação de personagem interativa
   - play: Loop de jogo com input/output
   - load: Carregar save
   - save: Salvar partida

2. Use rich para:
   - Painéis coloridos
   - Tabelas de stats
   - Animação de dado (simples)

Deve funcionar standalone para testar a engine sem LLM.
```

---

## FASES 5-10: RESUMO

### Fase 5: LLM Integration
- `llm/adapter.py` com LiteLLM
- `llm/prompts/dungeon_master.txt` (do GDD Parte 6)
- Providers: OpenAI, Anthropic, local

### Fase 6: Persistência
- SQLite schema (do GDD Parte 7)
- Migrations com Alembic
- Save/load robusto

### Fase 7: Frontend React
- `CorporateQuestScene.jsx` (já temos draft)
- API FastAPI
- WebSocket para real-time

### Fase 8: Onboarding & Lores
- 4 lores completas
- Tutorial "Primeiro Café"
- Character creation flow

### Fase 9: Career System
- Propostas externas
- Processo seletivo
- Transição de empresa

### Fase 10: Multiplayer
- Turnos simultâneos
- Sistema de alianças
- Objetivos secretos

---

## CHECKLIST GERAL

### Antes de Começar
- [ ] Ter GAME_DESIGN.md acessível
- [ ] Python 3.11+ instalado
- [ ] Node.js 18+ (para frontend)

### Fase 1: Data Layer
- [ ] `data/attributes.yaml`
- [ ] `data/classes.yaml`
- [ ] `data/feats.yaml`
- [ ] `data/dc_table.yaml`
- [ ] `data/npcs.yaml`
- [ ] `data/backgrounds.yaml`
- [ ] `data/alignments.yaml`

### Fase 2: Engine Core
- [ ] `engine/__init__.py`
- [ ] `engine/dice.py`
- [ ] `engine/checks.py`
- [ ] `engine/character.py`
- [ ] `engine/resources.py`
- [ ] `tests/test_dice.py`
- [ ] `tests/test_checks.py`

### Fase 3: Game Loop
- [ ] `engine/state.py`
- [ ] `engine/core.py`
- [ ] `engine/encounter.py`
- [ ] `tests/test_core.py`

### Fase 4: CLI
- [ ] `cli.py`
- [ ] `requirements.txt`
- [ ] Playtest funcional

---

## PROMPT MASTER PARA CLAUDE CODE

Cole isso no Claude Code para começar:

```
Você vai implementar o jogo Corporate Quest.

LEIA PRIMEIRO:
1. O arquivo GAME_DESIGN.md (GDD completo, 1892 linhas)
2. Este documento de planejamento

COMECE PELA FASE 1:
1. Crie a estrutura de pastas
2. Implemente os YAMLs de dados
3. Valide que são parseáveis

DEPOIS SIGA AS FASES em ordem.

A cada fase:
1. Implemente os arquivos listados
2. Crie testes básicos
3. Verifique que compila/roda
4. Só então passe pra próxima

REGRAS:
- Python 3.11+
- Type hints sempre
- Docstrings em funções públicas
- Testes unitários básicos
- Commits pequenos e descritivos

Comece agora criando a estrutura de pastas.
```

---

## MÉTRICAS DE SUCESSO

### MVP (Fases 1-4)
- [ ] Criar personagem funciona
- [ ] Rolar dado funciona
- [ ] Resolver check funciona
- [ ] CLI permite jogar 1 encounter

### Alpha (Fases 5-6)
- [ ] LLM narra encounters
- [ ] Save/load funciona
- [ ] 3 encounters jogáveis

### Beta (Fases 7-8)
- [ ] Frontend visual funciona
- [ ] Onboarding completo
- [ ] 1 lore jogável

### Release (Fases 9-10)
- [ ] Career system funciona
- [ ] Multiplayer funciona
- [ ] 4 lores jogáveis
