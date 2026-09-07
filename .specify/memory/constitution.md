<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 2.0.0
Status: MAJOR — the project migrated from Astro + Svelte to Nuxt 4 + Vue on
2026-09-06. Every article that named an Astro concept was rewritten, and the
architecture articles were adopted from talani-site's constitution.

Added principles:
  I.    Feature-Based + Capas (ui/logic/data) Architecture
  II.   Dependency Direction (NON-NEGOTIABLE)
  III.  Feature Isolation (NON-NEGOTIABLE)
  IV.   Static-Site Purity (NON-NEGOTIABLE)
  V.    Component Discipline
  VI.   i18n Parity (NON-NEGOTIABLE)
  VII.  Design Tokens Discipline
  VIII. Clean Code Discipline
  IX.   TypeScript Strict + Biome
  X.    Testing Discipline
  XI.   Configuration & Credential Hygiene (NON-NEGOTIABLE)
  XII.  Absolute Imports via Alias

Removed (v1.0.0, Astro-era):
  - "Astro Component & Island Discipline" → replaced by V (Vue SFCs)
  - The Article VII ban on Storybook → reversed by decision on 2026-09-06;
    Storybook is now part of the toolchain

Templates reviewed:
  ✅ .specify/templates/plan-template.md — Constitution Check gate is dynamic; no change needed.
  ✅ .specify/templates/spec-template.md — Generic; no change needed.
  ✅ .specify/templates/tasks-template.md — Generic; no change needed.
  ✅ .specify/templates/checklist-template.md — Generic; no change needed.

Deferred TODOs: none
-->

# muush.dev Constitution

## Core Principles

### I. Feature-Based + Capas (ui/logic/data) Architecture

muush.dev is organized by product domain, not by technical layer at the top
level. Every feature lives under `app/features/<feature>/` (`app/` is this
repo's Nuxt 4 `srcDir`).

The feature modules are: `shell` (nav, footer, mobile menu), `landing`
(hero, purpose, services, projects, contact CTA), `about` (team, network,
work-with-muush) and `forms` (the contact and application forms, which
appear on both pages).

Each feature has exactly three internal layers, plus a barrel:

```
app/features/<feature>/
  ui/          # Presentational .vue components
  logic/       # Composables and validation rules
  data/        # Content shaping and types
  index.ts     # Barrel export — the feature's only public API
```

Cross-cutting reusables (the design-system primitives, shared formatters and
validators) live in `app/shared/{ui,logic,data,utils}` — this is not a
dumping ground for logic that belongs inside a single feature.

Nuxt-native folders (`app/layouts/`, `app/pages/`, `app/middleware/`,
`app/plugins/`) hold routing and structural chrome, not business logic.
Pages are thin wrappers that compose feature components and read routing
params — they do not contain feature logic themselves.

### II. Dependency Direction (NON-NEGOTIABLE)

Within a feature, dependencies point in one direction only:

- `ui/` MAY import from `logic/` and `data/`
- `logic/` MAY import from `data/`
- `data/` MUST NOT import from `logic/` or `ui/`
- `logic/` MUST NOT import from `ui/`

Any import that runs against this direction is a constitution violation,
regardless of how small or "just this once" it seems.

### III. Feature Isolation (NON-NEGOTIABLE)

A feature MUST NOT import another feature's internal files (`ui/`, `logic/`,
or `data/`) directly. Cross-feature communication goes only through the
target feature's `index.ts` barrel export, or through `app/shared/`.

If two features need the same piece of logic, lift it to `app/shared/`
rather than reaching into another feature's internals. Prefer duplicating a
small utility inside a feature over creating a premature shared abstraction
for a one-off need.

### IV. Static-Site Purity (NON-NEGOTIABLE)

muush.dev ships as static files to S3 + CloudFront. `nuxt.config.ts` MUST
keep `nitro.preset: 'static'`, and the deployable artifact is whatever
`pnpm generate` writes to `.output/public`.

There MUST be no `server/api/` routes, no runtime server dependency, and no
feature that requires compute at request time. Any capability that needs a
server (auth, server-side form processing, a database) is out of scope for
this repo by definition — it belongs in a different service, not a
workaround bolted onto this site.

Form submissions go to an external endpoint chosen per
`docs/business/landing/decisions-open.md`; that is a network call from the
browser, not a server route in this project.

### V. Component Discipline

All components are Vue SFCs using `<script setup lang="ts">` — the Options
API is prohibited.

Components under `ui/` are presentational: they receive props and emit
events. They MUST NOT call external endpoints directly — always delegate to
a composable in `logic/`. Complex logic belongs in `logic/` composables,
never inlined in `<script setup>`. Components MUST stay under 200 lines;
extract sub-components if they grow past that.

Interactivity is opt-in and local. A component that renders the same markup
on every load MUST NOT carry client-side state just to make it feel dynamic.

### VI. i18n Parity (NON-NEGOTIABLE)

The site ships in Spanish (default) and English, both with a URL prefix
(`/es/`, `/en/`).

Every route MUST resolve in both locales — no locale may ship a page the
other lacks. Every key in `i18n/locales/es.json` MUST have a counterpart in
`en.json`; a key present in only one locale is a constitution violation, and
`tests/i18n-parity.test.ts` enforces it mechanically.

Route segments are translated (`/es/nosotros` ↔ `/en/about`), so the locale
switcher MUST resolve the equivalent route through the i18n route map. It
MUST NOT swap the prefix by string manipulation — that silently produces
404s, and shipping one in a `hreflang` tag tells search engines the page
exists when it does not.

No user-facing string may be hardcoded in a component.

### VII. Design Tokens Discipline

