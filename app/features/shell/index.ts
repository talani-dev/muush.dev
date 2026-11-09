/**
 * The shell module's only public API (Constitution Article III).
 *
 * The header, the mobile menu and the footer are what the layout composes;
 * their parts (`NavLinkBar`, `MenuButton`, `SocialLinks`, `FooterColumns`,
 * `MobileFooter`, `LanguageToggle`) are composition detail and are not
 * exported. `StatusSection` is the Muush 1.0 body of the 404 (feature 46;
 * Preguntas left it for its own `faq` module in feature 51); it replaced
 * the v1 `NotFoundContent`, deleted with its rings. `useLocaleSwitchHash`
 * lets Preguntas give the language toggle the other locale's topic anchor
 * (feature 51, spec FR-013).
 */

export type {
  ResolvedContactChannel,
  ResolvedFooterColumn,
  ResolvedShellItem,
  ResolvedSocial,
  ShellDestination,
  ShellItem,
  ShellLocale,
  ShellRouteName,
  StatusPreset,
  StatusSectionProps,
} from './data/types'
export { useLocaleSwitchHash } from './logic/localeSwitchHash'
export { applyNotFoundLocaleRule } from './logic/notFoundLocale'
export { useMobileMenu } from './logic/useMobileMenu'
export { useNotFoundContent } from './logic/useNotFoundContent'
export { useNotFoundDocument } from './logic/useNotFoundDocument'
export { usePageSeo } from './logic/usePageSeo'
export { useShellNavigation } from './logic/useShellNavigation'
export { useSiteSeo } from './logic/useSiteSeo'
export { default as MobileMenu } from './ui/MobileMenu.vue'
export { default as SiteFooter } from './ui/SiteFooter.vue'
export { default as SiteHeader } from './ui/SiteHeader.vue'
export { default as StatusSection } from './ui/StatusSection.vue'
