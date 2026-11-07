import { afterEach, describe, expect, it } from 'vitest'
import { initialApplicationFormValues } from '@/features/forms/data/applicationFields'
import { initialContactFormValues } from '@/features/forms/data/contactFields'
import {
  MIN_FILL_TIME_MS,
  type SubmissionOutcome,
} from '@/features/forms/data/submissionContract'
import type { FormsApiClient } from '@/features/forms/logic/formsApiClient'
import {
  type FlowDeps,
  submitApplicationFlow,
  submitContactFlow,
} from '@/features/forms/logic/submissionFlows'
import { useApplicationForm } from '@/features/forms/logic/useApplicationForm'
import { useContactForm } from '@/features/forms/logic/useContactForm'
import { createGoogleAnalytics } from '@/features/tracking/logic/googleAnalytics'
import { createMetaPixel } from '@/features/tracking/logic/metaPixel'
import {
  fakeBrowser,
  fbqCalls,
  gtagCalls,
} from '@/features/tracking/logic/vendorFakes.testing'
import {
  ABOUT_SECTIONS,
  CONTACT_CHANNELS,
  CTA_LOCATIONS,
  CV_RESULTS,
  FORM_ERROR_TYPES,
  FORM_FIELD_IDS,
  FORM_IDS,
  FORM_RESPONSE_RESULTS,
  HOME_SECTIONS,
  PAGE_KEYS,
  SITE_LOCALES,
} from '@/shared/data/trackingEvents'
import { onTrackingEvent, resetTrackingBus } from '@/shared/logic/trackingBus'

/**
 * Feature 49 · no personal data reaches Google Analytics or Meta (spec
 * FR-026, FR-066, SC-005, SC-009; tasks T040, T067). The real forms
 * composables and flows run a whole assessment and a whole application with
 * real-looking personal data, against the real GA4 and Meta sinks on a fake
 * browser; every call either vendor received is then searched for it.
 *
 * The single exception is Meta advanced matching (FR-030): the `init` that
 * precedes the assessment `Lead` carries the email and phone, and only them.
 * Lives in `tests/` because it runs three features together.
 */
const PERSON = {
  name: 'María Fernanda Ruiz',
  email: 'mf.ruiz@ejemplo.mx',
  phone: '5544332211',
  company: 'Inmobiliaria Altavista',
  need: 'Queremos rehacer el sitio de la desarrolladora.',
  website: '@casaolivo',
  portfolio: 'https://mfruiz-portafolio.mx',
  linkedin: 'https://www.linkedin.com/in/mfruiz',
  cvName: 'cv-maria-fernanda-ruiz.pdf',
}

const FORBIDDEN = [
  'maría',
  'fernanda',
  'ruiz',
  'ejemplo.mx',
  PERSON.phone,
  'altavista',
  'desarrolladora',
  'casaolivo',
  'portafolio',
  'linkedin.com/in',
]

/** Every allowed value of each event parameter (data-model § 2). */
const CLOSED: Record<string, readonly unknown[]> = {
  cta_location: CTA_LOCATIONS,
  channel: CONTACT_CHANNELS,
  form: FORM_IDS,
  error_type: FORM_ERROR_TYPES,
  field: FORM_FIELD_IDS,
  contact_preference: ['email', 'whatsapp'],
  result: [...CV_RESULTS, ...FORM_RESPONSE_RESULTS],
  from_locale: SITE_LOCALES,
  to_locale: SITE_LOCALES,
  page_key: PAGE_KEYS,
  section: [...HOME_SECTIONS, ...ABOUT_SECTIONS],
  step: [1, 2],
  transport_type: ['beacon'],
}

const OK = { kind: 'ok', body: { ok: true } } as const

function fakeClient(contact = [OK] as const): FormsApiClient {
  const replies: Awaited<ReturnType<FormsApiClient['postContact']>>[] = [
    ...contact,
  ]
  return {
    postContact: async () => replies.shift() ?? OK,
    requestCvUpload: async () => ({
      kind: 'ok',
      body: {
        cvId: 'cv-1',
        uploadUrl: 'https://bucket.test.invalid/put',
        contentType: 'application/pdf',
      },
    }),
    putCv: async () => 'uploaded',
    postCareers: async () => OK,
  }
}

function deps(client = fakeClient()): FlowDeps {
  return { client, getToken: async () => 'token', locale: 'es' }
}

