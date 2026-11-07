import { CALL_BOOKING_URL } from '@/shared/data/callBooking'
import { SECTION_ANCHORS } from '@/shared/data/sectionAnchors'
import type { ClickTrackingEvent } from '@/shared/data/trackingEvents'
import { SOCIAL_PROFILES } from './socialProfiles'
import type { FooterColumnModel, ShellItem } from './types'

/** The public mailbox and the public WhatsApp Business line (`overview.md`). */
export const SUPPORT_EMAIL = 'support@muush.dev'
export const WHATSAPP_URL = 'https://wa.me/525639060739'

/*
 * The destinations both footers share, each declared once so the desktop
 * columns and the mobile rows cannot drift apart. The booking URL is the
 * shared constant, never a literal (`tests/call-booking.test.ts`).
 */
export const FOOTER_DESTINATIONS = {
  /* The Home item (added by Roberto 2026-11-01): the top of the home page. */
  home: { kind: 'top', name: 'index' },
  services: {
    kind: 'anchor',
    name: 'index',
    anchor: SECTION_ANCHORS.services,
  },
  howWeWork: {
    kind: 'anchor',
    name: 'index',
    anchor: SECTION_ANCHORS.howWeWork,
  },
  about: { kind: 'route', name: 'about' },
  assessment: {
    kind: 'anchor',
    name: 'index',
    anchor: SECTION_ANCHORS.assessment,
  },
  workWithUs: {
    kind: 'anchor',
    name: 'about',
    anchor: SECTION_ANCHORS.workWithUs,
  },
  /* Feature 46 · Preguntas, `/es/preguntas` ↔ `/en/faq`. */
  faq: { kind: 'route', name: 'faq' },
  /* Feature 48 · the legal pages (`/es/privacidad` ↔ `/en/privacy`,
     `/es/terminos` ↔ `/en/terms`); the footer links navigate normally. */
  privacy: { kind: 'route', name: 'privacy' },
  terms: { kind: 'route', name: 'terms' },
  call: { kind: 'external', href: CALL_BOOKING_URL },
  email: { kind: 'external', href: `mailto:${SUPPORT_EMAIL}` },
  whatsapp: {
    kind: 'external',
    href: WHATSAPP_URL,
    messageKey: 'shell.footer.whatsappMessage',
  },
  none: { kind: 'none' },
} as const satisfies Record<string, ShellItem['destination']>

/**
 * What the footer CTAs report (feature 49, tracking plan § 4), shared by
 * the desktop columns and the mobile rows: both are `cta_location: footer`.
 */
export const FOOTER_TRACK = {
  assessment: {
    name: 'assessment_cta_click',
    params: { cta_location: 'footer' },
  },
  call: { name: 'book_call_click', params: { cta_location: 'footer' } },
  email: {
    name: 'contact_click',
    params: { channel: 'email', cta_location: 'footer' },
  },
  whatsapp: {
    name: 'contact_click',
    params: { channel: 'whatsapp', cta_location: 'footer' },
  },
} as const satisfies Record<string, ClickTrackingEvent>

/**
 * The four desktop footer columns of Muush 1.0, in the design's order
 * (feature 43, data-model § 4; pen extract-43 § 6; `muush-1.0.md` § 4.7).
 *
 * - NAVEGACIÓN opens with "Inicio" / "Home" (added by Roberto 2026-11-01).
 * - "Cómo trabajamos" points at a section feature 44 builds; until then the
 *   home page opens at its top (spec Edge Cases), never a 404.
 * - "Blog · próximamente" is text, not a link (`kind: 'none'`).
 * - Preguntas follows "Trabaja con muush" in MUUSH (feature 46, spec
 *   FR-031, Roberto 2026-11-02): the footers and the sitemap are the only
 *   places it is linked from; the header link bar stays three items.
 * - The REDES column is text links; the URLs come from the one record that
 *   owns them, so the footer and the menu buttons cannot drift.
 */
export const FOOTER_COLUMNS: FooterColumnModel[] = [
  {
    titleKey: 'shell.footer.nav.title',
    items: [
      {
        labelKey: 'shell.footer.nav.home',
        destination: FOOTER_DESTINATIONS.home,
      },
      {
        labelKey: 'shell.footer.nav.services',
        destination: FOOTER_DESTINATIONS.services,
      },
      {
        labelKey: 'shell.footer.nav.howWeWork',
        destination: FOOTER_DESTINATIONS.howWeWork,
      },
      {
        labelKey: 'shell.footer.nav.about',
        destination: FOOTER_DESTINATIONS.about,
      },
    ],
  },
  {
    titleKey: 'shell.footer.contact.title',
    items: [
      {
        labelKey: 'shell.footer.contact.assessment',
        destination: FOOTER_DESTINATIONS.assessment,
        track: FOOTER_TRACK.assessment,
      },
      {
        labelKey: 'shell.footer.contact.call',
        destination: FOOTER_DESTINATIONS.call,
        track: FOOTER_TRACK.call,
      },
      {
        labelKey: 'shell.footer.contact.email',
        destination: FOOTER_DESTINATIONS.email,
        track: FOOTER_TRACK.email,
      },
      {
        labelKey: 'shell.footer.contact.whatsapp',
        destination: FOOTER_DESTINATIONS.whatsapp,
        track: FOOTER_TRACK.whatsapp,
      },
    ],
  },
  {
    titleKey: 'shell.footer.muush.title',
    items: [
      {
        labelKey: 'shell.footer.muush.work',
        destination: FOOTER_DESTINATIONS.workWithUs,
      },
      {
        labelKey: 'shell.footer.muush.faq',
        destination: FOOTER_DESTINATIONS.faq,
      },
      {
        labelKey: 'shell.footer.muush.blog',
        destination: FOOTER_DESTINATIONS.none,
      },
    ],
  },
  {
    titleKey: 'shell.footer.social.title',
    items: SOCIAL_PROFILES.map(profile => ({
      labelKey: profile.labelKey,
      destination: { kind: 'external' as const, href: profile.href },
    })),
  },
]
