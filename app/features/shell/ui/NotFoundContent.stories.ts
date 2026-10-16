import type { Meta, StoryObj } from '@storybook/vue3-vite'
import DotGrid from '@/shared/ui/DotGrid.vue'
import NotFoundContent from './NotFoundContent.vue'

/**
 * The not-found page's content (feature 36), from Roberto's reference
 * `specs/036-not-found-page/reference/404.html`. Copy is the approved table
 * of `specs/036-not-found-page/spec.md` § Copy, passed as fixtures — the
 * component calls no Nuxt composable (rules.md § R23).
 *
 * Rendered on the host the layout provides, with the dotted paper, so the red
 * glow (gate G4) is reviewable where it really paints: on `--layer-glow`,
 * beneath the dots — the same composed setup as `SectionBackdrop.stories.ts`.
 * The site's nav and footer are not part of this component.
 */
/** The layout's own root (`app/layouts/default.vue`). */
const HOST = 'relative isolate min-h-screen overflow-clip bg-ink-500'

const meta = {
  title: 'Shell/NotFoundContent',
  component: NotFoundContent,
  parameters: { layout: 'fullscreen' },
  render: args => ({
    components: { DotGrid, NotFoundContent },
    setup: () => ({ args, HOST }),
    template: `
      <div :class="HOST">
        <DotGrid />
        <main class="mx-auto max-w-shell-max px-page">
          <NotFoundContent v-bind="args" />
        </main>
      </div>
    `,
  }),
} satisfies Meta<typeof NotFoundContent>

export default meta
type Story = StoryObj<typeof meta>

export const Spanish: Story = {
  args: {
    eyebrow: 'Error 404',
    headline: 'No encontramos esta página.',
    body: 'Puede que el link venga mal escrito o que la página haya cambiado de lugar.',
    cta: { label: 'Volver al inicio', href: '/es' },
    shortcutsLabel: 'Atajos',
    shortcuts: [
      { label: 'Propósito', href: '/es#proposito' },
      { label: 'Servicios', href: '/es#servicios' },
      { label: 'Nosotros', href: '/es/nosotros' },
    ],
  },
  globals: { viewport: { value: 'desktop' } },
}

export const English: Story = {
  args: {
    eyebrow: 'Error 404',
    headline: "We couldn't find this page.",
    body: 'The link may be mistyped, or the page may have moved.',
    cta: { label: 'Back to home', href: '/en' },
    shortcutsLabel: 'Shortcuts',
    shortcuts: [
      { label: 'Purpose', href: '/en#proposito' },
      { label: 'Services', href: '/en#servicios' },
      { label: 'About us', href: '/en/about' },
    ],
  },
  globals: { viewport: { value: 'desktop' } },
}

/** 390 px: the outer ring (420) is wider than the viewport and is clipped. */
export const Mobile: Story = {
  args: Spanish.args,
  globals: { viewport: { value: 'mobile' } },
}
