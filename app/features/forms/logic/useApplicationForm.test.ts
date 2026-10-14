import { describe, expect, it, vi } from 'vitest'
import { toRaw } from 'vue'
import {
  type ApplicationFieldId,
  type ApplicationFormValues,
  initialApplicationFormValues,
} from '@/features/forms/data/applicationFields'
import {
  type ApplicationSubmitter,
  MIN_FILL_TIME_MS,
  type SubmissionOutcome,
  type SubmissionProgress,
} from '@/features/forms/data/submissionContract'
import {
  useApplicationForm,
  validateApplicationForm,
} from './useApplicationForm'

/** A `File` fixture with a controllable `.size`, since a real PDF this small
 * would never exceed `CV_MAX_BYTES` on its own. */
function pdfFixture(size = 1024, type = 'application/pdf'): File {
  const file = new File(['%PDF-1.4'], 'cv.pdf', { type })
  if (file.size !== size) {
    Object.defineProperty(file, 'size', { value: size })
  }
  return file
}

describe('validateApplicationForm', () => {
  it('should flag every always-required field when all values are empty', () => {
    const errors = validateApplicationForm(initialApplicationFormValues())

    expect(Object.keys(errors)).toEqual(['name', 'email', 'areaRole'])
  })

  it('should not flag cv, portfolio or linkedin when every other field is valid', () => {
    const errors = validateApplicationForm({
      ...initialApplicationFormValues(),
      name: 'Ana',
      email: 'ana@muush.dev',
      areaRole: 'it:placeholder',
    })

    expect(errors).toEqual({})
    expect(errors.cv).toBeUndefined()
    expect(errors.portfolio).toBeUndefined()
    expect(errors.linkedin).toBeUndefined()
  })

  it('should reject a name shorter than the minimum when validated', () => {
    const errors = validateApplicationForm({
      ...initialApplicationFormValues(),
      name: 'A',
    })

    expect(errors.name).toBe('forms.application.fields.name.errorRequired')
  })

  it('should reject a malformed email independently of the other fields', () => {
    const errors = validateApplicationForm({
      ...initialApplicationFormValues(),
      name: 'Ana',
      email: 'not-an-email',
      areaRole: 'it:placeholder',
    })

    expect(Object.keys(errors)).toEqual(['email'])
  })

  it('should require an area/role selection', () => {
    const errors = validateApplicationForm({
      ...initialApplicationFormValues(),
      name: 'Ana',
      email: 'ana@muush.dev',
      areaRole: '',
    })

    expect(errors.areaRole).toBe(
      'forms.application.fields.areaRole.errorRequired'
    )
  })

  it('should never validate portfolio or linkedin when they are empty', () => {
    const errors = validateApplicationForm({
      ...initialApplicationFormValues(),
      name: 'Ana',
      email: 'ana@muush.dev',
      areaRole: 'it:placeholder',
      portfolio: '',
      linkedin: '',
    })

    expect(errors.portfolio).toBeUndefined()
    expect(errors.linkedin).toBeUndefined()
  })

  it('should reject a malformed portfolio or linkedin URL only when non-empty', () => {
    const errors = validateApplicationForm({
      ...initialApplicationFormValues(),
      name: 'Ana',
      email: 'ana@muush.dev',
      areaRole: 'it:placeholder',
      portfolio: 'not a url',
      linkedin: 'also not a url',
    })

    expect(errors.portfolio).toBe(
      'forms.application.fields.portfolio.errorFormat'
    )
    expect(errors.linkedin).toBe(
      'forms.application.fields.linkedin.errorFormat'
    )
  })

  it('should accept a well-formed portfolio and linkedin URL', () => {
    const errors = validateApplicationForm({
      ...initialApplicationFormValues(),
      name: 'Ana',
      email: 'ana@muush.dev',
      areaRole: 'it:placeholder',
      portfolio: 'https://ana.dev',
      linkedin: 'https://linkedin.com/in/ana',
    })

    expect(errors.portfolio).toBeUndefined()
    expect(errors.linkedin).toBeUndefined()
  })

  describe('cv', () => {
    it('should not flag a null cv when CV_REQUIRED is false (the shipped default)', () => {
      const errors = validateApplicationForm({
        ...initialApplicationFormValues(),
        name: 'Ana',
        email: 'ana@muush.dev',
        areaRole: 'it:placeholder',
        cv: null,
      })

      expect(errors.cv).toBeUndefined()
    })

    it('should reject a non-PDF file with the format error', () => {
      const errors = validateApplicationForm({
        ...initialApplicationFormValues(),
        name: 'Ana',
        email: 'ana@muush.dev',
        areaRole: 'it:placeholder',
        cv: new File(['x'], 'cv.docx', {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }),
      })

      expect(errors.cv).toBe('forms.application.fields.cv.errorFormat')
    })

    it('should reject a PDF over the size limit with the size error', () => {
      const errors = validateApplicationForm({
        ...initialApplicationFormValues(),
        name: 'Ana',
        email: 'ana@muush.dev',
        areaRole: 'it:placeholder',
        cv: pdfFixture(6 * 1024 * 1024),
      })

      expect(errors.cv).toBe('forms.application.fields.cv.errorSize')
    })

    it('should accept a valid PDF under the size limit', () => {
      const errors = validateApplicationForm({
        ...initialApplicationFormValues(),
        name: 'Ana',
        email: 'ana@muush.dev',
        areaRole: 'it:placeholder',
        cv: pdfFixture(1024),
      })

      expect(errors.cv).toBeUndefined()
    })
  })

  it('should never validate whatsapp while the preference is email', () => {
    const errors = validateApplicationForm({
      ...initialApplicationFormValues(),
      name: 'Ana',
      email: 'ana@muush.dev',
      areaRole: 'it:placeholder',
      contactPreference: 'email',
      whatsapp: '',
    })

    expect(errors.whatsapp).toBeUndefined()
  })

  it('should require whatsapp only when the preference is whatsapp', () => {
    const errors = validateApplicationForm({
      ...initialApplicationFormValues(),
      name: 'Ana',
      email: 'ana@muush.dev',
      areaRole: 'it:placeholder',
      contactPreference: 'whatsapp',
      whatsapp: '',
    })

    expect(errors.whatsapp).toBe(
      'forms.application.fields.whatsapp.errorRequired'
    )
  })

  it('should reject a whatsapp number with the wrong digit count for Mexico', () => {
    const errors = validateApplicationForm({
      ...initialApplicationFormValues(),
      name: 'Ana',
      email: 'ana@muush.dev',
      areaRole: 'it:placeholder',
      contactPreference: 'whatsapp',
      whatsapp: '123',
    })

    expect(errors.whatsapp).toBe(
      'forms.application.fields.whatsapp.errorDigits'
    )
  })
})

