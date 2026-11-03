import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { CompositionKind } from '@/features/about/data/teamCompositionContent'
import {
  type FixtureLocale,
  TEAM_COMPOSITION_COPY,
} from './aboutFixtures.testing'
import CompositionCard from './CompositionCard.vue'

/**
 * One "Cómo se arma" card (feature 46; pen extract-46 § 1.2): the three
 * kinds, each dot pinging in its own colour (none under reduced motion).
 * Rendered inside a `ul` because the card is a list item. From `lg` the
 * title may run into the end padding ("Cuando el proyecto lo pide" is one
 * line in the 400 px card); see the 400 px row story.
 */
const meta = {
  title: 'About/CompositionCard',
  component: CompositionCard,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
  decorators: [() => ({ template: '<ul class="grid"><story /></ul>' })],
} satisfies Meta<typeof CompositionCard>

export default meta
type Story = StoryObj<typeof meta>

function card(locale: FixtureLocale, kind: CompositionKind) {
  const found = TEAM_COMPOSITION_COPY[locale].cards.find(
    entry => entry.kind === kind
  )
  if (!found) throw new Error(`no ${kind} card`)
  return found
}

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

export const TeamEsMobile390: Story = {
  args: card('es', 'team'),
  globals: mobile,
}
export const TeamEnDesktop1440: Story = {
  args: card('en', 'team'),
  globals: desktop,
}
export const PoolEsDesktop1440: Story = {
  args: card('es', 'pool'),
  globals: desktop,
}
export const PoolEnMobile390: Story = {
  args: card('en', 'pool'),
  globals: mobile,
}
export const PartnerEsMobile390: Story = {
  args: card('es', 'partner'),
  globals: mobile,
}
export const PartnerEnDesktop1440: Story = {
  args: card('en', 'partner'),
  globals: desktop,
}

/** The 1440 row: three 400 px cards, gap 24, all 197 tall as drawn. */
export const RowEsDesktop1440: Story = {
  args: card('es', 'pool'),
  globals: desktop,
  render: () => ({
    components: { CompositionCard },
    setup: () => ({ cards: TEAM_COMPOSITION_COPY.es.cards }),
    template:
      '<ul class="grid max-w-composicion grid-cols-3 gap-composicion-tarjetas"><CompositionCard v-for="item in cards" :key="item.kind" v-bind="item" /></ul>',
  }),
}
