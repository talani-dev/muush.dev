import type { Meta, StoryObj } from '@storybook/vue3-vite'
import LinkArrow from '@/shared/ui/LinkArrow.vue'

/**
 * The secondary CTA of docs/business/landing/design-extract.md § 7 — four
 * instances across the site, all loose text.
 *
 * What to check: hover it and the arrow shifts and the label underlines. It
 * must never grow a background or a border, at any size, in any state. Tab
 * to it and the focus indicator must be visible.
 */
const meta = {
  title: 'Shared/UI/LinkArrow',
  component: LinkArrow,
  render: args => ({
    components: { LinkArrow },
    setup: () => ({ args }),
    template: '<LinkArrow v-bind="args">Agenda una llamada</LinkArrow>',
  }),
} satisfies Meta<typeof LinkArrow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { href: '#contacto' } }

export const Large: Story = { args: { href: '#contacto', size: 'large' } }

/** The calendar link is off-site, so it opens in a new context. */
export const External: Story = {
  args: { href: 'https://calendar.google.com', external: true },
  render: args => ({
    components: { LinkArrow },
    setup: () => ({ args }),
    template: '<LinkArrow v-bind="args">Book a call</LinkArrow>',
  }),
}

export const BothSizes: Story = {
  args: { href: '#contacto' },
  render: () => ({
    components: { LinkArrow },
    template: `
      <div class="flex flex-col items-start gap-6 font-instrument">
        <figure class="flex flex-col items-start gap-1">
          <LinkArrow href="#contacto">Agenda una llamada</LinkArrow>
          <figcaption class="text-meta text-bone-300">default · hero</figcaption>
        </figure>
        <figure class="flex flex-col items-start gap-1">
          <LinkArrow href="#contacto" size="large">Agenda una llamada</LinkArrow>
          <figcaption class="text-meta text-bone-300">large · CTA final</figcaption>
        </figure>
      </div>
    `,
  }),
}
