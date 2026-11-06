import { getCurrentScope, onScopeDispose, readonly, ref } from 'vue'
/* 1024 px, Tailwind's `lg`: shared since feature 44 (`app/shared/data/layout.ts`). */
import { DESKTOP_MEDIA_QUERY } from '@/shared/data/layout'

/**
 * The mobile menu's state: the open flag, the background scroll lock, the
 * Escape listener and the two lifecycle triggers that close it on their own.
 *
 * It lives here rather than inside `SiteHeader` because a lock that
 * outlives its panel leaves the whole site unscrollable with nothing on
 * screen to blame — the failure this composable exists to make impossible
 * (spec FR-009, FR-028, FR-029).
 *
 * **No new dependency.** VueUse would have supplied `useScrollLock` and
 * `onKeyStroke`, and it is not in the tree; adding a supply-chain surface for
 * this much code is what Constitution Article VIII forbids (research § R5).
 *
 * **The state is module-scoped on purpose.** A document has exactly one such
 * surface, and two independent instances would desynchronise the lock from
 * the flag. The layout reads `isOpen` to mark everything behind the panel
 * `inert`, while `SiteHeader` and `MobileMenu` own the controls that flip
 * it. During prerendering nothing opens the menu, so the shared flag is
 * `false` for every generated page.
 */

/**
 * Why the menu last closed (feature 43, spec FR-020, data-model § 7).
 * `dismiss` (Cerrar, Esc, history, resize to desktop) sends focus back to the
 * menu button; `navigate` (a link or the language chosen) leaves focus to
 * the navigation that follows.
 */
export type MenuCloseReason = 'dismiss' | 'navigate'

const isOpen = ref(false)
const lastCloseReason = ref<MenuCloseReason | null>(null)

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

/**
 * `instant`, because `html` scrolls smoothly when motion is allowed (feature
 * 43, research R5): without it the restore would visibly glide down from
 * the top of the page instead of putting the visitor back where they were.
 */
function releaseScroll() {
  const { style } = document.body
  style.position = ''
  style.top = ''
  style.left = ''
  style.right = ''
  window.scrollTo({ top: lockedScrollY, left: 0, behavior: 'instant' })
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

function close(reason: MenuCloseReason = 'dismiss') {
  if (!isOpen.value) return

  lastCloseReason.value = reason
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
  if (getCurrentScope()) onScopeDispose(() => close())

  return {
    isOpen: readonly(isOpen),
    lastCloseReason: readonly(lastCloseReason),
    open,
    close,
  }
}
