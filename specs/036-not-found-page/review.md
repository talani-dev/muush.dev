# Review: feature 36 `not_found_page`

**Reviewer:** reviewer agent, 2026-10-15. Branch `feat/not-found-page`, uncommitted working tree.
**Status at review:** `reviewing` (confirmed in `feature_list.json`). The reviewer does not set `done`.

## Verdict: CHANGES_REQUESTED (documentation only)

The code, the build output and the browser behaviour pass on every point checked. The one blocker is
in the deliverable for muush-foundation. `contracts/edge-not-found.md` (and the spec) were only
partly aligned with G6, so the contract contradicts itself about the Stage 2 fallback for unprefixed
paths. Acceptance criterion 9 requires a clear fallback rule, so this has to be fixed before the
contract is handed over. No code change is requested. These are docs outside `app/`/`tests/`, so the
leader can fix them directly and re-submit; no re-implementation is needed.

## Findings, ranked

### Blocking

1. **Stage 2 fallback contradicts itself (G6 not fully propagated).**
   - The contract says unprefixed → English at `edge-not-found.md:30` and in the § 4 table (`:61`).
     The quickstart `serve.mjs` STAGE=2 rule also uses English.
   - These lines still say Spanish:
     - `contracts/edge-not-found.md:63`: "`/english`, `/enx`, `/EN/…` → Spanish". Should be English.
     - `contracts/edge-not-found.md:97`: Stage 2 `/xyz` expects `lang="es-MX"`. Should be `en-US`.
     - `contracts/edge-not-found.md:99`: Stage 2 `/200.html`, `/404.html` expect `es-MX`. Should be `en-US`.
     - `spec.md:191` (FR-014): "every other path → Spanish".
     - `spec.md:44` (G5 row): "Stage 2 … `/es/*` and unprefixed → Spanish".
     - `spec.md:45` (G6 row): "Stage 2 … still says unprefixed → Spanish … needs Roberto's call". This is now stale, since the leader aligned it.
     - `spec.md:148` (Edge cases): "at Stage 2, served the Spanish document".
     - `spec.md:71` (US1 priority): "Spanish … the fallback for every unprefixed URL at Stage 2".
   - muush-foundation would get a verification table that fails against the rule above it.

### Should fix (non-blocking)

2. **The `payload.path` deletion has no automated guard** (`app/features/shell/logic/useNotFoundDocument.ts:72`).
   - It is server-only (`import.meta.server`), commented, and listed in plan Complexity Tracking.
   - CONFIRMED in the output: the 404 docs' `__NUXT_DATA__` has no `path` key, while real pages keep `"path"`.
   - CONFIRMED in the browser: the address bar is kept on 14 URL×width runs in each stage.
   - The only guard is the manual quickstart § 3 check, and the comment itself says the failure is silent.
   - Suggestion: one assertion in `tests/not-found-output.test.ts` that the root object of each 404's
     `__NUXT_DATA__` has no `path` key. This would turn a Nuxt upgrade regression into a red test.
3. **plan.md Complexity Tracking (`plan.md:153-158`) does not record two deviations:**
   - the universal plugin `app/plugins/not-found-locale.ts`, which hooks every request's initial locale (D1/G6);
   - the unhead `content: null` + `tagPriority: 'high'` override for `og:locale` (D2).
   - `contracts/components.md` mentions neither.
   - Neither is a constitution violation: it is a Nuxt-native folder, a thin wrapper, and imports go through the barrel. But the Compliance Review asks for deliberate framework-behaviour workarounds to be recorded.
4. **Test names miss the `when <condition>` half of the Article X convention:**
   - `tests/not-found-output.test.ts:173,187,209,218,254,269,275,279,288`
   - `app/features/shell/logic/notFoundLocale.test.ts:38,71`
   - `app/features/shell/ui/NotFoundContent.test.ts:42,66,80`
5. **implementation-report.md § 1 is stale.**
   - Lines 13, 17 and 26 list `not-found-locale.client.ts`, `pinNotFoundLocale.ts` and the
     `pinNotFoundLocaleDuringHydration` export. § 9 replaced all three, and none of them exist now.
   - `spec.md` header still says "Draft — awaiting human gate".

### Informational

