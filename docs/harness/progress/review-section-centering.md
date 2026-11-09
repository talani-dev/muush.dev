# Review — fix/v2-section-centering (every section a viewport tall, content centred)

Reviewer run 2026-11-08, branch `fix/v2-section-centering`, uncommitted
changes against `master`. Implementer report:
`docs/harness/progress/fix-section-centering.md`.

## Verdict: APPROVED

No blocking findings. The non-blocking notes below are for the leader and
Roberto.

## Scope note (protocol step 0)

This is an owner-requested fix branch with no entry in `feature_list.json`.
No feature is in `reviewing`, and none is in `in_progress` either (the only
non-`done` ones are 15/18/19 `superseded` and 51 `blocked`). The status gate
does not apply, so C2 still holds. The leader launched this review directly
on Roberto's approved request.

## Commands, re-run by the reviewer

| Command | Result |
|---|---|
| `pnpm check` | exit 0, 549 files, no fixes |
| `pnpm typecheck` | exit 0 |
| `pnpm test` | exit 0: 191 files, 2693 tests passed |
| `pnpm generate` | exit 0, `.output/public` written |
| `./init.sh` | exit 0, including `pnpm storybook:build` |

Compiled CSS (CONFIRMED in `.output/public/_nuxt/*.css`):
`.min-h-portada-alto{min-height:100svh}`,
`.min-h-seccion-alto{min-height:calc(100svh - var(--header-offset))}`,
`.pt-portada-arriba{padding-top:calc(var(--header-offset) + var(--seccion-aire))}`,
`.py-seccion-aire` / `.pb-seccion-aire` read `var(--seccion-aire)` =
`clamp(2.5rem, 1.9429rem + 2.2857vw, 4rem)`.

## Checks

- **Tokens and arbitrary values (Art. VII, C4).** CONFIRMED: none of the
  touched `.vue` or story files has an arbitrary value or literal. Every new
  class maps to a theme token. `--seccion-aire` sits in `:root` and is read
  by two `@theme inline` tokens, following the existing § R18 pattern. The
  utilities reference `var(--header-offset)` directly, so the `lg` override
  (4.75rem → 5.5rem) still applies at the element.
- **Deleted tokens truly unused.** CONFIRMED: none of the 13 deleted tokens
  appears in `app/`, `tests/` (except the new "must not come back" guard),
  `.storybook/`, `docs/` (outside progress logs), `.claude/`, `AGENTS.md` or
  `.specify/`. The three story decorators moved from `py-bloque-y` to
  `py-seccion-aire`, and the Storybook build passes.
- **Scroll-spy.** CONFIRMED by reading the code:
  `shell/logic/useActiveSection.ts` builds its band from the computed
  `scroll-padding-top` and 50 % of the root. It uses no section sizes, and
  its tests pass. INFERRED: taller sections only mean fewer sections
  intersect the band at once. The active section is still the first anchor
  in order that is in the band.
- **Anchor jumps.** CONFIRMED: `html { scroll-padding-top: var(--header-offset) }`
  and the anchor ids are unchanged, and `static-output` still matches
  `<section id="servicios"` and the others. The jump lands at the top of the
  section, which is now viewport minus header tall, as designed.
- **Locale-switch scroll.** CONFIRMED: `localeSwitchScroll.ts` keeps
  progress as a fraction of each section's measured height, so the new
  heights do not change it. Its tests pass.
- **Reduced motion.** CONFIRMED: the change touches no motion token,
  transition or `scroll-behavior` rule.
- **Tests updated deliberately, not weakened.**
  - Each removed padding-class assertion has a stronger replacement. Every
    section pins its min-height class, `flex-col`, `justify-center` and the
    `aire` padding.
  - The layered sections also pin `flex-1` and the `w-full` + `mx-auto` +
    `max-w-contenido` trio.
  - The hero asserts `max-lg:justify-center` is gone. `StatusSection`
    checks both presets in a loop.
  - `design-tokens.test.ts` drops only the pins of deleted or redefined
    tokens. It adds clamp checks at 40 / 64 px, exact pins on the four
    framing tokens (each declared once) and a guard that the 13 deleted
    tokens stay out.
  - The `static-output` edit is a comment only. The hero lookup by
    `min-h-portada-alto` is still unique per home document, and the tests
    pass.
