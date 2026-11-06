import type {
  LegalBlock,
  LegalPageContent,
  LegalPageModel,
  ResolvedLegalBlock,
} from '@/features/legal/data/types'

export type Translate = (key: string) => string

/**
 * The locale that prevails (`legal.translationNote`). The `.pen` draws the
 * "Courtesy translation…" note on the English frames only; on this locale's
 * page it is never shown.
 */
export const PREVAILING_LOCALE = 'es'

function resolveBlock(block: LegalBlock, t: Translate): ResolvedLegalBlock {
  switch (block.kind) {
    case 'paragraph':
      return { kind: 'paragraph', text: t(block.key) }
    case 'bullets':
    case 'steps':
      return { kind: block.kind, items: block.keys.map(key => t(key)) }
    case 'table':
      return {
        kind: 'table',
        rows: block.rows.map(row => ({
          where: t(row.whereKey),
          data: t(row.dataKey),
        })),
      }
    case 'preferences':
      return { kind: 'preferences', label: t(block.key) }
  }
}

/**
 * A legal page's model with every key translated, as a pure function of
 * `t` so it is unit-tested without a Nuxt app (feature 48).
 */
export function resolveLegalPage(
  model: LegalPageModel,
  t: Translate,
  locale: string
): LegalPageContent {
  return {
    headingFirst: t(model.headingFirstKey),
    headingSecond: t(model.headingSecondKey),
    updated: t(model.updatedKey),
    translationNote:
      locale === PREVAILING_LOCALE ? undefined : t('legal.translationNote'),
    onThisPage: t('legal.onThisPage'),
    sections: model.sections.map(section => ({
      id: section.id,
      nav: t(section.navKey),
      title: t(section.titleKey),
      blocks: section.blocks.map(block => resolveBlock(block, t)),
    })),
  }
}
