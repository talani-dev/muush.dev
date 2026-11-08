# Review · feature 47 `v2_cleanup_and_release` (cleanup scope)

- **Reviewer run:** 2026-11-07, branch `chore/v2-legacy-cleanup`, uncommitted tree (160 paths).
- **Scope reviewed:** the "ALCANCE AJUSTADO (Roberto, 2026-11-07)" paragraph and the four-item `acceptance` array in `feature_list.json`. No merge and no bump expected or found (`package.json` still 2.2.0).
- **Status precondition:** `feature_list.json` id 47 is `reviewing` (CONFIRMED).

## Verdict: APPROVED

No blocking findings. Non-blocking notes are at the end.

## Commands (re-run by the reviewer)

| Command | Result |
|---|---|
| `pnpm check` | exit 0, 549 files, no warnings |
| `pnpm typecheck` | exit 0 |
| `pnpm test` | exit 0, 191 files, 2699 tests |
| `pnpm generate` | exit 0, 8 files in `_fonts/` |
| `pnpm storybook:build` | exit 0, 397 entries; top-level groups `About, Forms, Foundations, Landing, Legal, Shared, Shell`; no `Legacy` title in `storybook-static/index.json` |
| `./init.sh` | exit 0 |

## Checks

### 1. Nothing v2 still needs was deleted (CONFIRMED)

- Grepped `app/ tests/ .storybook/ nuxt.config.ts i18n/ public/` for every deleted path and name: `/legacy/`, `legacyFormContent`, `useNavCtaReveal`, `useHeroSentinel`, `useCursorSpotlight`, `paperclip`, `logomark-on`, `services-float`, `spotlight-red-dots`. Only hits are comments in `tests/forms-config.test.ts:202` and `tests/token-literals.test.ts:41,148` (history notes).
- Every v1 component name that also exists in v2 (`Lockup`, `PrimaryButton`, `Wordmark`, `HeroSection`, `ServicesSection`, `MobileMenu`, `SiteFooter`, `CvField`, `DialCodeSelect`, `SelectField`, `TextField`, `TextareaField`, `WhatsappField`, `servicesContent`) resolves to the surviving v2 file, not to a `legacy/` path. The rest (`CursorSpotlight`, `DotGrid`, `GlassPanel`, `Radar`, `Purpose*`, `Services{Timeline,Constellation,Connectors}`, `SiteNav`, `FooterColumn`, ...) have zero references.
- Every `var(--x)` in `app/` and `.storybook/` has a declaration (0 unresolved).
- Assets: remaining `@/assets/icons/*` imports all exist; nothing references `assets/logo/`. `i18n/` and `public/` are untouched.
- Non-deletion edits to `app/features/**`, `app/shared/logic`, `app/layouts`, `ShaderBackground.vue` are comment-only (the only non-comment diff line is inside a comment continuation).
- Built output vs a fresh `master` (53749f0) build in a temporary worktree: normalised HTML of all 13 pages is identical except the `prerenderedAt` timestamp. CSS class selectors: 394 removed, 0 added; of the removed ones, none is used as a class in shipped HTML or JS (`ease-out` and `filter` matched only as a CSS keyword / `Array.prototype.filter`; numeric hits are decimals).

### 2. Font fix (CONFIRMED correct and minimal)

- `nuxt.config.ts:310-321`: only `global: true` added to the two existing `fonts.families` entries, plus an explanatory comment (`nuxt.config.ts:292-302`).
- `_fonts/` file list identical to master (8 files). `@font-face` set: master 14, branch 12. The only two missing are `Poppins Fallback: sans-serif` and `Instrument Sans Fallback: sans-serif`. On master these were referenced only by `.font-poppins` / `.font-instrument`, and no shipped HTML/JS uses those classes. The v2 stacks (`--fuente-titulo`, `--fuente-texto`) are identical in both builds.

### 3. New test and `SocialNetwork` move (CONFIRMED)

- `tests/v1-retired.test.ts` is meaningful: it walks `app/` for `legacy` folders, scans `app/` + `.storybook/` sources for `Legacy v1` and v1 token names, checks the comment-stripped stylesheet for dotted paper / spotlight / layer-glow / radar / retired keyframes, pins the You cursor, and pins the `SocialNetwork` import direction.
- `app/shared/data/socialNetworks.ts` has no imports. Importers: `app/features/shell/data/types.ts:2` (data → shared/data, Article II satisfied), `app/shared/ui/SocialIcon.vue:5` (ui → data, allowed), `app/shared/ui/SocialIcon.test.ts:3`. No remaining import of the type from `SocialIcon.vue`.

### 4. Deleted tests (CONFIRMED none covered v2)

- 81 test/story files inside the eight `legacy/` folders tested only the deleted v1 code.
- `app/shared/logic/useNavCtaReveal.test.ts`: v1-only composable (importers were `legacy/HeroSection.vue` and `legacy/SiteNav.vue`).
- `tests/services-float-tokens.test.ts`, `tests/spotlight-red-dots-tokens.test.ts`: pinned v1 tokens only. The layout-mounts-no-spotlight half is now unnecessary because the components no longer exist (any reintroduction would fail typecheck).
- Edited tests (`design-tokens`, `forms-config`, `not-found-tokens`, `pill-air`, `tablet-layout-tokens`) lost only v1 assertions; all v2 assertions remain.

### 5. Acceptance

1. grep in `app/` + `.storybook/`: `--bone-`, `--ink-`, `--wine-`, `legacy-` = 0; `--red-` matches only `--red-muush-*` (accepted v2 family); `app/shared/ui/legacy/` absent; no `legacy/` folder under `app/`. PASS.
2. No `Legacy v1/` group; `storybook:build` passes. PASS.
3. Site looks the same: HTML identical, CSS only loses unused rules, fonts identical. Reviewer spot-check: headless Chrome, `--force-prefers-reduced-motion`, ES home and `/es/nosotros/` at 390 and 1440, master vs branch: **0 differing pixels** on all four. Poppins renders. The full width matrix (360-1920) and no-WebGL runs are the implementer's (impl-47), not re-run here. PASS.
4. All five commands and `./init.sh` pass. PASS.

## Non-blocking notes (for the leader)

- **N1 · test guard gap.** `tests/v1-retired.test.ts:56` (`/--(?:bone|ink|wine)-\d|--red-\d|\blegacy-[\w-]+/`) does not catch a re-added theme key like `--color-bone-200` or a utility class like `bg-ink-500`. Consider adding `--color-(?:bone|ink|red|wine)-\d` and a class-name pattern in a later change.
- **N2 · constitution is stale.** `.specify/memory/constitution.md:283-286` (Article VII) and the 2.1.1 sync note at `:38-39` still say v1 is "quarantined until feature 47 deletes it". Amend in a patch (2.1.4) to say it was deleted.
- **N3 · harness state.** `docs/harness/progress/current.md:3-5` still says "none active" on `feat/v2-consented-tracking` while 47 is `reviewing` on `chore/v2-legacy-cleanup` (C2). The feature `title` still says "release 2.0.0 (merge de muush-v2 a master)". Both are leader-owned docs.
- **N4 · i18n keys.** Keys that only v1 components read were not audited (impl-47 says so). That is a candidate follow-up, not in this scope.
- **N5 · font fallbacks.** The metric-fallback faces are gone. This changes nothing today because nothing referenced them, but v2 could opt into them later if CLS from font swap ever matters.
