import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { onUnmounted } from 'vue'
import MobileMenu from './MobileMenu.vue'
import { SHELL_COPY, SOCIALS } from './shellFixtures.testing'

/**
 * The open mobile menu (feature 43, FR-015…FR-023; pen extract-43 § 4,
 * `chQ4f` / `QpUCy`) at "Móvil (390)": Negro 950 base, the menu listón,
 * Negro 950 70 % glass with 24 px blur; the bar with Cerrar; links in
 * Poppins 32 / 500 from y 150; the divider at y 440; social buttons at
 * y 480. Tab cycles inside; Cerrar emits `close`.
 */
const meta = {
  title: 'Shell/MobileMenu',
  component: MobileMenu,
  globals: { backgrounds: { value: 'negro' }, viewport: { value: 'mobile' } },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MobileMenu>

export default meta
type Story = StoryObj<typeof meta>

function args(locale: 'es' | 'en') {
  const copy = SHELL_COPY[locale]
  return {
    open: true,
    items: copy.items,
    socials: SOCIALS,
    home: copy.home,
    homeLabel: copy.homeLabel,
    locale,
    localeSwitchHref: copy.localeSwitchHref,
    localeSwitchLabel: copy.localeSwitchLabel,
    label: copy.menuLabel,
    closeLabel: copy.menuCloseLabel,
  }
}

/**
 * The browser refuses WebGL while this story is mounted, as a GPU-less
 * device would: no listón, the base and the glass alone (FR-022).
 */
const withoutWebGl = () => ({
  setup() {
    const original = HTMLCanvasElement.prototype.getContext
    const refuseWebGl = function (
      this: HTMLCanvasElement,
      ...params: Parameters<typeof original>
    ) {
      return params[0] === 'webgl' ? null : original.apply(this, params)
    } as typeof original
    HTMLCanvasElement.prototype.getContext = refuseWebGl
    onUnmounted(() => {
      HTMLCanvasElement.prototype.getContext = original
    })
  },
  template: '<story />',
})

export const OpenEs390: Story = { args: args('es') }
export const OpenEn390: Story = { args: args('en') }
export const OpenEsWithoutWebGl390: Story = {
  args: args('es'),
  decorators: [withoutWebGl],
}
