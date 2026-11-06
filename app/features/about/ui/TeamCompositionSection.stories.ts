import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { TEAM_COMPOSITION_COPY } from './aboutFixtures.testing'
import TeamCompositionSection from './TeamCompositionSection.vue'

/**
 * "Cómo se arma" (feature 46, US1; pen extract-46 §§ 1.2, 2; frames `Wy3iH`
 * / `jRvnu`): centred with three cards in a row from `lg`, start-aligned
 * with the cards stacked below.
 */
const meta = {
  title: 'About/TeamCompositionSection',
  component: TeamCompositionSection,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TeamCompositionSection>

export default meta
type Story = StoryObj<typeof meta>

export const EsMobile390: Story = {
  args: TEAM_COMPOSITION_COPY.es,
  globals: { viewport: { value: 'mobile' } },
}
export const EnMobile390: Story = {
  args: TEAM_COMPOSITION_COPY.en,
  globals: { viewport: { value: 'mobile' } },
}
export const EsDesktop1440: Story = {
  args: TEAM_COMPOSITION_COPY.es,
  globals: { viewport: { value: 'desktop' } },
}
export const EnDesktop1440: Story = {
  args: TEAM_COMPOSITION_COPY.en,
  globals: { viewport: { value: 'desktop' } },
}
