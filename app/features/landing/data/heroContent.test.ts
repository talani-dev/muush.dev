import { describe, expect, it } from 'vitest'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'
import { HERO_DESTINATIONS, HERO_KEYS } from './heroContent'

/**
 * The Hero's two destinations, asserted where they are decided.
 *
 * `HeroSection.test.ts` proves the component renders whichever branch its props
 * select; it takes fixtures, so it can say nothing about which branch the site
 * actually ships. That is decided here, in one record, and this is what stops a
 * refactor returning the secondary call to action to its inert branch without a
 * single test going red.
 */
describe('hero destinations', () => {
  it('should point the secondary call to action at the shared booking URL', () => {
    /* `decisions-open.md` #2, resolved 2026-09-07. Absent, the Hero falls to
       the grey inert `<span>` with no arrow — which is exactly the state
       Roberto reported as "the text should be white" and "the arrow is
       missing". Both symptoms are this one key. */
    expect(HERO_DESTINATIONS.callUrl).toBe(CALL_BOOKING_URL)
  })

  it('should leave the primary call to action without a destination while section 05 does not exist', () => {
    /* Not an oversight and not fillable with a substitute: no `mailto:`, no
       WhatsApp, no scroll to an arbitrary position (spec FR-014). While it is
       absent the control is a real `<button>` that emits no fragment. */
    expect(HERO_DESTINATIONS.contactHash).toBeUndefined()
  })

  it('should keep the arrow out of the secondary label key', () => {
    /* `LinkArrow` owns the glyph so the hover has something to move. A `→`
       baked into the copy would render twice now that the control is live
       (`rules.md` § R50). */
    expect(HERO_KEYS.ctaSecondary).toBe('landing.hero.ctaSecondary')
    expect(HERO_KEYS.ctaSecondary).not.toContain('→')
  })
})
