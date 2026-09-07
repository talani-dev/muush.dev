import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SocialIcon, { type SocialNetwork } from '@/shared/ui/SocialIcon.vue'

/**
 * The 48×48 dark-glass squares of the mobile menu, from
 * docs/business/landing/design-extract.md § 8. In the design file the glyphs
 * are the placeholder letters L/I/T; the real art is the normalized SVG set
 * feature 1 delivered.
 *
 * The Instagram and TikTok URLs below are the real ones from § 9.bis. The
 * LinkedIn URL shape is still unconfirmed — `branding.md` records the handle
 * `/muush-dev` but not whether it is a company page or a personal profile,
 * so `/company/` is assumed (docs/business/rules.md § R13, pending Clau).
 *
 * Flip the background to `bone` here: the glyph inherits its colour from the
 * container, so it follows whatever the container sets rather than being
 * locked to the vendor's pure white.
 */
const meta = {
  title: 'Shared/UI/SocialIcon',
  component: SocialIcon,
} satisfies Meta<typeof SocialIcon>

export default meta
type Story = StoryObj<typeof meta>

interface Profile {
  network: SocialNetwork
  href: string
  label: string
}

const linkedin: Profile = {
  network: 'linkedin',
  href: 'https://linkedin.com/company/muush-dev',
  label: 'LinkedIn',
}

const instagram: Profile = {
  network: 'instagram',
  href: 'https://instagram.com/muush.dev',
  label: 'Instagram',
}

const tiktok: Profile = {
  network: 'tiktok',
  href: 'https://tiktok.com/@muush.dev',
  label: 'TikTok',
}

const profiles: Profile[] = [linkedin, instagram, tiktok]

export const LinkedIn: Story = { args: linkedin }
export const Instagram: Story = { args: instagram }
export const TikTok: Story = { args: tiktok }

/** The row the mobile menu renders. The row's own gap belongs to that
 * feature, not to this primitive — `gap-4` here is story scaffolding. */
export const AllNetworks: Story = {
  args: linkedin,
  render: () => ({
    components: { SocialIcon },
    setup: () => ({ profiles }),
    template: `
      <div class="flex items-center gap-4">
        <SocialIcon
          v-for="profile in profiles"
          :key="profile.network"
          v-bind="profile"
        />
      </div>
    `,
  }),
}
