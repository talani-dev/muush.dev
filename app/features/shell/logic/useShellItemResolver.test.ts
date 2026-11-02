import { describe, expect, it } from 'vitest'
import type { ShellItem, ShellRouteName } from '@/features/shell/data/types'
import type { SectionAnchor } from '@/shared/data/sectionAnchors'
import {
  createShellItemResolver,
  type ShellItemResolverDeps,
} from './useShellItemResolver'

/**
 * The Nuxt composables are replaced by stubs passed to the pure core:
 * `useShellItemResolver()` only wires `useI18n`, `useLocalePath`,
 * `useRouteBaseName` and `useRoute` into it.
 */
const PATHS: Record<ShellRouteName, string> = {
  index: '/es',
  about: '/es/nosotros',
}

const COPY: Record<string, string> = {
  'shell.nav.about': 'Nosotros',
  'shell.footer.whatsapp.message': 'Hola muush, me interesa platicar',
}

function stubDeps(
  currentRoute?: string,
  activeAnchor: SectionAnchor | null = null
): ShellItemResolverDeps {
  return {
    t: key => COPY[key] ?? key,
    localePath: ({ name }) => PATHS[name],
    currentRouteName: () => currentRoute,
    activeAnchor: () => activeAnchor,
  }
}

const SERVICES: ShellItem = {
  labelKey: 'shell.nav.services',
  destination: { kind: 'anchor', name: 'index', anchor: 'servicios' },
}

describe('createShellItemResolver', () => {
  it('should return an undefined href when the destination is none', () => {
    const { resolveHref, resolveItem } = createShellItemResolver(stubDeps())
    const item: ShellItem = { labelKey: 'x', destination: { kind: 'none' } }

    expect(resolveHref(item)).toBeUndefined()
    expect('href' in resolveItem(item)).toBe(false)
  })

  it('should append the section id to the localized route when the destination is an anchor', () => {
    const { resolveHref } = createShellItemResolver(stubDeps())

    expect(resolveHref(SERVICES)).toBe('/es#servicios')
    expect(
      resolveHref({
        labelKey: 'x',
        destination: {
          kind: 'anchor',
          name: 'about',
          anchor: 'trabaja-con-muush',
        },
      })
    ).toBe('/es/nosotros#trabaja-con-muush')
  })

  it('should append the encoded message when the destination is external with a messageKey', () => {
    const { resolveHref } = createShellItemResolver(stubDeps())

    expect(
      resolveHref({
        labelKey: 'x',
        destination: {
          kind: 'external',
          href: 'https://wa.me/525639060739',
          messageKey: 'shell.footer.whatsapp.message',
        },
      })
    ).toBe(
      `https://wa.me/525639060739?text=${encodeURIComponent('Hola muush, me interesa platicar')}`
    )
  })

  it('should mark the page current when the destination route is the active route', () => {
    const { resolveItem } = createShellItemResolver(stubDeps('about'))

    expect(
      resolveItem({
        labelKey: 'shell.nav.about',
        destination: { kind: 'route', name: 'about' },
      })
    ).toEqual({
      label: 'Nosotros',
      href: '/es/nosotros',
      external: false,
      current: 'page',
    })
  })

  it('should mark nothing current when no route matched', () => {
    const { resolveItem } = createShellItemResolver(
      stubDeps(undefined, 'servicios')
    )

    expect(
      'current' in
        resolveItem({
          labelKey: 'shell.nav.about',
          destination: { kind: 'route', name: 'about' },
        })
    ).toBe(false)
    expect('current' in resolveItem(SERVICES)).toBe(false)
  })

  describe('scroll-spy (spec FR-028, confirmed by Roberto 2026-11-01)', () => {
    it('should mark the section current when its section is in view on its route', () => {
      const { resolveItem } = createShellItemResolver(
        stubDeps('index', 'servicios')
      )

      expect(resolveItem(SERVICES).current).toBe('section')
    })

    it('should mark nothing current when no section is in view', () => {
      const { resolveItem } = createShellItemResolver(stubDeps('index', null))

      expect('current' in resolveItem(SERVICES)).toBe(false)
    })

    it('should mark nothing current when another section is in view', () => {
      const { resolveItem } = createShellItemResolver(
        stubDeps('index', 'diagnostico')
      )

      expect('current' in resolveItem(SERVICES)).toBe(false)
    })

    it('should mark no anchor item current when the route is another page', () => {
      const { resolveItem } = createShellItemResolver(
        stubDeps('about', 'servicios')
      )

      expect('current' in resolveItem(SERVICES)).toBe(false)
    })

    it('should mark nothing current when the resolver gets no active anchor', () => {
      const { resolveItem } = createShellItemResolver({
        t: key => key,
        localePath: ({ name }) => PATHS[name],
        currentRouteName: () => 'index',
      })

      expect('current' in resolveItem(SERVICES)).toBe(false)
    })
  })

  describe('Home item (added by Roberto 2026-11-01)', () => {
    const HOME: ShellItem = {
      labelKey: 'shell.nav.homeLink',
      destination: { kind: 'top', name: 'index' },
    }
    const resolver = (route: string | undefined, atTop: boolean) =>
      createShellItemResolver({ ...stubDeps(route), atTop: () => atTop })

    it('should point at the localized home through the route map', () => {
      expect(resolver('about', false).resolveHref(HOME)).toBe('/es')
    })

    it('should flag the Home item, and only it, as scrolling to the top', () => {
      const { resolveItem } = resolver('index', false)

      expect(resolveItem(HOME).scrollsToTop).toBe(true)
      expect('scrollsToTop' in resolveItem(SERVICES)).toBe(false)
    })

    it('should mark Home as the page at the top of the home page', () => {
      expect(resolver('index', true).resolveItem(HOME).current).toBe('page')
    })

    it('should mark nothing once the visitor has left the top', () => {
      expect('current' in resolver('index', false).resolveItem(HOME)).toBe(
        false
      )
    })

    it('should never mark Home on another page, even when at its top', () => {
      expect('current' in resolver('about', true).resolveItem(HOME)).toBe(false)
    })

    it('should never mark Home on the not-found page (no route name)', () => {
      expect('current' in resolver(undefined, true).resolveItem(HOME)).toBe(
        false
      )
    })

    it('should mark nothing when the resolver gets no atTop signal', () => {
      const { resolveItem } = createShellItemResolver(stubDeps('index'))

      expect('current' in resolveItem(HOME)).toBe(false)
    })
  })
})
