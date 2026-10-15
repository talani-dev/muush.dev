import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { ApplicationFormContent } from '@/features/forms/data/applicationFields'
import type { ApplicationSubmitter } from '@/features/forms/data/submissionContract'
import { buildCountryOptions } from '@/features/forms/logic/countryOptions'
import ApplicationForm from './ApplicationForm.vue'

/**
 * Every state is reachable on the shipped page since feature 029. The
 * catalogue pins `Uploading`, `Sending`, `Success`, `ServerError` and
 * `CvUploadError*` through the Storybook-only `previewState` display
 * override, because a story cannot drive a real network flow. No page or
 * section passes that prop.
 *
 * Every story gets a stub `submitter`; nothing here reaches the network or
 * S3. The `CvUploadError*` visuals are UNVERIFIED against the `.pen`
 * (feature 031 spec OA-5).
 */
const meta = {
  title: 'Forms/ApplicationForm',
  component: ApplicationForm,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ApplicationForm>

export default meta
type Story = StoryObj<typeof meta>

/** Long enough to see the sending state, short enough not to bore. */
const STUB_REPLY_MS = 1_200

const attaching: ApplicationSubmitter = {
  engage: () => undefined,
  submit: () =>
    new Promise(resolve =>
      setTimeout(() => resolve({ kind: 'success' }), STUB_REPLY_MS)
    ),
}

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
  args: { content: spanish, submitter: attaching },
}

/**
 * `Validación fallida` is a **real** reachable state — not a `previewState`
 * branch. Same mechanism `ContactForm.stories.ts`'s own `ValidationFailed`
 * story uses: a real submit, triggered once on mount.
 */
export const ValidationFailed: Story = {
  args: { content: spanish, submitter: attaching },
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
  args: { content: spanish, submitter: attaching },
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

export const Uploading: Story = {
  args: { content: spanish, submitter: attaching, previewState: 'uploading' },
}

export const Sending: Story = {
  args: { content: spanish, submitter: attaching, previewState: 'sending' },
}

export const Success: Story = {
  args: { content: spanish, submitter: attaching, previewState: 'success' },
}

export const ServerError: Story = {
  args: {
    content: spanish,
    submitter: attaching,
    previewState: 'server-error',
  },
}

/** Only the copy this story set needs in English; field labels stay ES. */
const english: ApplicationFormContent = {
  ...spanish,
  submit: 'Submit',
  sending: 'Sending…',
  uploading: 'Uploading CV…',
  cvUploadError: {
    message: "We couldn't upload your CV. Try again or submit without a CV.",
    retry: 'Retry upload',
    submitWithoutCv: 'Submit without CV',
  },
  success: {
    title:
      "Thanks, we've got your profile. We'll reach out when there's a project that fits.",
  },
}

export const CvUploadError: Story = {
  args: {
    content: spanish,
    submitter: attaching,
    previewState: 'cv-upload-error',
  },
}

export const CvUploadErrorEnglish: Story = {
  args: {
    content: english,
    submitter: attaching,
    previewState: 'cv-upload-error',
  },
}

/**
 * Feature 32 Amendment A1: a stub port that reports Colombia, as the site's
 * edge would for a visitor there (`GET /__geo`). The form switches to
 * WhatsApp on mount, the way a visitor would, and the selector moves from
 * Mexico to Colombia. The other stories omit `lookupCountry` on purpose:
 * that is Storybook without the edge, so Mexico and no request.
 */
export const ReportedCountryColombia: Story = {
  args: {
    content: spanish,
    submitter: { ...attaching, lookupCountry: async () => 'CO' },
  },
  render: args => ({
    components: { ApplicationForm },
    setup: () => ({ args }),
    mounted() {
      ;(
        (this.$el as HTMLElement).querySelector(
          'input[name="contactPreference"][value="whatsapp"]'
        ) as HTMLInputElement | null
      )?.click()
    },
    template: '<ApplicationForm v-bind="args" />',
  }),
}
