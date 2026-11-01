import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { ROTATION_INTERVAL_MS } from '@/shared/logic/useRotatingText'
import Pill from '@/shared/ui/Pill.vue'
import RotatingPill from '@/shared/ui/RotatingPill.vue'

/**
 * Feature 42 · FR-015, SC-008, contract § 3. The composable is real here and
 * the clock is fake, so the cases cover what a visitor and a screen reader
 * get: the first item on the server, every item once in a hidden list, an
 * `aria-hidden` animated label, no live region, and the hover pause.
 */
const ITEMS = [
  'Estrategia tecnológica',
  'Software, web y nube',
  'Automatización, datos e IA',
  'Diseño de producto y UX',
]

const mounted: { unmount(): void }[] = []

function render(items: string[] = ITEMS) {
  /* Vue Test Utils stubs `<Transition>` by default, so the swap is
     immediate; the slide itself is reviewed in the story. */
  const wrapper = mount(RotatingPill, { props: { items } })
  mounted.push(wrapper)
  return wrapper
}

const visibleLabel = (wrapper: ReturnType<typeof render>) =>
  wrapper.find('[data-rotativo]')

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  )
})

afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('RotatingPill', () => {
  it('should render the first item in the server render', async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(RotatingPill, { items: ITEMS }) })
    )

    expect(html).toContain(`data-rotativo`)
    expect(html).toMatch(new RegExp(`data-rotativo[^>]*>${ITEMS[0]}<`))
  })

  it('should compose the Kit pill when rendered', () => {
    expect(render().findComponent(Pill).exists()).toBe(true)
  })

  it('should list every item once for assistive technology when rendered', () => {
    const list = render().find('ul')

    expect(list.classes()).toContain('sr-only')
    expect(list.findAll('li').map(item => item.text())).toEqual(ITEMS)
  })

  it('should hide the animated label from assistive technology when rendered', () => {
    expect(visibleLabel(render()).attributes('aria-hidden')).toBe('true')
  })

  it('should announce nothing on rotation when rendered', () => {
    const wrapper = render()

    expect(wrapper.html()).not.toContain('aria-live')
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
  })

  it('should show the next item when the interval elapses', async () => {
    const wrapper = render()

    vi.advanceTimersByTime(ROTATION_INTERVAL_MS)
    await wrapper.vm.$nextTick()

    expect(visibleLabel(wrapper).text()).toBe(ITEMS[1])
  })

  it('should hold its item while the pointer rests on it', async () => {
    const wrapper = render()

    await wrapper.trigger('pointerenter')
    vi.advanceTimersByTime(ROTATION_INTERVAL_MS * 2)
    await wrapper.vm.$nextTick()
    expect(visibleLabel(wrapper).text()).toBe(ITEMS[0])

    await wrapper.trigger('pointerleave')
    vi.advanceTimersByTime(ROTATION_INTERVAL_MS)
    await wrapper.vm.$nextTick()
    expect(visibleLabel(wrapper).text()).toBe(ITEMS[1])
  })

  it('should never rotate when given a single item', async () => {
    const wrapper = render([ITEMS[0] ?? ''])

    vi.advanceTimersByTime(ROTATION_INTERVAL_MS * 3)
    await wrapper.vm.$nextTick()

    expect(visibleLabel(wrapper).text()).toBe(ITEMS[0])
  })
})
