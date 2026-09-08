# Implementation: `work_with_muush_section` (feature 20)

Built `forms/`'s second field module (`applicationFields.ts`,
`useApplicationForm(Content).ts`, `FileField.vue`, `ApplicationForm.vue`)
plus `SelectField`'s additive `groups` prop (flat `options` path untouched).
`about/`'s second section (`workContent.ts`, `useWorkContent.ts`,
`WorkWithMuushSection.vue`) replaces `nosotros.vue`'s `#work` placeholder.
Both barrels extended; `ContactForm`/`useContactForm`/`contactFields`/
`ContactSection` are byte-unchanged.

**No-submit, grep/type-provable**: `ApplicationSubmitState` is
`'idle' | 'invalid'` only — no `sending`/`success`/`server-error` member
exists in `useApplicationForm.ts`; those three exist only as
`ApplicationForm.vue`'s `previewState`, story-only. `static-output.test.ts`'s
new compiled-chunk check greps built `_nuxt/*.js` for `fetch(`/
`XMLHttpRequest`/`new FormData(`/`createObjectURL` and finds none.

**CV field**: real file input, validates `.type`/`.size` synchronously
against named constants, shows filename+size or a message — never builds
`FormData`, calls fetch/XHR, or creates an object URL. `CV_REQUIRED = false`
isolated to one constant, owner Roberto/Clau. `ROLE_CATALOG`: six confirmed
areas, one explicit `'placeholder'` role each, owner Clau; `groups` renders
`<optgroup>`s, values qualified `${area}:${roleId}` (placeholder id repeats
per area — implementation necessity, documented inline).

**Layout**: same grid/flow mechanism as `ContactSection.vue`; `--work-*` in
`:root` (widths/gaps), `--spacing-work-*` in `@theme inline` (top padding,
six glow anchors reusing Contact's color/size pairs verbatim). Glow
x-anchors match Contact's; y-anchors use `foco=0` as a placeholder baseline,
same limitation Contact carries (Team/Network stay `blocked`).

**Content gap flagged, not invented**: brief said body copy was "verbatim in
spec," but only a fragment exists in `data-model.md` (`decisions-open.md`
still lists it draft). Shipped a best-effort completion, flagged in
code/tests — needs Clau/Roberto confirmation (headline arrived verbatim).

**Could not do**: Phase 6's CDP checks (T051/T052/T056–T058, live z-index/
glow-centre/viewport-sweep) — no browser access; substituted with artifact
grep/structure assertions where equivalent, left unchecked.

`./init.sh`: exit 0. 684 tests (baseline 605), all 5 gates green.
