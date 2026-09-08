import type { Meta, StoryObj } from '@storybook/vue3-vite'
import LanguageToggle from './LanguageToggle.vue'

/**
 * The single-circle language toggle of frame `tGVGq` (Banda 1), feature 21.
 * A 44×44 dark-glass circle showing only the active locale's two-letter
 * code — the same control at every viewport it appears in: the desktop nav,
 * the mobile nav and the open mobile menu panel (spec A-03/FR-019).
 *
 * The component calls no Nuxt composable, which is why it renders here with
 * no router and no i18n instance (`docs/business/rules.md` § R23). `href`
 * and `switchLabel` are fixtures, resolved by `logic/` in the real app.
 */
const meta = {
  title: 'Shell/LanguageToggle',
  component: LanguageToggle,
} satisfies Meta<typeof LanguageToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Spanish: Story = {
  args: {
    locale: 'es',
    href: '/en/about',
    switchLabel: 'Cambiar a inglés',
  },
}

export const English: Story = {
  args: {
    locale: 'en',
    href: '/es/nosotros',
    switchLabel: 'Switch to Spanish',
  },
}
