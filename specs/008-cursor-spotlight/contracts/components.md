# Component Contracts: Cursor spotlight

**Feature**: `specs/008-cursor-spotlight` | **Date**: 2026-09-07

Two public surfaces enter the repository: one component and one composable.
Both are consumed by `app/layouts/default.vue` and by the catalogue, and a
later feature may rely on either — changing one after the fact is a breaking
change.

---

## 1 · `CursorSpotlight` — `app/shared/ui/CursorSpotlight.vue`

```ts
// no props
// no emits
// no slots
// no imports
```

**Zero props, deliberately.** There is exactly one spotlight in the design, at
exactly one size, with one recipe. A `size`, `color`, `intensity` or `enabled`
prop would invent a system the design does not have (Article VIII), and
`DotGrid` set the precedent for the same reason.

**Zero imports, also deliberately.** A `ui/` component that called
`useCursorSpotlight` would attach window listeners inside every story that
rendered it and could not be pinned at a fixed position at all. Keeping the
component inert is what makes the catalogue able to review it (`rules.md`
§ R23's corollary: the catalogue only catches problems when `ui/` components
call nothing).

### What it consumes

Three inherited custom properties, each with a fallback, so the component is
complete on its own:

| Property | Fallback | Effect |
|---|---|---|
| `--spotlight-x` | `50%` | horizontal centre of the light |
| `--spotlight-y` | `50%` | vertical centre |
| `--spotlight-opacity` | `1` | whole-layer opacity, transitioned over `--duration-spotlight-fade` |

Anything that can set a custom property can drive it: the composable at
runtime, a story's wrapper `<div>` at rest, a test's inline style.

### What it renders

```html
<div class="cursor-spotlight" aria-hidden="true">   <!-- root -->
  <div class="cursor-spotlight__beam">              <!-- the light -->
    <div class="cursor-spotlight__window">          <!-- static mask -->
      <div class="cursor-spotlight__lit" />         <!-- the second dot sheet -->
    </div>
  </div>
</div>
```

| Element | Obligations |
|---|---|
| root | `absolute inset-0`, `pointer-events-none`, `aria-hidden="true"`, `z-index: var(--layer-spotlight)`, `overflow: clip`, `opacity: var(--spotlight-opacity, 1)` with a transition |
| beam | `--spotlight-outer-size` square, offset by half its size, `transform: translate3d(var(--spotlight-x), var(--spotlight-y), 0)`, two `background-image` layers (core over outer field), `background-repeat: no-repeat` |
| window | `inset` of one negative `--dot-paper-step` on all sides, **static** `mask-image` with the same falloff as the light |
| lit | the `--dot-paper-*` recipe with `--dot-paper-lit-color`, counter-translated by the beam's page origin **modulo** `--dot-paper-step` |

Plus three media guards that set `display: none`:
`(prefers-reduced-motion: reduce)`, `not (hover: hover)`, and `print`.

### Invariants a consumer may rely on

1. It never intercepts a pointer and never appears in the accessibility tree.
2. It never changes the page's scrollable width or height, at any pointer
   position (`overflow: clip` on the root).
3. It contains no colour, size or duration literal — every value is a token.
4. It reads no Nuxt composable, no router, no i18n, no `window`.
5. Its dots land on the same 24px grid as `DotGrid`'s, because both resolve
   the same `--dot-paper-*` tokens.

### Host contract — what it needs from whoever renders it

- A **positioned** ancestor that establishes the page's single stacking
  context and spans the whole document, not the viewport. That is
  `app/layouts/default.vue`'s root, the same host `DotGrid` requires; inside a
  viewport-height ancestor the effect is confined to the first screen.
- That same ancestor **must be the element the composable writes to**, so the
  published coordinates and the layer's coordinate space agree.
- It must be rendered **after** `<DotGrid />` for readability, though
  correctness comes from the level, not the order — which is the whole point
  of § R28 having distinct levels.

---

## 2 · `useCursorSpotlight` — `app/shared/logic/useCursorSpotlight.ts`

```ts
import type { Ref } from 'vue'

export function useCursorSpotlight(
  host: Ref<HTMLElement | null>
): { isActive: Readonly<Ref<boolean>> }
```

**One argument**: the element the coordinates are published on, which is also
the coordinate origin. **One return value**: whether the effect should be
rendered.

### Lifecycle

| Moment | What happens |
|---|---|
| call (setup) | nothing but registration — no `window` access, so it is safe during SSR |
| `onMounted` | evaluate `(hover: hover) and (pointer: fine)` and `(prefers-reduced-motion: reduce)`; subscribe to both `change` events; if eligible, attach the listeners |
| `pointermove` | ignore unless `pointerType === 'mouse'`; store `clientX/clientY`; request a frame if none is pending |
| `scroll` | store nothing new; request a frame if none is pending |
| the frame | read `scrollX`/`scrollY` **first**, then write `--spotlight-x` / `--spotlight-y`; on the first one, also flip `isActive` |
| `pointerleave` / `pointerenter` on `document.documentElement` | write `--spotlight-opacity` `0` / `1` |
| media `change` | attach or detach the listeners; when it becomes ineligible, clear the properties and set `isActive` false |
| `onScopeDispose` | remove every listener, cancel any pending frame, clear all three properties |

### Guarantees

1. **At most one property write per animation frame**, at any event rate.
2. **Every listener is passive** — none can block scrolling.
3. **No layout is forced**: the only geometry read in the hot path is
   `scrollX`/`scrollY`, taken before any write. The host's offset is measured
   once, outside the hot path.
4. **`isActive` is `false` during SSR and on the first client render**, so the
   element is absent from the prerendered HTML and no hydration mismatch is
   possible.
5. **Disposal is complete**: after the scope stops, the document holds no
   listener and the host holds no property this composable set.

### Deliberately not in this contract

No `enabled` argument, no `radius`/`intensity` options, no returned
coordinates, no exported constants for the media queries, and no way to force
the effect on. Each was considered: an option object would be configuration
for a single call site, and returning the coordinates would invite a second
consumer to duplicate the layer instead of composing the one that exists.
