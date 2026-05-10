# Corporate Quest — Aesthetic Spec

**Direction:** Terminal Arcade. An 80s/90s arcade cabinet running a corporate dungeon master. Dark, monochromatic, pixel-typed, markdown-narrated.

---

## Core principles

1. **Dark only.** There is no light mode. The app IS a CRT.
2. **Monochromatic foreground.** Warm off-white (`#f2f2ea`) on deep near-black (`#0a0a0b`). No saturated brand colors.
3. **Amber is reserved.** `--warn` (#e8c464) is ONLY for: NPC names, option keys `[a][b][c]`, "feat" / special tags, warnings. Never decorative.
4. **Green = success. Red = failure.** `--ok` and `--danger` appear only on roll results and related states.
5. **Pixel type for hierarchy, mono for reading.** Press Start 2P on anything short and large (titles, UI chrome). JetBrains Mono on everything you actually read (narrative, options, meta). Pixel fonts are UPPERCASE only — they have no italic.
6. **Markdown narrates.** The DM speaks in markdown: `##` scene headings, `> blockquotes` for NPC dialogue, `*italic*` for internal/parenthetical, plain paragraphs for description.
7. **Arcade chrome is earned, not applied.** Full arcade chrome (LED, coin counter, HI-SCORE) appears on the **Home** only. Gameplay uses a slim breadcrumb bar + HUD strip — nothing more.

---

## Typography

| Role | Font | Size | Case | Notes |
|---|---|---|---|---|
| Display titles | Press Start 2P | `--fs-h1` (≈32px) | UPPER | Always uppercase. `<em>` = amber, never italic. |
| Section titles | Press Start 2P | `--fs-h2` (≈16px) | UPPER | Tight leading 1.3. |
| Narrative `h2` | Press Start 2P | `--fs-h4` (≈10px) | UPPER | Kicker-style; amber color. |
| Body / narrative | JetBrains Mono 400 | 17px | mixed | Line-height 1.65. Max width ~68ch for comfort. |
| Option text | JetBrains Mono 400 | 15–17px | mixed | Bracketed keys in amber: `[a]`. |
| Meta / labels | JetBrains Mono 400 | 10–11px | UPPER | `letter-spacing: 0.15em`. |
| System messages | JetBrains Mono 400 | 12px | mixed | Between dashed rules. |

**Never** use pixel font for running text. **Never** use mono with a font-size below 11px (it becomes illegible).

---

## Color tokens

See `design-tokens.css`. Rules:

- `--fg` for primary content.
- `--fg-dim` for secondary / labels / meta.
- `--fg-faint` for the faintest tertiary (footer, disabled, placeholders).
- `--rule` for every border and divider.
- `--warn` amber — see reserved usage above.
- `--danger` red — only for: failed rolls, negative modifiers (`−1`), "risk" tags.
- `--ok` green — only for: successful rolls, victory states.

No gradients. No saturated surfaces. No colored backgrounds (bgs stay in the `--bg` family).

---

## Component vocabulary

### `.cabinet`
The product shell. Dark background, thin warm border, and an outer dark/warm double-border "frame" via box-shadow. Contains CRT scanline overlay and vignette overlay on pseudo-elements. Content sits on `z-index: 3`.

### `.arcade-bar` — full arcade chrome (Home only)
`◆ Brand` · `● LED Insert coin` · `CP · 03` · `HI-SCORE · Lv 07`

### `.slim-bar` — gameplay chrome
`~/encounters/daily-standup · phase 2/3` · `session 07:42:18`

### `.hud` — resource strip (gameplay)
`⚡ 9/10 · CP · 3 · REP · +1 · XP · 340/500 · [Character · Class · Lv]`

### `.msg-dm` — narrative block (markdown)
- `<h2>` → scene kicker (UPPERCASE, amber, pixel font, tiny)
- `<p>` → description (mono 17px)
- `<blockquote>` with `<span class="npc">` → NPC dialogue; name in amber lowercase
- `<em>` → tone/internal/parenthetical; dim

### `.opt` — action button
`[a]` amber key · action text · optional parenthetical em in dim or amber · meta: `STAT ±N · DC NN` + tag (`favorável` / `neutro` / `risco` / `feat`).

### `.input-line` — free-form action shell
`$ cursor-blinking ▮` — lets the player describe custom actions.

### `.side` — character sheet
Name (pixel, UPPERCASE), class/level (mono kicker), alignment, resource bars (3px tall, `--fg` fill), 3x2 attribute grid, dashed roll-history log.

### `.result-rewards` — stage clear grid
4-up grid (2-up on mobile): XP / Capital político / Reputação / Energia gasta. Numbers in pixel font; `<em>` positive values in amber.

---

## Layout & density

- **Desktop width target:** 1024–1280px for the cabinet.
- **Mobile target:** 375px wide.
- **Borders collapse.** Never stack two borders — use `border-bottom` on top element, skip `border-top` on next.
- **Spacing:** use the `--sp-*` scale. Vertical rhythm in multiples of 4px.
- **No rounded corners.** `--radius: 0`. Sharp arcade aesthetic.

---

## Motion

- Subtle only. `--ui-dur: 0.15s` for hover/focus.
- LED blink, cursor blink — 1.2s step-timing.
- Reveal transitions: simple fade-in on new DM messages (200–300ms).
- **No** spring animations, bouncy eases, or page slide transitions. It's a terminal.

---

## Iconography

- Use sparingly. Prefer textual markers: `▶`, `◆`, `▮`, `·`, `—`, `↓`, `↑`, `✓`, `✗`, `═══`, ASCII frames.
- When a real icon is needed, use **Phosphor Light** at 1.5px stroke (not 2px) so it sits visually at the same weight as the mono text.
- `currentColor` only — no colored icons.

---

## Writing tone

- Narrative: crisp, visual, present tense. "Você entra na daily com dois minutos de atraso."
- NPC voices: idiosyncratic, lowercase, casual. "tem débito técnico aqui que pode explodir."
- Roll results: factual, terse. "TEC d20=15 +3 = 18 vs DC 12 ✓ crit"
- Never explain the joke. The humor comes from the clash between office-speak and RPG-speak, not from winking.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Pixel caps titles | Pixel body text |
| Mono running copy | Serif anywhere |
| Amber for NPCs & option keys | Amber as background |
| Monochrome icons | Colored illustrations |
| ASCII art blocks | Illustrated characters |
| Sharp corners | Rounded corners |
| Scanline + vignette | Heavy CRT curvature/distortion |
| Markdown in DM messages | Rich-text WYSIWYG |
| Blinking cursor / LED | Spring / bounce animations |
