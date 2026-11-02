# Review 43b · feature 43 `m1_site_shell` (reopened 2026-11-01)

**Verdict: APPROVED**

- **Reviewer run:** 2026-11-01. Branch `feat/v2-site-shell`. Nothing is committed.
- **Status at start:** `reviewing`. CONFIRMED in `feature_list.json`, and 43 is the only active feature.
- **Scope:** only the reopen. That is (A) the Home link and (B) the shader `@default` fix. Everything earlier was APPROVED in `review-43.md` (15:22).
  - I found the reopen's files by modification time (newer than `review-43.md`) and cross-checked that list against the implementer's report.
  - The few files touched at 15:23 (`global.css` ~2741, `SocialLinks.stories.ts:8`, `useMobileMenu.ts` header, `about.vue:20`) only change comments. They close review-43 Should-fix 1–2 and Advisories 1–2.
- **Gate:** I ran `./init.sh` myself and it **exited 0**. typecheck OK, Biome OK, 133 test files / 1921 tests, `pnpm generate` OK, `pnpm storybook:build` OK. Nothing held the lock. A `pnpm storybook` dev server on 6006, which I did not start, was left alone.

## Findings

### Blocking

None.

### Should fix

1. **The amendment reuses requirement IDs.**
   - `specs/043-site-shell/spec.md:732` and `:736` define new FR-050 and FR-051 for the Home link.
   - `spec.md:553` and `:556` already define FR-050 (catalogue stories and tests) and FR-051 (the gates) under "Quality".
   - So "FR-050" and "FR-051" now each name two different requirements. That breaks traceability from code comments, tasks and reviews.
   - Fix: renumber the amendment to FR-055…FR-059, and update the references in `plan.md:208`, `tasks.md` and `docs/harness/progress/current.md`/`impl_site_shell.md`.
   - This is doc-only, so it does not block.

### Advisory

1. **One test can never fail** (`app/shared/utils/shaderUniformDefaults.test.ts:105-113`).
   - It checks that every `@default` key is a number after the merge. The merge spreads those same defaults first, so this always holds.
   - The mobileMenu preset is therefore covered only through this loop. No test pins a value it omits, such as `u_twist` 0.6 or `u_tx` 0.5.
   - Suggest one explicit mobileMenu assertion.
2. **The parser is slightly stricter than the handoff** (`app/shared/utils/shaderUniformDefaults.ts:26-27`).
   - It drops a non-finite `@default` (such as `@default .`). The handoff would store `NaN`.
   - The regexes are byte-identical to `muush-gradient.js:42-43`, and both real shaders parse the same way. This is benign, but the code comment at :12-14 does not mention the extra check.
3. **The Home link's `aria-current="page"` depends on scroll position** (`useShellItemResolver.ts:91`, spec FR-052 of the amendment).
   - The document does not change as you scroll, yet assistive tech hears "current page" only above Servicios. On home, the logo carries `aria-current="page"` all the time (router exact-active).
   - This follows the leader's choice and the visual dot. The alternative is a static `page` with only the dot following the spy. Leave it for Roberto or the leader to confirm.
4. **Behaviour choices still to confirm** (the implementer flagged these too):
   - Home is lit anywhere above Servicios, not only at `scrollY` 0.
   - Home is unlit at the bottom of the page.
   - The logo does not scroll to the top when clicked on its own page with no hash. This is pre-existing.
5. **When there is no signal, `atTop` stays true** (`useActiveSection.ts:82,116-122`). Without `IntersectionObserver`, or on a home page with no spied section, Home stays lit at every scroll position. This degrades gracefully and only on home (gated by `isHome`, `useShellNavigation.ts:97`).
6. **Defaults are read only at mount** (`useShaderCanvas.ts:47-48,102`). If a preset changed its `shader` at runtime, the defaults would be stale. The shader is already fixed at mount (pre-existing design), so nothing is affected today.
7. **The closed spec 042 is outdated.** `specs/042-m1-visual-foundation/` still shows the one-argument `withShaderDefaults`. Whether to add a note there is the leader's decision, as the implementer said.

## Security

**Clean.**

- **Dependencies and config:** `package.json`, `pnpm-lock.yaml`, `.storybook/`, `.husky`, `.github`, `init.sh` and `biome.json` are unchanged (`git diff --stat` empty).
- **No new network calls, URLs, hooks, scripts or secrets** in the reopen's files.
  - `scrollToTopIfCurrent.ts` uses `new URL(href, location.href)` only to compare paths.
  - The shader defaults come from the bundled `.glsl` source the app already loads.
- **Handoff files:** `docs/handoff/muush-1.0/README.md` and `muush-gradient.js` were edited as the leader's copy of the corrected handoff. Nothing in `app/`, `tests/`, `nuxt.config.ts` or `.storybook/` imports `muush-gradient.js`; it is only cited in comments.
- **`/tmp/cdp43b/`:** the only mention in the repo is the evidence line in `docs/harness/progress/impl_site_shell.md`. No code, test, config or script references it.
- **No agent-directed text:** no instruction-like content addressed to agents in the changed code, comments, docs or i18n.
- **My own temp files:** my screenshots are in `/tmp/review43b-shots/` (Chrome profiles deleted) and my gate log is `/tmp/review43b-init.log`, both outside the repo. I stopped the `http.server` I started on 127.0.0.1:4291.

## What I verified

### Shader fix (B)

