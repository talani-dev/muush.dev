<script setup lang="ts">
import { useTemplateRef } from 'vue'
import type { PurposeNodeContent } from '@/features/landing/data/purposeContent'
import { usePurposeArcRadii } from '@/features/landing/logic/usePurposeArcRadii'
import Pill from '@/shared/ui/Pill.vue'
import SectionBackdrop from '@/shared/ui/SectionBackdrop.vue'
import SectionGlow from '@/shared/ui/SectionGlow.vue'
import PurposeCarousel from './PurposeCarousel.vue'
import PurposeConstellation from './PurposeConstellation.vue'

/**
 * `02 Propósito` — the landing's second section, and the site's most divergent:
 * a Golden Circle constellation at desktop width, a three-card carousel below
 * it. Two compositions, not one rescaled, and the inactive one is `display:
 * none` so no copy is announced twice (spec FR-002).
 *
 * The `id` is Spanish because the Constitution's Article VI keeps translated
 * route segments and Spanish anchors, and it closes three of the five dangling
 * anchors `rules.md` § R50 records — the footer's *Navegación* column and the
 * mobile menu already point three links at `#proposito`. The shell keeps
 * owning those links and neither feature imports the other; the literal
 * appears in both, which Article III prefers to a shared anchor registry.
 *
 * It calls **no Nuxt composable**: copy arrives already translated from
 * `logic/usePurposeContent.ts`, which is what lets this render in Storybook and
 * in a bare mount (`rules.md` § R23). It does call one **plain Vue**
 * composable, `usePurposeArcRadii` — see the note below on why the desktop
 * composition is no longer CSS-only for the arcs' geometry.
 *
 * ---
 *
 * ## ⚠️ The arcs are no longer purely CSS-derived (feature 24, round 2)
 *
 * `.arc-why/-how/-what`'s diameters were fixed tokens, each supposedly
 * `2 × distance(origin, radar)` — true only at the row height Pencil
 * assumed. A real browser wraps `PurposeCard`'s copy differently
 * (`docs/harness/progress/impl_purpose_section.md` documented this the day
 * the section shipped: `Why` wraps to 3 lines in Chrome, not Pencil's 4),
 * which moves every Radar's Y position off the fixed-radius circle by
 * **13–61px**, and the amount is locale-dependent since the copy itself
 * differs in length. Roberto's call (2026-09-08): fix the tangency exactly
 * by measuring in the browser, accepting that this one geometry correction
 * is no longer zero-JS. `usePurposeArcRadii.ts` does the measuring — see
 * its own doc comment for the mechanism, the `lg`-only guard and the
 * fixed-token fallback that holds until the first `onMounted` runs (no
 * hydration mismatch). The hover **reveal** in `PurposeConstellation.vue`
 * is untouched and stays pure CSS; only this static radius correction adds
 * a runtime step.
 *
 * ## The five rules this component must not break
 *
 * `SectionBackdrop.vue`'s doc comment is the contract, and this is only the
 * second section it governs. Its failure mode is **silent** — no error, no
 * failing test, the page simply stops matching the design.
 *
 * 1. **No stacking context on this section, or on any wrapper above it.** Not
 *    `transform`, `translate`, `scale`, `rotate`, `filter`, `backdrop-filter`,
 *    `opacity` below 1, `isolation`, `will-change`, `contain: paint`,
 *    `position: fixed`, or `sticky` with a `z-index`. Any of them lifts this
 *    subtree — glows included — above the page-wide dot sheet.
 * 2. **The descendant contexts below are permitted, and they are deliberate.**
 *    The three glows' `-translate-x-1/2 -translate-y-1/2`, the arcs'
 *    `translate`, the constellation trigger's `translate`, each card's
 *    `opacity`, the carousel neighbour's `scale` and every glass surface's
 *    `backdrop-filter` each create a context for **its own subtree only**. The
 *    contract binds this section and its *ancestors*; a leaf in the content
 *    layer cannot lift the backdrop, which is a **sibling**.
 * 3. **No opaque background.** A section background paints after the negative
 *    levels and would hide the section's own glows.
 * 4. **No bottom padding and no horizontal padding.** The gap to Servicios
 *    belongs to Servicios (`rules.md` § R49) — this section passes on a
 *    **101px** desktop remainder — and `<main>` already applies `px-page`.
 * 5. **The arcs' clip is on a wrapper, never on the section.** `overflow:
 *    clip` on the section would cut its own ~1000px glows hard at the section
 *    box; on an `absolute inset-0` wrapper it clips to the same box, creates no
 *    stacking context, and leaves the glows soft (spec FR-018). That wrapper
 *    (`.arcs-clip`) is now wider than the section itself (feature 24, round
 *    3) — it matches `<main>`'s own BORDER box, not its padded content box —
 *    which is still "a wrapper, never the section": the section still
 *    carries no `overflow` of its own.
 *
 * The arcs live here rather than in `PurposeConstellation` for one reason: they
 * centre on a point 270px **above** the constellation's own box, so only a
 * wrapper whose `inset-0` resolves against the *section* can place them where
 * the design measures them from. They are ordered before both compositions so
 * the cards paint over them, which is what `A-09` asks for — the arcs are
 * composition in the content layer, above the dotted paper and below the copy.
 *
 * The section carries no `aria-label`, matching the Hero's precedent: the `id`
 * is a scroll target, not a landmark (spec A-08). No `scroll-margin-top`
 * either — the section's own top padding (254 desktop / 90 mobile) comfortably
 * exceeds the pinned nav's measured height (102.8 / 78.19,
 * `findings.md` § R55), so a jump to `#proposito` lands the Pill below the nav.
 *
 * ---
 *
 * ## ⚠️ Recorded exception to Article V's 200-line limit
 *
 * Feature 24 (2026-09-08, three review rounds) pushed this file over the
 * limit. Round 1 touched the arcs' `clip-path` (item 1a) and the Pill's own
 * nudge (item 1b) — one property and one wrapper `<div>`. Round 2 added the
 * runtime arc-radius correction (`usePurposeArcRadii`, above) — one
 * template ref, one composable call, and a rewrite of two style comments to
 * stop claiming the arcs are purely CSS-derived. Round 3 split `.arcs` into
 * a wider clip boundary (`.arcs-clip`) and the untouched percentage-basis box
 * (`.arcs`) — one extra `<div>` and two small style rules. Across all three
 * rounds the growth is comments explaining *why*, not new structural logic.
 *
 * | Measure | Before feature 24 | After round 1 | After round 2 | After round 3 |
 * |---|---|---|---|---|
 * | raw lines (`wc -l`) | 198 | 248 | 312 | 366 |
 * | non-comment, non-blank | 82 | 87 | 91 | 104 |
 *
 * Measured the same way `BotonPrimario.vue`'s own recorded exception does:
 * strip block comments, HTML comments and line comments, then drop blank
 * lines. The second row is the number that matters and it stays well under
 * 200 across all three rounds — round 3's own +13 is one wrapper `<div>` in
 * the template plus the `.arcs-clip`/`.arcs` style rules; everything else
 * added in round 3 is prose.
 *
 * **Do not "fix" this by extracting sub-components.** Same reasoning
 * `BotonPrimario.vue`'s exception already recorded: Article V's remedy names
 * sub-component extraction as the cure for *structural* complexity, and there
 * is none here to extract — one clip-path declaration, one positioned
 * wrapper and one composable call don't split into files that then have to
 * agree with each other. The five numbered rules above this note, the
 * arc-quadrant proof and the arc-radius correction note are the reason the
 * section still matches the design when the next feature touches it;
 * deleting them to make the line count look better would trade a documented
 * invariant for a smaller file.
 */
