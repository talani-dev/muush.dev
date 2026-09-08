# Research: Floating nav redesign

No `[NEEDS CLARIFICATION]` markers remain in `spec.md`; every open question
was resolved there with an owner and a reversal cost. This file records the
implementation-level decisions plan.md's *Implementation Approach* section
made, in the research-log format the rest of this repository uses.

## R-1 · Pill inset reuses `--spacing-page`, not a new token

- **Decision**: The pill's horizontal inset is `--spacing-page` (already
  `clamp(1.5rem, ..., 5rem)`, resolving to 80 at the desktop end); only the
  vertical inset from the viewport top (`y24`, desktop-only since the pill
  is an `lg`-and-up treatment) gets a new token.
- **Rationale**: `--spacing-page` already governs the content column's
  horizontal margin and the nav's own row padding before this feature; two
  tokens holding the same 80px value would drift the first time one of them
  is retuned. Reuse is the Article VII default; a second token needs its own
  justification, which does not exist here.
- **Alternatives considered**: A dedicated `--spacing-nav-pill-x` token,
  rejected for the drift reason above unless the implementer's measurement
  shows the pill's inset does *not* actually coincide with the page gutter
  (in which case it is reported and given its own token, not forced to
  match).

## R-2 · The CTA's arrow is composed markup, not a new `BotonPrimario` prop

- **Decision**: `SiteNav.vue` places an `aria-hidden` `<span>→</span>`
  inside `BotonPrimario`'s existing default slot, ahead of the label.
- **Rationale**: `BotonPrimario`'s contract was deliberately kept narrow at
  feature 2 ("Deliberately NOT in this contract... before a consumer asks
  for it"). One consumer wanting a leading arrow does not meet that bar. The
  slot already accepts arbitrary content, so this costs zero contract
  surface.
- **Alternatives considered**: (a) A `leadingIcon`/`arrow` prop on
  `BotonPrimario` — rejected, no second consumer exists yet and it would
  reopen a frozen, already-tested component's prop surface for one caller.
  (b) Reusing the `LinkArrow` component inside the slot — rejected, `
  LinkArrow` renders its own `<a>`; nesting an anchor inside `BotonPrimario`'s
  `<a>`/`<button>` root is invalid markup.

## R-3 · Language toggle accessible name: two flat keys, not one parameterised key

- **Decision**: `shell.nav.switchToEs` / `shell.nav.switchToEn`, one pair of
  flat strings, each locale's file carrying both (mirrored, as
  `tests/i18n-parity.test.ts` already requires of every key).
- **Rationale**: A single key like `shell.nav.switchTo` with `{locale}`
  interpolated would need the *target* locale's display name as a value —
  itself translatable copy, which would have to be resolved and passed in,
  adding a second lookup for no reduction in file count (there are only ever
  two locales, so two keys are already minimal). Flat keys also make the
  parity test's flat key-set comparison trivially correct with no special
  case for interpolation placeholders.
- **Alternatives considered**: One parameterised key — rejected for the
  reason above. Reusing the visible `ES`/`EN` glyph as the accessible name —
  rejected outright: a screen reader user does not learn what activating the
  control *does* from a code that already announces which locale is active
  (spec User Story 4, Scenario 5).

## R-4 · The toggle stays a link, not a button

- **Decision**: The 44×44 circle remains a `<NuxtLink :to="href">`,
  matching today's active/inactive halves of `LanguageToggle.vue`.
- **Rationale**: It navigates to a real, resolvable URL — the same one
  `resolveLocaleDestination.ts` already computes — and `NuxtLink` gives that
  for free, including working correctly with no scripting. A `<button>`
  would need a manual `navigateTo()` call in an `onClick`, which breaks with
  no-JS (this component's existing no-JS path, per `rules.md` § R9/R22,
  depends on the anchor being real markup, not a script-driven navigation).
- **Alternatives considered**: `<button>` with a click handler — rejected
  for the no-JS regression above.

## R-5 · `useShellNavigation.ts` and `useNavCtaReveal.ts` need zero code changes

- **Decision**: Confirmed by tracing both files' outputs against
  `SiteNav.vue`'s consumption: `navItems` is a generic map over whatever
  `NAV_ITEMS` contains (feature 3's `resolveItem`), so editing the *data*
  changes the *labels* with no logic edit; `showNavCta`/`useNavCtaReveal`
  are consumed via the same `showCta` prop and the same `.site-nav__cta`
  class, which this feature does not rename.
- **Rationale**: Isolating the diff to `ui/`, `data/navigation.ts` and
  `global.css` is what keeps this a visual-only feature, matching the spec's
  explicit non-goals.
- **Verification method**: `git diff --stat` against both files, checked by
  the implementer before reporting completion — same discipline feature 20's
  review applied to confirm `ContactForm.vue` stayed byte-identical across
  rounds.

## R-6 · Mobile nav: compare before editing, per `rules.md` § R32's chain of custody

- **Decision**: Treat the leader's reading of frame `X3Xquh` (390×76,
  unchanged) as the starting assumption, but require the implementer to
  measure the *built* mobile row against it before finalizing — not as a
  formality, since `findings.md` § R55 already showed one prior case where
  the built measurement (78.19px) differed from the frame's stated one (76)
  for an unrelated reason (the hamburger's own border).
- **Rationale**: A subagent cannot open the `.pen` itself (§ R32); the
  leader's reading is CONFIRMED evidence, not a document to distrust, but
  "unchanged in the frame" and "unchanged in the shipped component" are two
  different claims and only one of them this feature can verify directly.
- **Alternatives considered**: Skip the comparison and trust the frame
  reading outright — rejected, since FR-020 exists specifically to catch a
  case where the two disagree, and skipping it would make that requirement
  decorative.
