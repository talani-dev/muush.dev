import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { useCursorSpotlight } from '@/shared/logic/useCursorSpotlight'
import CursorSpotlight from '@/shared/ui/CursorSpotlight.vue'
import DotGrid from '@/shared/ui/DotGrid.vue'

/**
 * The one component in this system whose whole point is invisible in a
 * screenshot: a light that only exists while a pointer is moving.
 *
 * The design file had the same problem and solved it the same way. Frame
 * `gViAx` "DEMO spotlight cursor" draws **three static positions** with the
 * legend *"el seguimiento lo programa Roberto"* — three samples of one
 * continuous behaviour, not three states to build. **Pinned** below is that
 * idea carried into the catalogue: the complete recipe held still, with no
 * pointer and no runtime, so the gradient falloff can be compared against the
 * frame at rest. **Live** is the same layer with the real tracking attached.
 *
 * What to look for:
 *
 * 1. **The falloff.** A wide, gentle field about 660px across, dense at the
 *    centre, with a second denser core 180px across inside it. The mid stop at
 *    0.42 is what makes it fall away slowly and then quickly; a two-stop
 *    gradient reads visibly harder.
 * 2. **The dots inside the radius**, which is the hard half of the feature.
 *    They must be brighter **and more distinct** than the dots outside — a
 *    plain translucent light *veils* dots rather than lifting them, which is
 *    why `ui-map.md:271` states the requirement separately.
 * 3. **The boundary.** No doubled dot, no half-step dot, no hard circular edge
 *    in the paper. A registration bug shows here first, and nothing errors
 *    when it happens.
 *
 * ⚠️ Two values in these stories are **UNVERIFIED, owner Clau**: how bright a
 * lit dot should be (`--dot-paper-lit-color`, spec A-03 — no static mockup can
 * draw a pointer-dependent brightness, so it is derived as the base recipe
 * painted twice) and the fade duration (`--duration-spotlight-fade`, spec
 * A-08). Both are single tokens, so a value from Clau costs one line.
 */
const meta = {
  title: 'Shared/UI/CursorSpotlight',
  component: CursorSpotlight,
} satisfies Meta<typeof CursorSpotlight>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The host the layout provides, reproduced exactly: the page's single stacking
 * context, positioned, spanning the document rather than the viewport, painting
 * the ink base (`contracts/components.md` § Host contract). The spotlight is
 * confined to the first screen inside a viewport-height ancestor, the same
 * constraint `DotGrid` has.
 */
const HOST = 'relative isolate min-h-svh overflow-x-clip bg-ink-500'

const COPY =
  'mx-auto max-w-shell-max px-page py-24 font-instrument text-bone-100'

/**
 * Frame `gViAx`, `Estado 2`: both circles centred on (900, 180) of the
 * 1440-wide page. These two numbers are the frame's own coordinates, held
 * still so the recipe can be reviewed — they are a story's stand-in for a
 * pointer, not a design value any component carries.
 *
 * **Nothing runs here.** No composable, no pointer event, no Nuxt runtime:
 * the wrapper sets two custom properties inline and the component resolves
 * everything else from tokens (FR-022, SC-011). That is only possible because
 * `CursorSpotlight` imports nothing — a `ui/` component that called the
 * composable could not be pinned at all (`rules.md` § R23's corollary).
 */
export const Pinned: Story = {
  render: () => ({
    components: { CursorSpotlight, DotGrid },
    setup: () => ({ HOST, COPY }),
    template: `
      <div :class="HOST" style="--spotlight-x: 900px; --spotlight-y: 180px">
        <DotGrid />
        <CursorSpotlight />

        <div :class="COPY">
          <p class="text-display">Hablamos negocio y código.</p>
          <p class="max-w-2xl pt-6 text-body-lg text-bone-300">
            Los puntos dentro del radio suben de brillo; los de afuera no.
            Compara el borde: no debe haber un punto doble ni un canto duro.
          </p>
        </div>
      </div>
    `,
  }),
}

/**
 * The same layer with the real tracking attached — the composable called from
 * the story's own `setup()`, against the wrapper's ref, exactly as
 * `app/layouts/default.vue` calls it.
 *
 * Move the pointer over the canvas: the light follows it, the dots under it
 * lift, and nothing on the canvas can be clicked into or selected differently
 * than before. Leave the canvas and the light fades rather than freezing.
 *
 * It also demonstrates the guards, because they are not simulated here: with
 * the catalogue's own `prefers-reduced-motion` emulation on, or on a
 * touch-only device, the element never mounts and the canvas is exactly the
 * **Pinned** story's background minus the light.
 */
export const Live: Story = {
  render: () => ({
    components: { CursorSpotlight, DotGrid },
    setup() {
      const host = ref<HTMLElement | null>(null)
      const { isActive } = useCursorSpotlight(host)

      return { host, isActive, HOST, COPY }
    },
    template: `
      <div ref="host" :class="HOST">
        <DotGrid />
        <CursorSpotlight v-if="isActive" />

        <div :class="COPY">
          <p class="text-display">Hablamos negocio y código.</p>
          <p class="max-w-2xl pt-6 text-body-lg text-bone-300">
            Mueve el puntero sobre el lienzo. Nada más se mueve, nada se
            retrasa y nada intercepta el cursor.
          </p>
        </div>
      </div>
    `,
  }),
}
