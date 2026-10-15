import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  ContactFieldId,
  ContactFormContent,
} from '@/features/forms/data/contactFields'
import {
  type ContactSubmitter,
  HONEYPOT_FIELD_NAME,
  MIN_FILL_TIME_MS,
  type SubmissionOutcome,
} from '@/features/forms/data/submissionContract'
import { buildCountryOptions } from '@/features/forms/logic/countryOptions'
import ContactForm from './ContactForm.vue'

/** Fixture content — already-translated, the shape `useContactContent`-style
 * logic would resolve for this feature. */
const content: ContactFormContent = {
  fields: {
    name: { label: 'Nombre', errorRequired: 'Escribe tu nombre' },
    email: {
      label: 'Correo',
      errorRequired: 'Escribe tu correo',
      errorFormat: 'Correo inválido',
    },
    company: { label: 'Empresa o proyecto' },
    identity: {
      label: '¿Cómo te identificas?',
      errorRequired: 'Elige una opción',
      options: {
        realEstate: 'Bienes raíces/inmobiliaria',
        creator: 'Creador de contenido',
        company: 'Empresa',
        independent: 'Emprendedor o persona física',
        startup: 'Startup',
        other: 'Otro',
      },
    },
    need: {
      label: '¿Qué necesitas?',
      errorRequired: 'Cuéntanos qué necesitas',
      errorLength: 'Necesitamos un poco más de detalle',
    },
    contactPreference: {
      label: '¿Cómo prefieres que te contactemos?',
      options: { email: 'Correo', whatsapp: 'WhatsApp' },
    },
    whatsappCountry: {
      label: 'Lada del país',
      errorInvalid: 'Elige la lada de tu país',
      options: buildCountryOptions('es-MX'),
    },
    whatsapp: {
      label: 'Número de WhatsApp',
      errorRequired: 'Escribe tu número',
      errorDigits: 'Deben ser entre 6 y 14 dígitos',
    },
  },
  submit: 'Enviar',
  sending: 'Enviando…',
  success: {
    titleByChannel: {
      email: 'Listo, te respondemos por correo.',
      whatsapp: 'Listo, te respondemos por WhatsApp.',
    },
  },
  error: {
    title: 'No pudimos enviarlo.',
    fallback: 'support@muush.dev',
  },
}

const mounted: VueWrapper[] = []

/* The minimum fill time reads `Date.now()`; tests move this clock instead of
   sleeping. */
let clock = 0

beforeEach(() => {
  clock = 1_000_000
  vi.spyOn(Date, 'now').mockImplementation(() => clock)
})

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
  vi.restoreAllMocks()
})

/** A submitter that never touches the network: it records and answers. */
function stubSubmitter(
  outcome: SubmissionOutcome<ContactFieldId> = { kind: 'success' }
) {
  return {
    engage: vi.fn<ContactSubmitter['engage']>(),
    submit: vi.fn<ContactSubmitter['submit']>(async () => outcome),
  }
}

interface MountOverrides {
  previewState?: 'sending' | 'success' | 'server-error'
  submitter?: ContactSubmitter
}

function mountForm(overrides: MountOverrides = {}) {
  const wrapper = mount(ContactForm, {
    props: { content, submitter: stubSubmitter(), ...overrides },
    attachTo: document.body,
  })
  mounted.push(wrapper)
  return wrapper
}

async function fillValid(wrapper: VueWrapper): Promise<void> {
  await wrapper.find('#name').setValue('Ana')
  await wrapper.find('#email').setValue('ana@muush.dev')
  await wrapper.find('#identity').setValue('company')
  await wrapper
    .find('#need')
    .setValue('Necesitamos un rediseño completo del sitio.')
}

