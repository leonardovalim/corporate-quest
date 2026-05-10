# CORPORATE QUEST: The Office RPG
## Game Design Document Completo

> RPG de comédia corporativa estilo The Office, mecânicas inspiradas em AD&D 3e, LLM como Dungeon Master.

---

# PARTE 1: VISÃO GERAL

## Conceito
RPG turn-based no ambiente corporativo moderno. O jogador cria um personagem (funcionário), enfrenta desafios do dia-a-dia (reuniões, deadlines, política de escritório), sobe de nível e evolui na carreira.

## Tom
**Comédia corporativa** — irônico, absurdo e afetuoso. Os desafios são reais do mundo corporativo, mas tratados com humor. NPCs são caricaturas reconhecíveis. Referências a cultura corporativa são bem-vindas.

## Modos de Jogo
- **Sessão Única:** 3 encounters, resolução em ~1 hora
- **Campanha:** Salvar estado entre sessões, progressão de XP

---

# PARTE 2: SISTEMA DE REGRAS

## 2.1 Atributos (6 atributos, escala 1-20)

Modificador = (valor - 10) / 2

| Atributo | Abrev | Descrição | Usado em |
|----------|-------|-----------|----------|
| **Execution** | EXE | Capacidade de entregar, tirar do papel | Entregas, sprints, deadlines |
| **Influence** | INF | Persuasão, negociação, política | Reuniões, negociações, política |
| **Technical** | TEC | Profundidade técnica, código, dados | Discussões técnicas, troubleshooting |
| **Resilience** | RES | Resistência a burnout e pressão | Crises, conflitos, pressão |
| **Creativity** | CRE | Pensamento lateral, soluções inesperadas | Problemas complexos, improvisos |
| **Awareness** | AWA | Leitura de sala, timing político | Política, reuniões sensíveis |

### Métodos de Geração
- **Standard Array:** 15, 14, 13, 12, 10, 8
- **Point Buy:** 27 pontos, valores 8-15
- **Roll:** 4d6 drop lowest

---

## 2.2 Classes (6 classes)

### PM (Product Manager)
- **Equivalente D&D:** Bard
- **Atributo primário:** INF
- **Bônus:** +2 INF, +1 AWA
- **Penalidade:** -2 em checks técnicos solo (sem engineer)
- **Recursos iniciais:** Energy 10, Political Capital 3, Reputation 0
- **Habilidades:**
  - *Alinhamento Forçado (1x/sessão):* Re-roll social se mencionar framework (OKR, RICE, etc.)
  - *Visão de Roadmap (passiva):* +2 em checks de planejamento
- **Inventário inicial:** Laptop com 47 abas, caderno com anotações ilegíveis, café frio, acesso ao Jira
- **Flavor:** "Você não escreve código nem fecha deal, mas sem você nada acontece."

### Engineer
- **Equivalente D&D:** Wizard
- **Atributo primário:** TEC
- **Bônus:** +3 TEC, +1 EXE
- **Penalidade:** -2 em checks políticos puros
- **Recursos iniciais:** Energy 8, Political Capital 1, Reputation 0
- **Habilidades:**
  - *Debug da Realidade (2x/sessão):* Pedir detalhes técnicos específicos
  - *Sentir Dívida Técnica (passiva):* Percebe riscos técnicos automaticamente
- **Inventário inicial:** Laptop com terminal customizado, fone noise-canceling, caneca de framework obscuro
- **Flavor:** "Você constrói o que outros só sonham. E conserta o que outros quebram."

### Designer
- **Equivalente D&D:** Sorcerer
- **Atributo primário:** CRE
- **Bônus:** +3 CRE, +1 INF
- **Penalidade:** -1 em tasks repetitivas (drenam mais energia)
- **Recursos iniciais:** Energy 10, Political Capital 2, Reputation 0
- **Habilidades:**
  - *Mostrar é Melhor (1x/sessão):* Substitui INF por CRE se tiver visual
  - *Empatia com Usuário (passiva):* +2 em argumentos de UX
- **Inventário inicial:** MacBook com Figma, sketch pad, post-its coloridos
- **Flavor:** "Você vê o mundo como ele deveria ser."

### Data Analyst
- **Equivalente D&D:** Cleric
- **Atributo primário:** TEC
- **Bônus:** +2 TEC, +2 AWA
- **Penalidade:** -1 em checks que exigem resposta imediata
- **Recursos iniciais:** Energy 10, Political Capital 2, Reputation 0
- **Habilidades:**
  - *Verdade dos Dados (2x/sessão):* Pedir fato numérico ao DM
  - *Imunidade à Paralisia (passiva):* Sem penalidade por pedir tempo de análise
- **Inventário inicial:** Laptop com 15 queries salvas, dashboard bookmarkado, planilha com macros
- **Flavor:** "Enquanto outros opinam, você sabe."

### Sales
- **Equivalente D&D:** Rogue
- **Atributo primário:** INF
- **Bônus:** +3 INF, +1 CRE
- **Penalidade:** -3 TEC (não fala essa língua)
- **Recursos iniciais:** Energy 12, Political Capital 4, Reputation 1
- **Habilidades:**
  - *Fechar Qualquer Coisa (1x/sessão):* Vantagem em INF se tiver algo em jogo
  - *Alavancagem de Relação (passiva):* Gastar PC para +2 em check social
- **Inventário inicial:** Celular com 200 contatos, CRM atualizado, blazer na cadeira, energy drink
- **Flavor:** "Você promete a lua. O resto é problema de produto."

### Manager
- **Equivalente D&D:** Fighter
- **Atributo primário:** RES
- **Bônus:** +3 RES, +1 INF
- **Penalidade:** -2 em checks para ganhar crédito individual
- **Recursos iniciais:** Energy 12, Political Capital 3, Reputation 1
- **Habilidades:**
  - *Absorver o Golpe (2x/sessão):* Assumir consequência negativa de membro do time
  - *Escudo Burocrático (passiva):* +2 contra pedidos que prejudicariam o time
- **Inventário inicial:** Agenda de 1:1s, template de feedback, ibuprofeno, foto do time
- **Flavor:** "Você não brilha. Você faz os outros brilharem."

---

## 2.3 Tendências (Alignments)

### Eixo 1: Como você joga o jogo
- **Lawful (Processo):** Segue os ritos — planning, retro, documentação
- **Neutral (Pragmático):** Usa processo quando ajuda, ignora quando atrapalha
- **Chaotic (Improviso):** Move rápido, quebra coisas, pede desculpa depois

### Eixo 2: Pra quem você joga
- **Good (Time First):** Protege as pessoas, mesmo custando carreira
- **Neutral (Balanced):** Cuida do time, mas não se sacrifica de graça
- **Evil (Career First):** Você primeiro. Time é meio, não fim.

### Combinações
| Tendência | Tradução Corporativa |
|-----------|----------------------|
| Lawful Good | O PM que todo mundo ama mas nunca promovem |
| Neutral Good | Faz o certo, flexível no como |
| Chaotic Good | "Peço perdão, não permissão" |
| Lawful Neutral | Vive pelo processo, morre pelo processo |
| True Neutral | Sobrevivente político puro |
| Chaotic Neutral | Wildcard. Pode salvar ou explodir o projeto |
| Lawful Evil | Sobe na carreira sem quebrar regras (assustador) |
| Neutral Evil | Oportunista frio |
| Chaotic Evil | CEO de startup tóxica |