6. **A-06 is now CONFIRMED.**
   - `.github/workflows/deploy.yml:156` runs `aws s3 sync … --delete`, so `200.html`/`404.html` will be
     deleted from the bucket on the next deploy.
   - Contract § 6 step 4 therefore applies: if the current distribution's error responses point at either key, deploy and Stage 1 must happen back-to-back.
   - Nothing else in the repo depends on the two files:
     - code, tests and workflows: no reference;
     - `docs/business/rules.md:393,510,527`: historical mentions only, out of scope to edit.
7. **D7 chunk layout.**
   - The not-found scoped styles (`.not-found-rings`, `.section-backdrop`, `.ping`) are now inlined in every page's `<head>`, and `[data-v] svg{…}` appears twice.
   - Meta tags are byte-identical (md5) to the master build. The difference is a few hundred bytes of CSS. Accepted.
8. **`SiteNav.vue` was already over the 200-line limit** (523 lines on master, 540 now, mostly comments). Pre-existing; not introduced here.

## Specific checks requested by the leader

- **D1–D6 deviations.** Sound and within spec intent.
  - **D1/G6 plugin** (`notFoundLocale.ts`):
    - Uses only the public `i18n:beforeLocaleSwitch` hook.
    - Rule 1 pins the server-recorded locale only while hydrating, and only when the 404 recorded state.
    - Rule 2 applies only to the initial locale of an unmatched non-`/` path.
    - Unit-tested.
  - **D2 `og:locale` override:** the 404 heads have no `og:locale` or `og:locale:alternate`. Normal pages' meta are unchanged (md5 identical vs master).
  - **D3 glow-y:** measured glow centre (1280, 240) at 1440 and (230, 240) at 390, which matches the reference page-y 240.
  - **D4 biome:** the exclusion is limited to `specs/**/reference`, which is verbatim external material with a recorded sha256. Acceptable.
  - **D6 nav min-height token:** `--spacing-nav-cta-h` is derived from the existing tokens. Measured nav 72 px at 1440 and 78 px at 390 on the 404. The class is bound only when `cta` is absent, and an output test pins the unchanged class on the 4 pages.
  - **D7:** see finding 7.
- **`payload.path` deletion.** Server-only and commented. Guarded only by a manual check (finding 2).
- **Plugin vs normal pages and `/`:**
  - Prerendered SSR: the `<body>` of `/es`, `/en`, `/es/nosotros`, `/en/about` is identical to a master build (script-stripped, scoped id normalised, 0 diff lines). Head meta tags are identical.
  - Hydration in headless Chrome at 1440 and 390: correct lang/title/toggle, nav CTA present, no console error or hydration warning.
  - `/` (static `index.html`, byte-identical to master) lands on `/es` es-MX.
  - `pnpm dev` (127.0.0.1:3077, then stopped):
    - `/es`, `/en`, `/es/nosotros`, `/en/about` render 200 in their own locale.
    - `/fr/es`, `/xyz`, `/esx/abc`, `/en/xyz` render 404 en-US.
    - `/es/xyz` and `/es/nosotros/zz` render 404 es-MX.
    - `/` renders the static redirect to `/es`.
- **SEO:**
  - Each 404 head has one title, exactly one `robots` = `noindex`, and no canonical, hreflang, description, og:url or og:locale.
  - `sitemap.xml` lists the same 4 `<loc>`. `robots.txt` and `index.html` are byte-identical to master.
  - `200.html` and `404.html` are absent.
  - `tests/seo-output.test.ts` and `tests/static-output.test.ts` are unmodified and pass.
- **Existing pages:**
  - The body is unchanged apart from the SiteNav scoped id.
  - The nav CTA is present on `/es`, `/en`, `/es/nosotros` and `/en/about`, in SSR markup and after hydration.
  - The 404s have 0 `site-nav__cta`, including inside `<noscript>`, and exactly 1 `.led`.
- **Architecture:**
  - Everything lives in `app/features/shell/{data,logic,ui}` and is exported through `index.ts`.
  - `app/error.vue` and the plugin are thin and import only from `@/features/shell`.
  - Dependency direction holds (data imports nothing upward). Relative imports stay in the same directory.
  - No hardcoded colour/spacing literals in the new components. `<script setup lang="ts">` throughout.
  - `nitro.preset` is still `'static'`, with no `server/` route.
  - No new dependency (`package.json` and lockfile untouched). No secrets.

## Independent verification (CONFIRMED)

- **`./init.sh`:** exit 0.
  - 93 test files and 1324 tests pass.
  - generate and storybook:build OK.
  - C2: only feature 36 is in `reviewing`.
