import { type ComputedRef, computed, type Ref, ref, toRaw } from 'vue'
import type {
  SubmissionOutcome,
  SubmissionProgress,
} from '@/features/forms/data/submissionContract'
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
 * "attempt" = form submit (Enviar), the application's "Reintentar subida",
 * or its "Enviar sin CV" after clearing the file. All three run
 * `attemptSubmit()` (feature 031, data-model § 4). "ready" = idle · invalid ·
 * server-error · cv-upload-error.
 *
 * | From                 | Event / guard             | To              |
 * |----------------------|---------------------------|-----------------|
 * | ready                | attempt, errors exist     | invalid         |
 * | ready                | attempt, spam guard trips | server-error    |
 * | ready                | attempt, valid            | busyStateFor(v) |
 * | uploading            | progress.cvUploaded()     | sending         |
 * | uploading · sending  | attempt                   | (ignored)       |
 * | uploading · sending  | outcome success           | success         |
 * | uploading · sending  | outcome field-errors      | invalid         |
 * | uploading            | outcome cv-upload-failed  | cv-upload-error |
 * | uploading · sending  | outcome failure           | server-error    |
 *
 * `busyStateFor` is `sending` unless the form says otherwise (the
 * application form says `uploading` when a CV is chosen). Leaving
 * `cv-upload-error` because the file changed is the application form's own
 * transition (`useApplicationForm.ts`).
 *
 * `success` is reachable only from a `success` outcome, which the flows
 * produce only from a 200 with `ok: true` (spec FR-012). A tripped spam guard
 * shows the generic error and keeps every value (spec OA-3, approved
 * 2026-10-05). Nothing is ever cleared on a failed attempt.
 */
export type SubmitState =
  | 'idle'
  | 'invalid'
  | 'uploading'
  | 'sending'
  | 'success'
  | 'server-error'
  | 'cv-upload-error'

export type BusyState = 'uploading' | 'sending'

export interface FormSubmitter<V, F extends string> {
  engage(host: HTMLElement): void
  submit(
    values: V,
    progress?: SubmissionProgress
  ): Promise<SubmissionOutcome<F>>
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
  /** The busy state a valid attempt enters; `sending` by default. */
  busyStateFor?: (values: V) => BusyState
}

export interface FormSubmitStateReturn<F extends string> {
  state: Ref<SubmitState>
  errors: ComputedRef<Partial<Record<F, string>>>
  firstInvalidFieldId: ComputedRef<F | undefined>
  honeypot: Ref<string>
  markInteractive: () => void
  onEngage: () => void
  onSubmit: (event: Event) => Promise<void>
  /** Runs one submission attempt; ignored while busy or after success. */
  attemptSubmit: () => Promise<void>
}

export function useFormSubmitState<V extends MarkableValues, F extends string>(
  options: FormSubmitStateOptions<V, F>
): FormSubmitStateReturn<F> {
  const { values, validate, fieldOrder, serverErrorKeys, submitter } = options
  const guard = useSpamGuard(options.now)
  const busyStateFor: (values: V) => BusyState =
    options.busyStateFor ?? (() => 'sending')
  const state = ref<SubmitState>('idle')
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
      state.value = 'success'
      return
    }
    if (outcome.kind === 'cv-upload-failed') {
      state.value = 'cv-upload-error'
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

  function isLocked(): boolean {
    return (
      state.value === 'uploading' ||
      state.value === 'sending' ||
      state.value === 'success'
    )
  }

  /* Moves the form to `sending` once the CV is confirmed uploaded; a no-op
     unless the attempt is still uploading. */
  const progress: SubmissionProgress = {
    cvUploaded: () => {
      if (state.value === 'uploading') state.value = 'sending'
    },
  }

  async function attemptSubmit(): Promise<void> {
    if (isLocked()) return

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
    const snapshot = { ...toRaw(values.value) }
    state.value = busyStateFor(snapshot)
    applyOutcome(await submitSafely(snapshot))
  }

  async function onSubmit(event: Event): Promise<void> {
    event.preventDefault()
    await attemptSubmit()
  }

  /* The submitter contract says `submit` never throws; this keeps a broken
     one from leaving the form in "Enviando…" forever. */
  async function submitSafely(snapshot: V): Promise<SubmissionOutcome<F>> {
    try {
      return await submitter.submit(snapshot, progress)
    } catch {
      return { kind: 'failure' }
    }
  }

  return {
    state,
    errors,
    firstInvalidFieldId,
    honeypot: guard.honeypot,
    markInteractive: guard.markInteractive,
    onEngage,
    onSubmit,
    attemptSubmit,
  }
}