---

## 2.4 Origens (Backgrounds)

| Origem | Bônus | Backstory |
|--------|-------|-----------|
| **Ex-Engineer** | +1 TEC, vantagem com engineers | Migrou pro produto porque "queria mais impacto" |
| **Ex-Consultor** | +1 INF, slides bonitos | Veio de Big4, sabe fazer PPT que C-level chora |
| **Ex-Startup Founder** | +1 CRE, -1 em seguir processo | Faliu/vendeu, quer "aprender com estrutura" |
| **Primeira Carreira** | +1 em dois atributos à escolha | Descobriu produto na empresa, cria da casa |
| **Ex-Designer** | +1 CRE, vantagem com designers | "Produto é design com business" |
| **Ex-Dados** | Feat Data-Driven fica +3 | Saiu de analytics, quer mais ownership |

---

## 2.5 Feats

### Comunicação
| Feat | Efeito |
|------|--------|
| **Async Master** | +2 em checks via Slack/email |
| **Meeting Survivor** | -1 Energy em reuniões longas |
| **Stakeholder Whisperer** | Vantagem com executivos |

### Análise
| Feat | Efeito |
|------|--------|
| **Data-Driven** | Re-roll se citar métrica real (2x/sessão) |
| **Dashboard Warrior** | +3 com dados preparados (requer Data-Driven) |

### Técnico
| Feat | Efeito |
|------|--------|
| **Code Native** | Vantagem técnica com engineers, entende tech debt |
| **System Thinker** | +2 em arquitetura e dependências |

### Resiliência
| Feat | Efeito |
|------|--------|
| **Burnout Resistance** | Ignora 1 nível de exaustão/dia |
| **Crisis Calm** | +2 em todos checks durante crises |
| **Thick Skin** | Imune a perda de PC por crítica pública |

### Criatividade
| Feat | Efeito |
|------|--------|
| **Lateral Thinker** | Pode propor solução fora do escopo |
| **Prototype Fast** | +3 CRE se aceitar entregar MVP |

### Político
| Feat | Efeito |
|------|--------|
| **Org Navigator** | Perguntar quem tem poder real (2x/sessão) |
| **Alliance Builder** | -1 PC para pedir favores |
| **Credit Redirector** | Dar crédito = ganhar +1 PC (só Good) |

### Execução
| Feat | Efeito |
|------|--------|
| **Deadline Crusher** | +2 EXE nas últimas 24h antes do prazo |
| **Scope Defender** | Vantagem contra scope creep |

---

## 2.6 Recursos

| Recurso | Descrição | Uso |
|---------|-----------|-----|
| **Energy** | Gasta em ações (1-3 por check) | Recupera com descanso |
| **Political Capital** | Moeda social | Gasta para favores, influência |
| **Reputation** | Score público (-5 a +5) | Afeta DCs sociais |
| **XP** | Experiência | 100 XP = próximo nível |

---

## 2.7 Sistema de Checks

### Resolução Básica
```
d20 + modificador do atributo + bônus de classe/feat vs DC
```

### Resultados
- **Sucesso:** Total ≥ DC
- **Falha:** Total < DC
- **Sucesso com Complicação:** Dentro de 2 do DC (DM decide)
- **Crítico:** d20 natural 20
- **Falha Crítica:** d20 natural 1

### Vantagem/Desvantagem
- **Vantagem:** Rola 2d20, usa o maior
- **Desvantagem:** Rola 2d20, usa o menor

---

## 2.8 Tabelas de DC

### Tabela Geral
| DC | Dificuldade | Exemplo |
|----|-------------|---------|
| 5 | Trivial | Agendar 1:1 com seu time |
| 8 | Fácil | Convencer designer a ajuste pequeno |
| 10 | Moderado | Defender priorização em planning |
| 13 | Desafiador | Conseguir engineer emprestado |
| 15 | Difícil | Convencer VP a mudar roadmap |
| 18 | Muito Difícil | Matar feature que o CEO ama |
| 20 | Quase Impossível | Cancelar reunião recorrente inútil |
| 25 | Lendário | Empresa adotar sua documentação |

### Modificadores Situacionais
| Situação | Mod |
|----------|-----|
| Tem dados apoiando | +2 |
| Stakeholder gosta de você | +2 |
| Sexta depois das 16h | +3 |
| Reunião sem agenda | -2 |
| Interrompeu alguém | -2 |
| Alguém já tentou e falhou | -3 |
| CEO presente | ±0 (alto risco/recompensa) |
| Pós-layoff | -4 em político |
| Alguém trouxe comida | +1 |

### DCs por Tipo de Ação

**Reuniões**
| Ação | Atributo | DC |
|------|----------|-----|
| Apresentar ideia nova | INF | 12 |
| Defender seu time | RES | 10 |
| Desviar pergunta difícil | AWA | 13 |
| Encerrar reunião mais cedo | INF | 15 |
| Não ser culpado por bug | AWA | 14 |

**Entregas**
| Ação | Atributo | DC |
|------|----------|-----|
| Escrever PRD decente | EXE | 10 |
| Estimar prazo realista | AWA | 13 |
| Entregar no prazo | EXE | 15 |
| Entregar com qualidade E no prazo | EXE | 18 |

**Política**
| Ação | Atributo | DC |
|------|----------|-----|
| Saber de reorg antes | AWA | 14 |
| Não ser puxado pra projeto ruim | INF | 12 |
| Roubar crédito sutilmente | INF | 16 |
| Formar aliança com PM | INF | 10 |
| Sobreviver a troca de chefe | RES | 13 |

---

## 2.9 Encounters Corporativos

Não há "combate" literal. Há **encounters**:

| Tipo | Mecânica | Exemplo |
|------|----------|---------|
| **Reunião** | Skill checks em rodadas | Convencer C-level a aprovar budget |
| **Sprint** | Endurance + teamwork | Entregar feature antes do deadline |
| **Crise** | Boss fight | Incidente de produção |
| **1:1** | Diálogo com checks | Negociar promoção |
| **Política** | Stealth/social | Sobreviver a reorg |

---

## 2.10 Progressão

- **XP por:** entregas, wins políticos, mentorias, side quests
- **Níveis 1-20:** Intern → C-Level
- **A cada nível:** +1 em atributo OU novo feat

---

## 2.11 Random Events (d20 no início da sessão)

| d20 | Evento |
|-----|--------|
| 1 | Café estragado. Todos -1 Energy |
| 2-3 | Boato de layoff. -2 em checks sociais |
| 4-5 | All-hands surpresa. Perde 1h |
| 6-7 | Engineer pediu REDACTED (vai ficar, mas drama) |
| 8-9 | Sales em modo ego inflado |
| 10-11 | Dia normal (milagre) |
| 12-13 | VP elogiou você. +1 PC |
| 14-15 | Bug em produção. Todos ajudam |
| 16-17 | Reorg anunciada |
| 18-19 | Você descobriu info privilegiada |
| 20 | CEO te mencionou. +2 Reputation |

