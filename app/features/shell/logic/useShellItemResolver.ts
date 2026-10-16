import type {
  ResolvedShellItem,
  ShellItem,
  ShellRouteName,
} from '@/features/shell/data/types'

/** What the resolver needs from the Nuxt runtime, and nothing else. */
export interface ShellItemResolverDeps {
  t: (key: string) => string
  localePath: (route: { name: ShellRouteName }) => string
  /**
   * Base name of the route being rendered (vue-router names may be symbols);
   * `undefined` on an unmatched one, such as the not-found page.
   */
  currentRouteName: () => string | symbol | undefined
}

export interface ShellItemResolver {
  resolveHref(item: ShellItem): string | undefined
  resolveItem(item: ShellItem): ResolvedShellItem
}

/**
 * The destination resolver, as a pure function of its three dependencies so
 * it can be unit-tested without a Nuxt app. Lifted verbatim from
 * `useShellNavigation` when the not-found page became its second consumer
 * (feature 36, `specs/036-not-found-page/research.md` R5 — DRY).
 */
export function createShellItemResolver({
  t,
  localePath,
  currentRouteName,
}: ShellItemResolverDeps): ShellItemResolver {
  /**
   * An anchor always resolves to the locale's home **plus** the hash, never
   * to a bare fragment: the footer renders on the About page too, where
   * `#proyectos` on its own points at nothing (spec FR-041).
   */
  function resolveHref(item: ShellItem): string | undefined {
    const { destination } = item

    switch (destination.kind) {
      case 'none':
        return undefined
      case 'route':
        return localePath({ name: destination.name })
      case 'anchor':
        return `${localePath({ name: destination.name })}${destination.hash}`
      case 'external': {
        const { href, messageKey } = destination
        if (!messageKey) return href
        return `${href}?text=${encodeURIComponent(t(messageKey))}`
      }
    }
  }

  function resolveItem(item: ShellItem): ResolvedShellItem {
    const { destination } = item
    const href = resolveHref(item)

    return {
      label: t(item.labelKey),
      /*
       * The key is omitted rather than set to `undefined`, so an item with no
       * destination is structurally a label and nothing else (spec FR-039).
       */
      ...(href === undefined ? {} : { href }),
      /*
       * A `mailto:` deliberately stays in the same browsing context: a new
       * tab for a mail link leaves the visitor staring at a blank page.
       */
      external:
        destination.kind === 'external' &&
        !destination.href.startsWith('mailto:'),
      current:
        destination.kind === 'route' && destination.name === currentRouteName(),
    }
  }

  return { resolveHref, resolveItem }
}

/**
 * Wires the resolver to the Nuxt runtime. Destinations are resolved by
 * **route name**, never by writing a path (spec FR-018 of feature 003).
 */
export function useShellItemResolver(): ShellItemResolver {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const routeBaseName = useRouteBaseName()
  const route = useRoute()

  return createShellItemResolver({
    t: key => t(key),
    localePath: target => localePath(target),
    currentRouteName: () => routeBaseName(route),
  })
}
