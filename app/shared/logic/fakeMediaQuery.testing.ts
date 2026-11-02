import { vi } from 'vitest'

/**
 * A controllable `MediaQueryList` for component and composable tests
 * (feature 44): the match can be flipped live and its listeners counted.
 * Test-only (`.testing.ts`), never imported by application code.
 */
type MediaListener = (event: MediaQueryListEvent) => void

export class FakeMediaQuery {
  matches: boolean
  readonly media: string
  readonly listeners = new Set<MediaListener>()

  constructor(media: string, matches = false) {
    this.media = media
    this.matches = matches
  }

  addEventListener(_type: 'change', listener: MediaListener) {
    this.listeners.add(listener)
  }

  removeEventListener(_type: 'change', listener: MediaListener) {
    this.listeners.delete(listener)
  }

  set(matches: boolean) {
    this.matches = matches
    for (const listener of [...this.listeners]) {
      listener({ matches } as MediaQueryListEvent)
    }
  }
}

/**
 * Replaces `window.matchMedia` with one fake per query string, created on
 * first use with `initial[query] ?? false`. Returns the fakes and a restore.
 */
export function installMatchMedia(initial: Record<string, boolean> = {}) {
  const real = window.matchMedia
  const queries = new Map<string, FakeMediaQuery>()
  const query = (media: string) => {
    let fake = queries.get(media)
    if (!fake) {
      fake = new FakeMediaQuery(media, initial[media] ?? false)
      queries.set(media, fake)
    }
    return fake
  }
  window.matchMedia = vi.fn(
    (media: string) => query(media) as unknown as MediaQueryList
  )
  return {
    query,
    restore: () => {
      window.matchMedia = real
    },
  }
}
