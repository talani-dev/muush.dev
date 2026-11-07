import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { ContactFormValues } from '@/features/forms/data/contactFields'
import ContactForm from './ContactForm.vue'
import {
  CONTACT_FORM_COPY,
  type FixtureLocale,
  STORY_CONTACT_SUBMITTER,
} from './formsFixtures.testing'

/**
 * The v2 diagnóstico form (feature 45; pen extract-45 §§ 2–4, frames
 * `uUEnn` / `Vh9NI` desktop, `Bw4IB` / `qUy14` mobile). At "Móvil (390)"
 * it is two steps; at "Escritorio (1440)" one view. On the idle stories
 * everything works against a stub submitter: tick the box, fill the form
 * and send (after the 3 s minimum fill time) to see "Enviando…" and
 * "Enviado". The other states are pinned with the Storybook-only
 * `previewState` / `previewStep`; no page passes them.
 */
const meta = {
  title: 'Forms/ContactForm',
  component: ContactForm,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ContactForm>

export default meta
type Story = StoryObj<typeof meta>

const VIEWPORTS = {
  mobile: { viewport: { value: 'mobile' } },
  desktop: { viewport: { value: 'desktop' } },
}

const FILLED: Record<FixtureLocale, Partial<ContactFormValues>> = {
  es: {
    name: 'María Fernanda Ruiz',
    email: 'mf.ruiz@ejemplo.mx',
    company: 'Inmobiliaria Altavista',
    identity: 'realEstate',
    website: 'casaolivo.mx',
    need: 'Queremos rehacer el sitio de la desarrolladora.',
  },
  en: {
    name: 'Mary Ruiz',
    email: 'mary@example.com',
    company: 'Altavista Realty',
    identity: 'realEstate',
    website: 'casaolivo.mx',
    need: 'We want to rebuild our developer website.',
  },
}

/** Faltan datos: an empty name and a malformed email (pen extract § 3). */
const MISSING: Partial<ContactFormValues> = { email: 'mf.ruiz@' }

function story(
  locale: FixtureLocale,
  viewport: keyof typeof VIEWPORTS,
  extra: Partial<Story['args']> = {}
): Story {
  return {
    args: {
      content: CONTACT_FORM_COPY[locale],
      submitter: STORY_CONTACT_SUBMITTER,
      ...extra,
    },
    globals: VIEWPORTS[viewport],
  }
}

export const EsMobile390: Story = story('es', 'mobile')
export const EnMobile390: Story = story('en', 'mobile')
export const EsDesktop1440: Story = story('es', 'desktop')
export const EnDesktop1440: Story = story('en', 'desktop')

/** Step 2 "Tu negocio", with step 1 already filled. */
export const EsStep2Mobile390: Story = story('es', 'mobile', {
  previewStep: 2,
  initial: { name: FILLED.es.name, email: FILLED.es.email },
})
export const EnStep2Mobile390: Story = story('en', 'mobile', {
  previewStep: 2,
  initial: { name: FILLED.en.name, email: FILLED.en.email },
})

export const EsMissingDataMobile390: Story = story('es', 'mobile', {
  previewState: 'invalid',
  initial: MISSING,
})
export const EnMissingDataDesktop1440: Story = story('en', 'desktop', {
  previewState: 'invalid',
  initial: MISSING,
})
export const EsMissingDataDesktop1440: Story = story('es', 'desktop', {
  previewState: 'invalid',
  initial: MISSING,
})

export const EsSendingDesktop1440: Story = story('es', 'desktop', {
  previewState: 'sending',
  initial: FILLED.es,
})
export const EnSendingMobile390: Story = story('en', 'mobile', {
  previewState: 'sending',
  previewStep: 2,
  initial: FILLED.en,
})

export const EsSendErrorDesktop1440: Story = story('es', 'desktop', {
  previewState: 'server-error',
  initial: FILLED.es,
})
export const EnSendErrorDesktop1440: Story = story('en', 'desktop', {
  previewState: 'server-error',
  initial: FILLED.en,
})
export const EsSendErrorMobile390: Story = story('es', 'mobile', {
  previewState: 'server-error',
  previewStep: 2,
  initial: FILLED.es,
})

export const EsSentDesktop1440: Story = story('es', 'desktop', {
  previewState: 'success',
})
export const EnSentDesktop1440: Story = story('en', 'desktop', {
  previewState: 'success',
})
export const EsSentMobile390: Story = story('es', 'mobile', {
  previewState: 'success',
})
export const EnSentMobile390: Story = story('en', 'mobile', {
  previewState: 'success',
})

/** WhatsApp chosen: the dial code and number row appears (FR-019). */
export const EsWhatsappDesktop1440: Story = story('es', 'desktop', {
  initial: {
    ...FILLED.es,
    contactPreference: 'whatsapp',
    whatsapp: '55 4433 2211',
  },
})
export const EnWhatsappMobile390: Story = story('en', 'mobile', {
  initial: { contactPreference: 'whatsapp' },
})
