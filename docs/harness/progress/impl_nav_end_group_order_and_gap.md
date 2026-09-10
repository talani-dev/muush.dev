# impl_nav_end_group_order_and_gap

Feature 28, branch `fix/nav-end-group-order-and-gap`, `sdd: false`.

## Changes

`app/features/shell/ui/SiteNav.vue`:
- Moved `<div class="site-nav__cta">` before `<LanguageToggle>` inside
  `.nav-row__end`, back to the pre-feature-25 order. Replaced feature 25's
  `.pen`-verified-order comment with a new one documenting this as a human
  divergence (2026-09-09) that supersedes, not corrects, that verification.
- Changed `.nav-row__end`'s gap utility from `gap-nav-gap` to
  `gap-nav-end-gap`. `.nav-row` and `.nav-row__links` are untouched.

`app/assets/css/global.css`:
- Added `--spacing-nav-end-gap: clamp(0.5rem, 0.2679rem + 0.9524vw, 1.125rem)`
  next to `--spacing-nav-gap`, with a comment explaining the dedicated token
  and that the reduction ("un poquito") has no `.pen` value backing it —
  same-shape fluid clamp as `--spacing-nav-gap` (390px→1440px), scaled to
  ~60%: 30px→18px desktop, 14px→8px mobile.

No primitives touched. All values in rem.

## CDP verification (1440×900, `/es`, served from `.output/public`)

- Order: CTA rect `left 1027 / right 1257`, language toggle rect
  `left 1275 / right 1319` — CTA is left, language toggle is the rightmost
  of the two.
- `.nav-row__end` computed `column-gap`: **18px** (was 30px) — changed.
- `.nav-row` computed `column-gap` (three-column grid): **30px** — unchanged.
- `.nav-row__links` computed `column-gap` (Servicios/Nosotros): **30px** —
  unchanged.

## Checks

`./init.sh` exits 0 (typecheck, biome check, vitest — 728 tests passed,
`pnpm generate`, `pnpm storybook:build`, all green).

## Process note

While updating `feature_list.json`'s status, an initial attempt used a
Python full-file rewrite, which reformatted unrelated array literals
(cosmetic only, values unchanged) and I reverted it with `git checkout --`.
That reset the file to the last commit, which discarded the *uncommitted*
addition of feature 28 (this file had never been committed on this branch).
I reconstructed the feature 28 entry from the JSON I had already read
earlier in this session (verified byte-for-byte before re-inserting) and
applied it as a single minimal `Edit` insertion — the rest of the file is
untouched (`git diff --stat` shows only the 16 inserted lines for the new
entry). No other data was at risk: `git fsck`/`git stash list` confirmed
nothing else was lost. Flagging this so the leader is aware a working-tree
edit was briefly destroyed and manually recovered, in case it wants a second
pair of eyes on the reconstructed entry.

Status left at `reviewing` in `feature_list.json`.