/** Fill validly, let the minimum fill time pass, submit, settle. */
async function submitValid(wrapper: VueWrapper): Promise<void> {
  await fillValid(wrapper)
  clock += MIN_FILL_TIME_MS
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('ContactForm · the card surface (feature 34, A2)', () => {
  it('should keep its glass card covering the page when rendered', () => {
    /* Feature 34, amendment A2 (Roberto, 2026-10-14): the form cards keep
       their glass and keep covering the dots and the spotlight's red dots,
       as the footer's flat ink-500 does (A2 revision 1, 2026-10-15). A
       regression guard: it passes today. */
    const classes = mountForm().classes()

    expect(classes).toContain('bg-glass-dark-contact')
    expect(classes).toContain('backdrop-blur-glass-dark')
  })
})

describe('ContactForm · the seven fields', () => {
  it('should render the six always-present controls in ui-map.md order', () => {
    const wrapper = mountForm()
    const ids = wrapper
      .findAll('input, select, textarea')
      .map(el => el.attributes('id'))
      .filter(Boolean)

    expect(ids).toEqual(['name', 'email', 'company', 'identity', 'need'])
  })

  it('should render the submit control as a native submit button inside a form', () => {
    const wrapper = mountForm()
    const form = wrapper.find('form')
    const button = form.find('button[type="submit"]')

    expect(form.exists()).toBe(true)
    expect(form.attributes('novalidate')).toBe('')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe(content.submit)
  })

  it('should fix the submit button to its desktop width and centre it only from lg up', () => {
    /*
     * Feature 025 (corrected). `<form class="flex flex-col gap-form-gap">`
     * has no `items-*`, so every child inherits `align-items: stretch` —
     * right for the fields at every width, and right for the submit button
     * too, but only below `lg`: the `.pen`'s real node (`bTYw7`) is
     * `width: "fill_container"` on mobile and `width: 216` EXPLICIT at `lg`.
     * `lg:w-btn-submit-w`/`lg:self-center` guard exactly that split — neither
     * class is unscoped, and neither lands on the `<form>` itself (which
     * would also un-stretch the inputs).
     */
    const button = mountForm().find('button[type="submit"]')

    expect(button.classes()).toContain('lg:w-btn-submit-w')
    expect(button.classes()).toContain('lg:self-center')
    expect(button.classes()).not.toContain('self-center')
    expect(button.classes()).not.toContain('w-btn-submit-w')
  })

  it('should show no error before any submit is attempted, even on an empty form', () => {
    /* `ui-map.md` § 7's "Idle" row: the empty form's own resting state shows
       no red borders and no messages — those belong to "Validación fallida"
       and only appear once Enviar has actually been clicked. */
    const wrapper = mountForm()

    expect(wrapper.text()).not.toContain(content.fields.name.errorRequired)
    expect(wrapper.find('#name').attributes('aria-invalid')).toBe('false')
  })

  it('should show every required error and focus the first invalid field on an empty submit', async () => {
    const wrapper = mountForm()
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain(content.fields.name.errorRequired)
    expect(wrapper.text()).toContain(content.fields.email.errorRequired)
    expect(wrapper.text()).toContain(content.fields.identity.errorRequired)
    expect(wrapper.text()).toContain(content.fields.need.errorRequired)
    expect(wrapper.find('#name').attributes('aria-invalid')).toBe('true')
  })

  it('should show no field error on a valid submit', async () => {
    const wrapper = mountForm()

    await submitValid(wrapper)

    expect(wrapper.text()).not.toContain(content.fields.name.errorRequired)
  })
})

describe('ContactForm · the WhatsApp field', () => {
  it('should not render the WhatsApp field while the preference is email', () => {
    expect(mountForm().find('#whatsapp').exists()).toBe(false)
  })

  it('should mount, then remove and forget the field across a round trip', async () => {
    const wrapper = mountForm()

    await wrapper
      .find('input[name="contactPreference"][value="whatsapp"]')
      .setValue(true)
    expect(wrapper.find('#whatsapp').exists()).toBe(true)

    await wrapper.find('#whatsapp').setValue('5639060739')
    await wrapper
      .find('input[name="contactPreference"][value="email"]')
      .setValue(true)
    expect(wrapper.find('#whatsapp').exists()).toBe(false)

    await wrapper
      .find('input[name="contactPreference"][value="whatsapp"]')
      .setValue(true)
    expect((wrapper.find('#whatsapp').element as HTMLInputElement).value).toBe(
      ''
    )
  })
})

describe('ContactForm · the dial-code selector (feature 32)', () => {
  async function chooseWhatsapp(wrapper: VueWrapper): Promise<void> {
    await wrapper
      .find('input[name="contactPreference"][value="whatsapp"]')
      .setValue(true)
  }

  /* Feature 32 Amendment A1, without the edge (dev, preview, Storybook): a
     submitter with no `lookupCountry` keeps Mexico and requests nothing. */
  it('should show Mexico and request nothing when the submitter has no country lookup', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const wrapper = mountForm()

    await wrapper.find('#name').trigger('focusin')
    await chooseWhatsapp(wrapper)
    await flushPromises()

    expect(
      (wrapper.find('#whatsappCountry').element as HTMLSelectElement).value
    ).toBe('MX')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('should show the reported country when the submitter lookup answers Colombia', async () => {
    const wrapper = mountForm({
      submitter: { ...stubSubmitter(), lookupCountry: async () => 'CO' },
    })

    await wrapper.find('#name').trigger('focusin')
    await chooseWhatsapp(wrapper)
    await flushPromises()

    expect(
      (wrapper.find('#whatsappCountry').element as HTMLSelectElement).value
    ).toBe('CO')
  })

  it('should show the selector before the number when switching to WhatsApp', async () => {
    const wrapper = mountForm()

    expect(wrapper.find('#whatsappCountry').exists()).toBe(false)
    await chooseWhatsapp(wrapper)

    const ids = wrapper.findAll('select, input').map(node => node.element.id)
    expect(ids.indexOf('whatsappCountry')).toBe(ids.indexOf('whatsapp') - 1)
    expect(wrapper.find('#whatsappCountry').attributes('aria-label')).toBe(
      content.fields.whatsappCountry.label
    )
  })

  it('should pass the picked country and the typed number to the submitter when submitted', async () => {
    const submitter = stubSubmitter()
    const wrapper = mountForm({ submitter })

    await chooseWhatsapp(wrapper)
    await wrapper.find('#whatsappCountry').setValue('CO')
    await wrapper.find('#whatsapp').setValue('300 123 4567')
    await submitValid(wrapper)

    expect(submitter.submit.mock.calls[0]?.[0]).toMatchObject({
      contactPreference: 'whatsapp',
      whatsappCountry: 'CO',
      whatsapp: '300 123 4567',
    })
  })

  it('should show the 6 to 14 digit message and send nothing when the number is too short', async () => {
    const submitter = stubSubmitter()
    const wrapper = mountForm({ submitter })

    await chooseWhatsapp(wrapper)
    await wrapper.find('#whatsapp').setValue('12345')
    await submitValid(wrapper)

    expect(wrapper.text()).toContain(content.fields.whatsapp.errorDigits)
    expect(submitter.submit).not.toHaveBeenCalled()
  })

  it('should keep the picked country when switching to email and back', async () => {
    const wrapper = mountForm()

    await chooseWhatsapp(wrapper)
    await wrapper.find('#whatsappCountry').setValue('CO')
    await wrapper
      .find('input[name="contactPreference"][value="email"]')
      .setValue(true)
    await chooseWhatsapp(wrapper)

    expect(
      (wrapper.find('#whatsappCountry').element as HTMLSelectElement).value
    ).toBe('CO')
  })

  it('should mark and focus the selector when the server rejects the dial code, and clear it on another pick', async () => {
    const wrapper = mountForm({
      submitter: stubSubmitter({
        kind: 'field-errors',
        fields: ['whatsappCountry'],
      }),
    })

    await chooseWhatsapp(wrapper)
    await wrapper.find('#whatsappCountry').setValue('CO')
    await wrapper.find('#whatsapp').setValue('3001234567')
    await submitValid(wrapper)

    const select = wrapper.find('#whatsappCountry')
    expect(select.attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('#whatsappCountry-error').text()).toBe(
      'Elige la lada de tu país'
    )
    expect(document.activeElement?.id).toBe('whatsappCountry')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)

    await select.setValue('MX')
    expect(wrapper.find('#whatsappCountry-error').exists()).toBe(false)
  })
})

describe('ContactForm · submitting', () => {
  it('should disable the button, show the sending label and lock the fields while the request is in flight', async () => {
    const submitter = stubSubmitter()
    submitter.submit.mockReturnValue(new Promise(() => undefined))
    const wrapper = mountForm({ submitter })

    await submitValid(wrapper)

    const button = wrapper.find('button[type="submit"]')
    expect(button.attributes('disabled')).toBe('')
    expect(button.text()).toBe(content.sending)
    expect(wrapper.find('#name').attributes('readonly')).toBe('')
    expect(wrapper.find('form').attributes('aria-busy')).toBe('true')
  })

  it('should call the submitter once when submit fires again during sending', async () => {
    const submitter = stubSubmitter()
    submitter.submit.mockReturnValue(new Promise(() => undefined))
    const wrapper = mountForm({ submitter })

    await submitValid(wrapper)
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(submitter.submit).toHaveBeenCalledTimes(1)
  })

  it('should replace the form with a focused status naming the chosen channel on success', async () => {
    const wrapper = mountForm()

    await wrapper
      .find('input[name="contactPreference"][value="whatsapp"]')
      .setValue(true)
    await wrapper.find('#whatsapp').setValue('55 1234 5678')
    await submitValid(wrapper)

    const status = wrapper.find('[role="status"]')
    expect(wrapper.find('form').exists()).toBe(false)
    expect(status.text()).toBe(content.success.titleByChannel.whatsapp)
    expect(document.activeElement).toBe(status.find('p').element)
  })

  it('should keep every value and show the alert with the support link on failure', async () => {
    const wrapper = mountForm({
      submitter: stubSubmitter({ kind: 'failure' }),
    })

    await submitValid(wrapper)

    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('[role="alert"]').text()).toContain(content.error.title)
    expect(wrapper.find('a[href="mailto:support@muush.dev"]').exists()).toBe(
      true
    )
    expect((wrapper.find('#name').element as HTMLInputElement).value).toBe(
      'Ana'
    )
    expect((wrapper.find('#need').element as HTMLTextAreaElement).value).toBe(
      'Necesitamos un rediseño completo del sitio.'
    )
  })

  it('should send again from the error state when submitted again', async () => {
    const submitter = stubSubmitter({ kind: 'failure' })
    const wrapper = mountForm({ submitter })

    await submitValid(wrapper)
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(submitter.submit).toHaveBeenCalledTimes(2)
  })

  it('should engage the submitter with the card host on first focus', async () => {
    const submitter = stubSubmitter()
    const wrapper = mountForm({ submitter })

    await wrapper.find('#name').trigger('focusin')

    expect(submitter.engage).toHaveBeenCalledTimes(1)
    const host = submitter.engage.mock.calls[0]?.[0]
    expect(host).toBeInstanceOf(HTMLElement)
    expect(wrapper.find('form').element.contains(host ?? null)).toBe(false)
  })

  it('should never call fetch from the component, whatever the outcome', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const wrapper = mountForm({
      submitter: stubSubmitter({ kind: 'failure' }),
    })

    await submitValid(wrapper)

    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

describe('ContactForm · server field errors', () => {
  it('should mark the inputs the server rejected, focus the first, and show no alert', async () => {
    const wrapper = mountForm({
      submitter: stubSubmitter({
        kind: 'field-errors',
        fields: ['email', 'whatsapp'],
      }),
    })

    await wrapper
      .find('input[name="contactPreference"][value="whatsapp"]')
      .setValue(true)
    await wrapper.find('#whatsapp').setValue('5512345678')
    await submitValid(wrapper)

    const email = wrapper.find('#email')
    expect(email.attributes('aria-invalid')).toBe('true')
    expect(email.classes()).toContain('border-red-400')
    expect(wrapper.text()).toContain(content.fields.email.errorFormat)
    expect(wrapper.text()).toContain(content.fields.whatsapp.errorDigits)
    expect(document.activeElement).toBe(email.element)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('should clear a field mark once the visitor edits that field', async () => {
    const wrapper = mountForm({
      submitter: stubSubmitter({ kind: 'field-errors', fields: ['email'] }),
    })

    await submitValid(wrapper)
    await wrapper.find('#email').setValue('ana.ruiz@muush.dev')

    expect(wrapper.find('#email').attributes('aria-invalid')).toBe('false')
  })
})

describe('ContactForm · anti-spam', () => {
  it('should render the honeypot inside the form, out of the Tab order', () => {
    const honeypot = mountForm().find(
      `form input[name="${HONEYPOT_FIELD_NAME}"]`
    )

    expect(honeypot.exists()).toBe(true)
    expect(honeypot.attributes('tabindex')).toBe('-1')
  })

  it('should send nothing and show the generic error when the honeypot is filled', async () => {
    const submitter = stubSubmitter()
    const wrapper = mountForm({ submitter })

    await wrapper
      .find(`input[name="${HONEYPOT_FIELD_NAME}"]`)
      .setValue('https://spam.example')
    await submitValid(wrapper)

    expect(submitter.submit).not.toHaveBeenCalled()
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect((wrapper.find('#name').element as HTMLInputElement).value).toBe(
      'Ana'
    )
  })

  it('should send nothing when submitted before the minimum fill time, then send after it', async () => {
    const submitter = stubSubmitter()
    const wrapper = mountForm({ submitter })

    await fillValid(wrapper)
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(submitter.submit).not.toHaveBeenCalled()

    clock += MIN_FILL_TIME_MS
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(submitter.submit).toHaveBeenCalledTimes(1)
  })
})

describe('ContactForm · previewState is a Storybook-only display override', () => {
  it('should render no outcome markup when previewState is absent', () => {
    const wrapper = mountForm()

    expect(wrapper.text()).not.toContain(content.sending)
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('should disable the submit control and mark fields read-only when previewState is sending', () => {
    const wrapper = mountForm({ previewState: 'sending' })

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBe(
      ''
    )
    expect(wrapper.text()).toContain(content.sending)
    expect(wrapper.find('#name').attributes('readonly')).toBe('')
  })

  it('should replace the form with the confirmation copy when previewState is success', () => {
    const wrapper = mountForm({ previewState: 'success' })

    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.text()).toContain(content.success.titleByChannel.email)
  })

  it('should keep the captured form and add the fallback link when previewState is server-error', () => {
    const wrapper = mountForm({ previewState: 'server-error' })

    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.text()).toContain(content.error.title)
    expect(wrapper.find('a[href="mailto:support@muush.dev"]').exists()).toBe(
      true
    )
  })
})
