import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { LEGAL_PAGES } from '@/features/legal/data/legalFixtures.testing'
import LegalIndex from './LegalIndex.vue'

/**
 * "En esta página", the desktop index (feature 48, `O8Fnc`): 220 wide,
 * gap 14; the current entry with the red dot in Blanco. Desktop only: below
 * `lg` the page shows `LegalIndexDisclosure` instead.
 */
const meta = {
  title: 'Legal/LegalIndex',
  component: LegalIndex,
  globals: { backgrounds: { value: 'negro' }, viewport: { value: 'desktop' } },
  parameters: { layout: 'padded' },
  decorators: [
    () => ({ template: '<div class="w-legal-indice"><story /></div>' }),
  ],
} satisfies Meta<typeof LegalIndex>

export default meta
type Story = StoryObj<typeof meta>

const args = (
  page: 'privacy' | 'terms',
  locale: 'es' | 'en',
  activeId: string
) => ({
  label: LEGAL_PAGES[page][locale].onThisPage,
  sections: LEGAL_PAGES[page][locale].sections,
  activeId,
})

export const PrivacyEsDesktop1440: Story = {
  args: args('privacy', 'es', 'controller'),
}
export const PrivacyEnDesktop1440: Story = {
  args: args('privacy', 'en', 'rights'),
}
export const TermsEsDesktop1440: Story = {
  args: args('terms', 'es', 'contact'),
}
export const TermsEnDesktop1440: Story = {
  args: args('terms', 'en', 'whoWeAre'),
}
