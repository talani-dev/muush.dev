import {
  type ComputedRef,
  computed,
  type MaybeRefOrGetter,
  onScopeDispose,
  type ShallowRef,
  shallowRef,
  toValue,
  watch,
} from 'vue'

/**
 * Whether the nav's `Cuéntanos tu proyecto` button should be showing.
 *
 * Roberto's decision, `ui-map.md` § 2 (2026-09-07): on the landing the button
 * duplicates the one the Hero already offers two steps below, so it is absent
 * while the Hero is on screen, fades in once the Hero has scrolled away, and
 * hides again on scrolling back up. On every other route it is simply there
 * from first paint and never animates.
 *
 * **Two features meet here and neither imports the other** (Article III). The
 * trigger belongs to `landing`, the controlled element to `shell`; the shared
 * flag lives in `app/shared/logic/`, which is Article III's own remedy. This
 * file imports nothing from `app/features/` — the "this route suppresses the
 * CTA" predicate arrives as an argument, so `app/shared/` never depends on a
 * feature (Article II).
 *
 * **`IntersectionObserver`, not a scroll threshold.** It states the
 * requirement directly, fires only on change, and reads no geometry on a
 * per-frame path — the cost `findings.md` § R41 measured. A scroll threshold
 * would need the Hero's height on load and on every resize plus a comparison
 * per scroll event, to compute an answer the platform already has.
 */

/**
 * Module-scoped on purpose, and the same argument `useMobileMenu` documents
 * for its own flag: a document has one Hero, and two independent instances
 * would desynchronise the nav from the section it is watching.
 *
 * It starts `true` — *assume the Hero is on screen* — and is **written only
 * from `IntersectionObserver`**, which never runs on the server. So every
 * prerendered document carries this initial value, no route can leak a state
 * into the next, and the landing's button ships **hidden in the HTML** rather
 * than being hidden on mount, which is the flash spec FR-045 forbids.
 */
const isHeroOnScreen = shallowRef(true)

/**
 * Watches the section that suppresses the nav CTA. Called from that section,
 * and from nowhere else.
 *
 * A route with no Hero never calls this, so the flag keeps its initial value
 * and `useNavCtaReveal` returns `true`. **Absence of a Hero is the default,
 * not a case to handle** (spec FR-050).
 *
 * It is a plain Vue composable over `IntersectionObserver` and lifecycle
 * hooks — no Nuxt runtime — so `HeroSection.vue` still mounts in Storybook and
 * in a bare Vue Test Utils mount, which is the property `rules.md` § R23
 * protects.
 */
export function useHeroSentinel(
  target: Readonly<ShallowRef<HTMLElement | null>>
): void {
  /* The server, and any environment without the API. Nothing is observed, so
     the flag keeps its initial value and the CTA stays hidden on the landing
     — the same state the prerendered HTML carries. */
  if (typeof IntersectionObserver === 'undefined') return

  const observer = new IntersectionObserver(entries => {
    const latest = entries.at(-1)
    if (latest) isHeroOnScreen.value = latest.isIntersecting
  })

  /* A template ref is `null` during setup and again after unmount, so the
     wiring follows the element rather than a single lifecycle moment. */
  const stopWatching = watch(
    target,
    element => {
      observer.disconnect()
      if (element) observer.observe(element)
    },
    { immediate: true, flush: 'post' }
  )

  onScopeDispose(() => {
    stopWatching()
    observer.disconnect()
    /* Restored, not left behind: a `false` surviving the Hero's unmount would
       be a state leaking into the next route — exactly what the module scope
       has to be disciplined about. */
    isHeroOnScreen.value = true
  })
}

/**
 * Resolves whether the nav CTA should be showing.
 *
 * `suppressedByRoute` is true on routes that render their own call to action
 * above the fold — today only the landing. It is evaluated identically on the
 * server and on the client, which is what makes both halves mechanical rather
 * than promised: the landing's button is hidden in the generated HTML
 * (FR-045), and a route that starts visible has nothing to transition from, so
 * no fade can run on load (FR-044).
 */
export function useNavCtaReveal(
  suppressedByRoute: MaybeRefOrGetter<boolean>
): ComputedRef<boolean> {
  return computed(() => !(toValue(suppressedByRoute) && isHeroOnScreen.value))
}