---

# PARTE 3: NPCs

## NPCs Recorrentes

### Geraldo, o VP
- **Personalidade:** Fala em siglas, nunca lembra seu nome
- **Disposição inicial:** Neutro-distante
- **Gatilho de irritação:** Falta de métricas
- **Gatilho de aprovação:** Resultados sem dar trabalho pra ele

### Marina, a Engineer Senior
- **Personalidade:** Cética, responde com memes, respeitada pelo time técnico
- **Disposição inicial:** Neutra-desconfiada com PMs
- **Gatilho de irritação:** PM que não entende técnico
- **Gatilho de aprovação:** PM que fala a língua dela

### Caio, o Sales
- **Personalidade:** Energia de golden retriever, promete o impossível
- **Disposição inicial:** Amigável-oportunista
- **Gatilho de irritação:** "Não dá pra fazer"
- **Gatilho de aprovação:** Qualquer coisa que ajude a fechar deal

### Patrícia, a HR
- **Personalidade:** Sempre "alinhando expectativas", lê artigos de gestão
- **Disposição inicial:** Neutra-burocrática
- **Gatilho de irritação:** Conflitos não resolvidos
- **Gatilho de aprovação:** Processos sendo seguidos

### Thiago, o PM Rival
- **Personalidade:** Rouba ideias, leva crédito, politicamente habilidoso
- **Disposição inicial:** Falsa cordialidade
- **Gatilho de irritação:** Você ter sucesso
- **Gatilho de aprovação:** Nunca (antagonista)

### João, o Engineer Pleno
- **Personalidade:** Quieto, competente, quer paz
- **Disposição inicial:** Neutro-cooperativo
- **Gatilho de irritação:** Mais trabalho sem razão
- **Gatilho de aprovação:** Ser protegido de burocracia

---

# PARTE 4: ENCOUNTERS DO TUTORIAL

## Encounter 1: "A Daily que Virou Tribunal"

### Setup
São 9h47. Jogador entra na daily 2 minutos atrasado. Marina (Engineer Senior) menciona que feature de notificações "tem débito técnico que pode explodir". Caio (Sales) está na call e começa a digitar — provavelmente no canal de vendas.

### Objetivo
Sair da daily sem:
- Perder credibilidade com o time
- Criar pânico no Sales
- Prometer refactor impossível

### Checks Possíveis
- AWA DC 12: Perceber se Marina exagera
- INF DC 13: Acalmar Caio
- TEC DC 15: Entender o débito (desvantagem para não-técnicos)

### Complicação se Falhar
Caio manda: "PM confirmou que produto pode explodir"

### Recompensa
+1 Political Capital, +25 XP

---

## Encounter 2: "O Pedido do CEO no Slack"

### Setup
17h de sexta. Mensagem do CEO no DM:
> "Oi! Tava pensando... a gente podia ter [FEATURE FORA DO ROADMAP]. Consegue pra segunda? 👀"

Manager não está online. CEO tem 3 pessoas no "digitando..."

### Objetivo
Responder sem:
- Dizer "não" diretamente
- Prometer impossível
- Ignorar

### Checks Possíveis
- INF DC 15: Negociar escopo/prazo
- AWA DC 13: Entender se é sério ou brainstorm
- CRE DC 14: Propor alternativa melhor

### Complicação se Falhar
Segunda tem reunião "urgente" com você, CEO, e manager confuso

### Recompensa
+2 Political Capital, +35 XP, possível side quest

---

## Encounter 3: "A Retro que Ninguém Pediu"

### Setup
Sprint deu errado. Patrícia (HR) decidiu "facilitar retro especial" porque leu artigo. Sala com post-its, Marina de braços cruzados, Caio que não deveria estar ali, manager querendo estar em outro lugar.

Patrícia: "Então, o que poderíamos ter feito diferente?"

Silêncio mortal.

### Objetivo
- Sobreviver sem conflito permanente
- Sair com action item útil
- Não deixar Patrícia chorar

### Checks Possíveis
- INF DC 12: Resposta política que satisfaça
- AWA DC 14: Ler quem vai explodir e intervir
- RES DC 10: Não surtar com sugestão de "mais reuniões"
- CRE DC 16: Transformar em algo útil (bônus: vira lenda)

### Complicação se Falhar
Novo processo de "check-ins semanais de sentimentos"

### Recompensa
+1 Political Capital, +30 XP, possível aliança

---

# PARTE 5: SESSÃO DE TESTE COMPLETA

## Registro da Sessão Demo

### Personagem Criado

```
╔══════════════════════════════════════════════════════════════╗
║  ALAN "CABEÇA" TURIN                                         ║
╠══════════════════════════════════════════════════════════════╣
║  Idade: 38 anos                                              ║
║  Classe: Product Manager (Júnior)                            ║
║  Tendência: Neutral Good (Pragmático, Time First)            ║
║  Empresa: TechCorp (startup em crescimento)                  ║
║  Origem: Ex-Engineer                                         ║
╠══════════════════════════════════════════════════════════════╣
║  ATRIBUTOS                                                   ║
║  EXE (Execução).......12 (+1)  — entrega bem                 ║
║  INF (Influência).....13 (+1)  — convence quando precisa     ║
║  TEC (Técnico)........16 (+3)  — FORTE: lê código, debate    ║
║  RES (Resiliência)....12 (+1)  — aguenta pressão normal      ║
║  CRE (Criatividade)...15 (+2)  — FORTE: soluções incomuns    ║
║  AWA (Awareness).......8 (-1)  — FRACO: perde jogo político  ║
╠══════════════════════════════════════════════════════════════╣
║  RECURSOS                                                    ║
║  Energia: 10/10                                              ║
║  Capital Político: 3                                         ║
║  Reputação: 0                                                ║
╠══════════════════════════════════════════════════════════════╣
║  HABILIDADES                                                 ║
║  [FEAT] Data-Driven — re-roll se citar métrica               ║
║  [CLASSE] Alinhamento Forçado (1x/sessão)                    ║
║  [ORIGEM] Código Nativo — vantagem com engineers             ║
╠══════════════════════════════════════════════════════════════╣
║  INVENTÁRIO                                                  ║
║  • Laptop com 47 abas abertas                                ║
║  • Terminal com alias customizado                            ║
║  • Café frio                                                 ║
║  • Caderno com wireframes rabiscados                         ║
║  • Acesso ao Jira                                            ║
║  • Repo do produto favoritado no GitHub                      ║
╚══════════════════════════════════════════════════════════════╝
```

### Encounter 1: "A Daily que Virou Tribunal" — Playthrough

**Situação Inicial:**
9h47, Alan entra atrasado na daily. Marina solta que feature de notificações tem débito técnico que "pode explodir". Caio (Sales) começa a digitar.

**Jogada 1 — Usar lado técnico:**
Alan pergunta: "Marina, o que exatamente você viu? Arquitetura, escala, ou código legado?"

Marina relaxa, reconhece que esse PM fala a língua dela. Explica: fila síncrona, funciona com 100 usuários, engasga com 10 mil, código de ex-funcionário.

Caio interrompe: "A gente TÁ fechando enterprise semana que vem. Tão dizendo que pode dar ruim?"

