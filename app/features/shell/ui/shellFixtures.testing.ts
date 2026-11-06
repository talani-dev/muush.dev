import { defineComponent, h } from 'vue'
import type {
  ResolvedContactChannel,
  ResolvedFooterColumn,
  ResolvedShellItem,
  ResolvedSocial,
  StatusSectionProps,
} from '@/features/shell/data/types'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'

/**
 * Resolved shell copy for the catalogue and the component tests (feature
 * 43): what `useShellNavigation` hands the layout on `/es` and `/en`, with
 * the copy of `muush-1.0.md` §§ 4.1, 4.7, 4.9 and pen extract-43 § 6.
 * Fixtures only; the app never imports this file. "Inicio" / "Home" leads
 * the bar, the menu, Navegación and the mobile line (Home link added by
 * Roberto 2026-11-01); it is unlit here, as on every page but the top of
 * the home page.
 */
const BOOKING = CALL_BOOKING_URL
const WHATSAPP = 'https://wa.me/525639060739?text=Hola'
const MAIL = 'mailto:support@muush.dev'

export const SOCIALS: ResolvedSocial[] = [
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

const socialItems = SOCIALS.map(social => ({
  label: social.label,
  href: social.href,
  external: true,
}))

export const SHELL_COPY = {
  es: {
    items: [
      { label: 'Inicio', href: '/es', external: false },
      { label: 'Servicios', href: '/es#servicios', external: false },
      { label: 'Nosotros', href: '/es/nosotros', external: false },
    ] satisfies ResolvedShellItem[],
    cta: {
      label: 'Diagnóstico gratis',
      href: '/es#diagnostico',
      external: false,
    },
    home: '/es',
    homeLabel: 'Inicio de muush',
    localeSwitchHref: '/en',
    localeSwitchLabel: 'Cambiar a inglés',
    navLabel: 'Navegación principal',
    menuLabel: 'Menú',
    menuOpenLabel: 'Abrir menú',
    menuCloseLabel: 'Cerrar menú',
    footerLabel: 'Pie de página',
    tagline: 'Hablamos negocio y código.',
    category: 'Technology Solution Studio.',
    copyright: '© 2026 muush · Todos los derechos reservados',
    columns: [
      {
        title: 'Navegación',
        items: [
          { label: 'Inicio', href: '/es', external: false },
          { label: 'Servicios', href: '/es#servicios', external: false },
          {
            label: 'Cómo trabajamos',
            href: '/es#como-trabajamos',
            external: false,
          },
          { label: 'Nosotros', href: '/es/nosotros', external: false },
        ],
      },
      {
        title: 'Contacto',
        items: [
          {
            label: 'Diagnóstico gratis',
            href: '/es#diagnostico',
            external: false,
          },
          { label: 'Agenda una llamada', href: BOOKING, external: true },
          { label: 'support@muush.dev', href: MAIL, external: false },
          { label: 'WhatsApp', href: WHATSAPP, external: true },
        ],
      },
      {
        title: 'muush',
        items: [
          {
            label: 'Trabaja con muush',
            href: '/es/nosotros#trabaja-con-muush',
            external: false,
          },
          { label: 'Preguntas', href: '/es/preguntas', external: false },
          { label: 'Blog · próximamente', external: false },
        ],
      },
      { title: 'Redes', items: socialItems },
    ] satisfies ResolvedFooterColumn[],
    contactChannels: [
      { label: 'WhatsApp', hint: 'Escríbenos', href: WHATSAPP, external: true },
      {
        label: 'Agenda una llamada',
        hint: '30 minutos',
        href: BOOKING,
        external: true,
      },
      {
        label: 'support@muush.dev',
        hint: 'Correo',
        href: MAIL,
        external: false,
      },
    ] satisfies ResolvedContactChannel[],
    mobileLinks: [
      { label: 'Inicio', href: '/es', external: false },
      { label: 'Servicios', href: '/es#servicios', external: false },
      {
        label: 'Cómo trabajamos',
        href: '/es#como-trabajamos',
        external: false,
      },
      { label: 'Nosotros', href: '/es/nosotros', external: false },
      { label: 'Preguntas', href: '/es/preguntas', external: false },
      {
        label: 'Trabaja con muush',
        href: '/es/nosotros#trabaja-con-muush',
        external: false,
      },
      { label: 'Blog (próximamente)', external: false },
    ] satisfies ResolvedShellItem[],
    legal: [
      { label: 'Aviso de privacidad', href: '/es/privacidad', external: false },
      {
        label: 'Términos y condiciones',
        href: '/es/terminos',
        external: false,
      },
    ] satisfies ResolvedShellItem[],
  },
  en: {
    items: [
      { label: 'Home', href: '/en', external: false },
      { label: 'Services', href: '/en#servicios', external: false },
      { label: 'About', href: '/en/about', external: false },
    ] satisfies ResolvedShellItem[],
    cta: { label: 'Free assessment', href: '/en#diagnostico', external: false },
    home: '/en',
    homeLabel: 'muush home',
    localeSwitchHref: '/es',
    localeSwitchLabel: 'Switch to Spanish',
    navLabel: 'Main navigation',
    menuLabel: 'Menu',
    menuOpenLabel: 'Open menu',
    menuCloseLabel: 'Close menu',
    footerLabel: 'Footer',
    tagline: 'We speak business and code.',
    category: 'Technology Solution Studio.',
    copyright: '© 2026 muush · All rights reserved',
    columns: [
      {
        title: 'Navigation',
        items: [
          { label: 'Home', href: '/en', external: false },
          { label: 'Services', href: '/en#servicios', external: false },
          {
            label: 'How we work',
            href: '/en#como-trabajamos',
            external: false,
          },
          { label: 'About', href: '/en/about', external: false },
        ],
      },
      {
        title: 'Contact',
        items: [
          {
            label: 'Free assessment',
            href: '/en#diagnostico',
            external: false,
          },
          { label: 'Book a call', href: BOOKING, external: true },
          { label: 'support@muush.dev', href: MAIL, external: false },
          { label: 'WhatsApp', href: WHATSAPP, external: true },
        ],
      },
      {
        title: 'muush',
        items: [
          {
            label: 'Work with muush',
            href: '/en/about#trabaja-con-muush',
            external: false,
          },
          { label: 'FAQ', href: '/en/faq', external: false },
          { label: 'Blog · coming soon', external: false },
        ],
      },
      { title: 'Social', items: socialItems },
    ] satisfies ResolvedFooterColumn[],
    contactChannels: [
      { label: 'WhatsApp', hint: 'Message us', href: WHATSAPP, external: true },
      {
        label: 'Book a call',
        hint: '30 minutes',
        href: BOOKING,
        external: true,
      },
      {
        label: 'support@muush.dev',
        hint: 'Email',
        href: MAIL,
        external: false,
      },
    ] satisfies ResolvedContactChannel[],
    mobileLinks: [
      { label: 'Home', href: '/en', external: false },
      { label: 'Services', href: '/en#servicios', external: false },
      { label: 'How we work', href: '/en#como-trabajamos', external: false },
      { label: 'About', href: '/en/about', external: false },
      { label: 'FAQ', href: '/en/faq', external: false },
      {
        label: 'Work with muush',
        href: '/en/about#trabaja-con-muush',
        external: false,
      },
      { label: 'Blog (coming soon)', external: false },
    ] satisfies ResolvedShellItem[],
    legal: [
      { label: 'Privacy notice', href: '/en/privacy', external: false },
      { label: 'Terms and conditions', href: '/en/terms', external: false },
    ] satisfies ResolvedShellItem[],
  },
}

/**
 * Feature 44 · a `NuxtLink` stand-in that behaves like the router on the
 * current page: every link it renders is "exact active" and carries
 * `aria-current="page"`, unless the caller's own `aria-current` attribute
 * (which falls through after it) overrides it, as the real one does. Lets a
 * component test prove a link clears the router's marking (FR-028).
 */
export const ExactActiveLinkStub = defineComponent({
  name: 'NuxtLink',
  props: {
    to: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    return () =>
      h('a', { href: props.to, 'aria-current': 'page' }, slots.default?.())
  },
})

/**
 * Feature 46 · what `useFaqContent` and `useNotFoundContent` hand
 * `StatusSection` (copy `muush-1.0.md` § 4.9, data-model § 3).
 */
export const STATUS_COPY: Record<
  'faq' | 'notFound',
  Record<'es' | 'en', StatusSectionProps>
> = {
  faq: {
    es: {
      preset: 'faq',
      headingFirst: 'En construcción 🚧',
      primary: { label: 'Diagnóstico gratis', href: '/es#diagnostico' },
      secondary: { label: 'Agenda una llamada', href: BOOKING, external: true },
    },
    en: {
      preset: 'faq',
      headingFirst: 'Under construction 🚧',
      primary: { label: 'Free assessment', href: '/en#diagnostico' },
      secondary: { label: 'Book a call', href: BOOKING, external: true },
    },
  },
  notFound: {
    es: {
      preset: 'notFound',
      headingFirst: 'Volvamos a un',
      headingSecond: 'lugar conocido.',
      primary: { label: 'Volver al inicio', href: '/es' },
      secondary: { label: 'Diagnóstico gratis', href: '/es#diagnostico' },
    },
    en: {
      preset: 'notFound',
      headingFirst: "Let's get you back",
      headingSecond: 'somewhere familiar.',
      primary: { label: 'Back to home', href: '/en' },
      secondary: { label: 'Free assessment', href: '/en#diagnostico' },
    },
  },
}
