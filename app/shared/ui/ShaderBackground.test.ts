import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, h, isRef, ref, toValue } from 'vue'
import { renderToString } from 'vue/server-renderer'
import {
  BACKGROUND_PRESETS,
  type BackgroundPreset,
} from '@/shared/data/backgroundPresets'
import { DESKTOP_MEDIA_QUERY } from '@/shared/data/layout'
import { installMatchMedia } from '@/shared/logic/fakeMediaQuery.testing'
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
let media: ReturnType<typeof installMatchMedia>

beforeEach(() => {
  isReady.value = false
  isFallback.value = false
  vi.mocked(useShaderCanvas).mockReturnValue({ isReady, isFallback })
  media = installMatchMedia()
})

afterEach(() => media.restore())

/** The preset the component handed the composable, as it reads now. */
function drawnPreset(): BackgroundPreset {
  const handed = vi.mocked(useShaderCanvas).mock.calls.at(-1)?.[1]
  if (!handed || !isRef(handed)) throw new Error('no preset ref handed')
  return toValue(handed) as BackgroundPreset
}

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

  it('should render no poster and keep the canvas when the preset has none', () => {
    /* Feature 43 · the mobile menu's listón (research R7): its fallback is
       the host's own background, so there is no `<img>` to load. */
    const wrapper = render('mobileMenu')

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('canvas').exists()).toBe(true)
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

    expect(drawnPreset()).toMatchObject({
      shader: BACKGROUND_PRESETS.faq.shader,
      poster: BACKGROUND_PRESETS.faq.poster,
      priority: BACKGROUND_PRESETS.faq.priority,
    })
  })

  /* Feature 46 · FR-046, research R5 (Roberto 2026-11-02). */
  it('should draw with the compact uniforms when the viewport is below 1024', () => {
    render('notFound')

    expect(drawnPreset().uniforms).toEqual(
      BACKGROUND_PRESETS.notFound.compactUniforms
    )
  })

  it('should draw with the desktop uniforms when the viewport is 1024 or wider', () => {
    media.query(DESKTOP_MEDIA_QUERY).matches = true
    render('notFound')

    expect(drawnPreset().uniforms).toEqual(BACKGROUND_PRESETS.notFound.uniforms)
  })

  it('should swap the uniform set when the layout crosses 1024 while mounted', async () => {
    const wrapper = render('aboutHero')

    media.query(DESKTOP_MEDIA_QUERY).set(true)
    await wrapper.vm.$nextTick()

    expect(drawnPreset().uniforms).toEqual(
      BACKGROUND_PRESETS.aboutHero.uniforms
    )
  })

  it('should keep the desktop uniforms when a preset has no compact set', () => {
    render('mobileMenu')

    expect(drawnPreset().uniforms).toEqual(
      BACKGROUND_PRESETS.mobileMenu.uniforms
    )
    expect(drawnPreset()).not.toHaveProperty('compactUniforms')
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
