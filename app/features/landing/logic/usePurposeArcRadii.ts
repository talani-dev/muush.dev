import { onScopeDispose, type Ref, watch } from 'vue'

/**
 * Corrects each Golden Circle arc's radius to the REAL on-screen distance
 * between the arcs' shared origin and its own Radar, measured in the
 * browser after mount.
 *
 * ## Why this exists (feature 24, round 2 — Roberto, 2026-09-08)
 *
 * `PurposeSection.vue`'s `.arc-why/-how/-what` diameters are fixed tokens
 * read from the `.pen` (`--purpose-arc-why/-how/-what`), each supposedly
 * `2 × distance(origin, radar)` for its own node. That held at the moment
 * the design was measured, but it assumes a fixed row height — and the row
 * height is the height of `PurposeCard`'s copy, which wraps differently in
 * a real browser than it did in Pencil (`docs/harness/progress/
 * impl_purpose_section.md`: `Why` wraps to 3 lines in Chrome where Pencil
 * drew 4). That single line of difference is enough to move every Radar's Y
 * position off the fixed-radius circle by **13–61px**, and the amount is
 * locale-dependent (ES 13.3/29.6/29.6px, EN 27.7/60.2/60.9px) since the
 * copy itself differs in length per locale. A fixed token cannot hold
 * tangency for every locale at once — this was reported, not silently
 * retuned, when the section first shipped.
 *
 * Roberto's call: fix it by measuring in the browser rather than accepting
 * the drift or reworking the design. This is the one place in the
 * desktop composition that is no longer CSS-only — see the note this added
 * to `PurposeSection.vue`'s own doc comment.
 *
 * ## What it does, and does not, touch
 *
 * It reads three `.radar` centres and the shared arc origin (any one arc's
 * own bounding box centres on it, `clip-path` never changes an element's
 * layout box) via `getBoundingClientRect()`, and writes the measured
 * diameter directly onto each `.arc-*` element's `--arc-diameter` inline
 * style — the same custom property each `.arc-*` class rule already sets
 * from the fixed token, so an inline override here simply outranks it in
 * the cascade. It never touches the hover reveal (`PurposeConstellation.vue`
 * keeps that pure CSS, per `ui-map.md` § *Receta del ping*'s "prefer CSS"
 * instruction, which is about the reveal transition, not this static
 * geometry correction).
 *
 * ## Fallback, and why there is no visible jump
 *
 * Before the first measurement — the initial SSR/client render, and any
 * environment where this never runs — the class rule's fixed token stays in
 * effect untouched, so there is no hydration mismatch: server and first
 * client paint agree. The correction lands a frame after mount, which
 * Roberto accepted explicitly as the cost of exact tangency over "zero JS".
 *
 * ## Below `lg`, and on resize
 *
 * The `.arcs` WRAPPER is `hidden` below `lg` (mobile has no constellation at
 * all), so measuring it would corrupt every radius instead of leaving the
 * fixed fallback alone. Guarded by reading the **wrapper's own**
 * `getBoundingClientRect()`: a box that is not rendered has a rect that is
 * `0×0` at `(0, 0)`, full stop — checked directly, never through an
 * individual `.arc`'s.
 *
 * ⚠️ **Why not `getComputedStyle(arcEl).display === 'none'` (found by
 * review, feature 24 round 3).** Each `.arc` carries `position: absolute`,
 * and CSS "blockifies" an absolutely-positioned element's `display` to
 * `block` at computed-value time regardless of whether any ancestor is
 * `display: none` — `none` is the one specified value blockification never
 * touches, but it only ever protects the element that actually specifies
 * it. So `getComputedStyle(arcEl).display` reports `"block"` even on
 * mobile: checking the arc itself never triggers the guard. A zero-rect
 * check on the WRAPPER sidesteps the whole question of which computed
 * `display` value survives blockification — an unrendered box's rect is
 * zero regardless of what produced the non-rendering (`display: none`
 * here, but the same check holds for any future reason a caller might hide
 * this wrapper).
 *
 * A `ResizeObserver` on the section recalculates on any reflow — a viewport
 * resize crossing the `lg` breakpoint, or a locale swap that makes the
 * cards wrap differently — so a stale radius from a previous layout is
 * never left applied.
 *
 * Plain Vue only (`onScopeDispose`, no Nuxt composable), same discipline
 * `useServicesLyrics.ts` and `usePurposeCarousel.ts` already follow so the
 * section still mounts bare in Storybook and in a Vue Test Utils mount
 * (`docs/business/rules.md` § R23).
 */
const ARC_SELECTORS = ['.arc-why', '.arc-how', '.arc-what'] as const

function centreOf(element: HTMLElement): { x: number; y: number } {
  const rect = element.getBoundingClientRect()
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

function measureAndApply(section: HTMLElement): void {
  /* The wrapper's own rect, never an individual `.arc`'s computed `display`
     — see the doc comment above on why an absolutely-positioned `.arc`
     blockifies to `display: block` regardless of the ancestor's `hidden`
     state, and why a zero-rect check on the wrapper sidesteps that. */
  const wrapper = section.querySelector<HTMLElement>('.arcs')
  if (!wrapper) return

  const wrapperRect = wrapper.getBoundingClientRect()
  if (wrapperRect.width === 0 && wrapperRect.height === 0) return

  const arcs = ARC_SELECTORS.map(selector =>
    section.querySelector<HTMLElement>(selector)
  )
  const radars = [...section.querySelectorAll<HTMLElement>('.radar')]

  if (arcs.some(arc => arc === null) || radars.length !== 3) return

  const originEl = arcs[0] as HTMLElement
  const origin = centreOf(originEl)

  arcs.forEach((arc, index) => {
    const radar = radars[index]
    if (!arc || !radar) return

    const radarCentre = centreOf(radar)
    const distance = Math.hypot(
      radarCentre.x - origin.x,
      radarCentre.y - origin.y
    )
    arc.style.setProperty('--arc-diameter', `${distance * 2}px`)
  })
}

export function usePurposeArcRadii(
  sectionRef: Readonly<Ref<HTMLElement | null>>
): void {
  let observer: ResizeObserver | undefined
  const supportsObserving = typeof ResizeObserver !== 'undefined'

  const stopWatching = watch(
    sectionRef,
    element => {
      observer?.disconnect()
      observer = undefined
      if (!element) return

      measureAndApply(element)
      if (!supportsObserving) return

      observer = new ResizeObserver(() => measureAndApply(element))
      observer.observe(element)
    },
    { immediate: true, flush: 'post' }
  )

  onScopeDispose(() => {
    stopWatching()
    observer?.disconnect()
    observer = undefined
  })
}