function vendors() {
  const gaBrowser = fakeBrowser('https://muush.dev/es#diagnostico')
  const metaBrowser = fakeBrowser('https://muush.dev/es#diagnostico')
  const ga = createGoogleAnalytics(['G', 'PRIVACY01'].join('-'), gaBrowser.env)
  const meta = createMetaPixel(['9', '9', '9'].join(''), metaBrowser.env)
  ga.grant()
  meta.grant()
  onTrackingEvent(ga.sink)
  onTrackingEvent(meta.sink)
  return { gaWindow: gaBrowser.window, metaWindow: metaBrowser.window }
}

async function sendAssessment(
  submit: (
    values: ReturnType<typeof initialContactFormValues>
  ) => Promise<SubmissionOutcome<never>>
) {
  let clock = 0
  const form = useContactForm({
    submitter: { engage: () => undefined, submit },
    initial: {
      ...initialContactFormValues(),
      name: PERSON.name,
      email: PERSON.email,
      company: PERSON.company,
      identity: 'realEstate',
      website: PERSON.website,
      need: 'corto',
      contactPreference: 'whatsapp',
      whatsappCountry: 'MX',
      whatsapp: PERSON.phone,
    },
    now: () => clock,
  })
  form.markInteractive()
  clock += MIN_FILL_TIME_MS
  form.onEngage()
  await form.onSubmit(new Event('submit'))
  form.values.value.need = PERSON.need
  await form.onSubmit(new Event('submit'))
}

async function sendApplication() {
  let clock = 0
  const form = useApplicationForm({
    submitter: {
      engage: () => undefined,
      submit: (values, progress) =>
        submitApplicationFlow(values, deps(), progress),
    },
    initial: {
      ...initialApplicationFormValues(),
      name: PERSON.name,
      email: PERSON.email,
      areaRole: 'it:backend',
      portfolio: PERSON.portfolio,
      linkedin: PERSON.linkedin,
    },
    now: () => clock,
  })
  form.markInteractive()
  clock += MIN_FILL_TIME_MS
  form.onEngage()
  form.onCvChange(
    new File(['%PDF-1.7'], PERSON.cvName, { type: 'application/pdf' })
  )
  await form.onSubmit(new Event('submit'))
}

function serialized(call: unknown[]): string {
  return JSON.stringify(call).toLowerCase()
}

function expectNoPersonalData(calls: unknown[][]) {
  for (const call of calls) {
    for (const text of FORBIDDEN) {
      expect(serialized(call), text).not.toContain(text.toLowerCase())
    }
  }
}

describe('tracking privacy · a full assessment and application', () => {
  afterEach(() => {
    resetTrackingBus()
  })

  it('should send Google Analytics no personal data and only closed-list values', async () => {
    const { gaWindow } = vendors()

    await sendAssessment(values => submitContactFlow(values, deps()))
    await sendAssessment(values =>
      submitContactFlow(
        values,
        deps(fakeClient([{ kind: 'failure', network: true }] as never))
      )
    )
    await sendApplication()

    const calls = gtagCalls(gaWindow)
    const events = calls.filter(
      call => call[0] === 'event' && call[1] !== 'page_view'
    )
    expect(events.map(call => call[1])).toEqual(
      expect.arrayContaining([
        'form_start',
        'form_error',
        'form_submit',
        'form_response',
        'generate_lead',
        'cv_attached',
        'application_submit',
      ])
    )
    expectNoPersonalData(calls)
    for (const [, name, params] of events) {
      for (const [key, value] of Object.entries(params as object)) {
        if (typeof value === 'boolean' || typeof value === 'number') continue
        expect(CLOSED[key], `${String(name)}.${key}`).toContain(value)
      }
    }
  })

  it('should give Meta the email and phone on the Lead and nothing else personal', async () => {
    const { metaWindow } = vendors()

    await sendAssessment(values => submitContactFlow(values, deps()))
    await sendApplication()

    const calls = fbqCalls(metaWindow)
    const matching = calls.filter(call => call[0] === 'init' && call.length > 2)
    expect(matching).toEqual([
      ['init', '999', { em: PERSON.email, ph: `52${PERSON.phone}` }],
    ])
    expectNoPersonalData(calls.filter(call => !matching.includes(call)))
    expect(calls.filter(call => call[0] === 'track')).toEqual([
      ['track', 'Lead'],
    ])
    expect(calls.filter(call => call[0] === 'trackSingle')).toEqual([
      ['trackSingle', '999', 'PageView'],
    ])
  })
})
