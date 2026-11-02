# Review 43 · feature 43 `m1_site_shell`

**Verdict: APPROVED**

- **Reviewer run:** 2026-11-01. Branch `feat/v2-site-shell`. Nothing is committed: 16 staged `git mv` renames, with the rest of the changes unstaged or untracked.
- **Status at review start:** `reviewing`. CONFIRMED in `feature_list.json`, and 43 is the only active feature.
- **Reviewed against:**
  - `specs/043-site-shell/`: spec, plan, tasks, data-model, contracts and checklists;
  - the 10 acceptance items of feature 43, plus Roberto's resolutions of 2026-11-01;
  - `docs/harness/CHECKPOINTS.md` C1–C8;
  - constitution v2.1.2;
  - AGENTS.md § 3.1;
  - `pen-extract-43.md` §§ 1–10.
- **Gate:** I ran `./init.sh` myself and it **exited 0**. typecheck OK, Biome OK, 131 test files / 1883 tests passed, `pnpm generate` OK and `pnpm storybook:build` OK. This was a fresh run, started after the earlier run, which held the lock, had finished. I killed no process.

No finding blocks approval. The items below are cleanup that the leader can schedule.

## Findings

### Blocking

None.

### Should fix (no behaviour impact; stale text that now contradicts a recorded decision)

1. **The `global.css` comment still calls the social glyph size UNVERIFIED** (`app/assets/css/global.css:2741-2746`). It still says "UNVERIFIED — owner: the leader … 20 px is the implementer's placeholder". Since pen-extract-43 § 10, 20 px is a leader decision. Fix: reword the comment to cite § 10.
2. **The SocialLinks story repeats the same stale wording** (`app/features/shell/ui/SocialLinks.stories.ts:9`): "glyph size is a placeholder awaiting the leader".
3. **The implementation report's § 4 still lists the glyph size as an open gap** (`docs/harness/progress/impl_site_shell.md:110`). It should point to the § 10 decision.

### Advisory

1. **Stale v1 references in the `useMobileMenu.ts` doc comments.**
   - Lines 7 and 19 still name `SiteNav` as the owner of the controls. That is now `SiteHeader` and `MobileMenu`.
   - Line 29 still says the 1024 px breakpoint is UNVERIFIED, "Flagged for Clau". Spec Assumptions and pen extract § 6 now settle it.
2. **`app/pages/about.vue:20`:** the comment still says the nav's `#work` anchor. The id is now `trabaja-con-muush`.
3. **`app/features/shell/data/types.ts:2`:** a `data/` file imports a type from `@/shared/ui/SocialIcon.vue`.
   - This is a type-only import, and the plan records it as an existing precedent (Phase -1 gate).
   - Feature 47 could move `SocialNetwork` into `app/shared/data/` to make the direction strictly data → nothing.
4. **Some part-level stories cover one viewport or one locale only:** `MenuButton`, `NavLinkBar`, `SocialLinks`, `ShellItemLink`, `Isotipo`, `Wordmark` and `SocialIcon`.
   - Each one renders only below or only from `lg`, or carries no translatable copy.
   - The composed stories (`SiteHeader`, `MobileMenu`, `SiteFooter`, `MobileFooter`, `Lockup`, `LanguageToggle`) cover both anchors in ES and EN, so FR-050 is met at the level the reviewer cares about.
5. **`useShellNavigation()` is about 140 lines in one function.** This exceeds C3's "~30 per function", but it continues the pre-existing shape (166 lines in HEAD). It is mostly declarative `computed`s, so it is not a regression.
6. **Code left for later features to delete:**
   - `useNavCtaReveal` and `useHeroSentinel` remain, because the v1 Hero still calls the sentinel. The spec defers their removal to 44/47.
   - The `--layer-glow/dots/spotlight` tokens remain, marked v1-only for 47.
7. **C6:** `docs/harness/progress/history.md` needs this session's entry when the leader closes 43.
8. **Forced colours, recorded by the implementer:** the decorative active dot and the menu divider disappear under forced colours. The active link then relies on `aria-current`. The spec's edge case only requires boundaries and readable labels, so this is not a defect. It is listed for Roberto's awareness.

## Security

**Clean.**

