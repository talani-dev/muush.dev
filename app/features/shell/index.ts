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
export { useMobileMenu } from './logic/useMobileMenu'
export { useShellNavigation } from './logic/useShellNavigation'
export { default as SiteFooter } from './ui/SiteFooter.vue'
export { default as SiteNav } from './ui/SiteNav.vue'
