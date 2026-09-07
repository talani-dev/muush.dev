# Contratos de props de los primitivos — referencia de la era Astro

> **Recuperado del commit `1bd5570` (rama `master`, era Astro) el 2026-09-06.**
>
> Estos contratos se diseñaron a partir de instancias reales del `.pen`,
> pasaron review y se implementaron completos en `.astro`. La migración a
> Nuxt descartó la implementación, **no el diseño de la interfaz**.
>
> **Cómo usar este archivo:** al reconstruir los primitivos como SFCs de Vue,
> parte de estas firmas. Son la mejor evidencia disponible de qué props
> necesita cada componente, porque se derivaron de los overrides reales de
> cada instancia en el archivo de diseño, no de suposiciones.
>
> **Qué adaptar de Astro a Vue:**
> - `interface Props` en el frontmatter → `defineProps<Props>()` en `<script setup>`
> - `Astro.props` → destructuring de `defineProps`
> - `<slot />` → `<slot />` (igual en Vue)
> - `class?: string` → en Vue el `class` cae por atributos heredados; no
>   declararlo como prop salvo que se necesite componer explícitamente
> - `as?: 'div' | 'article'` → `<component :is="as">`
>
> Las medidas siguen viniendo de `design-extract.md`, no de aquí.

---

# Component Contracts: Primitive UI layer

**Feature**: `specs/002-primitive-ui-layer` | **Date**: 2026-09-06

The public interface this feature exposes is not an API or a CLI — it is the
prop surface of eight `.astro` components that later features compose. This
file is that contract. Later features may rely on these signatures; changing
one after the fact is a breaking change to every consumer.

Conventions for all eight:

- `interface Props` declared in the component frontmatter, TypeScript strict,
  no `any` (Article V).
- Variant props are string-literal unions with a documented default.
- Every visible string arrives from the caller — no ES/EN copy inside a
  component (FR-029).
- No `client:*` directive, no `<script>` (FR-012).
- The variant → class map is a `const … satisfies Record<Variant, string>`
  lookup with complete class names, never built by concatenation.

---

## GlassPanel

```ts
export type GlassVariant =
  | 'red-strong' | 'red-soft'
  | 'bone-strong' | 'bone' | 'bone-faint'
  | 'dark'

export type GlassPadding = 'default' | 'tight' | 'none'

interface Props {
  variant: GlassVariant          // required — there is no sensible default
  padding?: GlassPadding         // default 'default'
  as?: 'div' | 'article' | 'section' | 'aside'   // default 'div'
  class?: string                 // caller layout hook (width, grid placement)
}
```

Slot: default, unconstrained. The panel supplies fill, 1px border, backdrop
blur, radius and padding, and nothing else (FR-016). Per-variant values in
`data-model.md` § 2.1.

## Radar

```ts
export type RadarSize = 'sm' | 'md' | 'sm-alt'

interface Props {
  size?: RadarSize               // default 'sm'
  class?: string
}
```

No slot. Decorative: renders `aria-hidden="true"` — it carries no information a
screen reader needs, since the adjacent label always does.

## Wordmark

```ts
export type WordmarkForm = 'full' | 'short'   // 'muush.dev' | 'muush'

interface Props {
  form?: WordmarkForm            // default 'full'
  class?: string
}
```

No slot. The literal `muush` / `.` / `dev` runs are brand identity, not copy —
they are the one string set that is deliberately hardcoded, and they are
locale-invariant (`messaging.md`: "muush siempre en minúsculas").

## Lockup

```ts
interface Props {
  form?: WordmarkForm            // default 'full', forwarded to Wordmark
  class?: string
}
```

No slot. Renders the on-ink isotipo at `--spacing-isotipo` plus a Wordmark,
cross-axis centred, gap `--spacing-lockup-gap`. Not a link — the nav/footer
decides where it points, so the caller wraps it.

## Pill

```ts
interface Props {
  label: string                  // required, caller-supplied (i18n lives there)
  class?: string
}
```

No slot. Composes `<Radar size="sm" />`. One real prop, exactly as
design-extract § 3 concludes.

## BotonPrimario

```ts
export type ButtonVariant = 'nav' | 'hero' | 'submit'

interface Props {
  variant?: ButtonVariant        // default 'hero'
  href?: string                  // when set → <a>; otherwise → <button>
  type?: 'button' | 'submit'     // default 'submit' when variant='submit',
                                 // else 'button'; ignored when href is set
  class?: string
}
```

Slot: default — the label. Never a hardcoded string (the ES/EN copy
`Cuéntanos tu proyecto` / `Tell us about your project` lives in
`src/i18n/ui.ts`, a later feature).

LED behaviour is not a prop. It is intrinsic to the component and governed by
the media queries in `research.md` § R4. A caller cannot turn it off, because
`branding.md` allows exactly one primary button per screen anyway.

## LinkArrow

```ts
export type LinkArrowSize = 'default' | 'large'

interface Props {
  href: string                   // required
  size?: LinkArrowSize           // default 'default'
  external?: boolean             // default false → true adds
                                 // target="_blank" rel="noopener noreferrer"
  class?: string
}
```

Slot: default — the label text. The `→` glyph is appended by the component,
not by the caller, so the hover animation has something to move.

## SocialIcon

```ts
export type SocialNetwork = 'linkedin' | 'instagram' | 'tiktok'

interface Props {
  network: SocialNetwork         // required
  href: string                   // required — the profile URL
  label: string                  // required — accessible name, caller-supplied
}
```

No slot. Renders `<a href aria-label={label} target="_blank"
rel="noopener noreferrer">` around a 48×48 glass square containing the
normalized 24×24 glyph.

---

## Asset contract

Three files land in `src/assets/social/`, each satisfying **all** of:

1. Root is `<svg xmlns viewBox="0 0 24 24">` — identical viewBox across all
   three, no `width`/`height` attributes (the component sizes them).
2. Every `fill` is `currentColor`. No `#ffffff`, no `#fff`, no `class`
   attribute.
3. No `<style>`, no `<defs>`, no DOCTYPE, no XML prolog, no `xmlns:serif` or
   other tool metadata, no comments.
4. At most one wrapping `<g transform>` (the normalizing transform derived in
   `research.md` § R8).
5. A `<title>` element naming the network, mirroring the pattern feature 001
   used in `src/assets/logo/*.svg`.

Plus `src/assets/social/README.md` recording, per file: the source path it was
derived from, the original viewBox, the transform applied, and what was
stripped — same shape as `src/assets/logo/README.md`.

---

## Deliberately NOT in this contract

No `theme`, `color`, `tone`, `align`, `fullWidth`, `loading`, `disabled`,
`animated`, `as`-anything-else or `size` prop beyond the ones above. Each of
those was considered and rejected: the design documents exactly six glass
variants, three radar sizes, two wordmark forms, three button variants and two
link sizes, and Article IX forbids inventing a seventh of anything before a
consumer asks for it.
