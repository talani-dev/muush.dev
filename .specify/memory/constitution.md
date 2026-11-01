<!--
SYNC IMPACT REPORT
==================
Version change: 2.1.0 → 2.1.1
Status: PATCH — Article VII naming clarified, no principle added or removed.
The v2 palette loses its `--m1-*` prefix so that nothing in the final code
carries a version marker; v1 is quarantined (`legacy-*` tokens,
`app/shared/ui/legacy/`, Storybook `Legacy v1/`) until feature 47 deletes it.

Ratified: Roberto, "si apruebo", 2026-11-01 (leader session, feature 42).

Modified principles:
  VII. Design Tokens Discipline — palette family names without prefix; no
       version marker in token, utility, component or Storybook names; v1
       quarantine locations named.

Templates reviewed:
  ✅ .specify/templates/*.md — no token names; no change needed.

Agent guidance files reviewed:
  ✅ .claude/agents/implementer.md — "`--m1-*` family" replaced by the
     unprefixed families and the quarantine rule.

Deferred TODOs: none

Previous report (2.1.0) follows.
-->
<!--
SYNC IMPACT REPORT
==================
Version change: 2.0.1 → 2.1.0
Status: MINOR — Article VII materially expanded for the Muush 1.0 redesign
(feature 41 `v2_foundation_docs`). No principle was removed.

Ratified: Roberto, "apruebo", 2026-10-31 (leader session, proposal A in
docs/harness/progress/v2-foundation-proposal.md).

Modified principles:
  VII. Design Tokens Discipline — palette moves to the `--m1-*` family; the
       v1 families stay only until feature 47 and new code must not use
       them; new "Responsive anchors" rule (390/1440 must match the design,
       sizes and spacing may adapt elsewhere); Poppins 500 now also covers
       headings.
  Development Workflow — design values come from the `.pen` via the leader
       (rules.md § R32), not from design-extract.md; the handoff package is
       reference code.

Templates reviewed:
  ✅ .specify/templates/plan-template.md — no token, font or design-source reference; no change needed.
  ✅ .specify/templates/spec-template.md — no token, font or design-source reference; no change needed.
  ✅ .specify/templates/tasks-template.md — no token, font or design-source reference; no change needed.
  ✅ .specify/templates/checklist-template.md — no token, font or design-source reference; no change needed.

Agent guidance files reviewed:
  ✅ .claude/agents/implementer.md — design-source rules rewritten: values come from the leader's task, muush-1.0.md and the handoff; v1 docs only for v1 code; v1 tokens banned in new code; responsive anchors.
  ✅ .claude/agents/spec_author.md — design-source note rewritten to match.
  ✅ AGENTS.md — handoff pointer, v2 branch flow, responsive anchors.

Note: "not fall back to docs/business/" refers to visual values. The
decisions and approved copy in docs/business/muush-1.0.md are still read.

Deferred TODOs: none

Previous report (2.0.1) follows.
-->
<!--
SYNC IMPACT REPORT
==================
Version change: 2.0.0 → 2.0.1
Status: PATCH — wording fix in Article VI. The site's default locale moved
from Spanish to English (feature 37 `english_default_locale`, 2026-10-16):
`i18n.defaultLocale: 'en'`, `rootRedirect: '/en'`, `x-default` → English.
Article VI's parenthetical "(default)" now names English. No principle was
added, removed or expanded: both locales still ship with a prefix and the
parity rules are unchanged.

Motivation: `/` already resolves to `/en` at the edge (feature 33,
DEFAULT_LOCALE "en"); the site configuration and this document now agree.

Ratified: Roberto, "si", 2026-10-16 (leader session, decision D6 of the
feature 37 audit, docs/harness/progress/audit_english_default_locale.md).

Modified principles:
  VI. i18n Parity — "Spanish (default) and English" → "English (default)
      and Spanish"; prefix order shown as `/en/`, `/es/`.

Templates reviewed:
  ✅ .specify/templates/plan-template.md — no locale reference; no change needed.
  ✅ .specify/templates/spec-template.md — no locale reference; no change needed.
  ✅ .specify/templates/tasks-template.md — no locale reference; no change needed.
  ✅ .specify/templates/checklist-template.md — no locale reference; no change needed.

Deferred TODOs: none

Previous report (2.0.0) follows.
-->
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

The site ships in English (default) and Spanish, both with a URL prefix
(`/en/`, `/es/`).

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

Components MUST NOT hardcode color or spacing literals (hex, rgb, oklch, or
arbitrary Tailwind values like `bg-[#123456]`). Every visual value goes
through the CSS custom properties defined in `app/assets/css/global.css`
and the fluid type/space scale, consumed as Tailwind utility classes. Since
the Muush 1.0 redesign the palette is the neutral base, brasa and acero
families (`--negro-*`, `--carbon-*`, `--gris-*`, `--blanco`, `--red-muush-*`,
`--crimson-*`, `--oxblood-*`, `--coral-*`, `--arena-*`, `--acero-*`), taken
from the `m1-*` variables of the `.pen` and `docs/handoff/muush-1.0/`. Token,
utility, component and Storybook names carry **no version marker** (no `m1`,
`v2`): they are the final names. Everything that belongs to the v1 design is
quarantined until feature 47 deletes it: the token families `--bone-*`,
`--ink-*`, `--red-*`, `--wine-*` and any `legacy-*` token, the components in
`app/shared/ui/legacy/`, and the Storybook group `Legacy v1/`. New code MUST
NOT use any of them.

The fluid scale exists so a component states its intent once
(`text-display`) and the desktop↔mobile difference resolves through
`clamp()`. Reaching for a breakpoint to change a font size or a padding is
a signal the token is missing, not that the token should be bypassed.

**Responsive anchors.** The design file draws 390 px and 1440 px. At those
two widths the build MUST match the design. At every other width, sizes and
spacing MAY differ from a literal interpolation so the layout stays sound;
color, components, copy and behavior MUST NOT.

Poppins (weight 500) is used for the logo, the wordmark and headings.
Instrument Sans is everything else.

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

Design values come from the `.pen` file, which only the leader session can
read (the Pencil MCP bridge is not available to subagents). The leader
extracts the values a subagent needs and passes them in its task; a subagent
missing a value asks the leader instead of falling back to the v1 design
documents in `docs/business/`.
For Muush 1.0, `docs/handoff/muush-1.0/` carries exact tokens and behavior as
reference code.

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

**Version**: 2.1.1 | **Ratified**: 2026-08-26 | **Last Amended**: 2026-11-01
