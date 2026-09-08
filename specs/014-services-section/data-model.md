# Data model — Servicios

**Feature**: `specs/014-services-section` | **Date**: 2026-09-08

Three tables: the content, the geometry that generates both compositions, and the
tokens. Every number is CONFIRMED from frame `GiLTU` / `F2Zu8X` or DERIVED with the
arithmetic shown (`spec.md` § *Provenance* has the full derivation; this file states
the results as data).

## 1 · Content

### 1.1 Keys

```ts
export const SERVICES_KEYS = {
  eyebrow: 'landing.services.eyebrow',
  deliveryCopy: 'landing.services.delivery.copy',
} as const

export const SERVICE_NODES = [
  { id: 'consulting',  index: 0, nameKey: 'landing.services.consulting.name',  briefKey: 'landing.services.consulting.brief'  },
  { id: 'software',    index: 1, nameKey: 'landing.services.software.name',    briefKey: 'landing.services.software.brief'    },
  { id: 'cloud',       index: 2, nameKey: 'landing.services.cloud.name',       briefKey: 'landing.services.cloud.brief'       },
  { id: 'automation',  index: 3, nameKey: 'landing.services.automation.name',  briefKey: 'landing.services.automation.brief'  },
  { id: 'product',     index: 4, nameKey: 'landing.services.product.name',    briefKey: 'landing.services.product.brief'     },
] as const
```

`index` generates every desktop radar centre lookup and the mobile `72 + index × 185`
step (§ 2, § 3); nothing else distinguishes the five.

### 1.2 Values

| Key | ES | EN |
|---|---|---|
| `eyebrow` | `Servicios` | `Services` |
| `consulting.name` | `Technology Consulting & Strategy` ⚠️ O-01 | `Technology Consulting & Strategy` |
| `software.name` | `Software & Digital Solutions` ⚠️ O-01 | `Software & Digital Solutions` |
| `cloud.name` | `Cloud, Infrastructure & DevOps` ⚠️ O-01 | `Cloud, Infrastructure & DevOps` |
| `automation.name` | `Automation, Data & AI` ⚠️ O-01 | `Automation, Data & AI` |
| `product.name` | `Product, UI/UX & Experience` ⚠️ O-01 | `Product, UI/UX & Experience` |
| `consulting.brief` | `Diagnosticamos tu situación real, diseñamos la solución y te decimos qué conviene hacer, incluso cuando la respuesta es hacer menos.` | `We diagnose your actual situation, design the solution, and tell you what's worth doing, even when the answer is to do less.` |
| `software.brief` | `Plataformas, sistemas internos, portales e integraciones construidos alrededor de cómo opera tu negocio, no al revés.` | `Platforms, internal systems, portals, and integrations built around how your business actually works, not the other way around.` |
| `cloud.brief` | `Lo que sostiene todo una vez que está en producción: infraestructura, despliegues automatizados, monitoreo y seguridad. La parte que nadie nota hasta que hace falta.` | `What holds everything up once it's live: infrastructure, automated deploys, monitoring and security. The part nobody notices until it's needed.` |
| `automation.brief` | `Automatizamos lo repetitivo y convertimos tus datos en decisiones. AI donde sume, no solamente donde suene bien.` | `We automate the repetitive and turn your data into decisions. AI where it adds value, not where it sounds good.` |
| `product.brief` | `Convertimos tecnología compleja en algo que se usa sin manual. Producto y experiencia, de investigación a prototipo.` | `We turn complex technology into something people use without a manual. Product and experience, from research to prototype.` |
| `delivery.copy` | `Y una capacidad que atraviesa las cinco: llevamos el proyecto de principio a fin, con alcance, tiempos, calidad y lanzamiento a nuestro cargo.` | `And one capability runs through all five: we carry the project from start to finish, including scope, timelines, quality and launch.` |

All briefs and the delivery copy are `services.md`'s approved ES-MX/EN text, verbatim.
The five names are `⚠️ O-01`: English is used for both locales pending Roberto's
Spanish names (`spec.md` § *Open values*).

## 2 · Desktop geometry (frame `GiLTU`, fixed — no intermediate breakpoint exists)

