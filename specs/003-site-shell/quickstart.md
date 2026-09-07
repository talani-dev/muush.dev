# Quickstart: Site shell

**Feature**: `specs/003-site-shell` | **Date**: 2026-09-07

Orientation for whoever implements this. Read `spec.md` for *what*, `plan.md`
for *how it is gated*, `research.md` for *why each technical call was made*.
This file is the short path in.

## What you are building

The chrome around every page: a responsive nav, a full-screen mobile menu, a
four-column footer and an ES/EN toggle — as the repository's **first feature
module**, wired into a layout, with an About route so the nav links resolve.

It is also the first feature that puts anything visible on the site.

## Where things go

```
app/features/shell/
├── data/                        # types + constants. Imports NOTHING from logic/ or ui/
│   ├── types.ts                 # ShellDestination, ShellItem, ShellRouteName, Resolved*
│   ├── navigation.ts            # nav items, menu items, the nav CTA
│   ├── footerColumns.ts         # the 4 columns, order fixed by the design
│   └── socialProfiles.ts        # the 3 URLs — the ONLY place each appears
├── logic/                       # may import data/. Never ui/
│   ├── resolveLocaleDestination.ts   # pure. The real unit-test target
│   ├── useShellNavigation.ts    # the only seam touching the Nuxt runtime
│   └── useMobileMenu.ts         # open state, scroll lock, Escape, inert
├── ui/                          # may import logic/ and data/. Presentational only
│   ├── SiteNav.vue
│   ├── MobileMenu.vue
│   ├── LanguageToggle.vue
│   ├── SiteFooter.vue
│   └── FooterColumn.vue
└── index.ts                     # the module's ONLY public API

app/layouts/default.vue          # renders SiteNav + <slot /> + SiteFooter
app/pages/nosotros.vue           # thin. /es/nosotros and /en/about
app/pages/index.vue              # reduced to page content (FR-007)
app/assets/icons/x.svg           # new — the lucide close glyph
i18n/locales/{es,en}.json        # all shell copy
```

Tests colocate: `app/features/shell/**/*.test.ts`. Stories colocate:
`app/features/shell/ui/*.stories.ts`.

## The three rules that will bite you

**1 · Dependency direction (Article II, non-negotiable).** `data/` imports
nothing from `logic/` or `ui/`. `logic/` never imports `ui/`. If `data/` seems
to need a translation, it does not — it holds the *key*, and `logic/` resolves
it.

**2 · `--color-*` does not exist at runtime (`rules.md` § R18).** Verified
again on this build:

```
$ grep -c -- '--color-' .output/public/_nuxt/entry.*.css
0
```

In a scoped `<style>`, write `var(--bone-100)`. Never `var(--color-bone-100)`.
Utilities (`bg-glass-dark`, `text-ink-300`) are fine — the substitution happens
at build time inside the utility. This has broken the repo three times, and it
looks **correct in Storybook** while being broken in production, so verify
against `.output/public`, never `storybook-static/`.

**3 · `ui/` may not call a Nuxt composable.** No `useI18n`, no `useLocalePath`,
no `useRoute`. Copy and hrefs arrive as props. Storybook runs outside Nuxt and
will tell you immediately if you cheat — that is the point.

## Build order

Roughly `data/ → logic/ → ui/`, with two hard prerequisites:

1. **Tokens before components.** `data-model.md` § 2 lists all 35. A component
   written first will reach for a literal.
2. **The About route before the Nav**, or every nav link 404s while you work.

Then: `data/` constants → `resolveLocaleDestination` + its tests →
`useShellNavigation` → `useMobileMenu` + its tests → `FooterColumn` →
`SiteFooter` → `LanguageToggle` → `MobileMenu` → `SiteNav` → layout → stories.

## Verify as you go

```bash
pnpm check          # Biome — lint + format, --error-on-warnings
pnpm typecheck      # vue-tsc, strict
pnpm test           # Vitest
pnpm generate       # static output → .output/public
pnpm storybook:build
```

All five must pass. Husky runs the first two pre-commit and the tests pre-push;
`--no-verify` is prohibited.

Two checks the gates do **not** cover, so run them by hand:

```bash
# R18: no theme names in hand-written CSS
grep -rn 'var(--color-' app/features/ app/layouts/

# Article VII: no colour or size literals in the module
grep -rnE '#[0-9a-fA-F]{3,8}|\[[0-9]+px\]' app/features/shell/
```

Both must return nothing.

## The one experiment you must actually run

`/` produces **no file today** — confirmed in research § R1b:

```
$ ls .output/public/index.html
ls: .output/public/index.html: No such file or directory
```

The proposed fix is `i18n.rootRedirect: '/es'` plus `'/'` in
`nitro.prerender.routes`. **It has not been tested** — verifying it needs a
`nuxt.config.ts` edit, which the spec author could not make. After wiring it:

```bash
pnpm generate && cat .output/public/index.html
```

Confirm a file exists and points at `/es`. If Nitro declines to emit one, fall
back to a committed `public/index.html` with a meta refresh and a canonical
link. **Do not close this by reading the docs.**

## Things already decided — do not re-litigate

| | |
|---|---|
| Mobile nav has **no** CTA button | Recorded decision, `decisions-open.md` 2026-09-06. Comment it in the code |
| `Agenda una llamada`, `FAQ`, `Blog · próximamente` render as plain ink-300 text | FR-039. Open decisions #2 and #3 are Clau's and stay open |
| Footer hairline is bone-100 @12% in both viewports | FR-042. The design's desktop `#c9c9c91f` is off-palette; flagged for Clau, not silently fixed |
| Footer desktop columns **flex**; 180 is a basis | FR-060 / A-16. The design over-constrains that row by 52px |
| The menu does **not** repaint the background layers | A-03. Those are the page showing through the blur |
| Breakpoint is `lg` (1024px); content caps at 1440px | A-01, A-02. **Neither is in the design** — flagged for Clau |
| No `<dialog>` for the menu | Research § R5: top-layer promotion breaks `backdrop-filter`, and the blur is a hard requirement |
| No VueUse | Research § R5. Not in the tree; not added for this |
| Locale switching goes through `useSwitchLocalePath` | Research § R2. Never a prefix string-swap (Article VI) |
| The nine primitives are frozen | `specs/002-primitive-ui-layer/contracts/components.md` |

## Two traps specific to this module

**The empty string from `switchLocalePath`.** Typed `(locale) => string`, it
returns `''` when the current route has no counterpart. An empty `href` means
"this page" — a button that silently does nothing.
`resolveLocaleDestination()` exists to guarantee a real destination, and that
guarantee is what the unit tests assert. A test that only checks
`switchLocalePath('en') === '/en/about'` tests the library, not us.

**The anchor cannot exist at build time** (`rules.md` § R9). The rendered
`href` is anchorless; the fragment is appended in the click handler. Do not
intercept modified clicks — ⌘-click must still open a new tab.
