# Review — feature 27: nav_hide_clipping_bug_and_root_redirect_flash

Status confirmed `reviewing` in `feature_list.json` before this review started.

sdd: false — no `spec.md`/`tasks.md`; reviewed against the `acceptance` array of
the feature 27 entry directly, plus `docs/harness/CHECKPOINTS.md`.

## Verification method

Independent, not trusting the implementer's report: `pnpm generate` fresh +
`python3 -m http.server` serving `.output/public`, headless Chrome
(`Google Chrome.app --headless=new --remote-allow-origins=* --user-data-dir=<scratchpad>`,
isolated profile) driven over raw CDP WebSocket (`websocket-client`),
`Emulation.setDeviceMetricsOverride` for both viewports, real
`window.scrollTo` stepped across `requestAnimationFrame` pairs to simulate
incremental scroll dispatch (never `--window-size`).

## 1 · Nav clipping fix

Measured myself, matches the implementer's report exactly:

| viewport | at-rest `top`/`bottom` | hidden `transform` | hidden `rect.bottom` |
|---|---|---|---|
| 1440 (`lg`) | `top:24, bottom:96` | `matrix(1,0,0,1,0,-96)` | **`0`** ✓ |
| 390 (mobile) | `top:0, bottom:78` | `matrix(1,0,0,1,0,-78)` | **`0`** ✓ |

`-96 = -(72 + 24)` at `lg` — the box's own height plus `--spacing-nav-pill-y`
(confirmed `1.5rem` = 24px in `global.css:1096`), exactly the fix described.
Mobile's `-78` equals its own height alone, unmodified, confirmed unaffected.

Feature 26 behaviour re-verified live, independently, all correct:
- ≤80px from top: always visible (checked at 79px, not hidden).
- Past the zone, +5px (< 10px threshold): stays visible.
- Continued to +12px more (cumulative ≥10px continuous downward): hides.
- Any upward movement (tested at depth, 1px up from both 500→499 and
  600→599): reveals immediately, no threshold.
- Mobile-menu open while scroll-hidden: forces nav visible
  (`aria-expanded="true"`, hidden class removed).
- `prefers-reduced-motion: reduce`: `getComputedStyle(nav).transitionProperty`
  → `"none"`.

Root cause and fix documented in `SiteNav.vue`'s doc comment with the actual
measured numbers (24px), framed as an investigation with ruled-out
candidates, not just a patch.

## 2 · Root `index.html` fix

Verified live via CDP (`Fetch.enable` + abort the meta-refresh's follow-up
request to `/es` to freeze the root document for measurement):

- `getComputedStyle(body).backgroundColor` → `rgb(38, 38, 38)` = `#262626` ✓
- `getComputedStyle(a).color` → `rgb(38, 38, 38)` — matches background ✓
- anchor `textContent` unchanged (`"muush.dev"`), `href="/es"` ✓
- `document.contains(a)` → `true`; `display: inline`, `visibility: visible`,
  no `aria-hidden` ✓
- `a.focus()` → `document.activeElement === a` → `true`, `tabIndex: 0` ✓
- File comment documents the decision citing Roberto (2026-09-09), frames it
  as a deliberate trade-off he accepted, not an implementation error ✓
- No `<link>`/`<script>` to any app bundle — file stays dependency-free,
  only the added inline `<style>` ✓
- `tests/static-output.test.ts` only asserts `<a href="/es">` as a substring
  (no styling assertion) — correctly unaffected, still passes.

## Standard checks

- `./init.sh` — exit 0 (typecheck, biome check, 728/728 tests across 60
  files, `pnpm generate`, `pnpm storybook:build` all green), run by me
  independently.
- `git diff --numstat` on frozen primitives (`SectionGlow.vue`, `DotGrid.vue`,
  `SectionBackdrop.vue`, `Radar.vue`, `Pill.vue`, `BotonPrimario.vue`) — zero
  lines changed on all six.
- Touched app code (`SiteNav.vue`) uses `var(--spacing-nav-pill-y)` in the
  fix, no raw px literal introduced; the only raw px in the diff are
  pre-existing doc-comment prose. `public/index.html` hex literals are the
  file's already-established, explicitly excepted exception.
- No server route added, no relative import crossing a directory boundary,
  no new page (so no i18n-parity concern for this feature).

## Verdict

APPROVED — every acceptance item verified independently via live CDP
measurement, matching the implementer's reported numbers exactly; feature 26
behaviour intact; frozen primitives untouched; `./init.sh` green.
