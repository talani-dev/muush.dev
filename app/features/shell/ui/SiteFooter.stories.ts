import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { ResolvedFooterColumn } from '@/features/shell/data/types'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'
import SiteFooter from './SiteFooter.vue'

/**
 * The footer of `design-extract.md` § 9.bis. Switch the viewport control to
 * see the four columns reflow to two rows of two below `lg`.
 *
 * Look at the muush column: `FAQ` and `Blog · próximamente` read as plain
 * ink-300 text with no pointer and no hover, because neither has a destination
 * (`decisions-open.md` #3 is still open, and the blog is specified with no
 * link). They must read as one treatment, not two states.
 *
 * `Agenda una llamada` was in that same grey state until 2026-09-07, when
 * `decisions-open.md` #2 resolved. It is now a real link in the Contacto
 * column, opening in a new tab — and the contrast between it and the two below
 * is what the inert treatment is supposed to look like next to a live one.
 *
 * The desktop Top row is where the design over-constrains itself by 52px:
 * the brand block holds its 340, the columns flex, and `space_between`
 * distributes what is left (`docs/business/rules.md` § R24).
 */
const meta = {
  title: 'Shell/SiteFooter',
  component: SiteFooter,
} satisfies Meta<typeof SiteFooter>

export default meta
type Story = StoryObj<typeof meta>

/** The three network names are proper nouns and read the same in both. */
const socialItems: ResolvedFooterColumn['items'] = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/muush-dev',
    external: true,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/muush.dev',
    external: true,
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@muush.dev',
    external: true,
  },
]

const spanishColumns: ResolvedFooterColumn[] = [
  {
    title: 'Navegación',
    items: [
      { label: 'Propósito', href: '/es#proposito' },
      { label: 'Servicios', href: '/es#servicios' },
      { label: 'Proyectos', href: '/es#proyectos' },
      { label: 'Nosotros', href: '/es/nosotros' },
    ],
  },
  {
    title: 'Contacto',
    items: [
      { label: 'Agenda una llamada', href: CALL_BOOKING_URL, external: true },
      { label: 'support@muush.dev', href: 'mailto:support@muush.dev' },
      {
        label: 'WhatsApp',
        href: 'https://wa.me/525639060739?text=Hola%20muush',
        external: true,
      },
    ],
  },
  {
    title: 'muush',
    items: [
      { label: 'Work with muush', href: '/es/nosotros#work' },
      { label: 'FAQ' },
      { label: 'Blog · próximamente' },
    ],
  },
  {
    title: 'Redes',
    items: socialItems,
  },
]

const englishColumns: ResolvedFooterColumn[] = [
  {
    title: 'Navigation',
    items: [
      { label: 'Purpose', href: '/en#proposito' },
      { label: 'Services', href: '/en#servicios' },
      { label: 'Projects', href: '/en#proyectos' },
      { label: 'About us', href: '/en/about' },
    ],
  },
  {
    title: 'Contact',
    items: [
      { label: 'Book a call', href: CALL_BOOKING_URL, external: true },
      { label: 'support@muush.dev', href: 'mailto:support@muush.dev' },
      {
        label: 'WhatsApp',
        href: 'https://wa.me/525639060739?text=Hi%20muush',
        external: true,
      },
    ],
  },
  {
    title: 'muush',
    items: [
      { label: 'Work with muush', href: '/en/about#work' },
      { label: 'FAQ' },
      { label: 'Blog · coming soon' },
    ],
  },
  {
    title: 'Social',
    items: socialItems,
  },
]

export const Spanish: Story = {
  args: {
    columns: spanishColumns,
    home: '/es',
    tagline: 'Hablamos negocio y código.',
    category: 'Technology solution studio',
    copyright: '© 2026 muush · Todos los derechos reservados',
    location: 'CDMX · MX',
  },
}

export const English: Story = {
  args: {
    columns: englishColumns,
    home: '/en',
    tagline: 'We speak business and code.',
    category: 'Technology solution studio',
    copyright: '© 2026 muush · All rights reserved',
    location: 'CDMX · MX',
  },
}

/** Four columns become two rows of two, and the bottom bar stacks. */
export const Mobile: Story = {
  args: Spanish.args,
  globals: { viewport: { value: 'mobile' } },
}