const VALID: Partial<ApplicationFormValues> = {
  name: 'Ana',
  email: 'ana@muush.dev',
  areaRole: 'it:backend',
}

function stubSubmitter(
  outcome: SubmissionOutcome<ApplicationFieldId> = { kind: 'success' }
) {
  return {
    engage: vi.fn<ApplicationSubmitter['engage']>(),
    submit: vi.fn<ApplicationSubmitter['submit']>(async () => outcome),
  }
}

/** A composable whose clock already sits past the minimum fill time. */
function readyForm(
  initial: Partial<ApplicationFormValues> = VALID,
  submitter = stubSubmitter()
) {
  let clock = 0
  const form = useApplicationForm({ submitter, initial, now: () => clock })
  form.markInteractive()
  clock += MIN_FILL_TIME_MS
  return { form, submitter }
}

describe('useApplicationForm · client validation', () => {
  it('should default to idle with the default contact preference of email', () => {
    const { state, values } = useApplicationForm({ submitter: stubSubmitter() })

    expect(state.value).toBe('idle')
    expect(values.value.contactPreference).toBe('email')
    expect(values.value.cv).toBeNull()
  })

  it('should move to invalid, name the first invalid field and send nothing on an empty submit', async () => {
    const { form, submitter } = readyForm({})

    await form.onSubmit(new Event('submit'))

    expect(form.state.value).toBe('invalid')
    expect(form.firstInvalidFieldId.value).toBe('name')
    expect(submitter.submit).not.toHaveBeenCalled()
  })

  it('should not clear any value when validation fails', async () => {
    const { form } = readyForm({ name: 'A', portfolio: 'https://ana.dev' })

    await form.onSubmit(new Event('submit'))

    expect(form.values.value.name).toBe('A')
    expect(form.values.value.portfolio).toBe('https://ana.dev')
  })

  it('should call preventDefault on submit regardless of validity', async () => {
    const event = new Event('submit', { cancelable: true })
    const { form } = readyForm({})

    await form.onSubmit(event)

    expect(event.defaultPrevented).toBe(true)
  })
})

