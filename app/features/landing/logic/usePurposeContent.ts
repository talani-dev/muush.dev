import { type ComputedRef, computed } from 'vue'
import {
  PURPOSE_KEYS,
  PURPOSE_NODES,
  type PurposeContent,
} from '@/features/landing/data/purposeContent'

/**
 * The landing module's **second and last** seam with the Nuxt runtime.
 *
 * Like `useHeroContent`, everything it returns is inert data, which is what
 * lets every `ui/` component of this section render with no i18n instance and
 * no router present — and what makes Storybook able to catch a component that
 * cheats (`docs/business/rules.md` § R23).
 *
 * It performs no fetch, holds no state, registers no listener and resolves no
 * destination: Propósito's cards are not links and its triggers go nowhere
 * (`ui-map.md` § 4, spec FR-009). It imports nothing from
 * `app/features/shell/` (Article III) — the `#proposito` identifier the shell
 * links to is declared only as this section's own `id`.
 */
export function usePurposeContent(): ComputedRef<PurposeContent> {
  const { t } = useI18n()

  return computed<PurposeContent>(() => ({
    eyebrow: t(PURPOSE_KEYS.eyebrow),
    carouselLabel: t(PURPOSE_KEYS.carouselLabel),
    nodes: PURPOSE_NODES.map(node => ({
      id: node.id,
      index: node.index,
      label: t(node.labelKey),
      copy: t(node.copyKey),
    })),
  }))
}
