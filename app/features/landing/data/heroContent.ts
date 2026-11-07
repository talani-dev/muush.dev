/**
 * The home hero's content model (feature 44, data-model §§ 4–5; copy in
 * `docs/business/muush-1.0.md` § 4.2). Keys only: `logic/useHeroContent`
 * resolves them, `ui/HeroSection` receives plain strings.
 */
import type { ClickTrackingEvent } from '@/shared/data/trackingEvents'

/** What "Diagnóstico gratis" in the hero reports (feature 49). */
export const HERO_PRIMARY_TRACK: ClickTrackingEvent = {
  name: 'assessment_cta_click',
  params: { cta_location: 'hero' },
}

export const HERO_KEYS = {
  /** The rotating pill, in the order it cycles (the four services). */
  pill: [
    'landing.hero.pill.strategy',
    'landing.hero.pill.software',
    'landing.hero.pill.automation',
    'landing.hero.pill.design',
  ],
  headlineFirst: 'landing.hero.headline.first',
  headlineSecond: 'landing.hero.headline.second',
  subtitle: 'landing.hero.subtitle',
  primary: 'landing.hero.primary',
  secondary: 'landing.hero.secondary',
} as const

export interface HeroContent {
  pillItems: string[]
  headlineFirst: string
  headlineSecond: string
  subtitle: string
  primaryLabel: string
  /** The locale's home + `#diagnostico`. */
  primaryHref: string
  secondaryLabel: string
  /** The locale's home + `#como-trabajamos`. */
  secondaryHref: string
}
