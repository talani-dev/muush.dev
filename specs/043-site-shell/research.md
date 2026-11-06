# Research · feature 43 site shell

Each entry: Decision · Rationale · Alternatives considered. "CONFIRMED" means
read in the repo or in installed package code; "INFERRED" means derived.

## R1 · Where the v2 shell UI lives, and the v1 quarantine

- **Decision.** The v2 shell components are new files in
  `app/features/shell/ui/` (`SiteHeader`, `NavLinkBar`, `MenuButton`,
  `MobileMenu`, `SiteFooter`, `FooterColumns`, `MobileFooter`,
  `SocialLinks`). The v1 shell UI moves with `git mv` into
  `app/features/shell/ui/legacy/` with its stories and tests: `SiteNav`,
  `MobileMenu`, `SiteFooter`, `FooterColumn`, `NotFoundContent`,
  `NotFoundRings`. Their stories already sit in `Legacy v1/Shell/…`
  (CONFIRMED, feature 42 retitled them) and stay there. `LanguageToggle` is
  **restyled in place** (behaviour unchanged) and its story moves from
  `Legacy v1/Shell/LanguageToggle` to `Shell/LanguageToggle`.
- **Rationale.** Mirrors feature 42 (`app/shared/ui/legacy/`), keeps one
  rule for feature 47 ("delete every `legacy/`"), and keeps v1
  `NotFoundContent` rendering until feature 46. Same file names in two
  directories is the precedent 42 set (`Pill` vs `legacy/Pill`).
- **Alternatives.** (a) Delete the replaced v1 nav, menu and footer now
  (Article VIII, no dead code): cleaner, but feature 47's description owns
  the deletion of unused v1 code, and Roberto may want them for side-by-side
  review until then. (b) Rename v1 files with a suffix: forbidden
  (no version markers).
- **Import rule.** No v2 file imports from any `legacy/`. Legacy files may
  import v2 files (e.g. legacy `SiteNav` imports the restyled
  `LanguageToggle` through `@/features/shell/ui/LanguageToggle.vue`); they
  are never rendered after 43 except `NotFoundContent`/`NotFoundRings`.
- **Barrel.** `index.ts` exports `SiteHeader`, `MobileMenu`, `SiteFooter`
  (v2) and keeps exporting `NotFoundContent` from its legacy path until 46.

## R2 · Brand marks: shared, not shell

- **Decision.** `Isotipo.vue`, `Wordmark.vue`, `Lockup.vue` and
  `SocialIcon.vue` are new v2 files in `app/shared/ui/` with stories under
  `Shared/UI/…`. The isotipo is an inline `<svg>` in the component, with the
  existing path geometry (`viewBox="14.5 38.5 70.5 39.5"`, circle `21,45,
  r 6.5`, path `M21 72a17 17 0 0 1 34 0 12 12 0 0 1 24 0`, stroke-width 12,
  round cap; Clarifications Q2, confirmed by Roberto 2026-11-01: the design's
  thinner stroke is not followed), stroke `currentColor` (Blanco via class) and
  the dot through a `fill-red-muush-500` class. `SocialIcon` inlines the
  three `app/assets/social/*.svg` (`?raw`, `fill="currentColor"`, CONFIRMED)
  and exports the `SocialNetwork` union that `data/types.ts` re-exports.
- **Rationale.** They are Kit primitives (isotipo `uUENh`), the v1
  counterparts were shared, and 46/48 pages may place the lockup. Inline SVG
  lets the two colours be tokens; the existing logo asset hardcodes v1 hex.
- **Alternatives.** Recolour `app/assets/logo/*.svg`: those are brand
  deliverables with v1 hex, used by other channels; left untouched.

## R3 · Section anchors in shared data

- **Decision.** `app/shared/data/sectionAnchors.ts` exports
  `SECTION_ANCHORS = { services: 'servicios', howWeWork: 'como-trabajamos',
  assessment: 'diagnostico', workWithUs: 'trabaja-con-muush' } as const`, the
  `SectionAnchor` type and the home/Nosotros grouping
  (`HOME_SECTION_ANCHORS`). The shell builds hashes as `#${id}`.