- **Parser:** the two regexes match the handoff's `MuushGradient.defaults()` exactly (`muush-gradient.js:42-43`). The only difference is the finiteness filter (Advisory 2).
- **Merge order:** `{ ...shaderDefaults, ...SHADER_DEFAULTS, ...uniforms }` (`shaderFrame.ts`). This is the handoff constructor's order: `@default`, then the engine base, then the preset.
- **Read once, applied on every draw:**
  - `readShaderDefaults(source)` runs once in `start()` (`useShaderCanvas.ts:102`).
  - `draw()` passes them on every frame (`:179-182`).
- **mobileMenu:** it uses the `liston` source, so it gets the same path (`backgroundPresets.ts` mobileMenu entry).
- **Tests pin both rules:**
  - A missing uniform takes its `@default`: homeHero `u_th` 0.1, `u_y0` 0.98, `u_twist` 0.6; howWeWork `u_ribs` 46, `u_refract` 0.05.
  - An explicit value wins: howWeWork `u_th` 0.15, `u_right` 0.45, `u_y0` 0.52. The engine base also wins over a `@default`.
  - `useShaderCanvas.test.ts` checks the drawn homeHero uniforms carry the `liston.glsl` geometry.
- **Comment fixed:** the misleading `backgroundPresets.ts` header now describes the real mechanism.
- **Browser check, my own run:** headless Chrome with SwiftShader, `--force-prefers-reduced-motion`, 1440×900, against `storybook-static` served on 127.0.0.1.
  - homeHero: CONFIRMED. The brasa-to-acero listón draws. A second capture with WebGL disabled shows the poster, and it differs (listón at a different phase). So the first image was the live canvas, not the poster.
  - howWeWork: the ribbed acanalado is visible, with ~46 vertical ribs. That the canvas rather than the poster produced it is INFERRED: same browser setup, WebGL path proven on homeHero.
  - homeHero EN, the other presets and mobileMenu: I did not rerun them. I rely on the implementer's CDP table, which includes a zero-uniform control and rib-frequency measurements and is credible. mobileMenu matching the design remains UNVERIFIED (there is no poster).

### Home link (A)

- **i18n:** `shell.nav.homeLink` and `shell.footer.nav.home` read "Inicio" / "Home" in both locale files. `shell.nav.home` (the logo's name) is unchanged.
- **Route map:** `kind: 'top'` resolves with `localePath({ name })` (`useShellItemResolver.ts:59-60`). There is no string prefix swap.
- **First in all four places, CONFIRMED in the generated HTML:**
  - the link bar (Inicio · Servicios · Nosotros);
  - footer NAVEGACIÓN (Inicio · Servicios · Cómo trabajamos · Nosotros);
  - the mobile footer line.
  - The menu is `v-if`, so I checked it in data (`MENU_ITEMS = NAV_ITEMS`) and in `MobileMenu.test.ts`.
- **The logo still links home:** `href="/es"`, `aria-label="Inicio de muush"`.
- **Scroll-spy:**
  - The resolver lights `top` only on its own route and only while `atTop()` (`:91`).
  - `useShellNavigation` gates it with `isHome && atTop` (`:97`), so the 404 never lights it.
  - Generated HTML: `es`/`en` home has Home `aria-current="page"` with the dot. `es/nosotros` and `en/about` light only Nosotros/About. `es/404` has 0 `aria-current`.
  - The handover to Servicios, and the jump back to the top, are covered by `useActiveSection.test.ts` (:170-215) and by the implementer's browser table.
- **`aria-current`:**
  - `NavLinkBar` keeps `page` / `true`, and the dot is `aria-hidden`.
  - `MobileMenu` and `ShellItemLink` pass `page` or an explicit `undefined`, which clears the router's exact-active value.
- **Menu close, then scroll:** `chooseItem` emits `itemChosen` first (the layout closes and releases the lock), then scrolls. A test covers it (`MobileMenu.test.ts:187`).
- **Stories and tests:** `HomeTopEs`/`HomeTopEn` (`NavLinkBar`) and `EsHomeTop1440`/`EnHomeTop1440` (`SiteHeader`) were added. The fixtures start with Home in ES and EN. There are resolver `top` cases, the `scrollToTopIfCurrent` unit tests, and updated `static-output` and `not-found-output` tests.
- **Spec package:** a dated "Amendment 2026-11-01" was added to `spec.md`, `plan.md`, `data-model.md` and `contracts/components.md`. T053–T058 are all `[x]`, and no task is left unchecked. The ID collision is Should-fix 1.

### No regression

- **hreflang and the language toggle** are intact in the generated HTML. The alternates are `/es` ↔ `/en` and `/es/nosotros` ↔ `/en/about`, and the 404's toggle points to `/en`.
- **Earlier behaviour still covered by tests:** focus trap (`MobileMenu.test.ts:162,219`), scroll lock, header hide/reveal, and cookie and 404 in-place switching (the implementer's browser check plus the existing suites). The full suite passes.

### Constitution v2.1.2

- **No literals or v1 tokens:** none in the reopen's UI. `token-literals` passes.
- **No version markers** in the new identifiers.
- **Size:** `MobileMenu.vue` is 197 lines and `NavLinkBar.vue` 61, both under 200.
- **Logic in composables and logic modules:** `useActiveSection`, the resolver, `scrollToTopIfCurrent`, `readShaderDefaults`.

### Not verified by me

- Pixel comparison against the `.pen`.
- A real screen reader.
- Safari and Firefox.
- The mobileMenu design match.