**Jogada 2 — Ativar Data-Driven:**
Alan pede números:
> "Marina, qual volume a gente aguenta HOJE? Caio, qual uso real desse enterprise?"

Resultados:
- Limite seguro: 400 rpm
- Limite crítico: 600 rpm
- Enterprise (pior caso): ~300 rpm
- Margem: apertada mas ok

Pânico virou problema dimensionado.

**Jogada 3 — Proposta criativa:**
Alan improvisa:
> "Caio, e se propuser POC? Começar com 2-3 mil usuários. Marina, dá pra spike de 2 dias pra avaliar fila assíncrona?"

**Rolls:**

| Check | Atributo | d20 | Mod | Total | DC | Resultado |
|-------|----------|-----|-----|-------|-----|-----------|
| Convencer Caio | INF | 14 | +3 | 17 | 12 | ✅ Sucesso |
| Proposta criativa | CRE | 8 | +2 | 10 | 10 | ✅ Sucesso justo |
| Alinhar Marina | TEC | 15 | +5 | 20 | 8 | ✅ Crítico! |

**Resolução:**
- Caio: "Implementação faseada enterprise-grade. Eles vão achar premium!"
- Marina: "Dois dias consigo. João, lembra aquele pattern do billing?"
- Marina solta: "Boa, Cabeça." — Respeito conquistado.

**Mudanças no Estado:**
```
Energia: 10 → 9 (gastou 1 em check social)
Capital Político: 3 → 4 (+1 por resolver crise)
Reputação: 0 → +1
XP: 0 → 35

NPCs:
- Marina: Neutra → Aliada
- Caio: Neutro → Favorável
- João: Neutro → Favorável

Conquistas:
🏅 "Código Nativo" — usou background de engineer
🏅 "Data-Driven" — feat pronto (guardou)
```

**Epílogo:**
Slack apita. Marina: "Boa jogada. Faz tempo que PM não fala minha língua."
Caio: "Se fechar essa POC, te devo uma cerveja 🍺"

---

# PARTE 6: SYSTEM PROMPT DO LLM (DUNGEON MASTER)

```markdown
# CORPORATE QUEST: THE OFFICE RPG
## System Prompt — Dungeon Master

Você é o Mestre de um RPG de comédia corporativa no estilo "The Office". 
Seu tom é irônico, absurdo e afetuoso. Os desafios são reais do mundo 
corporativo, mas tratados com humor. NPCs são caricaturas reconhecíveis.

## REGRAS CORE (inspiradas em D&D 3e)

### Atributos (escala 1-20, modificador = (valor-10)/2)
- EXE (Execution) — entregar coisas
- INF (Influence) — persuadir, politicar  
- TEC (Technical) — profundidade técnica
- RES (Resilience) — resistir a burnout
- CRE (Creativity) — pensar diferente
- AWA (Awareness) — ler a sala

### Resolução de ações
- Jogador declara ação
- DM define: atributo relevante + DC
- Roll: d20 + modificador do atributo + bônus de classe
- Resultado: Sucesso / Falha / Sucesso com complicação (dentro de 2 do DC)

### Recursos
- Energy: pontos gastos em ações. Recupera com descanso.
- Political Capital: moeda social. Ganha/perde por ações.
- Reputation: afeta DCs sociais.

### Como narrar
1. Descreva a cena com detalhes absurdos mas críveis
2. Inclua NPCs com personalidades marcantes
3. Sempre dê opções, mas aceite criatividade
4. Consequências devem ser engraçadas E ter peso mecânico
5. Referências a cultura corporativa são bem-vindas
6. Sempre mostre os dados rolados e a matemática do check

### Formato de resposta
Sempre inclua:
1. Narração da cena (2-4 parágrafos)
2. [Se houver check] Qual atributo + DC e por quê
3. Resultado do dado e cálculo
4. Opções claras para o jogador OU pedido de ação
5. Estado atual (Energy, Political Capital, Reputation) quando mudar

### Conduzindo jogadores iniciantes
- Sempre ofereça 2-4 opções claras de ação
- Explique qual atributo cada opção usaria
- Indique qual é o ponto forte/fraco do personagem pra situação
- Aceite ações criativas fora das opções

### Modos de jogo
- SESSÃO ÚNICA: 3 encounters, resolução em ~1 hora
- CAMPANHA: Salvar estado entre sessões, progressão de XP
```

---

# PARTE 7: ARQUITETURA TÉCNICA

## Stack Proposta

| Camada | Tech | Por quê |
|--------|------|---------|
| **Core Engine** | Python | Portável, comunidade grande |
| **LLM Adapter** | LiteLLM ou abstração própria | Unifica providers |
| **Database** | SQLite (dev) / PostgreSQL (prod) | JSON fields flexíveis |
| **Config/Rules** | YAML | Humano-legível, versionável |
| **Admin UI** | FastAPI + HTMX | Leve |
| **CLI** | Typer | Terminal-first |

## Estrutura de Pastas

```
corporate-quest/
├── engine/
│   ├── core.py           # Game loop, state machine
│   ├── dice.py           # Sistema de rolagem
│   ├── checks.py         # Resolução de checks
│   └── character.py      # Character sheet logic
├── llm/
│   ├── adapter.py        # Interface unificada
│   ├── prompts/          # System prompts versionados
│   └── providers/        # OpenAI, Anthropic, Ollama, CLI
├── data/
│   ├── attributes.yaml
│   ├── classes.yaml
│   ├── feats.yaml
│   ├── origins.yaml
│   ├── dc_tables.yaml
│   ├── npcs.yaml
│   └── encounters/
│       └── tutorial/
├── campaigns/
├── saves/
├── admin/
│   └── app.py
├── cli/
│   └── main.py
├── config.yaml
└── README.md
```

## Config do Usuário

```yaml
# config.yaml
llm:
  provider: "anthropic"  # ou "openai", "ollama", "cli"
  
  # Se API
  api_key: "${ANTHROPIC_API_KEY}"
  model: "claude-sonnet-4-20250514"
  
  # Se Ollama
  # provider: "ollama"
  # base_url: "http://localhost:11434"
  # model: "llama3"
  
  # Se Claude CLI
  # provider: "cli"
  # command: "claude"
```

## Schema do Banco

```sql
-- Characters
CREATE TABLE characters (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT,
  nickname TEXT,
  class TEXT,
  alignment TEXT,
  origin TEXT,
  level INTEGER DEFAULT 1,
  attributes JSON,
  resources JSON,
  feats JSON,
  inventory JSON,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMP
);

-- Sessions
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  character_id TEXT,
  campaign TEXT,
  current_encounter TEXT,
  state JSON,
  history JSON,
  npc_dispositions JSON,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Community content
CREATE TABLE content (
  id TEXT PRIMARY KEY,
  type TEXT,  -- class, feat, encounter, campaign
  slug TEXT UNIQUE,
  data JSON,
  author TEXT,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
);
```

## Fluxo de Jogo

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   CLI/UI    │────▶│   Engine    │────▶│ LLM Adapter │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                    │
      │                   ▼                    ▼
      │            ┌─────────────┐     ┌─────────────┐
      │            │  Database   │     │  Seu LLM    │
      │            │  (state)    │     │  (qualquer) │
      │            └─────────────┘     └─────────────┘
      │                   │
      ▼                   ▼
