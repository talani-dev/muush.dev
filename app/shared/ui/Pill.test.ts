import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Pill from '@/shared/ui/Pill.vue'
import pillSource from '@/shared/ui/Pill.vue?raw'
import Radar from '@/shared/ui/Radar.vue'

describe('Pill', () => {
  it('should render a small radar when mounted', () => {
    const wrapper = mount(Pill, { props: { label: 'Propósito' } })

    const radar = wrapper.findComponent(Radar)
    expect(radar.exists()).toBe(true)
    expect(radar.classes()).toContain('size-radar-sm')
  })

  it('should render the caller-supplied label when given one', () => {
    const wrapper = mount(Pill, { props: { label: 'Work with muush' } })

    expect(wrapper.text()).toContain('Work with muush')
  })

  it('should carry the capsule geometry of the design when rendered', () => {
    const wrapper = mount(Pill, { props: { label: 'Servicios' } })

    for (const expected of [
      'rounded-full',
      'border',
      'border-glass-line',
      'bg-glass-dark',
      'gap-pill-gap',
      'py-pill-y',
      'ps-pill-start',
      'pe-pill-end',
    ]) {
      expect(wrapper.classes()).toContain(expected)
    }
  })

  it('should bake in no locale copy when its source is inspected', () => {
    const template = pillSource.slice(pillSource.indexOf('<template>'))

    for (const copy of ['Propósito', 'Servicios', 'Purpose', 'Services']) {
      expect(template).not.toContain(copy)
    }
  })
})
