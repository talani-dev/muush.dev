/**
 * Pure helpers of the Preguntas topics (feature 51, spec FR-010, FR-011,
 * FR-013; research R3). No Vue, no DOM, no Nuxt: unit-tested directly.
 */

/**
 * The topic a URL fragment names, or `null` when it names none (empty,
 * unknown, malformed). The caller selects topic 01 for `null` (FR-011) and
 * leaves the language switch without a fragment (FR-013, Edge Cases).
 * Accepts the fragment with or without its `#`, percent-encoded or not.
 */
export function topicIndexFromHash(
  hash: string,
  anchors: readonly string[]
): number | null {
  const fragment = decodeFragment(hash.replace(/^#/, ''))
  if (fragment === '') return null
  const index = anchors.indexOf(fragment)
  return index === -1 ? null : index
}

function decodeFragment(fragment: string): string {
  try {
    return decodeURIComponent(fragment)
  } catch {
    return fragment
  }
}

/**
 * The tab a key moves to (the WAI-ARIA tabs pattern, as `useMapRegion`):
 * ArrowLeft / ArrowRight wrap, Home and End jump to the ends, any other
 * key is `null` and left to the browser.
 */
export function nextTabIndex(
  current: number,
  key: string,
  count: number
): number | null {
  const last = count - 1
  const targets: Record<string, number> = {
    ArrowRight: current >= last ? 0 : current + 1,
    ArrowLeft: current <= 0 ? last : current - 1,
    Home: 0,
    End: last,
  }
  return targets[key] ?? null
}

/**
 * The fragment the language switch carries for the named topic: the same
 * topic, by position, in the other locale's anchors (`#precios` →
 * `#pricing`). `undefined` when no topic is named, so the switch behaves as
 * on every other page.
 */
export function counterpartAnchor(
  index: number | null,
  otherAnchors: readonly string[]
): string | undefined {
  if (index === null) return undefined
  return otherAnchors[index]
}
