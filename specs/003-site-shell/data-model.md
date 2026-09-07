# Data Model: Site shell

**Feature**: `specs/003-site-shell` | **Date**: 2026-09-07

Two things are modelled here: the **shell's content model** (§ 1), which lives
in `app/features/shell/data/`, and the **token additions** (§ 2), which live in
`app/assets/css/global.css`.

There is no runtime state beyond the mobile menu's open flag (§ 1.6), no
persistence and no network call.

Every measurement in § 2 traces to `design-extract.md` § 9.bis or § 10. Every
`clamp()` is shown with the arithmetic that produced it, so a reviewer can
check it without redoing the algebra.

---

## 1 · Content model (`app/features/shell/data/`)

Article II is the binding constraint: **`data/` imports nothing from `logic/`
or `ui/`.** It holds types and locale-independent structure. It contains **no
copy** — only the i18n *keys* that name it — and **no resolved paths** — only
the descriptors `logic/` turns into paths.

### 1.1 · `ShellDestination`

The single discriminated union that makes FR-039 representable. "No
destination" is a real, renderable state, not a missing value — this is the
type that stops `Agenda una llamada` becoming a broken link.

```ts
export type ShellDestination =
  | { kind: 'route'; name: ShellRouteName }
  | { kind: 'anchor'; name: ShellRouteName; hash: string }
  | { kind: 'external'; href: string }
  | { kind: 'none' }
```

| Variant | Rendered as | Used by |
|---|---|---|
| `route` | localized path via `useLocalePath` | Nosotros, both lockups |
| `anchor` | localized path **+** `hash` | Proyectos, nav CTA, 4 menu items, 4 Navegación items, Work with muush |
| `external` | `<a target="_blank" rel="noopener noreferrer">` | WhatsApp, `mailto:`, 3 social profiles |
| `none` | plain ink-300 text, **no `<a>` element at all** | Agenda una llamada, FAQ, Blog |

> `kind: 'none'` renders no anchor element rather than an anchor without an
> `href`. An `<a>` with no `href` is not focusable and not announced as a link,
> but it still invites a pointer. FR-039 wants the item to read as text.

`mailto:` is modelled as `external` and is the one case that must **not** get
`target="_blank"` — see the contract in `contracts/components.md`.

### 1.2 · `ShellRouteName`

```ts
export type ShellRouteName = 'index' | 'nosotros'
```

The **route names**, not paths. Paths are the router's business and differ per
locale; that indirection is the whole of FR-018. Adding a page adds a member
here and an entry in `nuxt.config.ts` — never a string in a component.

### 1.3 · `ShellItem`

```ts
export interface ShellItem {
  /** i18n key, e.g. `shell.nav.projects`. Never the copy itself. */
  labelKey: string
  destination: ShellDestination
}
```

### 1.4 · `FooterColumnModel`

```ts
export interface FooterColumnModel {
  titleKey: string
  items: ShellItem[]
}
```

Exactly four exist and the design fixes both their order and their contents
(`design-extract.md` § 9.bis, § 10; ordering settled by `decisions-open.md`
D4 and D5). They are a constant, not a parameter.

