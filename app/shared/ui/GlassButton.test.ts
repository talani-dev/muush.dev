import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GlassButton from '@/shared/ui/GlassButton.vue'

/** Feature 42 · FR-013, FR-017, contract § 5, pen extract § 2 (`p0X8nQ`). */
const LABEL = 'Cómo trabajamos'

function render(props: Record<string, unknown> = {}) {
  return mount(GlassButton, { props: { label: LABEL, ...props } })
}

describe('GlassButton', () => {
  it('should render a router link when given to', () => {
    const wrapper = render({ to: '/es/#como-trabajamos' })

    expect(wrapper.findComponent({ name: 'NuxtLink' }).exists()).toBe(true)
    expect(wrapper.attributes('href')).toBe('/es/#como-trabajamos')
  })

  it('should render a plain anchor when given only href', () => {
    const wrapper = render({ href: 'https://example.com/agenda' })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('https://example.com/agenda')
  })

  it('should render a real button when given no destination', () => {
    const wrapper = render()

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('should show only its label and no icon when rendered', () => {
    const wrapper = render()

    expect(wrapper.text()).toBe(LABEL)
    expect(wrapper.find('svg').exists()).toBe(false)
  })

  it('should paint the Kit glass when rendered', () => {
    for (const expected of [
      'bg-btn2-fondo',
      'backdrop-blur-boton',
      'borde-luz',
      'borde-boton',
      'rounded-pill',
      'font-texto',
      'font-medium',
      'text-blanco',
    ]) {
      expect(render().classes()).toContain(expected)
    }
  })

  it('should switch from mobile to desktop metrics at lg when rendered', () => {
    for (const expected of [
      'py-boton-movil-y',
      'px-boton-movil-x',
      'text-boton-movil',
      'lg:py-boton-y',
      'lg:px-boton-vidrio-x',
      'lg:text-boton-vidrio',
    ]) {
      expect(render().classes()).toContain(expected)
    }
  })

  it('should disable the button and dim it when disabled', () => {
    const wrapper = render({ disabled: true })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('disabled:opacity-70')
  })

  it('should carry the Blanco keyboard focus ring when rendered', () => {
    expect(render().classes()).toContain('foco')
  })
})
