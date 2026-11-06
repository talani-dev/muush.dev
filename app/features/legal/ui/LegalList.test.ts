import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LegalList from './LegalList.vue'

const items = ['Uno.', 'Dos.', 'Tres.']

describe('LegalList', () => {
  it('should render bullets as a list with a red dot per item', () => {
    const wrapper = mount(LegalList, { props: { kind: 'bullets', items } })

    expect(wrapper.element.tagName).toBe('UL')
    expect(wrapper.findAll('li')).toHaveLength(3)
    expect(wrapper.findAll('.bg-red-muush-500')).toHaveLength(3)
  })

  it('should render steps as an ordered list numbered in red', () => {
    const wrapper = mount(LegalList, { props: { kind: 'steps', items } })
    const numbers = wrapper.findAll('li > span[aria-hidden="true"]')

    expect(wrapper.element.tagName).toBe('OL')
    expect(numbers.map(number => number.text())).toEqual(['1', '2', '3'])
    expect(numbers[0]?.classes()).toEqual(
      expect.arrayContaining(['text-red-muush-500', 'font-titulo'])
    )
  })
})
