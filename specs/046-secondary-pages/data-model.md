# Data model — feature 46

Keys, never copy, in `data/`; `logic/` resolves them; `ui/` receives plain
strings and hrefs (Articles II, VI; `rules.md` § R23).

## 1 · Shared map copy (`app/shared/data/mapCopy.ts`, `app/shared/utils/mapCopy.ts`)

```ts
export const MAP_COPY_KEYS = {
  legend: { team: 'map.legend.team', partner: 'map.legend.partner',
            soon: 'map.legend.soon', anywhere: 'map.legend.anywhere' },
  regionsLabel: 'map.regions.label',
  regions: { america: 'map.regions.america', europe: 'map.regions.europe' },
  cities: { cdmx: 'map.cities.cdmx', /* … the nine cities */ },
} as const satisfies { legend: Record<MapPinKind | 'anywhere', string>;
  regions: Record<MapRegionName, string>; cities: Record<MapCity, string>; … }

export interface MapCopy {
  legend: { kind: MapPinKind | 'none'; label: string }[]  // team, partner, anywhere
  soonLabel: string
  regions: { name: MapRegionName; label: string }[]
  regionsLabel: string
  groups: { kind: MapPinKind; label: string }[]           // team, partner, soon
  cityNames: Record<MapCity, string>
}

export function resolveMapCopy(translate: (key: string) => string): MapCopy
```

Values: today's `landing.whoWeAre.{legend,regions,cities}` moved verbatim to
`map.*` in both locales. `WhoWeAreContent = MapCopy & { pill; headingFirst;
headingSecond; body }` (landing keys for those four stay).

## 2 · Nosotros (`app/features/about/data/`)

| File | Keys | Content type (what `logic/` returns) |
|---|---|---|
| `aboutHeroContent.ts` | `about.hero.pill`, `.heading.first`, `.heading.second`, `.intro` | `{ pill, headingFirst, headingSecond, intro }` |
| `teamCompositionContent.ts` | `about.composition.pill`, `.heading.first/second`, `.cards.<kind>.label/title/text` with `COMPOSITION_ORDER = ['team','pool','partner']` | `{ pill, headingFirst, headingSecond, cards: { kind: CompositionKind; label; title; text }[] }` |
| `whereWeAreContent.ts` | `about.where.pill`, `.heading.first/second`, `.body` | `MapCopy & { pill, headingFirst, headingSecond, body }` |
| `workContent.ts` | `about.work.pill`, `.heading.first/second`, `.body`, `.areasLabel`, `.areas.<key>` with `AREAS_ORDER = ['engineering','design','creative']` | `{ pill, headingFirst, headingSecond, body, areasLabel, areas: readonly string[] }` |

`CompositionKind = 'team' | 'pool' | 'partner'` → dot class map in the card
(`bg-red-muush-500`, `bg-blanco`, `bg-acero-200`).

Seams in `about/logic/`: `useAboutHeroContent`, `useTeamCompositionContent`,
`useWhereWeAreContent` (calls `resolveMapCopy(t)`), `useWorkContent`.

### Copy (`muush-1.0.md` § 4.8, verbatim)

| Key | ES | EN |
|---|---|---|
| about.hero.pill | Nosotros | About |
| about.hero.heading.first / second | El equipo se arma / alrededor del proyecto. | The team takes shape / around the project. |
| about.hero.intro | Reunimos al talento indicado para cada proyecto y le damos libertad de elegir en qué proyectos entra y desde dónde trabaja. Esa flexibilidad sostiene nuestro talent pool y nos permite entregar con una estructura ligera. | We bring together the right talent for each project and give them the freedom to choose which projects they join and where they work from. That flexibility sustains our talent pool and lets us deliver with a lean structure. |
| about.composition.pill | Cómo se arma | How it comes together |
| about.composition.heading | Quién entra / a tu proyecto. | Who joins / your project. |
| about.composition.cards.team | Equipo base · Siempre en tu proyecto · Estrategia, diseño e ingeniería, de principio a fin. | Core team · Always on your project · Strategy, design and engineering, from start to finish. |
| about.composition.cards.pool | Talent pool · Cuando el proyecto lo pide · Especialistas que entran con el mismo estándar de entrega. | Talent pool · When the project calls for it · Specialists who join with the same delivery standard. |
| about.composition.cards.partner | Aliados · Creativo y marketing · Estudios de confianza, coordinados por nosotros. | Partners · Creative and marketing · Trusted studios, coordinated by us. |
| about.where.pill | Dónde estamos | Where we are |
| about.where.heading | Un talent pool que crece / por sector y por proyecto. | A talent pool that grows / by industry and by project. |
| about.where.body | Todos trabajamos con las mismas reglas y el mismo estándar de entrega. | We all work under the same rules and the same delivery standard. |
| about.work.pill | Trabaja con muush | Work with muush |
| about.work.heading | Tú eliges en qué / proyectos entras. | You choose which / projects you join. |
| about.work.body | Con quién y desde dónde, también. Si trabajas en tecnología, diseño o producción, cuéntanos qué haces y te buscamos cuando haya un proyecto para ti. | Who you work with and where from, too. If you work in technology, design or production, tell us what you do and we'll reach out when there's a project for you. |
| about.work.areasLabel | Áreas que sumamos | Areas we bring in |
| about.work.areas.* | Ingeniería y desarrollo · Diseño de producto y UX · Creativo, contenido y marketing | Engineering and development · Product design and UX · Creative, content and marketing |

## 3 · Shell (`app/features/shell/data/`)

