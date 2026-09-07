import { getCurrentScope, onScopeDispose, readonly, ref } from 'vue'

/**
 * The mobile menu's state: the open flag, the background scroll lock, the
 * Escape listener and the two lifecycle triggers that close it on their own.
 *
 * It lives here rather than inside `SiteNav` because a lock that outlives its
 * panel leaves the whole site unscrollable with nothing on screen to blame —
 * the failure this composable exists to make impossible (spec FR-009,
 * FR-028, FR-029).
 *
 * **No new dependency.** VueUse would have supplied `useScrollLock` and
 * `onKeyStroke`, and it is not in the tree; adding a supply-chain surface for
 * this much code is what Constitution Article VIII forbids (research § R5).
 *
 * **The state is module-scoped on purpose.** A document has exactly one such
 * surface, and two independent instances would desynchronise the lock from
 * the flag. The layout reads `isOpen` to mark everything behind the panel
 * `inert`, while `SiteNav` owns the controls that flip it. During
 * prerendering nothing opens the menu, so the shared flag is `false` for
 * every generated page.
 */

/**
 * 1024px — Tailwind v4's stock `lg`, so the composable and the `lg:`
 * utilities cross at the same width.
 *
 * ⚠️ UNVERIFIED: the design has exactly two frames, 390 and 1440, and no
 * document states where the layout swaps (spec A-01). Flagged for Clau;
 * reversing it is one value here and one prefix in the templates.
 */
const DESKTOP_MEDIA_QUERY = '(min-width: 64rem)'

const isOpen = ref(false)

/** Captured on open, restored exactly on close. */
let lockedScrollY = 0
let desktopQuery: MediaQueryList | undefined

function lockScroll() {
  lockedScrollY = window.scrollY
  const { style } = document.body
  style.position = 'fixed'
  style.top = `-${lockedScrollY}px`
  style.left = '0'
  style.right = '0'
}

function releaseScroll() {
  const { style } = document.body
  style.position = ''
  style.top = ''
  style.left = ''
  style.right = ''
  window.scrollTo(0, lockedScrollY)
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

/**
 * Browser back and forward. A navigation started from inside the menu closes
 * it through `close()` before it happens, and nothing outside the menu can
 * start one while the rest of the document is `inert` — so history is the
 * remaining way a route changes underneath an open panel.
 */
function handleHistoryNavigation() {
  close()
}

function handleBreakpointChange(event: MediaQueryListEvent) {
  if (event.matches) close()
}

function open() {
  if (isOpen.value) return

  lockScroll()
  window.addEventListener('keydown', handleEscape)
  window.addEventListener('popstate', handleHistoryNavigation)
  desktopQuery = window.matchMedia(DESKTOP_MEDIA_QUERY)
  desktopQuery.addEventListener('change', handleBreakpointChange)

  isOpen.value = true
}

function close() {
  if (!isOpen.value) return

  isOpen.value = false
  window.removeEventListener('keydown', handleEscape)
  window.removeEventListener('popstate', handleHistoryNavigation)
  desktopQuery?.removeEventListener('change', handleBreakpointChange)
  desktopQuery = undefined

  releaseScroll()
}

export function useMobileMenu() {
  /*
   * Disposal releases the lock. The guard inside `close()` reads the flag,
   * and the flag can never disagree with the lock because `isOpen` is exposed
   * read-only and both are written in the same two functions.
   */
  if (getCurrentScope()) onScopeDispose(close)

  return {
    isOpen: readonly(isOpen),
    open,
    close,
  }
}