- **Rationale.** Shell, landing and about all need the ids; Article III only
  allows sharing through `app/shared/` or a barrel, and a data constant
  belongs in shared data.
- **v1 sections on the integration build.** `ContactSection` takes
  `:id="SECTION_ANCHORS.assessment"`, `WorkWithMuushSection` takes
  `SECTION_ANCHORS.workWithUs`, `ServicesSection` reads
  `SECTION_ANCHORS.services` (same value). `heroContent.ts` `contactHash`
  becomes `#${SECTION_ANCHORS.assessment}`. Their tests update the expected
  ids. The v1 404 keeps `#proposito` as a local constant in
  `data/notFound.ts` until 46. Five small edits outside the shell, accepted
  so no shell link misses its target on `muush-v2`.
- **Alternatives.** Leave v1 ids and accept that "Diagnóstico gratis" and
  "Trabaja con muush" open their pages at the top until 45/46: zero edits
  outside the shell, but the primary CTA visibly does nothing on the
  integration build.

## R4 · Header positioning and hide-on-scroll

- **Decision.** `SiteHeader` is `position: fixed` at the top, full width,
  with an inner container: desktop 1280 max (`max-w-contenedor`), 24 from
  the top; mobile inset by `--gutter`, 16 from the top. Hiding is
  `translateY(-140%)` plus `opacity: 0` (handoff `.is-oculto`), transitions
  at `--medio` with `ease-muush`; `--medio` is already 0 ms under reduced
  motion (feature 42 tokens), and the component also adds
  `motion-reduce:transition-none`. The existing
  `logic/useNavScrollReveal.ts` is reused unchanged in its rule (80 px zone,
  10 px anti-bounce, instant reveal upward, forced visible while the menu is
  open) and gains `reveal()` for FR-013, called on `focusin` of the header.
- **Rationale.** Fixed lets the hero backgrounds of 44/46 run under the
  header (`pen`: nav at y 24 over the 1000 px hero). The v1 composable
  already encodes the handoff `smartHeader` rule plus Roberto's
  anti-bounce (feature 26).
- **Menu containment.** The open menu is **not** a descendant of the
  header (R6), so a transform on the header can never contain it.

## R5 · Scroll to anchors under a fixed header

- **Decision.** `html { scroll-padding-top: var(--header-offset) }` with
  `--header-offset` = header top + height (76 px below `lg`, 88 px from
  `lg`, as rem tokens). `@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth } }`.
- **Evidence (CONFIRMED, `node_modules/nuxt/dist/pages/runtime/router.options.js`).**
  Nuxt's default `scrollBehavior` scrolls to `to.hash` with
  `top = element scroll-margin-top + html scroll-padding-top` and behaviour
  `router.options.scrollBehaviorType ?? 'auto'`. `auto` follows the CSS
  `scroll-behavior`, so the media query is what makes it smooth only when
  motion is allowed. No custom `router.options.ts` is needed.
- **Consequence.** `useMobileMenu.releaseScroll()` must restore the position
  with `window.scrollTo({ top, behavior: 'instant' })`; with smooth scrolling
  on `html` the current `scrollTo(0, y)` would visibly animate from the top.

## R6 · Mobile menu structure, focus and dialog semantics

- **Decision.** The layout renders `<SiteHeader>` and `<MobileMenu>` as
  siblings; both read the module-scoped `useMobileMenu()` (CONFIRMED,
  existing). While open: the header and the `main + footer` wrapper are
  `inert` (existing v1 pattern); the menu is `role="dialog"`
  `aria-modal="true"` with `aria-label` from `shell.menu.label`; focus goes to
  Cerrar on open; a small `useFocusTrap(container, active)` composable wraps
  Tab/Shift+Tab inside the menu (inert alone lets Tab escape to the browser
  chrome); on close `useMobileMenu` records the reason (`'dismiss' |
  'navigate'`) and `SiteHeader` returns focus to the menu button unless the
  reason is `navigate`.
