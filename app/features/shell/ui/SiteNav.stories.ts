import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type {
  ResolvedShellItem,
  ResolvedSocial,
} from '@/features/shell/data/types'
import SiteNav from './SiteNav.vue'

/**
 * The nav of `design-extract.md` § 9.bis. Switch the viewport control between
 * *Móvil (390)* and *Escritorio (1440)* to see the two arrangements: links
 * plus the primary button above `lg`, lockup, toggle and hamburger below it.
 *
 * There is deliberately **no CTA button** in the mobile arrangement — on
 * mobile the only call to action is the social row inside the open menu
 * (`decisions-open.md`, 2026-09-06).
 *
 * Every prop below is a **fixture**. The component calls no Nuxt composable
 * at all, which is exactly why it renders here with no router, no i18n
 * instance and no Nuxt runtime (spec FR-008). A component that cheated would
 * fail to render on this page rather than in production.
 *
 * `showCta` is the state feature 009 added (`ui-map.md` § 2): on the landing
 * the button is hidden while the Hero is on screen, because the Hero already
 * offers it. Compare *Spanish* with *Call to action hidden* — the nav itself
 * is byte-identical between them, which is the requirement. Only the button's
 * `opacity` and `visibility` differ.
 */
const meta = {
  title: 'Shell/SiteNav',
  component: SiteNav,
} satisfies Meta<typeof SiteNav>

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
  { label: 'Servicios', href: '/es#servicios' },
  { label: 'Nosotros', href: '/es/nosotros' },
]

const spanishMenuItems: ResolvedShellItem[] = [
  { label: 'Propósito', href: '/es#proposito' },
  { label: 'Servicios', href: '/es#servicios' },
  { label: 'Proyectos', href: '/es#proyectos' },
  { label: 'Nosotros', href: '/es/nosotros' },
]

const englishItems: ResolvedShellItem[] = [
  { label: 'Services', href: '/en#servicios' },
  { label: 'About us', href: '/en/about' },
]

const englishMenuItems: ResolvedShellItem[] = [
  { label: 'Purpose', href: '/en#proposito' },
  { label: 'Services', href: '/en#servicios' },
  { label: 'Projects', href: '/en#proyectos' },
  { label: 'About us', href: '/en/about' },
]

export const Spanish: Story = {
  args: {
    items: spanishItems,
    cta: { label: 'Cuéntanos tu proyecto', href: '/es#contacto' },
    showCta: true,
    home: '/es',
    locale: 'es',
    localeSwitchHref: '/en',
    localeSwitchLabel: 'Cambiar a inglés',
    menuItems: spanishMenuItems,
    socials,
    navLabel: 'Navegación principal',
    menuLabel: 'Menú',
    menuOpenLabel: 'Abrir menú',
    menuCloseLabel: 'Cerrar menú',
  },
}

/** The English CTA is five characters longer; the right group absorbs it
 *  without wrapping or pushing the lockup off the row. */
export const English: Story = {
  args: {
    items: englishItems,
    cta: { label: 'Tell us about your project', href: '/en#contacto' },
    showCta: true,
    home: '/en',
    locale: 'en',
    localeSwitchHref: '/es',
    localeSwitchLabel: 'Switch to Spanish',
    menuItems: englishMenuItems,
    socials,
    navLabel: 'Main navigation',
    menuLabel: 'Menu',
    menuOpenLabel: 'Open menu',
    menuCloseLabel: 'Close menu',
  },
}

/** The About page's nav is byte-identical to the landing's — § 9.bis verified
 *  it — so the current page is announced to assistive technology and given no
 *  visual treatment at all (spec A-04). */
export const OnTheAboutPage: Story = {
  args: {
    ...Spanish.args,
    items: [
      { label: 'Servicios', href: '/es#servicios' },
      { label: 'Nosotros', href: '/es/nosotros', current: true },
    ],
  },
}

/**
 * The landing at scroll 0, with the Hero on screen: the button is not there,
 * because the Hero offers the same control two steps below (`ui-map.md` § 2).
 *
 * The nav's own row is **identical** to *Spanish* above — same height, same
 * background, same everything. Only the button's `opacity` and `visibility`
 * differ, and the fade between the two states is the whole animation.
 */
export const CallToActionHidden: Story = {
  args: { ...Spanish.args, showCta: false },
}

/** The arrangement below `lg`: lockup, toggle and hamburger. There is no CTA
 *  at this width at all, so the reveal has nothing to show or hide. */
export const Mobile: Story = {
  args: Spanish.args,
  globals: { viewport: { value: 'mobile' } },
}
