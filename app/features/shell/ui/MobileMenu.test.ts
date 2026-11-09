import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type Component, ref } from 'vue'
import type {
  ResolvedShellItem,
  ResolvedSocial,
} from '@/features/shell/data/types'
import { useShaderCanvas } from '@/shared/logic/useShaderCanvas'
import Lockup from '@/shared/ui/Lockup.vue'
import ShaderBackground from '@/shared/ui/ShaderBackground.vue'
import LanguageToggle from './LanguageToggle.vue'
import MenuButton from './MenuButton.vue'
import MobileMenu from './MobileMenu.vue'
import SocialLinks from './SocialLinks.vue'
import { ExactActiveLinkStub } from './shellFixtures.testing'

/**
 * Feature 43 · FR-015…FR-023, contract § 6. The shader composable is
 * stubbed (no WebGL under happy-dom); Esc, history and resize closing are
 * `useMobileMenu`'s and tested there.
 */
vi.mock('@/shared/logic/useShaderCanvas', () => ({ useShaderCanvas: vi.fn() }))

const ITEMS: ResolvedShellItem[] = [
  { label: 'Inicio', href: '/es', external: false },
  { label: 'Servicios', href: '/es#servicios', external: false },
  { label: 'Nosotros', href: '/es/nosotros', external: false, current: 'page' },
  /* Feature 51 · OQ-2 = A, the fourth item. */
  { label: 'Preguntas', href: '/es/preguntas', external: false },
]
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
  {
    network: 'facebook',
    href: 'https://www.facebook.com/profile.php?id=61595800850873',
    label: 'Facebook',
  },
]
const PROPS = {
  open: true,
  items: ITEMS,
  socials: SOCIALS,
  home: '/es',
  homeLabel: 'Inicio de muush',
  locale: 'es' as const,
  localeSwitchHref: '/en',
  localeSwitchLabel: 'Cambiar a inglés',
  label: 'Menú',
  closeLabel: 'Cerrar menú',
}

const mounted: Array<{ unmount: () => void }> = []

function render(
  props: Record<string, unknown> = {},
  stubs: Record<string, Component> = {}
) {
  const wrapper = mount(MobileMenu, {
    props: { ...PROPS, ...props },
    attachTo: document.body,
    global: { stubs },
  })
  mounted.push(wrapper)
  return wrapper
}

beforeEach(() => {
  vi.mocked(useShaderCanvas).mockReturnValue({
    isReady: ref(false),
    isFallback: ref(false),
  })
})

afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount()
})

describe('MobileMenu · rendering', () => {
  it('should render nothing when closed', () => {
    expect(render({ open: false }).find('[role="dialog"]').exists()).toBe(false)
  })

  it('should be a named modal dialog covering the viewport when open', () => {
    const dialog = render().find('[role="dialog"]')

    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-label')).toBe('Menú')
    expect(dialog.classes()).toEqual(
      expect.arrayContaining([
        'fixed',
        'inset-0',
        'bg-negro-950',
        'lg:hidden',
        'print:hidden',
      ])
    )
  })

  it('should layer the menu listón under the Negro 950 70 % glass when open', () => {
    const wrapper = render()
    const glass = wrapper.find(
      '[role="dialog"] > div[aria-hidden="true"]:not(.pointer-events-none)'
    )

    expect(wrapper.findComponent(ShaderBackground).props('preset')).toBe(
      'mobileMenu'
    )
    expect(glass.classes()).toEqual(
      expect.arrayContaining(['bg-menu-vidrio', 'backdrop-blur-cristal'])
    )
  })

  it('should repeat the bar with the isotipo, the menu toggle and Cerrar when open', () => {
    const wrapper = render()

    expect(wrapper.findComponent(Lockup).props('form')).toBe('isotipo')
    expect(wrapper.findComponent(LanguageToggle).props('variant')).toBe('menu')
    expect(wrapper.findComponent(MenuButton).props()).toMatchObject({
      kind: 'close',
      label: 'Cerrar menú',
    })
  })

  it('should list the items in Poppins 32 with no arrows when open', () => {
    const links = render().findAll('ul.mt-menu-lista a')

    /* "Inicio" first (Home link added by Roberto 2026-11-01). */
    expect(links.map(link => link.text())).toEqual([
      'Inicio',
      'Servicios',
      'Nosotros',
      'Preguntas',
    ])
    expect(links[0]?.attributes('href')).toBe('/es')
    expect(links[0]?.classes()).toEqual(
      expect.arrayContaining([
        'font-titulo',
        'text-menu',
        'text-blanco',
        'py-menu-fila',
      ])
    )
    expect(links.some(link => link.text().includes('→'))).toBe(false)
    expect(links[2]?.attributes('aria-current')).toBe('page')
  })

  it('should draw the divider and the 48 px social buttons when open', () => {
    const wrapper = render()

    expect(wrapper.find('.mt-menu-divisor').classes()).toEqual(
      expect.arrayContaining(['h-px', 'bg-linea'])
    )
    expect(wrapper.findComponent(SocialLinks).props()).toMatchObject({
      size: 'menu',
      socials: SOCIALS,
    })
  })
})

