import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LegalIndexDisclosure from './LegalIndexDisclosure.vue'

const sections = [
  { id: 'a', nav: 'Primera' },
  { id: 'b', nav: 'Segunda' },
]

describe('LegalIndexDisclosure', () => {
  it('should start collapsed with the label as its summary', () => {
    const wrapper = mount(LegalIndexDisclosure, {
      props: { label: 'En esta página', sections },
    })

    expect((wrapper.element as HTMLDetailsElement).open).toBe(false)
    /* The chevron is aria-hidden; its SVG title is not part of the name. */
    expect(wrapper.find('summary').text()).toMatch(/^En esta página/)
    expect(wrapper.find('summary [aria-hidden="true"]').exists()).toBe(true)
  })

  it('should close after a link is chosen', async () => {
    const wrapper = mount(LegalIndexDisclosure, {
      props: { label: 'En esta página', sections },
    })
    const details = wrapper.element as HTMLDetailsElement
    details.open = true

    await wrapper.find('a[href="#b"]').trigger('click')

    expect(details.open).toBe(false)
  })
})
