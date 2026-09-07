import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type {
  ResolvedShellItem,
  ResolvedSocial,
} from '@/features/shell/data/types'
import MobileMenu from './MobileMenu.vue'

/**
 * The open menu of `design-extract.md` § 9.bis, at the 390 frame it is drawn
 * for: the full-viewport dark-glass panel, the nav row with the close
 * control, the four destinations, the divider and the three social buttons.
 *
 * Two things it deliberately does **not** contain: a primary button — on
 * mobile the only call to action is the social row (`decisions-open.md`,
 * 2026-09-06) — and the `BG · base` and `Dotted paper` layers the frame
 * stacks beneath it. Those are the page showing through the blur, and
 * repainting them here would double them (spec A-03). In this catalogue the
 * blur therefore has the story background to work with, not a page.
 *
 * The item block, the divider and the social row are laid out in **flow**,
 * not at the frame's y176 / y448 / y493 — a real phone is rarely 844px tall
 * (`docs/business/rules.md` § R12).
 */
const meta = {
  title: 'Shell/MobileMenu',
  component: MobileMenu,
  globals: { viewport: { value: 'mobile' } },
} satisfies Meta<typeof MobileMenu>

export default meta
type Story = StoryObj<typeof meta>

const socials: ResolvedSocial[] = [
  {
    network: 'linkedin',
    href: 'https://www.linkedin.com/company/muush-dev',
    label: 'LinkedIn',
  },
  {
    network: 'instagram',
    href: 'https://www.instagram.com/muush.dev',
    label: 'Instagram',
  },
  {
    network: 'tiktok',
    href: 'https://www.tiktok.com/@muush.dev',
    label: 'TikTok',
  },
]

const spanishItems: ResolvedShellItem[] = [
  { label: 'Propósito', href: '/es#proposito' },
  { label: 'Servicios', href: '/es#servicios' },
  { label: 'Proyectos', href: '/es#proyectos' },
  { label: 'Nosotros', href: '/es/nosotros' },
]

const englishItems: ResolvedShellItem[] = [
  { label: 'Purpose', href: '/en#proposito' },
  { label: 'Services', href: '/en#servicios' },
  { label: 'Projects', href: '/en#proyectos' },
  { label: 'About us', href: '/en/about' },
]

export const Spanish: Story = {
  args: {
    open: true,
    items: spanishItems,
    socials,
    home: '/es',
    locale: 'es',
    localeSwitchHref: '/en',
    label: 'Menú',
    closeLabel: 'Cerrar menú',
  },
}

export const English: Story = {
  args: {
    open: true,
    items: englishItems,
    socials,
    home: '/en',
    locale: 'en',
    localeSwitchHref: '/es',
    label: 'Menu',
    closeLabel: 'Close menu',
  },
}

/** Closed, the component renders nothing at all — no hidden panel left in
 *  the document to catch focus. */
export const Closed: Story = {
  args: { ...Spanish.args, open: false },
}