┌─────────────────────────────────────────────────────┐
│  YAML Files (rules, classes, encounters, prompts)   │
└─────────────────────────────────────────────────────┘
```

---

# PARTE 8: VISUAL SYSTEM

## 8.1 Visão Geral

O jogo renderiza **pixel art dinâmico** de cada cena, mostrando:
- Cenário (sala de reunião, call, escritório, etc.)
- Personagens presentes com expressões/estados
- Indicador visual de quem está agindo
- UI com opções + campo de texto livre

### Princípios
1. **Estilo consistente:** Pixel art 16-bit, paleta corporativa (azuis, cinzas, toques de cor)
2. **Composição dinâmica:** Sprites montados em runtime baseado no estado da cena
3. **Feedback visual:** Expressões mudam conforme NPCs reagem
4. **Opções + liberdade:** Botões clicáveis E campo de texto pra ações criativas

---

## 8.2 Assets Necessários

### Sprites de Personagens

Cada classe tem sprites em múltiplos estados:

```yaml
sprites:
  characters:
    pm:
      male: "pm_male.png"
      female: "pm_female.png"
      states: [idle, talking, thinking, stressed, happy, confused]
      size: 64x64
      
    engineer:
      male: "engineer_male.png"
      female: "engineer_female.png"
      states: [idle, coding, frustrated, explaining, focused, tired]
      size: 64x64
      
    designer:
      male: "designer_male.png"
      female: "designer_female.png"
      states: [idle, sketching, presenting, inspired, bored]
      size: 64x64
      
    data_analyst:
      male: "data_male.png"
      female: "data_female.png"
      states: [idle, analyzing, eureka, confused, presenting]
      size: 64x64
      
    sales:
      male: "sales_male.png"
      female: "sales_female.png"
      states: [idle, pitching, excited, nervous, celebrating, typing]
      size: 64x64
      
    manager:
      male: "manager_male.png"
      female: "manager_female.png"
      states: [idle, listening, concerned, approving, stressed]
      size: 64x64

  # NPCs específicos (overrides)
  npcs:
    marina:
      base: "engineer_female"
      custom_states: [arms_crossed, meme_reaction, rare_smile]
      accessories: [headphones]
      
    caio:
      base: "sales_male"
      custom_states: [golden_retriever_energy, panic_typing, deal_closed]
      accessories: [blazer_on_chair]
      
    geraldo_vp:
      base: "manager_male"
      custom_states: [forgot_your_name, checking_phone, fake_interest]
      accessories: [expensive_watch, coffee_mug_with_logo]
      
    patricia_hr:
      base: "manager_female"
      custom_states: [aligning_expectations, reading_article, forced_smile]
      accessories: [post_its, feelings_chart]
      
    thiago_rival:
      base: "pm_male"
      custom_states: [stealing_idea, taking_credit, fake_friendly]
      accessories: [smug_smile]
      
    joao:
      base: "engineer_male"
      custom_states: [just_vibing, reluctant, relieved]
```

### Backgrounds

```yaml
backgrounds:
  meeting_room:
    file: "bg_meeting_room.png"
    size: 320x180
    slots: 6  # Posições para personagens
    props: [whiteboard, projector, sad_plant]
    
  video_call:
    file: "bg_video_call.png"
    size: 320x180
    layout: "grid"  # 2x2 ou 2x3 de quadrados de call
    slots: 6
    props: [screen_share_button, mute_icons]
    
  open_office:
    file: "bg_open_office.png"
    size: 320x180
    slots: 8
    props: [desks, monitors, coffee_machine]
    
  ceo_office:
    file: "bg_ceo_office.png"
    size: 320x180
    slots: 3
    props: [fancy_desk, awards, city_view]
    mood: intimidating
    
  break_room:
    file: "bg_break_room.png"
    size: 320x180
    slots: 4
    props: [coffee_machine, microwave, passive_aggressive_notes]
    mood: casual
    
  corridor:
    file: "bg_corridor.png"
    size: 320x180
    slots: 3
    props: [motivational_posters, water_cooler]
    mood: transitional
    
  slack_dm:
    file: "bg_slack_interface.png"
    size: 320x180
    layout: "chat"
    props: [typing_indicator, emoji_reactions]
    
  retro_room:
    file: "bg_retro_room.png"
    size: 320x180
    slots: 6
    props: [post_its_everywhere, sad_whiteboard, timer]
    mood: tense
```

### UI Elements

```yaml
ui:
  dialogue_box:
    file: "ui_dialogue.png"
    size: 300x80
    text_area: {x: 10, y: 10, w: 280, h: 60}
    
  option_button:
    file: "ui_option_btn.png"
    size: 280x32
    states: [normal, hover, selected, disabled]
    
  text_input:
    file: "ui_text_input.png"
    size: 280x32
    placeholder: "Ou digite sua ação..."
    
  status_bar:
    file: "ui_status_bar.png"
    size: 320x24
    elements:
      energy: {icon: "⚡", color: "#FFD700"}
      political_capital: {icon: "🏛️", color: "#4169E1"}
      reputation: {icon: "⭐", color: "#32CD32"}
      
  character_indicator:
    file: "ui_turn_indicator.png"
    size: 16x16
    animation: "pulse"
    
  dice_roll:
    file: "ui_dice.png"
    size: 32x32
    animation: "roll_and_settle"
