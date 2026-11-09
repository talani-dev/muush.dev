import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { FaqLocale } from '@/features/faq/data/types'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'
import { faqTextSegments } from './faqSegments'
import { type FaqContentDeps, resolveFaqContent } from './useFaqContent'

/**
 * Feature 51 · data-model § 3. A fake `t` over the locale file read from
 * disk (rules.md § R27) and a fake route map: what is tested is this
 * module's resolution, not vue-i18n or the router.
 */
const PATHS: Record<FaqLocale, Record<string, string>> = {
  es: { privacy: '/es/privacidad', about: '/es/nosotros' },
  en: { privacy: '/en/privacy', about: '/en/about' },
}

function readJson(...segments: string[]): unknown {
  return JSON.parse(readFileSync(join(process.cwd(), ...segments), 'utf8'))
}

function deps(locale: FaqLocale): FaqContentDeps {
  const messages = readJson('i18n', 'locales', `${locale}.json`)
  return {
    locale,
    t: (key, params = {}) => {
      const message = key
        .split('.')
        .reduce<unknown>(
          (node, part) => (node as Record<string, unknown>)[part],
          messages
        )
      return String(message).replaceAll(
        /\{(\w+)\}/g,
        (whole, name: string) => params[name] ?? whole
      )
    },
    localePath: ({ name, hash }) => `${PATHS[locale][name]}${hash ?? ''}`,
  }
}

for (const locale of ['es', 'en'] as const) {
  const content = resolveFaqContent(deps(locale))
  const questions = content.topics.flatMap(topic => topic.questions)
  const approved = readJson(
    'tests',
    'fixtures',
    `faq-approved.${locale}.json`
  ) as {
    temas: {
      id: string
      preguntas: { pregunta: string; respuesta: string }[]
    }[]
  }

  describe(`resolveFaqContent · ${locale}`, () => {
    it('should number the twenty questions 1 to 20 in page order when resolved', () => {
      expect(questions.map(q => q.number)).toEqual(
        Array.from({ length: 20 }, (_, index) => index + 1)
      )
      expect(new Set(questions.map(q => q.id)).size).toBe(20)
    })

    it('should give every answer the approved text when resolved as plain text', () => {
      expect(questions.map(q => q.question)).toEqual(
        approved.temas.flatMap(t => t.preguntas.map(p => p.pregunta))
      )
      expect(questions.map(q => q.answerText)).toEqual(
        approved.temas.flatMap(t => t.preguntas.map(p => p.respuesta))
      )
    })

    it('should carry the locale anchors and the neutral tracking ids when resolved', () => {
      expect(content.topics.map(topic => topic.anchor)).toEqual(
        approved.temas.map(tema => tema.id)
      )
      expect(content.topics[4]?.trackingId).toBe('work_with_muush')
    })

    it('should link the privacy and about answers through the route map when resolved', () => {
      const links = questions.flatMap(q =>
        q.answer.filter(segment => segment.kind === 'link')
      )

      expect(links.map(link => link.href)).toEqual([
        PATHS[locale].privacy,
        `${PATHS[locale].about}#trabaja-con-muush`,
      ])
    })

    it('should make the address a tracked mail link in question 19 and the card when resolved', () => {
      const emailIn = (segments: readonly { kind: string }[]) =>
        segments.filter(segment => segment.kind === 'email')
      const expected = {
        kind: 'email',
        text: 'support@muush.dev',
        href: 'mailto:support@muush.dev',
        trackAttrs: {
          'data-track': 'contact_click',
          'data-track-location': 'faq',
          'data-track-channel': 'email',
        },
      }

      expect(emailIn(questions[18]?.answer ?? [])).toEqual([expected])
      expect(emailIn(content.card.text)).toEqual([expected])
      expect(
        questions.filter(q => emailIn(q.answer).length > 0).map(q => q.number)
      ).toEqual([19])
    })

    it('should give the card one booking button tracked as a faq call when resolved', () => {
      expect(content.card.button).toEqual({
        label: locale === 'es' ? 'Agenda una llamada' : 'Book a call',
        href: CALL_BOOKING_URL,
        trackAttrs: {
          'data-track': 'book_call_click',
          'data-track-location': 'faq',
        },
      })
    })
  })
}

describe('faqTextSegments', () => {
  it('should keep a placeholder with no segment as text when split', () => {
    expect(faqTextSegments('a {x} b', {})).toEqual([
      { kind: 'text', text: 'a {x} b' },
    ])
  })

  it('should drop empty text runs around a placeholder when split', () => {
    expect(
      faqTextSegments('{about}', {
        about: { kind: 'link', text: 'About', href: '/en/about' },
      })
    ).toEqual([{ kind: 'link', text: 'About', href: '/en/about' }])
  })
})
