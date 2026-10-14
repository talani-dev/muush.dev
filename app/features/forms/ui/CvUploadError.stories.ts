import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CvUploadError from './CvUploadError.vue'

/**
 * The CV upload error the application form shows under the CV field when
 * the chosen CV could not be uploaded (feature 031). Copy mirrors the
 * strings approved on 2026-10-13 (spec OA-2). Visuals are UNVERIFIED
 * against the `.pen` (spec OA-5).
 */
const meta = {
  title: 'Forms/CvUploadError',
  component: CvUploadError,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CvUploadError>

export default meta
type Story = StoryObj<typeof meta>

export const Spanish: Story = {
  args: {
    id: 'cv-upload-error',
    message:
      'No pudimos subir tu CV. Inténtalo de nuevo o envía la postulación sin CV.',
    retryLabel: 'Reintentar subida',
    submitWithoutCvLabel: 'Enviar sin CV',
  },
}

export const English: Story = {
  args: {
    id: 'cv-upload-error',
    message: "We couldn't upload your CV. Try again or submit without a CV.",
    retryLabel: 'Retry upload',
    submitWithoutCvLabel: 'Submit without CV',
  },
}
