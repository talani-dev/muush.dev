/**
 * The shell module's only public API (Constitution Article III).
 *
 * The header, the mobile menu and the footer are what the layout composes;
 * their parts (`NavLinkBar`, `MenuButton`, `SocialLinks`, `FooterColumns`,
 * `MobileFooter`, `LanguageToggle`) are composition detail and are not
 * exported. `NotFoundContent` is the v1 404 body, still rendered from its
 * quarantine (`ui/legacy/`) until feature 46 replaces it.
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
} from './data/types'
export { applyNotFoundLocaleRule } from './logic/notFoundLocale'
export { useMobileMenu } from './logic/useMobileMenu'
export {
  type NotFoundContentProps,
  useNotFoundContent,
} from './logic/useNotFoundContent'
export { useNotFoundDocument } from './logic/useNotFoundDocument'
export { usePageSeo } from './logic/usePageSeo'
export { useShellNavigation } from './logic/useShellNavigation'
export { useSiteSeo } from './logic/useSiteSeo'
export { default as NotFoundContent } from './ui/legacy/NotFoundContent.vue'
export { default as MobileMenu } from './ui/MobileMenu.vue'
export { default as SiteFooter } from './ui/SiteFooter.vue'
export { default as SiteHeader } from './ui/SiteHeader.vue'
