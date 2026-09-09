import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { ContactFormContent } from '@/features/forms/data/contactFields'
import ContactForm from './ContactForm.vue'

/**
 * The three unreachable states — `Sending`, `Success`, `ServerError` — live
 * here as **story fixtures only**, driven by the `previewState` prop
 * `ContactForm.vue` documents as Storybook-only (plan.md D-2, spec FR-015).
 * No interaction on this page can reach them; the shipped page never sets
 * the prop.
 */
const meta = {
  title: 'Forms/ContactForm',
  component: ContactForm,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ContactForm>

export default meta
type Story = StoryObj<typeof meta>

const spanish: ContactFormContent = {
  fields: {
    name: { label: 'Nombre', errorRequired: 'Escribe tu nombre' },
    email: {
      label: 'Correo',
      errorRequired: 'Escribe tu correo',
      errorFormat: 'Formato de correo inválido',
    },
    company: { label: 'Empresa o proyecto' },
    identity: {
      label: '¿Cómo te identificas?',
      errorRequired: 'Elige una opción',
      options: {
        realEstate: 'Bienes raíces/inmobiliaria',
        creator: 'Creador de contenido/marca personal',
        company: 'Empresa pública o privada',
        independent: 'Emprendedor o persona física',
        startup: 'Startup',
        other: 'Otro',
      },
    },
    need: {
      label: '¿Qué necesitas?',
      errorRequired: 'Cuéntanos qué necesitas',
      errorLength: 'Cuéntanos un poco más',
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
      'Listo, ya lo recibimos. Te respondemos por correo en menos de 24 horas hábiles.',
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
 * `Validación fallida` is a **real** reachable state (FR-013) — not a
 * `previewState` branch. This story shows it by triggering a real submit on
 * mount (`HTMLFormElement.requestSubmit()`, no new dependency, no
 * interactions addon): the same click a visitor makes, run once so the
 * catalogue can show the result at rest.
 */
export const ValidationFailed: Story = {
  args: { content: spanish },
  render: args => ({
    components: { ContactForm },
    setup: () => ({ args }),
    mounted() {
      ;(this.$el as HTMLElement).querySelector('form')?.requestSubmit()
    },
    template: '<ContactForm v-bind="args" />',
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
