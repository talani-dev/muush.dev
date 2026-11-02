import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import type { ResolvedShellItem } from '@/features/shell/data/types'
import { useMobileMenu } from '@/features/shell/logic/useMobileMenu'
import Lockup from '@/shared/ui/Lockup.vue'
import PrimaryButton from '@/shared/ui/PrimaryButton.vue'
import Wordmark from '@/shared/ui/Wordmark.vue'
import LanguageToggle from './LanguageToggle.vue'
import MenuButton from './MenuButton.vue'
import NavLinkBar from './NavLinkBar.vue'
import SiteHeader from './SiteHeader.vue'

/**
 * Feature 43 · FR-001…FR-014, FR-029, contract § 3. The composables are the
 * real ones: `useMobileMenu` is module-scoped and `useNavScrollReveal` only
 * reads `window.scrollY`, so the header's wiring is what is under test.
 * `requestAnimationFrame` is a hand-flushed queue, as in
 * `useNavScrollReveal.test.ts`.
 */
const ITEMS: ResolvedShellItem[] = [
  { label: 'Servicios', href: '/es#servicios', external: false },
  { label: 'Nosotros', href: '/es/nosotros', external: false, current: 'page' },
]

const PROPS = {
  items: ITEMS,
  cta: {
    label: 'Diagnóstico gratis',
    href: '/es#diagnostico',
    external: false,
  },
  home: '/es',
  homeLabel: 'Inicio de muush',
  locale: 'es' as const,
  localeSwitchHref: '/en/about',
  localeSwitchLabel: 'Cambiar a inglés',
  navLabel: 'Navegación principal',
  menuOpenLabel: 'Abrir menú',
}

let frames: FrameRequestCallback[] = []
const realRaf = window.requestAnimationFrame
const mounted: Array<{ unmount: () => void }> = []

function render(props: Record<string, unknown> = {}) {
  const wrapper = mount(SiteHeader, {
    props: { ...PROPS, ...props },
    attachTo: document.body,
  })
  mounted.push(wrapper)
  return wrapper
}

function scrollTo(offset: number) {
  window.scrollTo(0, offset)
  window.dispatchEvent(new Event('scroll'))
  for (const frame of frames.splice(0)) frame(0)
}

const headerClasses = (wrapper: ReturnType<typeof render>) =>
  wrapper.find('header').classes()

beforeEach(() => {
  frames = []
  window.requestAnimationFrame = ((callback: FrameRequestCallback) =>
    frames.push(callback)) as unknown as typeof window.requestAnimationFrame
})

afterEach(() => {
  useMobileMenu().close()
  for (const wrapper of mounted.splice(0)) wrapper.unmount()
  window.requestAnimationFrame = realRaf
  window.scrollTo(0, 0)
})

describe('SiteHeader · structure (US1, US3)', () => {
  it('should float fixed over the page and never print when rendered', () => {
    expect(headerClasses(render())).toEqual(
      expect.arrayContaining(['fixed', 'top-0', 'inset-x-0', 'print:hidden'])
    )
  })

  it('should name the navigation landmark when rendered', () => {
    expect(render().find('nav').attributes('aria-label')).toBe(
      'Navegación principal'
    )
  })

  it('should link the logo home with an accessible name when rendered', () => {
    const logo = render().find('nav > a')

    expect(logo.attributes('href')).toBe('/es')
    expect(logo.attributes('aria-label')).toBe('Inicio de muush')
  })

  /* Roberto 2026-11-01 (spec FR-059): the isotipo alone at every width; the
   * desktop .pen frame's full lockup is superseded in the header only. */
  it('should show the isotipo alone with no wordmark at every width when rendered', () => {
    const wrapper = render()
    const lockups = wrapper.findAllComponents(Lockup)

    expect(lockups.map(lockup => lockup.props('form') ?? 'full')).toEqual([
      'isotipo',
    ])
    expect(wrapper.findComponent(Wordmark).exists()).toBe(false)
  })

  it('should be the mobile glass bar below lg and a bare row from lg when rendered', () => {
    expect(render().find('nav').classes()).toEqual(
      expect.arrayContaining([
        'h-header-alto',
        'rounded-header',
        'bg-nav-fondo',
        'border-linea',
        'backdrop-blur-header',
        'lg:h-header-alto-desktop',
        'lg:bg-transparent',
        'lg:border-0',
        'max-w-contenido',
        'justify-between',
      ])
    )
  })

  it('should hand the items to the link bar, shown from lg only, when rendered', () => {
    const bar = render().findComponent(NavLinkBar)

    expect(bar.props('items')).toEqual(ITEMS)
    expect(bar.element.parentElement?.className).toBe(
      'pointer-events-auto hidden lg:block'
    )
  })

  it('should show the nav-size CTA from lg, never on the mobile bar, when rendered', () => {
    const cta = render().findComponent(PrimaryButton)

    expect(cta.props()).toMatchObject({
      size: 'nav',
      to: '/es#diagnostico',
      label: 'Diagnóstico gratis',
    })
    expect(cta.element.parentElement?.className).toBe('hidden lg:inline-flex')
    expect(cta.attributes('aria-current')).toBeUndefined()
  })
})