- **Scope.** Every change is under `app/`, `tests/`, `i18n/`, `specs/043-site-shell/` or `docs/harness/`, plus these files:
  - `nuxt.config.ts`: Poppins 400 added to the existing `@nuxt/fonts` family list. The spec requires it (FR-036, Q3).
  - `public/favicon.svg`: FR-038.
  - `.specify/feature.json`: points to `043-site-shell`.
  - `.specify/memory/constitution.md`: the 2.1.2 PATCH amendment Roberto ratified for Q3.
  - `feature_list.json`: status only, set by the leader.
- **Dependencies and scripts:**
  - `package.json`, `pnpm-lock.yaml`, `.storybook/`, `init.sh`, hooks and CI are untouched.
  - No new dependency. `useFocusTrap` and `useActiveSection` are hand-written, with no VueUse.
- **Network.**
  - No new runtime network call. The site stays static: no `server/` route, and `nitro.preset` is unchanged.
  - The only external hosts in the diff and in the generated HTML were already there: muush.dev, LinkedIn, Instagram, TikTok, `wa.me`, cal.com (booking), `assets.muush.dev`, schema.org and the existing forms API endpoint.
  - The WhatsApp number and social handles are the existing public business values.
- **External links.** Each one is rendered with `target="_blank" rel="noopener noreferrer"` (`ShellItemLink.vue`, `SocialLinks.vue`). `mailto:` stays in the same tab.
- **`v-html` in `SocialIcon.vue`.** It inlines only the three repo-owned SVGs imported with `?raw` at build time. No user or remote input reaches it.
- **Credentials and agent-directed text.**
  - No secrets, tokens or credentials appear in the diff.
  - Nothing in the changed or untracked files reads as instructions aimed at agents. The only matches were normal harness workflow notes (leader, implementer, reviewer handoffs).

## What I verified

### Constitution

- **No version marker in any new name.** I checked new paths and identifiers: no `m1`/`v2` markers. The name `m1_site_shell` stays only as the historical feature id.
- **Quarantine is CONFIRMED.**
  - The v1 `SiteNav`, `MobileMenu`, `SiteFooter`, `FooterColumn`, `NotFoundContent` and `NotFoundRings` were moved with `git mv` into `app/features/shell/ui/legacy/`.
  - Their stories are titled `Legacy v1/Shell/…`. Every `Shell/…` story is a v2 component.
  - A grep found no import from any `legacy/` path in v2 shell, shared or layout code. The one exception is the barrel's `NotFoundContent` export, which tasks T003 and T049 allow.
  - The v1 sections in landing and about still import `shared/ui/legacy/`, as before. They are v1 code awaiting 44–46.
- **No hex, rgb or px literals in the v2 files.**
  - A grep over all new and rewritten shell UI, logic and data files, the four brand marks and the layout found none.
  - The only hits were the pre-existing `64rem` media-query constant and a `1024px` doc comment in `useMobileMenu.ts`.
  - No v1 tokens or utilities appear in those files.
  - `tests/token-literals.test.ts` now scans all of these files (SC-007) and passes.
- **Components and logic.**
  - Every component is under 200 lines. The largest are `MobileMenu.vue` (187), `LanguageToggle.vue` (182) and `SiteHeader.vue` (154).
  - Scroll, focus, observer and menu logic live in composables.
  - Every component uses `<script setup lang="ts">`.
- **Static only.** There is no server route. The prerendered HTML is the no-JS state: no menu button and no `inert` attribute. The CTA is present.

### No regression (features 21, 33, 36, 37, 39)

- `git diff --stat` is empty on these files:
  - `localePreference*`, `switchLocaleInPlace*`, `resolveLocaleDestination*`, `notFoundLocale*`, `useNotFoundDocument*`;
  - `tests/locale-preference-output.test.ts`, `tests/i18n-parity.test.ts`, `tests/brand-cursor.test.ts`.
- In `LanguageToggle.vue`, only the class constants and the look-only `variant` prop changed. The behaviour functions are untouched.
- In `LanguageToggle.test.ts`, only the class assertions changed, plus one new `menu`-variant test.
- In the build tests, no hreflang, cookie or in-place-switch assertion was removed.
  - The generated pages still carry one toggle and the full hreflang set: es-MX, en-US, es, en and x-default.
  - The 404 assertions changed only where Q1 requires it: the CTA is now present.