- **Browser** (quickstart `serve.mjs` bound to 127.0.0.1, `probe.mjs`, headless Chrome), Stage 1 and Stage 2:
  - URLs: `/en/no-existe`, `/es/nada`, `/xyz`, `/fr/abc`, `/fr/es`, `/en/about/zzz`, `/en/zz?x=1#frag`, each at 1440 and 390.
  - Every run: address bar kept, `navCta:false`, `leds:1`, `links:0`, `robots:noindex`, net 404, no console output.
  - Stage 1: always en-US.
  - Stage 2: `/es/nada` es-MX, everything else en-US.
  - Click flows (toggle, LED, About shortcut) land on the right pages.
- **Measurements:**
  - Rings 700/500.03/300.03 at 1440 and 420/300.03/180.03 at 390.
  - Ring strokes bone-100 @0.08 and @0.12, red-400 @0.24.
  - `scrollWidth` equals the viewport at both widths. Backdrop z-index −3. Rings `aria-hidden`.
- **Cleanup:** all servers and probe Chrome instances were stopped. Scratch artefacts are in the session scratchpad only.

## Checkpoints

- **C1, C2, C3, C5, C7 (tasks 37/37 `[x]`, Phase −1 gates ticked, no NEEDS CLARIFICATION), C8:** green.
- **C4:** green, except the pre-existing SiteNav size (finding 8).
- **C6 / history:** session close is the leader's.

To approve on re-review: fix finding 1. Findings 2–5 are recommended.

---

# Round 2 (2026-10-15)

**Status at review:** `reviewing`. Feature 36 is the only active feature.

## Verdict: APPROVED

Round 1's blocking finding is resolved, and so are the recommended findings 2–5. One stale
description is left in `data-model.md`. It does not block approval, but the leader should fix it
before commit (docs only, no re-review needed).

## Checks (CONFIRMED)

- **`./init.sh`:** exit 0.
  - 93 test files and 1326 tests pass (+2 since round 1).
  - typecheck, check, generate and storybook:build OK.
- **Finding 1 (G6 alignment): fixed.**
  - `spec.md` lines 29, 44, 45, 71, 148 and 191 (FR-014) now agree that Stage 2 sends `/es`/`/es/*` → es and every other path → en.
  - `contracts/edge-not-found.md` agrees: the § 4 table, the prefix note at line 63, and the § 7 Stage 2 rows for `/xyz` and `/200.html` (`en-US`).
  - `research.md` F10 is marked superseded.
- **Finding 2 (payload guard): fixed.** The new test is at `tests/not-found-output.test.ts:269`.
  - It asserts the 404's `__NUXT_DATA__` root has no `path` key. As a control, it asserts the locale home does have one.
  - I ran a mutation check on a scratch copy of the working tree: with line 72 of `useNotFoundDocument.ts` commented out, `pnpm generate` writes `path` into both `es/404` and `en/404`. The test's `not.toContain('path')` assertion would therefore fail. The real build has no `path` key.
  - Caveat: I checked the mutant output with an equivalent script, not by running vitest. The repo's vitest global setup re-runs generate and could not run from the scratch copy.
- **Finding 3: fixed.** `plan.md` Complexity Tracking now has rows for the universal locale plugin and for the `og:locale` null override.
- **Finding 4: fixed.** Every test name in the new not-found test files now has the "when" part.
- **Finding 5: fixed.** Implementation-report § 1 names the current files and notes what each replaced.

## Remaining (non-blocking)

- **`data-model.md:94-95`** still says `es/404/index.html` is "served for `/es`, `/es/*` and every unprefixed/unknown path", and that `en/404` is for `/en`, `/en/*` only. Under G5 and G6 this is wrong in both stages. It should read:
  - Stage 1: `en/404` for every missing path.
  - Stage 2: `es/404` for `/es`, `/es/*` only; `en/404` for everything else.
- **`tasks.md:135`** (MVP note: "Spanish 404 is the fallback for every missing path") is historical plan text. Optional fix.

## Process disclosure

During the mutation check, `rm -rf node_modules/.cache` inside the scratch copy followed the
`node_modules` symlink and deleted the real repo's `node_modules/.cache`. That is a build cache only,
with no source or dependency files. The `./init.sh` run afterwards passed (exit 0). No other file in
the repo was touched apart from this `review.md`. I started no server in this round.
