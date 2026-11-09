import { computed, onScopeDispose, ref } from 'vue'
import {
  LEGAL_ITEMS,
  MOBILE_CONTACT_CHANNELS,
  MOBILE_FOOTER_LINKS,
} from '@/features/shell/data/contactChannels'
import { FOOTER_COLUMNS } from '@/features/shell/data/footerColumns'
import {
  MENU_ITEMS,
  NAV_CTA,
  NAV_ITEMS,
} from '@/features/shell/data/navigation'
import { SOCIAL_PROFILES } from '@/features/shell/data/socialProfiles'
import type {
  ResolvedContactChannel,
  ResolvedFooterColumn,
  ResolvedShellItem,
  ResolvedSocial,
  ShellLocale,
} from '@/features/shell/data/types'
import type { SectionAnchor } from '@/shared/data/sectionAnchors'
import { useLocaleSwitchHash } from './localeSwitchHash'
import { resolveLocaleDestination } from './resolveLocaleDestination'
import { switchLocaleWithFallback } from './switchLocaleInPlace'
import { useActiveSection } from './useActiveSection'
import { useLocaleSwitchScroll } from './useLocaleSwitchScroll'
import { useShellItemResolver } from './useShellItemResolver'

/**
 * The home sections the link bar can mark active: the anchor items of
 * `NAV_ITEMS` on the home route (today Servicios). Derived, so the item a
 * future feature adds is spied on without a second list.
 */
const SPIED_ANCHORS: readonly SectionAnchor[] = NAV_ITEMS.flatMap(item =>
  item.destination.kind === 'anchor' && item.destination.name === 'index'
    ? [item.destination.anchor]
    : []
)

/**
 * Counts rendered pages, so the scroll-spy re-reads the DOM of the page
 * navigated to (the layout persists across pages; the sections do not).
 */
function usePageRenderCount() {
  const count = ref(0)
  const stop = useNuxtApp().hook('page:finish', () => {
    count.value += 1
  })
  onScopeDispose(stop)
  return count
}

/**
 * The single seam between the Nuxt runtime and the shell's presentational
 * layer (feature 003, research § R4; rewritten for Muush 1.0 by feature 43).
 *
 * Only `logic/` reads `useI18n`, `useLocalePath`, `useSwitchLocalePath`,
 * `useRouteBaseName`, `useRoute` or `useError`. Everything returned is inert
 * data, which lets every `ui/` component render with no router and no i18n
 * instance (Storybook proves it, `rules.md` § R23). Destinations resolve by
 * **route name** through the i18n route map, never by writing a path.
 *
 * The CTA shows on every page, the 404 included (spec FR-004, confirmed by
 * Roberto 2026-11-01); the v1 CTA reveal composable was deleted in
 * feature 47.
 */
