import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { CONSENT_COPY } from '@/features/legal/data/legalFixtures.testing'
import CookieBanner from './CookieBanner.vue'

/**
 * "Usamos cookies" (feature 48; `Dq04d` / `SYQea`, EN `TEElj` / `qnVrY`).
 * Fixed to the bottom of the viewport: "Escritorio (1440)" a 1280 row at
 * x 80, top 759 of 900; "Móvil (390)" a 342 card, top ≈ 596 of 844.
 */
const meta = {
  title: 'Legal/CookieBanner',
  component: CookieBanner,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'fullscreen' },
  decorators: [() => ({ template: '<div class="min-h-dvh"><story /></div>' })],
} satisfies Meta<typeof CookieBanner>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

export const EsMobile390: Story = {
  args: { copy: CONSENT_COPY.es },
  globals: mobile,
}
export const EnMobile390: Story = {
  args: { copy: CONSENT_COPY.en },
  globals: mobile,
}
export const EsDesktop1440: Story = {
  args: { copy: CONSENT_COPY.es },
  globals: desktop,
}
export const EnDesktop1440: Story = {
  args: { copy: CONSENT_COPY.en },
  globals: desktop,
}