Components MUST NOT hardcode color or spacing literals (hex, oklch, or
arbitrary Tailwind values like `bg-[#123456]`). Every visual value goes
through the CSS custom properties defined in `app/assets/css/global.css`
(`--bone-*`, `--ink-*`, `--red-*`, `--wine-*`) and the fluid type/space
scale, consumed as Tailwind utility classes.

The fluid scale exists so a component states its intent once
(`text-display`) and the desktop↔mobile difference resolves through
`clamp()`. Reaching for a breakpoint to change a font size or a padding is
a signal the token is missing, not that the token should be bypassed.

Poppins is reserved for the logo and wordmark. Instrument Sans is
everything else.

### VIII. Clean Code Discipline

Code MUST express intent, not implementation details.

- **Naming**: No generic names (`data`, `info`, `temp`, `result`).
- **Single Responsibility**: Each function does one thing; its name
  describes exactly what it does.
- **Small functions**: ~30 lines maximum. Extract logic into well-named
  composables or private functions.
- **DRY**: The same logic appearing in 2+ places MUST be extracted into a
  single source of truth.
- **No dead code**: Delete unused functions, imports, variables, components,
  and commented-out code. Git history preserves deletions.
- **Early returns**: Return early for errors and edge cases. Avoid deep
  nesting.
- **No magic numbers**: Extract literals into named constants.
- **No over-engineering**: Build only what is requested. No speculative
  abstractions, no premature generalization.
- **Naming conventions**: Vue components use PascalCase filenames.
  Composables use the `use` prefix.

### IX. TypeScript Strict + Biome

All code is TypeScript in **strict mode** — non-negotiable.

- **No `any`** — use `unknown` and narrow it.
- **No `@ts-ignore`** — use `@ts-expect-error` with a comment explaining why,
  only when truly unavoidable.
- **Biome** is the single lint/format tool (config in `biome.json`) — ESLint
  and Prettier MUST NOT be installed.
- `pnpm check` and `pnpm typecheck` MUST pass before any commit — already
  enforced by this repo's Husky `pre-commit`/`pre-push` hooks.

### X. Testing Discipline

Test names follow the pattern: `should <expected> when <condition>`.

Three testing layers, each with a distinct, non-overlapping scope:

1. **Unit tests** (Vitest) — pure logic in `logic/`, `app/shared/utils/` and
   `utils/`. Route mapping, validation rules and formatters MUST have unit
   tests.
2. **Component tests** (Vitest + Vue Test Utils) — `ui/` components in
   isolation with stubbed composables. Verify rendering given props and
   emitted events.
3. **Visual review** (Storybook) — every component in `app/shared/ui/` MUST
   have a story. Stories are how a component is reviewed before it is
   composed into a page, and they are the reason a broken variant is caught
   at the component level instead of three sections later.

E2E is deliberately out of scope: the site has no authenticated flows and no
server state to integration-test against. Adding Playwright would violate
Article VIII.

No test MAY depend on another test's state.

### XI. Configuration & Credential Hygiene (NON-NEGOTIABLE)

Environment variables MUST be accessed through Nuxt's `runtimeConfig`.
`process.env` MUST NOT appear directly in application code.

`.env.example` MUST be committed with all required variable names and
blank/placeholder values. Real values live only in gitignored `.env*` files.

**Credential hygiene**: real credential values — analytics keys, form
endpoint tokens, deploy credentials, or any value whose leak would grant
access to a real environment — MUST NEVER be written to source control. This
includes application code, `specs/` artifacts, commit messages, and AI
assistant conversations. Use fake-but-shaped placeholder values instead.

If a real credential is accidentally committed or pasted into an AI
assistant conversation, treat it as **compromised** and rotate it at the
source — do not just remove it from the diff.

### XII. Absolute Imports via Alias

All intra-project imports MUST use the path aliases configured in
`nuxt.config.ts`:

| Alias | Resolves to |
|-------|-------------|
| `@/features/` | Feature modules |
| `@/shared/` | Cross-cutting reusables |
| `@/layouts/` | Nuxt layouts |
| `@/assets/` | CSS, logo and social SVGs |
| `@/types/` | Shared TypeScript types |
| `@/utils/` | Shared utility functions |

Relative imports are prohibited except between files in the **same**
directory. Aliases added here MUST also be mirrored in
`.storybook/main.ts`, which runs Vite outside Nuxt and does not inherit
them.

## Compliance Review

Every change MUST verify compliance with the applicable principles before
merge. A violation MUST be justified in the `plan.md` Complexity Tracking
table. No exception is valid without an explicit record.

## Development Workflow

Work is tracked in `feature_list.json` and follows the SDD flow defined in
`docs/harness/specs.md`: `pending → spec_ready → ⏸ human approval →
in_progress → reviewing → done`. One feature is active at a time.

All commits MUST pass the Husky quality gate (Biome, typecheck, and tests on
push). Bypassing it with `--no-verify` is prohibited. Branch names follow the
prefixes enforced by `.husky/pre-commit`.

Design measurements come from `docs/business/landing/design-extract.md`. The
Pencil MCP bridge is only available in the main interactive session, so
subagents MUST read that file rather than attempting to open the `.pen`.

## Governance

This Constitution supersedes all other practices, conventions, and
preferences within `muush.dev`.

Amendments require:

1. Description of the change and motivation.
2. Version bump per semantic versioning (MAJOR/MINOR/PATCH — see below).
3. Sync propagation check against all templates in `.specify/templates/`.
4. Ratified via explicit written approval before merging.

**Versioning**:
- MAJOR: Backward-incompatible governance change or principle removal.
- MINOR: New principle added or materially expanded.
- PATCH: Clarification, wording, typo fix.

**Version**: 2.0.0 | **Ratified**: 2026-08-26 | **Last Amended**: 2026-09-06
