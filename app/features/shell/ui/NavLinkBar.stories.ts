import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { ResolvedShellItem } from '@/features/shell/data/types'
import NavLinkBar from './NavLinkBar.vue'
import { SHELL_COPY } from './shellFixtures.testing'

/**
 * The desktop header's link bar (feature 43, FR-002, FR-003; pen extract-43
 * § 2). Glass pill, 6 / 6; items 15 / 500 at 10 / 18; active: Blanco 8 %,
 * Blanco text and the 6 × 6 red dot. "Inicio" / "Home" leads (Roberto
 * 2026-11-01); "Preguntas" / "FAQ" closes it (Roberto 2026-11-08, feature
 * 51 OQ-2 = A).
 */
const meta = {
  title: 'Shell/NavLinkBar',
  component: NavLinkBar,
  globals: { backgrounds: { value: 'negro' }, viewport: { value: 'desktop' } },
} satisfies Meta<typeof NavLinkBar>

export default meta
type Story = StoryObj<typeof meta>

/** The items with the one at `index` marked current as `kind`. */
function marked(
  locale: 'es' | 'en',
  index: number,
  kind: 'section' | 'page'
): ResolvedShellItem[] {
  return SHELL_COPY[locale].items.map((item, position) =>
    position === index ? { ...item, current: kind } : item
  )
}

export const NoneActiveEs: Story = { args: { items: SHELL_COPY.es.items } }
export const NoneActiveEn: Story = { args: { items: SHELL_COPY.en.items } }
/* "Inicio" / "Home" at the top of the home page (Roberto 2026-11-01). */
export const HomeTopEs: Story = { args: { items: marked('es', 0, 'page') } }
export const HomeTopEn: Story = { args: { items: marked('en', 0, 'page') } }
export const ServicesInViewEs: Story = {
  args: { items: marked('es', 1, 'section') },
}
export const AboutPageEn: Story = { args: { items: marked('en', 2, 'page') } }
/* Feature 51 · Preguntas lit on its own page. */
export const FaqPageEs: Story = { args: { items: marked('es', 3, 'page') } }
export const FaqPageEn: Story = { args: { items: marked('en', 3, 'page') } }
