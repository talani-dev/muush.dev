import { type ComputedRef, computed, type Ref, ref, toRaw } from 'vue'
import type { SubmissionOutcome } from '@/features/forms/data/submissionContract'
import { focusField } from './focusField'
import {
  activeServerErrors,
  createServerMarks,
  type ErrorKeyMap,
  type MarkableValues,
  mergeErrors,
  type ServerMarks,
} from './serverFieldErrors'
import { useSpamGuard } from './useSpamGuard'

/**
 * The submit state machine both forms share (data-model § 4). Each form's
 * composable supplies its values, its validator, its field order and its
 * server-field map; everything about *submitting* lives here once
 * (Constitution Article VIII).
 *
 * | From                         | Event / guard           | To           |
 * |------------------------------|-------------------------|--------------|
 * | idle · invalid · server-error | submit, errors exist    | invalid      |
 * | idle · invalid · server-error | submit, spam guard trips | server-error |
 * | idle · invalid · server-error | submit, valid           | sending      |
 * | sending                      | submit                  | (ignored)    |
 * | sending                      | outcome success         | success      |
 * | sending                      | outcome field-errors    | invalid      |
 * | sending                      | outcome failure         | server-error |
 *
 * `success` is reachable only from a `success` outcome, which the flows
 * produce only from a 200 with `ok: true` (spec FR-012). A tripped spam guard
 * shows the generic error and keeps every value (spec OA-3, approved
 * 2026-10-05). Nothing is ever cleared on a failed attempt.
 */
export type SubmitState =
  | 'idle'
  | 'invalid'
  | 'sending'
  | 'success'
  | 'server-error'

export interface FormSubmitter<V, F extends string> {
  engage(host: HTMLElement): void
  submit(values: V): Promise<SubmissionOutcome<F>>
}

export interface FormSubmitStateOptions<
  V extends MarkableValues,
  F extends string,
> {
  values: Ref<V>
  validate: (values: V) => Partial<Record<F, string>>
  fieldOrder: readonly F[]
  serverErrorKeys: ErrorKeyMap<F>
  submitter: FormSubmitter<V, F>
  challengeHost: Readonly<Ref<HTMLElement | null>>
  now?: () => number
}

export interface FormSubmitStateReturn<F extends string> {
  state: Ref<SubmitState>
  errors: ComputedRef<Partial<Record<F, string>>>
  firstInvalidFieldId: ComputedRef<F | undefined>
  /** `false` only after a success in which a chosen CV did not attach. */
  cvAttached: Ref<boolean>
  honeypot: Ref<string>
  markInteractive: () => void
  onEngage: () => void
  onSubmit: (event: Event) => Promise<void>
}

export function useFormSubmitState<V extends MarkableValues, F extends string>(
  options: FormSubmitStateOptions<V, F>
): FormSubmitStateReturn<F> {
  const { values, validate, fieldOrder, serverErrorKeys, submitter } = options
  const guard = useSpamGuard(options.now)
  const state = ref<SubmitState>('idle')
  const cvAttached = ref(true)
  const serverMarks = ref({}) as Ref<ServerMarks<F>>

  const errors = computed(() =>
    mergeErrors(
      validate(values.value),
      activeServerErrors(serverMarks.value, values.value),
      fieldOrder
    )
  )
  const firstInvalidFieldId = computed(
    () => Object.keys(errors.value)[0] as F | undefined
  )

  function onEngage(): void {
    const host = options.challengeHost.value
    if (host) submitter.engage(host)
  }

  function applyOutcome(outcome: SubmissionOutcome<F>): void {
    if (outcome.kind === 'success') {
      cvAttached.value = outcome.cvAttached
      state.value = 'success'
      return
    }
    if (outcome.kind === 'field-errors') {
      serverMarks.value = createServerMarks(
        outcome.fields,
        serverErrorKeys,
        values.value
      )
      state.value = 'invalid'
      void focusField(firstInvalidFieldId.value)
      return
    }
    state.value = 'server-error'
  }

  async function onSubmit(event: Event): Promise<void> {
    event.preventDefault()
    if (state.value === 'sending' || state.value === 'success') return

    if (firstInvalidFieldId.value) {
      state.value = 'invalid'
      void focusField(firstInvalidFieldId.value)
      return
    }
    if (guard.isBlocked()) {
      state.value = 'server-error'
      return
    }

    onEngage()
    state.value = 'sending'
    applyOutcome(await submitSafely({ ...toRaw(values.value) }))
  }

  /* The submitter contract says `submit` never throws; this keeps a broken
     one from leaving the form in "Enviando…" forever. */
  async function submitSafely(snapshot: V): Promise<SubmissionOutcome<F>> {
    try {
      return await submitter.submit(snapshot)
    } catch {
      return { kind: 'failure' }
    }
  }

  return {
    state,
    errors,
    firstInvalidFieldId,
    cvAttached,
    honeypot: guard.honeypot,
    markInteractive: guard.markInteractive,
    onEngage,
    onSubmit,
  }
}
