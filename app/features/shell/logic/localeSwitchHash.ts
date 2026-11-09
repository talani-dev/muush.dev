import type { Ref } from 'vue'

/**
 * The fragment the language toggle carries to the other locale's page
 * (feature 51, spec FR-013, OQ-6 = A; research R3).
 *
 * Every other page switches without a fragment (spec 043 FR-061: the
 * toggle keeps the visitor's position instead). Preguntas is the one
 * exception: a page that names one of its topics in the URL
 * (`/es/preguntas#precios`) sets the other locale's anchor for the same
 * topic here (`pricing`), and `useShellNavigation` appends it to the
 * toggle's href. The page resets it when it is left, so no other page ever
 * inherits it.
 *
 * Shared state, not a prop: the toggle is in the layout's header and the
 * page cannot reach it. `useState`, so the server render and hydration
 * agree: it is only ever set after mount, so the prerendered href carries
 * no fragment (a fragment never exists at build time, rules.md § R9).
 */
export function useLocaleSwitchHash(): Ref<string | undefined> {
  return useState<string | undefined>('locale-switch-hash', () => undefined)
}
