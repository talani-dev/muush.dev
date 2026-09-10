# Implementation — feature 27: nav_hide_clipping_bug_and_root_redirect_flash

Branch: `fix/nav-hide-clipping-and-root-redirect-flash` · sdd: false · status
left at `reviewing`.

## 1 · Nav clipped mid-hide — root cause and fix

**Reproduced live, not inferred from CSS**: `pnpm generate` + `python3 -m
http.server` serving `.output/public`, headless Chrome (`Google Chrome.app`
`--headless=new`) driven over raw CDP WebSocket (no Puppeteer/Playwright
added — `websocket-client`, already on the machine, isolated `--user-data-dir`
in the session scratchpad so the real Chrome profile was never touched).
`Emulation.setDeviceMetricsOverride` for both viewports, `window.scrollTo`
stepped across several `requestAnimationFrame`s to simulate real incremental
scroll dispatch, `getBoundingClientRect()`/`getComputedStyle().transform`
read on the settled hidden state.

**Cause confirmed by measurement**, at 1440 (`lg`), before the fix:

| | value |
|---|---|
| `<nav>` at rest, `top` | `24px` (`--spacing-nav-pill-y`, the floating-pill inset added by feature 21) |
| `<nav>` height | `72px` |
| `transform` when `.site-nav--hidden` | `matrix(1,0,0,1,0,-72)` |
| `getBoundingClientRect().bottom` in the "hidden" state | **`24`**, not `0` |

`translateY(-100%)` moves the box by its own border-box height only (72px).
That's correct at `top: 0` (mobile — measured `rectBottom: 0`, no bug there),
but at `lg` the sticky offset itself is 24px, so the "stuck" position already
sits 24px inside the viewport before the transform runs; moving up by only
72px leaves exactly those 24px of pill poking back into view at the top edge
— which is the "cut in half" Roberto saw.

Ruled out the other three candidates by measurement, not assumption:
`position: sticky` + `transform` composed exactly per spec (no fighting
recalculation); `isNavVisible` never flickered mid-scroll in any captured
frame; no `overflow-clip` ancestor was involved (`default.vue`'s `overflow-
clip` only bounds document scroll range, irrelevant to an already-off-canvas
compositor transform). It was candidate 4, but not "wrong element" — `.site-
nav--hidden` is on the right element (`<nav>` *is* the visible box;
`MobileMenu`'s panel is `position: fixed` and contributes nothing to
`<nav>`'s height) — the amount was wrong, missing the sticky inset.

**Fix** in `app/features/shell/ui/SiteNav.vue`'s `<style scoped>`: added an
`lg`-only override,
`transform: translateY(calc(-100% - var(--spacing-nav-pill-y)))`, so the
transform folds in the same inset the `lg:top-nav-pill-y` sticky offset
already applies. Mobile (`top: 0`) is untouched — `translateY(-100%)` alone
stays correct there. Documented in the component's doc comment with the
measured numbers, so a future reader doesn't have to re-derive it.

**Re-measured after the fix**, same CDP script:

| viewport | `rectBottom` (hidden, settled) | before | after |
|---|---|---|---|
| 1440 (`lg`) | `24` | ❌ | **`0`** ✓ |
| 390 (mobile) | `0` | ✓ (unaffected) | `0` ✓ |

**Feature 26 behaviour re-verified intact**, same live CDP harness, desktop:

| scenario | result |
|---|---|
| scrollY ≤ 80 (reveal zone) | visible ✓ |
| +5px past zone (< 10px threshold) | visible ✓ |
| +12px continuous past zone (≥ 10px threshold) | hidden ✓ |
| 1px upward movement | visible immediately, no threshold ✓ |
| mobile menu opened while hidden | forced visible ✓ |
| `prefers-reduced-motion: reduce`, scrolled past threshold | hidden, no transition ✓ |

No primitive was touched. No new dependency, no px literal outside the
existing `--spacing-nav-pill-y` token (reused, not duplicated).

## 2 · Root `index.html` — white-flash and link contrast

`public/index.html` (copied verbatim to `.output/public/index.html`, not
built by Nuxt/Vite): added an inline `<style>` in `<head>` — no bundle, no
external stylesheet, kept dependency-free per the file's own stated
constraint.

- `body { background-color: #262626; margin: 0; }` — `--ink-500`, the same
  base the rest of the site paints, written as a literal hex here since this
  file has no access to the app's CSS custom properties.
- `a { color: #262626; text-decoration: none; }` — same colour as the
  background, so `<a href="/es">muush.dev</a>` carries no visual contrast.
  The link is **not** touched structurally: no `display:none`, no
  `visibility:hidden`, not removed from the DOM. Still a real anchor, in tab
  order, reachable by assistive technology and by keyboard focus (default
  browser focus ring untouched).
- Documented in the file's own comment, in its existing style, citing
  Roberto's 2026-09-09 decision and the trade-off it accepts: this makes the
  link invisible not only during the refresh flash but also in the corner
  case it exists for (refresh + JS both disabled) — accepted because that
  fallback's real audience is keyboard/assistive-technology users, not a
  sighted mouse-only visitor with both disabled.

**Verified live via CDP** (headless Chrome, `Fetch.enable` intercepting the
first `Document` request to let the root page render, then aborting the
meta-refresh's follow-up request to `/es` so the root document stays put
long enough to measure):

| check | result |
|---|---|
| `getComputedStyle(body).backgroundColor` | `rgb(38, 38, 38)` (`#262626`) ✓ |
| `getComputedStyle(a).color` | `rgb(38, 38, 38)` — matches background ✓ |
| link text content | `"muush.dev"` (unchanged, still present) ✓ |
| `document.contains(a)` | `true` ✓ |
| `a.focus()` then `document.activeElement === a` | `true` ✓, `tabIndex: 0`, no `aria-hidden` |

`tests/static-output.test.ts` only asserts `<a href="/es">` as a substring
(no styling assertions) — still passes unmodified; re-ran it explicitly
(106/106) plus the full suite.

## Files touched

- `app/features/shell/ui/SiteNav.vue` — `lg`-only hidden-transform override + doc comment
- `public/index.html` — inline `<style>`, updated file comment
- `feature_list.json` — status `in_progress` → `reviewing`

## Verification

`./init.sh` — exit 0 (typecheck, biome check, 728 tests across 60 files,
`pnpm generate`, `pnpm storybook:build` all green).

No commit made — process change from this same feature: the leader pauses
before any `git commit`/`merge`/`push` and waits for explicit instruction.
