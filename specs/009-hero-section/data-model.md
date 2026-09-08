# Data Model: Hero section

**Feature**: `specs/009-hero-section` | **Date**: 2026-09-07

The Hero has no persistence, no API and no state. Its "data model" is three
tables: the content it renders, the tokens it resolves through, and the glows
it contributes. Every row is either CONFIRMED against the leader's frame
reading, DERIVED with the arithmetic shown, or flagged UNVERIFIED with an
owner.

---

## 1 · Content

### 1.1 The five strings

All five live under `landing.hero.*` in `i18n/locales/es.json` and
`i18n/locales/en.json`. Both files gain the same five keys
(`tests/i18n-parity.test.ts`).

| Key | ES | EN | Note |
|---|---|---|---|
| `landing.hero.eyebrow` | `Technology solution studio` | `Technology solution studio` | **Identical on purpose.** English inside the Spanish page, verified in all four frames. Asserted by a test, not just commented (FR-009) |
| `landing.hero.headline` | `Hablamos negocio y código.` | `We speak business and code.` | The page's `<h1>`. Matches `content.md` § *Tagline* and `messaging.md` |
| `landing.hero.subhead` | `Diseñamos y construimos soluciones digitales alrededor de tu negocio.` | `We design and build digital solutions around your business.` | Verbatim the *WHAT* block of `content.md` |
| `landing.hero.ctaPrimary` | `Cuéntanos tu proyecto` | `Tell us about your project` | Same wording the nav CTA uses, under the landing module's own key |
| `landing.hero.ctaSecondary` | `Agenda una llamada` | `Book a call` | **No `→`.** The arrow belongs to `LinkArrow` (FR-010, `research.md` § R7) |

Two of these strings duplicate a value that already exists under a `shell.*`
key (`Technology solution studio` is also `shell.footer.category`;
`Agenda una llamada` is also `shell.footer.contact.call`). That duplication is
deliberate: a key belongs to the feature that renders it, and sharing one
across modules would couple `landing` to `shell`'s content model to save two
lines of JSON (Article III).

**Escaping**: none of the five contains `@`, so `rules.md` § R26 does not
apply. Any future Hero string containing one must be written `{'@'}`.

### 1.2 The two destinations

```ts
interface HeroDestinations {
  /** Google Calendar booking link. decisions-open.md #2 — owner: Clau. */
  callUrl?: string
  /** The contact section's fragment. Section 05 does not exist yet. */
  contactHash?: string
}

export const HERO_DESTINATIONS: HeroDestinations = {}
```

| State | `callUrl` | `contactHash` |
|---|---|---|
| **Today** | absent | absent |
| Becomes | a Google Calendar URL | `'#contacto'` |
| Rendering changes | grey `<span>` → `bone-100` `LinkArrow`, new tab, opener severed | `<button>` → `<a>` at the locale's home plus the fragment |
| Cost of the change | one key | one key |

Neither may be filled with a substitute (FR-014): not `mailto:`, not WhatsApp,
not the footer, not a scroll to an arbitrary offset.

### 1.3 What `logic/` hands `ui/`

```ts
interface HeroContent {
  eyebrow: string
  headline: string
  subhead: string
  ctaPrimary: string
  ctaSecondary: string
  /** Absent while section 05 does not exist — the button carries no href. */
  contactHref?: string
  /** Absent while decisions-open.md #2 is open — the link renders as text. */
  callHref?: string
}
```

Everything is already resolved: translated copy, and hrefs that are already
locale-correct paths. That is what lets `ui/HeroSection.vue` render with no
i18n instance and no router present — the property `rules.md` § R23 identifies
as the reason Storybook can catch a component that cheats.

---

## 2 · Tokens

Twelve added to `app/assets/css/global.css`, **all of them in
`@theme inline`** and none in the hand-written `:root` block: no token in this
feature derives from another, so `rules.md` § R46's trap does not apply here.
(It is real and verified — see `research.md` § R1 — it simply stopped being
needed when the glow anchors became six independent measurements.)

### 2.1 Layout

| Token | Value | 390 → 1440 |
|---|---|---|
| `--spacing-hero-top` | `clamp(4.625rem, 1.5375rem + 12.6667vw, 12.9375rem)` | **74 → 207**. `design y − nav height`: 150 − 76 and 310 − 103, both frame-confirmed |
| `--spacing-hero-gap` | `clamp(1.5rem, 1.2679rem + 0.9524vw, 2.125rem)` | 24 → 34 |
| `--spacing-hero-cta-gap` | `clamp(1.25rem, 1.0643rem + 0.7619vw, 1.75rem)` | 20 → 28 |
| `--spacing-hero-cta-top` | `clamp(0.625rem, 0.5321rem + 0.381vw, 0.875rem)` | 10 → 14 |
| `--spacing-hero-body` | `56.25rem` | 900 desktop cap; at 390 the column is narrower and the cap is inert |
| `--spacing-hero-measure` | `37.5rem` | 600 desktop cap; likewise inert at 390 |

