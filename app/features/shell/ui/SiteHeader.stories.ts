import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SiteHeader from './SiteHeader.vue'
import { SHELL_COPY } from './shellFixtures.testing'

/**
 * The Muush 1.0 header (feature 43, FR-001…FR-014; pen extract-43 §§ 2–3).
 * "Escritorio (1440)": the 1280 × 64 row 24 from the top (isotipo 40 × 22 —
 * no wordmark in the header, Roberto 2026-11-01, spec FR-059 — link bar,
 * 40 × 40 language, 195 × 40 CTA). "Móvil (390)": the 342 × 60
 * bar 16 from the top (isotipo 40 × 22, two 36 × 36 controls). Scroll the
 * tall canvas: it hides past 80 px going down and returns going up.
 * From `lg` the link bar sits on the page centre between two equal tracks
 * (feature 44, FR-040, Roberto review 2026-11-02).
 */
const meta = {
  title: 'Shell/SiteHeader',
  component: SiteHeader,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'fullscreen' },
  decorators: [
    () => ({
      /* Three screens of empty canvas to scroll. */
      template:
        '<div><story /><div class="h-screen" /><div class="h-screen" /><div class="h-screen" /></div>',
    }),
  ],
} satisfies Meta<typeof SiteHeader>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

/*
 * What is lit: `top` the Home item at the top of the home page (Home link
 * added by Roberto 2026-11-01), `section` Servicios in view, `page`
 * Nosotros / About on its page.
 */
const LIT = {
  top: { index: 0, current: 'page' },
  section: { index: 1, current: 'section' },
  page: { index: 2, current: 'page' },
} as const

function args(locale: 'es' | 'en', lit?: keyof typeof LIT) {
  const copy = SHELL_COPY[locale]
  const marked = lit ? LIT[lit] : undefined
  return {
    items: copy.items.map((item, index) =>
      marked && index === marked.index
        ? { ...item, current: marked.current }
        : item
    ),
    cta: copy.cta,
    home: copy.home,
    homeLabel: copy.homeLabel,
    locale,
    localeSwitchHref: copy.localeSwitchHref,
    localeSwitchLabel: copy.localeSwitchLabel,
    navLabel: copy.navLabel,
    menuOpenLabel: copy.menuOpenLabel,
  }
}

export const EsDesktop1440: Story = { args: args('es'), globals: desktop }
export const EnDesktop1440: Story = { args: args('en'), globals: desktop }
export const EsHomeTop1440: Story = {
  args: args('es', 'top'),
  globals: desktop,
}
export const EnHomeTop1440: Story = {
  args: args('en', 'top'),
  globals: desktop,
}
export const EsServicesInView1440: Story = {
  args: args('es', 'section'),
  globals: desktop,
}
export const EnAboutPage1440: Story = {
  args: args('en', 'page'),
  globals: desktop,
}
export const EsMobile390: Story = { args: args('es'), globals: mobile }
export const EnMobile390: Story = { args: args('en'), globals: mobile }
