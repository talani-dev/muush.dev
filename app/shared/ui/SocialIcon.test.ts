import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SocialIcon, { type SocialNetwork } from '@/shared/ui/SocialIcon.vue'

/** Feature 43 · FR-037, contract § 1. */
const NETWORKS: [SocialNetwork, string][] = [
  ['linkedin', 'LinkedIn'],
  ['instagram', 'Instagram'],
  ['tiktok', 'TikTok'],
]

describe('SocialIcon', () => {
  for (const [network, title] of NETWORKS) {
    it(`should inline the ${title} glyph when the network is ${network}`, () => {
      const html = mount(SocialIcon, { props: { network } }).html()

      expect(html).toContain(`<title>${title}</title>`)
    })
  }

  it('should paint the glyph in the current text colour when rendered', () => {
    const html = mount(SocialIcon, { props: { network: 'linkedin' } }).html()

    expect(html).toContain('fill="currentColor"')
  })

  it('should be hidden from assistive technology when rendered', () => {
    const wrapper = mount(SocialIcon, { props: { network: 'tiktok' } })

    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })
})
