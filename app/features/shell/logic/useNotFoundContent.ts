import { type ComputedRef, computed } from 'vue'
import {
  NOT_FOUND_ASSESSMENT,
  NOT_FOUND_COPY_KEYS,
  NOT_FOUND_HOME,
} from '@/features/shell/data/notFound'
import type { ShellItem, StatusSectionProps } from '@/features/shell/data/types'
import { useShellItemResolver } from './useShellItemResolver'

/**
 * Resolves the not-found page's copy and destinations for the active locale
 * (`specs/036-not-found-page/data-model.md` § 3; reshaped for the Muush 1.0
 * block in feature 46, data-model § 3), through the same resolver the nav
 * and footer use. A `computed` over `t` and the resolver, so after the
 * feature 39 in-place switch the heading and both buttons follow the new
 * locale, as the v1 button and shortcuts did.
 */
export function useNotFoundContent(): ComputedRef<StatusSectionProps> {
  const { t } = useI18n()
  const { resolveItem } = useShellItemResolver()

  return computed(() => notFoundSectionProps(key => t(key), resolveItem))
}

/** The block's props, pure: `t` and the resolver are the caller's. */
export function notFoundSectionProps(
  t: (key: string) => string,
  resolveItem: (item: ShellItem) => StatusSectionProps['primary']
): StatusSectionProps {
  return {
    preset: 'notFound',
    headingFirst: t(NOT_FOUND_COPY_KEYS.headingFirst),
    headingSecond: t(NOT_FOUND_COPY_KEYS.headingSecond),
    primary: resolveItem(NOT_FOUND_HOME),
    secondary: resolveItem(NOT_FOUND_ASSESSMENT),
  }
}
