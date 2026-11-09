import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SocialIcon from '@/shared/ui/SocialIcon.vue'

/**
 * The four brand glyphs in Muush 1.0 (feature 43, FR-037), in Blanco. The
 * shell places them in 48 × 48 (menu) and 44 × 44 (mobile footer) buttons;
 * here each sits at the 24 px glyph box of its asset.
 */
const meta = {
  title: 'Shared/UI/SocialIcon',
  component: SocialIcon,
  globals: { backgrounds: { value: 'negro' } },
  render: args => ({
    components: { SocialIcon },
    setup: () => ({ args }),
    template: '<SocialIcon v-bind="args" class="size-6 text-blanco" />',
  }),
} satisfies Meta<typeof SocialIcon>

export default meta
type Story = StoryObj<typeof meta>

export const LinkedIn: Story = { args: { network: 'linkedin' } }
export const Instagram: Story = { args: { network: 'instagram' } }
export const TikTok: Story = { args: { network: 'tiktok' } }
export const Facebook: Story = { args: { network: 'facebook' } }
export const TikTokMobile390: Story = {
  args: { network: 'tiktok' },
  globals: { viewport: { value: 'mobile' } },
}
export const LinkedInDesktop1440: Story = {
  args: { network: 'linkedin' },
  globals: { viewport: { value: 'desktop' } },
}
