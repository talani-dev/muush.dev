import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { ResolvedSocial } from '@/features/shell/data/types'
import SocialIcon from '@/shared/ui/SocialIcon.vue'
import SocialLinks from './SocialLinks.vue'

/** Feature 43 · FR-017, FR-033, FR-035, contract § 7. */
const SOCIALS: ResolvedSocial[] = [
  {
    network: 'linkedin',
    href: 'https://www.linkedin.com/company/muush-dev',
    label: 'LinkedIn',
  },
  {
    network: 'instagram',
    href: 'https://www.instagram.com/muush.dev',
    label: 'Instagram',
  },
  {
    network: 'tiktok',
    href: 'https://www.tiktok.com/@muush.dev',
    label: 'TikTok',
  },
]

function render(size: 'menu' | 'footer') {
  return mount(SocialLinks, { props: { socials: SOCIALS, size } })
}

describe('SocialLinks', () => {
  it('should name every button after its network when rendered', () => {
    const links = render('menu').findAll('a')

    expect(links.map(link => link.attributes('aria-label'))).toEqual([
      'LinkedIn',
      'Instagram',
      'TikTok',
    ])
  })

  it('should open each profile in a new tab with the opener severed when rendered', () => {
    for (const [index, link] of render('footer').findAll('a').entries()) {
      expect(link.attributes('href')).toBe(SOCIALS[index]?.href)
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toBe('noopener noreferrer')
    }
  })

  it('should place the real brand glyph in Blanco when rendered', () => {
    const wrapper = render('menu')
    const icons = wrapper.findAllComponents(SocialIcon)

    expect(icons.map(icon => icon.props('network'))).toEqual([
      'linkedin',
      'instagram',
      'tiktok',
    ])
    expect(wrapper.find('a').classes()).toContain('text-blanco')
  })

  it('should be the filled 48 px buttons centred when placed in the menu', () => {
    const wrapper = render('menu')

    expect(wrapper.find('ul').classes()).toEqual(
      expect.arrayContaining(['justify-center', 'gap-red-menu-gap'])
    )
    expect(wrapper.find('a').classes()).toEqual(
      expect.arrayContaining([
        'size-red-menu',
        'bg-nav-fondo',
        'rounded-control',
        'border-linea-fuerte',
      ])
    )
  })

  it('should be the outlined 44 px buttons when placed in the footer', () => {
    const wrapper = render('footer')
    const link = wrapper.find('a')

    expect(wrapper.find('ul').classes()).toContain('gap-red-footer-gap')
    expect(link.classes()).toContain('size-red-footer')
    expect(link.classes()).not.toContain('bg-nav-fondo')
  })
})
