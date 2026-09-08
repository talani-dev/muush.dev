# Review — feature 23 `visual_polish_round_1`

## Verdict: REJECTED

## Reasons

1. **Item 4 (Services left-hug) — real, verified visual defect at 1440px,
   one of the four named acceptance widths.** Measured live via CDP
   (headless Chrome, static `.output/public`, `getBoundingClientRect`) and
   confirmed by screenshot: at exactly 1440px, node-5's brief copy
   ("Convertimos tecnología compleja...") is clipped mid-word —
   `"complej[a]"` — its text box right edge (x=1458) overflows both the
   `.canvas` box (right edge 1360) and the viewport (1440), silently cut by
   the layout root's `overflow-clip`, same mechanism the implementer's own
   comment names for the 1024-1400 range. At 1536/1600/1920 the same node
   renders with zero clipping (confirmed by screenshot) — the defect is
   specific to 1440, not the wider widths. The implementer's "measured via
   CDP" claim for item 4 only checked `.canvas` box-level margin symmetry,
   never individual node bounding boxes against the viewport, so it missed
   this. The acceptance criterion names 1440 explicitly; it is not met.
   This is pre-existing content-overflow (independent of the box-width fix,
   present before and after it), but the acceptance criterion is about the
   rendered result at that width, not just the hypothesis under test.

## Confirmed correct (independently verified, not just re-read)

- Item 1: CTA arrow renders after label, `ml-nav-cta-arrow-gap` (9px).
  Mutation-tested: reverting the order fails `SiteNav.test.ts`.
- Item 2: nav links row centred on the full nav (not the logo↔CTA gap).
  CDP-measured at 1024/1440/1536, es+en: Δ ≤ 0.008px. `useNavCtaReveal.ts`
  untouched (byte-identical); `.site-nav__cta` class bindings unchanged.
- Items 3/8: single `--spacing-section-gap` token (clamp 32→80px), applied
  via `mt-section-gap` consistently on every section boundary in
  `index.vue`, `nosotros.vue`, and before `<SiteFooter>` in `default.vue`.
- Item 5: Delivery Pill CDP-measured at 118.125px (fit-content), same row
  as copy (`sameRow: true`).
- Items 6/7: exact copy strings confirmed byte-for-byte in `es.json`/
  `en.json` for body, altQuestion, ctaSecondary (both locales). Hairline
  reuses `border-hairline-footer`/`pt-footer-bar-gap` (footer's own token,
  no new colour). Zero remaining references to the old placeholder anywhere
  in the repo (grep clean).
- Item 9: `Proyectos`/`FAQ`/`Blog` fully removed from `footerColumns.ts`
  (not `kind:'none'`) and from the locale files. Mutation-tested: restoring
  `Proyectos` fails `footerColumns.test.ts`.
- Frozen files: zero diff on `SectionGlow.vue`, `DotGrid.vue`,
  `SectionBackdrop.vue`, `Radar.vue`, `Pill.vue`, `BotonPrimario.vue`
  (confirmed via `git diff --stat`).
- No hardcoded color/px literals introduced, no relative imports crossing
  feature boundaries, no `server/` route added.
- Test count: 706→705 fully accounted for (net -1: 4 removed + 1 added in
  `footerColumns.test.ts`, -1 in `shell-copy.test.ts`, +2 in
  `ContactSection.test.ts`, net 0 in `static-output.test.ts` — all
  legitimate consolidation of the "kind:'none'" state that no longer
  exists, not a coverage regression).
- Gates: `./init.sh` exit 0, `pnpm test` 705/705 green, `pnpm generate`
  succeeds.

## Action needed before re-review

Fix (or explicitly re-scope with Roberto) node-5's text overflow at 1440px
in `ServicesConstellation.vue` — the brief copy needs to fit within the
1280px canvas at the design's own reference width, not just have the
canvas box itself stop hugging the left edge.

---

# Re-review — round 3 (item 4 delta only)

