# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto segue [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Magic link login flow com toast messages
- Tela de continuar saves com melhor spacing
- Admin panel com game logs e configuração de AI

### Changed
- Mensagem de magic link mais concisa
- Layout de saves com truncamento de nome e melhor espaçamento

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