- **Menu top bar.** The menu renders its own copy of the bar (isotipo,
  `LanguageToggle variant="mobile"`, Cerrar). Selecting the language in the
  menu closes it (existing `switchLocaleFromMenu` behaviour, kept).
- **Shader.** `<ShaderBackground preset="mobileMenu">` is inside `v-if="open"`
  so it mounts on open and releases its GL context on close (feature 42
  FR-024).
- **Rendering when closed.** `v-if` (not `visibility`) keeps the closed menu
  out of the prerendered HTML; the handoff's fade is a `<Transition>` on
  opacity at `--medio`, link stagger 0/40/80 ms, both 0 under reduced motion.

## R7 · The mobile-menu background preset without a poster

- **Decision.** `BackgroundPreset.poster` becomes optional
  (`poster?: string`); new preset `mobileMenu: { shader: 'liston', uniforms:
  { u_flip: 1, u_y0: 1.02, u_y1: 0.8, u_th: 0.06, u_amp: 0.03, u_tdark: 0 },
  priority: 'lazy' }`. `ShaderBackground` renders the `<img>` only when a
  poster exists; without one, the fallback is a transparent box (the menu's
  Negro 950 base shows).
- **Rationale.** Pen extract § 4: no poster in the handoff; inventing one is
  out of scope.

## R8 · Active nav state (scroll-spy, confirmed by Roberto 2026-11-01)

- **Decision.** `logic/useActiveSection.ts` observes, only on the home route
  and only after mount, the element with id `SECTION_ANCHORS.services` with an
  `IntersectionObserver` (`rootMargin` top = `-header offset`, bottom
  `-50%`, so "in view" means the section occupies the reading band). It
  returns `activeAnchor: Ref<SectionAnchor | null>`, `null` on the server, at
  the top and when the section is absent. `createShellItemResolver` gains an
  optional `activeAnchor` dependency: an anchor item is `current` when its
  route is the current route and its id equals `activeAnchor`. Route items
  keep `current` by route name. The 404 has no route name, so nothing is
  current (CONFIRMED in the resolver).
- **ARIA.** Route items: `aria-current="page"`. Section items:
  `aria-current="true"`.
- **Observed set.** Only anchors present in the link bar (today Servicios).
  If Roberto changes Q1 to static, the change is in this one composable.

## R9 · Nav CTA: no reveal, no 404 removal (Clarifications Q1)

- **Decision.** The shell stops calling `useNavCtaReveal`; `navCta` is always
  resolved, including on the error page. `useHeroSentinel` stays called by
  the v1 `HeroSection` until 44 replaces it; with no reader its flag is
  inert. Deleting `app/shared/logic/useNavCtaReveal.ts` is recorded for 44
  (last caller) or 47.
- **No-JS.** No `<noscript>` override is needed any more.

## R10 · Retiring dotted paper, spotlight and glows

- **Decision.** `default.vue` drops `<DotGrid>`, `<CursorSpotlight>` and
  `useCursorSpotlight`; the root keeps `relative isolate min-h-screen
  overflow-x-clip bg-negro-950` (vertical clip no longer needed: it existed
  for glows). Glows: the legacy `SectionBackdrop.vue` root gets `hidden`
  (`display: none`) with a comment citing this feature and Roberto's
  2026-11-01 decision; this removes every v1 glow at its single wrapper with
  no edit to the 6 v1 sections. The `--layer-*` tokens and the Spanish layer
  table in `global.css` are rewritten (advisory 3). `tests/static-output.test.ts`,
  the spotlight token test and any layout test that asserts the spotlight or
  dot grid are updated to assert their **absence**, with a comment: "supersedes
  feature 42 acceptance 'spotlight sigue funcionando' (Roberto 2026-11-01)".
- **Cursor.** The "You" cursor rules in `global.css` and `public/cursor/you.svg`
  are untouched; `tests/brand-cursor.test.ts` stays green.
