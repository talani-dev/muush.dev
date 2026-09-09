import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import type { ContactFormContent } from '@/features/forms/data/contactFields'
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
    whatsapp: {
      label: 'Número de WhatsApp',
      errorRequired: 'Escribe tu número',
      errorDigits: 'Deben ser 10 dígitos',
    },
  },
  submit: 'Enviar',
  sending: 'Enviando…',
  success: { title: 'Listo, ya lo recibimos.' },
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
  const wrapper = mount(ContactForm, { props: { content, ...overrides } })
  mounted.push(wrapper)
  return wrapper
}

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

  it('should show no error and no unreachable-state markup on a valid submit', async () => {
    const wrapper = mountForm()

    await wrapper.find('#name').setValue('Ana')
    await wrapper.find('#email').setValue('ana@muush.dev')
    await wrapper.find('#identity').setValue('company')
    await wrapper
      .find('#need')
      .setValue('Necesitamos un rediseño completo del sitio.')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).not.toContain(content.fields.name.errorRequired)
    expect(wrapper.text()).not.toContain(content.sending)
    expect(wrapper.text()).not.toContain(content.success.title)
    expect(wrapper.text()).not.toContain(content.error.title)
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

describe('ContactForm · previewState is Storybook-only', () => {
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
