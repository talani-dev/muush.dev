import { type ComputedRef, computed } from 'vue'
import {
  FAQ_COPY_KEYS,
  FAQ_PRIMARY,
  FAQ_SECONDARY,
} from '@/features/shell/data/faq'
import type { ShellItem, StatusSectionProps } from '@/features/shell/data/types'
import { useShellItemResolver } from './useShellItemResolver'

/**
 * Resolves the Preguntas block for the active locale (feature 46, spec
 * FR-035, data-model § 3): the one-line title and the two buttons, through
 * the shell's resolver, so "Diagnóstico gratis" follows the i18n route map
 * and "Agenda una llamada" is marked external (a new tab).
 */
export function useFaqContent(): ComputedRef<StatusSectionProps> {
  const { t } = useI18n()
  const { resolveItem } = useShellItemResolver()

  return computed(() => faqSectionProps(key => t(key), resolveItem))
}

/** The block's props, pure: `t` and the resolver are the caller's. */
export function faqSectionProps(
  t: (key: string) => string,
  resolveItem: (item: ShellItem) => StatusSectionProps['primary']
): StatusSectionProps {
  return {
    preset: 'faq',
    headingFirst: t(FAQ_COPY_KEYS.title),
    primary: resolveItem(FAQ_PRIMARY),
    secondary: resolveItem(FAQ_SECONDARY),
  }
}
