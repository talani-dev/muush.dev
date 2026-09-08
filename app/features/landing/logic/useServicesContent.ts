import { type ComputedRef, computed } from 'vue'
import {
  SERVICE_NODES,
  SERVICES_KEYS,
  type ServicesContent,
} from '@/features/landing/data/servicesContent'

/**
 * The landing module's Nuxt seam for Servicios.
 *
 * Everything it returns is inert data, which is what lets every `ui/`
 * component of this section render with no i18n instance present — and what
 * makes Storybook able to catch a component that cheats
 * (`docs/business/rules.md` § R23).
 *
 * It performs no fetch, holds no state, registers no listener and resolves no
 * destination — the section has no destination at all. It imports nothing
 * from `app/features/shell/` (Article III) — the `#servicios` identifier the
 * shell links to is declared only as this section's own `id`.
 */
export function useServicesContent(): ComputedRef<ServicesContent> {
  const { t } = useI18n()

  return computed<ServicesContent>(() => ({
    eyebrow: t(SERVICES_KEYS.eyebrow),
    deliveryLabel: t(SERVICES_KEYS.deliveryLabel),
    deliveryCopy: t(SERVICES_KEYS.deliveryCopy),
    nodes: SERVICE_NODES.map(node => ({
      id: node.id,
      index: node.index,
      name: t(node.nameKey),
      brief: t(node.briefKey),
    })),
  }))
}
