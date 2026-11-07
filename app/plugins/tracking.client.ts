import { startTracking } from '@/features/tracking'

/**
 * Feature 49 · starts consent-gated tracking once, in the browser only
 * (`.client`), so nothing runs during prerendering and the generated HTML
 * carries no vendor tag. The IDs are public runtime configuration
 * (`nuxt.config.ts`); everything else is the tracking feature's.
 */
export default defineNuxtPlugin(() => {
  const { gaMeasurementId, metaPixelId } = useRuntimeConfig().public
  startTracking({ gaMeasurementId, metaPixelId, router: useRouter() })
})
