import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SiteFooter from './SiteFooter.vue'
import { SHELL_COPY, SOCIALS } from './shellFixtures.testing'

/**
 * The Muush 1.0 footer (feature 43, FR-030…FR-035; pen extract-43 § 6).
 * "Escritorio (1440)": `K3vvqL`, brand and four columns over the copyright
 * and legal row. "Móvil (390)": `kJfw5`, brand, contact rows, the links
 * line, social buttons, legal.
 */
const meta = {
  title: 'Shell/SiteFooter',
  component: SiteFooter,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SiteFooter>

export default meta
type Story = StoryObj<typeof meta>

function args(locale: 'es' | 'en') {
  const copy = SHELL_COPY[locale]
  return {
    columns: copy.columns,
    contactChannels: copy.contactChannels,
    mobileLinks: copy.mobileLinks,
    socials: SOCIALS,
    legal: copy.legal,
    home: copy.home,
    homeLabel: copy.homeLabel,
    tagline: copy.tagline,
    category: copy.category,
    copyright: copy.copyright,
    label: copy.footerLabel,
  }
}

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

export const EsDesktop1440: Story = { args: args('es'), globals: desktop }
export const EnDesktop1440: Story = { args: args('en'), globals: desktop }
export const EsMobile390: Story = { args: args('es'), globals: mobile }
export const EnMobile390: Story = { args: args('en'), globals: mobile }
