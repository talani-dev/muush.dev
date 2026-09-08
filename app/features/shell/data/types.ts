import type { SocialNetwork } from '@/shared/ui/SocialIcon.vue'

/**
 * The shell's content model.
 *
 * This layer holds i18n **keys** and destination **descriptors**. It carries
 * no copy and no resolved path: turning a key into a string and a descriptor
 * into an href is `logic/`'s job. Constitution Article II makes the direction
 * one-way — nothing here may import from `logic/` or `ui/`.
 */

/** The two locales the site ships in. Spanish is the default. */
export const SHELL_LOCALES = ['es', 'en'] as const

export type ShellLocale = (typeof SHELL_LOCALES)[number]

/**
 * Route **names**, never paths. The paths differ per locale
 * (`/es/nosotros` ↔ `/en/about`) and are declared once in `nuxt.config.ts`
 * under `i18n.pages`. Adding a page adds a member here and an entry there —
 * never a path literal in a component (spec FR-018).
 */
export type ShellRouteName = 'index' | 'nosotros'

/**
 * Where a shell item points. Four kinds, and `none` is a real state rather
 * than a missing value: `FAQ` and `Blog · próximamente` have no destination and
 * must render as text, not as a dead link (spec FR-039).
 *
 * `Agenda una llamada` was in that state until 2026-09-07 and moved to
 * `external` when its URL arrived — which is the point of modelling the absence
 * as data. `none` stays, because the other two are still in it.
 */
export type ShellDestination =
  | { kind: 'route'; name: ShellRouteName }
  | { kind: 'anchor'; name: ShellRouteName; hash: string }
  | {
      kind: 'external'
      href: string
      /**
       * i18n key of a message to append as the `text` query parameter.
       *
       * Only the WhatsApp destination uses it: `ui-map.md` § 8 requires the
       * link to arrive with a locale-specific message already written. The
       * key lives here rather than the copy, because copy is `logic/`'s to
       * resolve — it translates and encodes it.
       *
       * It sits inside this variant rather than on `ShellItem` so that a
       * pre-filled message cannot be attached to a route, an anchor or an
       * item with no destination at all. Those combinations mean nothing, and
       * this way they cannot be written.
       */
      messageKey?: string
    }
  | { kind: 'none' }

export interface ShellItem {
  /** i18n key, e.g. `shell.nav.projects`. Never the copy itself. */
  labelKey: string
  destination: ShellDestination
}

export interface FooterColumnModel {
  titleKey: string
  items: ShellItem[]
}

/**
 * Re-exported, not redeclared: the union is owned by the frozen `SocialIcon`
 * contract, and a second copy here would drift the first time a network is
 * added.
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
  /** True for the route matching the current page — spec A-04. */
  current?: boolean
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
