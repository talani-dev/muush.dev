import type { Meta, StoryObj } from '@storybook/vue3-vite'
import StatusSection from './StatusSection.vue'
import { STATUS_COPY } from './shellFixtures.testing'

/**
 * The status-page block (feature 46; pen extract-46 §§ 3–4): Preguntas
 * (`FXvwz` / `pDsNQ`) and the 404 (`X9EQIz` / `Y2fsOQ`) over the acanalado,
 * with the `.pen` mobile uniforms (18 ribs) below 1024. No pill, no body.
 * Every prop is a fixture: the component calls no Nuxt composable.
 */
const meta = {
  title: 'Shell/StatusSection',
  component: StatusSection,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof StatusSection>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

export const FaqEsMobile390: Story = {
  args: STATUS_COPY.faq.es,
  globals: mobile,
}
export const FaqEnMobile390: Story = {
  args: STATUS_COPY.faq.en,
  globals: mobile,
}
export const FaqEsDesktop1440: Story = {
  args: STATUS_COPY.faq.es,
  globals: desktop,
}
export const FaqEnDesktop1440: Story = {
  args: STATUS_COPY.faq.en,
  globals: desktop,
}
export const NotFoundEsMobile390: Story = {
  args: STATUS_COPY.notFound.es,
  globals: mobile,
}
export const NotFoundEnMobile390: Story = {
  args: STATUS_COPY.notFound.en,
  globals: mobile,
}
export const NotFoundEsDesktop1440: Story = {
  args: STATUS_COPY.notFound.es,
  globals: desktop,
}
export const NotFoundEnDesktop1440: Story = {
  args: STATUS_COPY.notFound.en,
  globals: desktop,
}
