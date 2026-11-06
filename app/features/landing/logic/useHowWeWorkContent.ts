import { type ComputedRef, computed } from 'vue'
import {
  HOW_WE_WORK_KEYS,
  type HowWeWorkContent,
  PROCESS_STEPS,
} from '@/features/landing/data/howWeWorkContent'

/**
 * "Cómo trabajamos"' seam with the Nuxt runtime (feature 44, data-model
 * § 4): the only place its keys meet `useI18n`.
 */
export function useHowWeWorkContent(): ComputedRef<HowWeWorkContent> {
  const { t } = useI18n()

  return computed<HowWeWorkContent>(() => ({
    pill: t(HOW_WE_WORK_KEYS.pill),
    headingFirst: t(HOW_WE_WORK_KEYS.headingFirst),
    headingSecond: t(HOW_WE_WORK_KEYS.headingSecond),
    steps: PROCESS_STEPS.map(step => ({
      number: step.number,
      title: t(HOW_WE_WORK_KEYS.stepTitle(step.key)),
      description: t(HOW_WE_WORK_KEYS.stepDescription(step.key)),
      descriptionShort: step.hasShort
        ? t(HOW_WE_WORK_KEYS.stepDescriptionShort(step.key))
        : undefined,
      commitment: t(HOW_WE_WORK_KEYS.stepCommitment(step.key)),
      icon: step.icon,
    })),
  }))
}
