import { type ComputedRef, computed } from 'vue'
import {
  NOT_FOUND_COPY_KEYS,
  NOT_FOUND_HOME,
  NOT_FOUND_SHORTCUTS,
} from '@/features/shell/data/notFound'
import type { ResolvedShellItem } from '@/features/shell/data/types'
import { useShellItemResolver } from './useShellItemResolver'

/** What `NotFoundContent.vue` receives — every string and href resolved. */
export interface NotFoundContentProps {
  eyebrow: string
  headline: string
  body: string
  cta: ResolvedShellItem
  shortcutsLabel: string
  shortcuts: ResolvedShellItem[]
}

/**
 * Resolves the not-found page's copy and destinations for the active locale
 * (`specs/036-not-found-page/data-model.md` § 3), through the same resolver
 * the nav and footer use, so the About shortcut follows the i18n route map
 * like every other shell link.
 */
export function useNotFoundContent(): ComputedRef<NotFoundContentProps> {
  const { t } = useI18n()
  const { resolveItem } = useShellItemResolver()

  return computed(() => ({
    eyebrow: t(NOT_FOUND_COPY_KEYS.eyebrow),
    headline: t(NOT_FOUND_COPY_KEYS.headline),
    body: t(NOT_FOUND_COPY_KEYS.body),
    cta: resolveItem(NOT_FOUND_HOME),
    shortcutsLabel: t(NOT_FOUND_COPY_KEYS.shortcutsLabel),
    shortcuts: NOT_FOUND_SHORTCUTS.map(resolveItem),
  }))
}
