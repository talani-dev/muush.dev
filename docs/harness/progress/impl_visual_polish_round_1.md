# Implementation report — feature 23 `visual_polish_round_1`

1. **Nav arrow.** `SiteNav.vue`: label then `<span aria-hidden>→</span>`, gap
   via new `--spacing-nav-cta-arrow-gap` (9px) as `ml-nav-cta-arrow-gap`.
2. **Nav centring.** Restructured `nav > div` into three zones (logo /
   `.nav-row__links` / `.nav-row__end`), grid `1fr auto 1fr` at `lg` only
   (hand-written, ContactSection precedent). Mobile flex/`justify-between`
   untouched. **Measured via CDP** (`Emulation.setDeviceMetricsOverride`,
   fresh `pnpm generate`): links row centre == row centre at 1440 (720/720),
   1024, and on `/en`, `/es/nosotros`, `/en/about` (max Δ 0.008px).
3/8. **Section gaps.** New `--spacing-section-gap` (clamp 32px→80px, my own
   UX calibration, no design value). `mt-section-gap` on every section after
   the first in `index.vue`/`nosotros.vue`, and on `<SiteFooter>` in
   `default.vue` (Vue merges the class onto its root). Measured: 80px margin
   at every boundary at 1440 on both pages, incl. before the footer.
4. **Services left-hug — round 3, resolved.** Rounds 1/2 both reused
   `--services-closer-w` (1280px, `.closer`'s own box) for `.canvas` itself —
   conflating it with the real `.pen` frame (`GiLTU`, confirmed 1440px by the
   leader) and centring that 1280px box inside `<main>`'s *padded* content
   box, 80px narrower than the frame. New `--services-canvas-w: 90rem`
   (1440px, separate token; `.closer` untouched). `.canvas` now full-bleeds
   out of `<main>`'s `px-page` — `width: min(var(--services-canvas-w),
   calc(100% + 2 * var(--spacing-page)))`, `margin-inline: calc(-1 *
   var(--spacing-page))` — landing its local (0,0) on `<main>`'s own border
   box at every width, a documented one-section exception to feature 14's
   "no horizontal padding" contract (Roberto approved). No node/Pill/closer
   offset token touched — all were already authored relative to the frame's
   own origin. SVG `viewBox` updated `1280→1440` to match.
   **CDP-verified at 1440:** canvas 0→1440 (viewport-aligned), Pill at 80px,
   node 5 text right edge 1378px = **62px margin from the real edge** (exact
   match to the leader's confirmed measurement), full brief text intact, no
   clipping. 1536/1600/1920 unaffected (canvas tracks `<main>`'s own centred
   1440px box: 48→1488, 80→1520, 240→1680). Mobile (`lg:block` gate)
   unaffected — `.canvas` is `display:none` there. 1024–1439 keeps the same
   pre-existing, already-flagged imprecision (`rules.md` §§ R29/R48, no real
   frame between 390/1440).
5. **Delivery Pill.** `.closer` → `flex-row items-start` (was `flex-col`).
   Measured: Pill 118px wide (not 1280), same y as the copy paragraph.
6/7. **Contact copy + divider.** Real `.pen` copy in `i18n/locales/*.json`
   (`body`, new `altQuestion` key) replacing the feature-16 placeholder.
   `ContactSection.vue` renders `altQuestion` above `ctaSecondary`
   (confirmed order via CDP), inside a wrapper carrying
   `border-t border-hairline-footer pt-footer-bar-gap` — reuses the
   footer's own hairline token, no new colour. Updated `contactContent.ts`,
   `useContactContent.ts`, and the two test/story fixtures pinning the old
   placeholder.
9. **Footer removal.** `FAQ`/`Blog`/`Proyectos` removed entirely from
   `footerColumns.ts` (not `kind: 'none'`), with a divergence comment
   matching `navigation.ts`'s Proyectos precedent. Also removed the
   now-dead `shell.footer.nav.projects`/`muush.faq`/`muush.blog` i18n keys
   (same treatment feature 21 gave `shell.nav.projects`). Confirmed via CDP:
   footer text contains none of the three.

**Flagged:** item 4's fix doesn't reflow the hand-placed nodes at 1024–1439
(fixed px per `rules.md` §§ R29/R48 — only 1440/390 are real design frames);
nodes past the shrunk box still clip there, same as before. Out of scope per
the acceptance's four named widths, all unaffected.

`./init.sh` exits 0. `pnpm test`: 705/705 (baseline 706, net of legitimate
test edits/adds/removals — see diffs in the listed test files).
