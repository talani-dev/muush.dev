import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { ContactForm } from '@/features/forms'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'
import Heading from '@/shared/ui/Heading.vue'
import Pill from '@/shared/ui/Pill.vue'
import ReceivesList from '@/shared/ui/ReceivesList.vue'
import ShaderBackground from '@/shared/ui/ShaderBackground.vue'
import AssessmentSection from './AssessmentSection.vue'
import {
  ASSESSMENT_COPY,
  ASSESSMENT_FORM_COPY,
  STORY_ASSESSMENT_SUBMITTER,
} from './landingFixtures.testing'

/** Feature 45 · US1, FR-022…FR-025; pen extract-45 §§ 1, 4. */
vi.mock('@/shared/logic/useShaderCanvas', () => ({
  useShaderCanvas: () => ({ isReady: ref(false), isFallback: ref(false) }),
}))

function render(locale: 'es' | 'en' = 'es') {
  return mount(AssessmentSection, {
    props: {
      ...ASSESSMENT_COPY[locale],
      formContent: ASSESSMENT_FORM_COPY[locale],
      formSubmitter: STORY_ASSESSMENT_SUBMITTER,
    },
  })
}

describe('AssessmentSection', () => {
  it('should carry the diagnostico anchor over the assessment listón when rendered', () => {
    const wrapper = render()

    expect(wrapper.attributes('id')).toBe('diagnostico')
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['relative', 'isolate'])
    )
    expect(wrapper.findComponent(ShaderBackground).props('preset')).toBe(
      'assessment'
    )
  })

  it('should title the section with the diagnostico-size h2 and its pill when rendered', () => {
    const wrapper = render('en')

    expect(wrapper.findComponent(Pill).props('label')).toBe('First step')
    expect(wrapper.findComponent(Heading).props()).toMatchObject({
      level: 2,
      size: 'diagnostico',
      first: 'Request your',
      second: 'free assessment.',
    })
    expect(wrapper.find('h1').exists()).toBe(false)
  })

  it('should stack pill, heading, body, receives, form and call row in that DOM order', () => {
    const html = render().html()
    const positions = [
      html.indexOf('Primer paso'),
      html.indexOf('Pide tu diagnóstico'),
      html.indexOf('Cuéntanos qué quieres resolver'),
      html.indexOf('Lo que recibes'),
      html.indexOf('<form'),
      html.indexOf('¿Prefieres hablar?'),
    ]

    expect(positions.every(position => position > -1)).toBe(true)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
  })

  it('should pass the receivables and the form its copy when rendered', () => {
    const wrapper = render()

    expect(wrapper.findComponent(ReceivesList).props('items')).toHaveLength(3)
    expect(wrapper.findComponent(ContactForm).props('content')).toEqual(
      ASSESSMENT_FORM_COPY.es
    )
  })

  it('should link the call row to the call-booking page with the red arrow', () => {
    const link = render().find(`a[href="${CALL_BOOKING_URL}"]`)

    expect(link.text()).toMatch(/^Agenda una llamada/)
    expect(link.attributes('target')).toBe('_blank')
    expect(link.find('[aria-hidden="true"]').classes()).toContain(
      'text-red-muush-500'
    )
  })

  it('should draw the call question white and underline the link text with a red arrow (FR-040)', () => {
    const wrapper = render('en')
    const link = wrapper.find(`a[href="${CALL_BOOKING_URL}"]`)
    const text = link.find('[data-enlace-llamada]')

    const question = link.element.previousElementSibling
    expect(question?.textContent).toBe('Prefer to talk?')
    expect(question?.className).toBe('text-blanco')
    expect(link.classes()).toContain('text-blanco')
    expect(text.text()).toBe('Book a call')
    expect(text.classes()).toEqual(
      expect.arrayContaining([
        'underline',
        'decoration-1',
        'underline-offset-4',
      ])
    )
    expect(link.find('[aria-hidden="true"]').classes()).toContain(
      'text-red-muush-500'
    )
  })

  it('should place the call row under the intro and centre both against the panel from lg', () => {
    const grid = render().find('.lg\\:grid-cols-diagnostico')

    expect(grid.classes()).toEqual(
      expect.arrayContaining([
        'grid',
        'lg:grid-rows-diagnostico',
        'lg:gap-x-diagnostico-gap',
      ])
    )
    const [intro, form, call] = grid.element.children
    expect(intro?.className).toContain('lg:row-start-2')
    expect(form?.className).toContain('lg:row-span-4')
    expect(call?.className).toContain('lg:row-start-3')
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
    expect(render().attributes('data-track-section')).toBe('assessment')
  })

  it('should mark "Agenda una llamada" as the section book-call CTA', () => {
    const link = render().find(`a[href="${CALL_BOOKING_URL}"]`)

    expect(link.attributes('data-track')).toBe('book_call_click')
    expect(link.attributes('data-track-location')).toBe('assessment')
  })
})
