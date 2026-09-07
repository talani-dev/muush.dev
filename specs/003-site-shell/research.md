# Research: Site shell

**Feature**: `specs/003-site-shell` | **Date**: 2026-09-07

Seven unknowns were carried into planning. All seven are resolved below. Where
a finding came from running something, the command and its real output are
quoted — this repository has been bitten three times by a conclusion that held
in one build and not the other (`rules.md` § R18), so "verified" here means
verified against the artefact that ships.

Two findings are **UNVERIFIED** and say so: R1c (the hosting rewrite) cannot be
checked from inside this repository, and R1d (the root redirect) requires
editing `nuxt.config.ts`, which the spec author is not permitted to do. Both
carry a concrete verification command for the implementer.

---

## R1 · Static output shape and trailing slashes

**Spec reference**: A-14. `rules.md` § R10 concluded that internal hrefs need a
trailing slash. That conclusion was derived from Astro's
`build.format: 'directory'` and **must not be assumed to transfer** to Nitro.

### R1a · What Nitro actually emits — CONFIRMED

```
$ pnpm generate
[nitro] ℹ Prerendering 5 initial routes with crawler
[nitro]   ├─ /200.html (37ms)
[nitro]   ├─ /404.html (38ms)
[nitro]   ├─ /en (46ms)
[nitro]   ├─ /es (46ms)
[nitro] ℹ Prerendered 8 routes in 0.603 seconds

$ find .output/public -type f
.output/public/200.html
.output/public/404.html
.output/public/en/index.html
.output/public/en/_payload.json
.output/public/es/index.html
.output/public/es/_payload.json
.output/public/_i18n/5ec46701/{es,en}/messages.json
.output/public/_nuxt/…
.output/public/favicon.{ico,svg}
```

**Decision**: Nitro writes `/es` as `es/index.html` — the same subfolder-index
shape Astro produced. `rules.md` § R10's *observation about the file layout*
transfers; **its conclusion about hrefs does not** (see R1c). By extension
`/es/nosotros` will be written as `es/nosotros/index.html`.

**Rationale**: `nitro.prerender.autoSubfolderIndex` defaults to `true`. Setting
it to `false` would emit `es/nosotros.html` instead, which is a different
hosting contract. Not changed — the subfolder shape is the conventional one and
the deployment target was chosen around it.

**Alternatives considered**: `autoSubfolderIndex: false` (rejected: changes the
hosting contract for no gain); `router.options.trailingSlash` (rejected: see
R1c, this is not a link-markup problem).

### R1b · There is no `index.html` at the root — CONFIRMED, and it is a defect

```
$ ls .output/public/index.html
ls: .output/public/index.html: No such file or directory
```

`/` produces **no file at all**. A visitor typing `muush.dev` today reaches
whatever the hosting layer does with a missing key. The runtime config in the
generated HTML shows why:

```
window.__NUXT__.config={public:{i18n:{baseUrl:"",defaultLocale:"es",
  rootRedirect:"",redirectStatusCode:302, …
```

`rootRedirect` is empty. `@nuxtjs/i18n` only serves the `/` → `/es` redirect
when that option is set, and even then it is a **runtime** redirect — on a
prerendered site it exists only if `/` is prerendered into a file.

**Impact on the spec**: SC-001 asserts that `/` reaches the Spanish home. It
does not today. Closing that is in scope for this feature (it is one config
line plus one prerender entry) and is called out as its own task.

### R1c · Whether an href needs the trailing slash — UNVERIFIABLE HERE

`/es/nosotros` maps to the S3 key `es/nosotros/index.html`. Whether a request
for `/es/nosotros` (no slash) resolves depends entirely on the CloudFront
origin type, which lives in infrastructure this repository does not contain:

| Origin | `/es/nosotros` | `/es/nosotros/` |
|---|---|---|
| S3 **website** endpoint | resolves (301 to the slash form) | resolves |
| S3 **REST** origin, no rewrite | **404** | **404** |
| S3 REST + CloudFront Function appending `index.html` | resolves | resolves |

**Decision**: emit hrefs **without** a trailing slash — the form
`useLocalePath()` produces natively — and record the index-document rewrite as
a **deployment prerequisite**, not a markup workaround.

**Rationale**: with a REST origin and no rewrite, `/es/nosotros/` fails too
(the key `es/nosotros/` does not exist either), so adding slashes does not
actually fix the failing case — it only *looks* like it does. The rewrite is
required regardless. Fighting this in markup would mean overriding every link
the i18n module generates, to buy nothing.

**Status: UNVERIFIED.** Someone with access to the CloudFront distribution must
confirm the rewrite exists before launch. Flagged for Roberto. It is
**not a blocker for this feature** — every internal navigation after first load
is client-side routing, so this only affects direct entry and crawlers.

