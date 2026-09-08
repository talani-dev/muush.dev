<script setup lang="ts">
import { computed } from 'vue'

/**
 * BotonPrimario — the conversion control of the site: dark glass, a pill
 * silhouette and a conic LED ring at `--stroke-led`. Sizes from
 * docs/business/landing/design-extract.md § 4.
 *
 * ## The shape is one shape, and it is a pill
 *
 * The design file draws `cornerRadius: 999` on the desktop hero CTAs and on
 * the four detached nav CTAs, while the component master, the mobile hero
 * CTAs and both form Submits are still on the old 12. Roberto resolved that
 * inconsistency on 2026-09-08 in favour of rounding **every** instance, so
 * this file goes ahead of the half-propagated design file rather than
 * reproducing its state. There is no shape prop and no shape variant: a
 * caller cannot ask for the old rectangle.
 *
 * `rounded-full` rather than a `--radius-pill` token of its own, because
 * `global.css` already settled that question for the r999 capsule when `Pill`
 * was built ("La cápsula del Pill usa rounded-full, no un token propio"), and
 * a second name for the same shape is how two capsules drift apart. The fill
 * is untouched: `bg-glass-dark` is still `#1c1416a6`. The nav CTA looks
 * fill-less in the frame because the nav's own glass sits behind it.
 *
 * Renders an `<a>` when `href` is given and a real `<button>` otherwise, so
 * a form submit stays a submit and the hero CTA stays a link. The label
 * always comes from the caller — no ES/EN copy lives here.
 *
 * The LED is not a prop: `branding.md` allows exactly one primary button per
 * screen, so there is nothing for a caller to switch off. It carries no
 * client-side script of any kind.
 *
 * ## The pointer cursor is declared, because nothing else declares it
 *
 * The browser gives an `<a href>` a pointer for free and gives a `<button>`
 * `cursor: default`. Tailwind v4's preflight sets no cursor on either — there
 * was not one `cursor` declaration in the whole emitted stylesheet before this
 * change — so the `<button>` branch looked unclickable while the `<a>` branch
 * looked right, purely by accident of the user-agent sheet
 * (`docs/harness/findings.md` § R56).
 *
 * It is declared here rather than at each call site, and it is **conditional**,
 * because the two branches are not equally clickable.
 *
 * ---
 *
 * ## ⚠️ Recorded exception to Article V's 200-line limit
 *
 * This file is over it, and every line of the excess is prose.
 *
 * | Measure | Before feature 022 | Now |
 * |---|---|---|
 * | raw lines (`wc -l`) | 176 | 251 |
 * | non-comment, non-blank | 74 | 74 |
 *
 * Measured by stripping block comments, HTML comments and `//` line comments
 * from the file and then dropping blank lines; the "now" column includes this
 * note. Feature 022 changed **one class** and added no code at all. The second
 * row is the number that matters — the raw one goes stale the moment a comment
 * is edited, which is a mistake the `CursorSpotlight.vue` exception records
 * having already made once. (The reviewer's note reads 177 → 214 and 78 code
 * lines; the gap is a counting-method difference over comment-delimiter lines,
 * and both measurements agree on the invariant — the code did not change.)
 *
 * **Do not "fix" this by extracting sub-components.** Article V's remedy
 * clause ("extract sub-components if they grow past that") names the cure, and
 * naming the cure is what identifies the disease as *structural* complexity.
 * There is none here: one element, one masked pseudo-element, two media
 * queries. Splitting the ring off would put the mask, the inherited radius and
 * the 65%-opaque fill into two files that then have to agree — and the
 * comments in the `<style>` block are the measurement behind a band that fails
 * **silently** when it breaks (`docs/harness/findings.md` § R59), so deleting
 * them is not the remedy either.
 *
 * This is materially the exception already recorded for `CursorSpotlight.vue`,
 * which established the non-comment count as the only stable metric. It lives
 * here rather than in a `plan.md` Complexity Tracking table because feature
 * 022 is `sdd: false` and has no spec package to hold one; the Constitution's
 * *Compliance Review* requires the record to be explicit, not to be in a
 * particular file. Raised as non-blocking by the reviewer on 2026-09-08.
 */
export type ButtonVariant = 'nav' | 'hero' | 'submit'

interface Props {
  variant?: ButtonVariant
  /** When set the control renders as a link. */
  href?: string
  /** Ignored when `href` is set. */
  type?: 'button' | 'submit'
}

const { variant = 'hero', href, type } = defineProps<Props>()

/** Padding and label role per variant; fill, shape and ring are shared. */
const sizeByVariant = {
  nav: 'py-btn-nav-y px-btn-nav-x text-button-sm',
  hero: 'py-btn-y px-btn-hero-x text-button',
  submit: 'py-btn-y px-btn-submit-x text-button',
} satisfies Record<ButtonVariant, string>

const buttonType = computed(
  () => type ?? (variant === 'submit' ? 'submit' : 'button')
)

