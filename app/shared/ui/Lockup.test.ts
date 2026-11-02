import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Isotipo from '@/shared/ui/Isotipo.vue'
import Lockup from '@/shared/ui/Lockup.vue'
import Wordmark from '@/shared/ui/Wordmark.vue'

/** Feature 43 · FR-036, contract § 1, pen extract-43 § 1. */
describe('Lockup', () => {
  it('should render the isotipo then the wordmark when the form is full', () => {
    const wrapper = mount(Lockup)

    expect(wrapper.findComponent(Isotipo).exists()).toBe(true)
    expect(wrapper.findComponent(Wordmark).exists()).toBe(true)
    expect(wrapper.html().indexOf('<svg')).toBeLessThan(
      wrapper.html().indexOf('muush')
    )
  })

  it('should render the isotipo alone when the form is isotipo', () => {
    const wrapper = mount(Lockup, { props: { form: 'isotipo' } })

    expect(wrapper.findComponent(Isotipo).exists()).toBe(true)
    expect(wrapper.findComponent(Wordmark).exists()).toBe(false)
  })

  it('should space the two by the lockup gap and stroke in Blanco when rendered', () => {
    expect(mount(Lockup).classes()).toEqual(
      expect.arrayContaining(['gap-lockup', 'items-center', 'text-blanco'])
    )
  })

  it('should be decorative when rendered', () => {
    expect(mount(Lockup).attributes('aria-hidden')).toBe('true')
  })
})
