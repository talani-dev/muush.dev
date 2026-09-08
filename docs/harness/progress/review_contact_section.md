# Review: feature 16 `contact_section`

APPROVED

## Verified independently (not trusted from the report)

- Status was `reviewing` in `feature_list.json` at start. `./init.sh` exit 0,
  49 files / 582 tests (matches expected baseline delta from 41/519).
- No-submit guarantee: `ContactSubmitState = 'idle' | 'invalid'` only, no
  third value anywhere in `useContactForm.ts`. `previewState` exists only in
  `ContactForm.vue`'s props/template and `.stories.ts`; grep confirms
  `ContactSection.vue`/`useContactContent.ts`/`app/pages/index.vue` never
  reference it.
- Live CDP session against `pnpm generate` + served `.output/public`: empty
  submit focuses `name` with 4 correct errors, zero network requests; valid
  submit (name/email/identity/need filled) fires **zero** network requests,
  form stays mounted, submit stays enabled, no success/sending text appears.
  Compiled chunk `DqoTO136.js` (holds `ContactForm`) greped clean for
  `fetch(`, `XMLHttpRequest`, `axios(`, `setTimeout`, and any literal
  endpoint URL beyond the SVG namespace string.
- Both CTAs on the built `/es` and `/en` pages render as real
  `<a href="/es#contacto" ...cursor-pointer">` / `/en#contacto`; Hero's old
  `<button type="button">` is gone. Exactly 3 `type="button"` remain on the
  page, all `data-v-398024fd` (`PurposeConstellation.vue`) — the report's
  attribution is accurate.
- errorFor bug: live check confirms zero error borders/aria-invalid before
  any interaction. Mutation-tested the regression test by reverting the
  `state.value !== 'invalid'` guard — test fails as expected; restored file
  verified byte-identical after.
- WhatsApp field: mounts on selecting WhatsApp, unmounts (not hidden) on
  switching to Correo, remounts empty on selecting WhatsApp again — verified
  live via real radio-input change events, not just source reading.
- Paint order measured live: section backdrop `z-index:-3`, page-wide dot
  grid `z-index:-2`, section itself `position:relative`, `z-index:auto`,
  transparent background, no transform/isolation/will-change/filter. 4
  section backdrops total on the page (Hero/Purpose/Services/Contact),
  consistent with "fourth section bound by this contract."
- Viewport order measured live: desktop DOM order text→form→alt with grid
  placement; mobile (390×1260) visual order text (top 2206) → form (2437) →
  alt route (3120), i.e. alt route below the form as required.
- Contrast: sampled actual composited pixels from a real screenshot (not the
  declared token value) — typed input value text vs. panel background
  measured **9.93:1**, comfortably above 4.5:1. This is an independent live
  measurement, distinct from (and slightly lower than) the implementation's
  own modelled ~11.9:1 estimate — both clear the floor, and the `global.css`
  comment is honest that its number was modelled, not measured, flagging it
  for confirmation.
- Zero overflow 320–2560px, confirmed by sweep.
- `git diff --stat` confirms zero changed lines in `SectionGlow`, `DotGrid`,
  `SectionBackdrop`, `BotonPrimario`, `Pill`, `HeroSection.vue` (except the
  1-line `heroContent.ts` data file), `PurposeSection.vue`,
  `ServicesSection.vue`, `app/features/shell/**`, `app/layouts/**`.
- Module boundary: `ContactSection.vue` imports only `{ ContactForm,
  ContactFormContent }` from `@/features/forms` (the barrel); `formContent`
  itself is resolved in `app/pages/index.vue` via `useContactFormContent`
  from the same barrel — `forms/` carries no `landing.*` key, matching D-1/D-4.
- R36 guard: `SectionGlow.test.ts` unmodified, new tokens are
  `--spacing-contact-*`/`--contact-*`, none match `--(color|spacing)-glow-*`.
- Sixth identity option ("Restaurante o bar") absent from the built page and
  from `contactFields.ts`'s type — confirmed by grep.
- Mutation-tested `useContactForm.test.ts`'s email-format assertion by
  weakening `EMAIL_PATTERN` to `/.*/ `— test fails as expected; restored,
  suite green again.
- No hex/px literals or arbitrary Tailwind `[...]` values in any new/changed
  `.vue`/`.ts` file (excluding tests/stories).

## The dependency-chain finding, judged

The glow vertical baseline is honestly flagged: `global.css`'s comment for
`--spacing-contact-glow-foco-y` explicitly states the deltas are arithmetic
(confirmed) while the baseline itself is a documented placeholder (`0rem`,
anchored at the section's own top edge), owner leader/Clau, pending a full
`.pen` read once Proyectos ships. This is the same convention as R2/R11/R38,
not a guess dressed as measurement. Worth escalating as a pattern: any later
section whose glow math depends on the page-absolute position of a
still-deferred earlier section (15/18/19) will hit the same wall. Not a
blocker for this feature.

## Minor, non-blocking observations

- `forms.contact.success.title` ships the literal bracket placeholder
  "[correo/WhatsApp]"/"[email/WhatsApp]" verbatim from `ui-map.md` § 7 — an
  unreachable-state copy that will need dynamic interpolation once a real
  submit destination exists. Correctly copied verbatim per FR-016; flagged
  for whoever wires the real endpoint.
- Honeypot/anti-spam deferral (FR-017/A-04) is recorded in `spec.md`, not
  repeated as a code comment in `forms/` — acceptable since the acceptance
  criterion only requires it be reported, not silently dropped, and spec.md
  is the report.

## Not independently re-verified (low risk, time-bounded)

- Storybook's three unreachable-state stories rendering pixel-correct
  (`pnpm storybook:build` passed; did not open a browser against
  `storybook-static` to inspect Sending/Success/ServerError visually).
