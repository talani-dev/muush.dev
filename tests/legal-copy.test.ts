import { describe, expect, it } from 'vitest'
import { messageAt } from '@/features/legal/data/localeKeys.testing'
import { CONSENT_COPY } from '@/features/legal/ui/legalFixtures.testing'

/**
 * Feature 48 · the legal text is Roberto's (2026-11-05), transcribed from
 * the `.pen`; no agent writes or rewords it. The only edits allowed are the
 * four placeholder substitutions of pen-extract-48 § 2, asserted here in
 * both locales. Read from disk (rules.md § R27).
 */
type Locale = 'es' | 'en'

function stringsUnder(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (value === null || typeof value !== 'object') return []
  return Object.values(value).flatMap(stringsUnder)
}

const SUBSTITUTIONS: Record<Locale, [string, string][]> = {
  es: [
    ['legal.privacy.updated', 'Última actualización: 5 de noviembre de 2026'],
    ['legal.terms.updated', 'Última actualización: 5 de noviembre de 2026'],
    [
      'legal.privacy.sections.sharing.items.providers',
      'Amazon SES (envío de correos)',
    ],
    [
      'legal.privacy.sections.retention.items.browsing',
      'Datos de navegación y de píxeles: hasta 14 meses.',
    ],
    [
      'legal.privacy.sections.cookies.body',
      'Si las aceptas, también usa Meta Pixel y Google Analytics para medir visitas y anuncios.',
    ],
  ],
  en: [
    ['legal.privacy.updated', 'Last updated: November 5, 2026'],
    ['legal.terms.updated', 'Last updated: November 5, 2026'],
    [
      'legal.privacy.sections.sharing.items.providers',
      'Amazon SES (email delivery)',
    ],
    [
      'legal.privacy.sections.retention.items.browsing',
      'Browsing and pixel data: up to 14 months.',
    ],
    [
      'legal.privacy.sections.cookies.body',
      'If you accept them, it also uses Meta Pixel and Google Analytics to measure visits and ads.',
    ],
  ],
}

describe('legal copy (feature 48)', () => {
  for (const locale of ['es', 'en'] as const) {
    it(`should leave no .pen placeholder in the ${locale} legal text`, () => {
      const strings = [
        ...stringsUnder(messageAt(locale, 'legal')),
        ...stringsUnder(messageAt(locale, 'consent')),
      ]

      expect(strings.length).toBeGreaterThan(100)
      expect(strings.filter(text => /\[|\]/.test(text))).toEqual([])
    })

    it(`should apply the four pen-extract-48 § 2 substitutions in ${locale}`, () => {
      for (const [key, expected] of SUBSTITUTIONS[locale]) {
        expect(String(messageAt(locale, key)), key).toContain(expected)
      }
    })

    it(`should escape every at sign for vue-i18n in ${locale}`, () => {
      const raw = stringsUnder(messageAt(locale, 'legal'))

      expect(
        raw.filter(text => /@/.test(text.replaceAll("{'@'}", '')))
      ).toEqual([])
    })

    it(`should match the consent fixtures to the ${locale} locale file`, () => {
      const copy = CONSENT_COPY[locale]

      expect(copy.banner.title).toBe(messageAt(locale, 'consent.banner.title'))
      expect(copy.banner.body).toBe(messageAt(locale, 'consent.banner.body'))
      expect(copy.actions.save).toBe(messageAt(locale, 'consent.actions.save'))
      expect(copy.preferences.intro.link).toBe(
        messageAt(locale, 'consent.preferences.intro.link')
      )
      expect(copy.categories.map(category => category.detail)).toEqual([
        messageAt(locale, 'consent.categories.necessary.detail'),
        messageAt(locale, 'consent.categories.advertising.detail'),
      ])
    })
  }

  it('should keep the Spanish note slot equal to the English note, never shown in Spanish', () => {
    /* The `.pen` draws "Courtesy translation…" on the English frames only;
       the Spanish key exists for parity and `resolveLegalPage` omits it. */
    expect(messageAt('es', 'legal.translationNote')).toBe(
      messageAt('en', 'legal.translationNote')
    )
  })

  it('should read the intro link words inside the preferences sentence', () => {
    expect(
      [
        messageAt('es', 'consent.preferences.intro.before'),
        messageAt('es', 'consent.preferences.intro.link'),
        messageAt('es', 'consent.preferences.intro.after'),
      ].join('')
    ).toBe(
      'Elige qué cookies aceptas. Puedes cambiar tu elección cuando quieras. Lee más en nuestro aviso de privacidad.'
    )
  })
})
