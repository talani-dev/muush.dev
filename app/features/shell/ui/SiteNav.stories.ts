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
  { label: 'Proyectos', href: '/es#proyectos' },
  { label: 'Nosotros', href: '/es/nosotros' },
]

const spanishMenuItems: ResolvedShellItem[] = [
  { label: 'Propósito', href: '/es#proposito' },
  { label: 'Servicios', href: '/es#servicios' },
  { label: 'Proyectos', href: '/es#proyectos' },
  { label: 'Nosotros', href: '/es/nosotros' },
]

const englishItems: ResolvedShellItem[] = [
  { label: 'Projects', href: '/en#proyectos' },
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
    home: '/es',
    locale: 'es',
    localeSwitchHref: '/en',
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
    home: '/en',
    locale: 'en',
    localeSwitchHref: '/es',
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
      { label: 'Proyectos', href: '/es#proyectos' },
      { label: 'Nosotros', href: '/es/nosotros', current: true },
    ],
  },
}

/** The arrangement below `lg`: lockup, toggle and hamburger. */
export const Mobile: Story = {
  args: Spanish.args,
  globals: { viewport: { value: 'mobile' } },
}
