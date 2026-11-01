import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { BACKGROUND_PRESETS } from '@/shared/data/backgroundPresets'
import { useShaderCanvas } from '@/shared/logic/useShaderCanvas'
import ShaderBackground from '@/shared/ui/ShaderBackground.vue'

/**
 * Feature 42 · FR-021, FR-023, contract § 7, research R11. The composable is
 * stubbed (Article X: component tests in isolation), so these cases pin the
 * markup each state produces; the state machine itself is
 * `useShaderCanvas.test.ts`'s.
 */
vi.mock('@/shared/logic/useShaderCanvas', () => ({
  useShaderCanvas: vi.fn(),
}))

const isReady = ref(false)
const isFallback = ref(false)

beforeEach(() => {
  isReady.value = false
  isFallback.value = false
  vi.mocked(useShaderCanvas).mockReturnValue({ isReady, isFallback })
})

function render(preset: keyof typeof BACKGROUND_PRESETS = 'homeHero') {
  return mount(ShaderBackground, { props: { preset } })
}

describe('ShaderBackground', () => {
  it('should stay out of the accessibility tree and the pointer path when rendered', () => {
    const root = render()

    expect(root.attributes('aria-hidden')).toBe('true')
    for (const expected of [
      'pointer-events-none',
      'absolute',
      'inset-0',
      'z-0',
      'print:hidden',
    ]) {
      expect(root.classes()).toContain(expected)
    }
  })

  it('should show the preset poster as decoration when rendered', () => {
    const poster = render('howWeWork').find('img')

    expect(poster.attributes('alt')).toBe('')
    expect(poster.attributes('src')).toBe(BACKGROUND_PRESETS.howWeWork.poster)
    expect(poster.classes()).toContain('object-cover')
  })

  for (const preset of ['homeHero', 'aboutHero', 'faq', 'notFound'] as const) {
    it(`should load the poster eagerly at high priority when the preset is ${preset}`, () => {
      const poster = render(preset).find('img')

      expect(poster.attributes('loading')).toBe('eager')
      expect(poster.attributes('fetchpriority')).toBe('high')
    })
  }

  for (const preset of ['howWeWork', 'assessment', 'workWithUs'] as const) {
    it(`should load the poster lazily when the preset is ${preset}`, () => {
      const poster = render(preset).find('img')

      expect(poster.attributes('loading')).toBe('lazy')
      expect(poster.attributes('fetchpriority')).toBeUndefined()
    })
  }

  it('should keep the canvas transparent when no frame has been drawn', () => {
    expect(render().find('canvas').classes()).toContain('opacity-0')
  })

  it('should fade the canvas in when the first frame is drawn', async () => {
    const wrapper = render()

    isReady.value = true
    await wrapper.vm.$nextTick()

    const canvas = wrapper.find('canvas')
    expect(canvas.classes()).toContain('opacity-100')
    expect(canvas.classes()).toEqual(
      expect.arrayContaining(['duration-(--medio)', 'ease-muush'])
    )
  })

  it('should hide the canvas and keep the poster when it falls back', async () => {
    const wrapper = render()

    isFallback.value = true
    await wrapper.vm.$nextTick()

    expect(wrapper.find('canvas').classes()).toContain('hidden')
    expect(wrapper.find('img').exists()).toBe(true)
  })

  it('should hand the canvas and the preset to the composable when mounted', () => {
    render('faq')

    expect(vi.mocked(useShaderCanvas).mock.calls.at(-1)?.[1]).toMatchObject({
      value: BACKGROUND_PRESETS.faq,
    })
  })

  it('should put the poster in the server render when prerendered', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(ShaderBackground, { preset: 'homeHero' }),
      })
    )

    expect(html).toContain('<img')
    expect(html).toContain(BACKGROUND_PRESETS.homeHero.poster)
    expect(html).toContain('<canvas')
  })
})
