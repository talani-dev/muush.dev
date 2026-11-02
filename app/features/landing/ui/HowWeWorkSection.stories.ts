import type { Meta, StoryObj } from '@storybook/vue3-vite'
import HowWeWorkSection from './HowWeWorkSection.vue'
import { HOW_WE_WORK_COPY } from './landingFixtures.testing'

/**
 * Cómo trabajamos (feature 44, US4; pen extract-44 § 4, frames `KYUSn` /
 * `H5atpX`) over the acanalado. Desktop: unlit at rest, hover or Tab to a
 * step to preview the line up to it (Roberto 2026-11-02). Mobile: the rail
 * fills with the page scroll; with the OS "reduce motion" setting on it is
 * full and every step lit.
 */
const meta = {
  title: 'Landing/HowWeWorkSection',
  component: HowWeWorkSection,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof HowWeWorkSection>

export default meta
type Story = StoryObj<typeof meta>

export const EsMobile390: Story = {
  args: HOW_WE_WORK_COPY.es,
  globals: { viewport: { value: 'mobile' } },
}
export const EnMobile390: Story = {
  args: HOW_WE_WORK_COPY.en,
  globals: { viewport: { value: 'mobile' } },
}
export const EsDesktop1440: Story = {
  args: HOW_WE_WORK_COPY.es,
  globals: { viewport: { value: 'desktop' } },
}
export const EnDesktop1440: Story = {
  args: HOW_WE_WORK_COPY.en,
  globals: { viewport: { value: 'desktop' } },
}