`--spacing-hero-gap` happens to carry the same two endpoints as
`--spacing-glass-dark` (24 → 34). It is a **different role** — a stack gap,
not a glass panel's padding — and the file's own convention is one token per
role, so it is not reused. Worth a comment so a reviewer does not read it as
duplication.

### 2.2 Glow anchors

Six tokens: one per glow per axis. **The two viewports place the glows
independently** (spec A-04, D-06), so neither axis of any glow can be
expressed as a function of the other viewport's value, and each token carries
both measured endpoints.

| Token | Value | 390 → 1440 |
|---|---|---|
| `--spacing-hero-glow-foco-x` | `clamp(24.125rem, 4.5321rem + 80.381vw, 76.875rem)` | 386 → 1230 |
| `--spacing-hero-glow-foco-y` | `clamp(-1.625rem, -6.5696rem + 20.2857vw, 11.6875rem)` | **−26** → 187 |
| `--spacing-hero-glow-wine-x` | `clamp(1rem, 0.2107rem + 3.2381vw, 3.125rem)` | 16 → 50 |
| `--spacing-hero-glow-wine-y` | `clamp(4rem, 0.6804rem + 13.619vw, 12.9375rem)` | 64 → 207 |
| `--spacing-hero-glow-cierre-x` | `clamp(26rem, 4.3179rem + 88.9524vw, 84.375rem)` | 416 → 1350 |
| `--spacing-hero-glow-cierre-y` | `clamp(27.75rem, 20.2518rem + 30.7619vw, 47.9375rem)` | 444 → 767 |

Every one lands on both endpoints exactly; the arithmetic is in
`research.md` § R4 and each was checked at 390 and 1440.

Three things worth knowing before touching these:

- **`foco`'s mobile `y` is negative.** Its centre sits 26px above the
  section's top edge, behind the nav. `clamp()` with a negative lower bound is
  valid and compiles — verified against Tailwind 4.3.3, which emits
  `top: clamp(-1.625rem, …)` unchanged.
