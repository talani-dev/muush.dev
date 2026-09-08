import type { Meta, StoryObj } from '@storybook/vue3-vite'
import PurposeSection from './PurposeSection.vue'

/**
 * `02 Propósito`, the landing's second section and the site's **most
 * divergent**. Switch the viewport control between *Móvil (390)* and
 * *Escritorio (1440)* and you are not looking at the same layout rescaled —
 * you are looking at two compositions:
 *
 * - **Escritorio** — a Golden Circle constellation. Three pinging radars,
 *   three words, three concentric arcs, and nothing else until you point at
 *   something. Hover or tab to a radar **or its word** and that node's
 *   connector line draws to the right, then its card fades in.
 * - **Móvil** — a centre-snapping carousel. `Why` centred and active, its two
 *   neighbours at 0.88 scale and 45% opacity bleeding off both edges, three
 *   dots below.
 *
 * ⚠️ **The reveal is not reviewable from a screenshot, and that is the point.**
 * At rest the desktop story shows three words and three dots. The design file
 * draws the *revealed* state — a static mockup cannot draw a hover, the same
 * misreading `ui-map.md` § *Receta del ping* already recorded for the radar's
 * halos — so a catalogue entry that looked like the frame would be wrong. Move
 * the pointer onto a dot, or press Tab, to see what the frame drew.
 *
 * ⚠️ **Three more things look wrong here and are not.**
 *
 * - **The labels read `Why` / `How` / `What` in the Spanish story too.** Read
 *   from the design file on 2026-09-08: both locale frames draw English. Same
 *   case as the Hero's `Technology solution studio`, and
 *   `tests/landing-copy.test.ts` holds the two locale files identical for
 *   these three keys so a translation sweep cannot "fix" them.
 * - **The three cards are the same brightness.** The frame draws Why brighter
 *   (`red-strong`); that is its **hover** surface, not Golden Circle hierarchy
 *   (Roberto, 2026-09-08).
 * - **The radars are dimmer than in the frame.** Rest intensity is
 *   ⚠️ UNVERIFIED and derived — see `--purpose-radar-rest-opacity`.
 *
 * The three glows and the arcs paint at negative and zero levels. On this page
 * there is no ink base beneath the glows, so they read darker than they do on
 * the site; their composition is what these stories are for.
 *
 * Every prop below is a **fixture**. The component calls no Nuxt composable,
 * which is why it renders here with no i18n instance and no Nuxt runtime
 * (`docs/business/rules.md` § R23).
 */
const meta = {
  title: 'Landing/PurposeSection',
  component: PurposeSection,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PurposeSection>

export default meta
type Story = StoryObj<typeof meta>

const spanish = {
  eyebrow: 'Propósito',
  carouselLabel: 'Propósito',
  nodes: [
    {
      id: 'why' as const,
      index: 0 as const,
      label: 'Why',
      copy: 'Construimos con el estándar de las aplicaciones que admiramos. Tu negocio merece estar a la misma altura.',
    },
    {
      id: 'how' as const,
      index: 1 as const,
      label: 'How',
      copy: 'Con precisión: lo que tu negocio necesita, sin relleno. Un technology solution studio que responde como un solo equipo.',
    },
    {
      id: 'what' as const,
      index: 2 as const,
      label: 'What',
      copy: 'Diseñamos y construimos soluciones digitales alrededor de tu negocio.',
    },
  ],
}

const english = {
  eyebrow: 'Purpose',
  carouselLabel: 'Purpose',
  nodes: [
    {
      id: 'why' as const,
      index: 0 as const,
      label: 'Why',
      copy: 'We build to the standard of the apps we admire. Your business deserves to be held to it.',
    },
    {
      id: 'how' as const,
      index: 1 as const,
      label: 'How',
      copy: 'With precision: what your business needs, nothing padded. A technology solution studio that answers as one team.',
    },
    {
      id: 'what' as const,
      index: 2 as const,
      label: 'What',
      copy: 'We design and build digital solutions around your business.',
    },
  ],
}

/** The rest state: three words, three dots, three arcs, and no card. */
export const Spanish: Story = {
  args: spanish,
  globals: { viewport: { value: 'desktop' } },
}

/** Only the copy differs; the labels are English in both frames. */
export const English: Story = {
  args: english,
  globals: { viewport: { value: 'desktop' } },
}

/**
 * A revealed node, without a live cursor.
 *
 * The reveal is `:hover` / `:focus-visible` on the trigger driving its later
 * siblings, so there is no prop and no state a story could set — which is
 * itself the thing worth reviewing. This entry pins `Why` open from outside,
 * so the drawn line, the brightened card surface and the brighter radar are
 * reviewable in the catalogue rather than only under a pointer.
 *
 * ⚠️ The stylesheet is a module constant painted with `v-html`, **not** a
 * `<style>` tag inside the template. A tag with side effects in a template
 * compiles under SSR and throws in the client compiler — *"Tags with side
 * effect (`<script>` and `<style>`) are ignored in client component
 * templates"* (`findings.md` § R51), and Storybook compiles this string in the
 * browser. Same mechanism `Lockup.vue` and `SiteNav.vue` already use.
 */
const REVEAL_STYLESHEET = `<style>
  .node:first-child .link {
    width: calc(
      100% - var(--purpose-card-w) - var(--purpose-node-x) -
        var(--purpose-link-offset)
    ) !important;
  }
  .node:first-child .card { opacity: 1 !important; }
  .node:first-child .radar { opacity: 1 !important; }
</style>`

export const Revealed: Story = {
  args: spanish,
  globals: { viewport: { value: 'desktop' } },
  decorators: [
    () => ({
      setup: () => ({ revealStylesheet: REVEAL_STYLESHEET }),
      template: '<div><span v-html="revealStylesheet" /><story /></div>',
    }),
  ],
}

/** Below `lg`: no constellation at all, and the label moves inside the card. */
export const Mobile: Story = {
  args: spanish,
  globals: { viewport: { value: 'mobile' } },
}

export const MobileEnglish: Story = {
  args: english,
  globals: { viewport: { value: 'mobile' } },
}
