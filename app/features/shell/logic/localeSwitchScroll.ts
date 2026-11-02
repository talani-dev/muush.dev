/**
 * Where the visitor is, in terms that survive a language switch (feature
 * 43, spec FR-061, "Language switch keeps position", Roberto 2026-11-01).
 *
 * The two locales render the same page with different copy, so every
 * section has a different height in each. An absolute `scrollY` would land
 * the visitor somewhere else; a URL fragment (the old behaviour) would send
 * them back to whichever section they last jumped to, not where they
 * scrolled since. What carries over is **which anchored section the reading
 * line is in and how far through it**: the ids are the same in both locales
 * (`app/shared/data/sectionAnchors.ts`), the heights are not.
 *
 * The reading line is the floating header's lower edge (`html`'s
 * `scroll-padding-top`, the same line the scroll-spy and the in-page jumps
 * use), so a section reached through its nav link is at progress 0 and is
 * restored exactly there.
 *
 * When the line is in no anchored section (the hero, the footer, a gap),
 * the page's relative scroll position is used instead: 0 at the top, 1 at
 * the bottom. The snapshot always carries that ratio, so a section missing
 * on the destination page still resolves somewhere sensible.
 *
 * Everything below `readScrollGeometry` is pure: measurements in, numbers
 * out, unit-tested without a DOM.
 */

/** An anchored section, measured relative to the viewport's top edge. */
export interface AnchorBox {
  id: string
  /** `getBoundingClientRect().top`: negative once scrolled past. */
  top: number
  height: number
}

/** The measurements a snapshot is taken from and resolved against. */
export interface ScrollGeometry {
  /** How far the page is scrolled. */
  scrollTop: number
  /** The largest `scrollTop` the page allows (document minus viewport). */
  scrollRange: number
  /** The reading line, measured down from the viewport's top edge. */
  readingLine: number
  anchors: readonly AnchorBox[]
}

export interface ScrollSnapshot {
  /** The anchored section the reading line is in, and how far through it. */
  anchor?: { id: string; progress: number }
  /** The page's relative scroll position, 0 (top) to 1 (bottom). */
  ratio: number
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

/**
 * The anchored section containing the reading line. Sections may nest; the
 * one starting last (the innermost) wins.
 */
function anchorAtLine(geometry: ScrollGeometry): AnchorBox | undefined {
  let found: AnchorBox | undefined
  for (const box of geometry.anchors) {
    if (box.height <= 0) continue
    const contains =
      box.top <= geometry.readingLine &&
      geometry.readingLine < box.top + box.height
    if (contains && (!found || box.top >= found.top)) found = box
  }
  return found
}

/** Where the visitor is now, independent of the page's absolute height. */
export function captureScrollSnapshot(
  geometry: ScrollGeometry
): ScrollSnapshot {
  const ratio =
    geometry.scrollRange > 0
      ? clamp(geometry.scrollTop / geometry.scrollRange, 0, 1)
      : 0
  const box = anchorAtLine(geometry)
  if (!box) return { ratio }

  return {
    anchor: {
      id: box.id,
      progress: clamp((geometry.readingLine - box.top) / box.height, 0, 1),
    },
    ratio,
  }
}

/**
 * The `scrollTop` that puts the visitor back at `snapshot` on the page
 * measured by `geometry`: the same section at the same progress through it,
 * or, failing that, the same relative position on the page.
 */
export function resolveScrollTop(
  snapshot: ScrollSnapshot,
  geometry: ScrollGeometry
): number {
  const range = Math.max(geometry.scrollRange, 0)
  const box = snapshot.anchor
    ? geometry.anchors.find(
        candidate =>
          candidate.id === snapshot.anchor?.id && candidate.height > 0
      )
    : undefined

  if (box && snapshot.anchor) {
    const lineInSection = box.top + snapshot.anchor.progress * box.height
    const target = geometry.scrollTop + lineInSection - geometry.readingLine
    return clamp(Math.round(target), 0, range)
  }

  return clamp(Math.round(snapshot.ratio * range), 0, range)
}

/**
 * The anchored sections: every `<section>` with an id inside `<main>`. Form
 * fields carry ids too, so a bare `[id]` would anchor to an input.
 */
const ANCHORED_SECTIONS = 'main section[id]'

/**
 * Measures the live page. Everything is read from bounding rects relative to
 * the viewport, not from `window.scrollY`, because the mobile menu's scroll
 * lock fixes `body` at `top: -scrollY` and resets `scrollY` to 0: the rects
 * are the same whether the lock is on or not, so a switch pressed inside the
 * open menu captures the page behind it, not the top.
 */
export function readScrollGeometry(
  doc: Document = document,
  win: Window = window
): ScrollGeometry {
  const body = doc.body.getBoundingClientRect()
  const readingLine = Number.parseFloat(
    win.getComputedStyle(doc.documentElement).scrollPaddingTop
  )

  return {
    scrollTop: Math.max(-body.top, 0),
    scrollRange: Math.max(body.height - win.innerHeight, 0),
    readingLine: Number.isFinite(readingLine) ? readingLine : 0,
    anchors: Array.from(doc.querySelectorAll<HTMLElement>(ANCHORED_SECTIONS))
      .filter(element => element.id !== '')
      .map(element => {
        const rect = element.getBoundingClientRect()
        return { id: element.id, top: rect.top, height: rect.height }
      }),
  }
}

/** A held position and the navigation it belongs to. */
export interface HeldPosition {
  /** The toggle's `href`: the other locale's equivalent path. */
  destination: string
  snapshot: ScrollSnapshot
}

/*
 * The position held between the toggle's click and the router's first guard
 * for the navigation it starts. Client-only: it is written by a click and
 * read by a router guard, neither of which exists on the server.
 */
let held: HeldPosition | null = null

/**
 * Called by the language toggle on a plain click that navigates (not on
 * the 404's in-place switch, which never leaves the page), with the
 * destination it navigates to. Measured synchronously, inside the click,
 * before the router has changed anything.
 */
export function holdLocaleSwitchPosition(destination: string): void {
  held = { destination, snapshot: captureScrollSnapshot(readScrollGeometry()) }
}

/**
 * Hands the held position over once, and forgets it, so a hold the next
 * navigation does not match can never leak into a later one.
 */
export function takeHeldLocaleSwitchPosition(): HeldPosition | null {
  const position = held
  held = null
  return position
}

const pathOf = (url: string) =>
  url.split(/[?#]/, 1)[0]?.replace(/\/+$/, '') || '/'

/** Whether a navigation to `path` is the one `position` was held for. */
export function isHeldFor(position: HeldPosition, path: string): boolean {
  return pathOf(position.destination) === pathOf(path)
}