The design supplies exactly one desktop frame (1440), unlike Propósito's columnar
layout, which could express its geometry as percentages of content width because a
single-axis flow naturally re-flows between 1024 and 1440. A five-point scatter has no
such natural rule without a second frame to interpolate against, so this composition's
geometry is fixed pixels inside a 1280px-max, horizontally centred canvas — accurate at
1440 and unchanged between 1024 and 1440 rather than reflowing (an assumption, same
class as Propósito's A-02 arc-tangency-at-1440-only).

### 2.1 The five nodes

| # | Name key | Radar centre | Text block top-left | Text block size |
|---|---|---|---|---|
| 1 | `consulting` | `150, 330` | `146, 358` | 232×144 |
| 2 | `software`   | `430, 200` | `426, 228` | 232×144 |
| 3 | `cloud`      | `690, 440` | `686, 468` | 232×166 |
| 4 | `automation` | `950, 250` | `946, 278` | 232×122 |
| 5 | `product`    | `1150, 480`| `1146, 508`| 232×144 |

**The relation**: `textBlock = radarCentre + (−4, +28)` for all five, exact to the
pixel. Text block height is intrinsic to its own copy (144/144/166/122/144), never a
token.

### 2.2 The four connectors, generated from the same five centres

| Connector | Endpoints (radar centres) | Generated bbox | Drawn rectangle | Δ |
|---|---|---|---|---|
| 1→2 | `150,330` → `430,200` | `280×130 @150,200` | `280×131 @150,200` | 1px (h) |
| 2→3 | `430,200` → `690,440` | `260×240 @430,200` | `261×241 @429,200` | 1px (w,h,x) |
| 3→4 | `690,440` → `950,250` | `260×190 @690,250` | `261×191 @690,250` | 1px (w,h) |
| 4→5 | `950,250` → `1150,480`| `200×230 @950,250` | `201×231 @949,250` | 1px (w,h,x) |

Every rectangle the frame draws is the bounding box of two consecutive radar centres,
to within 1px of rounding — the same tolerance Propósito's arc-tangency check used. In
code this is one pure function, `connectorEndpoints(centres): [{x1,y1,x2,y2}]`, over the
five centres in § 2.1 — never four hardcoded shapes.

### 2.3 Canvas and closer

Canvas explicit height: **910px** (= delivery closer's bottom edge `810 + 100`, the
tallest extent among all nodes/connectors/closer — not an invented number). Delivery
closer: Pill + copy, `1280×100 @80,810`, full content width, plain text
(`ui-map.md` § 5).

## 3 · Mobile geometry (frame `F2Zu8X`)

| Item | Name key | Block top | Block height |
|---|---|---|---|
| 1 | `consulting` | 72  | 98  |
| 2 | `software`   | 257 | 98  |
| 3 | `cloud`      | 442 | 120 |
| 4 | `automation` | 627 | 98  |
| 5 | `product`    | 812 | 98  |

**The relation**: `item.top = 72 + index × 185`, exact across all five (verified:
72/257/442/627/812, every consecutive difference exactly 185). Height is intrinsic to
copy (item 3's brief is longest); the apparent uneven 65px gap before item 4 is item 3's
taller block eating into the same fixed slot, not an irregularity (`spec.md` §
*Provenance*). Radar is vertically centred on its own block (same discipline as
Propósito FR-016).

Spine: `1×750 @29,86`, decorative, `aria-hidden="true"`, not required to terminate at
any radar centre (assumption A-01). Delivery closer: Pill + copy, stacked, full 342px
content width, after item 5.

## 4 · Tokens

Same rule as feature 13: a token read by hand-written CSS/SVG goes in `:root`; a token
consumed as a Tailwind utility goes in `@theme inline` (`rules.md` § R18,
`findings.md` § R46). None of the names below matches `--color-glow-*` or
`--spacing-glow-*` (`rules.md` § R36).

### 4.1 `:root` — read by `<style scoped>` and the inline SVG

| Token | Value | Derivation |
|---|---|---|
| `--services-node-1-x` / `-y` | `9.375rem` / `20.625rem` | radar 1 centre (150,330) |
| `--services-node-2-x` / `-y` | `26.875rem` / `12.5rem` | radar 2 centre (430,200) |
| `--services-node-3-x` / `-y` | `43.125rem` / `27.5rem` | radar 3 centre (690,440) |
| `--services-node-4-x` / `-y` | `59.375rem` / `15.625rem` | radar 4 centre (950,250) |
| `--services-node-5-x` / `-y` | `71.875rem` / `30rem` | radar 5 centre (1150,480) |
| `--services-text-offset-x` / `-y` | `-0.25rem` / `1.75rem` | the one relation, § 2.1, applied identically to all five |
| `--services-canvas-h` | `56.875rem` | 910, § 2.3 |
| `--services-link-color` | `color-mix(in srgb, var(--bone-100) 24%, transparent)` | ⚠️ **O-02**, same hairline family as Propósito's connector lines |
| `--services-link-w` | `0.0625rem` | ⚠️ **O-02**, 1px |
| `--services-pill-x` / `-y` | `5rem` / `5.625rem` | Pill @80,90 |
| `--services-closer-x` / `-y` / `-w` / `-h` | `5rem` / `50.625rem` / `80rem` / `6.25rem` | closer @80,810, 1280×100 |
| `--services-timeline-item-step` | `11.5625rem` | 185, § 3 — the one relation |
| `--services-timeline-item-1-top` | `4.5rem` | 72, § 3 |
| `--services-spine-x` / `-y` / `-h` | `1.8125rem` / `5.375rem` / `46.875rem` | 29,86,750 |
| `--services-pill-m-w` / `-h` | `7.375rem` / `2.375rem` | mobile Pill 118×38 |
| `--services-closer-m-w` | `21.375rem` | mobile content box, 342 |
| `--duration-services-lyrics` | `0.3s` | ⚠️ **O-04** |

> **SVG geometry via CSS.** The connector `<line>` elements' `x1/y1/x2/y2` are styled
> from the node tokens above (`line { x1: var(--services-node-1-x); … }`) rather than
> bound as plain attributes, so the five centres have exactly one source of truth. SVG2
> geometry-properties-as-CSS is Chrome/Firefox-verified, same class of modern-CSS
> dependency `findings.md` § R45 already accepts for this project; the failure mode is
> a missing hairline, which is decorative and costs no content — same acceptance
> reasoning as R45's three CSS features.

### 4.2 `@theme inline` — consumed as utilities

| Token | Value | 390 → 1440 |
|---|---|---|
| `--spacing-services-top` | `clamp(3.4375rem, 2.3696rem + 4.381vw, 6.3125rem)` | 55 ⚠️ O-03 → 101 (Propósito's own leftover, § R49) |
| `--spacing-services-glow-a-x` | `clamp(27.25rem, 5.1036rem + 90.8571vw, 86.875rem)` | 436 → 1390 |
| `--spacing-services-glow-a-y` | `clamp(39.375rem, 69.8893rem − 33.9048vw, 61.625rem)` | 986 → 630 (decreasing) |
| `--spacing-services-glow-b-x` | `clamp(2.25rem, 1.925rem + 1.3333vw, 3.125rem)` | 36 → 50 |
| `--spacing-services-glow-b-y` | `clamp(60.625rem, 92.8536rem − 35.8095vw, 84.125rem)` | 1346 → 970 (decreasing) |

Both glow anchors are section-relative, each axis independently measured at both
viewport endpoints (`rules.md` § R48 — never one derived from the other). Anchored by
centre with `-translate-x-1/2 -translate-y-1/2` on the glow itself, as `SectionBackdrop`
already permits for an individual glow.

## 5 · Component surface

```ts
// ui/ServiceItem.vue — radar + name + brief, no glass surface, always visible
interface Props { name: string; brief: string }

// ui/ServicesConstellation.vue — desktop only, absolute canvas + SVG connectors
interface Props { nodes: ServiceNodeContent[]; deliveryCopy: string }

// ui/ServicesTimeline.vue — mobile only, spine + items + lyrics
interface Props { nodes: ServiceNodeContent[]; deliveryCopy: string }

// ui/ServicesSection.vue — the section: backdrop, eyebrow, both compositions
interface Props { eyebrow: string; nodes: ServiceNodeContent[]; deliveryCopy: string }
```

`logic/useServicesContent.ts` is the module's Nuxt seam (`useI18n`). `logic/
useServicesLyrics.ts` is a plain Vue composable — one `IntersectionObserver`, no Nuxt
call — so `ServicesTimeline` still mounts bare in Storybook and in tests
(`rules.md` § R23).