- **Alternatives.** Leave glows until 44/46 (no edit to legacy code, but
  contradicts the feature description); remove `isolate` so the root
  background covers negative z-index glows (works by paint order, but is
  obscure and fragile).

## R11 · Fonts (Clarifications Q3, confirmed by Roberto 2026-11-01)

- **Decision.** `nuxt.config.ts` Poppins weights `[400, 500, 600]`; the
  config comment names the wordmark's "dev" run as the 400 user.
  `tests/static-output.test.ts` asserts the 400 face is emitted and no Google
  Fonts request exists.

## R12 · Favicon (Clarifications Q4, confirmed by Roberto 2026-11-01)

- **Decision.** In `public/favicon.svg` the circle's `fill` changes
  `#CF3147 → #E5352F` (Red muush 500) and the adaptive stroke moves to the
  v2 neutrals: `#262626 → #050505` (Negro 950, light chrome, the
  unconditional default) and `#FBF8F6 → #F4F4F2` (Blanco, dark chrome). The
  geometry and framing are unchanged; no v1 hex remains. The comment block
  records the source (`muush-1.0.md` § 2). A test pins the three colours,
  the unchanged path and the absence of the v1 values.

## R13 · Copy and i18n

- **Decision.** New keys under `shell.*` (nav, menu, footer, contact
  channels, legal, social labels) in both locales; v1-only keys that no v2
  or still-rendered legacy component reads are removed in both. Keys still
  read by the v1 404 (`shell.notFound.*`) stay. Copy is exactly
  `muush-1.0.md` § 4.1/4.7/4.9 and pen extract § 6. Existing values reused:
  WhatsApp message, social labels, `switchToEs/En`, `menu.open/close/label`.
- **CTA label.** `shell.nav.cta` changes to "Diagnóstico gratis" / "Free
  assessment".
- **Email.** Kept with the vue-i18n literal escape (`support{'@'}muush.dev`),
  CONFIRMED in `es.json`.

## R14 · Inherited 42 items

1. `useShaderCanvas.start()` wraps the dynamic shader import in `try/catch`
   and calls `fallBack()`; unit test with a rejecting loader.
2. `GlassButton` loses `size?: 'hero'`; its story/test adjusted if they pass it.
3. `global.css` comments at the layer table (R10).
4. Lockup/Wordmark/SocialIcon v2 (R2).
5. Manual review at 360/768/1024/1280/1920 and emulated forced colours of
   the 42 primitives and the new shell stories, recorded in the
   implementation report. A subagent without a browser marks it
   UNVERIFIED and the leader runs it.

## R15 · Tokens added

Named tokens in `global.css` (`:root` v2 block + `@theme inline`) for values
the 42 vocabulary lacks: header top offsets (24 / 16), header heights (64 /
60), header radius mobile 18, link-bar padding/gap 6, link item padding
10 / 18, active dot 6, right-group gaps 12 / 8, controls 36 and 40 (language
desktop), social 48 / 44, menu list offset 150 → expressed as spacing from
the bar, menu row padding 16, menu label 32, footer paddings
(72 80 40 80 / 48 24 32 24), footer gaps (56, 72, 14, 18, 10, 24, 8, 6),
contact row radius 14 and padding 14 / 16, footer type sizes (11, 13, 15,
17 → 20 tagline, 12 / 14 category), wordmark 22, header offset (76 / 88),
X icon 14 and stroke 1.6, burger line 16 × 1.5 / gap 4. Colours all map to
existing v2 tokens: Negro 900 45 % = `--nav-fondo`; Blanco 70 % =
`--texto-suave`; 12 % = `--linea`; 20 % = `--linea-fuerte`; 8 %, 15 % and
85 % Blanco and Negro 900 70 % (`--vidrio-fondo`) — new `blanco-8`,
`blanco-15`, `blanco-85` tokens only if absent (check `global.css` first).
Fluid `clamp()` between 390 and 1440 where a value differs between anchors
on the same element and the layout does not swap (e.g. tagline 17 → 20).
