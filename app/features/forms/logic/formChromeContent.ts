import type { FormChromeContent } from '@/features/forms/data/formChrome'
import { FORM_STEP_COUNT } from '@/features/forms/data/formSteps'

/**
 * The shared chrome of a v2 form, read from one forms namespace
 * (`forms.contact` or `forms.application`) with the page's `t` (feature 45,
 * data-model § 3). The success destination is the caller's: each form
 * links somewhere else. So is the privacy page's path (feature 48), which
 * the caller resolves through the i18n route map.
 *
 * Plain function over an injected `t`, so the two content composables share
 * it without either calling the other (Constitution Article VIII).
 */
export type Translate = (
  key: string,
  named?: Record<string, string | number>
) => string

export function resolveFormChrome(
  t: Translate,
  namespace: 'forms.contact' | 'forms.application',
  successAction: FormChromeContent['success']['action'],
  privacyHref: string
): FormChromeContent {
  const key = (path: string) => `${namespace}.${path}`
  const progress = (n: 1 | 2) =>
    t(key('steps.progress'), {
      n,
      total: FORM_STEP_COUNT,
      title: t(key(`steps.titles.${n}`)),
    })
  const email = t(key('error.email'))

  return {
    progress: { 1: progress(1), 2: progress(2) },
    continue: t(key('continue')),
    back: t(key('back')),
    privacy: {
      label: {
        before: t(key('privacy.before')),
        link: t(key('privacy.link')),
        after: t(key('privacy.after')),
        newTab: t(key('privacy.newTab')),
        href: privacyHref,
      },
      requiredHint: t(key('privacy.requiredHint')),
    },
    submit: t(key('submit')),
    sending: t(key('sending')),
    retry: t(key('retry')),
    error: {
      before: t(key('error.before')),
      email,
      href: `mailto:${email}`,
      after: t(key('error.after')),
    },
    success: {
      title: t(key('success.title')),
      body: t(key('success.body')),
      action: successAction,
    },
  }
}
