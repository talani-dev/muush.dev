import type { Meta, StoryObj } from '@storybook/vue3-vite'
import AssessmentSection from './AssessmentSection.vue'
import {
  ASSESSMENT_COPY,
  ASSESSMENT_FORM_COPY,
  type FixtureLocale,
  STORY_ASSESSMENT_SUBMITTER,
} from './landingFixtures.testing'

/**
 * Diagnóstico y contacto (feature 45, US1; pen extract-45 §§ 1, 4; frames
 * `mMSV2` / `ASEvR`) over the listón. Desktop: the left column centred
 * against the 600 panel. Mobile: pill → heading → body → "Lo que recibes" →
 * the two-step form → the call row. The form's states are in
 * `Forms/ContactForm`. The call row follows Roberto's 2026-11-02 change
 * (reopen 1, FR-040): "¿Prefieres hablar?" in Blanco, "Agenda una llamada"
 * underlined, the arrow red.
 */
const meta = {
  title: 'Landing/AssessmentSection',
  component: AssessmentSection,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AssessmentSection>

export default meta
type Story = StoryObj<typeof meta>

const args = (locale: FixtureLocale) => ({
  ...ASSESSMENT_COPY[locale],
  formContent: ASSESSMENT_FORM_COPY[locale],
  formSubmitter: STORY_ASSESSMENT_SUBMITTER,
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
