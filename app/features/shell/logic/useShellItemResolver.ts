import type {
  ResolvedShellItem,
  ShellItem,
  ShellRouteName,
} from '@/features/shell/data/types'
import type { SectionAnchor } from '@/shared/data/sectionAnchors'
import { trackAttrs } from '@/shared/data/trackingEvents'

/** What the resolver needs from the Nuxt runtime, and nothing else. */
export interface ShellItemResolverDeps {
  t: (key: string) => string
  localePath: (route: { name: ShellRouteName }) => string
  /**
   * Base name of the route being rendered (vue-router names may be symbols);
   * `undefined` on an unmatched one, such as the not-found page.
   */
  currentRouteName: () => string | symbol | undefined
  /**
   * The section in view on the current page, from the scroll-spy (feature
   * 43, spec FR-028). Omitted, or `null`, marks no anchor item.
   */
  activeAnchor?: () => SectionAnchor | null
  /**
   * Whether the visitor is above the first spied section (the scroll-spy's
   * `atTop`). Lights a `top` item on its own page. Omitted means `false`:
   * the not-found page, which has no spy, lights nothing.
   */
  atTop?: () => boolean
}

export interface ShellItemResolver {
  resolveHref(item: ShellItem): string | undefined
  resolveItem(item: ShellItem): ResolvedShellItem
}

/**
 * The destination resolver, as a pure function of its dependencies so it
 * can be unit-tested without a Nuxt app. Shared by the shell and the
 * not-found page (feature 36, research R5).
 */
export function createShellItemResolver({
  t,
  localePath,
  currentRouteName,
  activeAnchor = () => null,
  atTop = () => false,
}: ShellItemResolverDeps): ShellItemResolver {
  /**
   * An anchor always resolves to its route's localized path **plus** the
   * hash, never to a bare fragment: the shell renders on Nosotros and the
   * 404 too, where `#servicios` alone points at nothing (spec FR-026).
   */
  function resolveHref(item: ShellItem): string | undefined {
    const { destination } = item

    switch (destination.kind) {
      case 'none':
        return undefined
      case 'route':
      case 'top':
        return localePath({ name: destination.name })
      case 'anchor':
        return `${localePath({ name: destination.name })}#${destination.anchor}`
      case 'external': {
        const { href, messageKey } = destination
        if (!messageKey) return href
        return `${href}?text=${encodeURIComponent(t(messageKey))}`
      }
    }
  }

  /**
   * `page` for a route item on its own page, and for a `top` item on its
   * own page while the visitor is at its top (the Home item, Roberto
   * 2026-11-01); `section` for an anchor item on its route while its
   * section is in view (spec FR-027, FR-028). The not-found page has no
   * route name, so nothing is current there.
   */
  function resolveCurrent(item: ShellItem): ResolvedShellItem['current'] {
    const { destination } = item
    if (
      destination.kind !== 'route' &&
      destination.kind !== 'top' &&
      destination.kind !== 'anchor'
    ) {
      return
    }
    if (destination.name !== currentRouteName()) return
    if (destination.kind === 'route') return 'page'
    if (destination.kind === 'top') return atTop() ? 'page' : undefined
    return destination.anchor === activeAnchor() ? 'section' : undefined
  }

  function resolveItem(item: ShellItem): ResolvedShellItem {
    const { destination } = item
    const href = resolveHref(item)
    const current = resolveCurrent(item)

    return {
      label: t(item.labelKey),
      /*
       * The keys are omitted rather than set to `undefined`, so an item with
       * no destination is structurally a label and nothing else.
       */
      ...(href === undefined ? {} : { href }),
      /*
       * A `mailto:` deliberately stays in the same browsing context: a new
       * tab for a mail link leaves the visitor staring at a blank page.
       */
      external:
        destination.kind === 'external' &&
        !destination.href.startsWith('mailto:'),
      ...(current === undefined ? {} : { current }),
      ...(destination.kind === 'top' ? { scrollsToTop: true as const } : {}),
      ...(item.track && href !== undefined
        ? { trackAttrs: trackAttrs(item.track) }
        : {}),
    }
  }

  return { resolveHref, resolveItem }
}

/**
 * Wires the resolver to the Nuxt runtime. Destinations are resolved by
 * **route name**, never by writing a path (feature 003, spec FR-018).
 */
export function useShellItemResolver(
  activeAnchor?: () => SectionAnchor | null,
  atTop?: () => boolean
): ShellItemResolver {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const routeBaseName = useRouteBaseName()
  const route = useRoute()

  return createShellItemResolver({
    t: key => t(key),
    localePath: target => localePath(target),
    currentRouteName: () => routeBaseName(route),
    activeAnchor,
    atTop,
  })
}