- **Mobile.** CONFIRMED from screenshots at 390×844 and 768×1024:
  - Sections taller than the viewport grow with the 40 px aire at both ends.
  - The first blocks centre below the header.
  - Nothing is clipped horizontally (implementer measured
    `scrollWidth === innerWidth`).
  - `svh` is the right trade-off: no relayout when the browser bars hide.
    The cost is a small asymmetry while the bars are hidden (see note 3).
- **svh fallbacks.** INFERRED, no fallback needed:
  - Tailwind v4's own browser baseline (Safari 16.4, Chrome 111,
    Firefox 128) already supports `svh` (Safari 15.4, Chrome 108,
    Firefox 101).
  - On an engine without `svh`, `min-height: 100svh` is dropped at parse
    time. The `calc(… var())` form becomes invalid at computed-value time,
    so `min-height` falls back to `auto`.
  - Either way the section degrades to content height plus symmetric
    padding. Nothing breaks.
- **Static purity (Art. IV).** CONFIRMED: no `server/` route was added and
  `pnpm generate` emits a static build.
- **Architecture (C3).** CONFIRMED: no new imports. Touched components
  range from 54 to 146 lines (all under 200). `StatusSection` lost the
  `BLOCK_CLASSES` map, which is now dead with one shared class list.
- **Legal pages, footer, cookie UI.** CONFIRMED unchanged. They use none of
  the deleted tokens.
- **i18n (C8).** No copy changed and no new page.

## Non-blocking notes

1. **Responsive anchors (Constitution Art. VII).** Art. VII says the build
   "MUST match the design" at 390 / 1440. The section heights and vertical
   paddings at those widths now depart from the `.pen` (hero 740 → 1000,
   paddings 72 → 140, and the others) by Roberto's explicit request of
   2026-11-08.
   - The departure is recorded in the `global.css` framing comment and in
     each component's doc comment. That matches the precedent of
     "deliberate departure from the `.pen`" (spec 045 FR-041).
   - Recommended: Roberto decides whether to also record it in
     `docs/business/muush-1.0.md` or update the `.pen`, so a future
     `.pen`-driven task does not "fix" it back. That is a docs/human
     edit, not an implementer change.
