import { describe, expect, it } from 'vitest'
import { SECTION_ANCHORS } from '@/shared/data/sectionAnchors'

/** Feature 43 · spec FR-025, data-model § 1. */
describe('SECTION_ANCHORS', () => {
  it('should declare exactly the four section ids when read', () => {
    expect(SECTION_ANCHORS).toEqual({
      services: 'servicios',
      howWeWork: 'como-trabajamos',
      assessment: 'diagnostico',
      workWithUs: 'trabaja-con-muush',
    })
  })

  it('should keep every id unique when read', () => {
    const ids = Object.values(SECTION_ANCHORS)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('should keep every id URL-safe and hash-free when read', () => {
    for (const id of Object.values(SECTION_ANCHORS)) {
      expect(id).toMatch(/^[a-z-]+$/)
    }
  })
})
