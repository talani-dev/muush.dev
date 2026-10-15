# Quickstart: verifying feature 34 by hand

Automated checks cover structure (see plan § Testing). Everything below is
what only a real browser shows. Record results in the implementation report
with browser name and version.

## 0 · Build

```sh
pnpm check && pnpm typecheck && pnpm test && pnpm generate && pnpm storybook:build
pnpm preview   # serves the generated output; no extra package
```

## 1 · Desktop float (Chrome, Safari, Firefox)

1. Open `/es` at 1440×900. Scroll to Services. Watch two cycles (12 s):
   five nodes drift, never two peaking together, radar pings continue.
2. DevTools → Animations panel (Chrome) → pause; scrub to 8 moments in one
   cycle. At each, zoom in on each radar: both line ends meet the red dot's
   centre (SC-001). Repeat at 1024, 1280 and 1920 widths (OA-3).
3. Set the browser's default font size to 20 px, reload, repeat one
   moment of step 2.
4. Read every name and brief while moving: no blur, no shimmer, no
   rotation (US1-4).
5. Performance panel: record 10 s with Services in view; no Layout events
   caused by the float (SC-004). Note paint cost.
6. Repeat step 1 on `/en`.

## 2 · Reduced motion and fallbacks

1. DevTools → Rendering → emulate `prefers-reduced-motion: reduce`. Services
   is static at 1440 and 390 and matches the pre-feature build (SC-003).
2. Disable JavaScript: the float still runs.

## 3 · Cursor matrix (macOS Chrome, Safari, Firefox; Windows Chrome/Edge if available)

For each browser, on `/es`, `/en`, `/es/nosotros`, `/en/about`:

| Check | Expected |
|---|---|
| Body text, background | Brand cursor, no white square |
| Nav links, footer links, primary button, burger, social icons | Brand cursor (not the hand) |
| Contact form: name, email, company, textarea, WhatsApp number | System I-beam |
| Radio pills, select "¿Cómo te identificas?", country selector, CV picker | Brand cursor |
| Sharpness on a Retina display | Crisp edges; if blurry, record it (OA-6) |
| Click a 1 px target with the arrow tip | Lands (SC-007; hotspot `1 9` at 64×64, A1) |
| Cursor size (A1) | Renders at 64×64, crisp; move it to each viewport edge and over the tab strip: record if it switches to the system cursor (research A1, UNVERIFIED Chromium >32 px caveat) |
| Hover the red final-CTA gradient and red glass cards | Record visibility (OA-8) |
| Windows: High Contrast on | System cursors |
| Block `/cursor/you.svg` (DevTools request blocking) | System arrow; hand on links/buttons |

## 4 · Mobile and tablet trial (D-3), Roberto's local review

1. `pnpm dev`, open `/es` on a phone (or 390×844 and 768×1024 emulation).
2. Scroll Services: rows drift out of phase, lyrics dimming still works,
   spine stays put, radars stay on their vertical.
3. Roberto decides keep or revert.
4. **To revert**: delete the block fenced "Feature 34 · D-3 mobile float
   trial" at the end of `ServicesTimeline.vue`'s `<style scoped>` and delete
   `app/features/landing/ui/ServicesTimeline.float.test.ts` (or revert the
   single commit that added both). Run `pnpm test`; nothing else changes and
   the desktop float is unaffected.

## 5 · Amendment A2: red lit dots, no glow (footer flat, A2 revision 1)

Chrome, Safari and Firefox on macOS, 1440×900, `/es` and `/en/about` (plus a
spot check on `/en` and `/es/nosotros`). Record browser and version.

**A2 revision 1 (Roberto, 2026-10-15)**: the footer keeps its flat ink-500
surface, so steps 3, 4, 7 and 8 are revised below; the A2 wording of each is
kept in italics as history.

1. **Glow gone.** Move the mouse over plain paper (Hero, Purpose). Only dots
   change; the spaces between dots stay ink-500. No haze, no ring, no edge.
2. **Red and falloff (SC-009).** Stop the pointer. Zoom the screenshot: the
   dot nearest the arrow tip is `#CF3147` (DevTools colour picker or a
   screenshot sampler, ±2 per channel); dots get progressively less red
   outward; dots about 120 px away and beyond are the normal grey dot.
   Compare with Roberto's reference screenshot (the leader has it).
3. **Footer flat (SC-010, A2 revision 1).** Scroll to the footer and move
   the pointer over the brand block, the columns and the bottom bar. The
   footer is a flat ink-500 surface: no dots and no red dots anywhere inside
   it; sample a dot-grid position and a point between dots, both ink-500.
   Then hold the pointer just inside the footer's top edge: the red dots
   above the edge (within ≈120 px) show on the paper and the effect is cut
   cleanly at the edge. Layout, type and the bottom-bar hairline look as
   before A2. Compare with the pre-A2 build if in doubt: the footer must be
   identical. *(Superseded A2 step: "Dots are visible behind the brand
   block, the columns and the bottom bar, and the red dots follow the
   pointer there exactly as on the sections.")*
4. **Ink-300 text (A2-S1 weak spot).** *Moot after A2 revision 1: the footer
   covers the effect, so no red dot reaches the footer's ink-300 lines.* If
   any other ink-300 text sits on the paper, hover it and record readability.
   *(Superseded A2 step: hover the footer category line and the
   copyright/location line and record readability.)*
5. **Forms cover (A2-4).** Hover over the contact card on `/es` and the
   application card on `/en/about`: no red dots through the cards, same as
   before A2. The areas around the cards show them.
6. **Registration (SC-011).** At the top, middle and bottom of the page, and
   again with the browser's default font size at 20 px: no doubled or
   half-step dots at the edge of the effect.
7. **Page does not grow.** Move the pointer along the very bottom of the
   footer: the scrollbar does not change and no extra space appears. (Still
   required after A2 revision 1: the lit sheet exists under the footer even
   though the footer covers it.)
8. **Glows under the footer (OA-9).** *Moot after A2 revision 1: the
   footer's opaque fill hides them, as before A2.* Quick check only: at 1440
   and 390 on `/es` and `/es/nosotros` the top of the footer is flat ink-500.
   *(Superseded A2 step: record whether section glow shows behind the footer
   content, with screenshots for Roberto.)*
9. **Unchanged conditions (A2-5).** Reduced motion emulated, touch emulation
   (coarse pointer), and print preview: no spotlight. Reload and do not move
   the mouse: no spotlight until the first mouse movement.
10. **Other red surfaces.** Hover around the red final-CTA gradient and red
    glass cards; record visibility of the red dots (not a failure either way).
