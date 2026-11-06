import { onBeforeUnmount, onMounted, type Ref, readonly, ref } from 'vue'
import { activeCardIndex } from '@/features/landing/logic/carouselIndicator'

/**
 * Keeps the services carousel's indicator on the card in view (feature 44,
 * spec FR-016; research R7), whatever moves the scroller: a finger, a
 * trackpad, the keyboard or focus bringing a card into view.
 *
 * Reads the scroller on mount (so the first paint after hydration is right)
 * and on every `scroll` event, passive and coalesced to one read per frame.
 * The cards are the scroller's element children; their `offsetLeft` is
 * relative to the scroller, which must be positioned. From `lg` the scroller
 * is a grid that does not scroll and the indicator is hidden, so nothing
 * here needs to know the layout. The listener is removed on unmount.
 */
export function useCarouselIndicator(scroller: Ref<HTMLElement | null>): {
  activeIndex: Readonly<Ref<number>>
} {
  const activeIndex = ref(0)
  let frame = 0

  function measure() {
    frame = 0
    const element = scroller.value
    if (!element) return
    const cards = [...element.children] as HTMLElement[]
    activeIndex.value = activeCardIndex({
      scrollLeft: element.scrollLeft,
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      cardRightEdges: cards.map(card => card.offsetLeft + card.offsetWidth),
    })
  }

  function schedule() {
    if (frame) return
    frame = requestAnimationFrame(measure)
  }

  onMounted(() => {
    measure()
    scroller.value?.addEventListener('scroll', schedule, { passive: true })
  })

  onBeforeUnmount(() => {
    scroller.value?.removeEventListener('scroll', schedule)
    if (frame) cancelAnimationFrame(frame)
  })

  return { activeIndex: readonly(activeIndex) }
}
