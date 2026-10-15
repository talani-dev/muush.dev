import { describe, expect, it } from 'vitest'
import { SOCIAL_PROFILES } from '@/features/shell/data/socialProfiles'
import { profileUrls } from './profileUrls'

describe('profileUrls', () => {
  it('should return the three profile hrefs in record order when given SOCIAL_PROFILES', () => {
    expect(profileUrls(SOCIAL_PROFILES)).toEqual([
      SOCIAL_PROFILES[0]?.href,
      SOCIAL_PROFILES[1]?.href,
      SOCIAL_PROFILES[2]?.href,
    ])
    expect(profileUrls(SOCIAL_PROFILES)).toHaveLength(3)
  })

  it('should return an empty list when given no profiles', () => {
    expect(profileUrls([])).toEqual([])
  })
})