/**
 * Whether clicking this control does anything — the only thing that earns a
 * pointer.
 *
 * Two states qualify: it has an `href`, or it is a native form submit. What
 * does **not** qualify is the third state, a `type="button"` with no
 * destination, which is exactly the Hero's primary CTA while section 05 does
 * not exist (`rules.md` § R50). `ui-map.md` § 6 already rules on that shape for
 * the Proyectos slots — *"sin cursor de link ni hover (un espacio reservado que
 * parece clickeable y no lleva a nada se lee como sitio roto)"* — and this is
 * the same shape, so it gets the same answer.
 *
 * It flips on its own the day the destination arrives: `contactHash` lands in
 * `HERO_DESTINATIONS`, an `href` reaches this component, and the pointer comes
 * with it. No edit here.
 *
 * ⚠️ **Known limit.** A caller that attached a click listener to a
 * `type="button"` instance would get a real action and no pointer, because a
 * listener is not visible from inside the component. No caller does that today,
 * and the fix when one appears is to give that action a name in this contract
 * rather than to paint every button.
 *
 * (Written without the binding syntax on purpose: this file's own test greps
 * the raw source for one, and the guard is worth more than the wording.)
 */
const isClickable = computed(
  () => Boolean(href) || buttonType.value === 'submit'
)
/**
 * `group` (feature 21): a static class, not a prop — the nav CTA's leading
 * arrow is composed by its one caller (`SiteNav.vue`) as a plain `<span
 * class="group-hover:...">` inside this component's existing default slot
 * (spec Clarifications, Q3; `plan.md` § 2). This root needs the ancestor
 * class for that child's hover animation to read at all; it costs nothing
 * to every other caller, since none of them declares a `group-hover:` class
 * today.
 */
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :type="href ? undefined : buttonType"
    :class="[
      'led group relative inline-flex items-center justify-center rounded-full bg-glass-dark font-instrument text-bone-100 focus-visible:outline-red-400',
      sizeByVariant[variant],
      isClickable ? 'cursor-pointer' : '',
    ]"
  >
    <!--
      Only the outline colour is set: ui-map.md § 10 requires a visible
      red-400 indicator and forbids removing it, but documents no thickness
      or offset, so the platform default geometry stands (spec A-07 —
      UNVERIFIED against the design file, flagged for Clau).
    -->
    <slot />
  </component>
</template>

<style scoped>
/*
 * The angle is also declared here so the ring still paints — statically —
 * where `@property` is unsupported and the angle therefore cannot
 * interpolate. That is ui-map.md § 10's documented "borde estático en Red
 * 400", reached with no code path of its own.
 *
 * `@property --led-angle` and `@keyframes led-spin` are document-level
 * at-rules and already live in app/assets/css/global.css; they are
 * referenced here, never redeclared.
 */
.led {
  --led-angle: 0deg;
}

/*
 * A masked pseudo-element, not the usual `background-clip: padding-box,
 * border-box` two-layer trick: this button's fill is only 65% opaque, so a
 * conic layer behind it would show through the middle. `mask-composite:
 * exclude` paints the `--stroke-led` band and nothing else.
 *
 * Three stops, red-400 → bone-100 → red-400. Wine appears nowhere: the
 * design file's third stop is a one-digit typo of red-400 and resolves to
 * that token in code (design-extract.md §§ 4, 11). The variables are the
 * `:root` ramp names, not the `--color-*` theme names — `@theme inline`
 * inlines those into utilities and emits no custom property for them.
 *
 * ## Why the band survives a pill radius, measured rather than assumed
 *
 * `border-radius: inherit` copies the *specified* radius, and each box then
 * clamps it to its own size — so the ring inherits "as round as possible" and
 * not a number that would fit the button and overflow the pseudo-element. The
 * inner edge stays concentric because `mask-clip: content-box` rounds the
 * content box by the border radius **minus the padding**, which for a pill is
 * (height ÷ 2) − 1.5 = half the content height: another pill. The band is
 * therefore uniform all the way round, with no hairline and no notch where the
 * cap meets the straight edge.
 *
 * Verified on `.output/public` in Chrome at 1440 and 390 (the measuring
 * discipline of `docs/harness/findings.md` § R44), and at
 * 5× on the three sizes: hero 236.19×55.19 (cap radius 27.6), mobile hero
 * 213.55×50 (25), nav 198.78×42.8 (21.4). What the pill *does* change is
 * where the sweep reads: a box far wider than it is tall gives each cap only
 * about ±12° of the turn, so the bone-100 stop lands as a short bright arc on
 * the vertical centre line and the caps read as near-flat colour. That is a
 * function of the aspect ratio, not of the corner radius — the same button at
 * the old 12px puts the bright arc in the same place.
 */
.led::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: var(--stroke-led);
  background: conic-gradient(
    from var(--led-angle),
    var(--red-400) 0%,
    var(--bone-100) 50%,
    var(--red-400) 100%
  );
  /* The mask colour carries no design meaning; only its alpha is read. */
  -webkit-mask:
    linear-gradient(black 0 0) content-box,
    linear-gradient(black 0 0);
  mask:
    linear-gradient(black 0 0) content-box,
    linear-gradient(black 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/*
 * Hover-capable pointers only. A touch device never enters :hover, so it
 * keeps the static ring — docs/business/rules.md § R7, carried forward from
 * the pre-migration default while decisions-open.md #8 (owner Clau) is still
 * open. Reversing it is deleting this media query.
 *
 * 2.6s is a duration from design-extract.md § 4 verbatim, not a design
 * value Article VII governs.
 */
@media (hover: hover) {
  .led:hover::before {
    animation: led-spin 2.6s linear infinite;
  }
}

@media (prefers-reduced-motion: reduce) {
  .led::before,
  .led:hover::before {
    animation: none;
    background: var(--red-400);
  }
}
</style>
