import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CONSENT_COPY } from '@/features/legal/data/legalFixtures.testing'
import ConsentSwitch from './ConsentSwitch.vue'
import CookieCategoryRow from './CookieCategoryRow.vue'

function category(index: 0 | 1 | 2) {
  const found = CONSENT_COPY.es.categories[index]
  if (!found) throw new Error(`no category ${index}`)
  return found
}

describe('CookieCategoryRow', () => {
  it('should show the always-on pill and no switch for a required category', () => {
    const wrapper = mount(CookieCategoryRow, {
      props: {
        category: category(0),
        alwaysOn: 'Siempre activas',
        checked: true,
      },
    })

    expect(wrapper.text()).toContain('Necesarias')
    expect(wrapper.text()).toContain('Siempre activas')
    expect(wrapper.findComponent(ConsentSwitch).exists()).toBe(false)
  })

  it('should show a switch named by the category for an optional one', async () => {
    const wrapper = mount(CookieCategoryRow, {
      props: {
        category: category(2),
        alwaysOn: 'Siempre activas',
        checked: false,
      },
    })
    const toggle = wrapper.findComponent(ConsentSwitch)

    expect(toggle.props('labelledBy')).toBe('cookies-advertising')
    expect(wrapper.find('#cookies-advertising').text()).toBe('Publicidad')
    await toggle.trigger('click')
    expect(wrapper.emitted('update:checked')?.[0]).toEqual([true])
  })

  it('should show the analytics row with its own switch and name', () => {
    const wrapper = mount(CookieCategoryRow, {
      props: {
        category: category(1),
        alwaysOn: 'Siempre activas',
        checked: false,
      },
    })

    expect(wrapper.findComponent(ConsentSwitch).props('labelledBy')).toBe(
      'cookies-analytics'
    )
    expect(wrapper.find('#cookies-analytics').text()).toBe('Analítica')
  })
})
