import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type {
  ResolvedShellItem,
  ResolvedSocial,
} from '@/features/shell/data/types'
import MobileMenu from './MobileMenu.vue'

const items: ResolvedShellItem[] = [
  { label: 'Propósito', href: '/es#proposito', external: false },
  { label: 'Servicios', href: '/es#servicios', external: false },
  { label: 'Proyectos', href: '/es#proyectos', external: false },
  { label: 'Nosotros', href: '/es/nosotros', external: false },
]

const socials: ResolvedSocial[] = [
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

const props = {
  open: true,
  items,
  socials,
  home: '/es',
  locale: 'es' as const,
  localeSwitchHref: '/en',
  label: 'Menú',
  closeLabel: 'Cerrar menú',
}

function mountMenu(overrides: Partial<typeof props> = {}) {
  return mount(MobileMenu, { props: { ...props, ...overrides } })
}

describe('MobileMenu', () => {
  it('should render nothing when it is closed', () => {
    expect(mountMenu({ open: false }).find('[role="dialog"]').exists()).toBe(
      false
    )
  })

  it('should expose itself as a modal surface when open', () => {
    const panel = mountMenu().find('[role="dialog"]')

    expect(panel.attributes('aria-modal')).toBe('true')
    expect(panel.attributes('aria-label')).toBe('Menú')
  })

  it('should render the four destinations when open', () => {
    const entries = mountMenu().findAll('li')

    expect(entries.map(entry => entry.text())).toEqual([
      'Propósito',
      'Servicios',
      'Proyectos',
      'Nosotros',
    ])
  })

  it('should render the divider when open', () => {
    expect(mountMenu().find('hr').classes()).toContain('border-divider-menu')
  })

  it('should render the three social buttons when open', () => {
    const buttons = mountMenu().findAll('a[target="_blank"]')

    expect(buttons).toHaveLength(3)
    expect(buttons.map(button => button.attributes('aria-label'))).toEqual([
      'LinkedIn',
      'Instagram',
      'TikTok',
    ])
  })

  it('should carry no primary call to action when open', () => {
    /* A recorded decision, not an omission: on mobile the only call to
       action is the social row (decisions-open.md, 2026-09-06). */
    expect(mountMenu().text()).not.toContain('Cuéntanos tu proyecto')
  })

  it('should report closing when the close control is activated', async () => {
    const wrapper = mountMenu()

    await wrapper.find('button[aria-label="Cerrar menú"]').trigger('click')

    expect(wrapper.emitted('closed')).toHaveLength(1)
  })

  it('should offer a pointer on the close control when open', () => {
    /* A native `<button>` gets `cursor: default` from the user agent and
       Tailwind's preflight sets none, so without this it read as unclickable
       while the anchors beside it read correctly (`findings.md` § R56). */
    const close = mountMenu().find('button[aria-label="Cerrar menú"]')

    expect(close.classes()).toContain('cursor-pointer')
  })

  it('should report closing when the lockup is activated', async () => {
    const wrapper = mountMenu()

    await wrapper.findAll('a')[0]?.trigger('click')

    expect(wrapper.emitted('closed')).toHaveLength(1)
  })

  it('should report the chosen destination when an item is activated', async () => {
    const wrapper = mountMenu()
    const projects = wrapper
      .findAll('li a')
      .find(link => link.text() === 'Proyectos')

    await projects?.trigger('click')

    expect(wrapper.emitted('itemChosen')).toEqual([['/es#proyectos']])
  })

  it('should not navigate on its own when an item is activated', async () => {
    /* The parent closes on `itemChosen` and only then does the page scroll,
       which a component navigating on its own could not honour. */
    const wrapper = mountMenu()

    await wrapper.findAll('li a')[0]?.trigger('click')

    expect(wrapper.emitted('closed')).toBeUndefined()
  })

  it('should move focus into the panel when it opens', () => {
    /* Attached to the document on purpose: focus is only observable for an
       element that is actually in it. */
    const wrapper = mount(MobileMenu, { props, attachTo: document.body })

    expect(document.activeElement).toBe(
      wrapper.find('button[aria-label="Cerrar menú"]').element
    )

    wrapper.unmount()
  })

  it('should inline the close glyph rather than reference it as an image', () => {
    const wrapper = mountMenu()

    expect(wrapper.find('button svg').exists()).toBe(true)
    expect(wrapper.find('img').exists()).toBe(false)
  })
})