### R1d · Fixing the root — UNVERIFIED, needs one experiment

**Proposed**: set `i18n.rootRedirect: '/es'` and add `'/'` to
`nitro.prerender.routes`, then confirm a file appears at the root.

Nitro writes a prerendered redirect as an HTML file carrying a meta refresh,
but **this has not been run** — verifying it requires editing `nuxt.config.ts`,
which is outside the spec author's permitted scope. The implementer must run:

```
pnpm generate && ls -la .output/public/index.html && cat .output/public/index.html
```

and confirm the file exists and points at `/es`. If Nitro declines to emit it,
the fallback is a committed static `public/index.html` carrying a meta refresh
plus a canonical link — inelegant but static-safe. **Do not close this item by
inspection; run the command.**

---

## R2 · How the locale switcher gets its destination

**Confirmed from the installed `@nuxtjs/i18n@10.6.0` type declarations**
(`dist/runtime/composables/index.d.ts`):

```ts
export type SwitchLocalePathFunction = (locale: Locale) => string
export declare function useSwitchLocalePath(nuxtApp?: NuxtApp): SwitchLocalePathFunction

export type LocalePathFunction = <Name extends keyof RouteMapI18n>(
  route: RouteLocationI18nInput<Name>, locale?: Locale
) => string
export declare function useLocalePath(nuxtApp?: NuxtApp): LocalePathFunction

export declare function useRouteBaseName(nuxtApp?: NuxtApp): RouteBaseNameFunction
export declare function useLocaleHead(opts?, nuxtApp?): Ref<I18nHeadMetaInfo>
```

And from `dist/module.d.mts`:

```ts
customRoutes?: 'page' | 'config' | 'meta'
pages?: CustomRoutePages   // { [routeName]: Partial<Record<Locale, `/${string}` | false>> }
rootRedirect?: string | RootRedirectOptions
```

**Decision**: the shell **wraps** `useSwitchLocalePath` and `useLocalePath`. It
does **not** maintain its own map. The translated segment is declared once, in
`nuxt.config.ts` under `i18n.pages`, which is configuration and not a component
— satisfying FR-018 exactly.

**Rationale**: the module already owns the route table; a second copy in the
feature would be a source of truth that drifts silently, which is the specific
failure Article VI warns about. `customRoutes: 'config'` was chosen over
`'page'` (`defineI18nRoute` inside the page component) because the spec
requires the mapping to live in one declarative place rather than being
scattered across page files — with two routes today that difference looks
cosmetic, and with six it will not.

**What the repository's own logic is, and therefore what the unit tests
actually test** — the concern raised in the planning brief is real: a test that
asserts `switchLocalePath('en') === '/en/about'` tests the library. Two things
here are genuinely ours:

1. **Totality (FR-019).** `SwitchLocalePathFunction` returns `string`, and it
   returns the **empty string** when the current route has no counterpart. An
   empty `href` resolves to the current page — a silent no-op the visitor reads
   as a broken button. The shell must guard: when the resolved path is empty,
   fall back to the other locale's home.
2. **The anchor (FR-021, R3 below).** Composing a destination with a fragment
   is arithmetic on strings that the module does not do.

Both are pure functions of `(resolvedPath, fallbackHome, hash)`. **Decision**:
extract them into a pure, Nuxt-free function in
`app/features/shell/logic/resolveLocaleDestination.ts`, unit-test *that*, and
let the composable be the thin thing that feeds it module output. The tests
then exercise repository logic, including the empty-string case the library
will really produce.

**Alternatives considered**: a hand-written map in `data/` (rejected —
duplicates the router's table, and Article VI names exactly this class of
drift); testing the composable through `mountSuspended` with a real Nuxt
instance (rejected for the *pure* cases — slower, and it would be testing the
module; it stays appropriate for the component tests).

---

## R3 · The anchor enhancement

**Constraint, restated from `rules.md` § R9 and confirmed by R1a**: a URL
fragment is never transmitted to a server and does not exist at generate time.
Nothing in the prerendered HTML can know it.

**Decision**:

- The rendered `href` is the anchorless equivalent route. A crawler, a no-JS
  visitor and the `hreflang` alternates all get a real, resolvable URL.
- On activation, a click handler reads `window.location.hash` and, when
  non-empty, navigates to `destination + hash` instead. This is a progressive
  enhancement layered on a working link — never the only path.
- The handler must not swallow modified clicks (middle-click, ⌘/Ctrl-click) or
  the visitor loses "open in new tab".

