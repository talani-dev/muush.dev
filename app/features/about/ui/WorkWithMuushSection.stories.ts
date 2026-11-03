import type { Meta, StoryObj } from '@storybook/vue3-vite'
import {
  APPLICATION_FORM_COPY,
  type FixtureLocale,
  STORY_APPLICATION_SUBMITTER,
  WORK_COPY,
} from './aboutFixtures.testing'
import WorkWithMuushSection from './WorkWithMuushSection.vue'

/**
 * "Trabaja con muush" (feature 46, US2; pen extract-46 §§ 1.4, 2; frames
 * `O1FdO9` / `fhqDx`) over the listón. Desktop: the left column centred
 * against the 600 application panel. Mobile: pill → heading → body →
 * "Áreas que sumamos" → the two-step form. The form's states are in
 * `Forms/ApplicationForm`. Every prop is a fixture.
 */
const meta = {
  title: 'About/WorkWithMuushSection',
  component: WorkWithMuushSection,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof WorkWithMuushSection>

export default meta
type Story = StoryObj<typeof meta>

const args = (locale: FixtureLocale) => ({
  ...WORK_COPY[locale],
  formContent: APPLICATION_FORM_COPY[locale],
  formSubmitter: STORY_APPLICATION_SUBMITTER,
})

export const EsMobile390: Story = {
  args: args('es'),
  globals: { viewport: { value: 'mobile' } },
}
export const EnMobile390: Story = {
  args: args('en'),
  globals: { viewport: { value: 'mobile' } },
}
export const EsDesktop1440: Story = {
  args: args('es'),
  globals: { viewport: { value: 'desktop' } },
}
export const EnDesktop1440: Story = {
  args: args('en'),
  globals: { viewport: { value: 'desktop' } },
}
