/**
 * Runs `task` once the page has stopped scrolling (feature 49, section
 * timing). After a page change Nuxt scrolls the new page to its top with
 * the site's smooth scroll, starting from the old page's offset; observed
 * during that animation, sections and forms far down the new page look "in
 * view" for a few frames (measured in Chrome on the built site, 2026-11-07:
 * Home → Nosotros reported `form_view` for the application form within
 * 63 ms, while the page was still 2 846 px down).
 *
 * "Settled" is the same `scrollY` for `STILL_FRAMES` frames in a row; a page
 * that never settles (a visitor scrolling on) is observed after
 * `SETTLE_TIMEOUT_MS` anyway.
 */
export const STILL_FRAMES = 3
export const SETTLE_TIMEOUT_MS = 2000

export interface ScrollClock {
  scrollY: () => number
  nextFrame: (callback: () => void) => void
  now: () => number
}

export function whenScrollSettles(clock: ScrollClock, task: () => void): void {
  const startedAt = clock.now()
  let last = clock.scrollY()
  let still = 0

  function check() {
    const current = clock.scrollY()
    still = current === last ? still + 1 : 0
    last = current
    if (still >= STILL_FRAMES || clock.now() - startedAt >= SETTLE_TIMEOUT_MS) {
      task()
      return
    }
    clock.nextFrame(check)
  }

  clock.nextFrame(check)
}