- The route-map resolution is unchanged: `switchLocalePath` with the home fallback, and destinations resolved by route name.

### Header

- **Hide and reveal.** `useNavScrollReveal` keeps the 80 px reveal zone and the 10 px anti-bounce rule. It reveals immediately on any upward scroll.
- **Menu open.** The header is forced visible while the menu is open (`isOpen` is passed in).
- **Focus.** `reveal()` runs on `focusin`.
- **Reduced motion.** The header uses `motion-reduce:transition-none`, and `--medio` is 0 ms under reduced motion.
- **Unit tests** cover each of these behaviours.
- **Anchor jumps.**
  - `html { scroll-padding-top: var(--header-offset) }`, where the offset is 4.75rem (76 px) below `lg` and 5.5rem (88 px) from `lg`. Both equal top offset plus bar height from the extract.
  - Smooth scrolling applies only under `prefers-reduced-motion: no-preference`.
  - The scroll-lock restore uses `behavior: 'instant'`, pinned by a test.
- **Placement.** The header is fixed (FR-009) and `print:hidden`.

### Mobile menu accessibility

- **Dialog semantics.** `role="dialog"`, `aria-modal="true"` and an `aria-label`.
- **Focus.**
  - On open, focus moves to Cerrar (`watch` with `nextTick`).
  - `useFocusTrap` wraps Tab and Shift+Tab, with unit tests.
- **Inert background.** The header and the content/footer wrapper are `inert` while the menu is open.
- **Scroll lock.** The body is set to `position: fixed`, and the exact `scrollY` is restored on close.
- **Ways to close.**
  - Esc, browser history and resizing to desktop close it with `dismiss`.
  - Cerrar emits `close`, which the layout handles as `close('dismiss')`.
  - A link, the logo or the language emits `itemChosen` → `close('navigate')` before navigation.
  - A route-change watcher in the layout is a backstop.
- **Focus return.** After `dismiss`, the header returns focus to the menu button. This is tested in both directions.
- **Browser check.** The implementer's CDP check of the full sequence is recorded in its report.
  - This is INFERRED reliable: I re-ran the unit and component tests that cover each step.
  - I did not repeat it in a browser.

### Scroll-spy

