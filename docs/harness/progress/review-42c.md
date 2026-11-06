# Review 42c · feature 42 `m1_visual_foundation` · Shared/UI quarantine follow-up

- **Date:** 2026-11-01 · branch `feat/v2-visual-foundation` · nothing committed
- **Precondition:** feature 42 is `reviewing` in `feature_list.json` (CONFIRMED)
- **Scope:** only what changed since `review-42b.md` (APPROVED). Implementation report: `impl_42_naming.md` § "Follow-up · Shared/UI quarantine (2026-11-01)".

## Verdict

**APPROVED**

There are no blocking or should-fix findings. Three advisories follow.

## Findings

### Advisory

1. **Acceptance item 8 of feature 42 still says the spotlight "sigue funcionando".** This is true for 42, because the layout still mounts it (`app/layouts/default.vue:9-11`). It is consistent with the decision that feature 43 removes it. When 43 retires the spotlight, the spec and tests for 43 need to state that item 8 is superseded. Otherwise a later reviewer may read the removal as a regression.
2. **`app/shared/ui/tokens.stories.ts` (`Foundations/Tokens`, line 18) is a story file in a component folder.** The brief allows it, and it is v2. It could move to a foundations location later. This is optional.
3. **Live v1 shell code now imports from `legacy/`.** The imports are `SiteNav.vue:10-11`, `SiteFooter.vue:3`, `MobileMenu.vue:9-10`, `shell/data/types.ts:1` and `layouts/default.vue:9-11`. This is expected until feature 43 builds the v2 Lockup, Wordmark and social icons. Feature 47's grep criterion will catch any import that remains.

## What I verified

### 1. The moves are pure renames (CONFIRMED)

- **Staged entries:** `git diff --cached -M --stat` shows every staged entry as a rename with 0 insertions and 0 deletions. This covers 42 files, including the 25 renames that existed before.
- **Byte comparison:** for each of the 17 moved files, I diffed `git show HEAD:<old>` against the working-tree `<new>`. The 17 files are CursorSpotlight, DotGrid, Lockup, Wordmark and SocialIcon (`.vue`, `.test.ts` and `.stories.ts` for each) plus `useCursorSpotlight.{ts,test.ts}`.
  - All five `.vue` files and `useCursorSpotlight.ts` are byte-identical.
  - The only differences in the tests and stories are:
    - `@/shared/...` import paths, plus the `legacy/` path in the `readFileSync` calls (`CursorSpotlight.test.ts:21`, `DotGrid.test.ts:22`);
    - story titles `Shared/UI/X` → `Legacy v1/Shared/UI/X`;
    - Biome re-wrapping the two long `SocialIcon` import lines.
- **Importers:** `git diff -M` on `default.vue`, `SiteNav.{vue,test.ts}`, `SiteFooter.{vue,test.ts}`, `MobileMenu.vue`, `shell/data/types.ts`, `NotFoundContent.stories.ts` and `legacy/SectionBackdrop.stories.ts` adds only path changes on top of what review-42b already approved. The `bg-negro-950` root and its comments, and the `Legacy v1/Shell/NotFoundContent` title, were covered there (review-42b:62-88, :154).
- **Stale paths:** `grep` finds no remaining `shared/ui/{CursorSpotlight,DotGrid,Lockup,Wordmark,SocialIcon}` or `shared/logic/useCursorSpotlight` path in `app/`, `tests/`, `.storybook/`, `nuxt.config.ts` or `vitest.config.ts`.

### 2. The live pages are unchanged (CONFIRMED by construction; spot-checked in the build)

- **Why:** the components are byte-identical, and only their import specifiers moved.
- **Generated `.output/public/{es,en}/index.html`:**
  - The `cursor-spotlight` and `dot-grid` markup is present.
  - The isotipo SVG renders in both the nav and the footer.
  - The Instagram, LinkedIn and WhatsApp links are present.
- **Tests:** the layout, nav, footer, mobile-menu, spotlight, brand-cursor and static-output tests all pass.
- **Not done:** I took no new visual or headless-browser comparison (UNVERIFIED pixel-level).

### 3. Acceptance item 2 is met (CONFIRMED)

- **`app/shared/ui/` outside `legacy/`:** contains only GlassButton, GlassSurface, Heading, Pill, PrimaryButton, RotatingPill and ShaderBackground (`.vue`, `.test.ts` and `.stories.ts` for each), plus `tokens.stories.ts`.
- **`app/shared/logic/legacy/`:** contains only `useCursorSpotlight.{ts,test.ts}`.
- **Built `storybook-static/index.json`:**
  - `Shared/UI/*` = exactly those 7 components;
  - `Foundations/Tokens` is present;
  - CursorSpotlight, DotGrid, Lockup, SocialIcon and Wordmark appear only under `Legacy v1/Shared/UI/`.

### 4. Story titles and `storySort` (CONFIRMED)

- **Titles:** there are 44 `.stories.ts` files with 44 meta titles, and no duplicates. The two repeated `title: 'muush'` hits are footer-column args in `SiteFooter.stories.ts:74,110`, not meta titles. The built index also has 44 unique titles.
- **`storySort`:** `.storybook/preview.ts:47-55` is unchanged since 42b. It orders Foundations, then Shared (UI first), then everything else, then `Legacy v1` (Foundations, Shared, then the rest). That order is sensible.

### 5. Security and scope (CONFIRMED)

The only files modified after review-42b were written (12:29:24) are the following:

- **Moved files and their importers:** listed above.
- **`public/cursor/you.svg`** (12:29:35): the comment-only S1 fix that review-42b requested. The fills are `#E5352F`, and the geometry is unchanged.
- **Leader edits:**
  - `feature_list.json`;
  - `docs/business/muush-1.0.md` § 1 (the spotlight retirement, with "You" kept);
  - `current.md`, `history.md` and `impl_42_closeout.md`.

  These edits are consistent with the brief.

None of the follow-up changes adds a network call, a new URL, a dependency, a hook, a config change or a secret. None of the changed text reads as instructions aimed at agents.

### 6. `./init.sh` (CONFIRMED)

- **Exit code:** 0 on the first run. There was no lock contention, and I killed no processes.
- **Steps:** typecheck OK, check OK, test (113 files, 1699 tests, all passed), generate (16 routes) OK, storybook:build OK.

### Protocol

- **`tasks.md`:** all 65 tasks are `[x]`. The only `[ ]` is the format example at line 7.
- **No Constitution violation was introduced:** no colour or value changes, no relative import across directories (`Lockup.vue`'s `./Wordmark.vue` stays within `legacy/`), no server route, and no new page.
