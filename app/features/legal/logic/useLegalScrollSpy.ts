import { onMounted, onScopeDispose, type Ref, readonly, ref } from 'vue'
import { pickActiveSection } from './activeSection'

/**
 * The scroll-spy behind the desktop index (feature 48, pen-extract-48 § 3:
 * "the active entry follows the section in view").
 *
 * The reading line sits a third of the way down the viewport, below the
 * floating header (`html`'s `scroll-padding-top`, the header offset token).
 * A runtime threshold, not a visual value.
 *
 * One passive scroll listener, coalesced to one measurement per frame; at
 * most fourteen rectangles are read. Added after mount, never during
 * prerender, where the first section is current.
 */
const READING_LINE_RATIO = 1 / 3
/** Slack for sub-pixel scroll positions at the very bottom. */
const BOTTOM_SLACK_PX = 2

function readingLine(): number {
  const header = Number.parseFloat(
    getComputedStyle(document.documentElement).scrollPaddingTop
  )
  const offset = Number.isFinite(header) ? header : 0
  return offset + (window.innerHeight - offset) * READING_LINE_RATIO
}

function isAtBottom(): boolean {
  const { scrollHeight } = document.documentElement
  return window.innerHeight + window.scrollY >= scrollHeight - BOTTOM_SLACK_PX
}

export function useLegalScrollSpy(ids: readonly string[]): {
  activeId: Readonly<Ref<string | null>>
} {
  const activeId = ref<string | null>(ids[0] ?? null)
  let frame = 0

  function measure() {
    frame = 0
    const sections = ids.flatMap(id => {
      const element = document.getElementById(id)
      return element ? [{ id, top: element.getBoundingClientRect().top }] : []
    })
    activeId.value =
      pickActiveSection(sections, readingLine(), isAtBottom()) ?? activeId.value
  }

  function onScroll() {
    if (frame === 0) frame = requestAnimationFrame(measure)
  }

  onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    measure()
  })

  onScopeDispose(() => {
    if (typeof window === 'undefined') return
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    if (frame !== 0) cancelAnimationFrame(frame)
  })

  return { activeId: readonly(activeId) }
}
