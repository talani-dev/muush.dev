import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import type {
  ResolvedShellItem,
  ResolvedSocial,
} from '@/features/shell/data/types'
import { useMobileMenu } from '@/features/shell/logic/useMobileMenu'
import SiteNav from './SiteNav.vue'

const items: ResolvedShellItem[] = [
  { label: 'Proyectos', href: '/es#proyectos', external: false },
  { label: 'Nosotros', href: '/es/nosotros', external: false, current: true },
]

const menuItems: ResolvedShellItem[] = [
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
  items,
  cta: { label: 'Cuéntanos tu proyecto', href: '/es#contacto' },
  home: '/es',
  locale: 'es' as const,
  localeSwitchHref: '/en',
  menuItems,
  socials,
  navLabel: 'Navegación principal',
  menuLabel: 'Menú',
  menuOpenLabel: 'Abrir menú',
  menuCloseLabel: 'Cerrar menú',
}

/**
 * Awaited: the hamburger appears only once scripting has run, and the ref
 * that records it schedules its render asynchronously.
 */
async function mountNav() {
  const wrapper = mount(SiteNav, { props })
  await nextTick()
  return wrapper
}

describe('SiteNav', () => {
  afterEach(() => {
    useMobileMenu().close()
  })

  it('should render a navigation landmark when rendered', async () => {
    const landmark = (await mountNav()).find('nav')

    expect(landmark.exists()).toBe(true)
    expect(landmark.attributes('aria-label')).toBe('Navegación principal')
  })

  it('should render the lockup pointing at the home of the active locale', async () => {
    const link = (await mountNav()).find('a')

    expect(link.attributes('href')).toBe('/es')
    expect(link.find('svg').exists()).toBe(true)
  })

  it('should render both nav links when rendered', async () => {
    const links = (await mountNav()).findAll('ul li a')

    expect(links.map(link => link.text())).toEqual(['Proyectos', 'Nosotros'])
  })

  it('should announce the current page without changing its appearance', async () => {
    /* The design draws no active treatment — § 9.bis verified the two pages'
       navs are byte-identical — so the information goes to assistive
       technology only (spec A-04). */
    const links = (await mountNav()).findAll('ul li a')
    const [projects, about] = links

    expect(about?.attributes('aria-current')).toBe('page')
    expect(projects?.attributes('aria-current')).toBeUndefined()
    expect(about?.classes()).toEqual(projects?.classes())
  })

  it('should render the primary call to action when rendered', async () => {
    const wrapper = await mountNav()
    const button = wrapper
      .findAll('a')
      .find(link => link.text() === 'Cuéntanos tu proyecto')

    expect(button?.attributes('href')).toBe('/es#contacto')
  })

  it('should keep the call to action out of the mobile arrangement', async () => {
    /* A recorded decision, not an omission (decisions-open.md 2026-09-06):
       on mobile the only call to action is the social row in the menu. */
    const wrapper = await mountNav()
    const button = wrapper
      .findAll('a')
      .find(link => link.text() === 'Cuéntanos tu proyecto')

    expect(button?.element.parentElement?.className).toContain('hidden')
    expect(button?.element.parentElement?.className).toContain('lg:block')
  })

  it('should render the hamburger once scripting is available', async () => {
    const trigger = (await mountNav()).find('button[aria-label="Abrir menú"]')

    expect(trigger.exists()).toBe(true)
    expect(trigger.classes()).toContain('lg:hidden')
  })

  it('should render the locale toggle when rendered', async () => {
    const text = (await mountNav()).text()

    expect(text).toContain('ES')
    expect(text).toContain('EN')
  })

  it('should keep the menu closed until the hamburger is activated', async () => {
    expect((await mountNav()).find('[role="dialog"]').exists()).toBe(false)
  })

  it('should open the menu when the hamburger is activated', async () => {
    const wrapper = await mountNav()

    await wrapper.find('button[aria-label="Abrir menú"]').trigger('click')

    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
  })

  it('should make the row behind the panel inert when the menu is open', async () => {
    const wrapper = await mountNav()

    await wrapper.find('button[aria-label="Abrir menú"]').trigger('click')

    expect(wrapper.find('nav > div').attributes('inert')).toBeDefined()
  })

  it('should close the menu when its close control is activated', async () => {
    const wrapper = await mountNav()
    await wrapper.find('button[aria-label="Abrir menú"]').trigger('click')

    await wrapper.find('button[aria-label="Cerrar menú"]').trigger('click')

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('should close the menu before navigating when an item is chosen', async () => {
    const wrapper = await mountNav()
    await wrapper.find('button[aria-label="Abrir menú"]').trigger('click')

    await wrapper.find('[role="dialog"] li a').trigger('click')

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('should offer no menu destination that the footer lacks', () => {
    /* Nothing may be reachable only through the menu, because the menu is the
       one surface that needs scripting (spec FR-032). */
    const menuHrefs = menuItems.map(item => item.href)
    const footerHrefs = [
      '/es#proposito',
      '/es#servicios',
      '/es#proyectos',
      '/es/nosotros',
    ]

    expect(menuHrefs.every(href => footerHrefs.includes(href ?? ''))).toBe(true)
  })
})
