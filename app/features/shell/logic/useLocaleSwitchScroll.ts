import { onScopeDispose } from 'vue'
import type { Router } from 'vue-router'
import {
  isHeldFor,
  readScrollGeometry,
  resolveScrollTop,
  type ScrollGeometry,
  type ScrollSnapshot,
  takeHeldLocaleSwitchPosition,
} from './localeSwitchScroll'

/** The slice of Nuxt's hook bus this needs (`useNuxtApp().hooks`). */
export interface PageHooks {
  hookOnce(name: 'page:loading:end', fn: () => void): unknown
}

export interface LocaleSwitchScrollDeps {
  router: Pick<Router, 'beforeEach' | 'afterEach' | 'currentRoute'>
  hooks: PageHooks
  scrollTo: (top: number) => void
  measure?: () => ScrollGeometry
  nextFrame?: (callback: () => void) => void
}

/**
 * Puts the visitor back where they were after the language toggle
 * navigates to the other locale (feature 43, spec FR-061, Roberto
 * 2026-11-01). The toggle holds the position on click
 * (`holdLocaleSwitchPosition`); this consumes it.
 *
 * How it meets Nuxt's router scroll behaviour (Nuxt 4.5,
 * `node_modules/nuxt/dist/pages/runtime/router.options.js`): for a change of
 * path, Nuxt scrolls to the top once the new page has rendered
 * (`page:loading:end`, then a frame), unless the destination's
 * `meta.scrollToTop` is `false`. So, only for the navigation a held position
 * belongs to:
 *
 * 1. `beforeEach` claims the held position, but only for the navigation it
 *    was held for (the toggle's destination path); any other navigation
 *    drops it. For that one it sets `to.meta.scrollToTop = false`. vue-router builds a
 *    fresh `meta` object for each resolved location and hands that same
 *    location to the scroll behaviour, so no other navigation is affected
 *    and no route record is mutated. Nuxt then leaves the scroll alone.
 * 2. `afterEach` waits for the same signal Nuxt waits for, `page:loading:end`
 *    plus a frame, so the other locale's page is in the DOM, then measures
 *    it and scrolls there, instantly. Instant regardless of
 *    `prefers-reduced-motion`: the restore is a jump to where the visitor
 *    already was, never an animated scroll (and `html`'s smooth
 *    `scroll-behavior` would otherwise animate it).
 *
 * A failed or redirected navigation, or one superseded before the page
 * renders, drops the held position; the next navigation behaves normally.
 *
 * Framework-free so it can be unit-tested with a fake router and hook bus.
 * Returns the function that removes both guards.
 */
export function installLocaleSwitchScroll({
  router,
  hooks,
  scrollTo,
  measure = readScrollGeometry,
  nextFrame = callback => requestAnimationFrame(() => callback()),
}: LocaleSwitchScrollDeps): () => void {
  /* The navigation a held position was claimed by, until it renders. */
  let pending: { fullPath: string; snapshot: ScrollSnapshot } | null = null

  const removeBefore = router.beforeEach((to, from) => {
    const held = takeHeldLocaleSwitchPosition()
    if (!held || !isHeldFor(held, to.path) || to.path === from.path) return
    pending = { fullPath: to.fullPath, snapshot: held.snapshot }
    to.meta.scrollToTop = false
  })

  const removeAfter = router.afterEach((to, _from, failure) => {
    const claimed = pending
    pending = null
    if (!claimed || failure || claimed.fullPath !== to.fullPath) return

    hooks.hookOnce('page:loading:end', () => {
      nextFrame(() => {
        if (router.currentRoute.value.fullPath !== to.fullPath) return
        scrollTo(resolveScrollTop(claimed.snapshot, measure()))
      })
    })
  })

  return () => {
    removeBefore()
    removeAfter()
  }
}

/**
 * Installs the restore for as long as the shell is mounted. Client-only:
 * the toggle is never clicked on the server.
 */
export function useLocaleSwitchScroll(): void {
  if (import.meta.server) return

  const stop = installLocaleSwitchScroll({
    router: useRouter(),
    hooks: useNuxtApp().hooks,
    scrollTo: top => window.scrollTo({ top, left: 0, behavior: 'instant' }),
  })
  onScopeDispose(stop)
}
