# Review — Feature 25: purpose_copy_nav_order_and_submit_width

Status confirmed `reviewing` in `feature_list.json` before this review.

## Verdict: APPROVED

## Verification performed

- `./init.sh` → exit 0 (typecheck, biome check, 713/713 tests, `pnpm generate`,
  `pnpm storybook:build` all green).
- `git diff --numstat` on the six frozen primitives (`SectionGlow.vue`,
  `DotGrid.vue`, `SectionBackdrop.vue`, `Radar.vue`, `Pill.vue`,
  `BotonPrimario.vue`) → zero lines on all six.
- No raw px in changed code (only inside comments); new tokens
  (`--spacing-nav-pill-x: 2.5rem`, `--spacing-btn-submit-w: 13.5rem`) are rem.
- No `server/api/` route added; `nitro.preset` still `'static'`.
- `i18n-parity.test.ts` present and passing; only copy values changed, keys
  intact in both locales.

## 1 · Copy real de Propósito

Read `i18n/locales/{es,en}.json` — all six `landing.purpose.{why,how,what}.copy`
values match the verbatim text given, in both locales.

Regenerated `.output/public` (`pnpm generate`) and grepped the actual prerendered
HTML for both locales: each of the six strings appears exactly **2** times per
locale (`es/index.html`, `en/index.html`) — confirming the real copy renders in
both `PurposeConstellation` (desktop) and `PurposeCarousel` (mobile), not just
one. `tests/static-output.test.ts` independently asserts
`occurrences(section, copy[block]) === 2` for the same reason (guards against
regression). `tests/landing-copy.test.ts` updated soundly — the removed
"What == hero subhead" assertion was a coincidence of the old placeholder, not
a documented rule in `content.md`/`ui-map.md`, and the new copy is legitimately
a distinct sentence.

## 2 · Nav — orden y padding

Served `.output/public` (`npx serve`) and drove real Chrome headless via CDP
(`Emulation.setDeviceMetricsOverride`, no `--window-size`), measured
`getBoundingClientRect()` at 1440×900, both locales:

- **2a (order):** ES — language toggle `left=1015.02` < CTA `left=1089.02`.
  EN — language toggle `left=999.66` < CTA `left=1073.66`. Toggle precedes CTA
  left-to-right in both locales, matching implementer's report and the `.pen`
  reference (`WGhSI`/`UfsGV`). No `order`/`row-reverse` in `SiteNav.vue`, so
  DOM order and visual order agree — verified directly rather than assumed.
- **2b (padding):** pill `left=80, right=1360, width=1280` (unchanged, both
  locales) — margin to viewport and pill width untouched. Lockup left edge at
  `121px` from the real viewport edge in both locales (`80` inset + `1` border
  + `40` padding = `121`), and the end-group's right edge at `1319px`, i.e.
  `121px` from the right viewport edge (`1440 − 1319`) — symmetric, and
  matching the pill's own border-box math (`41px` = 1px border + 40px padding
  on each side). Confirms the padding is 2.5rem/40px per side, not 80px, and
  that nothing else about the pill (width, outer margin) moved.

## 3 · Botón "Enviar" — ancho fijo desktop / 100% mobile

Measured via CDP, both forms (`ContactForm.vue` on `/es` `/en`,
`ApplicationForm.vue` on `/es/nosotros` `/en/about`), both widths (1440, 390):

| | Desktop 1440 | Mobile 390 |
|---|---|---|
| Button width | 216px (all 4 instances) | 292px = 100% of the 292px form (all 4 instances) |
| Left/right margin to form | 187 / 187 (centred) | 0 / 0 (stretched) |

Matches the corrected round-2 understanding: desktop fixed `216px`
(`--spacing-btn-submit-w: 13.5rem`) with `lg:w-btn-submit-w lg:self-center`,
mobile untouched (`fill_container`/stretch preserved). Confirmed `self-center`
and `w-btn-submit-w` never appear unscoped on the button (`btnClass` in every
measurement carries only `lg:w-btn-submit-w lg:self-center`) — the round-1
regression (unscoped `self-center` breaking mobile) is not present in this
code. `BotonPrimario.vue` has zero diff; the fix lives only in the two form
components, as required.

## Notes

- Acceptance criteria in `feature_list.json` for point 3 predates the
  leader's round-2 correction (it reads as if desktop should be
  `fit_content`/centred without mentioning mobile's `fill_container`); the
  leader's own message in this review request explicitly supersedes that
  wording with the verified 4-instance `.pen` reading (`width: 216` fixed
  desktop, `width: fill_container` mobile). Verified directly against the
  live build rather than trusting either text, and both the fixed desktop
  width and the stretched mobile width are confirmed correct.
