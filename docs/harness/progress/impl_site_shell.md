# Implementation summary: site_shell (feature 003)

**Status after this work**: rejection addressed, ready for re-review
(`feature_list.json` left at `reviewing`).

All **45** tasks in `specs/003-site-shell/tasks.md` are checked off.
`./init.sh` exits **0** — 19 `[OK]`, no `[WARN]`, no `[FAIL]`.
`pnpm test` runs **216 tests in 20 files**.

---

## Revision 2 — 2026-09-07, after the reviewer's REJECTED verdict

The reviewer raised one substantive failure and one observation. Both are
addressed below. A third finding — an "undisclosed `biome.json` widening" and
an "overwritten § R20" — was traced by the coordinator to changes it made
itself on 2026-09-06 and left uncommitted in the working tree, and the verdict
file is being corrected. See the note at the end of this section about the
wording of mine that invited that reading.

### C7 — acceptance criterion 6, SC-001 and SC-003 had no test. Fixed.

They are all claims about what `pnpm generate` writes, and none of them is
observable from a mounted component. `tests/static-output.test.ts` (**20
cases**) asserts on `.output/public` directly:

| Covers | Assertions |
|---|---|
| **SC-001** | a document exists for each of the 4 routes and contains `<html>`; the root `index.html` carries the meta refresh to `/es`, the canonical and a real `<a href="/es">` |
| **SC-003** | the toggle's rendered `href` on each of the 4 pages is the equivalent route — all 8 transitions; its `hreflang` is the other locale; it is never empty (§ R22) and never carries a fragment (§ R9 / FR-021) |
| **Criterion 6** | every page carries the nav landmark, the `<footer>` and all four column titles, in both locales; `app/pages/` holds exactly one About component and both `/es/nosotros` and `/en/about` render its `#work` target; the nav markup is identical across the two pages once destinations and the active marking are excluded |
| bonus | zero anchors without an `href` across all four pages (SC-002); the `hreflang` alternates match the toggle's route table |

**These are built fresh, not read from whatever was lying around.**
`tests/global-setup.ts` runs `pnpm generate` once before any test file loads.
It is `globalSetup` rather than a `beforeAll` for two reasons: Vitest runs
files in parallel and a build rewriting `.nuxt/` underneath them is a race;
and an "only build if missing" guard would let a stale artefact satisfy a
suite whose entire purpose is to check the current one — the same failure as
the parity assertion that could never go red (§ R27). A cold generate is 3.3s,
measured, which is what the honesty costs.

**Proven red, not assumed red.** Three negative controls, each reverted:

| Control | Result |
|---|---|
| `i18n.pages` `en: '/about'` → `'/about-us'` | **10 of 20 fail** — both About documents, both toggle directions, the alternates and the layout check |
| delete `public/index.html` | **1 fails** — the root document assertion, and only that one |
| remove `<SiteFooter>` from the layout | **4 fail** — one per route |

One of my own assertions was wrong on first run and was corrected rather than
worked around: I had compared the two navs byte-for-byte, which fails because
the toggle *must* resolve to `/en` from the landing and `/en/about` from About.
A nav whose hrefs matched across pages would mean SC-003 was broken. The
comparison now excludes destinations and the active marking and compares
everything else.

### `ShellItem.messageKey` — switched to the reviewer's nested shape

The reviewer ruled the flat optional justified but noted an in-contract
alternative I had not mentioned. On reflection **the alternative is better and
I have switched to it**: `messageKey` now lives inside the `external` variant
of `ShellDestination`, so `ShellItem` is exactly as `contracts/components.md`
specifies and the deviation disappears.

My original reason for rejecting it — "the union's four variants are what
FR-039 rests on" — does not hold up. FR-039 rests on the `none` variant and on
`href?` being optional; adding an optional field to the `external` variant
touches neither. The nested shape is also better by the criterion I used
elsewhere in this feature: it makes an invalid combination *unrepresentable*,
because a pre-filled WhatsApp message can no longer be attached to a route, an
anchor, or an item with no destination at all. A test now pins that only one
destination in the whole model carries one.

