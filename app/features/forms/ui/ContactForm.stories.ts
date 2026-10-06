import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import type { ContactFormContent } from '@/features/forms/data/contactFields'
import type { ContactSubmitter } from '@/features/forms/data/submissionContract'
import ContactForm from './ContactForm.vue'

/**
 * Every state is reachable on the shipped page since feature 029. The
 * catalogue still pins `Sending`, `Success*` and `ServerError` through the
 * Storybook-only `previewState` display override, because a story cannot
 * drive a real network flow. No page or section passes that prop.
 *
 * Every story gets a stub `submitter`: nothing here reaches the network. On
 * `Idle`, a real valid submit (after the 3 s minimum fill time) shows
 * "Enviando…" for a moment and then the confirmation.
 */
const meta = {
  title: 'Forms/ContactForm',
  component: ContactForm,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ContactForm>

export default meta
type Story = StoryObj<typeof meta>

/** Long enough to see the sending state, short enough not to bore. */
const STUB_REPLY_MS = 1_200

const stubSubmitter: ContactSubmitter = {
  engage: () => undefined,
  submit: () =>
    new Promise(resolve =>
      setTimeout(
        () => resolve({ kind: 'success', cvAttached: true }),
        STUB_REPLY_MS
      )
    ),
}

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
    titleByChannel: {
      email:
        'Listo, ya lo recibimos. Te respondemos por correo en menos de 24 horas hábiles.',
      whatsapp:
        'Listo, ya lo recibimos. Te respondemos por WhatsApp en menos de 24 horas hábiles.',
    },
  },
  error: {
    title:
      'No pudimos enviarlo. Escríbenos a support@muush.dev o por WhatsApp y lo resolvemos.',
    fallback: 'support@muush.dev',
  },
}

export const Idle: Story = {
  args: { content: spanish, submitter: stubSubmitter },
}

/**
 * `Validación fallida` is a **real** reachable state (FR-013) — not a
 * `previewState` branch. This story shows it by triggering a real submit on
 * mount (`HTMLFormElement.requestSubmit()`, no new dependency, no
 * interactions addon): the same click a visitor makes, run once so the
 * catalogue can show the result at rest.
 */
export const ValidationFailed: Story = {
  args: { content: spanish, submitter: stubSubmitter },
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
  args: { content: spanish, submitter: stubSubmitter, previewState: 'sending' },
}

/** The confirmation names the channel picked (spec OA-4); this one is the
 * default, Correo. */
export const Success: Story = {
  args: { content: spanish, submitter: stubSubmitter, previewState: 'success' },
}

/** Same confirmation when the visitor picked WhatsApp: the form switches to
 * WhatsApp on mount, the way a visitor would, before the override shows the
 * outcome. */
export const SuccessByWhatsapp: Story = {
  args: { content: spanish, submitter: stubSubmitter },
  render: args => ({
    components: { ContactForm },
    setup: () => ({ args, previewState: ref<'success' | undefined>() }),
    mounted() {
      ;(
        (this.$el as HTMLElement).querySelector(
          'input[name="contactPreference"][value="whatsapp"]'
        ) as HTMLInputElement | null
      )?.click()
      this.previewState = 'success'
    },
    template: '<ContactForm v-bind="args" :preview-state="previewState" />',
  }),
}

export const ServerError: Story = {
  args: {
    content: spanish,
    submitter: stubSubmitter,
    previewState: 'server-error',
  },
}
