/**
 * The shell module's only public API (Constitution Article III).
 *
 * `MobileMenu`, `FooterColumn` and `LanguageToggle` are deliberately not
 * exported: they are composition detail of the two components below. No file
 * outside this directory may import a shell internal directly.
 */

export type {
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
export { default as NotFoundContent } from './ui/NotFoundContent.vue'
export { default as SiteFooter } from './ui/SiteFooter.vue'
export { default as SiteNav } from './ui/SiteNav.vue'