```

---

## 8.3 Schema de Cena (JSON)

O LLM gera este JSON junto com a narrativa. O frontend renderiza.

```json
{
  "scene": {
    "id": "daily_standup_001",
    "background": "video_call",
    "mood": "tense",
    "time": "09:47",
    
    "characters": [
      {
        "id": "marina",
        "position": 0,
        "state": "talking",
        "expression": "frustrated",
        "speech_bubble": true,
        "accessories": ["camera_off_icon"]
      },
      {
        "id": "joao",
        "position": 1,
        "state": "idle",
        "expression": "nervous",
        "accessories": ["messy_background"]
      },
      {
        "id": "caio",
        "position": 2,
        "state": "typing",
        "expression": "excited",
        "accessories": ["typing_indicator"],
        "highlight_danger": true
      },
      {
        "id": "player",
        "position": 3,
        "state": "listening",
        "expression": "thinking",
        "is_player": true,
        "turn_indicator": true
      }
    ],
    
    "props": [
      {"type": "screen_share", "content": "sprint_board", "position": "center"}
    ],
    
    "effects": [
      {"type": "tension_lines", "source": "caio", "intensity": 0.5}
    ]
  },
  
  "dialogue": {
    "speaker": "marina",
    "text": "...débito técnico que pode explodir se o volume subir.",
    "tone": "warning"
  },
  
  "prompt": {
    "text": "Todo mundo olha pra você. É sua vez.",
    "options": [
      {
        "id": "A",
        "text": "Perguntar detalhes técnicos pra Marina",
        "attribute": "TEC",
        "modifier": "+3",
        "hint": "Seu ponto forte",
        "tags": ["technical", "information_gathering"]
      },
      {
        "id": "B",
        "text": "Acalmar Caio antes que espalhe pânico",
        "attribute": "INF",
        "modifier": "+1",
        "hint": null,
        "tags": ["social", "damage_control"]
      },
      {
        "id": "C",
        "text": "Minimizar e seguir a daily",
        "attribute": "INF",
        "modifier": "+1",
        "hint": "Risco: problema continua",
        "tags": ["avoidance", "quick"]
      },
      {
        "id": "D",
        "text": "Pedir números concretos (Data-Driven)",
        "attribute": "AWA",
        "modifier": "-1",
        "hint": "Ativa seu feat!",
        "tags": ["data", "feat_activation"],
        "feat_highlight": "data_driven"
      }
    ],
    "allow_custom": true,
    "custom_placeholder": "Ou descreva sua própria ação..."
  },
  
  "player_status": {
    "energy": 10,
    "energy_max": 10,
    "political_capital": 3,
    "reputation": 0,
    "active_feats": ["data_driven", "forced_alignment"],
    "used_feats": []
  }
}
```

---

## 8.4 Estados Visuais dos Personagens

### Expressões Base (todos os personagens)

| Estado | Sprite | Quando usar |
|--------|--------|-------------|
| `idle` | Parado neutro | Default, ouvindo |
| `talking` | Boca aberta, gesto | Quando tem fala |
| `thinking` | Mão no queixo | Considerando algo |
| `happy` | Sorriso | Sucesso, boa notícia |
| `stressed` | Suando, tenso | Pressão, crise |
| `confused` | Interrogação | Não entendeu |
| `angry` | Sobrancelha franzida | Irritado |
| `typing` | Olhando pra baixo, mãos | Escrevendo no Slack |

### Indicadores Visuais Especiais

```yaml
indicators:
  turn_indicator:
    type: "glow"
    color: "#FFD700"
    animation: "pulse"
    applies_to: "current_player"
    
  danger_highlight:
    type: "exclamation"
    color: "#FF4444"
    position: "above_head"
    applies_to: "threatening_npc"
    
  ally_indicator:
    type: "subtle_glow"
    color: "#44FF44"
    applies_to: "allied_npc"
    
  speech_bubble:
    type: "bubble"
    position: "above_head"
    tail: "bottom_center"
    max_chars: 100
    
  thought_bubble:
    type: "cloud_bubble"
    position: "above_head"
    style: "dotted"
    
  typing_indicator:
    type: "three_dots"
    animation: "bounce"
    color: "#888888"
```

---

## 8.5 Transições e Animações

```yaml
animations:
  scene_enter:
    type: "fade_in"
    duration: 500ms
    
  character_enter:
    type: "slide_up"
    duration: 300ms
    stagger: 100ms  # Cada personagem entra com delay
    
  expression_change:
    type: "crossfade"
    duration: 200ms
    
  dice_roll:
    type: "custom"
    frames:
      - roll_start (100ms)
      - rolling_loop (500ms, repeatable)
      - roll_settle (200ms)
      - result_display (hold)
    sound: "dice_roll.wav"
    
  success_feedback:
    type: "flash"
    color: "#44FF44"
    duration: 300ms
    target: "result_area"
    
  failure_feedback:
    type: "shake"
    intensity: 5px
    duration: 300ms
    target: "result_area"
    
  critical_success:
    type: "sparkle"
    particles: 20
    duration: 800ms
    sound: "critical.wav"
    
  option_hover:
    type: "scale"
    scale: 1.02
    duration: 100ms
```

---

## 8.6 Layout da Tela

```
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │                    SCENE CANVAS                         │ │
│ │              (Background + Characters)                  │ │
│ │                     320 x 180                           │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 💬 DIALOGUE BOX                                         │ │
│ │ "Marina: ...débito técnico que pode explodir."         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ O que você faz?                                         │ │
│ │                                                         │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ [A] Perguntar detalhes técnicos      TEC +3  ★     │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ [B] Acalmar Caio                      INF +1       │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ [C] Minimizar e seguir                INF +1       │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ [D] Pedir números (Data-Driven)       AWA -1  ⚡   │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │                                                         │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Ou digite sua ação: ___________________________|   │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⚡ 10/10  │  🏛️ PC: 3  │  ⭐ Rep: 0  │  📊 Lvl 1     │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 8.7 Responsive Design

```yaml
breakpoints:
  mobile:
    width: 320px
    canvas_scale: 1x
    options_layout: "stacked"
    font_size: 14px
    
  tablet:
    width: 768px
    canvas_scale: 2x
    options_layout: "stacked"
    font_size: 16px
    
  desktop:
    width: 1024px+
    canvas_scale: 3x
    options_layout: "grid_2x2"
    font_size: 16px
    sidebar: "character_sheet_visible"
```

---

## 8.8 Geração de Imagem com AI (Opcional)

Para quem quiser cenas mais únicas, suporte a AI image gen:

```yaml
ai_image_generation:
  enabled: false  # Opt-in
  
  providers:
    dall_e:
      model: "dall-e-3"
      size: "1024x1024"
      style: "vivid"
      
    stable_diffusion:
      model: "sd-xl"
      steps: 30
      
    midjourney:
      via: "api_wrapper"
  
  prompt_template: |
    Pixel art, 16-bit style, corporate office setting.
    Scene: {background_description}
    Characters: {character_descriptions}
    Mood: {mood}
    Style: Clean pixel art, limited palette, slight humor.
    No text in image.
  
  cache:
    enabled: true
    ttl: 7 days
    key: "scene_hash"
  
  fallback:
    on_error: "use_sprite_composition"
    on_timeout: "use_sprite_composition"
    timeout: 10s
```

---

# PARTE 9: ONBOARDING SYSTEM

## 9.1 Princípios de Onboarding

1. **Primeiro valor em < 2 minutos** — jogador precisa sentir o jogo rápido
2. **Decisões significativas, não burocráticas** — cada escolha importa
3. **Educar jogando** — tutorial é gameplay, não texto
4. **Permitir pular** — veteranos podem ir direto

### Tempo até jogar de verdade
| Jogador | Tempo |
|---------|-------|
| Novo (tudo completo) | ~5 minutos |
| Veterano (pula tutorial) | ~1 minuto |
| Continuando save | ~10 segundos |

---

## 9.2 Fluxo Completo de Onboarding

```
SPLASH (5s)
    ↓
ESCOLHA DE MODO
    ├── Quick Play (15-30min, sem save)
    ├── Campaign (multi-sessão, progressão)
    └── Continue (se tiver save)
    ↓
ESCOLHA DE LORE/EMPRESA (se novo jogo)
    ├── TechCorp (★★☆☆☆) — Recomendado
    ├── MegaCorp Industries (★★★☆☆)
    ├── Creative Chaos Agency (★★★★☆)
    └── Consultoria Infinita (★★★★★)
    ↓
CRIAÇÃO DE PERSONAGEM
    ├── Nome + Apelido
    ├── Classe (com preview visual)
    ├── Origem (filtrada por classe)
    ├── Tendência (simplificada)
    ├── Feat inicial
    └── Review + Confirmar
    ↓
TUTORIAL "Primeiro Café"
    ↓
JOGO COMEÇA
```

---

## 9.3 Lores / Empresas Disponíveis

### 🚀 TechCorp (Dificuldade: ★★☆☆☆) — RECOMENDADA