- **`wine-y` and `hero-top` share an endpoint at 1440 (both 207) and diverge
  at 390 (64 against 207's 74).** They are two measurements that happen to
  coincide on desktop, not one measurement. Do not collapse them.
- **Only the endpoints are design.** The interpolation between them is a
  smoothing choice, so the section keeps one breakpoint that changes direction
  and never a position. Say so in the comment; a future reader must not mistake
  a value at 900px for something Clau drew.

### 2.3 Existing tokens reused, and what each covers

No new token is added where the scale already spans both frames (FR-016).

| Role | Token | Frames | Where |
|---|---|---|---|
| Headline | `--text-display` | 46/600/lh 0.98 → 98/600 | `text-display` on the `<h1>` |
| Subhead | `--text-body-lg` | 17/400/lh 1.5 → 21/400/lh 1.5 | `text-body-lg` on the `<p>` |
| Eyebrow label | `--text-pill` | 12 → 13 | inside `Pill`, nothing to pass |
| Primary label | `--text-button` | 15 → 16 | inside `BotonPrimario` `hero` |
| Primary padding | `--spacing-btn-y`, `--spacing-btn-hero-x` | 16/26 → 18/32 | the `hero` variant |
| Secondary label | `--text-link` | fixed 16 | `text-link` on either branch |
| Page gutter | `--spacing-page` | 24 → 80 | **inherited from `<main>`; never re-declared** |
| Headline colour | `--color-bone-100` | — | `text-bone-100` |
| Subhead colour | `--color-ink-100` | — | `text-ink-100` |
| Dead-link colour | `--color-ink-300` | — | `text-ink-300`, matching `FooterColumn` |

Two of these carry a recorded deviation: `--text-link` resolves the design's
500/ls 0 desktop and 600/ls −0.3 mobile to a single 600/ls 0 (spec D-04), and
`--text-display` carries lh 0.98 at both ends where the design draws lh 1 at
390 (spec D-05). Both are frozen `done` contracts and both are reversed by one
token value.

### 2.4 The single breakpoint

`lg` (Tailwind's default 64rem = 1024px, the same one `SiteNav.vue` uses; a
value feature 3 recorded as UNVERIFIED in its A-01, since the design has only
two frames). It appears exactly once, on the CTA row:

```
flex flex-col items-start … lg:flex-row lg:items-center
```

Direction and cross-axis alignment only. It never changes a size — the
distinction `SiteNav.vue` states for its own `lg:` rules, and the reason
`items-start` is the mobile value is `ui-map.md` § 3: the primary button is as
wide as its label, never the column.

---

## 3 · The glow group

### 3.1 What each glow is

All three colour+opacity pairs and all three size pairs already exist in
`SectionGlow`'s discriminated union and in `global.css`. Nothing is added to
either, and **both viewports use the same three** — only the positions change.

| Glow | `color` | `opacity` | `size` | Design fill | Desktop centre | Mobile centre |
|---|---|---|---|---|---|---|
| `Hero · foco` | `red-400` | `65` | `1500-700` | `#CF3147A6` (A6/255 = 65.1%) | 1310, 290 | 410, 50 |
| `Hero · wine` | `wine-300` | `40` | `1100-520` | `#8A455266` (66/255 = 40.0%) | 130, 310 | 40, 140 |
| `Hero · cierre` | `wine-400` | `30` | `900-520` | `#591F284D` (4D/255 = 30.2%) | 1430, 870 | 440, 520 |

Centres are page coordinates, read from the frames by the leader on
2026-09-07.

### 3.2 Where each one goes

Anchored **by its centre**, at an offset from the section's own top-left
corner — never at a page offset (`rules.md` § R29; feature 6 A-13). The
section's origin is the page gutter horizontally and the nav's bottom edge
vertically: page (80, 103) at 1440 and (24, 76) at 390.

| Glow | `left` | `top` | Desktop offset | Mobile offset |
|---|---|---|---|---|
| `foco` | `left-hero-glow-foco-x` | `top-hero-glow-foco-y` | 1230, 187 | 386, −26 |
| `wine` | `left-hero-glow-wine-x` | `top-hero-glow-wine-y` | 50, 207 | 16, 64 |
| `cierre` | `left-hero-glow-cierre-x` | `top-hero-glow-cierre-y` | 1350, 767 | 416, 444 |

Each carries `-translate-x-1/2 -translate-y-1/2`, which is permitted on an
individual glow and on nothing else in the subtree (`research.md` § R3).

**The two viewports are two independent placements.** The design hand-places
all 21 glows — `design-extract.md` § 10 says so outright: *"el posicionamiento
es absoluto y distinto en las 22"* — so no offset here is derived from
another. An earlier draft of this spec derived mobile from desktop and was out
by up to 35px; the disproof is spec D-06 and the general lesson is
`rules.md` § R48.

**Offsets from the section's corner, not percentages of it and not page
coordinates.** Page coordinates would drift the moment any section above grew
(§ R29). Percentages of the section were the disproved approach. Offsets from
the corner keep the group travelling with the section — if the nav's height
changes, or a locale's copy moves the section, all three move together — while
reproducing both frames exactly.

**What this deliberately does not do**: stretch with the Hero's own copy. A
Hero whose headline grew by 200px keeps `cierre` where the design put it
rather than pushing it toward the new bottom edge. There is no proportional
relationship in the design to preserve, and the residual is a token value.

### 3.3 What the group must not do

From `SectionBackdrop.vue`'s contract, which this feature is the first to be
bound by:

- The section **is** `position: relative` — the backdrop's `inset-0` resolves
  against it.
- The section, and everything the Hero puts between it and the layout root,
  creates **no stacking context**: no `transform`, `translate`, `scale`,
  `rotate`, `filter`, `backdrop-filter`, `opacity` < 1, `isolation`,
  `will-change`, `contain: paint`, `position: fixed`, or `position: sticky`
  with a `z-index`.
- The section paints **no opaque background**; it would hide its own glows.
- The failure mode is **silent**: nothing errors, no test fails, the page
  simply stops matching the design. That is why FR-028 requires the four
  levels measured on the generated page.
- The escape hatch, if the design ever needs a transform on a section: move
  that section's glows to the page level. It is a change to that section, not
  to the layer — and it is a finding to report, not a workaround (FR-027).

---

## 4 · Rendered structure

```
<section>                          relative, pt-hero-top, no bottom padding,
│                                  no background, no stacking context
├── <SectionBackdrop>              --layer-glow
│   ├── SectionGlow  foco
│   ├── SectionGlow  wine
│   └── SectionGlow  cierre
└── stack                          flex column, items-start,
    │                              gap-hero-gap, max-w-hero-body
    ├── Pill        eyebrow        intrinsic width — the reason for items-start
    ├── <h1>        headline       w-full, text-display, bone-100
    ├── <p>         subhead        w-full, max-w-hero-measure, text-body-lg, ink-100
    └── CTA row                    flex column → lg:row, gap-hero-cta-gap,
        │                          pt-hero-cta-top, items-start → lg:items-center
        ├── BotonPrimario hero     no href today → a real <button>
        └── LinkArrow | <span>     v-if callHref … v-else grey text
```

`items-start` on the stack keeps the `Pill` at its intrinsic width instead of
stretching it across 900px; `w-full` on the headline and the subhead puts them
back at the stack's width so they wrap where the design wraps them. Both are
one class, and neither adds an element.

---

## 5 · State transitions

The Hero has no runtime state. It has two **build-time** states, each a
function of one data value:

| Value | Absent | Present |
|---|---|---|
| `HERO_DESTINATIONS.callUrl` | secondary CTA is grey, inert text with no arrow and no anchor element | secondary CTA is a `bone-100` `LinkArrow`, arrow shifts on hover, opens in a new tab with `rel="noopener noreferrer"` |
| `HERO_DESTINATIONS.contactHash` | primary CTA is a `<button type="button">` that emits no fragment | primary CTA is an `<a>` to the locale's home plus the fragment |

Both transitions are exercised by the component test and by the Storybook
story, so the branch that does not ship today is still reviewed before it
does.