interface Props {
  eyebrow: string
  /** The mobile carousel's accessible name. Same word, different role. */
  carouselLabel: string
  nodes: PurposeNodeContent[]
}

const { eyebrow, carouselLabel, nodes } = defineProps<Props>()

/* Corrects the arcs' radii to the real rendered Radar positions — see the
   doc comment above and `usePurposeArcRadii.ts` for why. */
const sectionRoot = useTemplateRef<HTMLElement>('sectionRoot')
usePurposeArcRadii(sectionRoot)
</script>

<template>
  <section id="proposito" ref="sectionRoot" class="relative pt-purpose-top">
    <!--
      Three glows, each anchored **by its centre** at an offset from this
      section's own top-left corner — never at a page offset, which would drift
      the moment anything above the section changed height
      (`rules.md` §§ R29, R48). Both endpoints of every anchor are measured;
      nothing is derived from the other viewport.

      `Glow origen` is the third, and it is desktop-only because the design
      gives it no mobile size (spec FR-028). It is also the consumer that makes
      `SectionGlow`'s `'920'` size variant not dead code — feature 7 nearly
      deleted it.
    -->
    <SectionBackdrop>
      <SectionGlow
        color="wine-400"
        :opacity="20"
        size="1000-560"
        class="absolute top-purpose-glow-a-y left-purpose-glow-a-x -translate-x-1/2 -translate-y-1/2"
      />
      <SectionGlow
        color="wine-300"
        :opacity="17"
        size="820-480"
        class="absolute top-purpose-glow-b-y left-purpose-glow-b-x -translate-x-1/2 -translate-y-1/2"
      />
      <SectionGlow
        color="red-400"
        :opacity="12"
        size="920"
        class="absolute top-purpose-origen-y left-purpose-origen-x hidden -translate-x-1/2 -translate-y-1/2 lg:block"
      />
    </SectionBackdrop>

    <!--
      The three concentric arcs of the Golden Circle. `overflow-clip` is here
      and never on the section (rule 5 above), and `clip` rather than `hidden`
      so the wrapper never becomes a scroll container — the same distinction
      `app/layouts/default.vue` already documents.

      Two nested boxes, not one (feature 24, round 3 — see `.arcs-clip`'s own
      comment below for why): `.arcs-clip` is the CLIP boundary and breaks out
      of `<main>`'s `--spacing-page` padding to match its own BORDER box (the
      `.pen`'s full 1440px frame). `.arcs` keeps the untouched 1280px content
      box every `--purpose-arc-*` percentage is still measured against, so the
      origin and every arc's position are unchanged — only where the curve
      gets cut widens.
    -->
    <div
      aria-hidden="true"
      class="arcs-clip pointer-events-none absolute inset-0 hidden overflow-clip lg:block"
    >
      <div class="arcs">
        <span class="arc arc-why" />
        <span class="arc arc-how" />
        <span class="arc arc-what" />
      </div>
    </div>

    <!--
      `flex` keeps the Pill at its intrinsic 127×38 with no line box.
      `pill-nudge` moves the Pill up a little, independently of the arcs and
      the constellation below it (feature 24, item 1b — Roberto: it sat "muy
      abajo"). `position: relative` shifts only this box; it does not affect
      normal flow, so `PurposeConstellation`/`PurposeCarousel` — positioned
      after it via `mt-purpose-eyebrow-gap` — keep the exact gap they already
      had, unaware this box moved.
    -->
    <div class="pill-nudge flex">
      <Pill :label="eyebrow" />
    </div>

    <!--
      Exactly one of the two renders. `display` is declared here, on the
      caller, because choosing the composition is the caller's job — the two
      components deliberately declare none of their own.
    -->
    <PurposeConstellation
      :nodes="nodes"
      class="mt-purpose-eyebrow-gap hidden lg:flex"
    />
    <PurposeCarousel
      :nodes="nodes"
      :label="carouselLabel"
      class="mt-purpose-eyebrow-gap lg:hidden"
    />
  </section>
</template>

<style scoped>
/*
 * The arcs. Three radii from one origin, and **not three magic numbers**: each
 * diameter is `2 × distance(origin, radarCentre)`, so every arc passes through
 * its own radar. `--arc-diameter` below is the fixed `.pen` token — exact only
 * at the row height Pencil assumed, and only a fallback for the first paint
 * now: `usePurposeArcRadii.ts` overrides it with the REAL measured distance
 * once mounted (feature 24, round 2), because a real browser wraps
 * `PurposeCard`'s copy differently per locale and drifts the fixed radius by
 * 13–61px (see this file's top doc comment). The table in `global.css` beside
 * `--purpose-arc-why` is the *design* radius, not the final on-screen one.
 *
 * `width` adds one stroke to the diameter because the design's diameter is
 * the **centreline** of the 1px stroke while `box-sizing: border-box`
 * measures the outer edge. Without it the three arcs land 0.5px inside their
 * radars — still relevant post-measurement, since the composable computes
 * the centreline distance, not the outer edge.
 *
 * `aspect-ratio` and not `height`: a percentage height would resolve against
 * the section's height, which is copy-driven, while the percentage width
 * resolves against the section's content box — the 1280 every other
 * percentage in this feature is measured against.
 */
/*
 * Feature 24, round 3. The old single `.arcs` box was BOTH the percentage
 * basis for `--purpose-arc-*` (correctly, the section's 1280px content box)
 * AND the overflow-clip boundary — and those two jobs need different widths.
 * The origin (`--purpose-arc-origin-x: -14.0625%`) sits off the LEFT of the
 * section by design (section-relative −180px, i.e. viewport −100px at
 * 1440px, matching the `.pen`'s own frame coordinate). CDP-measured
 * 2026-09-08: with the clip on the 1280px section box, arc-why/arc-how's
 * visible curve was cut at the section's own left edge (viewport x≈80),
 * 80px short of the `.pen`'s 1440px frame edge (viewport x=0) — the arc
 * "didn't reach far enough left" Roberto reported. arc-what's cutoff is
 * unaffected (bound by the section's own HEIGHT, which is correct — the
 * `.pen` frame is only 900 tall and the arcs "salen del frame" by design).
 *
 * `.arcs-clip` is the fix: it breaks out of `<main>`'s `--spacing-page`
 * padding to match `<main>`'s own BORDER box, the same formula already
 * reviewed for Servicios' `.canvas` (`ServicesConstellation.vue`) — `min()`
 * against the fixed 1440px frame width once `<main>` itself is capped by
 * `max-w-shell-max`, `calc(100% + 2 * var(--spacing-page))` otherwise.
 * `.arcs` (inner) undoes exactly that padding again, landing back on the
 * SAME box it always had — same width, same left offset from the section —
 * so no `--purpose-arc-*` token changes value or meaning.
 */
.arcs-clip {
  width: min(var(--spacing-shell-max), calc(100% + 2 * var(--spacing-page)));
  margin-inline: calc(-1 * var(--spacing-page));
}

.arcs {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--spacing-page);
  width: calc(100% - 2 * var(--spacing-page));
}

