import { type ComputedRef, computed } from 'vue'
import {
  COMPOSITION_ORDER,
  TEAM_COMPOSITION_KEYS,
  type TeamCompositionContent,
} from '@/features/about/data/teamCompositionContent'

/**
 * "Cómo se arma"'s seam with the Nuxt runtime (feature 46): the only place
 * its keys meet `useI18n`. The cards come out in `COMPOSITION_ORDER`.
 */
export function useTeamCompositionContent(): ComputedRef<TeamCompositionContent> {
  const { t } = useI18n()

  return computed<TeamCompositionContent>(() => ({
    pill: t(TEAM_COMPOSITION_KEYS.pill),
    headingFirst: t(TEAM_COMPOSITION_KEYS.headingFirst),
    headingSecond: t(TEAM_COMPOSITION_KEYS.headingSecond),
    cards: COMPOSITION_ORDER.map(kind => {
      const keys = TEAM_COMPOSITION_KEYS.card(kind)
      return {
        kind,
        label: t(keys.label),
        title: t(keys.title),
        text: t(keys.text),
      }
    }),
  }))
}
