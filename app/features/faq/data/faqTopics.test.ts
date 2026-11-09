import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'
import { FAQ_TOPIC_IDS } from '@/shared/data/trackingEvents'
import { FAQ_CARD, FAQ_EMAIL_TRACK, FAQ_TOPICS } from './faqTopics'

/** Feature 51 · data-model § 2. Locale files read from disk (§ R27). */
function readJson(...segments: string[]): unknown {
  return JSON.parse(readFileSync(join(process.cwd(), ...segments), 'utf8'))
}

function at(source: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (node, key) =>
        node && typeof node === 'object'
          ? (node as Record<string, unknown>)[key]
          : undefined,
      source
    )
}

const LOCALES = ['es', 'en'] as const

describe('faqTopics', () => {
  it('should hold twenty questions in five topics of 5, 5, 4, 3 and 3 when read', () => {
    expect(FAQ_TOPICS.map(topic => topic.questions.length)).toEqual([
      5, 5, 4, 3, 3,
    ])
    expect(FAQ_TOPICS.map(topic => topic.number)).toEqual([
      '01',
      '02',
      '03',
      '04',
      '05',
    ])
  })

  it('should use the approved topic ids as anchors, unique per locale, when read', () => {
    for (const locale of LOCALES) {
      const approved = readJson(
        'tests',
        'fixtures',
        `faq-approved.${locale}.json`
      ) as { temas: { id: string }[] }
      const anchors = FAQ_TOPICS.map(topic => topic.anchor[locale])

      expect(anchors).toEqual(approved.temas.map(tema => tema.id))
      expect(new Set(anchors).size).toBe(anchors.length)
    }
  })

  it('should report the locale-neutral topic ids in page order when read', () => {
    expect(FAQ_TOPICS.map(topic => topic.trackingId)).toEqual([
      ...FAQ_TOPIC_IDS,
    ])
  })

  it('should point every key at a string in both locales when read', () => {
    for (const locale of LOCALES) {
      const copy = readJson('i18n', 'locales', `${locale}.json`)
      const keys = FAQ_TOPICS.flatMap(topic => [
        topic.titleKey,
        ...topic.questions.flatMap(q => [q.questionKey, q.answerKey]),
      ])

      for (const key of keys) {
        expect(typeof at(copy, key), `${locale} ${key}`).toBe('string')
      }
    }
  })

  it('should name each link and the address in its answer in both locales when read', () => {
    for (const locale of LOCALES) {
      const copy = readJson('i18n', 'locales', `${locale}.json`)

      for (const q of FAQ_TOPICS.flatMap(topic => topic.questions)) {
        const answer = String(at(copy, q.answerKey))
        for (const link of q.links ?? []) {
          expect(answer, q.answerKey).toContain(`{${link.placeholder}}`)
          expect(typeof at(copy, link.labelKey)).toBe('string')
        }
        expect(answer.includes('{email}'), q.answerKey).toBe(Boolean(q.email))
      }
    }
  })

  it('should send the talent-pool link to the join section of About when read', () => {
    const [link] = FAQ_TOPICS[4]?.questions[0]?.links ?? []

    expect(link?.destination).toEqual({
      name: 'about',
      anchor: 'trabaja-con-muush',
    })
    expect(FAQ_TOPICS[3]?.questions[2]?.links?.[0]?.destination).toEqual({
      name: 'privacy',
    })
  })

  it('should track the card button as a faq call booking and the mail links as faq email contacts when read', () => {
    expect(FAQ_CARD.href).toBe(CALL_BOOKING_URL)
    expect(FAQ_CARD.track).toEqual({
      name: 'book_call_click',
      params: { cta_location: 'faq' },
    })
    expect(FAQ_EMAIL_TRACK).toEqual({
      name: 'contact_click',
      params: { channel: 'email', cta_location: 'faq' },
    })
  })
})
