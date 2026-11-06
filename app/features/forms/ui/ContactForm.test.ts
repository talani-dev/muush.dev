import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ContactFieldId } from '@/features/forms/data/contactFields'
import { FORM_STEPS_MEDIA_QUERY } from '@/features/forms/data/formSteps'
import {
  type ContactSubmitter,
  MIN_FILL_TIME_MS,
  type SubmissionOutcome,
} from '@/features/forms/data/submissionContract'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'
import { installMatchMedia } from '@/shared/logic/fakeMediaQuery.testing'
import ContactForm from './ContactForm.vue'
import { CONTACT_FORM_COPY } from './formsFixtures.testing'

/** Feature 45 · the v2 diagnóstico form (spec US1–US3, US5). */
const content = CONTACT_FORM_COPY.es
const mounted: VueWrapper[] = []
let clock = 0
let restoreMedia: () => void = () => undefined

beforeEach(() => {
  clock = 1_000_000
  vi.spyOn(Date, 'now').mockImplementation(() => clock)
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
  restoreMedia()
  vi.restoreAllMocks()
  document.body.replaceChildren()
})

function stubSubmitter(
  outcome: SubmissionOutcome<ContactFieldId> = { kind: 'success' }
) {
  return {
    engage: vi.fn<ContactSubmitter['engage']>(),
    submit: vi.fn<ContactSubmitter['submit']>(async () => outcome),
  }
}

async function mountForm({
  stepped = false,
  submitter = stubSubmitter() as ContactSubmitter,
} = {}) {
  restoreMedia = installMatchMedia({
    [FORM_STEPS_MEDIA_QUERY]: stepped,
  }).restore
  const wrapper = mount(ContactForm, {
    props: { content, submitter },
    attachTo: document.body,
  })
  mounted.push(wrapper)
  await flushPromises()
  return wrapper
}

async function fillValid(wrapper: VueWrapper): Promise<void> {
  await wrapper.find('#name').setValue('Ana')
  await wrapper.find('#email').setValue('ana@muush.dev')
  await wrapper.find('#identity').setValue('company')
  await wrapper.find('#need').setValue('Necesitamos un rediseño del sitio.')
}

async function tick(wrapper: VueWrapper): Promise<void> {
  await wrapper.find('#privacy').setValue(true)
}

