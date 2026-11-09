import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FaqQuestion from './FaqQuestion.vue'
import { FAQ_CONTENT } from './faqFixtures.testing'

/** Feature 51 · spec FR-015…FR-017, FR-007; contract `ui-contract.md`. */
const TOPICS = FAQ_CONTENT.es.topics

function render(open: boolean, topic = 0, index = 0) {
  const question = TOPICS[topic]?.questions[index]
  if (!question) throw new Error('missing fixture')
  return mount(FaqQuestion, { props: { question, open } })
}

describe('FaqQuestion', () => {
  it('should wrap the toggle button in an h3 when rendered', () => {
    const wrapper = render(false)
    const button = wrapper.find('h3 > button')

    expect(button.exists()).toBe(true)
    expect(button.attributes('type')).toBe('button')
    expect(button.find('span').text()).toBe(
      '¿Qué es el diagnóstico gratis y qué recibo?'
    )
  })

  it('should point aria-controls at its labelled answer when rendered', () => {
    const wrapper = render(true)
    const button = wrapper.find('button')
    const answer = wrapper.find(`#${button.attributes('aria-controls')}`)

    expect(answer.exists()).toBe(true)
    expect(answer.element.tagName).toBe('SECTION')
    expect(answer.attributes('aria-labelledby')).toBe(button.attributes('id'))
  })

  it('should expose the open state and show the answer when open', () => {
    const wrapper = render(true)

    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('section').attributes('hidden')).toBeUndefined()
    expect(wrapper.find('[data-icono]').html()).toContain('lucide · x')
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['bg-carbon-800/60', 'borde-faq-activo'])
    )
  })

  it('should keep the answer in the markup but hidden when closed', () => {
    const wrapper = render(false)
    const answer = wrapper.find('section')

    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false')
    expect(answer.attributes('hidden')).toBeDefined()
    expect(answer.text()).toContain('Una revisión rápida de tu sitio')
    expect(wrapper.find('[data-icono]').html()).toContain('lucide · plus')
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['bg-negro-900/60', 'borde-faq'])
    )
  })

  it('should hide the round button from assistive technology when rendered', () => {
    expect(
      render(false).find('.size-faq-boton').attributes('aria-hidden')
    ).toBe('true')
  })

  it('should emit toggle and no tracking event when the button is clicked', async () => {
    const wrapper = render(false)

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('toggle')).toEqual([[]])
  })

  it('should render the privacy link inside the answer when the answer has one', () => {
    const link = render(true, 3, 2).find('section a')

    expect(link.text()).toBe('Aviso de privacidad')
    expect(link.attributes('href')).toBe('/es/privacidad')
  })

  it('should render the address as a tracked mail link in question 19', () => {
    const link = render(true, 4, 1).find('section a')

    expect(link.attributes('href')).toBe('mailto:support@muush.dev')
    expect(link.attributes()).toMatchObject({
      'data-track': 'contact_click',
      'data-track-location': 'faq',
      'data-track-channel': 'email',
    })
  })
})