describe('MobileMenu · closing and focus (FR-018, FR-020)', () => {
  it('should move focus to Cerrar when it opens', async () => {
    const wrapper = render()
    await flushPromises()

    expect(document.activeElement).toBe(
      wrapper.findComponent(MenuButton).element
    )
  })

  it('should emit close when Cerrar is activated', async () => {
    const wrapper = render()

    await wrapper.findComponent(MenuButton).trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('should emit itemChosen with the destination when a link is chosen', async () => {
    const wrapper = render()

    await wrapper.findAll('ul.mt-menu-lista a')[1]?.trigger('click')

    expect(wrapper.emitted('itemChosen')).toEqual([['/es#servicios']])
  })

  it('should close, then scroll to the top, when Home is chosen on the home page', async () => {
    window.history.replaceState(null, '', '/es')
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const wrapper = render({
      items: [{ ...ITEMS[0], scrollsToTop: true }, ...ITEMS.slice(1)],
    })

    await wrapper.findAll('ul.mt-menu-lista a')[0]?.trigger('click')

    expect(wrapper.emitted('itemChosen')).toEqual([['/es']])
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0 })
    scrollTo.mockRestore()
    window.history.replaceState(null, '', '/')
  })

  it('should never mark the logo as the current page when the router marks its link', () => {
    /* Feature 44 · FR-028 (review-43c nit 5): the stub marks every link
       exact-active, as the router does on the home page. */
    const logo = render({}, { NuxtLink: ExactActiveLinkStub }).find(
      'a[aria-label="Inicio de muush"]'
    )

    expect(logo.exists()).toBe(true)
    expect(logo.attributes('aria-current')).toBeUndefined()
  })

  it('should emit itemChosen when the logo or the language is chosen', async () => {
    const wrapper = render()

    await wrapper.find('a[aria-label="Inicio de muush"]').trigger('click')
    await wrapper.find('a[hreflang="en"]').trigger('click')

    expect(wrapper.emitted('itemChosen')).toEqual([['/es'], ['/en']])
  })

  it('should re-emit the in-place switch as switchLocale on the 404', () => {
    const wrapper = render({ localeSwitchInPlace: true })

    wrapper.findComponent(LanguageToggle).vm.$emit('switchInPlace', 'en')

    expect(wrapper.emitted('switchLocale')).toEqual([['en']])
  })

  it('should keep Tab inside the menu when focus leaves its last control', async () => {
    const wrapper = render()
    await flushPromises()
    const links = wrapper.findAll('a')
    const last = links.at(-1)?.element as HTMLElement
    last.focus()

    last.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      })
    )

    expect(
      wrapper.find('[role="dialog"]').element.contains(document.activeElement)
    ).toBe(true)
    expect(document.activeElement).not.toBe(last)
  })
})

describe('MobileMenu · motion (FR-023)', () => {
  it('should stagger the links through the entrance tokens when open', () => {
    const rows = render().findAll('ul.mt-menu-lista > li')

    expect(rows.map(row => row.attributes('style'))).toEqual([
      '--orden: 0;',
      '--orden: 1;',
      '--orden: 2;',
      '--orden: 3;',
    ])
    expect(rows[0]?.classes()).toContain('menu-enlace')
  })
})
