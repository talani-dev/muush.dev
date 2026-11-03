/**
 * The shell module's only public API (Constitution Article III).
 *
 * The header, the mobile menu and the footer are what the layout composes;
 * their parts (`NavLinkBar`, `MenuButton`, `SocialLinks`, `FooterColumns`,
 * `MobileFooter`, `LanguageToggle`) are composition detail and are not
 * exported. `StatusSection` is the Muush 1.0 body of the 404 and of
 * Preguntas (feature 46), each fed by its own content seam; it replaced the
 * v1 `NotFoundContent`, deleted with its rings.
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
export { applyNotFoundLocaleRule } from './logic/notFoundLocale'
export { useFaqContent } from './logic/useFaqContent'
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
