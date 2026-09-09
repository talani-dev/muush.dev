# Implementation report — feature 24 `visual_polish_round_2`

## 1a · Purpose arcs — exact 90° quadrant

`PurposeSection.vue`'s `.arc` was already a full circle (`border-radius: 50%`)
whose box-centre lands exactly on the design's origin point via
`translate: -50% -50%`. Added `clip-path: inset(50% 0 0 50%)`, which cuts the
top half and left half of the box, leaving the bottom-right quadrant. A
circle's horizontal/vertical diameters split it into four 90° arcs by
geometric definition regardless of radius — so this is exact by construction,
not "looks right in a screenshot". It also reproduces what was already
visible almost to the pixel: the origin sits above/left of the section
(`--purpose-origin-y` 44px down, `--purpose-arc-origin-x` negative), so the
old incidental clip and the new quadrant coincide within 0.08–0.17% of each
arc's own box (arithmetic in the component's doc comment).

**CDP-verified** (`.output/public`, headless Chrome, 1440×1200,
`Emulation.setDeviceMetricsOverride`): all three `.arc` elements report
`clipPath: "inset(50% 0px 0px 50%)"` and `borderRadius: "50%"` via
`getComputedStyle`, confirming the quadrant is applied to a true circle, not
an ellipse or a pre-cut shape.

## 1b · Purpose Pill — own vertical nudge

Added `--purpose-pill-y: -0.5rem` (`:root`, hand-CSS namespace — a
`@theme inline` token would resolve to nothing here per `rules.md` § R18,
since nothing consumes it as a utility class). Wraps the Pill in `.pill-nudge
{ position: relative; top: var(--purpose-pill-y) }`. `position: relative`
was chosen over `margin-top` specifically because it doesn't touch this box's
contribution to normal flow — `PurposeConstellation`/`PurposeCarousel` below
keep the exact same `mt-purpose-eyebrow-gap` gap, unaffected. Verified via
CDP: `position: relative`, computed `top: -8px`, arcs/nodes untouched (no
edit to their tokens or classes).

## 2a/2b · Services mobile closer

**2a** — `ServicesTimeline.vue`'s closer block was using
`--spacing-services-item-gap` (10–12px, `ServiceItem`'s own internal
name/brief gap) as its top margin too. Added a dedicated
`--spacing-services-closer-gap-m: 2.5rem` (40px) and switched the class to
`mt-services-closer-gap-m`.

**2b** — same `stretch`-by-default bug feature 23 fixed on desktop
(`ServicesConstellation.vue`'s `.closer`), but the mobile closer is
deliberately **stacked** per the confirmed spec
(`specs/014-services-section/data-model.md` § 2.3 — "Delivery closer: Pill +
copy, stacked, full 342px"), so I kept `flex-col` and added `items-start`
rather than copying `flex-row` verbatim — switching direction would have
put the Pill and copy side by side, contradicting the shipped design. Noting
this as a deliberate deviation from the literal instruction, in favor of the
confirmed spec.

**CDP-verified** (390×1600, mobile emulation): closer computed style
`flexDirection: column`, `alignItems: flex-start`; Pill width **113.9px**
against a 342px container (sizes to content, not stretched); margin-top
**40px** (up from ~10–12px), measured gap between the timeline canvas'
bottom edge and the closer's top edge is exactly **40px**.

## 3 · Mobile menu — drop Proyectos

Removed the `shell.menu.projects` entry from `MENU_ITEMS`
(`navigation.ts`), with the same divergence-comment treatment `NAV_ITEMS`
and `FOOTER_COLUMNS` already use. Updated `MobileMenu.test.ts` (3 items, not
4; the "chosen destination" test now clicks Servicios instead of the removed
Proyectos) and `MobileMenu.stories.ts`. Removed the now-orphaned
`shell.menu.projects` key from both `i18n/locales/{es,en}.json` — confirmed
it had no other consumer. Updated a stale comment in
`tests/static-output.test.ts` that referenced the old "still lists Proyectos
on purpose" state.

## 4 · Work with muush — real role catalogue

Replaced the placeholder `ROLE_CATALOG` in `applicationFields.ts` with the
six areas' real roles, verbatim, with `infrastructureCloud` and
`performanceMedia` each a single combined role id (never split). Filled both
locales' `forms.application.fields.areaRole.roles.*`. EN translation was
mostly mechanical (IT terms are already English); the one genuinely
judgment-call term was **"Performance y pauta"** → translated as
**"Performance & paid media"** ("pauta" = paid media buying in Spanish
marketing jargon) — flagging this per-term choice rather than treating it as
self-evident. Updated `tests/forms-application-copy.test.ts` (now asserts
the real catalogue instead of only the placeholder's shape) and the
`WorkWithMuushSection.stories.ts` fixture. No open-question doc
(`decisions-open.md`, `pending-decisions.md`) referenced this placeholder as
an open item, so there was nothing to close there beyond the code comment.

One unrelated regression surfaced by the new content: the new Creative role
"Blog y storytelling" contains the substring "Blog", which collided with
`tests/static-output.test.ts`'s sitewide "no Blog anywhere" regression guard
for the removed footer placeholder. Narrowed that assertion to the
`<footer>` element specifically (the only place the placeholder ever
rendered), rather than the whole document — the footer never contains this
role text since Work with muush's form lives in `<main>`.

## 5 · Contact form identity options

Replaced the five options with the six real ones in
`contactFields.ts`/`useContactFormContent.ts`, in the required order:
`realEstate` (new), `creator`, `company`, `independent`, `startup`, `other`.
Order comes from the object-literal key order in
`useContactFormContent.ts`'s returned `options` — `ContactForm.vue` walks
`Object.entries()` over it, so this is what actually controls render order,
not the JSON file. Updated both locales, `IdentityOption`/`IDENTITY_OPTIONS`
in `contactFields.ts`, and every fixture typed against
`ContactFormContent`/`Record<IdentityOption, string>`
(`ContactForm.test.ts`, `.stories.ts`, `ContactSection.test.ts`,
`.stories.ts`) plus `tests/forms-copy.test.ts`. EN translation: "Bienes
raíces/inmobiliaria" → "Real estate" (dropped the redundant second
near-synonym rather than forcing an awkward parallel slash construction in
English) — flagging this one too as a judgment call, not a literal mapping.

## Verification

- `./init.sh` exits 0.
- `pnpm test`: 705/705 (one pre-existing test needed narrowing, see § 4).
- `pnpm typecheck`, `pnpm check`, `pnpm generate`, `pnpm storybook:build` all
  green.
- CDP measurements for 1a and 2b done against a fresh `pnpm generate` +
  headless Chrome (`Emulation.setDeviceMetricsOverride`), not inferred from
  reading classes — see §§ 1a/2b above for the numbers.

No frozen primitive touched (`SectionGlow`, `DotGrid`, `SectionBackdrop`,
`Radar`, `Pill`, `BotonPrimario`). All new spacing lives in `rem`/percentage
tokens in `global.css`, no raw `px` in markup.

Status left at `reviewing` in `feature_list.json` for the reviewer.
