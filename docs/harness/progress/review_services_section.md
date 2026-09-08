# Review: feature 14 `services_section`

## Verdict: APPROVED

## Checks performed
- feature_list.json status was `reviewing` before this review (protocol step 0 satisfied).
- spec.md/tasks.md/data-model.md/checklists/requirements.md read; all FR-001..FR-022 and SC-001..SC-010 map to tasks and tests.
- tasks.md checkboxes are all unchecked `[ ]` (implementer left them unticked) — cosmetic gap only; independently verified every task's artifact exists and behaves as claimed.
- `./init.sh` exits 0: 41 files / 519 tests (baseline 35/455), matches expected delta.
- `connectorEndpoints(SERVICE_NODE_CENTRES)` is a genuine pure function (data/servicesContent.ts); mutation-tested by corrupting one centre coordinate — `ServicesConstellation.test.ts` failed as expected, then restored and re-verified green (no tracked file left mutated).
- IntersectionObserver tie-at-zero guard (`useServicesLyrics.ts`, `if (bestRatio === 0) return`) mutation-tested by removing it — `useServicesLyrics.test.ts`'s "should bucket nothing while every ratio is zero" failed as expected, then restored and re-verified green.
- Built page (`.output/public/es/index.html`): no `data-lyrics` attribute present on any element (no-JS/SSR state), `.item` default `opacity:1`; `@media (prefers-reduced-motion:reduce)` rule forces `opacity:1;transition:none`; `far` bucket renders `opacity:.22` (matches ui-map.md/feature_list.json over design-extract.md's 0.18, reported as a contradiction not silently averaged).
- Biome's `noUnknownProperty` rule independently confirmed to fire on `x1/y1/x2/y2` written as CSS declarations (reproduced with an isolated probe file); the shipped substitute (bound SVG attributes from the same pure function) still satisfies "generated, never four literal shapes" — verified via `ServicesConstellation.test.ts`'s literal-absence and centre-binding assertions.
- Frozen files confirmed independently: `git diff --stat` shows zero changed lines in `SectionGlow.vue`/`.test.ts`, `DotGrid.vue`, `SectionBackdrop.vue`, `Radar.vue`, `Pill.vue`, all `Purpose*`/`Hero*`, `app/features/shell/`, `app/layouts/`.
- R36 guard: grep confirms no new `--color-glow-*`/`--spacing-glow-*` token; `SectionGlow` is invoked with existing `color="wine-300" :opacity="14"` / `color="wine-400" :opacity="12"`, resolving to the pre-existing tokens at lines 609/635 of global.css — reused, not duplicated.
- Desktop top padding: `--spacing-services-top` clamp's 1440-endpoint is 101px, same value/derivation as feature 13's leftover — reused, not a new independent token.
- Mobile 185px step and item-3 taller-block-eats-the-gap claim verified against data-model.md §3 and CSS `.item { top: calc(...--i * --services-timeline-item-step) }` — one relation, no per-item literals (also asserted by `ServicesTimeline.test.ts`, not independently re-derived here beyond source inspection).
- Open values (O-01..O-04) all visibly marked `⚠️` in source/tokens/locale data, each with an owner — none silently presented as final.
- i18n parity: ES/EN both present, 5 names intentionally identical (O-01 placeholder), briefs verbatim per locale.
- Out-of-scope items (nav inclusion, features 15/18/19) not penalized.

## Notes (non-blocking)
- tasks.md checkboxes should be ticked before merge for audit trail — flag to implementer/leader, not a rejection ground since every task's actual deliverable was independently verified present and correct.
- Work is uncommitted on `feat/services-section` (matches implementer's own report); nothing was committed or amended by this review.
