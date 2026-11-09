import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import Heading from '@/shared/ui/Heading.vue'
import Pill from '@/shared/ui/Pill.vue'
import ShaderBackground from '@/shared/ui/ShaderBackground.vue'
import HowWeWorkSection from './HowWeWorkSection.vue'
import { HOW_WE_WORK_COPY } from './landingFixtures.testing'
import ProcessTimeline from './ProcessTimeline.vue'

/** Feature 44 · US4, FR-018…FR-022; pen extract-44 § 4. */
vi.mock('@/shared/logic/useShaderCanvas', () => ({
  useShaderCanvas: () => ({ isReady: ref(false), isFallback: ref(false) }),
}))

function render(locale: 'es' | 'en' = 'es') {
  return mount(HowWeWorkSection, { props: HOW_WE_WORK_COPY[locale] })
}

describe('HowWeWorkSection', () => {
  it('should carry the como-trabajamos anchor over the acanalado when rendered', () => {
    const wrapper = render()

    expect(wrapper.attributes('id')).toBe('como-trabajamos')
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['relative', 'isolate'])
    )
    expect(wrapper.findComponent(ShaderBackground).props('preset')).toBe(
      'howWeWork'
    )
  })

  it('should title the section with the proceso-size h2 when rendered', () => {
    const wrapper = render('en')

    expect(wrapper.findComponent(Pill).props('label')).toBe('How we work')
    expect(wrapper.findComponent(Heading).props()).toMatchObject({
      level: 2,
      size: 'proceso',
      first: 'First we understand how you operate,',
    })
  })

  it('should centre the head from lg and left-align it below when rendered', () => {
    const head = render().findComponent(Pill).element.parentElement

    expect(head?.className).toContain('items-start')
    expect(head?.className).toContain('lg:items-center')
    expect(head?.className).toContain('lg:text-center')
  })

  it('should hand the timeline the five steps when rendered', () => {
    expect(render().findComponent(ProcessTimeline).props('steps')).toHaveLength(
      5
    )
  })

  it('should fill the viewport below the header and centre its content when rendered', () => {
    /* Section framing (Roberto 2026-11-08, global.css): the section is the
       minimum height, its content layer grows into it and centres. */
    const wrapper = render()

    expect(wrapper.find('section').classes()).toEqual(
      expect.arrayContaining([
        'flex',
        'flex-col',
        'min-h-seccion-alto',
        /* Round 3: the jump lands on the section's own top edge. */
        '-scroll-mt-cabecera',
      ])
    )
    expect(wrapper.find('section > .z-10').classes()).toEqual(
      expect.arrayContaining([
        'flex',
        'flex-1',
        'flex-col',
        'justify-center',
        'pt-seccion-arriba',
        'pb-seccion-aire',
      ])
    )
    expect(wrapper.find('section > .z-10 > div').classes()).toEqual(
      expect.arrayContaining(['w-full', 'mx-auto', 'max-w-contenido'])
    )
  })

  it('should mark its root for section timing when rendered', () => {
    /* Feature 49 · `section_view` (tracking plan § 5). */
    expect(render().attributes('data-track-section')).toBe('how_we_work')
  })
})
