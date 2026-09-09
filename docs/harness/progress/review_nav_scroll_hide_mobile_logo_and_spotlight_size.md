# Review — feature 26: nav_scroll_hide_mobile_logo_and_spotlight_size

Status at review start: `reviewing` (confirmed in `feature_list.json`). No
`spec.md` (`sdd: false`) — reviewed against the `acceptance` array.

## Verification performed

`./init.sh` run by the reviewer: exit 0 (typecheck, biome check, 728 tests /
60 files, `pnpm generate`, `pnpm storybook:build` all green).

`git diff --numstat` on frozen primitives (`SectionGlow.vue`, `DotGrid.vue`,
`SectionBackdrop.vue`, `Radar.vue`, `Pill.vue`, `BotonPrimario.vue`): no
output — zero lines touched.

CDP verification (real `Emulation.setDeviceMetricsOverride` + a headless
Chrome instance launched by the reviewer, `pnpm generate` output served over
a local HTTP server, no `--window-size` flag, no reliance on the
implementer's own numbers):

**1 · Nav scroll reveal**, 390×844 mobile emulation, `.site-nav` computed
style read directly:
- scrollY 0 and 40 (inside 80px zone): `transform: none`, visible (1a).
- 0→300 in one jump: hidden, `site-nav--hidden` present (1b, gross case).
- scrollY 80 (zone edge): visible.
- 80→85 (+5), 85→88 (+3, total +8): visible, under the 10px threshold (1b).
- 88→92 (+4, total +12): hidden, crosses threshold (1b).
- 92→88 (upward): `site-nav--hidden` class removed immediately — no
  threshold (1c). (`transform` was still mid-transition at the moment
  sampled, which is expected: the class change is what's instant, not the
  0.2s slide it drives.)
- 88→105 (downward again): hidden again, confirms the composable resumes
  normal behaviour after a reveal.
- Mobile menu opened via a real click on the hamburger while the nav was
  hidden by scroll: `site-nav--hidden` removed and stayed removed even after
  scrolling further with the menu open (1d). (Opening the menu also reset
  `scrollY` to 0 — a scroll-lock side effect of `MobileMenu.vue`, unrelated
  to this feature.)
- `Emulation.setEmulatedMedia({ features: [{ name: 'prefers-reduced-motion',
  value: 'reduce' }] })`: `window.matchMedia(...).matches` true,
  `getComputedStyle(nav).transitionProperty === 'none'`, and the hidden
  transform (`matrix(..., -78)`) was already fully applied 0.1s after the
  triggering scroll — instant, no animation (1e).
- `getComputedStyle(nav).position === 'sticky'` at both 390×844 and
  1440×900, before and after the hidden class toggles (1f).

All of 1a–1f confirmed independently, matching the implementer's report.

**2 · Mobile logo**, both locales (`/es/`, `/en/`), both viewports (390 and
1440), against `pnpm generate` output:
- Nav: the wordmark wrapper (`span.hidden` around `Wordmark`) has
  `getComputedStyle(...).display === 'none'` at 390px and `'flex'` at
  1440px, in both locales.
- Footer: `Lockup`'s markup carries no `hidden`-wrapped span at all — the
  wordmark renders unconditionally, confirmed at 390px (mobile) with the
  raw HTML of the footer's lockup link.
- The `.pen` divergence is documented as a human decision (Roberto,
  2026-09-09) in both `Lockup.vue` and `SiteNav.vue`'s doc comments, worded
  as a recorded divergence rather than a design correction — read both
  comments directly, confirmed correct framing.

**3 · Cursor spotlight size**, 1440×900, real mouse dispatched via
`Input.dispatchMouseEvent`:
- `getComputedStyle('.cursor-spotlight__beam').width/height === '330px'`,
  matching `--spotlight-outer-size: 20.625rem` read from the root's
  computed style.
- `--spotlight-core-size` computed value unchanged at `11.25rem`.
- Beam's `transform` correctly tracks the dispatched pointer position
  (`translate(720px, 450px)`), effect opacity 1 — renders and functions.
- `global.css`'s token comment documents this as a first-pass human
  calibration, not a `.pen`-confirmed value; `CursorSpotlight.vue`'s own
  stale-number doc comments (the historical fallback table) were updated to
  flag the old figures as historical rather than left silently wrong.

## Constitution / gate checks

- No hardcoded colours (hex/rgb) introduced in the diff.
- No relative import crossing feature/shared directory boundaries in the
  new or changed files.
- No server route added.
- No new page, so locale-parity-per-page is not applicable; both locales
  were nonetheless verified directly for point 2's HTML output.
- The two new JS pixel constants (`REVEAL_ZONE_PX`, `HIDE_ACCUMULATION_PX`)
  are runtime comparisons against `window.scrollY` (a browser API that is
  always CSS pixels), not CSS/design-token values — same precedent already
  established by `useCursorSpotlight.ts`'s own raw `clientX`/`clientY` and
  `${pageX}px` usage. No raw px appears in any CSS/style in the diff;
  `translateY(-100%)` uses a relative unit.
- Unit tests (`useNavScrollReveal.test.ts`, 10 cases) cover 1a–1f
  individually, including the oscillating-bounce-never-accumulates case
  that 1b's rubber-band requirement specifically calls for, and the
  mobile-menu-forces-visible / resumes-hiding-on-close pair for 1d.

## Verdict

APPROVED
