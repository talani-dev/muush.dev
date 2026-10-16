import { describe, expect, it } from 'vitest'
import type { ShellItem, ShellRouteName } from '@/features/shell/data/types'
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
  nosotros: '/es/nosotros',
}

const COPY: Record<string, string> = {
  'shell.nav.about': 'Nosotros',
  'shell.footer.whatsapp.message': 'Hola muush, me interesa platicar',
}

function stubDeps(currentRoute?: string): ShellItemResolverDeps {
  return {
    t: key => COPY[key] ?? key,
    localePath: ({ name }) => PATHS[name],
    currentRouteName: () => currentRoute,
  }
}

describe('createShellItemResolver', () => {
  it('should return an undefined href when the destination is none', () => {
    const { resolveHref, resolveItem } = createShellItemResolver(stubDeps())
    const item: ShellItem = { labelKey: 'x', destination: { kind: 'none' } }

    expect(resolveHref(item)).toBeUndefined()
    expect('href' in resolveItem(item)).toBe(false)
  })

  it('should append the hash to the localized route when the destination is an anchor', () => {
    const { resolveHref } = createShellItemResolver(stubDeps())

    expect(
      resolveHref({
        labelKey: 'x',
        destination: { kind: 'anchor', name: 'index', hash: '#proposito' },
      })
    ).toBe('/es#proposito')
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

  it('should mark current when the destination route is the active route', () => {
    const { resolveItem } = createShellItemResolver(stubDeps('nosotros'))

    expect(
      resolveItem({
        labelKey: 'shell.nav.about',
        destination: { kind: 'route', name: 'nosotros' },
      })
    ).toEqual({
      label: 'Nosotros',
      href: '/es/nosotros',
      external: false,
      current: true,
    })
  })

  it('should not mark current when no route matched', () => {
    const { resolveItem } = createShellItemResolver(stubDeps(undefined))

    expect(
      resolveItem({
        labelKey: 'shell.nav.about',
        destination: { kind: 'route', name: 'nosotros' },
      }).current
    ).toBe(false)
  })
})
