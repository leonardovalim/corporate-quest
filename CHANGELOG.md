# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto segue [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security
- **Segredos do admin saem de `admin_config`** (migration `0005`). A tabela tinha
  policy de leitura pública e guardava `admin_password_hash` +
  `admin_session_token`: qualquer portador da publishable key lia um token de
  sessão admin válido e, com ele, chamava `get_all_profiles_for_admin` para
  extrair os dados pessoais de todos os jogadores. Os segredos passam para
  `admin_auth`, sem acesso via API.
- Token de sessão admin existente é invalidado pela migration
- Senha padrão `admin` é neutralizada; o painel fica trancado até o operador
  definir uma senha real (repositório público = senha padrão não é senha)
- Corrigido bypass de autenticação em `create_admin_session`: com hash nulo,
  `crypt()` retornava `NULL`, a comparação `!=` avaliava `NULL` e qualquer senha
  era aceita
- Removida `verify_admin_password`, função legada exposta a `anon`

### Added
- Sessão anônima do Supabase (`src/lib/session.ts`): o visitante sem cadastro
  ganha um JWT real, o que satisfaz o auth check da edge function do DM sem
  adicionar fricção de login
- Magic link login flow com toast messages
- Tela de continuar saves com melhor spacing
- Admin panel com game logs e configuração de AI

### Changed
- `streamChat` envia o `access_token` da sessão em vez da publishable key —
  a publishable key não é JWT de usuário e era rejeitada com 401 pela função
- Erros do DM viraram diagnosticáveis: mensagem do servidor repassada em vez de
  JSON cru, e falha de fetch com o navegador online passa a acusar backend fora
  do ar em vez de culpar a internet do jogador
- `useAuthSession` e os CTAs de salvar progresso ignoram sessões anônimas, para
  que o visitante continue sendo tratado como não cadastrado
- `types.ts` reconciliado com o schema real (RPCs de admin usam `p_token`,
  `admin_config` sem colunas de senha)

### Fixed
- SAIR button agora retorna para home screen após sign out
- Ambiguidade no ID da tabela `admin_config` em queries plpgsql
- Coluna `id` ambígua em `get_all_profiles_for_admin`

## [0.2.0] - 2026-05-10

### Added
- Open source initial release
- Sistema completo de RPG corporativo com d20
- 6 classes corporativas (PM, Engineer, Designer, Data Analyst, Sales, Manager)
- 12+ encontros gerados dinamicamente
- Sistema de energia (burnout)
- Capital político e reputação
- Multi-LLM support (OpenAI, Anthropic, Google Gemini, Ollama)
- Supabase authentication com magic links
- Game saves com múltiplos slots
- Admin panel com game logs
- Self-hosting documentation

### Security
- DOMPurify para XSS prevention
- RLS policies no Supabase
- JWT signature verification
- Admin password hashing com bcrypt
- Session tokens para admin panel
- Security.md policy

### Changed
- Consolidação de 15 migrations em 4 arquivos limpos
- Uso de `extensions.crypt()` para pgcrypto no Supabase
- Remoção de features não utilizadas (pixel art)

### Fixed
- pgcrypto integration com Supabase
- Admin function authentication

## [0.1.0] - 2026-05-08

### Initial Development
- Projeto iniciado
- Stack base: React + TypeScript + Vite + Supabase
- Shadcn/ui components
- Tailwind CSS styling
- Game state management
- LLM integration para narrative streaming
