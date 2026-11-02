import type { Meta, StoryObj } from '@storybook/vue3-vite'
import LanguageToggle from './LanguageToggle.vue'

/**
 * The language toggle in Muush 1.0 (feature 43, FR-004, FR-007; pen
 * extract-43 §§ 2–4). It shows the **current** locale's code. `header`:
 * 36 × 36 radius 12 at "Móvil (390)", the 40 × 40 glass pill at "Escritorio
 * (1440)". `menu`: 36 × 36 at every width. Behaviour is feature 21/33/39's,
 * unchanged.
 *
 * The component calls no Nuxt composable, which is why it renders here with
 * no router and no i18n instance (`docs/business/rules.md` § R23).
 */
const meta = {
  title: 'Shell/LanguageToggle',
  component: LanguageToggle,
  globals: { backgrounds: { value: 'negro' } },
} satisfies Meta<typeof LanguageToggle>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

const es = {
  locale: 'es',
  href: '/en/about',
  switchLabel: 'Cambiar a inglés',
} as const
const en = {
  locale: 'en',
  href: '/es/nosotros',
  switchLabel: 'Switch to Spanish',
} as const

export const HeaderEsDesktop1440: Story = { args: es, globals: desktop }
export const HeaderEnDesktop1440: Story = { args: en, globals: desktop }
export const HeaderEsMobile390: Story = { args: es, globals: mobile }
export const HeaderEnMobile390: Story = { args: en, globals: mobile }
export const MenuEsMobile390: Story = {
  args: { ...es, variant: 'menu' },
  globals: mobile,
}
export const MenuEnMobile390: Story = {
  args: { ...en, variant: 'menu' },
  globals: mobile,
}

/**
 * Feature 39 · the not-found page. Same control, same href (the other
 * locale's home, for no scripting and new tabs); a plain click emits
 * `switchInPlace` instead of navigating.
 */
export const InPlaceOnNotFound: Story = {
  args: {
    locale: 'en',
    href: '/es',
    switchLabel: 'Switch to Spanish',
    inPlace: true,
  },
}
