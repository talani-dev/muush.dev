import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, type Ref, ref } from 'vue'
import { installMatchMedia } from '@/shared/logic/fakeMediaQuery.testing'
import { REDUCED_MOTION_QUERY } from '@/shared/logic/useReducedMotion'
import { useTimelineRun } from './useTimelineRun'

/** Feature 45, reopen 1 · FR-038 (Roberto 2026-11-02). */
const SHARES = [0.01, 0.21, 0.41, 0.61, 0.81]
let restore: () => void = () => undefined

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
})

afterEach(() => {
  restore()
  vi.useRealTimers()
})

function host(reduced = false) {
  restore = installMatchMedia({ [REDUCED_MOTION_QUERY]: reduced }).restore
  const target: Ref<number | null> = ref(null)
  let run: ReturnType<typeof useTimelineRun> | undefined
  const wrapper = mount(
    defineComponent({
      setup() {
        run = useTimelineRun(target, () => SHARES, SHARES.length)
        return () => h('div')
      },
    })
  )
  if (!run) throw new Error('composable did not run')
  return { wrapper, target, run }
}

describe('useTimelineRun', () => {
  it('should set the travel and light the columns on timers when a step is previewed', async () => {
    const { target, run } = host()

    target.value = 0.41
    await nextTick()

    expect(run.progress.value).toBe(0.41)
    expect(run.delayMs.value).toBe(150)
    expect(run.durationMs.value).toBe(287)
    expect(run.lit.value).toEqual([false, false, false, false, false])
    vi.advanceTimersByTime(300)
    expect(run.lit.value).toEqual([true, true, false, false, false])
    vi.advanceTimersByTime(200)
    expect(run.lit.value).toEqual([true, true, true, false, false])
  })

  it('should be instant with no delay or travel when motion is reduced', async () => {
    const { target, run } = host(true)

    target.value = 0.41
    await nextTick()

    expect(run.durationMs.value).toBe(0)
    expect(run.delayMs.value).toBe(0)
    expect(run.lit.value).toEqual([true, true, true, false, false])
  })

  it('should cancel pending changes when the target changes and when the host goes away', async () => {
    const { wrapper, target, run } = host()
    target.value = 0.81
    await nextTick()
    vi.advanceTimersByTime(200)

    target.value = null
    await nextTick()
    vi.advanceTimersByTime(2_000)
    expect(run.lit.value).toEqual([false, false, false, false, false])

    target.value = 0.81
    await nextTick()
    wrapper.unmount()
    vi.advanceTimersByTime(2_000)
    expect(run.lit.value).toEqual([false, false, false, false, false])
  })
})
