import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FooterColumns from './FooterColumns.vue'
import { SHELL_COPY } from './shellFixtures.testing'

/**
 * The desktop footer's four columns (feature 43, FR-030, FR-031; pen
 * extract-43 § 6): headings 11 / 600 uppercase Gris 400, entries 15 / 400
 * Blanco 85 %, gap 72 at 1440.
 */
const meta = {
  title: 'Shell/FooterColumns',
  component: FooterColumns,
  globals: { backgrounds: { value: 'negro' }, viewport: { value: 'desktop' } },
} satisfies Meta<typeof FooterColumns>

export default meta
type Story = StoryObj<typeof meta>

export const EsDesktop1440: Story = { args: { columns: SHELL_COPY.es.columns } }
export const EnDesktop1440: Story = { args: { columns: SHELL_COPY.en.columns } }