```yaml
lore:
  id: "techcorp"
  name: "TechCorp"
  tagline: "Move fast, break things, fix later"
  recommended: true
  
  description: |
    Startup de 200 pessoas que acabou de levantar Series C.
    Cresceu rápido demais, processos não acompanharam.
    Fundadores ainda mandam, mas VPs estão chegando.
    Todo mundo é "família" — até o próximo layoff.
  
  mood:
    references: ["The Office", "Silicon Valley", "Severance lite"]
    tone: "comedy_60_drama_40"
    absurdity_level: "medium"
  
  difficulty: 2
  
  unique_mechanics:
    - "Slack é campo de batalha"
    - "Fundador aparece random com ideia nova"
    - "Cultura de 'ownership' (leia: culpa)"
  
  npcs:
    ceo: "fundador_visionario"
    antagonist: "thiago_rival"
    mentor: "marina_engineer"
    comic_relief: "caio_sales"
    wildcard: "geraldo_vp"
    support: "patricia_hr"
  
  starting_modifiers:
    reputation: 0
    political_capital: 3
    energy: 10
  
  dc_modifiers:
    social: 0
    technical: -1
    political: +1
  
  campaigns:
    - id: "first_sprint"
      name: "Sua Primeira Sprint"
      difficulty: 1
      encounters: 3
      
    - id: "product_launch"
      name: "Lançamento Impossível"
      difficulty: 3
      encounters: 5
      
    - id: "reorg_survival"
      name: "A Grande Reorg"
      difficulty: 4
      encounters: 7
```

### 🏦 MegaCorp Industries (Dificuldade: ★★★☆☆)

```yaml
lore:
  id: "megacorp"
  name: "MegaCorp Industries"
  tagline: "Processo é progresso"
  
  description: |
    Corporação centenária com 50.000 funcionários.
    7 níveis de aprovação pra mudar cor de botão.
    Política é esporte. Mérito é opcional.
  
  mood:
    references: ["Succession", "Mad Men", "Office Space"]
    tone: "drama_70_comedy_30"
  
  difficulty: 3
  
  unique_mechanics:
    - "Hierarquia rígida afeta DCs"
    - "Email > Slack (formalidade importa)"
    - "Comitês decidem tudo (lentamente)"
  
  starting_modifiers:
    reputation: -1
    political_capital: 2
    energy: 10
  
  dc_modifiers:
    social: +1
    technical: 0
    political: +2
```

### 🎨 Creative Chaos Agency (Dificuldade: ★★★★☆)

```yaml
lore:
  id: "creative_agency"
  name: "Creative Chaos Agency"
  tagline: "Deadline é sugestão criativa"
  
  description: |
    Agência de publicidade/design boutique.
    Clientes impossíveis, egos imensos, budget curto.
    Premiações importam mais que lucro.
  
  mood:
    references: ["Emily in Paris", "Mad Men lite"]
    tone: "comedy_80_drama_20"
  
  difficulty: 4
  
  unique_mechanics:
    - "Cliente muda briefing a qualquer momento"
    - "Awards = Currency social"
    - "Inspiração é recurso (pode acabar)"
  
  starting_modifiers:
    reputation: 1
    political_capital: 4
    energy: 8
```

### 🏗️ Consultoria Infinita (Dificuldade: ★★★★★)

```yaml
lore:
  id: "consultoria"
  name: "Consultoria Infinita"
  tagline: "Up or out. Mostly out."
  warning: "Modo difícil. Burnout é mecânica real."
  
  description: |
    Big4-style. Viagem toda semana.
    Trabalho das 7h às 23h é "normal".
    Você é billing. Sua vida é horas faturáveis.
  
  mood:
    references: ["Industry", "House of Lies", "The Firm"]
    tone: "drama_90_comedy_10"
  
  difficulty: 5
  
  unique_mechanics:
    - "Utilização % afeta tudo (meta: 85%+)"
    - "Travel drena Energy dobrado"
    - "Burnout é mecânica real — pode perder personagem"
  
  special_rules:
    burnout:
      threshold: 3  # dias com 0 energy
      consequence: "Perde 1 sessão, -2 em tudo na volta"
```

---

## 9.4 Tutorial: "Seu Primeiro Café"

```yaml
encounter:
  id: "tutorial_coffee"
  type: "tutorial"
  skippable: true
  duration_minutes: 5
  
  protection:
    failure_consequence: "none"
    min_reward: 1
  
  setup: |
    9h15. Máquina de café. Fila.
    Na frente: alguém que você deveria reconhecer.
    Atrás: Caio, de Sales.
    A máquina para.
    Todo mundo olha pra você.
  
  options:
    - text: "Tentar consertar"
      attribute: "TEC"
      dc: 8
      
    - text: "Fazer piada"
      attribute: "INF"
      dc: 6
      
    - text: "Ficar quieto"
      outcome: "Caio preenche o silêncio..."
  
  tutorial_message_on_fail: |
    Não se preocupe — falhar faz parte!
    Aqui no tutorial, você tá protegido.
```

---

# PARTE 10: CAREER TRANSITION SYSTEM

## 10.1 Conceito

A cada **5 níveis**, o mercado te nota. Você recebe **Proposta Externa**.

A nova empresa pode ser:
- **Upgrade** — Melhor cargo, melhor ambiente
- **Lateral** — Diferente, não necessariamente melhor
- **Armadilha** — Parecia bom, era cilada

**Você não sabe qual é até aceitar.** O DM rola dados secretamente.

---

## 10.2 Gatilhos de Proposta

| Nível | Evento |
|-------|--------|
| 5 | Primeira proposta |
| 10 | Proposta séria + promoção interna possível |
| 15 | Múltiplas propostas + contraproposta garantida |
| 20 | Proposta C-level ou golden handcuffs |

---

## 10.3 Fases da Transição

### Fase 1: Proposta Chega
```yaml
dm_rolls:
  quantity: "1d4 + mods"
  quality: "1d100 por proposta"
  
quality_thresholds:
  1-15: "armadilha"
  16-40: "lateral"
  41-75: "upgrade_minor"
  76-95: "upgrade_major"
  96-100: "unicorn"
```

### Fase 2: Investigação (Opcional)
```yaml
options:
  - glassdoor: "AWA DC 10 → revela red flag"
  - network: "INF DC 12 → cultura real"
  - ask_recruiter: "INF DC 14 → range salarial"
```

### Fase 3: Processo Seletivo (2-3 encounters)

### Fase 4: Decisão
```yaml
options:
  - accept: "Transição para nova lore"
  - negotiate: "INF DC 14 para melhorar"
  - decline: "+1 Rep (valorizou)"
  - counteroffer: "Pedir contraproposta"
```

---

## 10.4 Tabela de Rolls (1d100 + mods)

| Roll | Resultado |
|------|-----------|
| 1-10 | Armadilha Grave |
| 11-20 | Armadilha Leve |
| 21-40 | Lateral Ruim |
| 41-55 | Lateral |
| 56-70 | Upgrade Leve |
| 71-85 | Upgrade Bom |
| 86-95 | Upgrade Ótimo |
| 96-99 | Unicórnio |
| 100 | Jackpot |