### `data-model.md` token count — corrected

§ 2.5 said "35 additions … 23 spacing values" and § 2.4's heading said "24
additions". Both are arithmetic slips over an inventory that was always
correct: the tables list 27 spacing tokens plus one radius, so the total is
**39**. Both headings are fixed, with a dated note recording that the
inventory never changed. `plan.md` repeats the old 35 in four places; the note
points at `data-model.md` as authoritative rather than rewriting the plan's
narrative after the fact.

### On the wording that caused the false positive

Revision 1 said "`docs/business/rules.md` gains three rules. Nothing existing
was overwritten." I meant that **my** appends overwrote nothing, and I had
verified only my own diff. I could not have known the surrounding working tree
held someone else's uncommitted changes — but the sentence reads as a claim
about the whole file, which is more than I checked. Scoped correctly below.

---

## What shipped

The repository's **first feature module**, `app/features/shell/`, in the
`data/` · `logic/` · `ui/` shape Article I mandates, wired into a layout, plus
the second route so the nav links resolve.

| File | Role |
|---|---|
| `data/types.ts` | `ShellDestination`, `ShellItem`, `FooterColumnModel`, the `Resolved*` shapes |
| `data/navigation.ts` | 2 nav items, the CTA, 4 menu items, the 5 anchors |
| `data/footerColumns.ts` | the 4 columns, order fixed by D4/D5 · **+ test** |
| `data/socialProfiles.ts` | the 3 URLs, the only place each appears |
| `logic/resolveLocaleDestination.ts` | pure, total, Nuxt-free · **+ 13 tests** |
| `logic/useShellNavigation.ts` | the single Nuxt seam |
| `logic/useMobileMenu.ts` | open state, scroll lock, Escape, lifecycle · **+ 12 tests** |
| `ui/SiteNav.vue` | 158 lines · **+ 14 tests** · **+ story** |
| `ui/MobileMenu.vue` | 179 lines · **+ 12 tests** · **+ story** |
| `ui/SiteFooter.vue` | 106 lines · **+ 14 tests** · **+ story** |
| `ui/FooterColumn.vue` | 71 lines · **+ 8 tests** |
| `ui/LanguageToggle.vue` | 70 lines · **+ 9 tests** |
| `index.ts` | the barrel — 2 components, 2 composables, 7 types |

Plus `app/layouts/default.vue`, `app/pages/nosotros.vue`, a reduced
`app/pages/index.vue`, `app/assets/icons/x.svg` + its `README.md`,
`public/index.html`, 39 tokens in `global.css`, all shell copy in both locale
files, and the `i18n.pages` route declaration.

Test harness: `tests/setup.ts` (the `NuxtLink` stub), `tests/shell-copy.test.ts`,
`tests/global-setup.ts` and `tests/static-output.test.ts` (revision 2), plus
the `tests/i18n-parity.test.ts` repair described under R27.

`pnpm test` runs **216 tests in 20 files**. The catalogue gains exactly **3**
sidebar entries — `Shell/SiteNav`, `Shell/SiteFooter`, `Shell/MobileMenu`
(SC-010), verified from `storybook-static/index.json`.

**Nothing in `app/shared/ui/` was touched.** Zero prop-signature changes to any
of the nine primitives (SC-011).

## Verification performed

Beyond the five gates, and all run rather than reasoned about:

- **SC-001 — 4 routes + the root.** `.output/public` contains `es/index.html`,
  `en/index.html`, `es/nosotros/index.html`, `en/about/index.html` and
  `index.html`. Zero 404s.
- **SC-002 — no link leads nowhere.** Across all four generated pages, anchors
  with no `href`: **0**. The three undecided items render as
  `<span class="text-ink-300">` — confirmed in the emitted HTML for
  `Agenda una llamada`, `FAQ` and `Blog · próximamente`.
- **SC-003 — 8 locale transitions.** Read out of the generated HTML:
  `/es → /en`, `/en → /es`, `/es/nosotros → /en/about`,
  `/en/about → /es/nosotros`. All four pages, both directions, correct.