**Rationale**: it degrades to correct behaviour rather than to broken
behaviour, which is the standing rule for every JS-dependent effect on this
site (`ui-map.md` § 10).

**Alternatives considered**: rendering the anchor into the href at build time
(impossible — this is the whole point of § R9); a global `router.beforeEach`
carrying the hash across locale changes (rejected — invisible action at a
distance for a two-route site, Article VIII).

---

## R4 · Rendering the shell in Storybook

**Confirmed**: `@storybook/vue3-vite@10.6.0` re-exports everything from
`@storybook/vue3`, whose declaration file exports

```ts
declare const setup: <AppHostElement = any>(
  fn: (app: App<AppHostElement>, storyContext?: StoryContext<VueRenderer>) => unknown
) => void
```

So `.storybook/preview.ts` can register global components on the story app.

**Decision**: a two-part answer, and the split is what makes FR-008 concrete.

1. **`ui/` components never call a Nuxt composable.** No `useI18n`, no
   `useLocalePath`, no `useRoute`. They receive resolved copy and resolved
   destination strings as props, exactly as Article V already requires of a
   presentational layer. This is not a Storybook accommodation — Storybook is
   simply the thing that *detects* a violation of it.
2. **`NuxtLink` is stubbed globally in `.storybook/preview.ts`** via `setup()`,
   as a component rendering `<a :href="to"><slot /></a>`. The `ui/` components
   may then use `<NuxtLink>` idiomatically and still render with no router.

**Rationale**: this is the same obligation Article XII already states and
`rules.md` § R19 already extended once — "what Nuxt provides, Storybook
redeclares". One stub in one file beats a `linkComponent` prop threaded through
every component in the module.

**Alternatives considered**: `ui/` renders plain `<a>` (rejected — every
internal navigation becomes a full page reload, discarding client-side routing
site-wide to solve a catalogue problem); a `linkComponent`/`as` prop per
component (rejected — pollutes the public prop surface of five components for a
test-harness concern, Article VIII).

**Verification**: `pnpm storybook:build` must pass with the three new stories.
This is a task, not an assumption.

---

## R5 · Scroll lock, Escape and focus containment

**Confirmed**: VueUse is **not** a dependency, direct or transitive —
`ls node_modules/@vueuse` returns nothing and `pnpm why @vueuse/core` returns
nothing. Reaching for `useScrollLock` / `onKeyStroke` means adding a dependency.

**Decision**: implement in a plain composable,
`app/features/shell/logic/useMobileMenu.ts`, with **no new dependency**:

- **Escape** — a `keydown` listener attached while open, removed on close and
  on scope disposal.
- **Scroll lock** — capture `window.scrollY`, pin the body, and restore the
  exact offset on release. Restoring the number is what makes SC-006 (`0` px
  drift) testable.
- **Containment** — the `inert` attribute on the page content behind the menu.
  One attribute makes a subtree unfocusable *and* hidden from assistive
  technology, which is both halves of FR-031 without a hand-written tab cycle.
- **Lifecycle** — close on route change and on crossing the breakpoint upward,
  and release the lock in `onScopeDispose` so an unmount can never strand the
  page unscrollable. That failure — a lock outliving its panel, leaving the
  site frozen with nothing on screen to blame — is the one this composable
  exists to make impossible.

**Rationale**: Article VIII forbids speculative dependencies, and this is the
whole of what VueUse would have supplied. The composable is a few dozen lines
and is exactly the "complex logic belongs in `logic/`" case Article V describes.

**Alternatives considered, and one real risk**:

- **`<dialog>` + `showModal()`** is genuinely attractive: the platform supplies
  focus containment, Escape and the top layer for free. **Rejected on a
  concrete risk**: elements promoted to the top layer are composited apart from
  the page, and `backdrop-filter` on them does not reliably blur the page
  content behind. FR-023 makes the blur a hard design requirement. A missing
  focus trap is something we can write; a blur the compositor refuses to apply
  is not. If the implementer wants to revisit this, the *only* acceptable route
  is to build both and compare the rendered blur — not to reason about it.
- **Adding VueUse** — rejected above. Worth noting that if a later feature needs
  three or four of its composables, that changes the arithmetic and this
  decision should be reopened rather than worked around.

---

## R6 · The `@theme inline` hazard — CONFIRMED again, on this build

`rules.md` § R18 is not folklore. Verified against the CSS that ships:

```
$ grep -o -- '--color-[a-z0-9-]*:' .output/public/_nuxt/entry.DcIfOH_j.css | wc -l
0

$ grep -o -- '--red-400:[^;]*'  .output/public/_nuxt/entry.DcIfOH_j.css
--red-400:#cf3147
$ grep -o -- '--bone-100:[^;]*' .output/public/_nuxt/entry.DcIfOH_j.css
--bone-100:#fbf8f6
```

