import { computed } from 'vue'
import { FOOTER_COLUMNS } from '@/features/shell/data/footerColumns'
import {
  MENU_ITEMS,
  NAV_CTA,
  NAV_ITEMS,
} from '@/features/shell/data/navigation'
import { SOCIAL_PROFILES } from '@/features/shell/data/socialProfiles'
import type {
  ResolvedFooterColumn,
  ResolvedShellItem,
  ResolvedSocial,
  ShellLocale,
} from '@/features/shell/data/types'
import { useNavCtaReveal } from '@/shared/logic/useNavCtaReveal'
import { resolveLocaleDestination } from './resolveLocaleDestination'
import { useShellItemResolver } from './useShellItemResolver'

/**
 * The single seam between the Nuxt runtime and the presentational layer.
 *
 * Only `logic/` reads `useI18n`, `useLocalePath`, `useSwitchLocalePath`,
 * `useRouteBaseName` or `useRoute` — here and in `useShellItemResolver`, which
 * holds the destination resolver this file shares with the not-found page
 * (feature 36). Everything it
 * returns is inert data, which is what lets every `ui/` component render with
 * no router and no i18n instance present — and what makes Storybook able to
 * detect a component that cheats (spec FR-008, research § R4).
 *
 * Destinations are resolved by **route name**, never by writing a path. The
 * translated segment lives in `nuxt.config.ts` under `i18n.pages` and nowhere
 * else (spec FR-018).
 */
export function useShellNavigation() {
  const { t, locale } = useI18n()
  const localePath = useLocalePath()
  const switchLocalePath = useSwitchLocalePath()
  const routeBaseName = useRouteBaseName()
  const route = useRoute()

  const activeLocale = computed<ShellLocale>(() =>
    locale.value === 'en' ? 'en' : 'es'
  )
  const otherLocale = computed<ShellLocale>(() =>
    activeLocale.value === 'es' ? 'en' : 'es'
  )

  const home = computed(() => localePath({ name: 'index' }))
  const currentRouteName = computed(() => routeBaseName(route))
  const { resolveItem } = useShellItemResolver()

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

  const socials = computed<ResolvedSocial[]>(() =>
    SOCIAL_PROFILES.map(profile => ({
      network: profile.network,
      href: profile.href,
      label: t(profile.labelKey),
    }))
  )

  /*
   * Anchorless by design. The fragment cannot exist at generate time
   * (`docs/business/rules.md` § R9), so it is appended at click time by
   * `LanguageToggle`; what ships in the HTML is a real, resolvable URL for
   * crawlers and for a visitor with no scripting.
   */
  const localeSwitchHref = computed(() =>
    resolveLocaleDestination(
      switchLocalePath(otherLocale.value),
      localePath({ name: 'index' }, otherLocale.value)
    )
  )

  /**
   * Whether the nav renders its `Cuéntanos tu proyecto` button
   * (`ui-map.md` § 2, Roberto, 2026-09-07).
   *
   * The **route** comparison stays here, because routes already live here, and
   * this is the single place a future page declares that it renders its own
   * call to action above the fold. **When** the button appears is the Hero's
   * to say, through the shared flag; this module imports nothing from
   * `landing` and `landing` imports nothing from here (Article III).
   *
   * It is evaluated identically on the server and on the client, which is what
   * keeps the landing's button hidden in the generated HTML rather than hidden
   * on mount, and what leaves a route that starts visible with nothing to
   * transition from (spec FR-044, FR-045).
   */
  const showNavCta = useNavCtaReveal(
    computed(() => currentRouteName.value === 'index')
  )

  const brand = computed(() => ({
    tagline: t('shell.footer.tagline'),
    category: t('shell.footer.category'),
    copyright: t('shell.footer.copyright'),
    location: t('shell.footer.location'),
  }))

  return {
    navItems,
    navCta,
    showNavCta,
    menuItems,
    footerColumns,
    socials,
    home,
    locale: activeLocale,
    localeSwitchHref,
    brand,
  }
}
