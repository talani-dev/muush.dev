import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  type Ref,
  readonly,
  ref,
  watch,
} from 'vue'
import { nextTabIndex, topicIndexFromHash } from './topicHash'

export interface FaqTopicsOptions {
  /** The topics' anchors in the active locale, in page order. */
  anchors: () => readonly string[]
  /** The DOM id stem the tabs share: a tab is `<idPrefix>-tab-<anchor>`. */
  idPrefix: string
  /** Called on every selection, automatic or not: the accordion's reset. */
  onSelect: () => void
  /**
   * The router's fragment (`route.hash`), when the page passes it. On a
   * direct load Nuxt hydrates a prerendered page at its payload path, which
   * has no fragment, and restores the real URL (fragment included) through
   * the router only after hydration: `window.location.hash` is empty at
   * mount (measured on the built site, 2026-11-08). Followed, so that
   * restore selects the topic. Without it (Storybook, tests) the window's
   * fragment is read at mount.
   */
  hash?: () => string | undefined
}

/**
 * The selected Preguntas topic (feature 51, spec FR-010…FR-013; research
 * R3). Framework-light on purpose (Vue only, no Nuxt), so `ui/` can wire it
 * and Storybook can render it.
 *
 * - Render (prerender and the first client render): topic 01, so the
 *   server HTML and hydration agree and a visitor without scripts sees
 *   topic 01 with its first answer open (OQ-7 = A).
 * - Mount, a router fragment change (`hash`) and any `hashchange`: the
 *   fragment selects its topic; an empty or unknown one selects topic 01
 *   (FR-011). The URL is not rewritten and no event is sent.
 * - A visitor's choice (`select`, the arrow keys, Home / End): the
 *   fragment becomes the topic's anchor through `history.replaceState`, so
 *   the page does not scroll, Back does not step through topics, and the
 *   router (which never sees it) sends no page view (FR-013, OQ-6 = A).
 *   The router's own history state is kept.
 *
 * `named` is the topic the URL names (a valid fragment or a choice), or
 * `null`: the language switch carries it over and nothing else does.
 */
export function useFaqTopics({
  anchors,
  idPrefix,
  onSelect,
  hash,
}: FaqTopicsOptions): {
  selected: Readonly<Ref<number>>
  named: Readonly<Ref<number | null>>
  select: (index: number) => void
  onKeydown: (event: KeyboardEvent) => void
} {
  const selected = ref(0)
  const named = ref<number | null>(null)

  function applyFragment(fragment: string) {
    const index = topicIndexFromHash(fragment, anchors())
    named.value = index
    selected.value = index ?? 0
    onSelect()
  }

  function followWindow() {
    applyFragment(window.location.hash)
  }

  onMounted(() => {
    applyFragment(hash?.() || window.location.hash)
    window.addEventListener('hashchange', followWindow)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('hashchange', followWindow)
  })

  if (hash) watch(hash, fragment => applyFragment(fragment ?? ''))

  function select(index: number) {
    const anchor = anchors()[index]
    if (anchor === undefined) return
    selected.value = index
    named.value = index
    onSelect()
    window.history.replaceState(window.history.state, '', `#${anchor}`)
  }

  function onKeydown(event: KeyboardEvent) {
    const target = nextTabIndex(selected.value, event.key, anchors().length)
    if (target === null) return
    event.preventDefault()
    select(target)
    nextTick(() => {
      document.getElementById(`${idPrefix}-tab-${anchors()[target]}`)?.focus()
    })
  }

  return {
    selected: readonly(selected),
    named: readonly(named),
    select,
    onKeydown,
  }
}
