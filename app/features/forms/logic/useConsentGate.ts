import { type Ref, ref } from 'vue'
import { focusField } from './focusField'

/**
 * The privacy consent gate (feature 45, spec FR-008…FR-010; Roberto
 * 2026-10-31: a required checkbox that enables sending and is never sent).
 *
 * `accepted` lives here and nowhere else: it is not a form value, so the
 * payload builders in `submissionPayloads.ts` cannot see it.
 *
 * `guard(handler)` wraps a form's submit handler. While the box is unticked
 * it stops the native submission, does not call the handler, and moves focus
 * to the checkbox, so a click, Enter in a field and `requestSubmit()` all
 * send nothing (spec FR-009, Edge Cases). Every other send path goes
 * through it too: the application's "Enviar sin CV" (review-45: a guard on
 * the submit event alone let it send after the box was unticked). Those
 * callers pass no event.
 */
export const CONSENT_FIELD_ID = 'privacy'

export interface UseConsentGateReturn {
  accepted: Ref<boolean>
  guard: <A extends unknown[]>(
    handler: (...args: A) => Promise<void>
  ) => (...args: A) => Promise<void>
}

export function useConsentGate(): UseConsentGateReturn {
  const accepted = ref(false)

  function guard<A extends unknown[]>(
    handler: (...args: A) => Promise<void>
  ): (...args: A) => Promise<void> {
    return async (...args) => {
      if (accepted.value) return handler(...args)
      const [event] = args
      if (event instanceof Event) event.preventDefault()
      await focusField(CONSENT_FIELD_ID)
    }
  }

  return { accepted, guard }
}
