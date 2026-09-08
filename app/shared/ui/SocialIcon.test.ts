import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SocialIcon, { type SocialNetwork } from '@/shared/ui/SocialIcon.vue'

const profile = {
  href: 'https://instagram.com/muush.dev',
  label: 'Instagram de muush',
}

/** Each normalized asset carries a `<title>` naming its network. */
const titleByNetwork: Record<SocialNetwork, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  tiktok: 'TikTok',
}

/**
 * The component's template opens with a `biome-ignore` comment, so Vue's
 * root vnode is a fragment of [comment, anchor]. Attribute fallthrough is
 * unaffected — Vue skips comments when it resolves the single root — but the
 * assertions below have to reach for the anchor rather than for the wrapper.
 */
describe('SocialIcon', () => {
  it('should announce the caller-supplied name when rendered', () => {
    const link = mount(SocialIcon, {
      props: { network: 'instagram', ...profile },
    }).find('a')

    expect(link.attributes('aria-label')).toBe('Instagram de muush')
  })

  it('should open the destination safely when rendered', () => {
    const link = mount(SocialIcon, {
      props: { network: 'instagram', ...profile },
    }).find('a')

    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe(profile.href)
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
  })

  for (const [network, title] of Object.entries(titleByNetwork)) {
    it(`should inline its own glyph when the network is ${network}`, () => {
      const wrapper = mount(SocialIcon, {
        props: { network: network as SocialNetwork, ...profile },
      })

      expect(wrapper.find('svg').exists()).toBe(true)
      expect(wrapper.find('img').exists()).toBe(false)
      expect(wrapper.find('title').text()).toBe(title)
    })
  }

  it('should let the glyph inherit its colour when rendered', () => {
    const wrapper = mount(SocialIcon, {
      props: { network: 'tiktok', ...profile },
    })

    expect(wrapper.find('a').classes()).toContain('text-bone-100')
    expect(wrapper.html()).toContain('currentColor')
    expect(wrapper.html()).not.toMatch(/#f{3,6}\b/i)
  })

  it('should hide the glyph wrapper from assistive technology when rendered', () => {
    const wrapper = mount(SocialIcon, {
      props: { network: 'linkedin', ...profile },
    })

    const wrapperSpan = wrapper.find('[aria-hidden="true"]')
    expect(wrapperSpan.exists()).toBe(true)
    expect(wrapperSpan.find('svg').exists()).toBe(true)
  })

  it('should carry the 48 square geometry of the design when rendered', () => {
    const link = mount(SocialIcon, {
      props: { network: 'linkedin', ...profile },
    }).find('a')

    for (const expected of [
      'size-social',
      'rounded-icon',
      'border',
      'border-glass-line',
      'bg-glass-dark',
    ]) {
      expect(link.classes()).toContain(expected)
    }
    expect(link.find('[aria-hidden="true"]').classes()).toContain(
      'size-social-glyph'
    )
  })

  it('should offer a pointer when rendered', () => {
    /* `href` is required, so it is always clickable. Declared rather than
       inherited from the user-agent sheet, so this and the two glass
       `<button>`s of the mobile menu behave identically under the pointer
       (`findings.md` § R56). */
    const link = mount(SocialIcon, {
      props: { network: 'linkedin', ...profile },
    }).find('a')

    expect(link.classes()).toContain('cursor-pointer')
  })
})
