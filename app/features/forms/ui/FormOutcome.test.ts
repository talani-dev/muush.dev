import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import FormOutcome from './FormOutcome.vue'

const mounted: ReturnType<typeof mount>[] = []

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
})

function mountOutcome(props: InstanceType<typeof FormOutcome>['$props']) {
  const wrapper = mount(FormOutcome, { props, attachTo: document.body })
  mounted.push(wrapper)
  return wrapper
}

describe('FormOutcome · success', () => {
  it('should announce the confirmation in a status live region and focus it when mounted', () => {
    const wrapper = mountOutcome({
      kind: 'success',
      message: 'Listo, ya lo recibimos.',
      errorFallback: 'support@muush.dev',
    })
    const confirmation = wrapper.find('p[tabindex="-1"]')

    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    expect(confirmation.text()).toBe('Listo, ya lo recibimos.')
    expect(document.activeElement).toBe(confirmation.element)
  })

  it('should render the note below the confirmation only when one is given', () => {
    const withNote = mountOutcome({
      kind: 'success',
      message: 'Gracias.',
      note: 'No pudimos adjuntar tu CV.',
      errorFallback: 'support@muush.dev',
    })
    const withoutNote = mountOutcome({
      kind: 'success',
      message: 'Gracias.',
      errorFallback: 'support@muush.dev',
    })

    expect(withNote.findAll('p').map(p => p.text())).toEqual([
      'Gracias.',
      'No pudimos adjuntar tu CV.',
    ])
    expect(withoutNote.findAll('p')).toHaveLength(1)
  })
})

describe('FormOutcome · server-error', () => {
  it('should render an alert with the support mailto link and take no focus when mounted', () => {
    const wrapper = mountOutcome({
      kind: 'server-error',
      message: 'No pudimos enviarlo.',
      errorFallback: 'support@muush.dev',
    })

    expect(wrapper.find('[role="alert"]').text()).toContain(
      'No pudimos enviarlo.'
    )
    expect(wrapper.find('a[href="mailto:support@muush.dev"]').text()).toBe(
      'support@muush.dev'
    )
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(document.activeElement).toBe(document.body)
  })

  it('should never show a note on an error, even if one is passed', () => {
    const wrapper = mountOutcome({
      kind: 'server-error',
      message: 'No pudimos enviarlo.',
      note: 'No pudimos adjuntar tu CV.',
      errorFallback: 'support@muush.dev',
    })

    expect(wrapper.text()).not.toContain('No pudimos adjuntar tu CV.')
  })
})
