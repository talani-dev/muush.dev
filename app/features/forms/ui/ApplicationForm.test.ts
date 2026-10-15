import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  ApplicationFieldId,
  ApplicationFormContent,
} from '@/features/forms/data/applicationFields'
import { CV_MAX_BYTES } from '@/features/forms/data/applicationFields'
import {
  type ApplicationSubmitter,
  HONEYPOT_FIELD_NAME,
  MIN_FILL_TIME_MS,
  type SubmissionOutcome,
  type SubmissionProgress,
} from '@/features/forms/data/submissionContract'
import { buildCountryOptions } from '@/features/forms/logic/countryOptions'
import ApplicationForm from './ApplicationForm.vue'

/** Fixture content — already-translated, the shape
 * `useApplicationFormContent`-style logic would resolve for this feature. */
const content: ApplicationFormContent = {
  fields: {
    name: { label: 'Nombre', errorRequired: 'Escribe tu nombre' },
    email: {
      label: 'Correo',
      errorRequired: 'Escribe tu correo',
      errorFormat: 'Correo inválido',
    },
    areaRole: {
      label: 'Área y rol',
      placeholder: 'Área y rol',
      errorRequired: 'Elige un área y un rol',
      areas: {
        it: 'IT',
        product: 'Product',
        projectManagement: 'Project management',
        sales: 'Sales',
        marketing: 'Marketing',
        creative: 'Creative',
      },
      roles: {
        it: { placeholder: 'Rol por confirmar' },
        product: { placeholder: 'Rol por confirmar' },
        projectManagement: { placeholder: 'Rol por confirmar' },
        sales: { placeholder: 'Rol por confirmar' },
        marketing: { placeholder: 'Rol por confirmar' },
        creative: { placeholder: 'Rol por confirmar' },
      },
    },
    portfolio: {
      label: 'Portafolio',
      placeholder: 'https://tu-portafolio.com',
      errorFormat: 'Ingresa una URL válida',
    },
    linkedin: {
      label: 'LinkedIn',
      placeholder: 'https://linkedin.com/in/tu-usuario',
      errorFormat: 'Ingresa una URL válida',
    },
    cv: {
      label: 'CV',
      placeholder: 'Adjuntar CV · PDF',
      errorFormat: 'Solo se aceptan archivos PDF',
      errorSize: 'El archivo debe pesar máximo 5MB',
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
  uploading: 'Subiendo CV…',
  cvUploadError: {
    message:
      'No pudimos subir tu CV. Inténtalo de nuevo o envía la postulación sin CV.',
    retry: 'Reintentar subida',
    submitWithoutCv: 'Enviar sin CV',
  },
  success: {
    title: 'Gracias, ya tenemos tu perfil.',
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
  outcome: SubmissionOutcome<ApplicationFieldId> = { kind: 'success' }
) {
  return {
    engage: vi.fn<ApplicationSubmitter['engage']>(),
    submit: vi.fn<ApplicationSubmitter['submit']>(async () => outcome),
  }
}

interface MountOverrides {
  previewState?:
    | 'uploading'
    | 'sending'
    | 'success'
    | 'server-error'
    | 'cv-upload-error'
  submitter?: ApplicationSubmitter
}

function mountForm(overrides: MountOverrides = {}) {
  const wrapper = mount(ApplicationForm, {
    props: { content, submitter: stubSubmitter(), ...overrides },
    attachTo: document.body,
  })
  mounted.push(wrapper)
  return wrapper
}

const pdf = new File(['%PDF-1.4'], 'cv.pdf', { type: 'application/pdf' })

/** Simulates a selection in the native picker; repeatable on one input. */
async function selectFile(wrapper: VueWrapper, file: File): Promise<void> {
  const input = wrapper.find('#cv').element as HTMLInputElement
  Object.defineProperty(input, 'files', { value: [file], configurable: true })
  await wrapper.find('#cv').trigger('change')
}

async function attachCv(wrapper: VueWrapper): Promise<void> {
  await selectFile(wrapper, pdf)
}

/** A `File` whose reported size is `size`, without allocating it. */
function sizedFile(size: number, type = 'application/pdf'): File {
  const file = new File(['%PDF-1.4'], 'big.pdf', { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

async function fillValid(wrapper: VueWrapper): Promise<void> {
  await wrapper.find('#name').setValue('Ana')
  await wrapper.find('#email').setValue('ana@muush.dev')
  await wrapper.find('#areaRole').setValue('it:backend')
}

/** Fill validly, let the minimum fill time pass, submit, settle. */
async function submitValid(wrapper: VueWrapper): Promise<void> {
  await fillValid(wrapper)
  clock += MIN_FILL_TIME_MS
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('ApplicationForm · the eight fields', () => {
  it('should render the seven always-present controls in ui-map.md § 9 order', () => {
    const wrapper = mountForm()
    const ids = wrapper
      .findAll('input, select, textarea')
      .map(el => el.attributes('id'))
      .filter(Boolean)

    expect(ids).toEqual([
      'name',
      'email',
      'areaRole',
      'portfolio',
      'linkedin',
      'cv',
    ])
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
    /* Feature 025 (corrected) — same fix and same reasoning as ContactForm.test.ts. */
    const button = mountForm().find('button[type="submit"]')

    expect(button.classes()).toContain('lg:w-btn-submit-w')
    expect(button.classes()).toContain('lg:self-center')
    expect(button.classes()).not.toContain('self-center')
    expect(button.classes()).not.toContain('w-btn-submit-w')
  })

  it('should render the six grouped role options under their own area optgroup', () => {
    const wrapper = mountForm()
    const optgroups = wrapper.find('#areaRole').findAll('optgroup')

    expect(optgroups).toHaveLength(6)
    expect(optgroups.map(group => group.attributes('label'))).toEqual([
      'IT',
      'Product',
      'Project management',
      'Sales',
      'Marketing',
      'Creative',
    ])
  })

  it('should show no error before any submit is attempted, even on an empty form', () => {
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
    expect(wrapper.text()).toContain(content.fields.areaRole.errorRequired)
    expect(wrapper.find('#name').attributes('aria-invalid')).toBe('true')
  })

  it('should not show an error for portfolio, linkedin or cv on an empty submit', async () => {
    const wrapper = mountForm()
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('#portfolio').attributes('aria-invalid')).toBe('false')
    expect(wrapper.find('#linkedin').attributes('aria-invalid')).toBe('false')
    expect(wrapper.find('#cv').attributes('aria-invalid')).toBe('false')
  })

  it('should show no field error on a valid minimal submit', async () => {
    const wrapper = mountForm()

    await submitValid(wrapper)

    expect(wrapper.text()).not.toContain(content.fields.name.errorRequired)
  })
})

describe('ApplicationForm · the WhatsApp field', () => {
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

describe('ApplicationForm · the dial-code selector (feature 32)', () => {
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

describe('ApplicationForm · submitting', () => {
  it('should disable the button, show the sending label and lock the fields while sending', async () => {
    const submitter = stubSubmitter()
    submitter.submit.mockReturnValue(new Promise(() => undefined))
    const wrapper = mountForm({ submitter })

    await submitValid(wrapper)

    const button = wrapper.find('button[type="submit"]')
    expect(button.attributes('disabled')).toBe('')
    expect(button.text()).toBe(content.sending)
    expect(wrapper.find('#portfolio').attributes('readonly')).toBe('')
  })

  it('should hand the submitter the qualified select value and the chosen file', async () => {
    const submitter = stubSubmitter()
    const wrapper = mountForm({ submitter })

    await attachCv(wrapper)
    await submitValid(wrapper)

    const sent = submitter.submit.mock.calls[0]?.[0]
    expect(sent?.areaRole).toBe('it:backend')
    expect(sent?.cv?.name).toBe('cv.pdf')
  })

  it('should show the standard confirmation with no extra note when the CV attached', async () => {
    const wrapper = mountForm()

    await attachCv(wrapper)
    await submitValid(wrapper)

    const status = wrapper.find('[role="status"]')
    expect(status.text()).toBe(content.success.title)
    expect(document.activeElement).toBe(status.find('p').element)
  })

  it('should keep every value, the chosen file included, and show the alert on failure', async () => {
    const wrapper = mountForm({
      submitter: stubSubmitter({ kind: 'failure' }),
    })

    await attachCv(wrapper)
    await submitValid(wrapper)

    expect(wrapper.find('[role="alert"]').text()).toContain(content.error.title)
    expect(wrapper.text()).not.toContain(content.cvUploadError.message)
    expect((wrapper.find('#name').element as HTMLInputElement).value).toBe(
      'Ana'
    )
    expect(wrapper.text()).toContain('cv.pdf')
  })

  it('should never call fetch from the component', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const wrapper = mountForm()

    await attachCv(wrapper)
    await submitValid(wrapper)

    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

/** A submitter whose first call stays pending until the test settles it. */
function pendingSubmitter() {
  const submitter = stubSubmitter()
  const control: {
    finish: (outcome: SubmissionOutcome<ApplicationFieldId>) => void
    progress?: SubmissionProgress
  } = { finish: () => undefined }
  submitter.submit.mockImplementationOnce(
    (_values, progress) =>
      new Promise(resolve => {
        control.finish = resolve
        control.progress = progress
      })
  )
  return { submitter, control }
}

describe('ApplicationForm · a failed CV upload', () => {
  async function failedUpload() {
    const submitter = stubSubmitter({ kind: 'cv-upload-failed' })
    const wrapper = mountForm({ submitter })
    await attachCv(wrapper)
    await wrapper.find('#portfolio').setValue('https://ana.dev')
    await submitValid(wrapper)
    return { wrapper, submitter }
  }

  it('should show the CV error with both actions next to the CV field and keep every value when the submitter reports cv-upload-failed', async () => {
    const { wrapper } = await failedUpload()
    const alert = wrapper.find('[role="alert"]')
    const actions = alert.findAll('button')

    expect(alert.text()).toContain(content.cvUploadError.message)
    expect(actions.map(button => button.text())).toEqual([
      content.cvUploadError.retry,
      content.cvUploadError.submitWithoutCv,
    ])
    expect(document.activeElement).toBe(actions[0]?.element)
    const fieldIds = wrapper
      .findAll('input, select, button')
      .map(el => el.attributes('id') ?? el.text())
    expect(fieldIds.indexOf(content.cvUploadError.retry)).toBe(
      fieldIds.indexOf('cv') + 1
    )
    expect((wrapper.find('#name').element as HTMLInputElement).value).toBe(
      'Ana'
    )
    expect((wrapper.find('#portfolio').element as HTMLInputElement).value).toBe(
      'https://ana.dev'
    )
    expect(wrapper.text()).toContain('cv.pdf')
  })

  it('should not show the success copy when the CV upload failed', async () => {
    const { wrapper } = await failedUpload()

    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain(content.success.title)
    expect(wrapper.text()).not.toContain(content.error.title)
  })

  it("should point the CV input's aria-describedby at the CV error while it is shown", async () => {
    const { wrapper } = await failedUpload()
    const describedBy = wrapper.find('#cv').attributes('aria-describedby')
    const message = wrapper.find(`[id="${describedBy}"]`)

    expect(message.text()).toBe(content.cvUploadError.message)

    await selectFile(wrapper, pdf)
    expect(wrapper.find('#cv').attributes('aria-describedby')).toBeUndefined()
    expect(wrapper.text()).not.toContain(content.cvUploadError.message)
  })

  it('should call the submitter again with the chosen file when Reintentar subida is clicked', async () => {
    const { wrapper, submitter } = await failedUpload()

    submitter.submit.mockResolvedValueOnce({ kind: 'success' })
    await wrapper.find('[role="alert"] button').trigger('click')
    await flushPromises()

    expect(submitter.submit).toHaveBeenCalledTimes(2)
    expect(submitter.submit.mock.calls[1]?.[0].cv?.name).toBe('cv.pdf')
    expect(wrapper.find('[role="status"]').text()).toBe(content.success.title)
  })

  it('should empty the CV field and submit without the file when Enviar sin CV is clicked', async () => {
    const { wrapper, submitter } = await failedUpload()
    submitter.submit.mockReturnValueOnce(new Promise(() => undefined))

    await wrapper.findAll('[role="alert"] button')[1]?.trigger('click')
    await flushPromises()

    expect(submitter.submit).toHaveBeenCalledTimes(2)
    expect(submitter.submit.mock.calls[1]?.[0].cv).toBeNull()
    expect(wrapper.text()).toContain(content.fields.cv.placeholder)
    expect(wrapper.text()).not.toContain('cv.pdf')
  })

  it('should show the standard success copy and no extra note when sending without CV succeeds', async () => {
    const { wrapper, submitter } = await failedUpload()
    submitter.submit.mockResolvedValueOnce({ kind: 'success' })

    await wrapper.findAll('[role="alert"] button')[1]?.trigger('click')
    await flushPromises()

    expect(wrapper.find('[role="status"]').text()).toBe(content.success.title)
  })

  it('should render both actions as buttons that do not submit the form', async () => {
    const { wrapper } = await failedUpload()

    for (const button of wrapper.findAll('[role="alert"] button')) {
      expect(button.attributes('type')).toBe('button')
    }
  })
})

describe('ApplicationForm · uploading', () => {
  it('should disable the button, show the uploading label and lock the fields while uploading', async () => {
    const { submitter, control } = pendingSubmitter()
    const wrapper = mountForm({ submitter })

    await attachCv(wrapper)
    await submitValid(wrapper)

    const button = wrapper.find('button[type="submit"]')
    expect(button.attributes('disabled')).toBe('')
    expect(button.text()).toBe(content.uploading)
    expect(wrapper.find('#name').attributes('readonly')).toBe('')
    expect(wrapper.find('#cv').attributes('disabled')).toBe('')
    expect(wrapper.find('form').attributes('aria-busy')).toBe('true')

    await wrapper.find('form').trigger('submit')
    expect(submitter.submit).toHaveBeenCalledTimes(1)

    control.progress?.cvUploaded()
    await flushPromises()
    expect(button.text()).toBe(content.sending)
  })

  it('should not render the CV actions while uploading', async () => {
    const { submitter } = pendingSubmitter()
    const wrapper = mountForm({ submitter })

    await attachCv(wrapper)
    await submitValid(wrapper)

    expect(wrapper.text()).not.toContain(content.cvUploadError.retry)
    expect(wrapper.text()).not.toContain(content.cvUploadError.submitWithoutCv)
  })

  it('should never show the uploading label when no CV is chosen', async () => {
    const { submitter } = pendingSubmitter()
    const wrapper = mountForm({ submitter })

    await submitValid(wrapper)

    expect(wrapper.find('button[type="submit"]').text()).toBe(content.sending)
  })
})

describe('ApplicationForm · immediate file checks', () => {
  it('should show the format error immediately and send nothing when a non-PDF is selected', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const submitter = stubSubmitter()
    const wrapper = mountForm({ submitter })

    await attachCv(wrapper)
    await selectFile(
      wrapper,
      new File(['x'], 'cv.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
    )

    expect(wrapper.text()).toContain(content.fields.cv.errorFormat)
    expect(wrapper.find('#cv').attributes('aria-invalid')).toBe('true')
    expect(wrapper.text()).toContain(content.fields.cv.placeholder)
    expect(wrapper.text()).not.toContain('cv.pdf')
    expect(submitter.submit).not.toHaveBeenCalled()
    expect(submitter.engage).not.toHaveBeenCalled()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('should show the size error immediately and send nothing when a PDF over 5242880 bytes is selected', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const submitter = stubSubmitter()
    const wrapper = mountForm({ submitter })

    await selectFile(wrapper, sizedFile(CV_MAX_BYTES + 1))

    expect(wrapper.text()).toContain(content.fields.cv.errorSize)
    expect(wrapper.text()).toContain(content.fields.cv.placeholder)
    expect(submitter.submit).not.toHaveBeenCalled()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('should accept a PDF of exactly 5242880 bytes', async () => {
    const wrapper = mountForm()

    await selectFile(wrapper, sizedFile(CV_MAX_BYTES))

    expect(CV_MAX_BYTES).toBe(5_242_880)
    expect(wrapper.text()).not.toContain(content.fields.cv.errorSize)
    expect(wrapper.text()).toContain('big.pdf')
  })

  it('should clear the refusal when a valid PDF is then selected', async () => {
    const wrapper = mountForm()

    await selectFile(wrapper, sizedFile(CV_MAX_BYTES + 1))
    await attachCv(wrapper)

    expect(wrapper.text()).not.toContain(content.fields.cv.errorSize)
    expect(wrapper.text()).toContain('cv.pdf')
  })
})

describe('ApplicationForm · server field errors', () => {
  it('should mark the inputs the server rejected, focus the first, and show no alert', async () => {
    const wrapper = mountForm({
      submitter: stubSubmitter({
        kind: 'field-errors',
        fields: ['portfolio', 'areaRole'],
      }),
    })

    await wrapper.find('#portfolio').setValue('https://ana.dev')
    await submitValid(wrapper)

    expect(wrapper.find('#areaRole').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('#portfolio').attributes('aria-invalid')).toBe('true')
    expect(wrapper.text()).toContain(content.fields.portfolio.errorFormat)
    expect(document.activeElement).toBe(wrapper.find('#areaRole').element)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })
})

describe('ApplicationForm · anti-spam', () => {
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
  })
})

describe('ApplicationForm · previewState is a Storybook-only display override', () => {
  it('should render no outcome markup when previewState is absent', () => {
    const wrapper = mountForm()

    expect(wrapper.text()).not.toContain(content.sending)
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('should show the uploading label on a disabled button when previewState is uploading', () => {
    const wrapper = mountForm({ previewState: 'uploading' })
    const button = wrapper.find('button[type="submit"]')

    expect(button.attributes('disabled')).toBe('')
    expect(button.text()).toBe(content.uploading)
    expect(wrapper.find('#name').attributes('readonly')).toBe('')
  })

  it('should show the CV error with both actions when previewState is cv-upload-error', () => {
    const wrapper = mountForm({ previewState: 'cv-upload-error' })

    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('[role="alert"]').text()).toContain(
      content.cvUploadError.message
    )
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
    expect(wrapper.text()).toContain(content.success.title)
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