**Zero** `--color-*` custom properties reach the browser. The `:root` ramp names
do.

**Decision**: any hand-written CSS — a scoped `<style>`, a document at-rule —
refers to `var(--bone-100)`, `var(--red-400)`, `var(--dark-glass)`. Never
`var(--color-bone-100)`. Tailwind **utilities** (`bg-glass-dark`,
`text-ink-300`, `border-hairline-footer`) are unaffected; the substitution
happens at build time inside the utility.

**Corollary discovered while verifying, worth recording**: the same grep shows
`--spacing-page` is *also* absent from the shipped CSS, because nothing in the
app currently uses a `*-page` utility. This is the same mechanism — `@theme
inline` emits a variable only where the content scan finds it used — and it
confirms that adding a token to `global.css` does nothing on its own. A token
only exists once a component consumes it.

---

## R7 · How much hand-written CSS the shell needs

**Decision**: almost none. The inventory:

| Piece | Mechanism |
|---|---|
| Nav, Footer, FooterColumn, menu layout | Tailwind utilities over the tokens of `data-model.md` § 2 |
| Hairline, divider, glass fills, borders | Utilities over new `@theme` colours |
| Panel blur | `backdrop-blur-*` utility over a new blur token |
| Hamburger bars | Two spans sized by spacing tokens — no custom CSS |
| **Inlined `x` glyph sizing** | **Scoped `<style>` with `:deep(svg)` — unavoidable** |
| Body scroll lock | Applied by the composable, not authored as a rule |

The one unavoidable block is the `:deep(svg)` sizing for the `v-html`-injected
glyph. `rules.md` § R14 already established why: Vue's scoped-style transform
does not rewrite `v-html` content, so a bare `svg {}` rule never matches. Both
`Lockup.vue` and `SocialIcon.vue` already carry the identical three-line block,
and the close control is the third instance of the same pattern.

Its content is `width: 100%; height: auto` — layout keywords, not design
values, so Article VII is untouched. It contains no colour and therefore does
not trip R6, but the rule of R6 applies to it anyway.

**Rationale**: every value the shell needs is expressible as a token plus a
utility. Reaching for a `<style>` block would mean a token is missing, which
Article VII says to treat as a signal rather than to bypass.

---

## Cross-cutting decisions recorded here

**The layout breakpoint is `lg`.** Spec FR-058 fixes 1024px; Tailwind v4's
default `lg` is `64rem` = 1024px, so the shell uses the stock `lg:` prefix with
no custom screen. FR-047's distinction matters at review time: `lg:` here
changes **layout** (hamburger ↔ links, one column row ↔ four), which is
permitted, and never a font size, padding, radius or blur, which is not.

**Component tests colocate.** `app/shared/ui/*.test.ts` is the established
shape, so shell tests sit beside their subjects and `vitest.config.ts` gains
`app/features/**/*.test.ts` in `include`. Per `rules.md` § R15 the aliases are
**not** redeclared there — `defineVitestConfig` inherits Nuxt's resolved Vite
config — and per § R16 the environment stays one global `happy-dom`.

**Nothing in this feature touches `app/shared/ui/`.** The nine primitives'
signatures are frozen by `specs/002-primitive-ui-layer/contracts/components.md`.

**An incidental defect found and confirmed while verifying R6**: the existing
`app/pages/index.vue` carries `p-gutter`, and

```
$ grep -c 'p-gutter' .output/public/_nuxt/entry.DcIfOH_j.css
0
```

There is no `--spacing-gutter` token — the token is `--spacing-page`. The class
ships in the HTML and does nothing. FR-007 already moves that page's surface
and padding to the layout, so the dead class is deleted rather than corrected.

---

## Open items handed forward

| Item | Status | Owner | Where it is tracked |
|---|---|---|---|
| CloudFront index-document rewrite (R1c) | UNVERIFIED, outside this repo | Roberto | Deployment prerequisite; not a blocker for merge |
| Root `/` redirect emits a file (R1d) | UNVERIFIED, needs one command | implementer | A task, with the command written out |
| `<dialog>` vs. overlay for the menu (R5) | Decided against `<dialog>`; reversible only with a rendered blur comparison | implementer | Recorded so it is not silently revisited |
| Footer Top row over-constrained (spec A-16) | Resolved in code, design file still wrong | Clau | `docs/business/rules.md`, flagged with the hairline |
| Footer hairline off-palette (spec A-06) | Unified to bone-100 @12% here | Clau | Same |
| LinkedIn URL shape (spec A-11) | Assumed company page | Clau | One value in `data/` |
