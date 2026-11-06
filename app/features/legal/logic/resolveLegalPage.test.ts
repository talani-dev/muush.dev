import { describe, expect, it } from 'vitest'
import { LEGAL_PAGES } from '@/features/legal/data/legalFixtures.testing'
import { translatorFor } from '@/features/legal/data/localeKeys.testing'
import { PRIVACY_NOTICE } from '@/features/legal/data/privacyNotice'
import { TERMS_AND_CONDITIONS } from '@/features/legal/data/termsAndConditions'
import { resolveLegalPage } from './resolveLegalPage'

const echo = (key: string) => key

describe('resolveLegalPage', () => {
  it('should resolve every block kind by its keys', () => {
    const page = resolveLegalPage(PRIVACY_NOTICE, echo, 'es')
    const kinds = page.sections.flatMap(section =>
      section.blocks.map(block => block.kind)
    )

    expect(new Set(kinds)).toEqual(
      new Set(['paragraph', 'table', 'bullets', 'steps', 'preferences'])
    )
    expect(page.headingFirst).toBe('legal.privacy.heading.first')
    expect(page.onThisPage).toBe('legal.onThisPage')
  })

  it('should omit the translation note on the Spanish page', () => {
    expect(
      resolveLegalPage(PRIVACY_NOTICE, echo, 'es').translationNote
    ).toBeUndefined()
  })

  it('should carry the translation note on the English page', () => {
    expect(resolveLegalPage(PRIVACY_NOTICE, echo, 'en').translationNote).toBe(
      'legal.translationNote'
    )
  })

  for (const locale of ['es', 'en'] as const) {
    it(`should match the generated ${locale} fixtures from the locale file`, () => {
      const t = translatorFor(locale)

      expect(resolveLegalPage(PRIVACY_NOTICE, t, locale)).toEqual(
        LEGAL_PAGES.privacy[locale]
      )
      expect(resolveLegalPage(TERMS_AND_CONDITIONS, t, locale)).toEqual(
        LEGAL_PAGES.terms[locale]
      )
    })
  }
})
