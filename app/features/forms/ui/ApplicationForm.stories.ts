import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { ApplicationFormContent } from '@/features/forms/data/applicationFields'
import ApplicationForm from './ApplicationForm.vue'

/**
 * The three unreachable states — `Sending`, `Success`, `ServerError` — live
 * here as **story fixtures only**, driven by the `previewState` prop
 * `ApplicationForm.vue` documents as Storybook-only (plan.md D-1). No
 * interaction on the shipped page can reach them.
 */
const meta = {
  title: 'Forms/ApplicationForm',
  component: ApplicationForm,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ApplicationForm>

export default meta
type Story = StoryObj<typeof meta>

const areas = {
  it: 'IT',
  product: 'Product',
  projectManagement: 'Project management',
  sales: 'Sales',
  marketing: 'Marketing',
  creative: 'Creative',
}

const spanish: ApplicationFormContent = {
  fields: {
    name: { label: 'Nombre', errorRequired: 'Escribe tu nombre' },
    email: {
      label: 'Correo',
      errorRequired: 'Escribe tu correo',
      errorFormat: 'Formato de correo inválido',
    },
    areaRole: {
      label: 'Área y rol',
      placeholder: 'Área y rol',
      errorRequired: 'Elige un área y un rol',
      areas,
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
  success: {
    title:
      'Gracias, ya tenemos tu perfil. Te escribimos cuando haya un proyecto donde encajes.',
  },
  error: {
    title:
      'No pudimos enviarlo. Escríbenos a support@muush.dev o por WhatsApp y lo resolvemos.',
    fallback: 'support@muush.dev',
  },
}

export const Idle: Story = {
  args: { content: spanish },
}

/**
 * `Validación fallida` is a **real** reachable state — not a `previewState`
 * branch. Same mechanism `ContactForm.stories.ts`'s own `ValidationFailed`
 * story uses: a real submit, triggered once on mount.
 */
export const ValidationFailed: Story = {
  args: { content: spanish },
  render: args => ({
    components: { ApplicationForm },
    setup: () => ({ args }),
    mounted() {
      ;(this.$el as HTMLElement).querySelector('form')?.requestSubmit()
    },
    template: '<ApplicationForm v-bind="args" />',
  }),
}

/**
 * `ApplicationForm` has no prop for seeding an initial CV — the file lives
 * only in `useApplicationForm`'s own internal state (data-model.md § 6), so
 * this story attaches one the same way a visitor would: selecting a real
 * file on the mounted `<input type="file">` and dispatching its `change`
 * event, once, on mount.
 */
export const CvAttached: Story = {
  args: { content: spanish },
  render: args => ({
    components: { ApplicationForm },
    setup: () => ({ args }),
    mounted() {
      const input = (this.$el as HTMLElement).querySelector(
        '#cv'
      ) as HTMLInputElement | null
      if (!input) return
      const file = new File(['%PDF-1.4'], 'ana-cv.pdf', {
        type: 'application/pdf',
      })
      Object.defineProperty(input, 'files', { value: [file] })
      input.dispatchEvent(new Event('change'))
    },
    template: '<ApplicationForm v-bind="args" />',
  }),
}

export const Sending: Story = {
  args: { content: spanish, previewState: 'sending' },
}

export const Success: Story = {
  args: { content: spanish, previewState: 'success' },
}

export const ServerError: Story = {
  args: { content: spanish, previewState: 'server-error' },
}
