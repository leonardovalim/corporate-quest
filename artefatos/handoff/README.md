# Corporate Quest — Design Handoff

Pacote de handoff para implementação em código. Direção estética: **Terminal Arcade** (arcade 80/90 monocromático, pixel font nos títulos, mono no corpo, markdown na narrativa).

## Conteúdo

```
handoff/
├── README.md              ← este arquivo
├── SPEC.md                ← direção estética, regras, do/don't
├── design-tokens.css      ← tokens (cores, fontes, spacing, effects)
├── components.css         ← estilos dos componentes (depende dos tokens)
├── components.html        ← lib visual isolada — abra no navegador
├── prototipo-completo.html ← protótipo com 5 telas (Home/Onboarding/Chat/Sidebar/Result)
└── screens/               ← screenshots de referência das 5 telas
    ├── 01-home.png
    ├── 02-onboarding.png
    ├── 03-chat.png
    ├── 04-sidebar.png
    └── 05-result.png
```

## Como usar

### 1. Leia `SPEC.md` primeiro
Define as regras da direção estética — o que manter, o que evitar. Obrigatório antes de começar a codar.

### 2. Inclua os tokens e componentes
No seu HTML raiz:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Press+Start+2P&display=swap" rel="stylesheet">

<link href="/styles/design-tokens.css" rel="stylesheet">
<link href="/styles/components.css" rel="stylesheet">
```

### 3. Use a biblioteca de componentes
Abra `components.html` no navegador — cada componente tem um demo isolado com markup copy-paste-ready.

### 4. Telas de referência
`prototipo-completo.html` tem as 5 telas em desktop + mobile. Screenshots PNG em `screens/` para anexar a issues/PRs.

## Stack recomendada

O pacote é framework-agnóstico. Os tokens e estilos são CSS puro. Para trazer pro stack do repo (ver `artefatos/`), basta:

1. Mover `design-tokens.css` + `components.css` para `frontend/src/styles/` (ou equivalente)
2. Importar na raiz do app (`main.tsx` / `_app.tsx` / `index.html`)
3. Usar as classes nos componentes React/Vue/etc.

## Telas cobertas nesta v1

- ✅ **Home** — tela de atração com chrome arcade
- ✅ **Onboarding** — wizard de criação de personagem (passo "Class" como exemplo)
- ✅ **Narrative Chat** — gameplay principal, markdown + opções + input livre
- ✅ **Character Sidebar** — ficha do personagem
- ✅ **Encounter Result** — stage clear / vitória

## Telas ainda não mockadas (próxima iteração)

- ⬜ Hub entre encounters (sessão em andamento)
- ⬜ Estado de dice-reveal (animação do d20)
- ⬜ Burnout / game over
- ⬜ Level up
- ⬜ Seleção de encounter (lista/mapa)
- ⬜ Loading / transições entre fases

## Convenções críticas (resumo do SPEC)

1. **Pixel font (Press Start 2P) SÓ em títulos curtos UPPERCASE.** Nunca em corpo.
2. **JetBrains Mono 17px** para narrativa. Line-height 1.65.
3. **Amber (`--warn`) é reservado** para NPCs, option keys `[a]`, "feat", warnings.
4. **Chrome arcade só na Home.** Gameplay usa `.slim-bar` + `.hud`.
5. **Sem rounded corners, sem gradientes, sem sombras coloridas.**
6. **Narrativa em markdown**: `## scene`, `> npc dialogue`, `*tone*`, paragrafos.

---

Dúvidas? Rodar o `prototipo-completo.html` e comparar com a implementação é o jeito mais rápido de pegar qualquer detalhe visual que o código não capture.
