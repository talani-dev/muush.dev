import {
  type ComputedRef,
  computed,
  onMounted,
  onScopeDispose,
  type Ref,
  readonly,
  ref,
  watch,
} from 'vue'
import { useDesktopLayout } from '@/shared/logic/useDesktopLayout'
import { REVEAL_ZONE_PX } from './useNavScrollReveal'

/**
 * The desktop header's idle hide (feature 45, reopen 1, Roberto
 * 2026-11-02, FR-036, FR-037). From `lg` only; below it nothing here does
 * anything and the mobile header behaves as in feature 43.
 *
 * - After `HEADER_IDLE_HIDE_MS` with no scrolling, the header hides, as a
 *   downward scroll would. Any scroll restarts the wait, but only an
 *   upward scroll, or reaching the top zone, shows it again: a downward
 *   scroll keeps it hidden (review-45 re-review 2: clearing the idle hide
 *   on every scroll let a slow downward start, under the 10 px that
 *   `useNavScrollReveal` needs, slide the header half back in).
 * - Never at the very top: within `REVEAL_ZONE_PX` of the top (the reveal
 *   zone of feature 26) no wait starts.
 * - `isHeld`: while the pointer is over the header or keyboard focus is
 *   inside it, the header shows whatever the scroll did, and no wait runs.
 *
 * The scroll listener is passive and coalesced to one check per animation
 * frame. Nothing runs before mount, so the prerendered and no-script header
 * is visible. Whether the change animates is the caller's CSS (transform
 * only, instant under reduced motion).
 */

/** Idle time before the desktop header hides (Roberto: "reasonable"; the
 * leader chose 2.5 s). */
export const HEADER_IDLE_HIDE_MS = 2500

export function useHeaderIdleHide(): {
  isIdleHidden: Readonly<Ref<boolean>>
  isHeld: ComputedRef<boolean>
  pointerEnter: () => void
  pointerLeave: () => void
  focusIn: () => void
  focusOut: (event: FocusEvent) => void
} {
  const isDesktop = useDesktopLayout()
  const isIdleHidden = ref(false)
  const hovered = ref(false)
  const focused = ref(false)
  const isHeld = computed(
    () => isDesktop.value && (hovered.value || focused.value)
  )
  let timer: ReturnType<typeof setTimeout> | null = null
  let pendingFrame: number | null = null
  let lastScrollY = 0

  function clearTimer(): void {
    if (timer !== null) clearTimeout(timer)
    timer = null
  }

  /* Starts (or restarts) the wait when it applies. */
  function schedule(): void {
    clearTimer()
    if (!isDesktop.value || isHeld.value) return
    if (window.scrollY <= REVEAL_ZONE_PX) return
    timer = setTimeout(() => {
      isIdleHidden.value = true
    }, HEADER_IDLE_HIDE_MS)
  }

  function onScrollFrame(): void {
    pendingFrame = null
    const scrollY = window.scrollY
    const movedUp = scrollY < lastScrollY
    lastScrollY = scrollY
    if (movedUp || scrollY <= REVEAL_ZONE_PX) isIdleHidden.value = false
    schedule()
  }

  function onScroll(): void {
    if (pendingFrame === null) {
      pendingFrame = requestAnimationFrame(onScrollFrame)
    }
  }

  function hold(): void {
    clearTimer()
    isIdleHidden.value = false
  }

  onMounted(() => {
    lastScrollY = window.scrollY
    window.addEventListener('scroll', onScroll, { passive: true })
    schedule()
  })

  watch(isDesktop, desktop => {
    if (desktop) return schedule()
    clearTimer()
    isIdleHidden.value = false
  })

  onScopeDispose(() => {
    window.removeEventListener('scroll', onScroll)
    clearTimer()
    if (pendingFrame !== null) cancelAnimationFrame(pendingFrame)
  })

  return {
    isIdleHidden: readonly(isIdleHidden),
    isHeld,
    pointerEnter: () => {
      hovered.value = true
      hold()
    },
    pointerLeave: () => {
      hovered.value = false
      schedule()
    },
    focusIn: () => {
      focused.value = true
      hold()
    },
    focusOut: event => {
      const header = event.currentTarget as Node | null
      const next = event.relatedTarget as Node | null
      if (header && next && header.contains(next)) return
      focused.value = false
      schedule()
    },
  }
}
