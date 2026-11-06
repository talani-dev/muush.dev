import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SocialLinks from './SocialLinks.vue'
import { SOCIALS } from './shellFixtures.testing'

/**
 * The three social buttons (feature 43, FR-017, FR-033; pen extract-43
 * §§ 4, 6): `menu` 48 × 48 filled and centred, `footer` 44 × 44 outlined,
 * each with the real brand glyph in Blanco (Roberto, 2026-11-01). The
 * 20 px glyph size is the leader's decision (pen extract-43 § 10).
 */
const meta = {
  title: 'Shell/SocialLinks',
  component: SocialLinks,
  globals: { backgrounds: { value: 'negro' }, viewport: { value: 'mobile' } },
} satisfies Meta<typeof SocialLinks>

export default meta
type Story = StoryObj<typeof meta>

export const Menu390: Story = { args: { socials: SOCIALS, size: 'menu' } }
export const Footer390: Story = { args: { socials: SOCIALS, size: 'footer' } }
