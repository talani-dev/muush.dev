import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import FormSuccess from './FormSuccess.vue'

afterEach(() => {
  document.body.replaceChildren()
})

const props = {
  title: 'Recibimos tu solicitud.',
  body: 'Te respondemos en 24 horas hábiles.',
  action: { label: 'Agenda una llamada', href: 'https://example.com' },
}

describe('FormSuccess', () => {
  it('should be announced and move focus to its title when it appears', () => {
    const wrapper = mount(FormSuccess, { props, attachTo: document.body })

    expect(wrapper.attributes('role')).toBe('status')
    expect(document.activeElement).toBe(wrapper.find('h3').element)
    expect(wrapper.find('h3').attributes('tabindex')).toBe('-1')
    wrapper.unmount()
  })

  it('should ping the red dot in its 56 / 64 tile', () => {
    const wrapper = mount(FormSuccess, { props })
    const dot = wrapper.find('[data-punto]')

    expect(dot.classes()).toEqual(
      expect.arrayContaining(['pulso', 'bg-red-muush-500', 'size-exito-punto'])
    )
    expect(dot.element.parentElement?.className).toContain('size-exito-tile')
    expect(dot.element.parentElement?.className).toContain(
      'md:size-exito-tile-escritorio'
    )
  })

  it('should render the body and the glass action to its destination', () => {
    const wrapper = mount(FormSuccess, { props })

    expect(wrapper.find('p').text()).toBe(props.body)
    expect(wrapper.find('a').attributes('href')).toBe('https://example.com')
    expect(wrapper.find('a').text()).toBe('Agenda una llamada')
  })

  it('should link internally when given to', () => {
    const wrapper = mount(FormSuccess, {
      props: { ...props, action: { label: 'Volver al inicio', to: '/es' } },
    })

    expect(wrapper.find('a').attributes('href')).toBe('/es')
  })

  it('should mark the action with its tracking attributes when it reports a click', () => {
    const wrapper = mount(FormSuccess, {
      props: {
        ...props,
        action: {
          label: 'Agenda una llamada',
          href: 'https://example.com',
          track: {
            name: 'book_call_click',
            params: { cta_location: 'form_success' },
          },
        },
      },
    })

    expect(wrapper.find('a').attributes('data-track')).toBe('book_call_click')
    expect(wrapper.find('a').attributes('data-track-location')).toBe(
      'form_success'
    )
  })

  it('should carry no tracking attribute when the action reports nothing', () => {
    const wrapper = mount(FormSuccess, {
      props: { ...props, action: { label: 'Volver al inicio', to: '/es' } },
    })

    expect(wrapper.find('a').attributes('data-track')).toBeUndefined()
  })
})
