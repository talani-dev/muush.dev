import { describe, expect, it } from 'vitest'
import { HOW_WE_WORK_KEYS, PROCESS_STEPS } from './howWeWorkContent'
import { keysOf, messageAt, readLocale } from './localeKeys.testing'

/** Feature 44 · FR-018, FR-022, data-model §§ 4–5; pen extract-44 § 4. */
describe('PROCESS_STEPS', () => {
  it('should number the five steps with their commitment icons in order when read', () => {
    expect(
      PROCESS_STEPS.map(step => [step.key, step.number, step.icon])
    ).toEqual([
      ['assessment', '01', 'message-circle-warning'],
      ['proposal', '02', 'sliders-horizontal'],
      ['design', '03', 'user-round'],
      ['build', '04', 'file-text'],
      ['launch', '05', 'key-round'],
    ])
  })

  it('should give only the assessment a short mobile description when read', () => {
    expect(
      PROCESS_STEPS.filter(step => step.hasShort).map(step => step.key)
    ).toEqual(['assessment'])
  })
})

describe('HOW_WE_WORK_KEYS', () => {
  const allKeys = [
    ...keysOf(HOW_WE_WORK_KEYS),
    ...PROCESS_STEPS.flatMap(step => [
      HOW_WE_WORK_KEYS.stepTitle(step.key),
      HOW_WE_WORK_KEYS.stepDescription(step.key),
      HOW_WE_WORK_KEYS.stepCommitment(step.key),
      ...(step.hasShort
        ? [HOW_WE_WORK_KEYS.stepDescriptionShort(step.key)]
        : []),
    ]),
  ]

  for (const locale of ['es', 'en'] as const) {
    it(`should resolve every key to a non-empty string when the ${locale} locale is read`, () => {
      const tree = readLocale(locale)

      for (const key of allKeys) {
        const message = messageAt(tree, key)
        expect(typeof message, key).toBe('string')
        expect((message as string).length, key).toBeGreaterThan(0)
      }
    })
  }

  it('should make the short sentence the start of the full one when both exist', () => {
    for (const locale of ['es', 'en'] as const) {
      const tree = readLocale(locale)
      const full = messageAt(
        tree,
        HOW_WE_WORK_KEYS.stepDescription('assessment')
      )
      const short = messageAt(
        tree,
        HOW_WE_WORK_KEYS.stepDescriptionShort('assessment')
      )
      expect((full as string).startsWith(short as string), locale).toBe(true)
    }
  })
})
