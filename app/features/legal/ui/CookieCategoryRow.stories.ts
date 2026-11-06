import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { CONSENT_COPY } from '@/features/legal/data/legalFixtures.testing'
import CookieCategoryRow from './CookieCategoryRow.vue'

/**
 * One cookie category (feature 48, `vR0os` / `sB1jP`): "Necesarias" with
 * the "Siempre activas" pill, "Publicidad" with its switch.
 */
const meta = {
  title: 'Legal/CookieCategoryRow',
  component: CookieCategoryRow,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
  decorators: [
    () => ({ template: '<ul class="max-w-panel-preferencias"><story /></ul>' }),
  ],
} satisfies Meta<typeof CookieCategoryRow>

export default meta
type Story = StoryObj<typeof meta>

const row = (locale: 'es' | 'en', index: 0 | 1) => {
  const category = CONSENT_COPY[locale].categories[index]
  if (!category) throw new Error('no category')
  return { category, alwaysOn: CONSENT_COPY[locale].alwaysOn, checked: false }
}

export const NecessaryEsMobile390: Story = {
  args: row('es', 0),
  globals: { viewport: { value: 'mobile' } },
}
export const AdvertisingEnDesktop1440: Story = {
  args: row('en', 1),
  globals: { viewport: { value: 'desktop' } },
}
