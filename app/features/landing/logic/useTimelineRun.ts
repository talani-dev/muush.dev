import { onScopeDispose, type Ref, ref, watch } from 'vue'
import { useReducedMotion } from '@/shared/logic/useReducedMotion'
import { litAt, runPosition, runSchedule } from './timelineProgress'

/**
 * The desktop "Cómo trabajamos" run (feature 45, reopen 1, Roberto
 * 2026-11-02, FR-038). `target` is the share of the line the preview
 * points at (`useTimelineHover().progress`; `null` at rest). The returned
 * `progress`, `durationMs` and `delayMs` drive the fill's `scaleX`
 * transition (transform only); `lit` lights each column as the fill
 * reaches its dot (`runSchedule`), with one timer per changing column.
 *
 * A new target cancels the pending changes and starts from where the fill
 * is at that moment (`runPosition`), judged against what is lit now. Under reduced motion everything is instant: no delay, no
 * travel, every column at its final state at once. Timers are cleared when
 * the host goes away.
 */
export function useTimelineRun(
  target: Readonly<Ref<number | null>>,
  shares: () => number[],
  stepCount: number
) {
  const isReducedMotion = useReducedMotion()
  const progress = ref(0)
  const durationMs = ref(0)
  const delayMs = ref(0)
  const lit = ref<boolean[]>(Array.from({ length: stepCount }, () => false))
  let timers: ReturnType<typeof setTimeout>[] = []
  /* The run in flight, so a new target starts from where the fill is. */
  let current = { from: 0, to: 0, delayMs: 0, durationMs: 0, startedAt: 0 }

  function clearTimers(): void {
    for (const timer of timers) clearTimeout(timer)
    timers = []
  }

  function setLit(index: number, value: boolean): void {
    lit.value = lit.value.map((step, at) => (at === index ? value : step))
  }

  function run(next: number | null): void {
    const to = next ?? 0
    const lineShares = shares()
    const now = performance.now()
    clearTimers()
    progress.value = to
    if (isReducedMotion.value) {
      durationMs.value = 0
      delayMs.value = 0
      lit.value = litAt(to, lineShares)
      current = { from: to, to, delayMs: 0, durationMs: 0, startedAt: now }
      return
    }
    const from = runPosition(current, now - current.startedAt)
    const plan = runSchedule(from, to, lineShares, lit.value)
    durationMs.value = plan.durationMs
    delayMs.value = plan.delayMs
    current = {
      from,
      to,
      delayMs: plan.delayMs,
      durationMs: plan.durationMs,
      startedAt: now,
    }
    timers = plan.changes.map(change =>
      setTimeout(() => setLit(change.index, change.lit), change.atMs)
    )
  }

  watch(target, run)
  onScopeDispose(clearTimers)

  return { progress, durationMs, delayMs, lit }
}
