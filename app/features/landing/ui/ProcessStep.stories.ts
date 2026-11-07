import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { HOW_WE_WORK_COPY } from './landingFixtures.testing'
import ProcessStep from './ProcessStep.vue'

/**
 * One step of "Cómo trabajamos" (feature 44, pen extract-44 § 4), lit and
 * not lit, as a column at "Escritorio (1440)" (`columnLit`, the hover
 * preview's state) and a rail row at "Móvil (390)" (`lit`, the scroll's).
 * Not-lit dots ping in grey, lit ones in red (FR-047, Roberto 2026-11-02).
 */
const meta = {
  title: 'Landing/ProcessStep',
  component: ProcessStep,
  globals: { backgrounds: { value: 'negro' } },
  decorators: [
    () => ({ template: '<ol class="max-w-medida p-gutter"><story /></ol>' }),
  ],
} satisfies Meta<typeof ProcessStep>

export default meta
type Story = StoryObj<typeof meta>

const [first, second] = HOW_WE_WORK_COPY.es.steps
const [firstEn, secondEn] = HOW_WE_WORK_COPY.en.steps
if (!first || !second || !firstEn || !secondEn) throw new Error('fixtures')

export const EsLitDesktop1440: Story = {
  args: { ...first, lit: true, columnLit: true, fill: 1, isLast: false },
  globals: { viewport: { value: 'desktop' } },
}
export const EsNotLitDesktop1440: Story = {
  args: { ...second, lit: false, fill: 0, isLast: false },
  globals: { viewport: { value: 'desktop' } },
}
export const EnLitMobile390: Story = {
  args: { ...firstEn, lit: true, fill: 0.5, isLast: false },
  globals: { viewport: { value: 'mobile' } },
}
export const EsNotLitMobile390: Story = {
  args: { ...second, lit: false, fill: 0, isLast: false },
  globals: { viewport: { value: 'mobile' } },
}
export const EnLitDesktop1440: Story = {
  args: { ...firstEn, lit: true, columnLit: true, fill: 1, isLast: false },
  globals: { viewport: { value: 'desktop' } },
}
export const EnNotLitDesktop1440: Story = {
  args: { ...secondEn, lit: false, fill: 0, isLast: false },
  globals: { viewport: { value: 'desktop' } },
}
export const EsLitMobile390: Story = {
  args: { ...first, lit: true, fill: 0.5, isLast: false },
  globals: { viewport: { value: 'mobile' } },
}
export const EnNotLitMobile390: Story = {
  args: { ...secondEn, lit: false, fill: 0, isLast: false },
  globals: { viewport: { value: 'mobile' } },
}

/* FR-043 (Roberto review 2026-11-02): the step the timeline previews on
   hover or keyboard focus, grown to `--paso-escala` and a tab stop. The
   scale is off under reduced motion. Desktop only: the rail has no hover. */
export const EsRaisedDesktop1440: Story = {
  args: {
    ...second,
    lit: true,
    columnLit: true,
    fill: 1,
    isLast: false,
    raised: true,
    focusable: true,
  },
  globals: { viewport: { value: 'desktop' } },
}
export const EnRaisedDesktop1440: Story = {
  args: {
    ...secondEn,
    lit: true,
    columnLit: true,
    fill: 1,
    isLast: false,
    raised: true,
    focusable: true,
  },
  globals: { viewport: { value: 'desktop' } },
}

/* Feature 50 (Roberto 2026-11-06): a rail row one step away from the rail's
   active point, its text shrunk and faded by the scroll emphasis (the
   `--paso-enfasis-*` starting values). Mobile only. */
export const EsDimmedMobile390: Story = {
  args: {
    ...second,
    lit: false,
    fill: 0,
    isLast: false,
    emphasis: { scale: 0.92, opacity: 0.45 },
  },
  globals: { viewport: { value: 'mobile' } },
}
export const EnDimmedMobile390: Story = {
  args: {
    ...secondEn,
    lit: false,
    fill: 0,
    isLast: false,
    emphasis: { scale: 0.92, opacity: 0.45 },
  },
  globals: { viewport: { value: 'mobile' } },
}
