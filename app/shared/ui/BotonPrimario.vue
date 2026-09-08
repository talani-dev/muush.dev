<script setup lang="ts">
import { computed } from 'vue'

/**
 * BotonPrimario — the conversion control of the site: dark glass, the
 * control corner radius and a conic LED ring at `--stroke-led`. Sizes from
 * docs/business/landing/design-extract.md § 4.
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

/** Padding and label role per variant; fill, radius and ring are shared. */
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
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :type="href ? undefined : buttonType"
    :class="[
      'led relative inline-flex items-center justify-center rounded-control bg-glass-dark font-instrument text-bone-100 focus-visible:outline-red-400',
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
