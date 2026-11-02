import type { SectionAnchor } from '@/shared/data/sectionAnchors'
import type { SocialNetwork } from '@/shared/ui/SocialIcon.vue'

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
export type ShellRouteName = 'index' | 'about'

/**
 * Where a shell item points. `none` is a real state rather than a missing
 * value: "Blog · próximamente" and, until feature 48, the two legal entries
 * have no destination and render as text, never as a dead link.
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
      /**
       * The v1 404's `#proposito` shortcut only (`data/notFound.ts`). The
       * v1 sections it points at carry no declared anchor; feature 46
       * replaces that page and deletes this member with it.
       */
      kind: 'legacyHash'
      name: ShellRouteName
      hash: string
    }
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
 * Re-exported, not redeclared: the union is owned by the v2 `SocialIcon`
 * (feature 43), and a second copy here would drift the first time a network
 * is added.
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
