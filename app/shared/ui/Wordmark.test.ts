import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Wordmark from '@/shared/ui/Wordmark.vue'

describe('Wordmark', () => {
  it('should render muush, the dot and dev when the form is full', () => {
    const wrapper = mount(Wordmark, { props: { form: 'full' } })

    expect(wrapper.text()).toBe('muush.dev')
  })

  it('should default to the full form when no form is given', () => {
    const wrapper = mount(Wordmark)

    expect(wrapper.text()).toBe('muush.dev')
  })

  it('should paint the separating dot in red-400 when the form is full', () => {
    const wrapper = mount(Wordmark, { props: { form: 'full' } })

    const dot = wrapper
      .findAll('span')
      .find(node => node.text() === '.' && node.classes().length > 0)

    expect(dot?.classes()).toContain('text-red-400')
  })

  it('should render only muush when the form is short', () => {
    const wrapper = mount(Wordmark, { props: { form: 'short' } })

    expect(wrapper.text()).toBe('muush')
    expect(wrapper.text()).not.toContain('.')
    expect(wrapper.text()).not.toContain('dev')
  })

  it('should use the logo typeface and the wordmark type role when rendered', () => {
    const wrapper = mount(Wordmark)

    expect(wrapper.classes()).toContain('font-poppins')
    expect(wrapper.classes()).toContain('text-wordmark')
    expect(wrapper.classes()).toContain('text-bone-100')
  })
})