- `types.ts`: `ShellRouteName = 'index' | 'about' | 'faq'`.
- `footerColumns.ts`: `FOOTER_DESTINATIONS.faq = { kind: 'route', name: 'faq' }`;
  MUUSH column `[work, faq, blog]`.
- `contactChannels.ts`: `MOBILE_FOOTER_LINKS = [home, services, howWeWork,
  about, faq, work, blogInline]`.
- `notFound.ts`: `NOT_FOUND_HOME` (route index, label `shell.notFound.cta`),
  `NOT_FOUND_ASSESSMENT` (anchor index#diagnostico, label
  `shell.notFound.assessment`), `NOT_FOUND_COPY_KEYS = { documentTitle:
  'pages.notFound.title', headingFirst: 'shell.notFound.heading.first',
  headingSecond: 'shell.notFound.heading.second' }`, `NOT_FOUND_ROBOTS`,
  `NOT_FOUND_LOCALE_STATE_KEY` unchanged. `NOT_FOUND_SHORTCUTS` deleted.
- `faq.ts` (new): `FAQ_PRIMARY` (anchor index#diagnostico, `shell.faq.assessment`),
  `FAQ_SECONDARY` (external `CALL_BOOKING_URL`, `shell.faq.call`),
  `FAQ_COPY_KEYS = { title: 'shell.faq.title' }`.

`StatusSectionProps` (returned by both seams, `logic/`):

```ts
interface StatusSectionProps {
  preset: 'faq' | 'notFound'
  headingFirst: string
  headingSecond?: string
  primary: ResolvedShellItem
  secondary: ResolvedShellItem
}
```

### Copy

| Key | ES | EN |
|---|---|---|
| shell.faq.title | En construcción 🚧 | Under construction 🚧 |
| shell.faq.assessment | Diagnóstico gratis | Free assessment |
| shell.faq.call | Agenda una llamada | Book a call |
| shell.notFound.heading.first / second | Volvamos a un / lugar conocido. | Let's get you back / somewhere familiar. |
| shell.notFound.cta | Volver al inicio | Back to home |
| shell.notFound.assessment | Diagnóstico gratis | Free assessment |
| shell.footer.muush.faq | Preguntas | FAQ |
| pages.faq.title (provisional) | Preguntas · muush | FAQ · muush |
| pages.faq.description (provisional) | Respuestas a las preguntas frecuentes sobre muush. Mientras tanto, pide tu diagnóstico gratis o agenda una llamada. | Answers to frequently asked questions about muush. In the meantime, request a free assessment or book a call. |

Removed (both locales): `shell.notFound.{eyebrow,headline,body,shortcutsLabel,shortcuts}`,
`landing.whoWeAre.{legend,regions,cities}` (moved to `map.*`), v1
`about.hero.{eyebrow,headline}`, `about.work.{eyebrow,headline}`.

## 4 · Background presets (`app/shared/data/backgroundPresets.ts`)

```ts
interface BackgroundPreset {
  shader: ShaderName
  uniforms: Readonly<Record<`u_${string}`, number>>
  /** Overrides used below 1024 px, when the mobile frame draws its own. */
  compactUniforms?: Readonly<Record<`u_${string}`, number>>
  poster?: string
  priority: 'high' | 'lazy'
}
```

`compactUniforms` for `aboutHero`, `workWithUs`, `faq`, `notFound`: the values
in spec FR-046. `workWithUs` stops sharing `ASSESSMENT_UNIFORMS` only for the
compact set (its desktop set stays the shared constant). `backgroundPresets.test.ts`
asserts the four compact sets and that no other preset has one.

## 5 · Tokens (`app/assets/css/global.css`)

New (names provisional to the implementer, no version marker), each with its
1440 / 390 anchor:

| Purpose | 390 | 1440 |
|---|---|---|
| Heading size `pagina` (Nosotros hero) size / line-height | 32 / 1.15 | 64 / 90 px box (awaiting leader) |
| Cómo se arma heading size / line-height | 30 / 1.15 | 56 / 78 px box (awaiting leader) |
| Heading size `estado` (Preguntas) | 34 | 88 |
| Nosotros hero min-height / padding / gap | 700 · 110 24 60 24 · 24 | 820 · 120 80 60 80 · 28 |
| Hero intro size / width | 16 / 1.5 | 20 / 1.5, 720 |
| Cómo se arma padding / gap | 72 24 · 24 | 100 80 80 80 · 40 |
| Card padding / gap / label gap / dot | 24 · 14 · 10 · 8 | 32 · 14 · 10 · 8 |
| Card row gap / card width | 14 (stacked) | 24 / 400 |
| Card label / title / text | 14/600 · 26/500 · 17/1.5 | same |
| Where-we-are mobile body | 16 / 1.5 | 17 / 1.55 (existing `cuerpo`) |
| Status block min-height / padding / gap (faq) | 720 · 100 24 60 24 · 32 | 1100 · 120 80 80 80 · 40 |
| Status block (notFound) | 720 · 100 24 60 24 · 32 | 760 · 100 80 60 80 · 40 |
| Status buttons gap / top pad (404) | 8 / 0 | 14 / 8 |

Reused: `mapa-*`, `diagnostico-*`, `recibes-*`, `cuerpo-diagnostico`,
`vidrio-fondo`, `rounded-servicio`, `borde-linea`, `pulso`, `pill-aire`,
`gutter*`, the Heading sizes `seccion` and `diagnostico`, the button sizes.

Removed: the v1 families used only by the deleted files (`about-hero-*`,
`work-*`, `not-found-*` and their `@theme` entries), after a grep that no
quarantined file reads them.
