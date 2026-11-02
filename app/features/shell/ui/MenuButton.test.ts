import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MenuButton from './MenuButton.vue'

/** Feature 43 · FR-007, FR-008, FR-016, contract § 5; pen extract-43 §§ 3–4. */
function render(props: { kind: 'open' | 'close'; expanded?: boolean }) {
  return mount(MenuButton, {
    props: { label: 'Abrir menú', ...props },
    attachTo: document.body,
  })
}

describe('MenuButton', () => {
  it('should be a named 36 px control when rendered', () => {
    const button = render({ kind: 'open' }).find('button')

    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('aria-label')).toBe('Abrir menú')
    for (const expected of [
      'size-control',
      'rounded-control',
      'border-linea-fuerte',
      'foco',
    ]) {
      expect(button.classes()).toContain(expected)
    }
  })

  it('should draw three Blanco lines when it opens the menu', () => {
    const lines = render({ kind: 'open' }).findAll('[data-linea]')

    expect(lines).toHaveLength(3)
    expect(lines[0]?.classes()).toEqual(
      expect.arrayContaining([
        'w-hamburguesa',
        'h-hamburguesa-trazo',
        'rounded-hamburguesa',
        'bg-blanco',
      ])
    )
  })

  it('should expose the open state when it opens the menu', () => {
    expect(render({ kind: 'open' }).attributes('aria-expanded')).toBe('false')
    expect(
      render({ kind: 'open', expanded: true }).attributes('aria-expanded')
    ).toBe('true')
  })

  it('should draw the 14 px X with a 1.6 round stroke when it closes the menu', () => {
    const wrapper = render({ kind: 'close' })
    const path = wrapper.find('[data-cerrar] path')

    expect(wrapper.find('[data-linea]').exists()).toBe(false)
    expect(wrapper.find('[data-cerrar]').classes()).toContain('size-cerrar')
    expect(path.attributes('stroke-width')).toBe('1.6')
    expect(path.attributes('stroke-linecap')).toBe('round')
    expect(wrapper.attributes('aria-expanded')).toBeUndefined()
  })

  it('should emit click when activated', async () => {
    const wrapper = render({ kind: 'open' })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('should take focus when asked to', () => {
    const wrapper = render({ kind: 'open' })

    ;(wrapper.vm as unknown as { focus: () => void }).focus()

    expect(document.activeElement).toBe(wrapper.element)
    wrapper.unmount()
  })
})