- **Home.** Only anchor items on the `index` route are spied on (`SPIED_ANCHORS` = `servicios`).
  - Servicios gets `current: 'section'`, rendered as `aria-current="true"` plus the dot, while it is in the reading band (from the header's lower edge to 50 %).
  - Nothing is marked at the top of the page, and none of the `NavLinkBar` items is marked in the generated `/es` and `/en`.
- **Nosotros.** "Nosotros" is `aria-current="page"` in the generated `/es/nosotros` and `/en/about`.
- **Preguntas.** It is absent from `NAV_ITEMS`, `MENU_ITEMS`, the MUUSH column and the mobile links line.
- **404.** `isHome` is false and no route name matches, so nothing is marked. The generated `/es/404` has no `aria-current`.
- **SSR.** `activeAnchor` is `null` until mount, so there is no hydration flash.
- **Hash links.** Same-page hash links have `aria-current` cleared explicitly (findings R75). In the generated home page, only the logo links carry `aria-current="page"`, which is correct.

### Footer (ES/EN)

- **Desktop columns**, in order: NAVEGACIÓN, CONTACTO, MUUSH, REDES.
  - NAVEGACIÓN: Servicios, Cómo trabajamos, Nosotros.
  - CONTACTO: Diagnóstico gratis, Agenda una llamada, support@muush.dev, WhatsApp.
  - MUUSH: Trabaja con muush, "Blog · próximamente".
  - REDES: LinkedIn, Instagram, TikTok.
- **"Blog · próximamente" is a `<span>`, not a link.** I checked `kind: 'none'` → the `ShellItemLink` `<span>` branch, and the tests.
- **Desktop bottom row:** copyright, then privacy and terms as `<span>` (FR-032).
- **Mobile, in order:**
  - the brand block;
  - the three contact rows with hints: Escríbenos / 30 minutos / Correo, and in EN Message us / 30 minutes / Email, plus a decorative `→`;
  - the one-line links ending in "Blog (próximamente)" as text;
  - the 44 px social buttons;
  - the legal block with its Carbón 700 border.
- **Copy** matches pen extract § 6 in both `es.json` and `en.json`. Unused v1 keys were removed from both.
- **Token values.** The tokens were checked against the extract:
  - spacing: paddings 72/80/40/80 and 48/24/32/24, gaps 56/18/14/24/10/8/6, brand width 340, radius 14;
  - type sizes: 11/12/13/14/15/17→20;
  - colours: Blanco 8/12/20/70/85 % and Negro 900 at 45/70 %.
  - The fluid clamps evaluate to exactly 17 px / 20 px for the tagline and 40 px / 72 px for the column gap at the anchors.

### Isotipo, favicon and wordmark

- **Isotipo geometry is identical to `app/assets/logo/*.svg`:**
  - `viewBox="14.5 38.5 70.5 39.5"`;
  - circle `cx 21 cy 45 r 6.5`;
  - path `M21 72a17 17 0 0 1 34 0 12 12 0 0 1 24 0`;
  - `stroke-width="12"` with a round cap.
- **Isotipo colours.** The stroke is `currentColor` (Blanco via Lockup) and the dot uses `fill-red-muush-500`.
- **Favicon** (`public/favicon.svg` and `.output/public/favicon.svg`):
  - dot `#E5352F`, stroke `#050505` on light chrome and `#F4F4F2` on dark;
  - geometry and the `translate(3,-8)` framing unchanged;
  - no `#262626`, `#FBF8F6` or `#CF3147` remains.
- **Wordmark.** "muush" is `font-semibold` (600) Blanco, "." is 600 Red muush 500 and "dev" is `font-normal` (400) Gris 400.
- **Font.** Poppins weights are now `[400, 500, 600]` in `nuxt.config.ts`, with a build assertion for the 400 face.

### Items inherited from feature 42

- **(1) Shader import fallback.** `useShaderCanvas.start()` wraps the dynamic import in `try/catch` and calls `fallBack()`. The test "should fall back with no unhandled rejection when the shader source fails to load" passes.
- **(2) GlassButton `size`.** The prop is removed, and a test asserts there is no `size` prop.
- **(3) `global.css` comments.**
  - The layer table is rewritten for the Negro 950 canvas.
  - The `html` canvas comment no longer mentions an ink-500 band.
  - The v1 layer tokens are marked for 47.
- **(5) v2 marks.** `Shared/UI/{Isotipo,Wordmark,Lockup,SocialIcon}` exist, and the v1 versions stay in `shared/ui/legacy/`.
- **(7) By-eye and forced-colours checks.** The results are recorded in impl report § 6: 1250 Storybook renders across 360/768/1024/1280/1920 × normal and forced colours.
  - This is UNVERIFIED by me, because I did not re-run a browser.
  - The record exists with per-component results, so FR-049 is met.

### Retirements

- `DotGrid`, `CursorSpotlight` and `useCursorSpotlight` are gone from `default.vue`.
- The build tests assert that no `dot-grid` or `cursor-spotlight` reaches any page.
- Every `section-backdrop` wrapper is `hidden`. The 404 has no glow.
- Each superseding test carries the supersession note for feature 42's "spotlight sigue funcionando":
  - `tests/spotlight-red-dots-tokens.test.ts:80-87`;
  - `tests/static-output.test.ts:258`.
- The "You" cursor test (`tests/brand-cursor.test.ts`) is unchanged and green.

### Section anchors

- `SECTION_ANCHORS` lives in `app/shared/data/sectionAnchors.ts`.
- The generated pages carry the ids:
  - `/es` and `/en`: `id="servicios"` and `id="diagnostico"`;
  - `/es/nosotros` and `/en/about`: `id="trabaja-con-muush"`.
- The hero's `contactHash` is `#diagnostico`.

### Harness

- Tasks T001–T052 are all `[x]`.
- The plan's Phase -1 gates are all `[x]`.
- No `[NEEDS CLARIFICATION]` markers remain.
- Every User Story acceptance scenario maps to at least one unit, component or build test. The exception is the purely visual 390/1440 pixel match (SC-001/SC-002), which rests on the implementer's recorded CDP measurements and on my arithmetic over the tokens: INFERRED.

### Not verified by me

- Pixel measurements in a real browser.
- A real screen reader, Safari and Firefox.
- Behaviour on a GPU-less device.

For these I rely on the implementer's CDP evidence, which is labelled UNVERIFIED in its report where applicable.
