import { type Ref, ref } from 'vue'
import { MIN_FILL_TIME_MS } from '@/features/forms/data/submissionContract'

/**
 * The client-only half of the anti-spam of `ui-map.md` § 7 and contract § 9:
 * a honeypot and a minimum fill time. Either one blocks the submit in the
 * browser; neither is ever sent (the server rejects unknown keys, § 6).
 * Turnstile is the server-enforced half and lives elsewhere.
 *
 * `markInteractive()` is called by the form component on mount — the moment
 * the form becomes interactive in the browser (spec OA-1). Until then every
 * submit is blocked, which is only reachable by script. The clock is
 * injectable so tests never sleep.
 */
export interface SubmissionGuardInput {
  honeypot: string
  readyAt: number | null
  now: number
  minFillMs: number
}

export function isSubmissionBlocked({
  honeypot,
  readyAt,
  now,
  minFillMs,
}: SubmissionGuardInput): boolean {
  if (honeypot.trim() !== '') return true
  if (readyAt === null) return true
  return now - readyAt < minFillMs
}

export interface UseSpamGuardReturn {
  honeypot: Ref<string>
  markInteractive: () => void
  isBlocked: () => boolean
}

export function useSpamGuard(
  now: () => number = () => Date.now()
): UseSpamGuardReturn {
  const honeypot = ref('')
  let readyAt: number | null = null

  return {
    honeypot,
    markInteractive: () => {
      readyAt ??= now()
    },
    isBlocked: () =>
      isSubmissionBlocked({
        honeypot: honeypot.value,
        readyAt,
        now: now(),
        minFillMs: MIN_FILL_TIME_MS,
      }),
  }
}