/** A submitter whose `submit` stays pending until the test settles it. */
function pendingSubmitter() {
  const submitter = stubSubmitter()
  const control: {
    finish: (outcome: SubmissionOutcome<ApplicationFieldId>) => void
    progress?: SubmissionProgress
  } = { finish: () => undefined }
  submitter.submit.mockImplementation(
    (_values, progress) =>
      new Promise(resolve => {
        control.finish = resolve
        control.progress = progress
      })
  )
  return { submitter, control }
}

describe('useApplicationForm · the submit state machine', () => {
  it('should go uploading, then sending after progress.cvUploaded, then success when a CV is chosen', async () => {
    const { submitter, control } = pendingSubmitter()
    const cv = pdfFixture(2048)
    const { form } = readyForm({ ...VALID, cv }, submitter)

    const submitting = form.onSubmit(new Event('submit'))
    expect(form.state.value).toBe('uploading')
    expect(submitter.submit.mock.calls[0]?.[0].cv).toBe(cv)

    control.progress?.cvUploaded()
    expect(form.state.value).toBe('sending')

    control.finish({ kind: 'success' })
    await submitting
    expect(form.state.value).toBe('success')
  })

  it('should go straight to sending when no CV is chosen', async () => {
    const { submitter, control } = pendingSubmitter()
    const { form } = readyForm(VALID, submitter)

    const submitting = form.onSubmit(new Event('submit'))
    expect(form.state.value).toBe('sending')

    control.finish({ kind: 'success' })
    await submitting
    expect(form.state.value).toBe('success')
  })

  it('should call the submitter once when submit fires again while uploading', () => {
    const { submitter } = pendingSubmitter()
    const { form } = readyForm({ ...VALID, cv: pdfFixture() }, submitter)

    void form.onSubmit(new Event('submit'))
    void form.onSubmit(new Event('submit'))

    expect(form.state.value).toBe('uploading')
    expect(submitter.submit).toHaveBeenCalledTimes(1)
  })

  it('should call the submitter once when submit fires again while sending', () => {
    const { submitter } = pendingSubmitter()
    const { form } = readyForm(VALID, submitter)

    void form.onSubmit(new Event('submit'))
    void form.onSubmit(new Event('submit'))

    expect(submitter.submit).toHaveBeenCalledTimes(1)
  })

  it('should move to server-error with every value intact when the submitter fails', async () => {
    const cv = pdfFixture()
    const { form, submitter } = readyForm(
      { ...VALID, cv },
      stubSubmitter({ kind: 'failure' })
    )

    await form.onSubmit(new Event('submit'))

    expect(form.state.value).toBe('server-error')
    expect(toRaw(form.values.value).cv).toBe(cv)
    expect(form.values.value.name).toBe('Ana')

    await form.onSubmit(new Event('submit'))
    expect(submitter.submit).toHaveBeenCalledTimes(2)
  })
})

