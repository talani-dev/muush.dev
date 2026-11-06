import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { LEGAL_PAGES } from '@/features/legal/data/legalFixtures.testing'
import LegalSection from './LegalSection.vue'

/**
 * One legal section (feature 48): the Carbón 700 rule, title and blocks.
 * "Tus derechos ARCO" shows the numbered list, "Para qué los usamos" the
 * bullets, "Cookies y píxeles" the "Cambiar mis preferencias" pill.
 */
const meta = {
  title: 'Legal/LegalSection',
  component: LegalSection,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
  decorators: [
    () => ({ template: '<div class="max-w-legal"><story /></div>' }),
  ],
} satisfies Meta<typeof LegalSection>

export default meta
type Story = StoryObj<typeof meta>

function section(locale: 'es' | 'en', id: string) {
  const found = LEGAL_PAGES.privacy[locale].sections.find(
    candidate => candidate.id === id
  )
  if (!found) throw new Error(`no section ${id}`)
  return { section: found }
}

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

export const RightsEsMobile390: Story = {
  args: section('es', 'rights'),
  globals: mobile,
}
export const RightsEnDesktop1440: Story = {
  args: section('en', 'rights'),
  globals: desktop,
}
export const PurposesEsDesktop1440: Story = {
  args: section('es', 'purposes'),
  globals: desktop,
}
export const PurposesEnMobile390: Story = {
  args: section('en', 'purposes'),
  globals: mobile,
}
export const CookiesEsMobile390: Story = {
  args: section('es', 'cookies'),
  globals: mobile,
}
export const CookiesEnDesktop1440: Story = {
  args: section('en', 'cookies'),
  globals: desktop,
}
