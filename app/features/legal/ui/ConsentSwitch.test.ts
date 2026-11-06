import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ConsentSwitch from './ConsentSwitch.vue'

function render(checked: boolean) {
  return mount(ConsentSwitch, {
    props: { checked, labelledBy: 'cookies-advertising' },
  })
}

describe('ConsentSwitch', () => {
  it('should be a named switch reporting its state', () => {
    const wrapper = render(false)

    expect(wrapper.attributes('role')).toBe('switch')
    expect(wrapper.attributes('aria-checked')).toBe('false')
    expect(wrapper.attributes('aria-labelledby')).toBe('cookies-advertising')
  })

  it('should emit the opposite state when clicked', async () => {
    const wrapper = render(false)

    await wrapper.trigger('click')

    expect(wrapper.emitted('update:checked')?.[0]).toEqual([true])
  })

  it('should draw off as drawn and on as derived', () => {
    expect(render(false).classes()).toContain('bg-carbon-700')
    expect(render(true).classes()).toContain('bg-red-muush-500')
    expect(render(true).find('span').classes()).toContain(
      'translate-x-perilla-recorrido'
    )
  })
})
