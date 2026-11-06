import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { LEGAL_PAGES } from '@/features/legal/data/legalFixtures.testing'
import type { ResolvedLegalBlock } from '@/features/legal/data/types'
import LegalDataTable from './LegalDataTable.vue'

/**
 * "Qué datos recabamos" (feature 48): stacked cards at "Móvil (390)"
 * (`XaxDq`), the two-column table from `md` (`rhgZ2`).
 */
const meta = {
  title: 'Legal/LegalDataTable',
  component: LegalDataTable,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
  decorators: [
    () => ({ template: '<div class="max-w-legal"><story /></div>' }),
  ],
} satisfies Meta<typeof LegalDataTable>

export default meta
type Story = StoryObj<typeof meta>

function rows(locale: 'es' | 'en') {
  const table = LEGAL_PAGES.privacy[locale].sections
    .flatMap(section => section.blocks)
    .find(
      (block): block is Extract<ResolvedLegalBlock, { kind: 'table' }> =>
        block.kind === 'table'
    )
  return { rows: table?.rows ?? [] }
}

export const EsMobile390: Story = {
  args: rows('es'),
  globals: { viewport: { value: 'mobile' } },
}
export const EnMobile390: Story = {
  args: rows('en'),
  globals: { viewport: { value: 'mobile' } },
}
export const EsDesktop1440: Story = {
  args: rows('es'),
  globals: { viewport: { value: 'desktop' } },
}
export const EnDesktop1440: Story = {
  args: rows('en'),
  globals: { viewport: { value: 'desktop' } },
}
