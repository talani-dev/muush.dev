import { describe, expect, it, vi } from 'vitest'
import {
  type ScrollClock,
  SETTLE_TIMEOUT_MS,
  STILL_FRAMES,
  whenScrollSettles,
} from './whenScrollSettles'

/** A frame-by-frame clock: each frame advances 16 ms and reads `positions`. */
function frames(positions: number[]) {
  let time = 0
  let frame = 0
  const queue: (() => void)[] = []
  const clock: ScrollClock = {
    scrollY: () => positions[Math.min(frame, positions.length - 1)] ?? 0,
    nextFrame: callback => queue.push(callback),
    now: () => time,
  }
  const run = (limit = 500) => {
    for (let step = 0; step < limit && queue.length > 0; step += 1) {
      frame += 1
      time += 16
      queue.shift()?.()
    }
    return frame
  }
  return { clock, run }
}

describe('whenScrollSettles', () => {
  it('should run the task once the scroll has stood still for a few frames', () => {
    const { clock, run } = frames([2846, 2000, 900, 100, 0, 0, 0, 0, 0])
    const task = vi.fn()

    whenScrollSettles(clock, task)
    const ranAt = run()

    expect(task).toHaveBeenCalledOnce()
    expect(ranAt).toBe(4 + STILL_FRAMES)
  })

  it('should run the task on a page that was not scrolling', () => {
    const { clock, run } = frames([0])
    const task = vi.fn()

    whenScrollSettles(clock, task)
    run()

    expect(task).toHaveBeenCalledOnce()
  })

  it('should give up waiting and run the task when the page never settles', () => {
    const moving = Array.from({ length: 1000 }, (_, index) => index)
    const { clock, run } = frames(moving)
    const task = vi.fn()

    whenScrollSettles(clock, task)
    const ranAt = run()

    expect(task).toHaveBeenCalledOnce()
    expect(ranAt * 16).toBeGreaterThanOrEqual(SETTLE_TIMEOUT_MS)
  })
})
