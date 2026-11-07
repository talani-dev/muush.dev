import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { ResolvedShellItem } from '@/features/shell/data/types'
import ShellItemLink from './ShellItemLink.vue'

/** Feature 43 · FR-031…FR-034, contract § 7. */
function render(item: ResolvedShellItem) {
  return mount(ShellItemLink, { props: { item } })
}

describe('ShellItemLink', () => {
  it('should open an external destination in a new tab with the opener severed', () => {
    const link = render({
      label: 'LinkedIn',
      href: 'https://x.test',
      external: true,
    })

    expect(link.element.tagName).toBe('A')
    expect(link.attributes()).toMatchObject({
      href: 'https://x.test',
      target: '_blank',
      rel: 'noopener noreferrer',
    })
  })

  it('should keep a mail link in the same tab when the destination is mailto', () => {
    const link = render({
      label: 'support@muush.dev',
      href: 'mailto:support@muush.dev',
      external: false,
    })

    expect(link.attributes('href')).toBe('mailto:support@muush.dev')
    expect(link.attributes('target')).toBeUndefined()
  })

  it('should route an internal destination and mark its own page when current', () => {
    const link = render({
      label: 'Nosotros',
      href: '/es/nosotros',
      external: false,
      current: 'page',
    })

    expect(link.findComponent({ name: 'NuxtLink' }).exists()).toBe(true)
    expect(link.attributes('aria-current')).toBe('page')
  })

  it('should render plain text with no anchor when there is no destination', () => {
    const text = render({ label: 'Blog · próximamente', external: false })

    expect(text.element.tagName).toBe('SPAN')
    expect(text.text()).toBe('Blog · próximamente')
  })

  it('should carry the CTA tracking attributes on its link when it has them', () => {
    /* Feature 49 · the delegated click listener reads these. */
    const link = render({
      label: 'WhatsApp',
      href: 'https://wa.me/1',
      external: true,
      trackAttrs: {
        'data-track': 'contact_click',
        'data-track-location': 'footer',
        'data-track-channel': 'whatsapp',
      },
    })

    expect(link.attributes()).toMatchObject({
      'data-track': 'contact_click',
      'data-track-location': 'footer',
      'data-track-channel': 'whatsapp',
    })
  })

  it('should carry no tracking attribute when the item reports nothing', () => {
    const link = render({ label: 'Nosotros', href: '/es/nosotros' })

    expect(link.attributes('data-track')).toBeUndefined()
  })
})
