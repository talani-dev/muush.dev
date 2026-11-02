import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ApplicationFieldId } from '@/features/forms/data/applicationFields'
import { FORM_STEPS_MEDIA_QUERY } from '@/features/forms/data/formSteps'
import {
  type ApplicationSubmitter,
  MIN_FILL_TIME_MS,
  type SubmissionOutcome,
  type SubmissionProgress,
} from '@/features/forms/data/submissionContract'
import { installMatchMedia } from '@/shared/logic/fakeMediaQuery.testing'
import ApplicationForm from './ApplicationForm.vue'
import { APPLICATION_FORM_COPY } from './formsFixtures.testing'

/** Feature 45 · the v2 application form (spec US4, US5). */
const content = APPLICATION_FORM_COPY.es
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
  outcome: SubmissionOutcome<ApplicationFieldId> = { kind: 'success' }
) {
  return {
    engage: vi.fn<ApplicationSubmitter['engage']>(),
    submit: vi.fn<ApplicationSubmitter['submit']>(async () => outcome),
  }
}

async function mountForm({
  stepped = false,
  submitter = stubSubmitter() as ApplicationSubmitter,
} = {}) {
  restoreMedia = installMatchMedia({
    [FORM_STEPS_MEDIA_QUERY]: stepped,
  }).restore
  const wrapper = mount(ApplicationForm, {
    props: { content, submitter },
    attachTo: document.body,
  })
  mounted.push(wrapper)
  await flushPromises()
  return wrapper
}

