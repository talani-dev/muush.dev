import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'
import PrimaryButton from '@/shared/ui/PrimaryButton.vue'
import FaqCard from './FaqCard.vue'
import { FAQ_CONTENT } from './faqFixtures.testing'

/** Feature 51 · spec FR-007, FR-008, FR-023; contract `ui-contract.md`. */
function render(locale: 'es' | 'en' = 'es') {
  return mount(FaqCard, { props: { card: FAQ_CONTENT[locale].card } })
}

describe('FaqCard', () => {
  it('should title the card with an h2 when rendered', () => {
    expect(render().find('h2').text()).toBe('¿Tienes otra pregunta?')
    expect(render('en').find('h2').text()).toBe('Have another question?')
  })

  it('should carry exactly one action, the booking button, when rendered', () => {
    const wrapper = render()
    const buttons = wrapper.findAllComponents(PrimaryButton)

    expect(buttons).toHaveLength(1)
    expect(buttons[0]?.find('span').text()).toBe('Agenda una llamada')
    expect(wrapper.text()).not.toContain('Diagnóstico gratis')
  })

  it('should open the booking page in a new tab, tracked as a faq call, when rendered', () => {
    const button = render().findComponent(PrimaryButton)

    expect(button.attributes()).toMatchObject({
      href: CALL_BOOKING_URL,
      target: '_blank',
      rel: 'noopener noreferrer',
      'data-track': 'book_call_click',
      'data-track-location': 'faq',
    })
  })

  it('should be full width below lg and its own width from lg when rendered', () => {
    const button = render().findComponent(PrimaryButton)

    expect(button.props('size')).toBe('block')
    expect(button.classes()).toEqual(
      expect.arrayContaining(['w-full', 'lg:w-auto'])
    )
  })

  it('should make the address a tracked mail link inside the text when rendered', () => {
    const link = render('en').find('p a')

    expect(link.text()).toBe('support@muush.dev')
    expect(link.attributes()).toMatchObject({
      href: 'mailto:support@muush.dev',
      'data-track': 'contact_click',
      'data-track-channel': 'email',
      'data-track-location': 'faq',
    })
    expect(render('en').find('p').text()).toBe(
      'Write to support@muush.dev or book a 30-minute call.'
    )
  })

  it('should hide the icon box from assistive technology when rendered', () => {
    const icon = render().find('.size-faq-icono-caja')

    expect(icon.attributes('aria-hidden')).toBe('true')
    expect(icon.html()).toContain('lucide · message-circle')
  })
})
