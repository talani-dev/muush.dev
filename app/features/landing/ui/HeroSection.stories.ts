import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'
import HeroSection from './HeroSection.vue'

/**
 * `01 Hero`, the landing's first section. Switch the viewport control between
 * *Móvil (390)* and *Escritorio (1440)* to see the one structural difference
 * the design draws: the CTA row runs horizontally above `lg` and stacks below
 * it. Everything else — every type size, every gap, every glow anchor —
 * interpolates through a `clamp()`, so the two frames are one component.
 *
 * Every prop below is a **fixture**. The component calls no Nuxt composable,
 * which is exactly why it renders here with no router, no i18n instance and no
 * Nuxt runtime (`docs/business/rules.md` § R23).
 *
 * ⚠️ **Two things look wrong here and are not.**
 *
 * - The eyebrow reads `Technology solution studio` in the Spanish story too.
 *   That is the design, verified in all four frames, and a test holds the two
 *   locale files identical for that key.
 * - The **primary** call to action offers no pointer on hover. It is a
 *   `<button>` with no destination while section 05 does not exist, and a
 *   reserved control that looks clickable and leads nowhere reads as a broken
 *   site (`ui-map.md` § 6). *With the contact section* below is what it becomes
 *   when the anchor exists — pointer included, from one data key.
 *
 * The secondary call to action is live from 2026-09-07: `bone-100`, its arrow
 * shifting on hover, opening `cal.com` in a new tab
 * (`decisions-open.md` § Decisión 2). *No destination* below is the branch it
 * used to take and that every future blocked control still takes.
 *
 * The backdrop's three glows paint at `--layer-glow`, which is a **negative**
 * level: on this page there is no ink base beneath them, so they read darker
 * than they do on the site. Their composition — top right, top left, falling
 * away bottom right — is what this story is for.
 */
const meta = {
  title: 'Landing/HeroSection',
  component: HeroSection,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HeroSection>

export default meta
type Story = StoryObj<typeof meta>

/*
 * `callHref` is the real destination, not a placeholder: these four stories are
 * what the site ships today, and a catalogue showing the inert branch would be
 * reviewing something that no longer renders anywhere.
 */
const spanish = {
  eyebrow: 'Technology solution studio',
  headline: 'Hablamos negocio y código.',
  subhead:
    'Diseñamos y construimos soluciones digitales alrededor de tu negocio.',
  ctaPrimary: 'Cuéntanos tu proyecto',
  ctaSecondary: 'Agenda una llamada',
  callHref: CALL_BOOKING_URL,
}

const english = {
  eyebrow: 'Technology solution studio',
  headline: 'We speak business and code.',
  subhead: 'We design and build digital solutions around your business.',
  ctaPrimary: 'Tell us about your project',
  ctaSecondary: 'Book a call',
  callHref: CALL_BOOKING_URL,
}

export const Spanish: Story = {
  args: spanish,
  globals: { viewport: { value: 'desktop' } },
}

/** The English headline is one word shorter and re-wraps; no break is forced. */
export const English: Story = {
  args: english,
  globals: { viewport: { value: 'desktop' } },
}

/** Below `lg`: the same four children, the CTA row stacked, and the primary
 *  button as wide as its label rather than as wide as the column. */
export const Mobile: Story = {
  args: spanish,
  globals: { viewport: { value: 'mobile' } },
}

export const MobileEnglish: Story = {
  args: english,
  globals: { viewport: { value: 'mobile' } },
}

/**
 * What the Hero becomes the day section 05 exists — reviewable now, before it
 * ships. The primary CTA turns from a `<button>` into a link to the contact
 * anchor, and gains its pointer with it. The path below is a placeholder for
 * `HERO_DESTINATIONS.contactHash`; filling that one key is the whole change.
 */
export const WithContactSection: Story = {
  args: {
    ...spanish,
    contactHref: '/es#contacto',
  },
  globals: { viewport: { value: 'desktop' } },
}

/**
 * The branch with **no** destination, which the secondary CTA took until
 * 2026-09-07 and which every future blocked control still takes: grey `ink-300`
 * text, no anchor element, no pointer, no hover — and **no arrow**, because an
 * arrow is the affordance for going somewhere. It is the same treatment the
 * footer gives `FAQ` and `Blog · próximamente`.
 *
 * Kept in the catalogue on purpose. The branch is still in the component and
 * still tested; without a story it would be the one state nobody ever looks at
 * until the next blocked destination ships it by accident.
 */
export const NoDestination: Story = {
  args: { ...spanish, callHref: undefined },
  globals: { viewport: { value: 'desktop' } },
}