| # | Title key | Items (in order) | Destinations |
|---|---|---|---|
| 1 | `shell.footer.nav.title` | Propósito · Servicios · Proyectos · Nosotros | `anchor #proposito` · `anchor #servicios` · `anchor #proyectos` · `route nosotros` |
| 2 | `shell.footer.contact.title` | Agenda una llamada · support@muush.dev · WhatsApp | **`none`** (decision #2) · `external mailto:` · `external wa.me` |
| 3 | `shell.footer.muush.title` | Work with muush · FAQ · Blog · próximamente | `anchor nosotros#work` · **`none`** (decision #3) · **`none`** (by design) |
| 4 | `shell.footer.social.title` | LinkedIn · Instagram · TikTok | three `external` |

> Column 3's third item is **one** `ShellItem` whose copy contains the `·`
> separator. Splitting on it would produce a phantom fifth item.
>
> Column 4's items are 15px text links, **not** the 48×48 `SocialIcon` buttons.
> Those appear only in the mobile menu (`design-extract.md` § 8).

### 1.5 · `SocialProfile`

```ts
export interface SocialProfile {
  network: SocialNetwork      // imported type from the frozen primitive contract
  href: string
  labelKey: string
  }
```

Three constants. The `href` values are the **single place** each URL appears —
the footer column 4 links and the mobile menu buttons read the same record, so
correcting one is one line (which is the mitigation A-11 promised for the
unconfirmed LinkedIn URL shape).

| Network | `href` | Source |
|---|---|---|
| LinkedIn | `https://www.linkedin.com/company/muush-dev` | handle from `branding.md`; **`/company/` assumed — spec A-11, pending Clau** |
| Instagram | `https://www.instagram.com/muush.dev` | `design-extract.md` § 9.bis |
| TikTok | `https://www.tiktok.com/@muush.dev` | `design-extract.md` § 9.bis |

WhatsApp is not a social profile — it is a contact destination, `wa.me/525639060739`
(`overview.md`, `ui-map.md` § 8), carrying a locale-specific pre-filled message
that comes from the locale files, not from here.

### 1.6 · Menu state — the only state in the feature

Owned by `logic/useMobileMenu.ts`, never by a component (FR-009).

| Field | Type | Notes |
|---|---|---|
| `isOpen` | `Readonly<Ref<boolean>>` | exposed read-only; mutated only through the returned actions |
| *(internal)* locked scroll offset | `number` | captured on open, restored exactly on close — this number is what makes SC-006 assertable |

Transitions: `closed --open()--> open`, and `open --close()--> closed` via any
of four triggers — an item, the close control, Escape, or a route change
(FR-029). Crossing the breakpoint upward also closes it (spec Edge Cases).
`onScopeDispose` releases the lock unconditionally, so no unmount can strand
the page unscrollable.

### 1.7 · Locale route pair (derived, not stored)

The pair of paths denoting one page across locales. **Not modelled as data** —
it is derived from the router table, which is the point of research § R2. It
appears here only to name the concept the toggle and the `hreflang` alternates
both resolve against.

| Route name | ES | EN |
|---|---|---|
| `index` | `/es` | `/en` |
| `nosotros` | `/es/nosotros` | `/en/about` |

---

## 2 · Token additions (`app/assets/css/global.css`)

Follows the file's existing conventions exactly: ramps and non-Tailwind
primitives in `:root`; everything Tailwind consumes inside `@theme inline`;
alpha as `color-mix(in srgb, var(--ramp) N%, transparent)`; fluid values as
`clamp()` interpolating 390 → 1440; tracking in `em` (`rules.md` § R4).

**The interpolation formula**, for a value that is `m` px at 390 and `d` px at
1440:

```
slope (vw) = (d − m) / 10.5
intercept (rem) = (m − (d − m) × 390 / 1050) / 16
clamp(m/16 rem, intercept + slope vw, d/16 rem)
```

Checked against an existing token: `--spacing-page` (24 → 80) gives
`slope = 56/10.5 = 5.3333` and `intercept = (24 − 20.8)/16 = 0.2`, i.e.
`clamp(1.5rem, 0.2rem + 5.3333vw, 5rem)` — which is what the file already
contains. The formula is the one feature 1 used.

> **Reminder (`rules.md` § R18, re-confirmed in research § R6):** these
> `--color-*` / `--text-*` / `--spacing-*` theme names emit **no** runtime
> custom property. They work as Tailwind utilities. Hand-written CSS must use
> the `:root` ramp names.

### 2.1 · Colours — 2 additions

| Token | Value | Source |
|---|---|---|
| `--color-hairline-footer` | `color-mix(in srgb, var(--bone-100) 12%, transparent)` | § 9.bis records `#c9c9c91f` desktop / `#FBF8F61F` mobile. `0x1F ÷ 255 = 12.2%`. Unified to the mobile value — **spec FR-042, A-06; the desktop hex is off-palette and flagged for Clau** |
| `--color-divider-menu` | `color-mix(in srgb, var(--bone-100) 8%, transparent)` | § 9.bis records `#FBF8F614`. `0x14 ÷ 255 = 7.8%` → 8% |

Everything else the shell paints already has a token: `--color-glass-dark`
(panel, hamburger, close control), `--color-glass-line` (their 1px border),
plus the `ink-*`, `bone-*` and `red-300` ramp steps.

### 2.2 · Blur — 1 addition

| Token | Value | Source |
|---|---|---|
| `--blur-menu-panel` | `1.25rem` (20px) | § 9.bis, menu panel `blur 20`. Fixed, not fluid — one viewport. Existing blurs do not fit: `--blur-glass` is 16, `--blur-glass-dark` is 22, `--blur-glass-red` clamps 20→22 |

### 2.3 · Type roles — 8 additions

Line heights marked ★ are **not in the design**; they are layout choices for
single-line runs, following the precedent feature 1 set for `--text-pill`,
`--text-button` and `--text-form-label`. Tracking is converted from the
design's px per `rules.md` § R4; where the two frames imply slightly different
`em`, the desktop value is used (spec A-07).

| Token | px M → D | `clamp()` | Weight | Tracking | LH |
|---|---|---|---|---|---|
| `--text-nav-link` | 15 (desktop only) | `0.9375rem` fixed | 500 | `0` | 1.2 ★ |
| `--text-lang` | 12 → 13 | `clamp(0.75rem, 0.7268rem + 0.0952vw, 0.8125rem)` | 500 | `0.062em` (0.8÷13) | 1.2 ★ |
| `--text-footer-tagline` | 16 → 18 | `clamp(1rem, 0.9536rem + 0.1905vw, 1.125rem)` | 500 | `-0.03em` (−0.54÷18) | 1.4 ★ |
| `--text-footer-category` | 11 → 12 | `clamp(0.6875rem, 0.6643rem + 0.0952vw, 0.75rem)` | 500 | `0.075em` (0.9÷12) | 1.4 ★ |
| `--text-footer-col-title` | 11 → 12 | `clamp(0.6875rem, 0.6643rem + 0.0952vw, 0.75rem)` | 600 | `0.1em` | 1.4 ★ |
| `--text-footer-item` | 14 → 15 | `clamp(0.875rem, 0.8518rem + 0.0952vw, 0.9375rem)` | 400 | `0` | 1.4 ★ |
| `--text-footer-bottom` | 12 → 13 | `clamp(0.75rem, 0.7268rem + 0.0952vw, 0.8125rem)` | 400 | `0` | 1.4 ★ |
| `--text-menu-item` | 30 (mobile only) | `1.875rem` fixed | 600 | `-0.03em` (−0.9÷30) | **1.1** |

Notes worth carrying to review:

- `--text-footer-col-title` is the one clean conversion: `1.2 ÷ 12` and
  `1.1 ÷ 11` are **both exactly 0.1em**, so the design's two values are one
  proportional value and the `em` form is provably right, not a compromise.
- `--text-menu-item`'s line height is **1.1 and load-bearing**. `rules.md`
  § R12 derived the menu's flow gaps assuming it; changing it invalidates the
  50px and 44px of § 2.4.
- `--text-nav-link` and `--text-menu-item` are fixed because each exists in
  exactly one viewport — a `clamp()` between a value and itself is noise.
- `--text-lang` and `--text-footer-bottom` share a `clamp()` expression with
  the existing `--text-pill` (both 12→13). They stay separate tokens: they are
  different roles with different tracking and weight, and collapsing them would
  couple the nav to a section eyebrow.

### 2.4 · Spacing — 28 additions (27 spacing + 1 radius)

**Nav** (§ 9.bis · *Nav — contenedor*)

| Token | px M → D | Value |
|---|---|---|
| `--spacing-nav-y` | 22 → 30 | `clamp(1.375rem, 1.1893rem + 0.7619vw, 1.875rem)` |
| `--spacing-nav-gap` | 14 → 30 | `clamp(0.875rem, 0.5036rem + 1.5238vw, 1.875rem)` |
| `--spacing-lang-gap` | 5 → 6 | `clamp(0.3125rem, 0.2893rem + 0.0952vw, 0.375rem)` |

Horizontal nav padding is 24 → 80, which **is** the existing `--spacing-page`.
Reused, not duplicated. The lockup's internal gap (9 → 12) is
`--spacing-lockup-gap`, already owned by the `Lockup` primitive.

**Hamburger and close control** (§ 9.bis) — all fixed, mobile-only

| Token | px | Note |
|---|---|---|
| `--spacing-burger-y` | 12 | `padding [12,11]` |
| `--spacing-burger-x` | 11 | |
| `--spacing-burger-bar-w` | 16 | |
| `--spacing-burger-bar-h` | 1.6 | `0.1rem` |
| `--spacing-burger-gap` | 5 | |
| `--radius-burger-bar` | 1 | `0.0625rem` |
| `--spacing-close-pad` | 10 | |
| `--spacing-close-glyph` | 18 | the lucide `x`, 18×18 |

Their corner radius is 10 = the existing `--radius-icon`. Their fill and border
are the existing `--color-glass-dark` and `--color-glass-line`.

> **Spec A-13**: these two controls are *not* the same size — the hamburger is
> 38×32.2, the close control 38×38. Both are implemented exactly as recorded.
> If they were meant to match, that is Clau's correction to the design file.

**Footer** (§ 9.bis · *Footer — contenedor*, § 10 · *FooterColumn*)

| Token | px M → D | Value |
|---|---|---|
| `--spacing-footer-top` | 52 → 80 | `clamp(3.25rem, 2.6rem + 2.6667vw, 5rem)` |
| `--spacing-footer-bottom` | 32 → 44 | `clamp(2rem, 1.7214rem + 1.1429vw, 2.75rem)` |
| `--spacing-footer-gap` | 40 → 56 | `clamp(2.5rem, 2.1286rem + 1.5238vw, 3.5rem)` |
| `--spacing-footer-brand-gap` | 10 → 20 | `clamp(0.625rem, 0.3929rem + 0.9524vw, 1.25rem)` |
| `--spacing-footer-cols-gap` | 20 → 64 | `clamp(1.25rem, 0.2286rem + 4.1905vw, 4rem)` |
| `--spacing-footer-col-gap` | 12 → 16 | `clamp(0.75rem, 0.6571rem + 0.381vw, 1rem)` |
| `--spacing-footer-item-gap` | 9 → 11 | `clamp(0.5625rem, 0.5161rem + 0.1905vw, 0.6875rem)` |
| `--spacing-footer-bar-gap` | 22 → 26 | `clamp(1.375rem, 1.2821rem + 0.381vw, 1.625rem)` |
| `--spacing-footer-bar-stack` | 6 | `0.375rem` fixed, mobile-only |
| `--spacing-footer-brand-w` | 340 | `21.25rem` fixed, desktop-only |
| `--spacing-footer-col-w` | 180 | `11.25rem` — a **basis**, not a fixed width; see below |

Horizontal footer padding is 24 → 80 = `--spacing-page` again.

> **`--spacing-footer-col-w` is a flex basis, per spec FR-060 and A-16.** The
> design over-constrains the desktop Top row: `340 + 80 + (4×180 + 3×64) =
> 1332` against a `1440 − 80 − 80 = 1280` content box. The brand block holds
> 340, the columns flex, and `space_between` distributes the 28px that actually
> remain. Treating 180 as fixed reproduces the overflow.

**Mobile menu** (§ 9.bis · *Menú móvil abierto*, flow translation from
`rules.md` § R12) — all fixed, mobile-only

| Token | px | Derivation |
|---|---|---|
| `--spacing-menu-top` | 176 | frame `y 176` becomes an offset from the top edge |
| `--spacing-menu-gap` | 30 | frame gap, unchanged |
| `--spacing-menu-divider-gap` | 50 | § R12: items end at 176 + 222 = 398; divider at 448 |
| `--spacing-menu-social-gap` | 44 | § R12: divider 448 → social row 493, less the 1px rule |
| `--spacing-menu-social-row-gap` | 14 | frame x 109/171/233 with 48-wide buttons: 171 − 109 − 48 = 14 |

The 222px the items occupy is `4 items × 30px × 1.1 line-height`, which is why
`--text-menu-item`'s line height is fixed at 1.1 and not a free choice.

**Shell container**

| Token | px | Note |
|---|---|---|
| `--spacing-shell-max` | 1440 | `90rem`. Spec FR-059 / A-02 — **UNVERIFIED, no design source.** Reversal is deleting one utility |

### 2.5 · Summary

**39 additions**: 2 colours, 1 blur, 8 type roles, 27 spacing values and 1
radius. **Zero** changes to any existing token — feature 2's vocabulary is
extended, never edited.

> **Count corrected during implementation (2026-09-07).** This section
> previously read "35 additions … 23 spacing values", and § 2.4's heading read
> "24 additions". Both were arithmetic slips: the tables in § 2.1–§ 2.4 list
> 3 nav + 7 hamburger/close + 11 footer + 5 menu + 1 container = **27**
> spacing tokens, plus `--radius-burger-bar`. The **inventory never changed**
> and all 39 are implemented; only the totals were wrong. `plan.md` repeats
> the old figure of 35 in four places; it derives from this table, and this
> table is the authoritative one.

Three of the 39 do not come from the design and are flagged as such wherever
they appear: `--spacing-shell-max` (A-02), and the ★ line heights (a documented
convention from feature 1, not a measurement).

---

## 3 · Traceability

| Spec requirement | Model element |
|---|---|
| FR-039 (no-destination items) | `ShellDestination` variant `none` (§ 1.1) |
| FR-018 (mapping declared once) | `ShellRouteName` (§ 1.2) + `i18n.pages` config |
| FR-019 (resolver totality) | pure `resolveLocaleDestination` (research § R2) |
| FR-021 (anchor at click time) | `ShellDestination.hash` + the enhancement (research § R3) |
| FR-028 / FR-031 (lock, containment) | menu state (§ 1.6) |
| FR-037 (columns and order) | `FooterColumnModel` constants (§ 1.4) |
| FR-042 / FR-043 (hairline, divider) | § 2.1 |
| FR-044 (missing tokens) | § 2.2 – § 2.4 |
| FR-045 (tracking in `em`) | § 2.3 |
| FR-060 / A-16 (footer Top row) | `--spacing-footer-col-w` as a basis (§ 2.4) |
| A-11 (LinkedIn URL) | one `href` in `SocialProfile` (§ 1.5) |