function pdf(size = 1024, type = 'application/pdf', name = 'cv.pdf'): File {
  const file = new File(['%PDF'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

async function choose(wrapper: VueWrapper, file: File): Promise<void> {
  const input = wrapper.find('#cv')
  Object.defineProperty(input.element, 'files', {
    value: [file],
    configurable: true,
  })
  await input.trigger('change')
}

async function fillValid(wrapper: VueWrapper): Promise<void> {
  await wrapper.find('#name').setValue('Ana')
  await wrapper.find('#email').setValue('ana@muush.dev')
  await wrapper.find('#areaRole').setValue('it:backend')
}

async function submit(wrapper: VueWrapper): Promise<void> {
  clock += MIN_FILL_TIME_MS
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

const submitLabel = (wrapper: VueWrapper) =>
  wrapper.find('button[type="submit"] span').text()

describe('ApplicationForm · the single view (US4)', () => {
  it('should render the fields in the design order when wide', async () => {
    const wrapper = await mountForm()
    const ids = wrapper
      .findAll('input:not([type="radio"]), select, textarea')
      .map(control => control.attributes('id') ?? control.attributes('name'))

    expect(ids).toEqual([
      'name',
      'email',
      'portfolio',
      'areaRole',
      'linkedin',
      'cv',
      'privacy',
      'muush_website',
    ])
    expect(wrapper.find('#cv').attributes('accept')).toBe('application/pdf')
    expect(wrapper.findAll('optgroup')).toHaveLength(6)
  })

  it('should send nothing while the box is unticked', async () => {
    const submitter = stubSubmitter()
    const wrapper = await mountForm({ submitter })
    await fillValid(wrapper)

    await submit(wrapper)

    expect(submitter.submit).not.toHaveBeenCalled()
    expect(document.activeElement?.id).toBe('privacy')
  })
})

describe('ApplicationForm · the CV (US4, FR-020, FR-033)', () => {
  it.each([
    ['a non-PDF', pdf(1024, 'text/plain', 'cv.txt')],
    ['a PDF one byte over 5 MiB', pdf(5_242_881)],
  ])(
    'should refuse %s at once, keep the box empty and send nothing',
    async (_, file) => {
      const submitter = stubSubmitter()
      const wrapper = await mountForm({ submitter })

      await choose(wrapper, file)

      expect(wrapper.find('#cv-error').text()).toBe(
        'Adjunta tu CV en PDF de hasta 5 MB.'
      )
      expect(wrapper.find('label.caja').text()).toBe(
        content.fields.cv.placeholder
      )
      expect(submitter.submit).not.toHaveBeenCalled()
    }
  )

  it('should keep a PDF of exactly 5 MiB and show its name', async () => {
    const wrapper = await mountForm()

    await choose(wrapper, pdf(5_242_880, 'application/pdf', 'ana.pdf'))

    expect(wrapper.find('#cv-error').exists()).toBe(false)
    expect(wrapper.find('label.caja').text()).toBe('ana.pdf')
  })

  it('should read Subiendo CV… while uploading and Enviando… once uploaded', async () => {
    const submitter = stubSubmitter()
    let progress: SubmissionProgress | undefined
    submitter.submit.mockImplementation((_values, given) => {
      progress = given
      return new Promise(() => undefined)
    })
    const wrapper = await mountForm({ submitter })
    await fillValid(wrapper)
    await choose(wrapper, pdf())
    await wrapper.find('#privacy').setValue(true)

    await submit(wrapper)
    expect(submitLabel(wrapper)).toBe('Subiendo CV…')

    progress?.cvUploaded()
    await flushPromises()
    expect(submitLabel(wrapper)).toBe('Enviando…')
    expect(submitter.submit.mock.calls[0]?.[0].cv?.name).toBe('cv.pdf')
  })
})

describe('ApplicationForm · a failed CV upload (FR-034)', () => {
  async function failedUpload() {
    const submitter = stubSubmitter({ kind: 'cv-upload-failed' })
    const wrapper = await mountForm({ submitter })
    await fillValid(wrapper)
    await choose(wrapper, pdf(2048, 'application/pdf', 'ana.pdf'))
    await wrapper.find('#privacy').setValue(true)
    await submit(wrapper)
    return { wrapper, submitter }
  }

  it('should keep the file and values and offer Enviar sin CV and a retry', async () => {
    const { wrapper } = await failedUpload()

    const notice = wrapper.find('[role="alert"]')
    expect(notice.text()).toContain(content.cvUploadError.message)
    expect(notice.find('button').text()).toBe('Enviar sin CV')
    expect(submitLabel(wrapper)).toBe('Intentar de nuevo')
    expect(wrapper.find('label.caja').text()).toBe('ana.pdf')
    expect((wrapper.find('#name').element as HTMLInputElement).value).toBe(
      'Ana'
    )
  })

  it('should retry with the same file when the submit is pressed again', async () => {
    const { wrapper, submitter } = await failedUpload()

    await submit(wrapper)

    expect(submitter.submit).toHaveBeenCalledTimes(2)
    expect(submitter.submit.mock.calls[1]?.[0].cv?.name).toBe('ana.pdf')
  })

  it('should send without the CV when Enviar sin CV is chosen', async () => {
    const { wrapper, submitter } = await failedUpload()

    await wrapper.find('[role="alert"] button').trigger('click')
    await flushPromises()

    expect(submitter.submit).toHaveBeenCalledTimes(2)
    expect(submitter.submit.mock.calls[1]?.[0].cv).toBeNull()
  })

  it('should send nothing and focus the box when Enviar sin CV is chosen after unticking it', async () => {
    /* review-45 blocking item: tick, send, the upload fails, untick, then
       "Enviar sin CV" must not reach /careers (FR-009, SC-002). */
    const { wrapper, submitter } = await failedUpload()
    await wrapper.find('#privacy').setValue(false)

    await wrapper.find('[role="alert"] button').trigger('click')
    await flushPromises()

    expect(submitter.submit).toHaveBeenCalledTimes(1)
    expect(document.activeElement?.id).toBe('privacy')
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })

  it('should send nothing and focus the box when Intentar de nuevo is pressed after unticking it', async () => {
    const { wrapper, submitter } = await failedUpload()
    await wrapper.find('#privacy').setValue(false)

    await submit(wrapper)

    expect(submitter.submit).toHaveBeenCalledTimes(1)
    expect(document.activeElement?.id).toBe('privacy')
  })

  it('should dismiss the notice when another file is chosen', async () => {
    const { wrapper } = await failedUpload()

    await choose(wrapper, pdf(4096, 'application/pdf', 'otro.pdf'))

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(submitLabel(wrapper)).toBe(content.submit)
  })

  it('should show the send-error text with its support link when the send fails', async () => {
    const submitter = stubSubmitter({ kind: 'failure' })
    const wrapper = await mountForm({ submitter })
    await fillValid(wrapper)
    await wrapper.find('#privacy').setValue(true)

    await submit(wrapper)

    const notice = wrapper.find('[role="alert"]')
    expect(notice.text()).toContain('Tus datos y tu CV siguen aquí')
    expect(notice.find('a').attributes('href')).toBe('mailto:support@muush.dev')
  })
})

describe('ApplicationForm · success and steps (US4)', () => {
  it('should go back to the locale home from the confirmation when the send succeeds', async () => {
    const wrapper = await mountForm()
    await fillValid(wrapper)
    await wrapper.find('#privacy').setValue(true)

    await submit(wrapper)

    const status = wrapper.find('[role="status"]')
    expect(status.find('h3').text()).toBe('Recibimos tu aplicación.')
    expect(status.find('a').attributes('href')).toBe('/es')
    expect(status.find('a').text()).toBe('Volver al inicio')
  })

  it('should show Tu perfil as step 2 and focus Portafolio when narrow', async () => {
    const wrapper = await mountForm({ stepped: true })
    await wrapper.find('#name').setValue('Ana')
    await wrapper.find('#email').setValue('ana@muush.dev')

    await wrapper.find('button[type="button"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[aria-live="polite"]').text()).toBe(
      'Paso 2 de 2 · Tu perfil'
    )
    expect(document.activeElement?.id).toBe('portfolio')
    expect(wrapper.find('#cv').isVisible()).toBe(true)
  })

  it('should tie a visible label to every control', async () => {
    const wrapper = await mountForm()

    for (const id of ['name', 'email', 'portfolio', 'areaRole', 'linkedin']) {
      expect(wrapper.find(`label[for="${id}"]`).exists(), id).toBe(true)
    }
    expect(wrapper.find('label[for="cv"]').text()).toBe('CV')
  })
})
