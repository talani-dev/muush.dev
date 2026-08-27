# Session history

Append-only log of closed sessions. Each entry: what was worked on, what
shipped, what's still open.

## 2026-08-26 — Harness setup

- Installed spec-kit (`specify init . --ai claude --no-git`).
- Wrote `.specify/memory/constitution.md` (9 articles, v1.0.0) adapted from
  `talani-site`'s constitution — Feature-Based/Pinia/vue-query/Playwright
  content dropped, replaced with static-site/Astro-island/i18n-parity
  articles that actually match this repo.
- Wrote `CLAUDE.md`, `AGENTS.md` (broke the CLAUDE.md → AGENTS.md symlink
  from the Astro scaffold — they now hold different content per the
  harness convention), `feature_list.json` (empty), `init.sh`,
  `.claude/agents/{leader,spec_author,implementer,reviewer}.md`,
  `.claude/settings.json` hooks, `docs/harness/{specs,verification,CHECKPOINTS}.md`,
  `docs/business/overview.md`.
- Task tracker: `feature_list.json` (not Notion) — chosen explicitly over
  talani-site's Notion tracker to keep this repo dependency-free.
- spec-kit auto-commit hooks left disabled in `.specify/workflows/` — this
  repo's Husky `commit-msg` hook enforces an exact gitmoji↔type pairing that
  a generic auto-commit would violate.

## 2026-08-27 — Business context synced from Notion

- Pulled company/landing context from the Notion "Muush" teamspace
  (Company, Services, Messaging Library, Branding, Project State, Landing ·
  Contenido y copy, Landing · Mapa de UI) and rewrote `docs/business/` as a
  tree: `overview.md`, `services.md`, `messaging.md`, `branding.md`,
  `landing/{content,ui-map,decisions-open}.md`.
- Deliberately excluded internal HR/compensation, sales pipeline, and
  personal data from Notion — out of scope for implementing a public
  marketing site, and not something that belongs in a repo agents read from.
- Found two conflicts worth flagging to any spec that touches the landing:
  1. **Routing**: the scaffold's `prefixDefaultLocale: true` (`/es/`, `/en/`)
     doesn't match the real design (`/` for ES, `/en/` for EN, and
     asymmetric `/nosotros` vs `/en/about`). See
     `docs/business/landing/decisions-open.md`.
  2. **Design tokens**: `src/styles/global.css` still has placeholder color
     values. The real branding-book hex values (5 steps per ramp, not 10)
     are now documented in `docs/business/branding.md` — applying them is
     future work, not done as part of this sync.
- Updated `CLAUDE.md`, `AGENTS.md`, `spec_author.md`, `implementer.md` to
  point at `docs/business/` recursively (it's now a tree, not flat files).

## 2026-08-27 — Feature 1: design_tokens_and_logos (done)

- Implemented `specs/001-design-tokens-and-logos/` end to end (spec, plan,
  research, data-model, quickstart, 19 tasks) via the `implementer` agent,
  reviewed and **APPROVED** by the `reviewer` agent
  (`docs/harness/progress/review_design_tokens_and_logos.md`).
- `src/styles/global.css`: replaced the placeholder 10-step (50-900)
  `--red-*`/`--wine-*`/`--ink-*`/`--bone-*` ramps with the real 5-step
  (100-500) branding-book values (`docs/business/branding.md`), and shrunk
  the matching `@theme inline` `--color-<ramp>-<step>` mappings to 20
  entries (4 ramps x 5 steps). Verified via grep that no removed step
  (50/600/700/800/900) was referenced anywhere outside `global.css`.
  `--font-poppins`/`--font-instrument` tokens and all four `@font-face`
  blocks confirmed unchanged — they already matched the branding book.
- `src/assets/logo/`: brought the three official isotipo SVGs into the
  project, renamed to background-context-first names
  (`isotipo-on-bone.svg`, `isotipo-on-ink.svg`, `isotipo-on-red.svg`,
  copied from `muush-dark.svg`/`muush-light.svg`/`muush-triple-white.svg`
  at the external source path), with a colocated `README.md` mapping
  background context -> file/source/stroke/dot. Diffed all three: shared
  `viewBox`/`circle`/`path`/`stroke-width`/`stroke-linecap`, only
  fill/stroke colors differ.
- Deliberately out of scope, per spec FR-007/FR-008: no wrapper `.astro`
  component, page, header, footer, favicon, or logo instance was added; no
  wordmark or lockup A/B asset — only the three isotipo-only (lockup C)
  variants.
- Verification: `pnpm check`, `pnpm typecheck`, `pnpm test` (existing suite,
  unmodified), `pnpm build` (spot-checked `#cf3147` in compiled CSS) all
  green; `./init.sh` exit code 0.
- `feature_list.json`: feature id 1 status `reviewing` -> `done`.
- Full implementer summary: `docs/harness/progress/impl_design_tokens_and_logos.md`.
  Full reviewer verdict: `docs/harness/progress/review_design_tokens_and_logos.md`.
