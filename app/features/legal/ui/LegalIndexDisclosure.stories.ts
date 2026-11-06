import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { LEGAL_PAGES } from '@/features/legal/data/legalFixtures.testing'
import LegalIndexDisclosure from './LegalIndexDisclosure.vue'

/**
 * "En esta página" below `lg` (feature 48, `oZmj8`): the 48 px collapsed
 * bar. Click it to open: the open state is DERIVED (the `.pen` draws it
 * closed only). Choosing a link closes it.
 */
const meta = {
  title: 'Legal/LegalIndexDisclosure',
  component: LegalIndexDisclosure,
  globals: { backgrounds: { value: 'negro' }, viewport: { value: 'mobile' } },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof LegalIndexDisclosure>

export default meta
type Story = StoryObj<typeof meta>

const args = (page: 'privacy' | 'terms', locale: 'es' | 'en') => ({
  label: LEGAL_PAGES[page][locale].onThisPage,
  sections: LEGAL_PAGES[page][locale].sections,
})

export const PrivacyEsMobile390: Story = { args: args('privacy', 'es') }
export const PrivacyEnMobile390: Story = { args: args('privacy', 'en') }
export const TermsEsMobile390: Story = { args: args('terms', 'es') }
export const TermsEnMobile390: Story = { args: args('terms', 'en') }
