import { onBeforeUnmount, onMounted, type Ref, readonly, ref } from 'vue'
import { DESKTOP_MEDIA_QUERY } from '@/shared/data/layout'

/**
 * Whether the desktop arrangement applies (from `lg`, 1024 px), for the
 * few things CSS cannot decide alone: the map's tab-panel role only exists
 * while its tabs do (feature 44, research R5), and the timeline fills left
 * to right instead of top to bottom (R8).
 *
 * `false` on the server and until mount, so the prerendered markup is the
 * mobile-first one and the first client render agrees with it; read in
 * `onMounted` (never during prerender, Article IV) and followed live, with
 * the listener removed on unmount. Call it before registering an
 * `onMounted` of your own that reads it: hooks run in registration order.
 */
export function useDesktopLayout(): Readonly<Ref<boolean>> {
  const isDesktop = ref(false)
  let query: MediaQueryList | undefined

  function follow(event: MediaQueryListEvent) {
    isDesktop.value = event.matches
  }

  onMounted(() => {
    query = window.matchMedia(DESKTOP_MEDIA_QUERY)
    isDesktop.value = query.matches
    query.addEventListener('change', follow)
  })

  onBeforeUnmount(() => {
    query?.removeEventListener('change', follow)
  })

  return readonly(isDesktop)
}