export function useShellNavigation() {
  const { t, locale, loadLocaleMessages } = useI18n()
  const localePath = useLocalePath()
  const switchLocalePath = useSwitchLocalePath()
  const routeBaseName = useRouteBaseName()
  const route = useRoute()
  const error = useError()

  const activeLocale = computed<ShellLocale>(() =>
    locale.value === 'en' ? 'en' : 'es'
  )
  const otherLocale = computed<ShellLocale>(() =>
    activeLocale.value === 'es' ? 'en' : 'es'
  )

  const home = computed(() => localePath({ name: 'index' }))
  const isHome = computed(
    () => !error.value && routeBaseName(route) === 'index'
  )
  const { activeAnchor, atTop } = useActiveSection(
    isHome,
    SPIED_ANCHORS,
    usePageRenderCount()
  )
  /*
   * `atTop` is gated by `isHome` too: the resolver already requires the
   * home route name, and the 404 (an error over any URL) must never light
   * the Home item, even under `/es`.
   */
  const { resolveItem } = useShellItemResolver(
    () => activeAnchor.value,
    () => isHome.value && atTop.value
  )

  const navItems = computed<ResolvedShellItem[]>(() =>
    NAV_ITEMS.map(resolveItem)
  )
  const navCta = computed<ResolvedShellItem>(() => resolveItem(NAV_CTA))
  const menuItems = computed<ResolvedShellItem[]>(() =>
    MENU_ITEMS.map(resolveItem)
  )

  const footerColumns = computed<ResolvedFooterColumn[]>(() =>
    FOOTER_COLUMNS.map(column => ({
      title: t(column.titleKey),
      items: column.items.map(resolveItem),
    }))
  )
  const contactChannels = computed<ResolvedContactChannel[]>(() =>
    MOBILE_CONTACT_CHANNELS.map(channel => ({
      ...resolveItem(channel),
      hint: t(channel.hintKey),
    }))
  )
  const mobileFooterLinks = computed<ResolvedShellItem[]>(() =>
    MOBILE_FOOTER_LINKS.map(resolveItem)
  )
  const legalItems = computed<ResolvedShellItem[]>(() =>
    LEGAL_ITEMS.map(resolveItem)
  )

  const socials = computed<ResolvedSocial[]>(() =>
    SOCIAL_PROFILES.map(profile => ({
      network: profile.network,
      href: profile.href,
      label: t(profile.labelKey),
    }))
  )

  /*
   * Anchorless by design. What ships in the HTML is a real, resolvable URL
   * for crawlers and for a visitor with no scripting. With scripting, the
   * toggle no longer carries the fragment either (spec FR-061, Roberto
   * 2026-11-01): it holds the visitor's position, and
   * `useLocaleSwitchScroll` restores it on the other locale's page.
   */
  useLocaleSwitchScroll()

  /* Feature 51 · the one page that names a fragment for the other locale:
     Preguntas, for the topic its URL names (`localeSwitchHash.ts`). */
  const localeSwitchHash = useLocaleSwitchHash()

  const localeSwitchHref = computed(() =>
    resolveLocaleDestination(
      switchLocalePath(otherLocale.value),
      localePath({ name: 'index' }, otherLocale.value),
      localeSwitchHash.value
    )
  )

  /** The toggle's accessible name names the destination (feature 21). */
  const localeSwitchLabel = computed(() =>
    activeLocale.value === 'en'
      ? t('shell.nav.switchToEs')
      : t('shell.nav.switchToEn')
  )

  /**
   * Whether the language toggle switches the page in place instead of
   * navigating (feature 39): only while an error is shown, the not-found
   * page, whose URL has no counterpart in the other locale. Same signal on
   * the server and the client, so the toggle hydrates without a mismatch.
   */
  const localeSwitchInPlace = computed(() => Boolean(error.value))

  /**
   * The in-place switch the toggle requests on the not-found page. If the
   * other locale's messages cannot be loaded, the visitor still gets a real
   * destination: the toggle's own href, the other locale's home.
   */
  function switchLocale(target: ShellLocale): Promise<void> {
    return switchLocaleWithFallback(
      target,
      { loadLocaleMessages, locale },
      () => window.location.assign(localeSwitchHref.value)
    )
  }

  const labels = computed(() => ({
    home: t('shell.nav.home'),
    nav: t('shell.nav.label'),
    menu: t('shell.menu.label'),
    menuOpen: t('shell.menu.open'),
    menuClose: t('shell.menu.close'),
    footer: t('shell.footer.label'),
  }))

  const brand = computed(() => ({
    tagline: t('shell.footer.tagline'),
    category: t('shell.footer.category'),
    copyright: t('shell.footer.copyright'),
  }))

  return {
    navItems,
    navCta,
    menuItems,
    footerColumns,
    contactChannels,
    mobileFooterLinks,
    legalItems,
    socials,
    home,
    labels,
    locale: activeLocale,
    localeSwitchHref,
    localeSwitchLabel,
    localeSwitchInPlace,
    switchLocale,
    brand,
  }
}
