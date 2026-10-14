import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import CvUploadError from './CvUploadError.vue'

const props = {
  id: 'cv-upload-error',
  message:
    'No pudimos subir tu CV. Inténtalo de nuevo o envía la postulación sin CV.',
  retryLabel: 'Reintentar subida',
  submitWithoutCvLabel: 'Enviar sin CV',
}

const mounted: ReturnType<typeof mount>[] = []

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
})

function mountError() {
  const wrapper = mount(CvUploadError, { props, attachTo: document.body })
  mounted.push(wrapper)
  return wrapper
}

describe('CvUploadError', () => {
  it('should render the message in an alert region', () => {
    const wrapper = mountError()
    const alert = wrapper.find('[role="alert"]')

    expect(alert.exists()).toBe(true)
    expect(alert.find(`#${props.id}`).text()).toBe(props.message)
  })

  it('should render both actions as type=button', () => {
    const buttons = mountError().findAll('button')

    expect(buttons.map(button => button.text())).toEqual([
      props.retryLabel,
      props.submitWithoutCvLabel,
    ])
    for (const button of buttons) {
      expect(button.attributes('type')).toBe('button')
    }
  })

  it('should focus the retry action when mounted', () => {
    const wrapper = mountError()

    expect(document.activeElement).toBe(wrapper.findAll('button')[0]?.element)
  })

  it('should emit retry and submit-without-cv when the actions are clicked', async () => {
    const wrapper = mountError()
    const [retry, withoutCv] = wrapper.findAll('button')

    await retry?.trigger('click')
    await withoutCv?.trigger('click')

    expect(wrapper.emitted('retry')).toHaveLength(1)
    expect(wrapper.emitted('submit-without-cv')).toHaveLength(1)
  })

  it('should reference no fetch, XMLHttpRequest or Nuxt composable in its own source', () => {
    const source = readFileSync(
      join(
        process.cwd(),
        'app',
        'features',
        'forms',
        'ui',
        'CvUploadError.vue'
      ),
      'utf8'
    )

    expect(source).not.toMatch(
      /fetch\(|new XMLHttpRequest\(|useI18n\(|useRuntimeConfig\(|useNuxtApp\(/
    )
  })
})
