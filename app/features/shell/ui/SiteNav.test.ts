import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import type {
  ResolvedShellItem,
  ResolvedSocial,
} from '@/features/shell/data/types'
import { useMobileMenu } from '@/features/shell/logic/useMobileMenu'
import SiteNav from './SiteNav.vue'

const items: ResolvedShellItem[] = [
  { label: 'Servicios', href: '/es#servicios', external: false },
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
  showCta: true,
  home: '/es',
  locale: 'es' as const,
  localeSwitchHref: '/en',
  localeSwitchLabel: 'Cambiar a inglés',
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
async function mountNav(overrides: Partial<typeof props> = {}) {
  const wrapper = mount(SiteNav, { props: { ...props, ...overrides } })
  await nextTick()
  return wrapper
}

/** The wrapper around the primary call to action, whose state is the feature. */
function ctaWrapper(wrapper: VueWrapper) {
  return wrapper.find('.site-nav__cta')
}

/** The CTA's own `<a>`, found by its label rather than its full text content,
 *  since the leading arrow (feature 21) is now part of that content too. */
function ctaLink(wrapper: VueWrapper) {
  return wrapper
    .findAll('a')
    .find(link => link.text().includes(props.cta.label))
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

    expect(links.map(link => link.text())).toEqual(['Servicios', 'Nosotros'])
  })

  it('should announce the current page without changing its appearance', async () => {
    /* The design draws no active treatment — § 9.bis verified the two pages'
       navs are byte-identical — so the information goes to assistive
       technology only (spec A-04). */
    const links = (await mountNav()).findAll('ul li a')
    const [services, about] = links

    expect(about?.attributes('aria-current')).toBe('page')
    expect(services?.attributes('aria-current')).toBeUndefined()
    expect(about?.classes()).toEqual(services?.classes())
  })

  it('should never render Proyectos in the desktop link row', async () => {
    /* spec FR-006/US2 — a deliberate divergence from the redesigned frame,
       not an omission: feature 15 is `blocked`, and a link to a section that
       does not exist reads as a broken site (`ui-map.md` § 6). */
    const links = (await mountNav()).findAll('ul li a')

    expect(links.map(link => link.text())).not.toContain('Proyectos')
  })

  it('should render the pill container classes on the desktop row', async () => {
    /* spec FR-001/FR-002 — the floating dark-glass pill, reusing the same
       glass/pill vocabulary `Pill` and `BotonPrimario` already declare. No
       new glass-surface token or variant. */
    const row = (await mountNav()).find('nav > div')

    for (const utility of [
      'lg:rounded-full',
      'lg:border',
      'lg:border-glass-line',
      'lg:bg-glass-dark',
      'lg:max-w-nav-pill-w',
      'lg:px-nav-pill-x',
      'lg:py-nav-pill-py',
    ]) {
      expect(row.classes(), utility).toContain(utility)
    }
  })

  it('should inset the pill from the top of the viewport on desktop only', async () => {
    const landmark = (await mountNav()).find('nav')

    expect(landmark.classes()).toContain('top-0')
    expect(landmark.classes()).toContain('lg:top-nav-pill-y')
  })

  it('should render the primary call to action when rendered', async () => {
    const button = ctaLink(await mountNav())

    expect(button?.attributes('href')).toBe('/es#contacto')
  })

  it('should carry a trailing arrow as a separate aria-hidden element', async () => {
    /* spec FR-012 — composed by this caller inside BotonPrimario's existing
       slot, never baked into the translated string (same discipline as
       feature 9's `LinkArrow`, FR-010). Feature 23 item 1: the `.pen`
       (frames `Rm6Wu`/`WGhSI`) draws `Texto → Flecha`, text first. */
    const button = ctaLink(await mountNav())
    const arrow = button?.find('span[aria-hidden="true"]')

    expect(arrow?.exists()).toBe(true)
    expect(arrow?.text()).toBe('→')
    expect(button?.text()).toBe(`${props.cta.label} →`)
  })

  it('should keep the call to action out of the mobile arrangement', async () => {
    /* A recorded decision, not an omission (decisions-open.md 2026-09-06):
       on mobile the only call to action is the social row in the menu. */
    const wrapper = await mountNav()
    const button = ctaLink(wrapper)

    expect(button?.element.parentElement?.className).toContain('hidden')
    expect(button?.element.parentElement?.className).toContain('lg:block')
  })

  it('should render the hamburger once scripting is available', async () => {
    const trigger = (await mountNav()).find('button[aria-label="Abrir menú"]')

    expect(trigger.exists()).toBe(true)
    expect(trigger.classes()).toContain('lg:hidden')
  })

  it('should offer a pointer on the hamburger when it renders', async () => {
    /* It only renders once scripting is available, so it always opens the
       menu. A native `<button>` gets `cursor: default` and Tailwind's preflight
       sets none (`findings.md` § R56). */
    const trigger = (await mountNav()).find('button[aria-label="Abrir menú"]')

    expect(trigger.classes()).toContain('cursor-pointer')
  })

  it('should offer a pointer on the primary call to action when rendered', async () => {
    /* It carries an href, so `BotonPrimario` marks it clickable. */
    const button = ctaLink(await mountNav())

    expect(button?.classes()).toContain('cursor-pointer')
  })

  it('should render only the active locale in the toggle when rendered', async () => {
    /* feature 21 — the circular toggle shows one code, never the pair
       (spec FR-015, User Story 4). */
    const text = (await mountNav()).text()

    expect(text).toContain('ES')
    expect(text).not.toContain('EN')
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

  it('should pin itself to the top of the viewport when rendered', () => {
    /* `sticky`, not `fixed`: the nav stays in normal flow, so `<main>` needs
       no compensating padding and every section's top padding stays
       `design y − nav height` (spec A-13, `rules.md` § R49). */
    return mountNav().then(wrapper => {
      const landmark = wrapper.find('nav')

      expect(landmark.classes()).toContain('sticky')
      expect(landmark.classes()).toContain('top-0')
      expect(landmark.classes()).toContain('site-nav')
    })
  })

  it('should show the call to action when the route does not suppress it', async () => {
    const cta = ctaWrapper(await mountNav({ showCta: true }))

    expect(cta.classes()).toContain('visible')
    expect(cta.classes()).toContain('opacity-100')
    expect(cta.classes()).not.toContain('invisible')
  })

  it('should hide the call to action from the pointer and from focus when the route suppresses it', async () => {
    /* `visibility` as well as opacity: an invisible button that still takes
       focus and still takes a click is not hidden (spec FR-048). */
    const cta = ctaWrapper(await mountNav({ showCta: false }))

    expect(cta.classes()).toContain('invisible')
    expect(cta.classes()).toContain('opacity-0')
    expect(cta.classes()).not.toContain('visible')
  })

  it('should keep the nav itself identical whether the call to action shows or not', async () => {
    /*
     * The requirement, and the one most likely to be broken by accident: the
     * nav never animates, never changes height and never changes background —
     * only the button does (spec FR-042, SC-017). Compared here is every class
     * on the nav, on the row and on the lockup; the only difference anywhere
     * in the markup must be the two utilities on the CTA wrapper.
     */
    const shown = await mountNav({ showCta: true })
    const hidden = await mountNav({ showCta: false })

    for (const selector of ['nav', 'nav > div', 'nav > div > a']) {
      expect(hidden.find(selector).classes(), selector).toEqual(
        shown.find(selector).classes()
      )
    }

    const difference = (wrapper: VueWrapper) =>
      ctaWrapper(wrapper)
        .classes()
        .filter(name => !['site-nav__cta', 'hidden', 'lg:block'].includes(name))

    expect(difference(shown)).toEqual(['visible', 'opacity-100'])
    expect(difference(hidden)).toEqual(['invisible', 'opacity-0'])
  })

  it('should force the call to action visible without scripting', async () => {
    /* The only mechanism that satisfies FR-045 and FR-046 at once: the button
       ships hidden in the landing's HTML so it cannot flash, and a browser
       with scripting off applies this override instead. */
    const noscript = (await mountNav({ showCta: false })).find('noscript')

    /* `innerHTML`, not `html()`: the wrapper's pretty-printer reformats the
       stylesheet and the assertion would be about the printer. */
    expect(noscript.exists()).toBe(true)
    expect(noscript.element.innerHTML).toBe(
      '<style>.site-nav__cta.site-nav__cta{opacity:1;visibility:visible}</style>'
    )
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
