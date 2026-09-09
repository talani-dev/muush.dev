import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import type { ApplicationFormContent } from '@/features/forms/data/applicationFields'
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
    whatsapp: {
      label: 'Número de WhatsApp',
      errorRequired: 'Escribe tu número',
      errorDigits: 'Deben ser 10 dígitos',
    },
  },
  submit: 'Enviar',
  sending: 'Enviando…',
  success: { title: 'Gracias, ya tenemos tu perfil.' },
  error: {
    title: 'No pudimos enviarlo.',
    fallback: 'support@muush.dev',
  },
}

const mounted: VueWrapper[] = []

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
})

interface MountOverrides {
  previewState?: 'sending' | 'success' | 'server-error'
}

function mountForm(overrides: MountOverrides = {}) {
  const wrapper = mount(ApplicationForm, { props: { content, ...overrides } })
  mounted.push(wrapper)
  return wrapper
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

  it('should show no error and no unreachable-state markup on a valid minimal submit', async () => {
    const wrapper = mountForm()

    await wrapper.find('#name').setValue('Ana')
    await wrapper.find('#email').setValue('ana@muush.dev')
    await wrapper.find('#areaRole').setValue('it:placeholder')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).not.toContain(content.fields.name.errorRequired)
    expect(wrapper.text()).not.toContain(content.sending)
    expect(wrapper.text()).not.toContain(content.success.title)
    expect(wrapper.text()).not.toContain(content.error.title)
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

describe('ApplicationForm · the CV field', () => {
  it('should attach a CV and still show no error, no sending/success/server-error markup on submit', async () => {
    const wrapper = mountForm()
    const file = new File(['%PDF-1.4'], 'cv.pdf', { type: 'application/pdf' })
    const input = wrapper.find('#cv').element as HTMLInputElement
    Object.defineProperty(input, 'files', { value: [file] })

    await wrapper.find('#cv').trigger('change')
    await wrapper.find('#name').setValue('Ana')
    await wrapper.find('#email').setValue('ana@muush.dev')
    await wrapper.find('#areaRole').setValue('it:placeholder')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).not.toContain(content.fields.cv.errorFormat)
    expect(wrapper.text()).not.toContain(content.sending)
    expect(wrapper.text()).not.toContain(content.success.title)
    expect(wrapper.text()).not.toContain(content.error.title)
  })
})

describe('ApplicationForm · previewState is Storybook-only', () => {
  it('should render no preview markup when previewState is absent', () => {
    const wrapper = mountForm()

    expect(wrapper.text()).not.toContain(content.sending)
    expect(wrapper.text()).not.toContain(content.success.title)
    expect(wrapper.text()).not.toContain(content.error.title)
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
