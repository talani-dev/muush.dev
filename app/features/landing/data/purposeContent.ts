/**
 * Propósito's content model: the keys it renders, the three Golden Circle
 * nodes, and the shape `logic/` hands `ui/`.
 *
 * This file imports **nothing**. It holds keys and one node list — no copy, no
 * destination and no logic (Articles II and VI).
 *
 * The section has no destination at all: the cards are not links
 * (`ui-map.md` § 4), and each node's trigger reveals a card rather than going
 * anywhere. So unlike `heroContent.ts` there is no `PURPOSE_DESTINATIONS`
 * record to fill — nothing here is blocked on a decision.
 */

/** The two standalone keys. Keys, never copy (Article VI). */
export const PURPOSE_KEYS = {
  eyebrow: 'landing.purpose.eyebrow',
  /** The carousel's accessible name below `lg` (`ui-map.md` § Accesibilidad). */
  carouselLabel: 'landing.purpose.carouselLabel',
} as const

/** The three blocks, in the Golden Circle's own order. */
export type PurposeNodeId = 'why' | 'how' | 'what'

export interface PurposeNodeKeys {
  id: PurposeNodeId
  /**
   * `index` is the whole of what distinguishes the three nodes on desktop: it
   * generates the radar's horizontal offset, the connector line's length and
   * nothing else. The constellation passes it to CSS as `--i` and every
   * horizontal measurement falls out of one formula, so the design's
   * 394 / 244 / 94 never appear as literals (spec FR-014).
   */
  index: 0 | 1 | 2
  labelKey: string
  copyKey: string
}

/**
 * ⚠️ The three labels read `Why`, `How`, `What` in **both** locales, on
 * purpose. Read from the `.pen` on 2026-09-08: the ES and EN frames both draw
 * English. It is the same case as `landing.hero.eyebrow`
 * (`Technology solution studio`), which Roberto confirmed stays English, and
 * `tests/landing-copy.test.ts` holds the two files identical for these three
 * keys so a later translation sweep cannot "fix" them.
 *
 * `content.md`'s block headings (`WHY · por qué existe muush`) are section
 * titles in a document, not the label the design draws.
 */
export const PURPOSE_NODES: readonly PurposeNodeKeys[] = [
  {
    id: 'why',
    index: 0,
    labelKey: 'landing.purpose.why.label',
    copyKey: 'landing.purpose.why.copy',
  },
  {
    id: 'how',
    index: 1,
    labelKey: 'landing.purpose.how.label',
    copyKey: 'landing.purpose.how.copy',
  },
  {
    id: 'what',
    index: 2,
    labelKey: 'landing.purpose.what.label',
    copyKey: 'landing.purpose.what.copy',
  },
]

/** One node, already translated. */
export interface PurposeNodeContent {
  id: PurposeNodeId
  index: 0 | 1 | 2
  label: string
  /**
   * ⚠️ `what`'s copy is the **same approved sentence** as
   * `landing.hero.subhead`. Both are approved copy in `content.md`
   * § *Propósito · Golden Circle* and § *Tagline*, so it ships as written and
   * the duplication is reported rather than deduplicated — two roles and one
   * string. `tests/landing-copy.test.ts` asserts the equality per locale so
   * neither key can drift without the other noticing.
   */
  copy: string
}

/** What `logic/` hands `ui/`: already translated, nothing left to resolve. */
export interface PurposeContent {
  eyebrow: string
  carouselLabel: string
  nodes: PurposeNodeContent[]
}
