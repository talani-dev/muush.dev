import { type ComputedRef, computed } from 'vue'
import type {
  LegalPageContent,
  LegalPageModel,
} from '@/features/legal/data/types'
import { resolveLegalPage } from './resolveLegalPage'

/**
 * The Nuxt seam of a legal page (feature 48): the only place `ui/`'s copy
 * meets `useI18n`. Pages call it through the barrel with their model.
 */
export function useLegalPageContent(
  model: LegalPageModel
): ComputedRef<LegalPageContent> {
  const { t, locale } = useI18n()
  return computed(() => resolveLegalPage(model, key => t(key), locale.value))
}