.arc {
  position: absolute;
  top: var(--purpose-origin-y);
  left: var(--purpose-arc-origin-x);
  aspect-ratio: 1;
  width: calc(var(--arc-diameter) + var(--purpose-arc-w));
  border: var(--purpose-arc-w) solid var(--arc-color);
  border-radius: 50%;
  translate: -50% -50%;
  /*
   * ⚠️ Feature 24, item 1a. Before this line each `.arc` was a FULL circle,
   * and what read as "an arc" was only the incidental fraction the `.arcs`
   * wrapper's `overflow-clip` happened to leave inside the section box — a
   * side effect of where the section edge falls, not a controlled shape
   * (Roberto, 2026-09-08).
   *
   * `translate: -50% -50%` above makes this box's own local centre (50%,
   * 50% in its own coordinate space) land exactly on the design's origin
   * point. A circle's horizontal and vertical diameters always split it into
   * four quadrants of exactly 90° each — that is true by the geometric
   * definition of a circle regardless of radius, which is what makes this
   * exact rather than incidental. `inset(50% 0 0 50%)` keeps only the
   * quadrant below-and-right of that centre (cutting the top 50% and the
   * left 50% of the box) and discards the other three.
   *
   * That is also, to under 1px, the same quadrant the old incidental clip
   * left visible: the origin sits above and to the left of the section
   * (`--purpose-origin-y` is a thin 44px below the section's own top edge,
   * `--purpose-arc-origin-x` is negative — off the section's left edge), so
   * the only part of any of the three circles that ever fell inside the
   * section box was already this same bottom-right quadrant. Confirmed
   * arithmetically per arc — the section's left edge, expressed as a
   * percentage of each arc's own box, falls at 50.08–50.17% (why/how/what),
   * under 1px from the 50% this clip-path declares. Nothing that was visible
   * moves; it is now bounded by construction instead of by where the section
   * happens to end.
   */
  clip-path: inset(50% 0 0 50%);
}

/*
 * ⚠️ The three strokes are **different**, read from the `.pen` on 2026-09-08:
 * the innermost arc is red-tinted and the outer two are bone at decreasing
 * opacity, so the Golden Circle's centre reads warmer. Three tokens, not one.
 */
.arc-why {
  --arc-diameter: var(--purpose-arc-why);
  --arc-color: var(--purpose-arc-why-color);
}

.arc-how {
  --arc-diameter: var(--purpose-arc-how);
  --arc-color: var(--purpose-arc-how-color);
}

.arc-what {
  --arc-diameter: var(--purpose-arc-what);
  --arc-color: var(--purpose-arc-what-color);
}

/*
 * Feature 24, item 1b. `position: relative` + `top` is a visual-only nudge —
 * unlike `margin-top`, it never changes this box's contribution to normal
 * flow, so the constellation/carousel below keep reading the exact same
 * `mt-purpose-eyebrow-gap` they always did, measured from where the Pill
 * *would* have sat without this offset. No design value fixes this; Roberto
 * asked for "a little" and the token is the one number to retune.
 */
.pill-nudge {
  position: relative;
  top: var(--purpose-pill-y);
}
</style>
