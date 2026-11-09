import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import type { TrackingEvent } from '@/shared/data/trackingEvents'
import { onTrackingEvent, resetTrackingBus } from '@/shared/logic/trackingBus'
import Heading from '@/shared/ui/Heading.vue'
import Pill from '@/shared/ui/Pill.vue'
import FaqBand from './FaqBand.vue'
import FaqSection from './FaqSection.vue'
import { FAQ_CONTENT } from './faqFixtures.testing'

/**
 * Feature 51 · spec FR-010…FR-020, FR-024; contract `ui-contract.md`. The
 * composables are real (Vue only); the shader is stubbed.
 */
vi.mock('@/shared/logic/useShaderCanvas', () => ({
  useShaderCanvas: () => ({ isReady: ref(false), isFallback: ref(false) }),
}))

function render(locale: 'es' | 'en' = 'es') {
  return mount(FaqSection, {
    props: FAQ_CONTENT[locale],
    attachTo: document.body,
  })
}

function listen() {
  const events: TrackingEvent[] = []
  onTrackingEvent(event => events.push(event))
  return events
}

beforeEach(() => {
  window.history.replaceState(null, '', '/es/preguntas')
})

afterEach(() => {
  resetTrackingBus()
  document.body.innerHTML = ''
})

describe('FaqSection', () => {
  it('should frame the block like the other first blocks and centre its content when rendered', () => {
    const wrapper = render()

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining([
        'relative',
        'isolate',
        'flex',
        'flex-col',
        'min-h-portada-alto',
        'pt-seccion-arriba',
        'pb-seccion-aire',
      ])
    )
    expect(wrapper.find('section > .z-10').classes()).toEqual(
      expect.arrayContaining(['flex-1', 'justify-center'])
    )
    expect(wrapper.html()).not.toMatch(/faq-arriba|faq-abajo/)
  })

  it('should place the band beside the centred layer, never inside it', () => {
    const wrapper = render()
    const band = wrapper.findComponent(FaqBand)

    expect(band.element.parentElement).toBe(wrapper.element)
    expect(wrapper.find('section > .z-10 [data-faq-franja]').exists()).toBe(
      false
    )
  })

  it('should render the pill, the only h1 in two tones and the subtitle when rendered', () => {
    const wrapper = render('en')

    expect(wrapper.findComponent(Pill).props('label')).toBe('FAQ')
    expect(wrapper.findComponent(Pill).classes()).toContain('pill-aire')
    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.findComponent(Heading).props()).toMatchObject({
      level: 1,
      size: 'faq',
      first: 'Frequently asked',
      second: 'questions.',
    })
    expect(wrapper.text()).toContain('Clear answers before your assessment.')
  })

  it('should render all five panels and all twenty answers, four panels hidden, when rendered', () => {
    const wrapper = render()
    const panels = wrapper.findAll('[role="tabpanel"]')

    expect(panels).toHaveLength(5)
    expect(
      panels.filter(panel => panel.attributes('hidden') !== undefined)
    ).toHaveLength(4)
    expect(wrapper.findAll('section[aria-labelledby]')).toHaveLength(20)
    expect(panels[1]?.attributes('aria-labelledby')).toBe('faq-tab-precios')
    expect(panels[1]?.attributes('id')).toBe('faq-panel-precios')
  })

  it('should open only the first question of topic 01 when rendered', () => {
    const expanded = render().findAll('button[aria-expanded="true"]')

    expect(expanded).toHaveLength(1)
    expect(expanded[0]?.find('span').text()).toBe(
      '¿Qué es el diagnóstico gratis y qué recibo?'
    )
  })

  it('should show the chosen topic with its first question open when a tab is clicked', async () => {
    const wrapper = render()

    await wrapper.findAll('[role="tab"]')[2]?.trigger('click')

    const visible = wrapper.find('[role="tabpanel"]:not([hidden])')
    expect(visible.attributes('id')).toBe('faq-panel-proceso')
    expect(
      visible.find('button[aria-expanded="true"]').find('span').text()
    ).toBe('¿Cuánto tarda un proyecto?')
    expect(window.location.hash).toBe('#proceso')
    expect(wrapper.emitted('topicNamed')?.at(-1)).toEqual([2])
  })

  it('should select the topic the URL names when mounted', async () => {
    window.history.replaceState(null, '', '/en/faq#pricing')

    const wrapper = render('en')
    await nextTick()

    expect(
      wrapper.find('[role="tab"][aria-selected="true"]').attributes('id')
    ).toBe('faq-tab-pricing')
    expect(wrapper.emitted('topicNamed')).toEqual([[1]])
  })

  it('should follow the router fragment when the page passes a new one', async () => {
    const wrapper = render()

    await wrapper.setProps({ urlHash: '#trabaja-con-muush' })

    expect(
      wrapper.find('[role="tab"][aria-selected="true"]').attributes('id')
    ).toBe('faq-tab-trabaja-con-muush')
  })

  it('should move selection and focus with the arrow keys, wrapping, when pressed', async () => {
    const wrapper = render()
    const tablist = wrapper.find('[role="tablist"]')

    await tablist.trigger('keydown', { key: 'ArrowLeft' })
    await nextTick()

    expect(document.activeElement?.id).toBe('faq-tab-trabaja-con-muush')
    expect(wrapper.find('[role="tab"][tabindex="0"]').attributes('id')).toBe(
      'faq-tab-trabaja-con-muush'
    )

    await tablist.trigger('keydown', { key: 'Home' })
    await nextTick()
    expect(document.activeElement?.id).toBe('faq-tab-diagnostico')
  })

  it('should keep one question open per topic and close it on a second activation', async () => {
    const wrapper = render()
    const buttons = () =>
      wrapper.find('[role="tabpanel"]:not([hidden])').findAll('h3 button')

    await buttons()[2]?.trigger('click')
    expect(buttons().map(button => button.attributes('aria-expanded'))).toEqual(
      ['false', 'false', 'true', 'false', 'false']
    )

    await buttons()[2]?.trigger('click')
    expect(wrapper.findAll('button[aria-expanded="true"]')).toHaveLength(0)
  })

  it('should send faq_question_open only when a visitor opens a question', async () => {
    const events = listen()
    const wrapper = render()

    await wrapper.findAll('[role="tab"]')[4]?.trigger('click')
    expect(events).toEqual([])

    const buttons = wrapper
      .find('[role="tabpanel"]:not([hidden])')
      .findAll('h3 button')
    await buttons[1]?.trigger('click')
    await buttons[1]?.trigger('click')

    expect(events).toEqual([
      {
        name: 'faq_question_open',
        params: { faq_topic: 'work_with_muush', faq_question: 19 },
      },
    ])
  })

  it('should lay out two columns from lg and the card after the questions below it', () => {
    const wrapper = render()
    const grid = wrapper.find('.lg\\:grid-cols-faq')
    const children = grid.element.children
    const order = Array.from(children).map(child =>
      child.matches('[role="tablist"]')
        ? 'tabs'
        : child.querySelector('[role="tabpanel"]')
          ? 'questions'
          : child.querySelector('h2')
            ? 'card'
            : 'header'
    )

    expect(order).toEqual(['header', 'tabs', 'questions', 'card'])
    expect(grid.classes()).toEqual(
      expect.arrayContaining([
        'lg:grid',
        'lg:grid-rows-faq',
        'lg:gap-x-faq-columnas',
        'lg:gap-y-faq-izquierda-gap',
      ])
    )
    expect(children[2]?.className).toContain('lg:mt-faq-derecha-arriba')
    expect(children[2]?.className).toContain('lg:col-start-2')
  })
})
