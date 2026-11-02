import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useTimelineProgress } from '@/features/landing/logic/useTimelineProgress'
import { DESKTOP_MEDIA_QUERY } from '@/shared/data/layout'
import { installMatchMedia } from '@/shared/logic/fakeMediaQuery.testing'
import { HOW_WE_WORK_COPY } from './landingFixtures.testing'
import ProcessStep from './ProcessStep.vue'
import ProcessTimeline from './ProcessTimeline.vue'

/**
 * Feature 44 · FR-018…FR-020, FR-042…FR-047 (Roberto review and
 * clarification 2026-11-02). The rail composable is stubbed; the hover one
 * is real, with the list width and offsets stubbed (happy-dom has no
 * layout): a 1280-wide list of five columns 260 apart, 28 px dots.
 */
vi.mock('@/features/landing/logic/useTimelineProgress', () => ({
  useTimelineProgress: vi.fn(),
}))

let media: ReturnType<typeof installMatchMedia> | undefined

afterEach(() => {
  media?.restore()
  media = undefined
  document.body.innerHTML = ''
})

function render(lit: boolean[], fills: number[], attachTo?: HTMLElement) {
  vi.mocked(useTimelineProgress).mockReturnValue({
    lit: ref(lit),
    fills: ref(fills),
  })
  return mount(ProcessTimeline, {
    props: { steps: HOW_WE_WORK_COPY.es.steps },
    attachTo,
  })
}

async function renderDesktop() {
  media = installMatchMedia({ [DESKTOP_MEDIA_QUERY]: true })
  const wrapper = render(Array(5).fill(true), Array(5).fill(1), document.body)
  const list = wrapper.find('ol').element as HTMLElement
  Object.defineProperty(list, 'clientWidth', { value: 1280 })
  ;[...list.children].forEach((step, i) => {
    Object.defineProperty(step, 'offsetLeft', { value: i * 260 })
    const dot = step.querySelector('[data-punto-paso]')
    Object.defineProperty(dot, 'offsetLeft', { value: 0 })
    Object.defineProperty(dot, 'offsetWidth', { value: 28 })
  })
  await nextTick()
  return { wrapper, steps: wrapper.findAllComponents(ProcessStep) }
}

describe('ProcessTimeline', () => {
  it('should list the five steps in an ordered list when rendered', () => {
    const wrapper = render(Array(5).fill(true), Array(5).fill(1))

    expect(wrapper.find('ol').classes()).toEqual(
      expect.arrayContaining(['lg:grid-cols-5', 'lg:gap-x-pasos'])
    )
    expect(wrapper.findAllComponents(ProcessStep)).toHaveLength(5)
    expect(wrapper.findAllComponents(ProcessStep).at(-1)?.props('isLast')).toBe(
      true
    )
  })

  it('should rest as a grey unlit line with no red when nothing is previewed', () => {
    /* FR-044: no scroll fill on desktop, on the server or anywhere else. */
    const wrapper = render(Array(5).fill(true), Array(5).fill(1))
    const line = wrapper.find('[data-linea]')

    expect(wrapper.attributes('style')).toContain('--progreso: 0')
    expect(line.classes()).toEqual(
      expect.arrayContaining(['bg-linea-fuerte', 'hidden', 'lg:block'])
    )
    expect(line.attributes('data-vista-previa')).toBeUndefined()
    expect(line.find('[data-relleno]').classes()).toEqual(
      expect.arrayContaining([
        'scale-x-(--progreso)',
        'origin-left',
        'bg-red-muush-500',
        'motion-reduce:transition-none',
      ])
    )
    expect(wrapper.html()).not.toContain('--proceso-linea')
  })

  it('should pass the rail its scroll state and rest every column unlit when rendered', () => {
    const steps = render(
      [true, true, false, false, false],
      [1, 0.5, 0, 0, 0]
    ).findAllComponents(ProcessStep)

    expect(steps.map(step => step.props('lit'))).toEqual([
      true,
      true,
      false,
      false,
      false,
    ])
    expect(steps.map(step => step.props('fill'))).toEqual([1, 0.5, 0, 0, 0])
    expect(steps.every(step => step.props('columnLit') === false)).toBe(true)
  })

  it('should stay unlit on desktop whatever the rail state when nothing is hovered', async () => {
    const { steps } = await renderDesktop()

    expect(steps.every(step => !step.props('columnLit'))).toBe(true)
    expect(steps.every(step => !step.props('raised'))).toBe(true)
  })

  it.each([
    [0, 14, [true, false, false, false, false]],
    [2, 534, [true, true, true, false, false]],
    [4, 1054, [true, true, true, true, true]],
  ])(
    'should paint red to dot %i and light up to it when that step is hovered',
    async (index, centre, expected) => {
      const { wrapper, steps } = await renderDesktop()

      await steps[index]?.trigger('mouseenter')

      const line = wrapper.find('[data-linea]')
      expect(line.attributes('data-vista-previa')).toBe('true')
      expect(wrapper.attributes('style')).toContain(
        `--progreso: ${centre / 1280}`
      )
      expect(steps.map(step => step.props('columnLit'))).toEqual(expected)
      expect(steps.map(step => step.props('raised'))).toEqual(
        expected.map((_, i) => i === index)
      )
    }
  )

  it('should return to the unlit rest when the pointer leaves the step', async () => {
    const { wrapper, steps } = await renderDesktop()

    await steps[4]?.trigger('mouseenter')
    await steps[4]?.trigger('mouseleave')

    expect(wrapper.attributes('style')).toContain('--progreso: 0')
    expect(
      wrapper.find('[data-linea]').attributes('data-vista-previa')
    ).toBeUndefined()
    expect(steps.every(step => !step.props('columnLit'))).toBe(true)
    expect(steps.every(step => !step.props('raised'))).toBe(true)
  })

  it('should make the steps tab stops and preview the keyboard-focused one from lg', async () => {
    const { steps } = await renderDesktop()
    const first = steps[0]
    if (!first) throw new Error('step missing')

    expect(steps.every(step => step.attributes('tabindex') === '0')).toBe(true)
    ;(first.element as HTMLElement).focus()
    await first.trigger('focusin')

    expect(steps.map(step => step.props('columnLit'))).toEqual([
      true,
      false,
      false,
      false,
      false,
    ])
    expect(first.props('raised')).toBe(true)
  })

  it('should have no hover preview and no tab stops below lg', async () => {
    media = installMatchMedia({ [DESKTOP_MEDIA_QUERY]: false })
    const wrapper = render(Array(5).fill(true), Array(5).fill(1))
    const steps = wrapper.findAllComponents(ProcessStep)

    await steps[0]?.trigger('mouseenter')

    expect(steps.every(step => step.props('lit'))).toBe(true)
    expect(steps.every(step => !step.props('columnLit'))).toBe(true)
    expect(steps.every(step => !step.props('raised'))).toBe(true)
    expect(steps[0]?.attributes('tabindex')).toBeUndefined()
  })
})
