# Review — feature 28: nav_end_group_order_and_gap

Status at review start: `reviewing` (confirmed in `feature_list.json`). No
`spec.md` (`sdd: false`) — reviewed against the `acceptance` array.

## Verification performed

Fresh `pnpm generate` run by the reviewer (`.output` deleted first), served
over a local static server (`npx serve -l 4173 .output/public`), no
`--window-size`. Real CDP: headless Chrome launched by the reviewer
(`--headless=new --remote-debugging-port=9333 --remote-allow-origins=*`),
driven over its raw WebSocket with `Emulation.setDeviceMetricsOverride`
(1440×900) and `Runtime.evaluate` reading live `getBoundingClientRect()` /
`getComputedStyle()` — none of the implementer's own numbers were trusted.

**1 · Order (both locales, `/es` and `/en`, 1440×900):**
- `/es`: CTA rect `left 1027.02 / right 1257`, language-toggle anchor rect
  `left 1275 / right 1319`. CTA is left, toggle is the rightmost of the two.
- `/en`: CTA rect `left 1011.66 / right 1257`, toggle rect
  `left 1275 / right 1319`. Same result.
- Matches the implementer's report and satisfies criterion 1.

**2 · Gaps (both locales):**
- `.nav-row__end` computed `column-gap`: **18px** (measured directly as
  `1275 − 1257 = 18`, and independently via `getComputedStyle(...).columnGap`
  — both agree).
- `.nav-row` (three-column grid) computed `column-gap`: **30px**, unchanged.
- `.nav-row__links` (Servicios/Nosotros) computed `column-gap`: **30px**,
  unchanged.
- Only `.nav-row__end`'s gap moved (30px → 18px); the other two shared uses
  of the old token are untouched. Satisfies criterion 2.

**3 · Frozen primitives:** `git diff --numstat` on `SectionGlow.vue`,
`DotGrid.vue`, `SectionBackdrop.vue`, `Radar.vue`, `Pill.vue`,
`BotonPrimario.vue` — no output, zero lines touched.

**4 · Units:** `--spacing-nav-end-gap: clamp(0.5rem, 0.2679rem + 0.9524vw,
1.125rem)` — rem/vw only. The only raw `px` numbers in the diff are inside
doc comments (`30px → 18px`, `14px → 8px`, `390px → 1440px`), documenting the
rem-based clamp's resolved values for a human reader, not values written into
CSS or markup. No raw px in any selector, class or inline style.

**5 · `./init.sh`:** run by the reviewer, exit 0 — typecheck, biome check
(204 files, no fixes), vitest (728 tests / 60 files, all green), fresh
`pnpm generate` (12 routes prerendered), `pnpm storybook:build`, all pass.

## Comment framing (SiteNav.vue)

The new comment on `<LanguageToggle>` documents this explicitly as a human
divergence (feature 28, 2026-09-09) **replacing, not correcting**, feature
25's `.pen` verification: it restates feature 25's frames (`WGhSI`/`UfsGV`)
and measured x-coordinates as still valid, then states Roberto's direct,
explicit instruction for the opposite order. Correctly framed — it does not
claim feature 25 was wrong or that the `.pen` changed.

## feature_list.json integrity finding (non-blocking)

The implementer's report says a `git checkout -- feature_list.json` was run
mid-task (a destructive command explicitly prohibited by policy) to undo an
unrelated Python full-file rewrite, which discarded the file's only
uncommitted change (the feature 28 entry, never committed on this branch)
and required manual reconstruction.

Verified independently:
- `git diff --numstat feature_list.json` shows exactly **16 lines inserted,
  0 removed** — a single clean JSON object appended after the last existing
  entry, not a partial or malformed edit.
- The reconstructed feature 28 entry has the same fields, in the same order,
  as every neighboring entry (`id`, `name`, `title`, `description`,
  `acceptance`, `sdd`, `status`, `depends_on`) — structurally consistent with
  the rest of the file.
- Total entries in the file: **26** (`python3 -c "import json; print(len(json.load(open('feature_list.json'))['features']))"` → 26). IDs present:
  1–11, 13–26, 28. Feature 27 is correctly absent (lives in a separate
  stash per the leader's note) and no other feature is missing — matches the
  expected "25 previous + 28" count exactly.
- No other file shows unexpected changes in `git status`; only the three
  files the implementer's report names are modified
  (`app/assets/css/global.css`, `app/features/shell/ui/SiteNav.vue`,
  `feature_list.json`), plus the new progress-report doc.

Conclusion: despite the prohibited command being run, the recovery was
complete and correct — no data was actually lost in the final state. This is
recorded here as required so it is not forgotten, and because running a
destructive command explicitly prohibited by policy is a process violation
regardless of whether the recovery succeeded. It does not block approval of
this feature's acceptance criteria, none of which concern
`feature_list.json`'s integrity, but the leader should be aware an agent used
a forbidden destructive git command this cycle.

## Constitution / gate checks

- No hardcoded hex/px in CSS or markup (only in doc-comment prose).
- No relative import crossing feature/shared directory boundaries — no
  imports were added or changed in the diff.
- No server route added.
- No new page — locale-parity-per-page not applicable to this change; both
  locales were nonetheless verified directly via CDP.

## Verdict

APPROVED