2. **Comment line width.** Several new or edited doc-comment lines run past
   80 columns. Examples: `HeroSection.vue` (the "390: x padding 24, gap 22;
   the buttons are the mobile size…" line), `TeamCompositionSection.vue`,
   `AssessmentSection.vue`, the "Height and vertical padding are the
   section framing (`global.css`, Roberto 2026-11-08)" lines, and the
   "Cómo se arma" block in `global.css`. Biome does not flag comments.
   Optional re-wrap when convenient.
3. **Mobile with the browser bars hidden.** With the bars hidden, the
   visible viewport is taller than `100svh`, so a section's content sits
   slightly above true centre. This is accepted by choosing `svh` over
   `dvh` (no jump while scrolling), and the implementer report documents
   it. No action.
4. **Servicios at short desktop viewports (1232×752, 1440×900).** The
   content is taller than the frame, so after the nav jump the strip falls
   below the fold, as it did before. The implementer flagged this as a
   design decision (smaller cards or a different layout). It falls under
   the request's "taller content grows" branch, not a regression.
5. **Session close (C6).** `docs/harness/progress/history.md` and
   `current.md` need the leader's entry for this fix when the session
   closes.

## Evidence

- Screenshots and geometry:
  `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/centering/`.
  Spot-checked: 1440 home hero, 1440 Cómo trabajamos, 390 Cómo se arma.
- Reviewer command logs in the same scratchpad: `rev-check.log`,
  `rev-tc.log`, `rev-test.log`, `rev-gen.log`, `rev-init.log`.

## Re-review (rounds 2–3 + OG)

Reviewer run 2026-11-08, same branch, uncommitted, 31 files against
`master`. Covers rounds 2 and 3 of `fix-section-centering.md` and
`fix-og-image.md`.

### Verdict: APPROVED

No blocking findings. The numbered findings below are non-blocking.

### Scope (protocol step 0)

The situation is unchanged. `feature_list.json` has nothing in
`in_progress` or `reviewing` (only 15/18/19 `superseded` and 51 `blocked`).
This is an owner-requested fix with no feature entry, so C2 holds.

### Commands, re-run by the reviewer

| Command | Result |
|---|---|
| `pnpm check` | exit 0, 549 files, no fixes |
| `pnpm typecheck` | exit 0 |
| `pnpm test` | exit 0: 191 files, 2698 tests passed |
| `pnpm generate` | exit 0 |
| `./init.sh` | exit 0, "Environment ready" (includes `storybook:build`) |

The first chained run failed `test`/`generate`/`init` with "Another Nuxt
build is already running (PID 41352)". That was a transient lock from a
concurrent process, which had exited by the time I checked. The sequential
re-run above is clean. Logs: `rr-*.log` (first run) and `rr2-*.log` in
`/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/`.

Compiled CSS, CONFIRMED in `.output/public/_nuxt/entry.*.css`:
`.-scroll-mt-cabecera{scroll-margin-top:calc(var(--header-offset)*-1)}`,
`.min-h-portada-alto{min-height:100lvh}`,
`.min-h-seccion-alto{min-height:100svh}`,
`.pt-seccion-arriba{padding-top:calc(var(--header-offset) + var(--seccion-aire))}`,
`.py-que-es-y{padding-block:clamp(4.5rem,3.3857rem + 4.5714vw,7.5rem)}`.
`html` still has `scroll-padding-top:var(--header-offset)`.

### Checks

- **In-page anchors (CONFIRMED by reading the code).**
  - Nuxt's `router.options.js` (`_getHashElementScrollMarginTop`) passes
    `top = scrollMarginTop + scrollPaddingTop` = −88 + 88 = 0 to
    vue-router. vue-router subtracts it from the element's offset, so the
    section's top edge lands at y 0 on same-page hash clicks, cross-page
    hash navigations and the initial load (`START_LOCATION`).
  - A native fragment scroll without JS applies the same two properties
    with the same sum. Negative `scroll-margin` is valid CSS.
  - `--spacing-cabecera` reads `var(--header-offset)` at the element. It is
    `@theme inline`, so the `lg` override (76 → 88 px) applies to both
    margin and padding, and they cancel at every width.
  - The one other `scrollIntoView` (`useFormSteps.ts`) targets the form
    panel, not a section, so it is unaffected.
- **Scroll-spy (CONFIRMED by code, INFERRED for runtime).**
  `useActiveSection.ts` still builds its band from `scroll-padding-top` (88)
  down to 50 %. After a jump the target spans 0 → ≥ viewport, so it
  intersects the band. The previous section ends at y 0, above the band's
  top, so it drops out of `inView` and enters `passed`. The active item is
  the target, and `atTop` is false. No code change was needed, and its tests
  pass. The implementer's 88-capture CDP run (`r3-geometry.json`) reports
  `top = 0` for every anchored landing.
- **Language-switch scroll (CONFIRMED by code).** The reading line is still
  `scroll-padding-top`. After a jump it sits 88 px into the target section,
  so the snapshot carries progress 88 / h instead of 0. This still restores
  the same section, but see finding 1.
- **Token discipline (Art. VII, C4). CONFIRMED.**
  - No arbitrary values in any touched `.vue` or story. The only `[…]` hits
    are test regexes.
  - The new tokens (`--spacing-seccion-alto/arriba/aire`,
    `--spacing-cabecera`, `--spacing-que-es-y`) are in `@theme inline`.
    `--seccion-aire` is in `:root`, following § R18.
  - `design-tokens.test.ts` pins each new token's exact value, declared
    exactly once. It pins `seccion-aire` at 24 / 32 and `que-es-y` at
    72 / 120, and lists `--spacing-portada-arriba` among the retired names.
  - Using `lvh` (first blocks) and `svh` (others), and never `dvh`, is
    deliberate and documented in `global.css`.
- **Tests not weakened. CONFIRMED.**
  - Every removed assertion pinned a deleted token: `py-bloque-y`,
    `py-mapa-y`, `pt-pagina-arriba`, `min-h-pagina-alto`, `BLOCK_CLASSES`,
    `pt-bloque-y`/`pb-diagnostico-abajo`, the `portada-*` clamps, and the
    `url: null` small-card output test.
  - Each has a stricter replacement: min height, flex column, centring and
    both paddings. The four anchored sections also pin
    `-scroll-mt-cabecera`, the layered ones pin `flex-1` and the
    `w-full mx-auto max-w-contenido` column, and the hero pins
    `max-lg:justify-center` as absent.
  - The `seo-output` replacement pins the 7 share tags exactly once on all
    10 indexed pages, and `twitter:image:alt` as absent.
  - `static-output.test.ts` changed a comment only.
- **OG image (CONFIRMED in the generated HTML).**
  - Each of the 12 documents has `og:image`, `:width` 1200, `:height` 630,
    `:type image/png`, `:alt muush`, `twitter:card summary_large_image` and
    `twitter:image`, all pointing at
    `https://assets.muush.dev/brand/cover/og-image.png`.
  - `public/og-image.png` and `.output/public/og-image.png` are absent.
  - `resolveShareMeta` stays pure and fully tested, including the shipped
    `SHARE_IMAGE`.
  - `ShareImageType` mirrors unhead's accepted union, and `typecheck` passes.
  - No credentials are involved: it is a public asset URL, the same host as
    `SITE_LOGO_URL`.
- **404 against spec 036. CONFIRMED compliant.**
  - FR-012 forbids canonical, hreflang, `og:url` and `og:locale` on the
    404, and `contracts/build-output.md` adds `og:title`, `og:description`
    and `description`.
  - Neither restricts `og:image` or `twitter:*`.
  - Research F22 and implementation-report lines 64–65 record that the
    layout's site-wide `useSiteSeo()` tags (`og:type`, `og:site_name`,
    `twitter:card`) are kept on the 404 by design. The share image is one of
    those site-wide tags.
  - Generated `/es/404` and `/en/404` carry no `og:url` or `og:locale`, and
    carry the image tags once. The existing FR-012 assertions are unchanged
    and pass.