describe('SiteHeader · language (US2, FR-029)', () => {
  it('should pass the resolved destination and label to the toggle when rendered', () => {
    const toggle = render().findComponent(LanguageToggle)

    expect(toggle.props()).toMatchObject({
      locale: 'es',
      href: '/en/about',
      switchLabel: 'Cambiar a inglés',
      inPlace: false,
    })
  })

  it('should switch the toggle to in place when the page asks for it', () => {
    const toggle = render({ localeSwitchInPlace: true }).findComponent(
      LanguageToggle
    )

    expect(toggle.props('inPlace')).toBe(true)
  })

  it('should re-emit the in-place switch as switchLocale when the toggle requests it', () => {
    const wrapper = render({ localeSwitchInPlace: true })

    wrapper.findComponent(LanguageToggle).vm.$emit('switchInPlace', 'en')

    expect(wrapper.emitted('switchLocale')).toEqual([['en']])
  })
})

describe('SiteHeader · menu button (US3, FR-008, FR-020)', () => {
  it('should not render the menu button without scripting', async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(SiteHeader, PROPS) }).component(
        'NuxtLink',
        {
          props: ['to'],
          render() {
            return h('a')
          },
        }
      )
    )

    expect(html).not.toContain('Abrir menú')
    expect(html).not.toContain('aria-expanded')
  })

  it('should render the menu button below lg once mounted', async () => {
    const wrapper = render()
    await nextTick()
    const button = wrapper.findComponent(MenuButton)

    expect(button.exists()).toBe(true)
    expect(button.props()).toMatchObject({ kind: 'open', label: 'Abrir menú' })
    expect(button.element.parentElement?.className).toBe(
      'inline-flex lg:hidden'
    )
  })

  it('should open the menu and expose it when the menu button is activated', async () => {
    const wrapper = render()
    await nextTick()

    await wrapper.find('button').trigger('click')

    expect(useMobileMenu().isOpen.value).toBe(true)
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')
  })

  it('should return focus to the menu button when the menu is dismissed', async () => {
    const wrapper = render()
    await nextTick()
    const { open, close } = useMobileMenu()
    open()
    await nextTick()

    close('dismiss')
    await flushPromises()

    expect(document.activeElement).toBe(wrapper.find('button').element)
  })

  it('should leave focus alone when the menu closes to navigate', async () => {
    const wrapper = render()
    await nextTick()
    const { open, close } = useMobileMenu()
    open()
    await nextTick()

    close('navigate')
    await flushPromises()

    expect(document.activeElement).not.toBe(wrapper.find('button').element)
  })
})

describe('SiteHeader · smart hide (US4, FR-010…FR-013)', () => {
  it('should be visible at the top of the page when rendered', () => {
    expect(headerClasses(render())).toEqual(
      expect.arrayContaining(['translate-y-0', 'opacity-100'])
    )
  })

  it('should hide when the visitor scrolls down past 80 px', async () => {
    const wrapper = render()
    scrollTo(200)
    scrollTo(260)
    await nextTick()

    expect(headerClasses(wrapper)).toEqual(
      expect.arrayContaining(['-translate-y-full', 'opacity-0'])
    )
  })

  it('should come back on any upward scroll', async () => {
    const wrapper = render()
    scrollTo(200)
    scrollTo(260)
    scrollTo(259)
    await nextTick()

    expect(headerClasses(wrapper)).toContain('translate-y-0')
  })

  it('should never hide while the mobile menu is open', async () => {
    const wrapper = render()
    useMobileMenu().open()
    scrollTo(200)
    scrollTo(260)
    await nextTick()

    expect(headerClasses(wrapper)).toContain('opacity-100')
  })

  it('should reappear when keyboard focus lands on one of its controls', async () => {
    const wrapper = render()
    scrollTo(200)
    scrollTo(260)
    await nextTick()

    await wrapper.find('nav > a').trigger('focusin')

    expect(headerClasses(wrapper)).toContain('translate-y-0')
  })

  it('should not animate when the visitor reduces motion', () => {
    /* `--medio` is 0 ms there too (global.css); this is the belt. */
    expect(headerClasses(render())).toEqual(
      expect.arrayContaining([
        'duration-(--medio)',
        'motion-reduce:transition-none',
      ])
    )
  })
})
