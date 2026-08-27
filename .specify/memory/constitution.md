<!--
SYNC IMPACT REPORT
==================
Version change: (template) → 1.0.0
Status: Initial ratification.

Added principles:
  I.    Static-Site Purity (NON-NEGOTIABLE)
  II.   Astro Component & Island Discipline
  III.  i18n Parity (NON-NEGOTIABLE)
  IV.   Design Tokens Discipline
  V.    TypeScript Strict + Biome
  VI.   Absolute Imports via Alias
  VII.  Testing Discipline
  VIII. Configuration & Credential Hygiene (NON-NEGOTIABLE)
  IX.   Clean Code Discipline

Removed: none (initial ratification)

Templates reviewed:
  ✅ .specify/templates/plan-template.md — Constitution Check gate is dynamic (no hardcoded principle names); no change needed.
  ✅ .specify/templates/spec-template.md — Generic; no constitution-specific references. No change needed.
  ✅ .specify/templates/tasks-template.md — Generic; no constitution-specific references. No change needed.
  ✅ .specify/templates/checklist-template.md — Generic; no constitution-specific references. No change needed.

Deferred TODOs: none
-->

# muush.dev Constitution

## Core Principles

### I. Static-Site Purity (NON-NEGOTIABLE)

muush.dev is a static marketing site with no server runtime. `astro.config.mjs`
MUST keep `output: 'static'`. There MUST be no `server/` directory, no Astro
server endpoints (`.json.ts`/`.ts` API routes under `pages/`), and no runtime
dependency on a backend of any kind. The build output (`dist/`) MUST be
deployable as plain files to S3 + CloudFront with no compute behind it.

Any feature that would require a server (auth, forms with server-side
processing, database access) is out of scope for this repo by definition — it
belongs in a different service, not a workaround bolted onto this site.

### II. Astro Component & Island Discipline

`src/components/` holds presentational `.astro` files: zero client-side JS by
default, rendered fully at build time. `src/islands/` holds `.svelte` files
used only for genuine interactivity, and MUST always be hydrated with an
explicit `client:*` directive (`client:load`, `client:idle`, `client:visible`)
— never hydrated implicitly.

`components/` MUST NOT import from `islands/`. This keeps the static/interactive
boundary explicit: a page composes static components and drops in an island
only where interactivity is actually required, never the other way around.

### III. i18n Parity (NON-NEGOTIABLE)

Every route MUST exist under both `src/pages/es/` and `src/pages/en/` — no
locale may ship a page the other lacks. Every key defined in `src/i18n/ui.ts`
MUST have both an `es` and an `en` entry; a key present in only one locale is
a constitution violation, not a "fix it later" gap.

`BaseLayout.astro` MUST always emit `hreflang` alternate links for every
configured locale, derived from `astro.config.mjs`'s `i18n.locales` — never
hardcoded to just `es`/`en` inline.

### IV. Design Tokens Discipline

Components MUST NOT hardcode color or spacing literals (hex, oklch, arbitrary
Tailwind values like `bg-[#123456]`). Every visual value goes through the CSS
custom properties (`--bone-*`, `--ink-*`, `--red-*`, `--wine-*`) surfaced via
the `@theme inline` block in `src/styles/global.css` and consumed as Tailwind
utility classes (e.g. `bg-bone-100`, `text-ink-900`).

When the branding book replaces the current placeholder token values, only
`src/styles/global.css` changes — component code MUST NOT need to change,
because it never referenced a raw value to begin with.

### V. TypeScript Strict + Biome

All code is TypeScript in **strict mode** — non-negotiable.

- **No `any`** — use `unknown` and narrow it.
- **No `@ts-ignore`** — use `@ts-expect-error` with a comment explaining why,
  only when truly unavoidable.
- **Biome** is the single lint/format tool for this repo (config in
  `biome.json`) — no ESLint, no Prettier.
- `pnpm check` and `pnpm typecheck` MUST pass before any commit — already
  enforced by this repo's Husky `pre-commit`/`pre-push` hooks.

### VI. Absolute Imports via Alias

All intra-project imports MUST use the path aliases already configured in
`tsconfig.json` (`@/components`, `@/islands`, `@/layouts`, `@/i18n`,
`@/types`, `@/utils`) — never a relative import that crosses a directory
boundary. A relative import (`./foo`) is only allowed between two files in
the **same** directory (e.g. `src/i18n/utils.ts` importing `./ui`).

### VII. Testing Discipline

**Vitest** is the only test runner in this repo. This project explicitly does
**not** use Playwright and does not use Storybook — a two-page marketing site
does not justify that infrastructure; adding it speculatively would violate
Article IX.

Any non-trivial logic in `src/i18n/` or `src/utils/` MUST have a unit test.
Component-level testing (Astro Container API, `@testing-library/svelte` for
islands) is deferred until a component's logic is complex enough to warrant
it — not added preemptively.

### VIII. Configuration & Credential Hygiene (NON-NEGOTIABLE)

Environment variables MUST be accessed exclusively through
`import.meta.env` — `process.env` MUST NOT appear directly in application
code (`src/`).

`.env.example` MUST be committed with all required variable names and
blank/placeholder values. Real values live only in gitignored `.env*` files.

**Credential hygiene**: real credential values — analytics keys, deploy
tokens, CDN invalidation credentials, or any value whose leak would grant
access to a real environment — MUST NEVER be written to source control. This
includes application code, `specs/` artifacts, commit messages, and AI
assistant conversations. Use fake-but-shaped placeholder values instead.

If a real credential is accidentally committed or pasted into an AI
assistant conversation, treat it as **compromised** and rotate it at the
source — do not just remove it from the diff.

### IX. Clean Code Discipline

Code MUST express intent, not implementation details.

- **Naming**: No generic names (`data`, `info`, `temp`, `result`).
- **Single Responsibility**: Each function does one thing; its name
  describes exactly what it does.
- **Small functions**: ~20 lines maximum. Extract logic into well-named
  helpers.
- **DRY**: The same logic appearing in 2+ places MUST be extracted into a
  single source of truth.
- **No dead code**: Delete unused functions, imports, variables, components,
  and commented-out code. Git history preserves deletions.
- **No magic numbers**: Extract literals into named constants.
- **No over-engineering**: Build only what is requested. No speculative
  abstractions, no premature generalization, no infrastructure (test
  runners, frameworks, layers) added ahead of an actual need.

## Compliance Review

Every change MUST verify compliance with the applicable principles before
merge. A violation MUST be justified in the `plan.md` Complexity Tracking
table. No exception is valid without an explicit record.

## Governance

This Constitution supersedes all other practices, conventions, and
preferences within `muush.dev`. It replaces the generic
`docs/harness/architecture.md`/`conventions.md` convention from the base
Harness Engineering playbook for this repo — `muush.dev` never had those
files; spec-kit was installed as part of the harness setup from day one.

Amendments require:

1. Description of the change and motivation.
2. Version bump per semantic versioning (MAJOR/MINOR/PATCH — see below).
3. Sync propagation check against all templates in `.specify/templates/`.
4. Ratified via explicit written approval before merging.

**Versioning**:
- MAJOR: Backward-incompatible governance change or principle removal.
- MINOR: New principle added or materially expanded.
- PATCH: Clarification, wording, typo fix.

**Version**: 1.0.0 | **Ratified**: 2026-08-26 | **Last Amended**: 2026-08-26
