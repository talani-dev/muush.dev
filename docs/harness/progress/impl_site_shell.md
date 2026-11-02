# Implementation summary: m1_site_shell (feature 43)

**Status after this work:** implementation complete, all 52 tasks in
`specs/043-site-shell/tasks.md` checked. `./init.sh` exit **0**
(typecheck, Biome, 131 test files / 1883 tests, generate, Storybook build).
`feature_list.json` not touched (status stays `in_progress`; the leader moves
it). Nothing committed. Branch `feat/v2-site-shell`.

> This file previously held only feature 3's report (v1 shell, 2026-09-07).
> That report is kept unchanged below this one, from the heading
> "Implementation summary: site_shell (feature 003)".

Evidence labels: **CONFIRMED** (measured in a browser, or read in the
repo), **DERIVED** (arithmetic from the pen extract), **UNVERIFIED**.

## 1 · Roberto's resolutions (2026-11-01), as applied

| # | Resolution | Where |
|---|---|---|
| 1 | Scroll-spy active state | `logic/useActiveSection.ts`, resolver `current: 'section'` |
| 2 | Nav CTA always shown (home top, 404) | `useShellNavigation` no longer reads `useNavCtaReveal`; build tests assert the CTA on every page and the 404 |
| 3 | Isotipo = the existing logo SVG geometry, stroke 12; only colours change | `app/shared/ui/Isotipo.vue` (Blanco stroke via `currentColor`, `fill-red-muush-500` dot) |
| 4 | Wordmark 600 / 600 / 400; Poppins 400 added | `Wordmark.vue`, `nuxt.config.ts`, font-face test; plan Complexity Tracking marked RESOLVED |
| 5 | Favicon: Red muush 500 dot, stroke Negro 950 (light) / Blanco (dark), no v1 hex, geometry kept | `public/favicon.svg` + test (asserts the three colours and the absence of `#262626`, `#FBF8F6`, `#CF3147`) |
| 6 | Preguntas hidden everywhere until 46 | not in `NAV_ITEMS`, `MENU_ITEMS`, the MUUSH column or the mobile links line |
| 7 | v1 ids → `#diagnostico`, `#trabaja-con-muush` | `ContactSection`, `WorkWithMuushSection`, `heroContent.contactHash` |
| 8 | v1 glows hidden now | `app/shared/ui/legacy/SectionBackdrop.vue` root gets `hidden` |

Spec package wording: every "provisional" in `spec.md`, `plan.md`,
`research.md`, `tasks.md` and `checklists/requirements.md` now reads
"confirmed by Roberto 2026-11-01"; FR-036 (logo SVG, not the thinner stroke),
FR-038, US7 #4, R12 and T043 (favicon stroke) were corrected for items 3 and
5; Clarifications Q2 and Q4 record the changed answers; the plan's Poppins
Complexity Tracking row is struck through as RESOLVED (Constitution 2.1.2).

## 2 · Files

**New, shared (`app/shared/`):** `data/sectionAnchors.ts` (+test);
`ui/Isotipo.vue`, `ui/Wordmark.vue`, `ui/Lockup.vue`, `ui/SocialIcon.vue`
(each + test + story under `Shared/UI/`).

**New, shell (`app/features/shell/`):** `data/contactChannels.ts` (+test),
`data/navigation.test.ts`; `logic/useFocusTrap.ts`, `logic/useActiveSection.ts`
(+tests); `ui/SiteHeader.vue`, `NavLinkBar.vue`, `MenuButton.vue`,
`MobileMenu.vue`, `SiteFooter.vue`, `FooterColumns.vue`, `MobileFooter.vue`,
`SocialLinks.vue`, `ShellItemLink.vue` (each + test + story under `Shell/`);
`ui/shellFixtures.testing.ts` (story/test fixtures, same convention as
`localePreference.testing.ts`).

**Moved with `git mv` to `app/features/shell/ui/legacy/`** (stories stay under
`Legacy v1/Shell/`): `SiteNav`, `MobileMenu`, `SiteFooter`, `FooterColumn`,
`NotFoundContent`, `NotFoundRings` (`.vue`, `.stories.ts`, `.test.ts`). Only
edits: `LanguageToggle` import → `@/features/shell/ui/LanguageToggle.vue`;
`current: true` → `'page'` in three fixtures; `close` → `close()` bindings in
legacy `SiteNav` (new optional `reason` parameter).

**Rewritten / edited:** `layouts/default.vue`; shell `index.ts`, `data/types.ts`,
`navigation.ts`, `footerColumns.ts`, `notFound.ts`, `logic/useShellNavigation.ts`,
`useShellItemResolver.ts`, `useMobileMenu.ts`, `useNavScrollReveal.ts`,
`ui/LanguageToggle.vue` (look only); shared `backgroundPresets.ts`,
`ShaderBackground.vue`, `useShaderCanvas.ts`, `GlassButton.vue`,
`ShaderBackground.stories.ts`, `legacy/SectionBackdrop.vue`;
`assets/css/global.css`; `i18n/locales/{es,en}.json`; `nuxt.config.ts`;
`public/favicon.svg`; landing `ContactSection.vue`, `ServicesSection.vue`,
`heroContent.ts`, `HeroSection.stories.ts`; about `WorkWithMuushSection.vue`;
tests `static-output`, `not-found-output`, `shell-copy`,
`spotlight-red-dots-tokens`, `token-literals`; `docs/harness/findings.md`
(R75, R76). Largest component: `MobileMenu.vue` 187 lines, `LanguageToggle.vue`
182, `SiteHeader.vue` 150; all under 200.

## 3 · Deviations and why

1. **One responsive header row, one `LanguageToggle`.** Contract § 3 implied a
   mobile bar and a desktop row; § 2 gave the toggle `variant: 'desktop' |
   'mobile'`. Built as one row that swaps arrangement at `lg`, and the toggle
   variants are `header` (36 × 36 below `lg`, 40 × 40 glass pill from `lg`)
   and `menu`. Reason: one home link, one toggle link and one `<nav>` per
   document; feature 21's build test counts exactly one `hreflang` link per
   page, and keeping it unchanged in meaning was required.
2. **`ShellItemLink.vue`** (not in the contract): the external / internal /
   text rendering both footers need, written once (Article VIII DRY).
3. **Token names.** `--spacing-isotipo` and `--spacing-menu-gap` already exist
   in the v1 theme; a later key with the same name would have resized v1
   components. Named `isotipo-ancho` and `menu-filas` instead.
