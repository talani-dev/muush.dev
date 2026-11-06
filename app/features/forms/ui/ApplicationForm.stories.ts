import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { ApplicationFormValues } from '@/features/forms/data/applicationFields'
import ApplicationForm from './ApplicationForm.vue'
import {
  APPLICATION_FORM_COPY,
  type FixtureLocale,
  STORY_APPLICATION_SUBMITTER,
} from './formsFixtures.testing'

/**
 * The v2 application form (feature 45; pen extract-45 § 5, frames `VtxDP`,
 * states `w9Owd` / `gNda1`, mobile `u1CDBO` / `H3cNSD`). Two steps at
 * "Móvil (390)" ("Tu perfil"), one view at "Escritorio (1440)". The idle
 * stories work against a stub submitter; the other states are pinned with
 * the Storybook-only `previewState` / `previewStep`.
 */
const meta = {
  title: 'Forms/ApplicationForm',
  component: ApplicationForm,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ApplicationForm>

export default meta
type Story = StoryObj<typeof meta>

const VIEWPORTS = {
  mobile: { viewport: { value: 'mobile' } },
  desktop: { viewport: { value: 'desktop' } },
}

/** A CV that never leaves the catalogue. */
const CV = new File(['%PDF-1.4'], 'cv-ana-ruiz.pdf', {
  type: 'application/pdf',
})

const FILLED: Partial<ApplicationFormValues> = {
  name: 'Ana Ruiz',
  email: 'ana@ejemplo.mx',
  portfolio: 'https://anaruiz.design',
  areaRole: 'product:uxUiDesign',
  linkedin: 'https://linkedin.com/in/anaruiz',
  cv: CV,
}

function story(
  locale: FixtureLocale,
  viewport: keyof typeof VIEWPORTS,
  extra: Partial<Story['args']> = {}
): Story {
  return {
    args: {
      content: APPLICATION_FORM_COPY[locale],
      submitter: STORY_APPLICATION_SUBMITTER,
      ...extra,
    },
    globals: VIEWPORTS[viewport],
  }
}

export const EsMobile390: Story = story('es', 'mobile')
export const EnMobile390: Story = story('en', 'mobile')
export const EsDesktop1440: Story = story('es', 'desktop')
export const EnDesktop1440: Story = story('en', 'desktop')

export const EsStep2Mobile390: Story = story('es', 'mobile', {
  previewStep: 2,
  initial: { name: 'Ana Ruiz', email: 'ana@ejemplo.mx' },
})
export const EnStep2Mobile390: Story = story('en', 'mobile', {
  previewStep: 2,
  initial: { name: 'Ana Ruiz', email: 'ana@example.com' },
})

export const EsMissingDataDesktop1440: Story = story('es', 'desktop', {
  previewState: 'invalid',
  initial: { email: 'ana@' },
})
export const EnMissingDataMobile390: Story = story('en', 'mobile', {
  previewState: 'invalid',
  initial: { email: 'ana@' },
})

export const EsUploadingCvDesktop1440: Story = story('es', 'desktop', {
  previewState: 'uploading',
  initial: FILLED,
})
export const EnUploadingCvMobile390: Story = story('en', 'mobile', {
  previewState: 'uploading',
  previewStep: 2,
  initial: FILLED,
})

export const EsCvUploadFailedDesktop1440: Story = story('es', 'desktop', {
  previewState: 'cv-upload-error',
  initial: FILLED,
})
export const EnCvUploadFailedMobile390: Story = story('en', 'mobile', {
  previewState: 'cv-upload-error',
  previewStep: 2,
  initial: FILLED,
})

export const EsSendErrorDesktop1440: Story = story('es', 'desktop', {
  previewState: 'server-error',
  initial: FILLED,
})
export const EnSendErrorDesktop1440: Story = story('en', 'desktop', {
  previewState: 'server-error',
  initial: FILLED,
})

export const EsSentDesktop1440: Story = story('es', 'desktop', {
  previewState: 'success',
})
export const EnSentMobile390: Story = story('en', 'mobile', {
  previewState: 'success',
})
