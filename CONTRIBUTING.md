# Contributing to Corporate Quest

## Reporting Issues

### Bug Reports

Found something broken? [Open a GitHub issue](https://github.com/leonardovalim/corporate-quest/issues/new?labels=bug) with:

- **Title**: Clear description of the bug (e.g., "_Logout button doesn't clear character state_")
- **Environment**: Your OS, browser, and how you're running it (demo or self-hosted)
- **Steps to reproduce**: Exactly how to trigger the bug
- **Expected vs actual**: What should happen vs. what actually happens
- **Screenshots/video**: If it's a visual or gameplay bug, a screenshot helps

### Feature Requests

Have an idea? [Open a GitHub issue](https://github.com/leonardovalim/corporate-quest/issues/new?labels=enhancement) with:

- **Title**: What you want to add (e.g., "_Support for custom encounter difficulty scaling_")
- **Motivation**: Why this would be valuable
- **Proposed solution**: How you'd implement it (optional, we'll brainstorm)

### Security Vulnerabilities

**Do not open a public issue.** See [SECURITY.md](SECURITY.md) for private reporting.

## Prerequisites

- [Bun](https://bun.sh) (or Node 18+)
- A [Supabase](https://supabase.com) project (free tier works)
- An API key for at least one LLM provider (OpenAI, Anthropic, Gemini) or [Ollama](https://ollama.com) locally

## Local setup

```bash
git clone https://github.com/leonardovalim/corporate-quest.git
cd corporate-quest
bun install
cp .env.example .env   # fill in your Supabase URL and anon key
bun run dev            # http://localhost:8080
```

Run the migrations in `supabase/migrations/` (chronological order) in your Supabase SQL Editor, then log in to `/admin` with username `admin` and password `admin` and configure your LLM provider.

## Commit style

```
feat: add new encounter — boardroom coup
fix: energy not resetting between encounters
chore: update dependencies
docs: clarify self-hosting steps
```

One logical change per commit. Keep the subject line under 72 characters.

## Pull request flow

1. Fork the repo and create a branch from `main`
2. Make your changes and ensure `bun run build` passes with no errors
3. Open a PR with a clear title and description of what changed and why
4. A maintainer will review within a few days

## Adding new encounters

Add a template object in `src/game/encounter.ts`. The AI narrator handles all the dialogue and consequences — you only need to define the structure:

```ts
{
  name: 'Nome do Encontro',
  description: 'Descrição curta para o card de seleção',
  totalPhases: 4,
  rewards: { xp: 30, pc: 2, reputation: 1 },
  openingPrompt: 'Instrução inicial para a IA narrar a cena...',
  difficulty: 'medium',
  minLevel: 1,
}
```

## Code of conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating, you agree to abide by its terms.