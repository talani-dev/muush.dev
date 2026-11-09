import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import GlassButton from '@/shared/ui/GlassButton.vue'
import Heading from '@/shared/ui/Heading.vue'
import Pill from '@/shared/ui/Pill.vue'
import PrimaryButton from '@/shared/ui/PrimaryButton.vue'
import ShaderBackground from '@/shared/ui/ShaderBackground.vue'
import StatusSection from './StatusSection.vue'
import { STATUS_COPY } from './shellFixtures.testing'

/** Feature 46 · FR-035…FR-042; pen extract-46 §§ 3–4. The 404 only since
    feature 51 moved Preguntas to its own module. */
vi.mock('@/shared/logic/useShaderCanvas', () => ({
  useShaderCanvas: () => ({ isReady: ref(false), isFallback: ref(false) }),
}))

function render(locale: 'es' | 'en' = 'es') {
  return mount(StatusSection, { props: STATUS_COPY.notFound[locale] })
}

describe('StatusSection', () => {
  it('should render the heading as the only h1', () => {
    const wrapper = render('en')

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.findComponent(Heading).props()).toMatchObject({
      level: 1,
      first: "Let's get you back",
      second: 'somewhere familiar.',
    })
  })

  it('should route an internal secondary with to', () => {
    const link = render().findComponent(GlassButton)

    expect(link.props('to')).toBe('/es#diagnostico')
    expect(link.props('href')).toBeUndefined()
    expect(link.attributes('target')).toBeUndefined()
  })

  it('should select the diagnóstico size when the preset is notFound', () => {
    expect(render().findComponent(Heading).props('size')).toBe('diagnostico')
  })

  it('should send the primary with its arrow to the resolved href when rendered', () => {
    const primary = render('en').findComponent(PrimaryButton)

    expect(primary.props()).toMatchObject({
      to: '/en',
      label: 'Back to home',
      size: 'hero',
      icon: true,
    })
  })

  it('should mount the preset background as the first child when rendered', () => {
    const wrapper = render()

    expect(wrapper.findComponent(ShaderBackground).props('preset')).toBe(
      'notFound'
    )
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['relative', 'isolate'])
    )
  })

  it('should frame the page like the heroes and centre the content when rendered', () => {
    /* Section framing (Roberto 2026-11-08, global.css): the first block of
       its page, a full viewport, centred below the floating header. */
    const wrapper = render()

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining([
        'flex',
        'flex-col',
        'min-h-portada-alto',
        'pt-seccion-arriba',
        'pb-seccion-aire',
      ])
    )
    expect(wrapper.find('section > .z-10').classes()).toEqual(
      expect.arrayContaining(['flex-1', 'justify-center', 'items-center'])
    )
  })

  it('should add the drawn air above the 404 buttons when rendered', () => {
    const row = render().find('.gap-portada-botones-gap')

    expect(row.classes()).toEqual(
      expect.arrayContaining([
        'pt-error-botones-arriba',
        'self-stretch',
        'max-lg:-mx-gutter',
        'flex-wrap',
      ])
    )
  })

  it('should render no pill and no body copy when rendered', () => {
    const wrapper = render()

    expect(wrapper.findComponent(Pill).exists()).toBe(false)
    expect(wrapper.find('p').exists()).toBe(false)
  })

  it('should mark both buttons with their tracking attributes when given', () => {
    const copy = STATUS_COPY.notFound.es
    const wrapper = mount(StatusSection, {
      props: {
        ...copy,
        primary: {
          ...copy.primary,
          trackAttrs: {
            'data-track': 'assessment_cta_click',
            'data-track-location': 'not_found',
          },
        },
        secondary: {
          ...copy.secondary,
          trackAttrs: {
            'data-track': 'assessment_cta_click',
            'data-track-location': 'not_found',
          },
        },
      },
    })

    expect(wrapper.findComponent(PrimaryButton).attributes('data-track')).toBe(
      'assessment_cta_click'
    )
    expect(wrapper.findComponent(GlassButton).attributes('data-track')).toBe(
      'assessment_cta_click'
    )
  })
})
