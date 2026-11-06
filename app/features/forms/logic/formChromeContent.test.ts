import { describe, expect, it } from 'vitest'
import { resolveFormChrome, type Translate } from './formChromeContent'

/** A `t` that echoes the key and its named values, so the test can see
 * which key each field reads and what was interpolated. */
const echo: Translate = (key, named) =>
  named ? `${key}${JSON.stringify(named)}` : key

describe('resolveFormChrome', () => {
  it('should read every chrome string from the given namespace when resolved', () => {
    const chrome = resolveFormChrome(
      echo,
      'forms.application',
      { label: 'back', to: '/es' },
      '/es/privacidad'
    )

    expect(chrome.continue).toBe('forms.application.continue')
    expect(chrome.back).toBe('forms.application.back')
    expect(chrome.privacy).toEqual({
      label: {
        before: 'forms.application.privacy.before',
        link: 'forms.application.privacy.link',
        after: 'forms.application.privacy.after',
        newTab: 'forms.application.privacy.newTab',
        href: '/es/privacidad',
      },
      requiredHint: 'forms.application.privacy.requiredHint',
    })
    expect(chrome.retry).toBe('forms.application.retry')
    expect(chrome.success.action).toEqual({ label: 'back', to: '/es' })
  })

  it('should interpolate each step’s number, total and title when resolved', () => {
    const chrome = resolveFormChrome(
      echo,
      'forms.contact',
      { label: 'x' },
      '/en/privacy'
    )

    expect(chrome.progress[1]).toBe(
      'forms.contact.steps.progress{"n":1,"total":2,"title":"forms.contact.steps.titles.1"}'
    )
    expect(chrome.progress[2]).toContain('"n":2')
    expect(chrome.progress[2]).toContain('forms.contact.steps.titles.2')
  })

  it('should build the support link from the translated address when resolved', () => {
    const t: Translate = key =>
      key.endsWith('error.email') ? 'support@muush.dev' : key
    const chrome = resolveFormChrome(
      t,
      'forms.contact',
      { label: 'x' },
      '/en/privacy'
    )

    expect(chrome.error.email).toBe('support@muush.dev')
    expect(chrome.error.href).toBe('mailto:support@muush.dev')
  })
})