4. **Link-bar line height 1.2** (DERIVED): with the font's `normal` line box
   Chrome measured items 39 and the bar 51; the extract gives 50, so the line
   is 50 − 12 − 20 = 18 px = 1.2 × 15. Wordmark line height 31 / 22 = 1.4091
   (DERIVED from the 176 × 31 lockup).
5. **Menu vertical rhythm** (DERIVED): rows on Poppins 32's own line box (48,
   row 80); divider 38 below the list and social row 39 below the divider
   reproduce y 440 / y 480 with three rows. With Preguntas hidden the measured
   divider is at 354 = 440 − 86 (one row + gap), social at 394.
6. **Footer column gap** fluid 40 → 72 between 1024 and 1440 (72 overflowed
   the 864 px content box at 1024). Responsive latitude; 1440 measured 72.
7. **`mt-section-gap` kept above the footer** (v1-era spacing, not a
   quarantined family): without it the v1 contact panel and Work with muush
   form touch the footer's rule. Commented for 44–46 to drop.
8. **CTA `aria-current` cleared.** `NuxtLink` marks `/es#diagnostico`
   "current page" on `/es` (route match ignores the hash). Found in the
   generated HTML; recorded as findings.md § R75.
9. **The menu's language toggle also closes the menu** (`itemChosen`) when it
   navigates, and the layout closes the menu on any route change. v1 only
   closed it for the 404 in-place switch (US2 #6 asks for it always).
10. **No hover styles** on nav, footer or menu links: the extract draws none.
11. **Mobile tagline tracking** is 0 at 390 (not given), fluid to −0.4 at 1440.
12. **Footer line heights** use the existing 1.5 text tokens (15 / 22.5,
    13 / 19.5, 12 / 18); the extract gives no line heights, so footer block
    heights are UNVERIFIED against the `.pen`.

## 4 · Gap for the leader (value missing from the extract) — resolved

- **Social glyph size inside the 48 × 48 (menu) and 44 × 44 (mobile footer)
  buttons.** The `.pen` draws text glyphs; Roberto chose the real SVGs, so
  there is no value to extract. `--spacing-red-glifo: 1.25rem` (20 px) is the
  leader's decision (pen extract-43 § 10), no longer UNVERIFIED; Roberto may
  change it, and the change is that one value in `global.css`.

## 5 · Checks (real output)

```
./init.sh → EXIT=0
[OK] pnpm typecheck
[OK] pnpm check            Checked 376 files … No fixes applied.
[OK] pnpm test             Test Files 131 passed (131) · Tests 1883 passed (1883)
[OK] pnpm generate
[OK] pnpm storybook:build
[OK] Environment ready.
```

Baseline before the feature: 113 files / 1699 tests.

**SC-003 (features 21/33/37/39 not regressed):** `git diff --stat` on
`localePreference.test.ts`, `switchLocaleInPlace.test.ts`,
`resolveLocaleDestination.test.ts`, `notFoundLocale.test.ts`,
`useNotFoundDocument.test.ts`, `tests/locale-preference-output.test.ts` is
empty. `LanguageToggle.test.ts`: only class assertions changed plus one new
`menu`-variant class test. In the build tests, the locale-equivalence,
toggle-href, one-toggle-per-page and 404 in-place assertions are unchanged.

**Mutation check (FR-045):** removing the new `try/catch` in
`useShaderCanvas.start()` makes the new test fail (verified, then restored).

**Build tests rewritten with supersession notes:** the dotted-paper,
spotlight, ink-500 footer, sticky-nav, CTA-reveal/noscript and nav-height-parity
assertions now assert their absence or the v2 shell, each citing feature 43 /
Roberto 2026-11-01 (spotlight: "supersedes feature 42 acceptance 'El cursor
personalizado y el spotlight siguen funcionando' for the spotlight").
`tests/brand-cursor.test.ts` is unchanged and green ("You" cursor).

## 6 · Browser verification (headless Chrome 156 over CDP)

Served `.output/public` with `python3 -m http.server` (404 checked at
`/es/404/`, findings § R76) and `storybook-static`. Scripts lived in
`/tmp/cdp43/`; the servers and Chrome were stopped afterwards.

**Anchors (SC-001) — CONFIRMED:**

| Element | Target | Measured |
|---|---|---|
| Desktop nav (1440) | 1280 × 64 at x 80, y 24 | 1280 × 64 at 80, 24 |
| Lockup | 176 × 31 | 175.3 × 31 (isotipo 40 × 22.4, wordmark 125.3 × 31) |
| Link bar | 50 tall, items 38 | 50, items 38 (2 items: 216.9 wide ES, 192.9 EN; +14 with the active dot) |
| Language (1440) | 40 × 40, gap 12 to CTA | 40 × 40, gap 12 |
| CTA | 195 × 40 | 194.3 × 41 (feature 42 primitive, same as its 42 measurement) |
| Mobile bar (390) | 342 × 60 at 24, 16 | 342 × 60 at 24, 16 |
| Isotipo (390) | 40 × 22 | 40 × 22.4 |
| Language / menu (390) | 36 × 36 | 36 × 36 / 36 × 36 |
| Menu list | starts y 150 | 150; rows 80; Poppins 500 32px |
| Menu social | 48 × 48, gap 12 | 48 × 48 |
| Footer 1440 | padding 72 80 40 80, gap 56, brand 340, cols gap 72, tagline 20 / −0.4 | exactly those (tracking −0.39984 px) |
| Footer 390 | padding 48 24 32 24, gap 24, rows 342 wide radius 14 padding 14/16, social 44, gap 10 | exactly those |

`document.fonts.check('400 22px Poppins')` true; "dev" renders Poppins 400.

**Menu (US3, SC-004) — CONFIRMED** at 390 with and without reduced motion:
opened from the keyboard (Enter on the focused menu button); focus on
"Cerrar menú"; Tab cycled Servicios → Nosotros → LinkedIn → Instagram → TikTok
→ Inicio → idioma → Cerrar and never left; Shift+Tab wrapped backwards;
`role=dialog`, `aria-modal=true`, label "Menú"; header and content `inert`;
body `position: fixed; top: -600px`; `scrollBy` behind it left `scrollY` 0;
Esc closed it, focus returned to "Abrir menú", `scrollY` back to exactly 600.
Link entrance 0.32 s / 40 ms stagger, 0 s under reduced motion. Choosing
Servicios from `/es/nosotros` closed it and landed on `/es#servicios` with the
section top at 76 (header bottom). The menu's language button went to
`/en#servicios`, wrote `muush_locale=en`, closed the menu. Resizing to 1280
with it open closed it and released the lock. Shader canvas present, no
poster. At 360 × 640: no horizontal or vertical overflow.

**Header hide/reveal (US4) — CONFIRMED** at 1440: visible at 60 and 70; hidden
after +15 px past 80; any upward scroll (5 px) revealed it; `--medio` 0.32 s,
0 s with reduced motion (instant). Keyboard Tab onto a hidden header's first
control revealed it at 1440 and 390 (needs page focus;
`Emulation.setFocusEmulationEnabled`).

**Scroll-spy (US5) — CONFIRMED** on `/es` at 1440 (band 88 px → 50 %): nothing
at the top; `aria-current="true"` + dot on Servicios with the section's top at
88, at 300, and covering the band; nothing with its top at 460 or past the
section; still working after client navigation home → Nosotros → home.
Nosotros on About: `aria-current="page"` + dot. 404: nothing; CTA present.

**Jumps (FR-014) — CONFIRMED:** Servicios, "Diagnóstico gratis" and
"Trabaja con muush" land with the target's top at 88 (desktop header
bottom); "Cómo trabajamos" opens `/es` at its top (no section yet), no 404.

**Language (US2) — CONFIRMED:** `/es#servicios` → `/en#servicios` + cookie;
`/es/nosotros` → `/en/about` (`lang=en-US`); `/es/404/` switched in place
(URL unchanged, English headline, toggle "EN").

**Widths (SC-002) — CONFIRMED** at 360, 390, 768, 1023, 1024, 1280, 1440,
1920 on `/es/`, `/en/about/`, `/es/404/`: `scrollWidth == innerWidth`, no
overlap between the header slots, nothing outside the row, no wrapped link,
no clipped or overlapping footer content. Screenshots reviewed at 1024
(header and footer fit; footer gap 40).

**No JavaScript — CONFIRMED** (script execution disabled): header, CTA and
all 23 footer links render; no menu button. **Print:** header `display: none`.

**Forced colours — CONFIRMED by screenshot** (emulated `forced-colors:
active`): mobile bar, link bar (CanvasText outline from `borde-luz`),
language, menu/close, CTA, social and contact rows keep a visible boundary and
readable labels; the html cursor yields to `auto`. Observations, not defects
under the spec's edge case: the decorative red dots (active link, pill) and the
menu divider (painted as a background) disappear, so the active link relies
on `aria-current` there. Owner: leader / Roberto, if wanted.

**FR-049 (review-42b advisory 7) — CONFIRMED:** 125 `Shared/UI/*` and
`Shell/*` stories × 360, 768, 1024, 1280, 1920 × normal and forced colours =
1250 renders: no render error, no horizontal overflow, no clipped text. The
only flag was `Shell/FooterColumns` (a desktop-only part) at 360, which widens
its frame; not a defect (it only renders from `lg`). Forced-colour screenshots
of PrimaryButton, GlassButton, Pill, GlassSurface, RotatingPill, Heading:
boundaries and labels visible.

**Not checked in a browser (UNVERIFIED):** a real screen reader; Safari and
Firefox; a real GPU-less device (WebGL refusal was simulated in the
`OpenEsWithoutWebGl390` story only); whether `html { scroll-behavior: smooth }`
makes the scroll-to-top on page-to-page navigation visibly animate (it
follows CSS `auto` → smooth when motion is allowed; jumps measured correct).

## 7 · Review-42b follow-ups (SC-008)

| Advisory | Item | Status |
|---|---|---|
| 1 | Shader chunk rejection → fallback, no unhandled rejection | **Fixed** (`useShaderCanvas.ts` try/catch; test + mutation check) |
| 2 | Unused `size` prop on `GlassButton` | **Fixed** (removed; test asserts no `size` prop) |
| 3 | Stale `global.css` comments (ink-500 base, layer stack) | **Fixed** (layer table rewritten for the Negro 950 canvas; `--layer-glow/dots/spotlight` marked v1-only for 47; canvas comment updated) |
| 5 | v2 Lockup / Wordmark / social icon | **Fixed** (`Shared/UI/{Isotipo,Wordmark,Lockup,SocialIcon}`; v1 ones stay in `legacy/` until 47) |
| 7 | Primitives at 360–1920 and forced colours | **Done, pass** (§ 6) |

## 8 · Notes for the reviewer and the leader

- The v1 hero text sits close under the floating header on phones (seen at
  390, as the spec's "What changes visually" predicts); 44/46 replace it.
- `useNavCtaReveal` / `useHeroSentinel` remain (v1 Hero still calls the
  sentinel); delete with 44 or 47 as the spec says.
- `<main>` keeps `max-w-shell-max px-page` per contract § 10.
- Nothing in the files read looked like injected instructions.
- Technical findings for other features: `docs/harness/findings.md` § R75
  (NuxtLink `aria-current` on same-page hash links, relevant to 44–46's CTAs)
  and § R76 (serving `.output/public` locally and the 404).

## Reopened 2026-11-01 · Home link + shader defaults

Reopened after Roberto's Storybook review (`feature_list.json`, "REABIERTA
2026-11-01"). `./init.sh` exit **0** (typecheck, Biome, 133 test files / 1921
tests, generate, Storybook build). Nothing staged or committed;
`feature_list.json` not touched.

### B · Animated backgrounds (fixed first)

**Root cause — CONFIRMED.** `useShaderCanvas` sent `withShaderDefaults(preset.uniforms)`,
which is only the engine base (`u_speed`, `u_flip`, `u_grain`) plus the
preset. Any uniform a preset omits was never set, and WebGL leaves an unset
uniform at **0**. The presets omit:

| Preset | Omitted uniforms → `@default` |
|---|---|
| homeHero, aboutHero | `u_y0` 0.98, `u_y1` 0.5, `u_amp` 0.07, `u_th` **0.1**, `u_twist` 0.6, `u_fadeT` 0 |
| howWeWork, faq, notFound | `u_ribs` **46**, `u_refract` 0.05 |
| mobileMenu | `u_tx` 0.5, `u_ty` 0.48, `u_trx` 0.36, `u_try` 0.3, `u_twist` 0.6, `u_fadeT` 0, `u_fadeB` 0 |
| assessment, workWithUs | none (these were already right) |

So `u_th = 0` gave the hero listón zero thickness, and `u_ribs = 0` removed
the acanalado's ribs. The poster showed until the first frame, then the
canvas covered it with the broken frame: the flash Roberto saw. The comment
in `backgroundPresets.ts` already claimed omitted uniforms took the `@default`.
It was wrong.

**Fix.**
- `app/shared/utils/shaderUniformDefaults.ts` adds `readShaderDefaults(source)`.
  It is the port of the handoff's `MuushGradient.defaults()`, with the same
  pattern: a `/** … */` doc comment directly before a `uniform float`, then
  `@default <number>`. A non-finite value is skipped.
- `withShaderDefaults(uniforms, shaderDefaults = {})` in `shaderFrame.ts` now
  returns `{ ...shaderDefaults, ...SHADER_DEFAULTS, ...uniforms }`. That is
  the handoff constructor's order: shader `@default`, then the engine base,
  then the preset.
- `useShaderCanvas.start()` reads the defaults once from the loaded source.
  `draw()` passes them on every frame.
- The `backgroundPresets.ts` header comment now describes what really
  happens and why.

**Tests.**
- `shaderUniformDefaults.test.ts` (new): parser cases, plus both real `.glsl`
  files read from disk. It pins two things:
  - a missing uniform takes its `@default`: homeHero `u_th` 0.1, `u_y0` 0.98,
    `u_twist` 0.6; howWeWork `u_ribs` 46, `u_refract` 0.05;
  - an explicit preset value wins: howWeWork `u_th` 0.15, `u_right` 0.45,
    `u_y0` 0.52. The engine base also wins over a `@default`.
- `useShaderCanvas.test.ts` adds a test that the drawn homeHero uniforms
  carry the listón geometry from `liston.glsl`.

**Browser evidence — CONFIRMED.**
- **Setup:** headless Chrome 156 with SwiftShader WebGL (`ANGLE (Google,
  Vulkan 1.3.0 (SwiftShader Device …))`), reading `storybook-static` and
  `.output/public` served locally. The page is 1440 × 900, at DPR 1, under
  reduced motion (the still frame at t = 12).
- **What was compared:** only the background is visible (text hidden). The
  canvas was captured, then the poster with the canvas hidden. Both were
  compared on a 144 × 90 luminance grid.
- **Control:** a page script makes `getUniformLocation` return `null` for
  the omitted uniforms. This reproduces the old zeros exactly.
- **Rib count:** the dominant spatial frequency of the column profile in
  the brightest rows.
- Scripts and captures are in `/tmp/cdp43b/`.

| Preset (story) | canvas | corr. with poster: fixed / old | mean luminance fixed / old / poster | ribs (cycles per width) fixed / old / poster |
|---|---|---|---|---|
| homeHero ES | ready, 1440×1000 | **0.675** / 0.109 | 0.073 / **0.018** / 0.066 | — (listón drawn; old frame black) |
| homeHero EN | ready | **0.672** / 0.109 | 0.074 / 0.018 / 0.066 | — |
| howWeWork | ready, 1440×900 | 0.880 / 0.877 | 0.060 / 0.044 / 0.059 | **45.5** / none (peak 14× weaker) / ribbed |
| assessment | ready | 0.765 / 0.765 (nothing omitted) | 0.098 / 0.098 / 0.098 | — |
| aboutHero | ready, 1440×820 | **0.670** / 0.085 | 0.063 / 0.018 / 0.058 | — |
| workWithUs | ready | 0.765 / 0.765 (nothing omitted) | 0.098 / 0.098 / 0.098 | — |
| faq | ready, 1440×1100 | 0.702 / 0.695 | 0.048 / 0.036 / 0.043 | **46.6** / none (42× weaker) / 46.6 |
| notFound | ready, 1440×760 | 0.714 / 0.701 | 0.039 / 0.030 / 0.039 | **46.6** / none (18× weaker) / 46.6 |

**What the captures show.**
- **Hero listón:** the old frame is fully black, which is the reported bug
  reproduced. The fixed frame draws the brasa-to-acero listón rising from
  the lower left to the right, the same as `hero-liston.webp`.
- **Acanalado** (Cómo trabajamos, Preguntas, 404): the old frame is a smooth
  band with no divisions. The fixed frame has the dark rib divisions, about
  46 across, matching the posters.
- **Correlation:** below 1 because the still frame (t = 12) is not the
  instant the posters were rendered at. The listón's twist sits elsewhere.
  The fixed and old acanalado scores are close because the ribs are
  high-frequency detail the 144 × 90 grid averages away. The rib-frequency
  column is the measurement for them.
- **Motion** (without reduced motion): two homeHero frames 1 s apart differ.
  The loop runs.

**mobileMenu — CONFIRMED drawn, design match UNVERIFIED.**
- Measured at 390 × 844 in both Storybook stories (ES, EN) and on real pages
  with the menu opened: `/es/` and `/en/about/`.
- The canvas reaches `ready` at 390 × 844 in all four.
- The menu already drew before the fix. What changes is `u_twist`: 0 became
  0.6. The old listón was red end to end; it now turns from brasa to acero,
  as the other listóns do.
- The handoff ships no poster for this preset, so the result could not be
  compared with a reference image. The leader can check it against the `.pen`
  frames `chQ4f` / `QpUCy`.

**On a page.**
- No page mounts homeHero, howWeWork or the other section presets yet.
  Features 44–46 build those sections.
- The only shader on a real page today is the mobile menu, verified above.
- The section presets were verified in Storybook, which runs the same
  component and composable.

### A · Home link

**Data.**
- `ShellDestination` gains `{ kind: 'top'; name }`, the top of a route's
  page.
- `NAV_HOME` (`shell.nav.homeLink`) comes first in `NAV_ITEMS`, and so in
  `MENU_ITEMS`.
- `FOOTER_DESTINATIONS.home` with `shell.footer.nav.home` comes first in
  NAVEGACIÓN and in `MOBILE_FOOTER_LINKS`.
- i18n: `shell.nav.homeLink` and `shell.footer.nav.home` read "Inicio" (ES)
  and "Home" (EN). `shell.nav.home` is still the logo's accessible name, and
  the logo is unchanged.

**Logic.**
- Resolver: a `top` item resolves through `localePath({ name })`, the route
  map. It is `current: 'page'` only on its own route while `atTop()` is true.
  It also carries `scrollsToTop: true`.
- `useShellNavigation` passes `isHome && atTop`, so the 404 never lights it,
  even under `/es`.
- `useActiveSection` returns `atTop`: true when no spied section is in the
  band and none has been scrolled past.
  - "Scrolled past" uses a second observer whose root runs from the band's
    top to `10000%` below.
  - The reading band alone missed a jump from the bottom of the page to the
    top. Measured: with one observer, Home stayed unlit after
    `scrollTo(0)` from the footer, because the jump never crosses the band.
  - SSR state: `atTop` is true, so the prerendered home page shows "Inicio"
    lit. The first client render agrees, so there is no hydration flash.
- `logic/scrollToTopIfCurrent.ts`: vue-router treats a link to the URL
  already shown as a duplicated navigation, and Nuxt's scroll behaviour
  returns `false` for the same path with no hash. Without this, "Inicio"
  clicked on `/es` after scrolling down did nothing.
  - `NavLinkBar`, `MobileMenu` and `ShellItemLink` call it for
    `scrollsToTop` items only. All other links behave as before.
  - In the menu it runs after `itemChosen`, so the layout releases the
    scroll lock first.

**UI.** No new component and no style change: the Home item uses each
place's existing item styling, with the 6 px Red muush 500 dot in the link
bar when active. Line counts: `MobileMenu.vue` 197, `NavLinkBar.vue` 61.

**Browser — CONFIRMED** (same Chrome, `.output/public`):

| Check | ES | EN |
|---|---|---|
| Bar order and href | Inicio `/es` · Servicios `/es#servicios` · Nosotros `/es/nosotros` | Home `/en` · Services · About |
| Home top (prerendered + client) | Inicio `aria-current=page` + dot | Home lit |
| 300 px down, before Servicios | Inicio lit | — |
| Servicios in the band | only Servicios (`aria-current=true`) | only Services |
| Page bottom | nothing lit | nothing lit |
| Instant jump back to the top | Inicio lit | Home lit |
| Click Home on home at y 2000, no hash | `scrollY` 0, Inicio lit | same |
| Click Home after `#servicios` | `/es`, `scrollY` 0 | `/en`, 0 |
| Nosotros / About | only Nosotros lit; Home → `/es`, y 0, `lang es-MX`, Inicio lit after client nav | `en-US`, same |
| 404 (`/es/404/`, `/en/404/`) | nothing lit; first item Inicio `/es` | Home `/en` |
| Footer NAVEGACIÓN / NAVIGATION | Inicio · Servicios · Cómo trabajamos · Nosotros | Home · Services · How we work · About |
| Mobile footer line (390) | Inicio · Servicios · … | — |
| Menu (390), Home chosen on `/es/` at y 1500 | menu closed, lock released, `scrollY` 0 | items Home · Services · About |
| Link bar (1440 and 1024) | 310.1 × 50, items 87 / 99 / 100, no overlap, no horizontal scroll | — |

**Regressions — CONFIRMED.**
- The toggle on `/es/` has href `/en`. A click lands on `/en` with
  `lang=en-US`, writes the cookie `muush_locale=en`, and Home is lit there.
- The 404's in-place switch still works: the URL stays `/es/404/`, `lang`
  becomes `en-US`, the first item reads "Home" `/en`, and nothing is lit.

**Tests and stories, both locales.**
- **Tests** cover:
  - the data order, in `navigation`, `footerColumns` and `contactChannels`;
  - the resolver's `top` cases: home at top, left the top, another page, the
    404, no signal, and `scrollsToTop` set on the Home item only;
  - `useActiveSection` `atTop`, including the jump case and the two-observer
    disconnect;
  - `scrollToTopIfCurrent`;
  - the components: `NavLinkBar` ES/EN with the lit dot, `FooterColumns`
    ES/EN, `MobileFooter` ES/EN, and `MobileMenu` (order, plus close then
    scroll).
- **Fixtures** (`shellFixtures.testing.ts`) start with Home in both locales.
- **Stories:**
  - `NavLinkBar` adds `HomeTopEs` and `HomeTopEn`;
  - `SiteHeader` adds `EsHomeTop1440` and `EnHomeTop1440`;
  - the existing "Servicios in view" and "About page" stories moved to the
    new indices.
- **Build tests:**
  - `tests/static-output.test.ts` now expects only Inicio / Home lit on the
    landing pages.
  - `tests/not-found-output.test.ts` folds the active style back to the
    inactive one before comparing the 404 header with the home header.
    Separately, it asserts no `data-punto` and no `aria-current` on the 404.

**Spec package.**
- A dated "Amendment 2026-11-01 — Home link added by Roberto 2026-11-01"
  was appended to `spec.md`, `plan.md`, `data-model.md`,
  `contracts/components.md` and `tasks.md` (T053–T058, checked).
  - `spec.md` has FR-052…FR-056 (renumbered by the leader after review-43b).
  - It also marks the "no Home item" settled decision as superseded.
- `specs/042-m1-visual-foundation/` was **not** edited. Its contract still
  shows the one-argument `withShaderDefaults`, and its research says omitted
  uniforms take the `@default`, which is now true. The leader can decide
  whether a closed feature's package gets a note.

### Notes for the leader

- **Behaviour choices the leader may want Roberto to confirm:**
  - Home is lit anywhere above Servicios, not only at `scrollY` 0.
  - Home stays unlit at the bottom of the page.
  - Home scrolls to the top when clicked on its own page.
- **The logo was left as is.** Clicked on `/es` after scrolling down with no
  hash, it still does nothing, the same as before this cycle. Giving it
  `scrollToTopIfCurrent` is one line if wanted.
- **Checks:** `pnpm typecheck` OK, `pnpm check` OK (380 files),
  `pnpm test` 133 files / 1921 tests, `pnpm generate` OK,
  `pnpm storybook:build` OK. `./init.sh` exit 0.
- **Processes:**
  - I started two `python3 -m http.server` instances (4173, 4174) and one
    headless Chrome (9333), and stopped all three.
  - A `pnpm storybook` dev server on 6006 that I did not start was left
    untouched.
- Nothing in the files or tool output read this cycle looked like injected
  instructions.

## Reopened 2 · 2026-11-01 · Static grain

Two changes from Roberto, both in `feature_list.json` "REABIERTA 2":
acceptance item 3 (static grain) and item 4 (header logo is the isotipo
only). Spec 043 gained FR-057, FR-058 and FR-059 in two dated amendments.

### A · Static grain (FR-057, FR-058)

**Diff — CONFIRMED with `git diff` and `diff` against the handoff.**
- In `app/assets/shaders/liston.glsl` and `app/assets/shaders/acanalado.glsl`,
  the `finish()` line changes in one place only:
  `hash(gl_FragCoord.xy+fract(u_time*7.0)*91.0)` → `hash(gl_FragCoord.xy)`.
- A four-line `//` comment above `finish()` records the divergence from
  `docs/handoff/muush-1.0/shaders/m1-*.glsl` (Roberto, 2026-11-01). It is a
  line comment, so `readShaderDefaults` (which reads only `/** */` comments
  placed before a `uniform float`) is unaffected.
- `diff` against the handoff shows exactly that hunk (line 79 → 79–83) for
  each file. Nothing else changed.
- The plain coordinate was kept, with no constant offset. The single-frame
  grain spectrum has the same periodic peaks as the handoff's own frame
  (peak/median 5487 fixed vs 5820 control on homeHero), so there is no new
  banding. A contrast-stretched crop shows uniform noise.
- Byte-identical claims updated so none remains:
  - `app/shared/data/backgroundPresets.ts` (the `SHADER_SOURCES` comment);
  - `specs/042-m1-visual-foundation/research.md` R8 (dated amendment);
  - `specs/042-m1-visual-foundation/plan.md` (the two tree lines);
  - `specs/042-m1-visual-foundation/tasks.md` T001 (`cmp` now reports the
    one line).
- No test compared the shaders with the handoff: tests may not read `docs/`.

**Test.** `app/shared/data/backgroundPresets.test.ts`, describe
`shader grain`, one case per shader. It reads the real `.glsl` from disk and
checks three things in the `finish()` line:
- the grain term `col+=(hash(…)-0.5)*u_grain;` is still there;
- its hash argument is exactly `gl_FragCoord.xy`;
- the line does not contain `u_time`.

On the handoff source the regex does not match (nested parentheses), so the
test fails there. `u_grain` 0.07 stays pinned by `shaderFrame.test.ts`
(`SHADER_DEFAULTS`).

**Browser evidence — CONFIRMED.**
- **Setup:** headless Chrome with SwiftShader WebGL (`ANGLE (Google, Vulkan
  1.3.0 (SwiftShader Device (LLVM 10.0.0)))`), on `storybook-static` served
  locally. Stories `shared-ui-shaderbackground--home-hero` and
  `--how-we-work`, 1440 × 900, DPR 1.
- **Motion:** on (`prefers-reduced-motion: no-preference`, confirmed by
  `matchMedia`). Only the canvas is visible, and both canvases reported
  `ready`.
- **Captures:** after 1.5 s, frame a, then frame b about 1 s later.
- **Control:** the same build, with a page script that rewrites the shader
  source back to the handoff's `fract(u_time*7.0)` seed at `shaderSource`.
- **Metrics:** high-pass = luminance minus its 5 × 5 box mean, which keeps
  the grain and drops the motion. Measured over non-black pixels.

| Story | Mode | Grain in one frame (σ of high-pass, 0–255) | High-freq. difference a−b (σ) | High-pass corr. a~b | Large-scale \|a−b\| (15 px mean) |
|---|---|---|---|---|---|
| homeHero | fixed | 4.57 | **0.28** | **+0.998** | 2.21 |
| homeHero | control (handoff) | 4.83 | 6.33 | +0.148 | 2.67 |
| howWeWork | fixed | 4.63 | **0.43** | **+0.996** | 1.45 |
| howWeWork | control (handoff) | 5.01 | 6.27 | +0.211 | 2.08 |

What this shows:
- **The grain no longer flickers.** The frame-to-frame high-frequency
  difference falls from about 6.3 to 0.3–0.4 levels. The residue is the
  motion's own fine detail.
- **The grain is still there.** One frame still carries about 4.6 levels
  of grain, as the handoff does (about 4.8–5.0). That fits
  0.07 × 255 / √12 ≈ 5.2, less what `clamp` eats near black.
- **The background still moves.** The large-scale difference is non-zero
  in both modes.
- **The listón still draws.** The homeHero frame shows the brasa-to-acero
  ribbon rising from the lower left to the right, as in reopen 1.
- **The acanalado ribs are still there.** The dominant column frequency of
  howWeWork is 46.6 cycles per width in both frames (peak/median 13 867 and
  10 234), the same as reopen 1.

Captures and scripts are outside the repo, in a temporary directory.

### B · Header logo isotipo-only (FR-059)

- `app/features/shell/ui/SiteHeader.vue`: the two width-gated spans
  (isotipo below `lg`, full lockup from `lg`) are now one
  `<Lockup form="isotipo" />`, with a comment citing Roberto 2026-11-01. The
  footers (`SiteFooter.vue`, `MobileFooter.vue`) are untouched and keep the
  full lockup.
- **Accessible name:** the existing key `shell.nav.home` is reused on the
  link's `aria-label` ("Inicio de muush" / "muush home"). No i18n change.
  - INFERRED: the task's "muush.dev — Inicio" was an example, and the
    instruction was to reuse a key if one exists.
  - If Roberto wants the "muush.dev — …" wording, it is a two-value change
    in `es.json` / `en.json`.
- **Tests:**
  - `SiteHeader.test.ts`: the header now renders exactly one `Lockup` with
    `form="isotipo"` and no `Wordmark` (replaces "isotipo below lg, full
    lockup from lg").
  - `tests/static-output.test.ts` (new case): on `/es`, `/en`,
    `/es/nosotros` and `/en/about`, the generated header logo link carries
    the i18n `aria-label` and an `<svg>`, and has no wordmark
    (`text-marca`), while the footer still has it.
- **Stories:** the `SiteHeader.stories.ts` doc comment now says isotipo
  40 × 22 at 1440. The existing ES/EN × 1440/390 stories show the change
  without edits.

**Browser — CONFIRMED** (same Chrome, `.output/public` and
`storybook-static`):

| Where | Width | Logo link | Isotipo | Wordmark in header | Footer wordmark visible | `aria-label` |
|---|---|---|---|---|---|---|
| `/es/` | 1440 | 40 × 22.4 | 40 × 22.4 | no | "muush.dev" | Inicio de muush |
| `/en/` | 1440 | 40 × 22.4 | 40 × 22.4 | no | "muush.dev" | muush home |
| `/es/` | 390 | 40 × 22.4 | 40 × 22.4 | no | "muush.dev" | Inicio de muush |
| `/en/` | 390 | 40 × 22.4 | 40 × 22.4 | no | "muush.dev" | muush home |
| SiteHeader stories ES/EN 1440 and 390 | — | — | 40 × 22.4 | no | — | as above |

- There is no horizontal scroll: `scrollWidth` equals the viewport at 390
  and at 1440.
- The 1440 capture shows the isotipo at the left, the link bar still
  centred, and the language toggle and CTA at the right.

### Checks

- `./init.sh` exit 0: `pnpm typecheck` OK, `pnpm check` OK,
  `pnpm test` 133 files / 1924 tests, `pnpm generate` OK,
  `pnpm storybook:build` OK.
- The new static-output case was re-run against the fresh `.output`.
- **Processes:**
  - I started two `python3 -m http.server` instances (4173, 4174) and one
    headless Chrome (9333), and stopped all three.
  - The `pnpm storybook` dev server on 6006 was not started by me and was
    left untouched.
- Nothing was staged or committed.
- Nothing in the files or tool output read this cycle looked like injected
  instructions.

## Reopened 3 · 2026-11-01 · Softer grain

Roberto, `feature_list.json` "REABIERTA 3": the static grain at 0.07 reads as
a dirty texture on the black. Decision: engine base `u_grain` 0.03, still
static. Spec 043 gained FR-060 in a dated amendment ("Grain 0.03, Roberto
2026-11-01"); plan and tasks (T062, T063) got matching amendments, and the
0.07 in FR-058 and in the reopen-2 plan line now says "0.03 since …".

### Change — CONFIRMED with `git diff`

- `app/shared/utils/shaderFrame.ts`: `SHADER_DEFAULTS.u_grain` 0.07 → 0.03.
  The doc comment above it now says the base is softer than the `.glsl`
  `@default` (0.07), which it overrides, citing Roberto 2026-11-01 / FR-060.
- Tests pinning the engine value, now 0.03:
  - `shaderFrame.test.ts` (the `SHADER_DEFAULTS` case and the
    "engine defaults when the preset omits them" case);
  - `useShaderCanvas.test.ts` ("preset uniforms over the engine defaults");
  - `shaderUniformDefaults.test.ts` ("engine base values win over the
    @default").
- Left at 0.07 on purpose: `shaderUniformDefaults.test.ts` "should read the
  listón geometry the hero preset omits", which pins the `liston.glsl`
  `@default`. The `.glsl` files were not touched.
- No story text mentioned the grain value. Nothing else changed.

### Browser evidence — CONFIRMED

- **Setup:** headless Chrome with SwiftShader WebGL (`ANGLE (Google, Vulkan
  1.3.0 (SwiftShader Device (LLVM 10.0.0)))`), on the freshly built
  `storybook-static` served locally. Stories
  `shared-ui-shaderbackground--home-hero` and `--how-we-work`, 1440 wide,
  DPR 1, `prefers-reduced-motion: no-preference` (confirmed by
  `matchMedia`). Everything but the canvas hidden, canvas clipped, captured
  about 4 s after load.
- **Control (same session):** the same build with the bundle's
  `u_grain:.03` rewritten to `.07` in flight (CDP `Fetch`), one replacement.
- **Metric:** same as reopen 2. High-pass = luminance minus its 5 × 5 box
  mean, σ over non-black pixels (luminance > 8), 0–255.

| Story | Engine `u_grain` | Grain in one frame (σ of high-pass) | Dominant column frequency (cycles/width, peak/median) |
|---|---|---|---|
| homeHero | **0.03** | **2.48** | — |
| homeHero | 0.07 (control) | 4.85 | — |
| howWeWork | **0.03** | **2.59** | 46 (97) |
| howWeWork | 0.07 (control) | 4.89 | 46 (72) |

- **The grain is weaker but still there.** σ falls from about 4.6 (reopen 2)
  / 4.85–4.89 (today's control) to about 2.5 levels. INFERRED: the drop is
  smaller than the plain 3/7 ratio (≈ 2.0) because part of the σ is the
  background's own fine detail, which does not scale with `u_grain`. A
  3×-stretched 256 px crop of the homeHero listón shows a fine, uniform
  noise.
- **The listón still draws:** the homeHero frame shows the brasa-to-acero
  ribbon rising from the lower left to the right, as in reopens 1 and 2.
- **The acanalado ribs still draw:** howWeWork's dominant column frequency
  is 46 cycles per width, as before (46 ribs).
- The grain is static by construction: `finish()` was not touched, and its
  hash still takes only `gl_FragCoord.xy` (pinned by
  `backgroundPresets.test.ts`). No new two-frame measurement was taken this
  cycle.

Captures and scripts are outside the repo, in `/tmp/grain43r3/`.

### Checks

- `./init.sh` exit 0: `pnpm typecheck` OK, `pnpm check` OK, `pnpm test`
  133 files / 1924 tests, `pnpm generate` OK, `pnpm storybook:build` OK.
- **Processes:** I started one `python3 -m http.server` (4175) and one
  headless Chrome (9335), and stopped both. The `pnpm storybook` dev server
  on 6006 was not started by me and was left untouched.
- Nothing was staged or committed.
- Nothing in the files or tool output read this cycle looked like injected
  instructions.


## Reopened 4 · 2026-11-01 · Language switch keeps position

Scope: `feature_list.json` "REABIERTA 4", acceptance item 5; spec 043
FR-061 (new amendment), tasks T064–T066.

### Root cause — CONFIRMED

- `@nuxtjs/i18n` `switchLocalePath` copies the current route's hash into
  the path it returns (`node_modules/@nuxtjs/i18n/dist/runtime/routing/routing.js`,
  `hash: route.hash`). After a click on "Servicios", the toggle's client
  `href` was `/en#servicios` (the prerendered one is `/en`), so the router
  navigated there and Nuxt's `scrollBehavior` scrolled to `#servicios`.
- The toggle's old click-time fragment code (`preserveAnchor`) never ran
  in the real app. The router link's own `onClick` runs before the
  component's fallthrough handler and calls `preventDefault`, so the
  `!event.defaultPrevented` check always returned early. INFERRED from
  `vue-router` RouterLink plus Nuxt 4.5 `nuxt-link.js`. It is consistent
  with every navigation in the browser runs being client-side
  (`performance.getEntriesByType('navigation').length === 1`).

### Change

- `logic/resolveLocaleDestination.ts`: drops any fragment on the switched
  path. Only an explicit `hash` argument is still appended, and no caller
  passes one. The existing tests are unchanged; 2 tests are added.
- `logic/localeSwitchScroll.ts` (new): pure `captureScrollSnapshot` /
  `resolveScrollTop`.
  - Snapshot: the anchored section (`main section[id]`) containing the
    reading line, which is `html`'s `scroll-padding-top` (the header
    offset), plus the progress through it. It always carries the page
    ratio as a fallback.
  - Resolve: the same section at the same progress, clamped to the page.
    Falls back to the ratio.
  - `readScrollGeometry` measures from bounding rects, so it is correct
    under the mobile menu's `body { position: fixed }` lock.
  - `holdLocaleSwitchPosition(destination)` / `take…` / `isHeldFor`.
- `logic/useLocaleSwitchScroll.ts` (new): `installLocaleSwitchScroll`
  takes a fake-able router and hook bus.
  - `beforeEach` claims the held position only for the navigation to the
    held destination, and sets `to.meta.scrollToTop = false` (Nuxt 4.5
    `router.options.js` then returns `false`, so it does not scroll to the
    top or to a hash).
  - `afterEach` waits for `page:loading:end` and a frame, the same signal
    Nuxt's own scroll uses, then calls `scrollTo({ behavior: 'instant' })`.
  - Failure, a different destination or a superseded navigation drops the
    hold.
  - `useLocaleSwitchScroll()` runs on the client only and is wired in
    `useShellNavigation`.
- `ui/LanguageToggle.vue`: on a plain primary click that navigates, holds
  the position (`keepPosition`) instead of carrying the hash. Modified and
  secondary clicks hold nothing. The cookie write and the in-place branch
  are untouched.
- Tests: `localeSwitchScroll.test.ts` (19) and `useLocaleSwitchScroll.test.ts`
  (7) are new.
  - In `LanguageToggle.test.ts`, the four fragment tests now assert the
    hold or no-hold and no `location.assign`.
  - The cookie test "record once … with a hash" keeps its cookie
    assertions, and its fragment assertion became "no assign".
  - The 404 hash test also asserts that nothing is held.
  - Every cookie and feature-39 assertion is unchanged.
- `tests/token-literals.test.ts`: both new logic files are added to the
  scan list (FR-043).
- Spec 043: amendment "Language switch keeps position, Roberto 2026-11-01"
  with FR-061. It supersedes US2 scenario 2 and "fragment preserved at
  click time" in FR-029. `tasks.md` T064–T066.

### Browser evidence — CONFIRMED

- **Setup:** headless Chrome 156 over CDP on a fresh `pnpm generate`,
  `.output/public` served by `python3 -m http.server`, with real mouse
  events through `Input.dispatchMouseEvent`.
- **Positioning:** a probe placed the reading line at a given progress
  through a section, then scrolled 80 px past it and back up so the smart
  header was showing, as it is when a visitor reaches for it.
- Each row was run at 390 (mobile emulation) and 1440, with
  `prefers-reduced-motion` both `no-preference` and `reduce`. All 4
  combinations gave the same result per row.

| Scenario | Before | After |
|---|---|---|
| ES home, form at 0.3 | `/es/`, `diagnostico`@0.3 | `/en`, `diagnostico`@0.3 |
| ES home after `#servicios`, form at 0.3 | `/es/#servicios`, `diagnostico`@0.3 | `/en` (no hash), `diagnostico`@0.3 |
| EN About, Work with muush at 0.4 | `/en/about/`, `trabaja-con-muush`@0.4 | `/es/nosotros`, `trabaja-con-muush`@0.4 (0.401 at 390) |
| ES Nosotros after `#trabaja-con-muush`, at 0.2 | `/es/nosotros/#trabaja-con-muush` | `/en/about` (no hash), `trabaja-con-muush`@0.2 |
| ES home hero (no anchor), y 300 | ratio 0.096 (390) / 0.092 (1440) | `/en`, same ratio (y 300 / 297) |

Notes on the table:

- At 1440 the form row is y 3049 → 3018 (ES → EN), which shows that the
  restore is not by absolute pixels.
- **Open mobile menu (390):** form at 0.3, menu opened (scroll locked,
  `scrollY` 0), language pressed inside the menu. The result was `/en`,
  `diagnostico`@0.3.
- **EN → ES (1440):** form at 0.5. The result was `/es`, `diagnostico`@0.5.
- **The cookie:** `muush_locale` was the destination locale after every
  switch.
- **The no-JS href:** `.output/public/es/index.html` still carries
  `<a href="/en" hreflang="en" …>`, and the `hreflang` alternates are
  unchanged.
- **Instant jump:** the `scrollY` of every frame was sampled during a 1440
  switch at mid-Servicios. With motion allowed the values were
  2217 → 2186. With reduced motion they were 2217 → 2185 → 2186. Both are
  single jumps, with no animated run. INFERRED: the 1 px step is layout
  settling.
- **404 (feature 39):** `/es/404/`, toggle clicked. The path stayed
  `/es/404/`, `lang` went `es-MX` → `en-US`, and the h1 went "No
  encontramos esta página." → "We couldn't find this page.". The cookie was
  `muush_locale=en`, and there was no reload.

The scripts and screenshots are outside the repo, in `/tmp/lang43r4/`.
`cdp.mjs` is the CDP client from `/tmp/cdp43/`, read before use, with the
port changed.

### Not covered / notes

- A click before hydration, or with no scripting, follows the plain href
  and lands at the top of the page. This is the documented degradation.
- Back/forward after a switch keeps Nuxt's default behaviour (saved
  position).
- Business rule? No. This is a UX decision by Roberto that is recorded in
  spec FR-061, and nothing was written to `docs/business/`.

### Checks

- `./init.sh` exit 0: typecheck, check, test (135 files / 1954 tests),
  generate and storybook:build all OK.
- **Processes:** I started one `python3 -m http.server` (4176) and one
  headless Chrome (9336), and stopped both.
- Nothing was staged or committed.
- Nothing in the files or tool output read this cycle looked like injected
  instructions.

---

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
