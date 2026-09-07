import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Lockup from '@/shared/ui/Lockup.vue'
import lockupSource from '@/shared/ui/Lockup.vue?raw'
import Wordmark from '@/shared/ui/Wordmark.vue'

/** The markup between `<template>` and `</template>`, comments excluded. */
const template = lockupSource.slice(
  lockupSource.indexOf('<template>'),
  lockupSource.indexOf('</template>')
)

describe('Lockup', () => {
  it('should inline the isotipo as svg markup when rendered', () => {
    const wrapper = mount(Lockup)

    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('img').exists()).toBe(false)
  })

  /**
   * The highest-value assertion in this suite. `branding.md`,
   * `design-extract.md` § 6 and `rules.md` § R3 all document
   * `strokeWidth = 12 × (width ÷ 70.5)`; that is a Pencil workaround, and
   * replicating it here would scale the stroke twice. The browser derives
   * 8.851 at 52 wide and 6.809 at 40 wide from the viewBox on its own.
   */
  it('should set no stroke thickness of its own when rendered', () => {
    const wrapper = mount(Lockup)
    const strokeWidths = [
      ...wrapper.html().matchAll(/stroke-width="([^"]+)"/g),
    ].map(match => match[1])

    expect(strokeWidths).toEqual(['12'])
    expect(template).not.toContain('stroke')
    expect(template).not.toContain('70.5')
  })

  it('should set only the isotipo width when rendered', () => {
    const wrapper = mount(Lockup)
    const svg = wrapper.find('svg')

    expect(svg.attributes('width')).toBeUndefined()
    expect(svg.attributes('height')).toBeUndefined()
    expect(svg.attributes('viewBox')).toBe('14.5 38.5 70.5 39.5')
    expect(wrapper.find('[aria-hidden="true"]').classes()).toContain(
      'w-isotipo'
    )
  })

  it('should hide the isotipo from assistive technology when rendered', () => {
    const wrapper = mount(Lockup)

    expect(
      wrapper.find('svg').element.closest('[aria-hidden="true"]')
    ).not.toBeNull()
  })

  it('should forward the full form to the wordmark by default', () => {
    const wrapper = mount(Lockup)

    expect(wrapper.findComponent(Wordmark).props('form')).toBe('full')
    expect(wrapper.text()).toContain('muush.dev')
  })

  it('should forward the short form to the wordmark when given one', () => {
    const wrapper = mount(Lockup, { props: { form: 'short' } })

    expect(wrapper.findComponent(Wordmark).props('form')).toBe('short')
    expect(wrapper.findComponent(Wordmark).text()).toBe('muush')
  })

  it('should not be a link when rendered', () => {
    const wrapper = mount(Lockup)

    expect(wrapper.find('a').exists()).toBe(false)
  })
})
