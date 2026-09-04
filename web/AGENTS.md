# AGENTS.md — UI Designer

Scope: everything under `web/`. Repository-wide rules are in `../AGENTS.md`; catalogue
data rules are in `../quality-tools/AGENTS.md`. Developer setup, scripts, and routing
notes are in `README.md` next to this file — this file is about design decisions, not
commands.

Focus: usability, consistency, accessibility. Bias: systems thinking, reuse over one-offs.

---

## What you are designing

An interactive radar plus a catalogue browser for ~70 research software quality tools.
The audience is researchers and RSEs deciding which tool to adopt. They arrive with a
question — "what will check my code's FAIRness?" — and the interface either answers it or
wastes their time.

```
src/
  components/   Radar, FilterSidebar, Layout, ToolIndicators, InfoTooltip, SuggestToolForm
  pages/        Home (catalogue + radar), ToolDetail, About
  data/         loader.js (reads ../quality-tools), colors.js (dimension palette)
  hooks/        useIndicators.js (fetches the EVERSE indicators API, cached per session)
  index.css     Tailwind v4 import, @theme tokens, :root variables, .glass-panel
```

---

## The design system as it actually exists

**Tailwind v4, tokens in CSS.** Design tokens are declared in `@theme` inside
`src/index.css`. `tailwind.config.js` still exists with an empty `theme.extend`, but v4
does not auto-load it — `index.css` has no `@config` directive, so nothing in that file
reaches the build. Verified: a colour added to its `theme.extend` never appears in the
compiled CSS. It is a v3 leftover. Edit the CSS, not the config.

**The EVERSE palette is mapped onto Tailwind's `sky` and `indigo` scales.** `sky-*` is
EVERSE purple (`--color-sky-700: #6a3c82` is the brand main), `indigo-*` is EVERSE blue
(`--color-indigo-600: #3fa3dc`). This is confusing and deliberate: it lets existing
utility classes carry brand colour. Two consequences —

- Never read a `sky-`/`indigo-` class as its Tailwind stock colour.
- Don't "fix" the naming in passing. Renaming is a repo-wide change, its own PR, with the
  visual diff reviewed.

**Semantic variables** live in `:root`: `--primary-color`, `--secondary-color`,
`--glass-bg`, `--glass-border`, `--glass-shadow`, `--card-hover-bg`. Prefer these for new
CSS over restating hex values.

**`.glass-panel`** is the single container treatment: translucent white, blurred backdrop,
1rem radius. Every card, panel, and sidebar uses it. A new surface style needs a reason.

**Dimension colours** come from `DIMENSION_PALETTE` in `src/data/colors.js`, assigned by
index through `getDimensionColor(dimName, allDimensions)`. Two rules:

- A dimension's colour must be identical in the radar, the filters, and the tool page.
  Always go through `getDimensionColor` — never inline a hex.
- The palette carries twelve hues and wraps. Colour alone must never be the only way to
  tell dimensions apart; every coloured element also carries its label or an accessible
  name.

The file keeps two commented-out palettes, one of them colourblind-safe. Leave them —
they are a live design decision, not dead code.

**Icons**: `lucide-react`. **Markdown**: `react-markdown`. Don't add a third of either.

There is **no dark mode**. Don't add half of one.

---

## Accessibility — the part that is easy to get wrong here

WCAG AA is the floor, and the radar is where it gets interesting.

- **The radar is an SVG data visualization**, not decoration. It needs an accessible name
  and a text equivalent, and every filter it applies must also be reachable through the
  sidebar. A user who cannot use the radar must still reach every tool.
- **Keyboard**: every filter, dimension wedge, and tool card is reachable and operable by
  keyboard, with a visible focus state. If a click does something, Enter and Space do the
  same thing.
- **Hover-only content is not content.** `InfoTooltip` and the radar's dimension
  descriptions must also be available on focus. `pointer-events: none` on the tooltip is
  correct; a keyboard path to the same text is required.
- **Contrast**: check text on `.glass-panel` over the body's radial-gradient background,
  not against plain white.
- Anchor styling in `index.css` is scoped to `a:not([class*="text-"])` so component-level
  Tailwind text colours survive. When you colour a link by class, you own its contrast and
  its hover state.

---

## Rules

**Components before screens.** If a pattern appears twice, it becomes a component in
`src/components/`. No one-off UI hacks in a page.

**The interface may not distort the data.** This is the one place UI defers to the
catalogue every time:

- A tool with no `measuresQualityIndicator` shows an explicit empty state — not a blank
  panel, not a zero, not a hidden section.
- Never invent a default dimension, category, or license for display.
- Derived or normalized values are labelled as such. `normalizeLicense` in `loader.js`
  rewrites malformed SPDX URLs; if you add another normalization, name it and comment why.

**States are part of the component.** Default, hover, focus, active, loading, empty,
error. `useIndicators` swallows fetch failures into an empty array — pages that use it
must render sensibly when the API is unreachable, offline, or slow.

**Responsive down to a phone.** The radar has a fixed `size` prop and must scale or
gracefully step aside on narrow screens; the filter sidebar must be reachable there.

**Performance**: `loader.js` eagerly imports every tool JSON at build time, so the payload
grows with the catalogue. Watch the bundle when you add anything that touches all tools.

**Routing**: `HashRouter`, with no `basename` — every internal link is a hash route
(`#/tool/<id>`). Separately, Vite sets `base: './'` in `vite.config.js` so built assets
resolve under the GitHub Pages subpath. Both exist so the site needs no server-side
rewrites; don't introduce a router feature that would.

---

## Before you open a PR

```bash
cd web
npm run lint
npm run build
npm run dev    # and actually look at it
```

Check by hand: keyboard through the filters, one tool with many indicators, one with none,
a narrow viewport, and the radar with a dimension selected.

Frontend changes and catalogue changes go in separate PRs.
