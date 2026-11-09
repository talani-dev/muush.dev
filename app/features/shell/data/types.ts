import type { SectionAnchor } from '@/shared/data/sectionAnchors'
import type { SocialNetwork } from '@/shared/data/socialNetworks'
import type {
  ClickTrackingEvent,
  TrackAttrs,
} from '@/shared/data/trackingEvents'

/**
 * The shell's content model.
 *
 * This layer holds i18n **keys** and destination **descriptors**. It carries
 * no copy and no resolved path: turning a key into a string and a descriptor
 * into an href is `logic/`'s job. Constitution Article II makes the direction
 * one-way — nothing here may import from `logic/` or `ui/`.
 */

/**
 * The two locales the site ships in. English is the default since feature 37
 * (`i18n.defaultLocale` in nuxt.config.ts); this order carries no meaning.
 */
export const SHELL_LOCALES = ['es', 'en'] as const

export type ShellLocale = (typeof SHELL_LOCALES)[number]

/**
 * Route **names**, never paths. The paths differ per locale
 * (`/es/nosotros` ↔ `/en/about`) and are declared once in `nuxt.config.ts`
 * under `i18n.pages`. Adding a page adds a member here and an entry there —
 * never a path literal in a component (spec FR-018).
 */
export type ShellRouteName = 'index' | 'about' | 'faq' | 'privacy' | 'terms'

/**
 * Where a shell item points. `none` is a real state rather than a missing
 * value: "Blog · próximamente" has no destination and renders as text, never
 * as a dead link.
 *
 * An `anchor` names a route plus a declared section id (feature 43, spec
 * FR-025, FR-026): typing it by `SectionAnchor` means a link to a section
 * nobody declared does not compile.
 */
export type ShellDestination =
  | { kind: 'route'; name: ShellRouteName }
  | {
      /**
       * The top of a route's page: the Home item (added by Roberto
       * 2026-11-01). Same href as `route`, but current only while that page
       * is shown and the visitor is above its first spied section — never
       * for the whole page, as a `route` item is.
       */
      kind: 'top'
      name: ShellRouteName
    }
  | { kind: 'anchor'; name: ShellRouteName; anchor: SectionAnchor }
  | {
      kind: 'external'
      href: string
      /**
       * i18n key of a message to append as the `text` query parameter.
       *
       * Only the WhatsApp destination uses it: the link arrives with a
       * locale-specific message already written. It sits inside this variant
       * so that a pre-filled message cannot be attached to a route, an anchor
       * or an item with no destination at all.
       */
      messageKey?: string
    }
  | { kind: 'none' }

export interface ShellItem {
  /** i18n key, e.g. `shell.nav.projects`. Never the copy itself. */
  labelKey: string
  destination: ShellDestination
  /**
   * The click event this CTA reports once the visitor accepts analytics or
   * advertising (feature 49, tracking plan § 4): every "Diagnóstico
   * gratis", "Agenda una llamada", WhatsApp and support@muush.dev item, with
   * the place it sits. Absent on every other item
   * (`data/trackedItems.test.ts`).
   */
  track?: ClickTrackingEvent
}

/**
 * A mobile-footer contact row (feature 43, spec FR-033): the item plus the
 * hint drawn on its right ("Escríbenos", "30 minutos", "Correo").
 */
export interface ContactChannel extends ShellItem {
  hintKey: string
}

export interface FooterColumnModel {
  titleKey: string
  items: ShellItem[]
}

/**
 * Re-exported, not redeclared: the union is owned by
 * `app/shared/data/socialNetworks.ts`, and a second copy here would drift the
 * first time a network is added.
 */
export type { SocialNetwork }

export interface SocialProfile {
  network: SocialNetwork
  href: string
  labelKey: string
}

/**
 * What `logic/` hands `ui/`. Everything is already resolved, which is what
 * lets the presentational layer render with no router, no i18n instance and
 * no Nuxt runtime at all (spec FR-008).
 */
export interface ResolvedShellItem {
  /** Already translated. */
  label: string
  /** Absent when the item has no destination — spec FR-039. */
  href?: string
  /** True only for `kind: 'external'`; drives `target` and `rel`. */
  external?: boolean
  /**
   * Whether this item is where the visitor is (feature 43, spec FR-027,
   * FR-028): `page` for a route item on its own page and for the Home item
   * at the top of the home page, `section` for an anchor item whose section
   * is in view. Absent otherwise. Drives `aria-current` (`page` / `true`)
   * and the active style.
   */
  current?: 'page' | 'section'
  /**
   * The Home item only (Roberto 2026-11-01): a click on the page it points
   * at scrolls to the top, which the router alone does not do
   * (`logic/scrollToTopIfCurrent.ts`). Absent otherwise.
   */
  scrollsToTop?: true
  /** The item's `data-track*` attributes, bound on its link (feature 49).
   * Absent when the item reports nothing. */
  trackAttrs?: TrackAttrs
}

/** A resolved mobile-footer contact row. */
export interface ResolvedContactChannel extends ResolvedShellItem {
  /** Already translated, without the decorative arrow. */
  hint: string
}

export interface ResolvedFooterColumn {
  title: string
  items: ResolvedShellItem[]
}

export interface ResolvedSocial {
  network: SocialNetwork
  href: string
  /** Accessible name — the glyph carries no text of its own. */
  label: string
}

/**
 * The status page the shared block renders (feature 46, spec FR-042): the
 * 404 since feature 51 moved Preguntas to its own `faq` module. The name
 * is also its shader preset.
 */
export type StatusPreset = 'notFound'

/**
 * What `ui/StatusSection.vue` receives (feature 46, data-model § 3),
 * returned by `useNotFoundContent`: every string and href resolved.
 */
export interface StatusSectionProps {
  preset: StatusPreset
  headingFirst: string
  /** Line 2 in Gris 400. */
  headingSecond?: string
  /** The primary button, with the arrow. */
  primary: ResolvedShellItem
  /** The glass button, no icon; a new tab when `external`. */
  secondary: ResolvedShellItem
}
