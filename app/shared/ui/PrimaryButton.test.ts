import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PrimaryButton from '@/shared/ui/PrimaryButton.vue'

/**
 * Feature 42 · FR-012, FR-017, contract § 4, research R15, pen extract § 2
 * (`FcCCF`). `NuxtLink` is the global stub of `tests/setup.ts`.
 */
const LABEL = 'Diagnóstico gratis'

function render(props: Record<string, unknown> = {}) {
  return mount(PrimaryButton, { props: { label: LABEL, ...props } })
}

const icon = (wrapper: ReturnType<typeof render>) =>
  wrapper.find('[data-icono]')

describe('PrimaryButton', () => {
  it('should render a router link when given to', () => {
    const wrapper = render({ to: '/es/#diagnostico' })

    expect(wrapper.findComponent({ name: 'NuxtLink' }).exists()).toBe(true)
    expect(wrapper.attributes('href')).toBe('/es/#diagnostico')
  })

  it('should render a plain anchor when given only href', () => {
    const wrapper = render({ href: 'https://example.com/agenda' })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.findComponent({ name: 'NuxtLink' }).exists()).toBe(false)
    expect(wrapper.attributes('href')).toBe('https://example.com/agenda')
  })

  it('should render a real button of the given type when given no destination', () => {
    expect(render().attributes('type')).toBe('button')
    const submit = render({ type: 'submit' })

    expect(submit.element.tagName).toBe('BUTTON')
    expect(submit.attributes('type')).toBe('submit')
  })

  it('should use the label as its whole accessible text when rendered', () => {
    /* The arrow's SVG `<title>` is text content too, but it sits inside the
       `aria-hidden` wrapper, which removes it from the accessible name. */
    const wrapper = render()
    wrapper.find('[aria-hidden="true"]').element.remove()

    expect(wrapper.text()).toBe(LABEL)
  })

  it('should paint the Kit fill, edge and shadow when rendered', () => {
    for (const expected of [
      'bg-(image:--btn-fondo)',
      'borde-luz',
      'borde-btn',
      'shadow-boton',
      'rounded-pill',
      'font-texto',
      'font-semibold',
      'text-blanco',
    ]) {
      expect(render().classes()).toContain(expected)
    }
  })

  it('should switch from mobile to desktop metrics at lg when the size is hero', () => {
    const classes = render({ size: 'hero' }).classes()

    for (const expected of [
      'py-boton-movil-y',
      'px-boton-movil-x',
      'text-boton-movil',
      'lg:py-boton-y',
      'lg:px-boton-x',
      'lg:text-boton-hero',
    ]) {
      expect(classes).toContain(expected)
    }
  })

  it('should show the 20 px arrow at every width when the size is hero', () => {
    /* Pen extract § 9: the mobile hero draws the arrow too. */
    const classes = icon(render({ size: 'hero' })).classes()

    expect(classes).toContain('size-boton-icono')
    expect(classes).not.toContain('invisible')
    expect(classes.some(name => name.startsWith('lg:'))).toBe(false)
  })

  it('should use the nav metrics and a 16 px arrow when the size is nav', () => {
    const wrapper = render({ size: 'nav' })

    for (const expected of [
      'py-boton-nav-y',
      'px-boton-nav-x',
      'text-boton-nav',
    ]) {
      expect(wrapper.classes()).toContain(expected)
    }
    expect(icon(wrapper).classes()).toContain('size-boton-icono-nav')
    expect(icon(wrapper).classes()).not.toContain('invisible')
  })

  it('should fill the width with desktop metrics when the size is block', () => {
    const wrapper = render({ size: 'block', type: 'submit' })

    for (const expected of [
      'w-full',
      'py-boton-y',
      'px-boton-x',
      'text-boton-hero',
    ]) {
      expect(wrapper.classes()).toContain(expected)
    }
    expect(icon(wrapper).classes()).toContain('size-boton-icono')
  })

  it('should render no arrow when icon is false', () => {
    expect(icon(render({ icon: false })).exists()).toBe(false)
  })

  it('should hide the arrow from assistive technology when rendered', () => {
    const arrow = icon(render())

    expect(arrow.attributes('aria-hidden')).toBe('true')
    expect(arrow.html()).toContain('<svg')
  })

  it('should disable the button and dim it when disabled', () => {
    const wrapper = render({ disabled: true, label: 'Enviando…' })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining([
        'disabled:opacity-70',
        'disabled:cursor-progress',
      ])
    )
  })

  it('should carry the Blanco keyboard focus ring when rendered', () => {
    expect(render().classes()).toContain('foco')
  })
})

describe('PrimaryButton · unavailable (feature 45)', () => {
  it('should stay enabled and focusable but announce aria-disabled when unavailable', () => {
    const wrapper = render({ type: 'submit', unavailable: true })

    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(wrapper.attributes('disabled')).toBeUndefined()
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['opacity-70', 'cursor-not-allowed'])
    )
  })

  it('should point aria-describedby at the hint when given describedBy', () => {
    const wrapper = render({ unavailable: true, describedBy: 'privacy-hint' })

    expect(wrapper.attributes('aria-describedby')).toBe('privacy-hint')
  })

  it('should carry neither attribute nor the dimmed look when available', () => {
    const wrapper = render({ type: 'submit' })

    expect(wrapper.attributes('aria-disabled')).toBeUndefined()
    expect(wrapper.attributes('aria-describedby')).toBeUndefined()
    expect(wrapper.classes()).not.toContain('cursor-not-allowed')
  })

  it('should still emit the click when unavailable so the form guard can decide', async () => {
    const wrapper = render({ unavailable: true })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})
