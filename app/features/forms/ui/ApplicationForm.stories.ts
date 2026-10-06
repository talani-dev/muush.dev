import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { ApplicationFormContent } from '@/features/forms/data/applicationFields'
import {
  type ApplicationSubmitter,
  MIN_FILL_TIME_MS,
} from '@/features/forms/data/submissionContract'
import ApplicationForm from './ApplicationForm.vue'

/**
 * Every state is reachable on the shipped page since feature 029. The
 * catalogue pins `Sending`, `Success*` and `ServerError` through the
 * Storybook-only `previewState` display override, because a story cannot
 * drive a real network flow. No page or section passes that prop.
 *
 * Every story gets a stub `submitter`; nothing here reaches the network or
 * S3. `SuccessWithCvNote` uses a stub that reports the CV as not attached and
 * submits for real, so the note appears exactly as it does on the page.
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

function stubSubmitter(cvAttached: boolean): ApplicationSubmitter {
  return {
    engage: () => undefined,
    submit: () =>
      new Promise(resolve =>
        setTimeout(
          () => resolve({ kind: 'success', cvAttached }),
          STUB_REPLY_MS
        )
      ),
  }
}

const attaching = stubSubmitter(true)
const losingCv = stubSubmitter(false)

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
    cvNote:
      'Tu perfil llegó, pero no pudimos adjuntar tu CV. Si quieres, mándalo a support@muush.dev.',
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
  success: {
    title:
      "Thanks, we've got your profile. We'll reach out when there's a project that fits.",
    cvNote:
      "Your profile came through, but we couldn't attach your CV. If you'd like, send it to support@muush.dev.",
  },
}

/**
 * Fills the form, attaches a PDF and presses Enviar once the minimum fill
 * time has passed — what a visitor does — against a stub whose upload
 * "fails". The note is real state (`cvNoteVisible`), not a display override,
 * so this story takes about five seconds to settle.
 */
function submitWithCv(root: HTMLElement): void {
  const setValue = (selector: string, value: string, event: string) => {
    const control = root.querySelector(selector) as HTMLInputElement | null
    if (!control) return
    control.value = value
    control.dispatchEvent(new Event(event))
  }
  setValue('#name', 'Ana Ruiz', 'input')
  setValue('#email', 'ana@muush.dev', 'input')
  setValue('#areaRole', 'it:backend', 'change')
  const cv = root.querySelector('#cv') as HTMLInputElement | null
  if (cv) {
    const file = new File(['%PDF-1.4'], 'ana-cv.pdf', {
      type: 'application/pdf',
    })
    Object.defineProperty(cv, 'files', { value: [file] })
    cv.dispatchEvent(new Event('change'))
  }
  setTimeout(
    () => root.querySelector('form')?.requestSubmit(),
    MIN_FILL_TIME_MS
  )
}

function successWithCvNote(content: ApplicationFormContent): Story {
  return {
    args: { content, submitter: losingCv },
    render: args => ({
      components: { ApplicationForm },
      setup: () => ({ args }),
      mounted() {
        submitWithCv(this.$el as HTMLElement)
      },
      template: '<ApplicationForm v-bind="args" />',
    }),
  }
}

export const SuccessWithCvNote: Story = successWithCvNote(spanish)

export const SuccessWithCvNoteEnglish: Story = successWithCvNote(english)