- **SC-004 / SC-009 / SC-008 —** `grep -rn 'var(--color-' app/features/
  app/layouts/` → **0**. `grep -rnE '#[0-9a-fA-F]{3,8}|\[[0-9]+px\]'
  app/features/shell/` → **0**. `grep -c -- '--color-' .output/public/_nuxt/*.css`
  → **0** on all four stylesheets. No prefix string-substitution exists in the
  module; the toggle goes through `useSwitchLocalePath`.
- **Every one of the 38 new utilities actually compiles.** Each was grepped out
  of the **site** stylesheet, not the catalogue's (`rules.md` § R18's warning).
  All present, including the two that only exist behind `lg:`.
- **SC-012 —** `data/` imports nothing from the feature's `logic/` or `ui/`;
  `logic/` imports no `ui/`; **no file outside `app/features/shell/` imports a
  shell internal** — the layout goes through the barrel. One import needs a
  reviewer's eye and is called out under *Deviations* below.
- **A-04 holds in production, not just in the tests.** Vue Router adds
  `router-link-active` / `router-link-exact-active` to the matching links.
  **No CSS rule in either build targets those classes**, so the current page is
  announced (`aria-current="page"`) and given no visual treatment at all —
  which is what § 9.bis's byte-identical navs require.
- **The parity suite's emptiness check was proven real with a negative
  control**: setting one key to `""` fails the suite; restoring it passes. It
  was *not* real before this feature — see R27 below.

## Findings that were not anticipated — appended as `rules.md` R25–R27

`docs/business/rules.md` gains three rules, **appended**. Nothing I wrote
edited or removed any existing rule — verified against my own diff, which is
the only thing I can speak to. The working tree also carried the coordinator's
uncommitted 2026-09-06 changes to § R20 and `biome.json` when I started; those
are not mine and are not described here.

- **R25 · Nitro emits no file for `rootRedirect`, even when forced.**
  `research.md` § R1d proposed `rootRedirect: '/es'` plus `'/'` in
  `nitro.prerender.routes` and insisted the implementer *run* it. Run: `/` is
  dropped from the crawl and `.output/public/index.html` still does not exist,
  although `rootRedirect:"/es"` does reach the runtime config. The task's own
  fallback was applied — a committed `public/index.html` with a meta refresh, a
  canonical, the `hreflang` set and a real link. The prerender entry was
  **deleted** rather than left as a no-op; `rootRedirect` stays because it
  governs `nuxt dev` and the client router behind a `200.html` SPA fallback.
- **R26 · A literal `@` in a locale file breaks the vue-i18n compiler.**
  `support@muush.dev` produced `Invalid linked format (error code: 10)` and
  stopped the whole file compiling. Escaped as `{'@'}`, which renders as a
  plain `@` — verified in the generated HTML. The `mailto:` and the TikTok URL
  are unaffected: they live in TypeScript, not in the locale files.
- **R27 · Locale JSON arrives as a message AST, and that had silently voided a
  test.** Nuxt's i18n Vite transform compiles the locale files on import, from
  `tests/` as well as from `app/`. An AST node is never `''`, so
  `tests/i18n-parity.test.ts`'s "no empty string" assertion **passed on any
  input**. Both that suite and the new `tests/shell-copy.test.ts` now read the
  files from disk. Fixing it was in scope because FR-050/SC-007 claim that
  guarantee.

## Deviations from the plan, each deliberate

1. ~~**`ShellItem` gained an optional `messageKey`.**~~ **Withdrawn in
   revision 2.** `messageKey` now lives inside the `external` variant of
   `ShellDestination`, which is in contract; see revision 2 above for why the
   nested shape is the better of the two. `ShellItem` is unchanged from
   `contracts/components.md`, so this is no longer a deviation.
2. **`SiteNav` gained `navLabel`, `menuLabel`, `menuOpenLabel`,
   `menuCloseLabel`; `MobileMenu` gained `label` and `closeLabel`.**
   `contracts/components.md` enumerates no accessible names, but FR-014 and
   FR-031 require them and Article VI forbids writing the strings in the
   component. They arrive resolved like every other string.
