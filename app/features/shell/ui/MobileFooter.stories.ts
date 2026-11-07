import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MobileFooter from './MobileFooter.vue'
import { SHELL_COPY, SOCIALS } from './shellFixtures.testing'

/**
 * The mobile footer (feature 43, FR-033; pen extract-43 § 6, `kJfw5`) at
 * "Móvil (390)": brand, contact rows, the links line, 44 × 44 social
 * buttons, legal. Since feature 50 every text link (the line and the two
 * legal ones) also has a 44 × 44 tap area; outline them with the browser's
 * inspector to check none overlaps.
 */
const meta = {
  title: 'Shell/MobileFooter',
  component: MobileFooter,
  globals: { backgrounds: { value: 'negro' }, viewport: { value: 'mobile' } },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MobileFooter>

export default meta
type Story = StoryObj<typeof meta>

function args(locale: 'es' | 'en') {
  const copy = SHELL_COPY[locale]
  return {
    contactChannels: copy.contactChannels,
    links: copy.mobileLinks,
    socials: SOCIALS,
    legal: copy.legal,
    home: copy.home,
    homeLabel: copy.homeLabel,
    tagline: copy.tagline,
    category: copy.category,
    copyright: copy.copyright,
  }
}

export const EsMobile390: Story = { args: args('es') }
export const EnMobile390: Story = { args: args('en') }
