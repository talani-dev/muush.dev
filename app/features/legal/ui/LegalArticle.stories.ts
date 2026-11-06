import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { LEGAL_PAGES } from '@/features/legal/data/legalFixtures.testing'
import LegalArticle from './LegalArticle.vue'

/**
 * The legal page body (feature 48; pen-extract-48 § 3): Aviso de privacidad
 * (`rhgZ2` / `XaxDq`, EN `XlC2V` / `n76gJ3`) and Términos y condiciones
 * (`dKb9C` / `VvK17`, EN `K1aJhO` / `T6ayk`). "Móvil (390)": the 24 gutters,
 * the collapsed "En esta página" and the data table as cards.
 * "Escritorio (1440)": the 220 index at x 80 and the 680 article at x 380.
 * The final legal text, from the locale files; no shell (the layout's).
 */
const meta = {
  title: 'Legal/LegalArticle',
  component: LegalArticle,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof LegalArticle>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

const privacy = (locale: 'es' | 'en') => ({
  content: LEGAL_PAGES.privacy[locale],
  activeId: 'controller',
})
const terms = (locale: 'es' | 'en') => ({
  content: LEGAL_PAGES.terms[locale],
  activeId: 'whoWeAre',
})

export const PrivacyEsMobile390: Story = {
  args: privacy('es'),
  globals: mobile,
}
export const PrivacyEnMobile390: Story = {
  args: privacy('en'),
  globals: mobile,
}
export const PrivacyEsDesktop1440: Story = {
  args: privacy('es'),
  globals: desktop,
}
export const PrivacyEnDesktop1440: Story = {
  args: privacy('en'),
  globals: desktop,
}
export const TermsEsMobile390: Story = { args: terms('es'), globals: mobile }
export const TermsEnMobile390: Story = { args: terms('en'), globals: mobile }
export const TermsEsDesktop1440: Story = {
  args: terms('es'),
  globals: desktop,
}
export const TermsEnDesktop1440: Story = {
  args: terms('en'),
  globals: desktop,
}