describe('useApplicationForm · a failed CV upload', () => {
  function failedUpload() {
    const cv = pdfFixture(2048)
    const ready = readyForm(
      { ...VALID, portfolio: 'https://ana.dev', cv },
      stubSubmitter({ kind: 'cv-upload-failed' })
    )
    return { ...ready, cv }
  }

  it('should enter cv-upload-error, keep every value and the file, and not succeed when the submitter reports cv-upload-failed', async () => {
    const { form, cv } = failedUpload()

    await form.onSubmit(new Event('submit'))

    expect(form.state.value).toBe('cv-upload-error')
    expect(form.cvUploadFailed.value).toBe(true)
    expect(toRaw(form.values.value).cv).toBe(cv)
    expect(form.values.value).toMatchObject({
      name: 'Ana',
      email: 'ana@muush.dev',
      areaRole: 'it:backend',
      portfolio: 'https://ana.dev',
    })
  })

  it('should clear cv-upload-error back to idle when the visitor picks another file', async () => {
    const { form } = failedUpload()
    await form.onSubmit(new Event('submit'))

    form.onCvChange(pdfFixture(4096))

    expect(form.state.value).toBe('idle')
    expect(form.cvUploadFailed.value).toBe(false)
  })

  it('should clear cv-upload-error back to idle when the visitor removes the file', async () => {
    const { form } = failedUpload()
    await form.onSubmit(new Event('submit'))

    form.onCvChange(null)

    expect(form.state.value).toBe('idle')
    expect(form.values.value.cv).toBeNull()
  })

  it('should call the submitter again with the same file when onRetryCvUpload runs from cv-upload-error', async () => {
    const { form, submitter, cv } = failedUpload()
    await form.onSubmit(new Event('submit'))

    submitter.submit.mockResolvedValueOnce({ kind: 'success' })
    await form.onRetryCvUpload()

    expect(submitter.submit).toHaveBeenCalledTimes(2)
    expect(submitter.submit.mock.calls[1]?.[0].cv).toBe(cv)
    expect(form.state.value).toBe('success')
  })

  it('should call the submitter again with the file when the form is submitted from cv-upload-error', async () => {
    const { form, submitter, cv } = failedUpload()
    await form.onSubmit(new Event('submit'))

    await form.onSubmit(new Event('submit'))

    expect(submitter.submit).toHaveBeenCalledTimes(2)
    expect(submitter.submit.mock.calls[1]?.[0].cv).toBe(cv)
    expect(form.state.value).toBe('cv-upload-error')
  })

  it('should ignore onRetryCvUpload while uploading or sending', () => {
    const { submitter, control } = pendingSubmitter()
    const { form } = readyForm({ ...VALID, cv: pdfFixture() }, submitter)

    void form.onSubmit(new Event('submit'))
    void form.onRetryCvUpload()
    control.progress?.cvUploaded()
    void form.onRetryCvUpload()

    expect(form.state.value).toBe('sending')
    expect(submitter.submit).toHaveBeenCalledTimes(1)
  })

  it('should clear the file and call the submitter with cv null when onSubmitWithoutCv runs', async () => {
    const { form, submitter } = failedUpload()
    await form.onSubmit(new Event('submit'))

    submitter.submit.mockResolvedValueOnce({ kind: 'success' })
    await form.onSubmitWithoutCv()

    expect(form.values.value.cv).toBeNull()
    expect(submitter.submit).toHaveBeenCalledTimes(2)
    expect(submitter.submit.mock.calls[1]?.[0].cv).toBeNull()
    expect(form.state.value).toBe('success')
  })

  it('should show the generic error and keep the CV removed when sending without CV fails', async () => {
    const { form, submitter } = failedUpload()
    await form.onSubmit(new Event('submit'))

    submitter.submit.mockResolvedValue({ kind: 'failure' })
    await form.onSubmitWithoutCv()

    expect(form.state.value).toBe('server-error')
    expect(form.values.value.cv).toBeNull()
    expect(form.values.value.name).toBe('Ana')

    await form.onSubmit(new Event('submit'))
    expect(submitter.submit.mock.calls[2]?.[0].cv).toBeNull()
  })

  it('should never drop the file through onSubmitWithoutCv when no CV error is shown', async () => {
    const { submitter } = pendingSubmitter()
    const cv = pdfFixture()
    const { form } = readyForm({ ...VALID, cv }, submitter)

    void form.onSubmit(new Event('submit'))
    await form.onSubmitWithoutCv()

    expect(toRaw(form.values.value).cv).toBe(cv)
    expect(submitter.submit).toHaveBeenCalledTimes(1)
  })
})

describe('useApplicationForm · immediate file refusal', () => {
  it('should clear the file and expose a format rejection when onCvReject receives format', () => {
    const { form } = readyForm({ ...VALID, cv: pdfFixture() })

    form.onCvReject('format')

    expect(form.values.value.cv).toBeNull()
    expect(form.cvRejection.value).toBe('format')
  })

  it('should clear the file and expose a size rejection when onCvReject receives size', () => {
    const { form } = readyForm({ ...VALID, cv: pdfFixture() })

    form.onCvReject('size')

    expect(form.values.value.cv).toBeNull()
    expect(form.cvRejection.value).toBe('size')
  })

  it('should clear the rejection when a valid file is chosen', () => {
    const { form } = readyForm()

    form.onCvReject('format')
    form.onCvChange(pdfFixture())

    expect(form.cvRejection.value).toBeNull()
    expect(form.values.value.cv).toBeInstanceOf(File)
  })

  it('should never call the submitter from onCvReject', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { form, submitter } = readyForm()

    form.onCvReject('size')

    expect(submitter.submit).not.toHaveBeenCalled()
    expect(submitter.engage).not.toHaveBeenCalled()
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(form.state.value).toBe('idle')
    fetchSpy.mockRestore()
  })
})