async function submit(wrapper: VueWrapper): Promise<void> {
  clock += MIN_FILL_TIME_MS
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

const submitButton = (wrapper: VueWrapper) =>
  wrapper.find('button[type="submit"]')

/** The button's label, without the arrow glyph's SVG title. */
const submitLabel = (wrapper: VueWrapper) =>
  submitButton(wrapper).find('span').text()

describe('ContactForm · the single view (US1)', () => {
  it('should render every field in the design order and no website field when wide', async () => {
    const wrapper = await mountForm()
    const ids = wrapper
      .findAll('input, select, textarea')
      .map(control => control.attributes('id') ?? control.attributes('name'))
      .filter(Boolean)

    expect(ids).toEqual([
      'name',
      'email',
      'company',
      'identity',
      'need',
      'contactPreference',
      'contactPreference',
      'privacy',
      'muush_website',
    ])
    expect(wrapper.find('#website').exists()).toBe(false)
    expect(wrapper.text()).not.toMatch(/sitio web|website/i)
    expect(wrapper.find('[aria-live]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain(content.continue)
  })

  it('should show the submit unavailable with its hint while the box is unticked', async () => {
    const wrapper = await mountForm()
    const button = submitButton(wrapper)
    const hintId = button.attributes('aria-describedby')

    expect(button.attributes('aria-disabled')).toBe('true')
    expect(button.attributes('disabled')).toBeUndefined()
    expect(document.getElementById(hintId ?? '')?.textContent).toBe(
      content.privacy.requiredHint
    )

    await tick(wrapper)

    expect(submitButton(wrapper).attributes('aria-disabled')).toBeUndefined()
    expect(submitButton(wrapper).attributes('aria-describedby')).toBeUndefined()
  })

  it('should send nothing and focus the box when submitted unticked by click, Enter or script', async () => {
    const submitter = stubSubmitter()
    const wrapper = await mountForm({ submitter })
    await fillValid(wrapper)
    clock += MIN_FILL_TIME_MS

    await submitButton(wrapper).trigger('click')
    await wrapper.find('#name').trigger('keydown', { key: 'Enter' })
    ;(wrapper.find('form').element as HTMLFormElement).requestSubmit()
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(submitter.submit).not.toHaveBeenCalled()
    expect(document.activeElement?.id).toBe('privacy')
  })

  it('should send the exact values once with no consent, website or honeypot key when ticked and valid', async () => {
    const submitter = stubSubmitter()
    const wrapper = await mountForm({ submitter })
    await fillValid(wrapper)
    await tick(wrapper)

    await submit(wrapper)

    expect(submitter.submit).toHaveBeenCalledTimes(1)
    const values = submitter.submit.mock.calls[0]?.[0]
    expect(values).toEqual({
      name: 'Ana',
      email: 'ana@muush.dev',
      company: '',
      identity: 'company',
      need: 'Necesitamos un rediseño del sitio.',
      contactPreference: 'email',
      whatsappCountry: 'MX',
      whatsapp: '',
    })
    expect(Object.keys(values ?? {})).not.toEqual(
      expect.arrayContaining(['privacy'])
    )
  })

  it('should show the WhatsApp row only while WhatsApp is chosen', async () => {
    const wrapper = await mountForm()
    expect(wrapper.find('#whatsapp').exists()).toBe(false)

    await wrapper.find('input[value="whatsapp"]').setValue(true)
    expect(wrapper.find('#whatsapp').exists()).toBe(true)
    expect(wrapper.find('#whatsappCountry').exists()).toBe(true)

    await wrapper.find('input[value="email"]').setValue(true)
    await flushPromises()
    expect(wrapper.find('#whatsapp').exists()).toBe(false)
  })
})

describe('ContactForm · states (US1, US3)', () => {
  it('should mark each invalid field with its tied help line and focus the first when sent invalid', async () => {
    const wrapper = await mountForm()
    await tick(wrapper)

    await submit(wrapper)

    const name = wrapper.find('#name')
    expect(name.attributes('aria-invalid')).toBe('true')
    expect(name.attributes('aria-describedby')).toBe('name-error')
    expect(wrapper.find('#name-error').text()).toBe('Escribe tu nombre.')
    expect(wrapper.find('#email-error').text()).toBe(
      'Escribe un correo como nombre@empresa.com'
    )
    expect(name.classes()).toContain('border-red-muush-500')
    expect(document.activeElement?.id).toBe('name')
  })

  it('should clear a field’s error as soon as its value is valid', async () => {
    const wrapper = await mountForm()
    await tick(wrapper)
    await submit(wrapper)

    await wrapper.find('#name').setValue('Ana')

    expect(wrapper.find('#name-error').exists()).toBe(false)
  })

  it('should keep every value, show the notice and offer a retry when the send fails', async () => {
    const submitter = stubSubmitter({ kind: 'failure' })
    const wrapper = await mountForm({ submitter })
    await fillValid(wrapper)
    await tick(wrapper)

    await submit(wrapper)

    const notice = wrapper.find('[role="alert"]')
    expect(notice.text()).toContain(content.error.before)
    expect(notice.find('a').attributes('href')).toBe('mailto:support@muush.dev')
    expect(submitLabel(wrapper)).toBe('Intentar de nuevo')
    expect((wrapper.find('#name').element as HTMLInputElement).value).toBe(
      'Ana'
    )

    await submit(wrapper)
    expect(submitter.submit).toHaveBeenCalledTimes(2)
  })

  it('should send nothing and focus the box when Intentar de nuevo is pressed after unticking it', async () => {
    /* review-45: every send path of the diagnóstico form is the guarded
       submit; this pins the retry after a failure. */
    const submitter = stubSubmitter({ kind: 'failure' })
    const wrapper = await mountForm({ submitter })
    await fillValid(wrapper)
    await tick(wrapper)
    await submit(wrapper)
    await wrapper.find('#privacy').setValue(false)

    await submitButton(wrapper).trigger('click')
    await submit(wrapper)

    expect(submitter.submit).toHaveBeenCalledTimes(1)
    expect(document.activeElement?.id).toBe('privacy')
    expect(submitButton(wrapper).attributes('aria-disabled')).toBe('true')
  })

  it('should show the notice when the spam guard trips', async () => {
    const submitter = stubSubmitter()
    const wrapper = await mountForm({ submitter })
    await fillValid(wrapper)
    await tick(wrapper)

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(submitter.submit).not.toHaveBeenCalled()
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })

  it('should send once, lock the fields and read Enviando… while sending', async () => {
    const submitter = stubSubmitter()
    submitter.submit.mockReturnValue(new Promise(() => undefined))
    const wrapper = await mountForm({ submitter })
    await fillValid(wrapper)
    await tick(wrapper)

    await submit(wrapper)
    await submit(wrapper)

    expect(submitter.submit).toHaveBeenCalledTimes(1)
    expect(submitLabel(wrapper)).toBe('Enviando…')
    expect(submitButton(wrapper).attributes('disabled')).toBeDefined()
    expect(wrapper.find('#name').attributes('readonly')).toBeDefined()
  })

  it('should replace the form with the announced, focused confirmation when the send succeeds', async () => {
    const wrapper = await mountForm()
    await fillValid(wrapper)
    await tick(wrapper)

    await submit(wrapper)

    expect(wrapper.find('form').exists()).toBe(false)
    const status = wrapper.find('[role="status"]')
    expect(status.find('h3').text()).toBe('Recibimos tu solicitud.')
    expect(document.activeElement).toBe(status.find('h3').element)
    expect(status.find('a').attributes('href')).toBe(CALL_BOOKING_URL)
    expect(status.find('[data-punto]').classes()).toContain('pulso')
  })
})

describe('ContactForm · two steps below 768 px (US2)', () => {
  it('should show step 1 with its progress, Continuar and no submit fields when narrow', async () => {
    const wrapper = await mountForm({ stepped: true })

    expect(wrapper.find('[aria-live="polite"]').text()).toBe(
      'Paso 1 de 2 · Tus datos'
    )
    expect(wrapper.findAll('[data-segmento]')).toHaveLength(2)
    expect(wrapper.find('#name').isVisible()).toBe(true)
    expect(wrapper.find('#company').isVisible()).toBe(false)
    expect(wrapper.find('#privacy').isVisible()).toBe(false)
    const group = wrapper.find('[role="group"]')
    expect(group.attributes('aria-labelledby')).toBe(
      wrapper.find('[aria-live="polite"]').attributes('id')
    )
  })

  it('should stay on step 1, show only its errors and focus the name when Continuar finds it empty', async () => {
    const wrapper = await mountForm({ stepped: true })

    await wrapper.find('button[type="button"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('#name-error').exists()).toBe(true)
    expect(wrapper.find('#need-error').exists()).toBe(false)
    expect(wrapper.find('#company').isVisible()).toBe(false)
    expect(document.activeElement?.id).toBe('name')
  })

  it('should move to step 2, announce it and focus Empresa when step 1 is valid', async () => {
    const wrapper = await mountForm({ stepped: true })
    await wrapper.find('#name').setValue('Ana')
    await wrapper.find('#email').setValue('ana@muush.dev')

    await wrapper.find('button[type="button"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[aria-live="polite"]').text()).toBe(
      'Paso 2 de 2 · Tu negocio'
    )
    expect(wrapper.find('#company').isVisible()).toBe(true)
    expect(document.activeElement?.id).toBe('company')
  })

  it('should keep every value when going back and forth', async () => {
    const wrapper = await mountForm({ stepped: true })
    await wrapper.find('#name').setValue('Ana')
    await wrapper.find('#email').setValue('ana@muush.dev')
    await wrapper.find('button[type="button"]').trigger('click')
    await flushPromises()
    await wrapper.find('#company').setValue('muush')

    const back = wrapper
      .findAll('button[type="button"]')
      .find(button => button.text() === content.back)
    await back?.trigger('click')
    await flushPromises()

    expect(wrapper.find('#name').isVisible()).toBe(true)
    expect((wrapper.find('#name').element as HTMLInputElement).value).toBe(
      'Ana'
    )
    expect((wrapper.find('#company').element as HTMLInputElement).value).toBe(
      'muush'
    )
  })

  it('should return to step 1 and focus the email when the server marks it from step 2', async () => {
    const submitter = stubSubmitter({ kind: 'field-errors', fields: ['email'] })
    const wrapper = await mountForm({ stepped: true, submitter })
    await fillValid(wrapper)
    await wrapper.find('button[type="button"]').trigger('click')
    await flushPromises()
    await tick(wrapper)

    await submit(wrapper)

    expect(wrapper.find('[aria-live="polite"]').text()).toBe(
      'Paso 1 de 2 · Tus datos'
    )
    expect(wrapper.find('#email-error').exists()).toBe(true)
    expect(document.activeElement?.id).toBe('email')
  })

  it('should continue instead of submitting when Enter is pressed on step 1', async () => {
    const submitter = stubSubmitter()
    const wrapper = await mountForm({ stepped: true, submitter })
    await fillValid(wrapper)

    await submit(wrapper)

    expect(submitter.submit).not.toHaveBeenCalled()
    expect(wrapper.find('#company').isVisible()).toBe(true)
  })
})

describe('ContactForm · assistive technology (US5)', () => {
  it('should tie a visible label to every control', async () => {
    const wrapper = await mountForm()

    for (const id of ['name', 'email', 'company', 'identity', 'need']) {
      expect(wrapper.find(`label[for="${id}"]`).exists(), id).toBe(true)
    }
    /* The link's sr-only new-tab notice is part of the label's text. */
    const { before, link, newTab, after } = content.privacy.label
    expect(wrapper.find('label[for="privacy"]').text()).toBe(
      `${before}${link} ${newTab}${after}`
    )
  })

  it('should expose the contact choice as one named radio group', async () => {
    const wrapper = await mountForm()
    const group = wrapper.find('[role="radiogroup"]')
    const radios = group.findAll('input[type="radio"]')

    expect(
      document.getElementById(group.attributes('aria-labelledby') ?? '')
        ?.textContent
    ).toBe(content.fields.contactPreference.label)
    expect(new Set(radios.map(radio => radio.attributes('name')))).toEqual(
      new Set(['contactPreference'])
    )
    expect(
      radios.filter(radio => (radio.element as HTMLInputElement).checked)
    ).toHaveLength(1)
  })
})
