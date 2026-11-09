import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FaqPanel from './FaqPanel.vue'
import FaqQuestion from './FaqQuestion.vue'
import { FAQ_CONTENT } from './faqFixtures.testing'

/** Feature 51 · spec FR-010, FR-015; contract `ui-contract.md`. */
const TOPIC = FAQ_CONTENT.es.topics[3]

function render(selected: boolean, openIndex: number | null = 0) {
  if (!TOPIC) throw new Error('missing fixture')
  return mount(FaqPanel, {
    props: { topic: TOPIC, openIndex, selected, idPrefix: 'faq' },
  })
}

describe('FaqPanel', () => {
  it('should be a tab panel labelled by its tab when rendered', () => {
    const wrapper = render(true)

    expect(wrapper.attributes()).toMatchObject({
      role: 'tabpanel',
      id: 'faq-panel-entrega',
      'aria-labelledby': 'faq-tab-entrega',
    })
    expect(wrapper.attributes('tabindex')).toBeUndefined()
  })

  it('should render every question and open only the open one when selected', () => {
    const questions = render(true, 1).findAllComponents(FaqQuestion)

    expect(questions).toHaveLength(3)
    expect(questions.map(q => q.props('open'))).toEqual([false, true, false])
  })

  it('should stay in the markup, hidden and fully closed, when not selected', () => {
    const wrapper = render(false, 0)

    expect(wrapper.attributes('hidden')).toBeDefined()
    expect(
      wrapper.findAllComponents(FaqQuestion).map(q => q.props('open'))
    ).toEqual([false, false, false])
  })

  it('should emit the index of the question toggled when one is', async () => {
    const wrapper = render(true)

    await wrapper.findAll('h3 button')[2]?.trigger('click')

    expect(wrapper.emitted('toggle')).toEqual([[2]])
  })
})