describe('useApplicationForm · server field errors', () => {
  it('should mark the rejected fields with their existing keys in form order', async () => {
    const { form } = readyForm(
      { ...VALID, linkedin: 'https://linkedin.com/in/ana' },
      stubSubmitter({ kind: 'field-errors', fields: ['linkedin', 'email'] })
    )

    await form.onSubmit(new Event('submit'))

    expect(form.state.value).toBe('invalid')
    expect(form.errors.value).toEqual({
      email: 'forms.application.fields.email.errorFormat',
      linkedin: 'forms.application.fields.linkedin.errorFormat',
    })
    expect(form.firstInvalidFieldId.value).toBe('email')

    form.values.value.email = 'ana.ruiz@muush.dev'
    expect(Object.keys(form.errors.value)).toEqual(['linkedin'])
  })
})

describe('useApplicationForm · anti-spam guard', () => {
  it('should send nothing and show the generic error when the honeypot is filled', async () => {
    const { form, submitter } = readyForm()

    form.honeypot.value = 'bot'
    await form.onSubmit(new Event('submit'))

    expect(form.state.value).toBe('server-error')
    expect(submitter.submit).not.toHaveBeenCalled()
  })

  it('should send nothing before the minimum fill time and send after it', async () => {
    let clock = 0
    const submitter = stubSubmitter()
    const form = useApplicationForm({
      submitter,
      initial: VALID,
      now: () => clock,
    })
    form.markInteractive()

    await form.onSubmit(new Event('submit'))
    expect(submitter.submit).not.toHaveBeenCalled()

    clock += MIN_FILL_TIME_MS
    await form.onSubmit(new Event('submit'))
    expect(submitter.submit).toHaveBeenCalledTimes(1)
  })
})

describe('useApplicationForm · the WhatsApp field discards its value', () => {
  it('should reset whatsapp to empty synchronously when switching back to email', () => {
    const { values, onContactPreferenceChange } = useApplicationForm({
      submitter: stubSubmitter(),
    })

    onContactPreferenceChange('whatsapp')
    values.value.whatsapp = '5639060739'
    onContactPreferenceChange('email')

    expect(values.value.whatsapp).toBe('')
    expect(values.value.contactPreference).toBe('email')
  })

  it('should leave whatsapp untouched while staying on whatsapp', () => {
    const { values, onContactPreferenceChange } = useApplicationForm({
      submitter: stubSubmitter(),
    })

    onContactPreferenceChange('whatsapp')
    values.value.whatsapp = '5639060739'
    onContactPreferenceChange('whatsapp')

    expect(values.value.whatsapp).toBe('5639060739')
  })
})

describe('useApplicationForm · storing the CV transmits nothing', () => {
  it('should store the raw File on onCvChange with no serialization', () => {
    /* `values` is a reactive `ref`, so the stored file is Vue's reactive
       proxy over the original object, not the same reference — comparing
       its own properties is what proves nothing was serialized instead. */
    const { values, onCvChange } = useApplicationForm({
      submitter: stubSubmitter(),
    })
    const file = pdfFixture(2048)

    onCvChange(file)

    expect(values.value.cv).toBeInstanceOf(File)
    expect(values.value.cv?.name).toBe(file.name)
    expect(values.value.cv?.size).toBe(file.size)
    expect(values.value.cv?.type).toBe(file.type)
  })

  it('should clear cv back to null when onCvChange receives null', () => {
    const { values, onCvChange } = useApplicationForm({
      submitter: stubSubmitter(),
    })

    onCvChange(pdfFixture(2048))
    onCvChange(null)

    expect(values.value.cv).toBeNull()
  })

  it('should call no network primitive from onCvChange, even when a real File is stored', () => {
    /* Choosing a file only stores it; it leaves the browser only through
       the presigned upload of `submissionFlows.ts`, on submit. */
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { values, onCvChange } = useApplicationForm({
      submitter: stubSubmitter(),
    })

    onCvChange(pdfFixture(2048))

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(values.value.cv).toBeInstanceOf(File)
    fetchSpy.mockRestore()
  })
})