- **Architecture, static purity, i18n.** CONFIRMED:
  - no new cross-feature imports;
  - `resolveShareMeta.ts` (logic) imports only types from `shell/data`;
  - all touched components are under 200 lines;
  - no `server/` route; the build is static;
  - no copy changed. The `alt: 'muush'` is a brand name, the same in both
    locales, not translatable copy.

### Findings (non-blocking)

1. **Stale comment and a small drift in the language-switch scroll.**
   - `app/features/shell/logic/localeSwitchScroll.ts:15` still says "a
     section reached through its nav link is at progress 0 and is restored
     exactly there".
   - Since round 3, a jumped-to section has its top at y 0, so the
     88 px reading line puts the snapshot at progress 88 / h_A. The restore
     lands the section top at 88 × (1 − h_B / h_A) px (INFERRED from
     `resolveScrollTop`).
   - The drift is 0 for sections that are exactly one viewport tall in both
     locales, the usual case. It is a few px for grown sections whose height
     differs between ES and EN (the forms, Servicios at short viewports).
     It is still the right section, and when the drift is positive the
     exposed strip is only the previous section's empty bottom padding
     under the header.
   - Suggested: update the comment, and optionally measure the reading line
     as `scroll-padding-top + scroll-margin-top` of the anchor, or accept
     the drift as is. Leader's call.
2. **Anchor landing depends on Nuxt internals.**
   - The y 0 landing relies on Nuxt's router adding `scroll-margin-top` and
     `scroll-padding-top` (Nuxt 4.5.2) and on browsers honouring a negative
     `scroll-margin`.
   - Unit tests pin only the class and the token. Only the implementer's
     CDP run verifies the landing itself.
   - Worth re-measuring after a Nuxt upgrade. The `global.css` comment
     already names the mechanism.
3. **404 share test is narrower than the indexed pages' test.**
   `tests/not-found-output.test.ts` pins `og:image`, its width, height and
   type, and `twitter:card`. It does not pin `og:image:alt` or
   `twitter:image`. The generated 404 HTML does carry both (checked above).
   Optional: add the two `toContain` checks for parity.
4. **Qué es muush has no header strip.** It is not an anchor target, so this
   is acceptable. At 390 its 72 px top padding is 4 px less than the 76 px
   header. That only matters if it ever gets an anchor; it would then need
   `pt-seccion-arriba` and `-scroll-mt-cabecera` like the others.
5. **Carried over from round 1.** These still stand:
   - note 1 (departure from the `.pen` anchor heights; Roberto to decide
     whether to record it in `docs/business/`);
   - note 2 (doc-comment lines over 80 columns, now also `HeroSection.vue`
     l. 20/25, `AboutHeroSection.vue` l. 22, `ServicesSection.vue` l. 25,
     `TeamCompositionSection.vue` l. 32);
   - note 4 (Servicios content 765 px does not fit below the header at
     ~1220×756; design decision, reported by the implementer);
   - note 5 (C6: `history.md` / `current.md` entries at session close).
