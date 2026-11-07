import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { CONSENT_COPY } from '@/features/legal/data/legalFixtures.testing'
import CookiePreferences from './CookiePreferences.vue'

/**
 * "Tus preferencias de cookies" (feature 48; `V4sL7G` / `ev0kn`, EN
 * `S4ZU4` / `Q3oIYc`): a 720 dialog centred at "Escritorio (1440)", a sheet
 * 8 from the edges at "Móvil (390)". Opens on load; the switch toggles in
 * place. "AdvertisingOn" shows the DERIVED on state. Feature 49: the
 * "Analítica" row sits between Necesarias and Publicidad, the same row
 * component; "AnalyticsOn" shows it switched on.
 */
const meta = {
  title: 'Legal/CookiePreferences',
  component: CookiePreferences,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CookiePreferences>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

const args = (locale: 'es' | 'en', advertising = false, analytics = false) => ({
  open: true,
  copy: CONSENT_COPY[locale],
  choice: { analytics, advertising },
})

export const EsMobile390: Story = { args: args('es'), globals: mobile }
export const EnMobile390: Story = { args: args('en'), globals: mobile }
export const EsDesktop1440: Story = { args: args('es'), globals: desktop }
export const EnDesktop1440: Story = { args: args('en'), globals: desktop }
export const AdvertisingOnEsDesktop1440: Story = {
  args: args('es', true),
  globals: desktop,
}
export const AnalyticsOnEnMobile390: Story = {
  args: args('en', false, true),
  globals: mobile,
}
