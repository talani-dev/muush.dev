import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import GlassButton from '@/shared/ui/GlassButton.vue'
import PrimaryButton from '@/shared/ui/PrimaryButton.vue'
import RotatingPill from '@/shared/ui/RotatingPill.vue'
import ShaderBackground from '@/shared/ui/ShaderBackground.vue'
import HeroSection from './HeroSection.vue'
import { HERO_COPY } from './landingFixtures.testing'

/** Feature 44 · US1, FR-004…FR-006; pen extract-44 § 1. */
vi.mock('@/shared/logic/useShaderCanvas', () => ({
  useShaderCanvas: () => ({ isReady: ref(false), isFallback: ref(false) }),
}))

function render(locale: 'es' | 'en' = 'es') {
  return mount(HeroSection, { props: HERO_COPY[locale] })
}

describe('HeroSection', () => {
  it('should render one h1 with both headline lines when rendered', () => {
    const wrapper = render()
    const headings = wrapper.findAll('h1')

    expect(headings).toHaveLength(1)
    expect(headings[0]?.text()).toBe('Hablamos negocio y código.')
    expect(headings[0]?.find('span.text-gris-400').text()).toBe('y código.')
  })

  it('should pass the four services to the rotating pill when rendered', () => {
    expect(render().findComponent(RotatingPill).props('items')).toEqual(
      HERO_COPY.es.pillItems
    )
  })

  it('should link the primary action to the assessment and the secondary to how we work when rendered', () => {
    const wrapper = render('en')
    const primary = wrapper.findComponent(PrimaryButton)
    const secondary = wrapper.findComponent(GlassButton)

    expect(primary.props()).toMatchObject({
      label: 'Free assessment',
      to: '/en#diagnostico',
      size: 'hero',
    })
    expect(secondary.props()).toMatchObject({
      label: 'How we work',
      to: '/en#como-trabajamos',
    })
    expect(primary.find('a').attributes('aria-current')).toBeUndefined()
    expect(secondary.find('a').attributes('aria-current')).toBeUndefined()
  })

  it('should paint the listón behind the content when rendered', () => {
    const wrapper = render()

    expect(wrapper.findComponent(ShaderBackground).props('preset')).toBe(
      'homeHero'
    )
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['relative', 'isolate', 'min-h-portada-alto'])
    )
  })

  it('should centre the column vertically below lg only and wrap the buttons when rendered', () => {
    const column = render().find('section > div.z-10')
    const buttons = column.find('div.flex-wrap')

    expect(column.classes()).toEqual(
      expect.arrayContaining([
        'pt-portada-arriba',
        'pb-portada-abajo',
        'gap-portada-gap',
        'max-lg:justify-center',
      ])
    )
    expect(buttons.classes()).toEqual(
      expect.arrayContaining([
        'items-center',
        'justify-center',
        'gap-portada-botones-gap',
        'pt-portada-botones-arriba',
      ])
    )
  })

  it('should render only the copy it is given when rendered in English', () => {
    const text = render('en').text()

    expect(text).toContain('We speak business')
    expect(text).toContain(HERO_COPY.en.subtitle)
    expect(text).not.toMatch(/negocio|Diagnóstico/)
  })
})