3. **`data/types.ts` re-exports `SocialNetwork` from
   `@/shared/ui/SocialIcon.vue`** rather than redeclaring the union.
   `data-model.md` § 1.5 asks for exactly this ("imported type from the frozen
   primitive contract"), and a second copy would drift. It is a type-only
   import from `app/shared/`, erased at build; it is **not** an import from the
   feature's own `ui/`, which is what Article II prohibits. Flagged because a
   naive `grep 'ui/'` over `data/` hits it.
4. **`useMobileMenu` holds module-scoped state.** A document has one such
   surface, the layout needs `isOpen` to mark the background `inert` while
   `SiteNav` owns the controls, and two instances would let the lock and the
   flag disagree — the one failure the composable exists to prevent. Nothing
   writes to it during prerendering, so every generated page has it `false`.
5. **"Route change" closes the menu via `popstate`, not via the router.**
   Reading `useRoute` inside the composable would make it Nuxt-bound and its
   unit tests meaningless. In-menu navigation closes through `itemChosen`, and
   nothing outside the menu can start a navigation while the rest of the
   document is `inert`, so history is the remaining path — and it is testable.
6. **A `tests/setup.ts` was added** registering the `NuxtLink` **stub**.
   Registering it under `components` does not work: `defineVitestConfig`
   inherits Nuxt's Vite config, so the SFC compiler resolves the real
   `NuxtLink`, which throws `NUXT_E1001` on mount. This is `rules.md` § R23's
   obligation extended to the second harness.
7. **Build order inside Phases 4–5 followed the dependency graph**, not the
   task numbering: `useMobileMenu` and `MobileMenu` were built before
   `SiteNav`, so the hamburger was wired once (T026 + T035 together) instead of
   shipping a button that did nothing. Every task is implemented.

## Still open, and deliberately not resolved here

Nothing below was silently decided. Each is in the code with a comment naming
its owner.

| Item | Owner | Where it is flagged |
|---|---|---|
| **A-01** — the `lg` (1024px) breakpoint has **no design source** | Clau | `useMobileMenu.ts`, marked UNVERIFIED |
| **A-02** — the 1440px content cap has **no design source** | Clau | `--spacing-shell-max` in `global.css`, marked UNVERIFIED |
| **A-16 / R24** — the desktop footer Top row is over-constrained by 52px | Clau | `--spacing-footer-col-w` and `SiteFooter.vue`; the gap yields, the columns flex |
| **A-06 / R11** — the footer hairline is off-palette at desktop | Clau | `--color-hairline-footer`, unified to bone-100 @12% |
| **A-11 / R13** — the LinkedIn URL shape | Clau | one `href` in `socialProfiles.ts` |
| **Decision #2** — Google Calendar link | Clau | `Agenda una llamada` renders as text |
| **Decision #3** — the FAQ page | Clau | `FAQ` renders as text |
| **A-05** — a sticky nav has no frame | Clau, Roberto | the nav is static, as drawn |
| **A-03** — the dotted paper and the glows belong to no feature | Roberto | the layout paints flat ink-500 |
| **A-10** — remembering the locale in `localStorage` | Roberto | out of scope, recorded |
| **R1c / R21** — the CloudFront index-document rewrite | Roberto | a deployment prerequisite, unverifiable from this repository |

Two smaller notes for the reviewer:

- **`data-model.md` § 2.5's count is wrong.** It says "35 additions … 23
  spacing values"; § 2.4 actually lists **27** spacing tokens. All of them are
  implemented, so the real total is **39** (2 colours, 1 blur, 8 type roles, 27
  spacing, 1 radius). The arithmetic slipped, not the inventory.
- **The mobile menu's destinations are absent from the static HTML**, because
  the panel is `v-if`'d on the open flag. That is intentional and safe: all
  four also exist in the footer, which needs no scripting (FR-032). The
  hamburger itself renders only after mount, so with scripting unavailable no
  control presents itself as operable.
