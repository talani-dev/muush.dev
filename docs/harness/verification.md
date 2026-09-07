# Verification

## What "verified" means in this repo

A change is verified when `./init.sh` exits 0, which means:

1. `pnpm typecheck` (`nuxt typecheck`) — no type errors.
2. `pnpm check` (Biome, `--error-on-warnings`) — no lint/format issues.
3. `pnpm test` (Vitest) — all tests green.
4. `pnpm generate` — the static site actually builds to `.output/public`.
5. `pnpm storybook:build` — every story still compiles.

No task is "done" without all five passing. There is no partial-credit
"tests pass but the build is broken" state.

> `nuxt typecheck` needs `.nuxt/` to exist. `init.sh` runs `nuxt prepare`
> automatically if it is missing — a fresh clone would otherwise fail on
> step 1 for a reason that has nothing to do with the change under review.

## What is NOT part of verification

- **Playwright / E2E** — not installed, and deliberately out of scope
  (Constitution Article X: no authenticated flows, no server state to test
  against). Do not add it without a constitution amendment.
- **Manual QA in a browser** — valuable, but `init.sh` cannot check it. If a
  feature needs visual confirmation, say so explicitly in the review summary
  instead of silently skipping it. Storybook is the cheaper substitute for
  component-level visual review.

## Constitution-specific checks (no automated linter for these yet)

The `reviewer` agent MUST manually verify per feature:

- **Article II/III** — no import crosses a feature boundary except through
  its `index.ts` barrel, and no `data/` file imports from `logic/` or `ui/`.
- **Article IV** — no `server/api/` route, no runtime server dependency,
  `nitro.preset` still `'static'`.
- **Article VI** — every new route resolves in both locales, and every new
  key exists in both `i18n/locales/*.json`. The locale switcher resolves
  routes through the i18n route map, never by swapping the URL prefix.
- **Article VII** — no hardcoded color/spacing literal in touched
  components; no breakpoint used to change a font size that a fluid token
  should cover.
- **Article X** — every component added to `app/shared/ui/` has a story.
- **Article XII** — no relative import crosses a directory boundary, and any
  new alias is mirrored in `.storybook/main.ts`.
