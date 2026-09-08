import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { mount, type VueWrapper } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FileField from './FileField.vue'

/** A `File` fixture with a controllable `.size`. */
function fileFixture(name: string, type: string, size = 1024): File {
  const file = new File(['x'], name, { type })
  if (file.size !== size) {
    Object.defineProperty(file, 'size', { value: size })
  }
  return file
}

function selectFile(wrapper: VueWrapper, file: File | null) {
  const input = wrapper.find('input[type="file"]').element as HTMLInputElement
  Object.defineProperty(input, 'files', {
    value: file ? [file] : [],
    configurable: true,
  })
  return wrapper.find('input[type="file"]').trigger('change')
}

function fileFieldSource(): string {
  return readFileSync(
    join(process.cwd(), 'app', 'features', 'forms', 'ui', 'FileField.vue'),
    'utf8'
  )
}

describe('FileField · a real, presentational control', () => {
  it('should show the filename and size when a valid PDF under the limit is selected', async () => {
    const wrapper = mount(FileField, {
      props: {
        id: 'cv',
        label: 'CV',
        modelValue: null,
        placeholder: 'Adjuntar CV · PDF',
      },
    })

    await selectFile(wrapper, fileFixture('cv.pdf', 'application/pdf', 2048))

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBeInstanceOf(File)
    expect(wrapper.emitted('reject')).toBeUndefined()
  })

  it('should reject a non-PDF file with a format rejection, not modelValue', async () => {
    const wrapper = mount(FileField, {
      props: {
        id: 'cv',
        label: 'CV',
        modelValue: null,
        placeholder: 'Adjuntar CV · PDF',
      },
    })

    await selectFile(
      wrapper,
      fileFixture(
        'cv.docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )
    )

    expect(wrapper.emitted('reject')?.[0]).toEqual(['format'])
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('should reject an oversized PDF with a size rejection, not modelValue', async () => {
    const wrapper = mount(FileField, {
      props: {
        id: 'cv',
        label: 'CV',
        modelValue: null,
        placeholder: 'Adjuntar CV · PDF',
      },
    })

    await selectFile(
      wrapper,
      fileFixture('cv.pdf', 'application/pdf', 6 * 1024 * 1024)
    )

    expect(wrapper.emitted('reject')?.[0]).toEqual(['size'])
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('should render the filename and human-readable size when a file is already selected', () => {
    const wrapper = mount(FileField, {
      props: {
        id: 'cv',
        label: 'CV',
        modelValue: fileFixture('cv.pdf', 'application/pdf', 2048),
        placeholder: 'Adjuntar CV · PDF',
      },
    })

    expect(wrapper.text()).toContain('cv.pdf')
    expect(wrapper.text()).toContain('2.0 KB')
  })

  it('should show the placeholder, not a filename, when no file is selected', () => {
    const wrapper = mount(FileField, {
      props: {
        id: 'cv',
        label: 'CV',
        modelValue: null,
        placeholder: 'Adjuntar CV · PDF',
      },
    })

    expect(wrapper.text()).toContain('Adjuntar CV · PDF')
  })

  it('should render an error message and mark the control invalid when an error is given', () => {
    const wrapper = mount(FileField, {
      props: {
        id: 'cv',
        label: 'CV',
        modelValue: null,
        placeholder: 'Adjuntar CV · PDF',
        error: 'Solo se aceptan archivos PDF',
      },
    })

    expect(wrapper.find('input[type="file"]').attributes('aria-invalid')).toBe(
      'true'
    )
    expect(wrapper.text()).toContain('Solo se aceptan archivos PDF')
  })

  it('should accept a PDF-only accept attribute by default', () => {
    const wrapper = mount(FileField, {
      props: {
        id: 'cv',
        label: 'CV',
        modelValue: null,
        placeholder: 'Adjuntar CV · PDF',
      },
    })

    expect(wrapper.find('input[type="file"]').attributes('accept')).toBe(
      'application/pdf'
    )
  })
})

describe('FileField · the structurally-enforced dead end', () => {
  it('should reference no FormData, fetch or XMLHttpRequest anywhere in its own source', () => {
    /* Read from disk, not imported and not string-matched against the
       mounted component: a doc comment mentioning these words in prose would
       otherwise produce a false red, so this greps the template/script
       source for an actual construction or call, never a bare word
       (plan.md D-1). */
    expect(fileFieldSource()).not.toMatch(
      /new FormData\(|fetch\(|new XMLHttpRequest\(/
    )
  })

  it('should reference no createObjectURL anywhere in its own source', () => {
    /* Complements the grep above: no object URL is ever created for the
       selected file, past this component's lifetime or otherwise. */
    expect(fileFieldSource()).not.toMatch(/createObjectURL/)
  })
})
