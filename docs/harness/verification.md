# Verification

## What "verified" means in this repo

A change is verified when `./init.sh` exits 0, which means:

1. `pnpm typecheck` (`astro check`) — no type errors.
2. `pnpm check` (Biome, `--error-on-warnings`) — no lint/format issues.
3. `pnpm test` (Vitest) — all tests green.
4. `pnpm build` (`astro build`) — the static site actually builds.

No task is "done" without all four passing. There is no partial-credit
"tests pass but build is broken" state.

## What is NOT part of verification

- Playwright / E2E — not installed in this repo (Constitution Article VII).
  Do not add it as a verification step without a constitution amendment.
- Storybook — same as above.
- Manual QA in a browser — valuable, but `init.sh` cannot check it. If a
  feature needs visual confirmation, say so explicitly in the review summary
  instead of silently skipping it.

## Constitution-specific checks (no automated linter for these yet)

The `reviewer` agent MUST manually verify per feature:

- No hardcoded color/spacing literal in touched components (Article IV).
- Every new page exists under both `pages/es/` and `pages/en/`, and every
  new `ui.ts` key has both `es` and `en` entries (Article III).
- No relative import crosses a directory boundary — only path aliases or
  same-directory relative imports (Article VI).
- No new server route, API endpoint, or `server/` directory (Article I).
