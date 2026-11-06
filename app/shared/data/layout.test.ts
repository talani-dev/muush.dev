import { describe, expect, it } from 'vitest'
import { DESKTOP_MEDIA_QUERY } from '@/shared/data/layout'

/** Feature 44 · research R5, data-model § 1. */
describe('DESKTOP_MEDIA_QUERY', () => {
  it('should match from 64rem (Tailwind lg) when read', () => {
    expect(DESKTOP_MEDIA_QUERY).toBe('(min-width: 64rem)')
  })
})