### Modificadores
| Fator | Mod |
|-------|-----|
| Rep positivo | +3/ponto |
| Rep negativo | -5/ponto |
| Nunca pulou | +10 |
| Job hop recente | -15 |
| Completou campanha difícil | +5 |
| Foi demitido | -10 |

---

## 10.5 Revelação de Armadilhas

```yaml
trap_types:
  bait_and_switch:
    reveal: "Cargo era outro na prática"
    effect: "-1 nível efetivo"
    
  sinking_ship:
    reveal: "Empresa quebrando"
    effect: "Layoff risk, stress +1/sessão"
    
  toxic_culture:
    reveal: "Slack 24/7 esperado"
    effect: "Energy recovery -2"
    
  nightmare_boss:
    reveal: "Report das 22h obrigatório"
    effect: "DCs +2 com chefe"
```

---

# PARTE 11: MULTIPLAYER SYSTEM

## 11.1 Conceito Core

**2-6 jogadores** na mesma empresa, cada um com classe, objetivos, e agenda própria.

O DM (LLM) gerencia:
- Dinâmicas de grupo
- Objetivos conflitantes
- Ações simultâneas
- Informação assimétrica

---

## 11.2 Modos de Multiplayer

### 🤝 Coop ("Squad Goals")
```yaml
players: 2-4
premise: "Time vs sistema"
mechanics:
  shared_goal: true
  pvp: false
  help_actions: true
win: "Completar campanha juntos"
lose: "Projeto cancelado"
```

### ⚔️ Competitivo ("Só Pode Haver Um")
```yaml
players: 3-6
premise: "Uma vaga, vários candidatos"
mechanics:
  pvp: true
  sabotage: true
  secret_objectives: true
win: "Ser promovido"
lose: "Ser demitido"
```

### 🎭 Misto ("Coopetition") — RECOMENDADO
```yaml
players: 3-5
premise: "Trabalham juntos, competem por recursos"
structure:
  - "Fase projeto: Coop"
  - "Fase avaliação: Quem brilhou?"
  - "Fase promoção: Só um ganha"
```

---

## 11.3 Turno Simultâneo

```yaml
flow:
  1: "DM descreve cena"
  2: "Cada jogador escreve intenção SECRETA (60s)"
  3: "DM resolve em ordem lógica"
  4: "Jogadores reagem"
```

**Exemplo:**
```
CENA: Daily. Débito técnico veio à tona.

[INTENÇÕES SECRETAS]
PM: "Parecer líder"
Eng: "Culpar PM anterior"  
Designer: "Ficar fora"
Data: "Mostrar métricas"

[RESOLUÇÃO]
Data fala primeiro (neutro).
PM e Eng competem: INF vs INF.
PM ganha, fala primeiro.
Designer observa (AWA bônus).
```

---

## 11.4 Sistema de Alianças

```yaml
types:
  public: "+2 juntos, risco compartilhado"
  secret: "+3 secreto, -2 Rep se descoberta"
  temporary: "+1, sem risco"

betrayal:
  benefit: "Vantagem + surpresa"
  cost: "-2 Rep, inimizade, sem aliança por 1 sessão"
```

---

## 11.5 Ações de Sabotagem

```yaml
steal_credit:
  check: "INF DC 14"
  detection: "Vítima AWA vs resultado"
  caught: "-3 Rep, inimizade"

plant_doubt:
  check: "INF DC 13"
  success: "Alvo -2 próximo check"

set_up_to_fail:
  check: "INF DC 12"
  caught: "Possível REDACTED"
```

---

## 11.6 Objetivos Secretos

```yaml
examples:
  promotion: "Ser promovido primeiro (+50 XP)"
  protect: "Garantir que X não seja demitido (+40 XP)"
  saboteur: "Projeto falha sem ser culpado (+60 XP)"
  kingmaker: "Escolher quem é promovido (+45 XP)"
```

---

## 11.7 Ações Cooperativas

```yaml
support: "Helper DC 10 → +2 pro principal"
combo: "Ambos rolam, soma vs DC alto"
cover: "Se aliado falha, INF DC 12 esconde"
```

---

## 11.8 Cenários Multiplayer

### "A Sprint do Inferno" (Coop)
```
Sexta 15h. Deadline segunda 9h.
72 horas. Entregar ou alguém roda.
```

### "A Promoção" (Competitivo)
```
Uma vaga. Vários candidatos.
Chefe decide em 1 mês.
```

### "O Layoff" (Sobrevivência)
```
Rumores de corte. 20% vai sair.
Quem sobra?
```

---

# PARTE 12: ROADMAP

## Fase 1: Fundação (MVP)
- [ ] Estrutura de repo
- [ ] YAMLs de dados completos
- [ ] Engine core (dice, character, checks)
- [ ] CLI básico jogável

## Fase 2: LLM Integration
- [ ] Adapter para Anthropic API
- [ ] Adapter para Ollama
- [ ] Adapter para Claude CLI
- [ ] System prompt versionado

## Fase 3: Persistência
- [ ] SQLite para saves
- [ ] Carregar/salvar partidas
- [ ] Histórico de sessões

## Fase 4: Onboarding & Lores
- [ ] Flow de criação de personagem
- [ ] 4 lores implementadas (TechCorp, MegaCorp, Agency, Consultoria)
- [ ] Tutorial "Primeiro Café"
- [ ] Campanhas por lore

## Fase 5: Visual System
- [ ] Sprite sheets base
- [ ] Backgrounds (8 cenários)
- [ ] Componente React
- [ ] Animações de dado
- [ ] UI responsiva

## Fase 6: Career System
- [ ] Propostas a cada 5 níveis
- [ ] Sistema de entrevistas
- [ ] Tabelas de qualidade de oferta
- [ ] Armadilhas e revelações
- [ ] Transição entre lores

## Fase 7: Multiplayer
- [ ] Modo Coop
- [ ] Modo Competitivo
- [ ] Modo Misto
- [ ] Sistema de alianças
- [ ] Objetivos secretos
- [ ] Ações de sabotagem
- [ ] Turnos simultâneos

## Fase 8: AI Image Generation (Opcional)
- [ ] Integração DALL-E / Stable Diffusion
- [ ] Template de prompts
- [ ] Cache de imagens

## Fase 9: Comunidade
- [ ] README com contribuição
- [ ] Schema para criar conteúdo
- [ ] Sistema de aprovação
- [ ] Galeria de sprites

## Fase 10: Polish
- [ ] Admin UI
- [ ] Balanceamento via playtest
- [ ] Mais campanhas
- [ ] Efeitos sonoros

---

# PARTE 13: COMO USAR ESTE DOCUMENTO

## No Claude Code
Cole este documento inteiro como contexto inicial. Peça:
> "Crie a estrutura do repo corporate-quest seguindo este GDD. Comece pelos YAMLs de dados."

## Para Contribuidores
Este documento é a source of truth. Qualquer PR deve referenciar seções específicas.

## Para Playtests
Use a Parte 5 (Sessão Demo) como exemplo de como o jogo deve fluir.

---

*Corporate Quest — Um RPG onde o boss fight é uma reunião de alinhamento, o loot é Political Capital, e subir de nível significa virar Senior.*
