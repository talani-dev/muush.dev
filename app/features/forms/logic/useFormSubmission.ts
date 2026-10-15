import type {
  ApplicationSubmitter,
  ContactSubmitter,
  SiteLocale,
} from '@/features/forms/data/submissionContract'
import { createEdgeCountryLookup } from './edgeCountry'
import { createFormsApiClient } from './formsApiClient'
import {
  type FlowDeps,
  submitApplicationFlow,
  submitContactFlow,
} from './submissionFlows'
import { createTurnstileTokenSource } from './useTurnstile'

/**
 * The forms module's only Nuxt-aware network code, and the only file in
 * `forms/` that reads `useRuntimeConfig()` (spec FR-001; research R1, R11).
 *
 * The pages call these and pass the result down as a `submitter` prop, so
 * `ui/` never calls a Nuxt composable or `fetch` (Constitution Article V,
 * `rules.md` § R23) and stories/component tests hand in a stub instead.
 *
 * Creating a submitter touches neither the network nor the DOM: Turnstile
 * loads on the form's first `engage()`, from a DOM event, so nothing here
 * runs during prerender.
 *
 * Feature 32 Amendment A1: each submitter also carries `lookupCountry`, the
 * same-origin `GET /__geo` of `edgeCountry.ts`, memoized per submitter (one
 * per page). It is browser-only by construction: the form calls it from its
 * first focus or the switch to WhatsApp, never at setup.
 */

function toSiteLocale(code: string): SiteLocale {
  return code === 'en' ? 'en' : 'es'
}

function useFlowDeps(): {
  deps: () => FlowDeps
  engage: (host: HTMLElement) => void
} {
  const { formsApiBaseUrl, turnstileSiteKey } = useRuntimeConfig().public
  const { locale } = useI18n()
  const client = createFormsApiClient({ baseUrl: formsApiBaseUrl })
  const tokens = createTurnstileTokenSource({ siteKey: turnstileSiteKey })

  return {
    /* Locale read at submit time: the payload carries the page's language,
       never anything derived from what the visitor typed (spec FR-009). */
    deps: () => ({
      client,
      getToken: tokens.getToken,
      locale: toSiteLocale(locale.value),
    }),
    engage: host => tokens.engage(host),
  }
}

export function useContactSubmitter(): ContactSubmitter {
  const { deps, engage } = useFlowDeps()
  return {
    engage,
    submit: values => submitContactFlow(values, deps()),
    lookupCountry: createEdgeCountryLookup(),
  }
}

export function useApplicationSubmitter(): ApplicationSubmitter {
  const { deps, engage } = useFlowDeps()
  return {
    engage,
    submit: (values, progress) =>
      submitApplicationFlow(values, deps(), progress),
    lookupCountry: createEdgeCountryLookup(),
  }
}