## Verdict: APPROVED

## Scope

Per the leader's instructions, this pass re-audits ONLY item 4 (Services
left-hug / node-5 clipping at 1440px, the reason for round 1's rejection).
Items 1/2/3/5/6/7/8/9 are not re-measured beyond a diff-stat sanity check —
they were independently verified and approved in round 1.

## Verification performed (fresh `pnpm generate`, static output served on
`localhost:4173`, measured via real CDP `Emulation.setDeviceMetricsOverride`
+ `getBoundingClientRect`, not `--window-size` and not screenshots alone)

- **1440px** (the exact width that failed round 1):
  `innerWidth` confirmed 1440. `.canvas` rect: `x=0, right=1440` — full-bleed,
  aligned to `<main>`'s own border box, not its padded content box. `<main>`
  rect: `x=0, width=1440` (border box) — confirms the full-bleed actually
  broke out of `--spacing-page`, exactly as the round-3 implementation notes
  claim. Node-5's `.text` rect: `left=1146, right=1378, width=232` — full
  brief text present in `textContent`
  ("Convertimos tecnología compleja en algo que se usa sin manual. Producto y
  experiencia, de investigación a prototipo.") with **no mid-word cut**,
  right edge sits 62px inside the real viewport edge (1440-1378=62), matching
  the leader's independently confirmed `.pen` measurement exactly.
  `document.documentElement.scrollWidth === 1440` — no horizontal overflow.
  Screenshot at 1440 (scrolled to the Services section) visually confirms:
  full sentence rendered, no clipping, clear right margin before the
  viewport edge.
- **1536/1600/1920** (previously-clean widths, checked for regression):
  `.canvas` rects — `48→1488`, `80→1520`, `240→1680` respectively — exact
  match to the implementer's claimed table. Node-5 text right edges (1426,
  1458, 1618) sit well inside each canvas's right edge; no clipping,
  `scrollWidth === innerWidth` at all three (no overflow introduced).
- **Mobile (390px)**: `.canvas`'s computed `display` is `none` (the `hidden
  lg:block` gate, untouched). `ServicesTimeline` (the `lg:hidden` sibling)
  renders normally with full node content, no overflow
  (`scrollWidth === innerWidth === 390`).
- **Whole-page side effects**: at 1440/1536/1600/1920/1024/390, `nav` and
  `footer` bounding rects span the full viewport width at every breakpoint
  with `hasHorizontalOverflow: false` throughout — the full-bleed on
  `.canvas` does not leak past the root `overflow-clip` or move any other
  section.

## Frozen primitives

`git diff --numstat` against `SectionGlow.vue`, `DotGrid.vue`,
`SectionBackdrop.vue`, `Radar.vue`, `Pill.vue`, `BotonPrimario.vue`: empty
output — zero lines changed, confirmed again this round.

## Other eight items (sanity check only, not re-measured)

`git diff --stat` against `SiteNav.vue`, `index.vue`, `nosotros.vue`,
`default.vue`, `footerColumns.ts`, `contactContent.ts`, `ContactSection.vue`,
both locale files — all show the same shape of changes already reviewed and
approved in round 1 (nav restructure, section-gap token, footer column
removal, contact copy/divider). No new unexpected touches to these files
from the round-3 delta.

## Gates

`./init.sh` exits 0: typecheck OK, `pnpm check` (biome) OK, `pnpm test`
705/705 passed, `pnpm generate` succeeds (12 routes prerendered),
`pnpm storybook:build` succeeds.

## Conclusion

Item 4's round-3 fix (`--services-canvas-w: 90rem` full-bleed via
`margin-inline: calc(-1 * var(--spacing-page))`, SVG `viewBox` updated to
`1440 910`) resolves the exact defect round 1 rejected on: node-5's text no
longer clips at 1440px, and 1536/1600/1920 remain unaffected. All nine
acceptance items are now satisfied, frozen primitives are untouched, and all
gates pass. **APPROVED.**
