import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Feature 42 · SC-007 and FR-016: the files this feature creates under `app/`
 * carry no colour or length literal and no v1 token (Constitution VII). The
 * only places a literal may live are the `global.css` token declarations,
 * the copied GLSL, the cursor SVG and the Storybook swatch config, none of
 * which is scanned here.
 *
 * Comments are stripped first: a comment may quote the `.pen` value a token
 * stands for, which is documentation, not usage.
 *
 * The list is explicit and every entry must exist: a pattern match would let
 * a renamed file drop out of the scan unnoticed (review-42 advisory 2; the
 * 2026-11-01 naming reorganization renamed every one of these components).
 */
const ROOT = process.cwd()
const SHARED = join(ROOT, 'app', 'shared')

const COMPONENTS = [
  'GlassButton',
  'GlassSurface',
  'Heading',
  'Pill',
  'PrimaryButton',
  'RotatingPill',
  'ShaderBackground',
  /* Feature 43 · the Muush 1.0 brand marks (spec FR-036, FR-037, SC-007). */
  'Isotipo',
  'Wordmark',
  'Lockup',
  'SocialIcon',
]

/*
 * Feature 43 · the v2 shell (spec FR-043, SC-007): every file it creates or
 * rewrites outside `legacy/`. The v1 shell in `ui/legacy/` is quarantined
 * and not scanned.
 */
const SHELL = join(ROOT, 'app', 'features', 'shell')

const SHELL_COMPONENTS = [
  'SiteHeader',
  'NavLinkBar',
  'MenuButton',
  'MobileMenu',
  'SiteFooter',
  'FooterColumns',
  'MobileFooter',
  'SocialLinks',
  'ShellItemLink',
  'LanguageToggle',
]

const SHELL_SCANNED = [
  ...SHELL_COMPONENTS.flatMap(name => [
    join(SHELL, 'ui', `${name}.vue`),
    join(SHELL, 'ui', `${name}.stories.ts`),
  ]),
  ...[
    'useShellNavigation.ts',
    'useShellItemResolver.ts',
    'useMobileMenu.ts',
    'useNavScrollReveal.ts',
    'useFocusTrap.ts',
    'useActiveSection.ts',
    /* FR-061 · Language switch keeps position, Roberto 2026-11-01. */
    'localeSwitchScroll.ts',
    'useLocaleSwitchScroll.ts',
  ].map(name => join(SHELL, 'logic', name)),
  ...[
    'types.ts',
    'navigation.ts',
    'footerColumns.ts',
    'contactChannels.ts',
    'notFound.ts',
  ].map(name => join(SHELL, 'data', name)),
  join(ROOT, 'app', 'layouts', 'default.vue'),
  join(SHARED, 'data', 'sectionAnchors.ts'),
]

/*
 * Feature 44 · the v2 home (spec FR-031, SC-008): every component, story,
 * composable and data module it creates outside `legacy/`, landing and
 * shared. Inline map geometry is percentages from data, not lengths.
 */
const LANDING = join(ROOT, 'app', 'features', 'landing')

const HOME_COMPONENTS = [
  'HeroSection',
  'WhoWeAreSection',
  'ServicesSection',
  'ServiceCard',
  'ServicesCarousel',
  'CarouselIndicator',
  'AlsoAvailable',
  'HowWeWorkSection',
  'ProcessTimeline',
  'ProcessStep',
  'CommitmentChip',
]

const HOME_SCANNED = [
  ...HOME_COMPONENTS.flatMap(name => [
    join(LANDING, 'ui', `${name}.vue`),
    join(LANDING, 'ui', `${name}.stories.ts`),
  ]),
  join(LANDING, 'index.ts'),
  ...[
    'useHeroContent.ts',
    'useWhoWeAreContent.ts',
    'useServicesContent.ts',
    'useHowWeWorkContent.ts',
    'carouselIndicator.ts',
    'useCarouselIndicator.ts',
    'timelineProgress.ts',
    'useTimelineProgress.ts',
    /* Roberto review 2026-11-02 · FR-042…FR-045. */
    'useTimelineHover.ts',
  ].map(name => join(LANDING, 'logic', name)),
  ...[
    'heroContent.ts',
    'whoWeAreContent.ts',
    'servicesContent.ts',
    'howWeWorkContent.ts',
  ].map(name => join(LANDING, 'data', name)),
  ...['WorldMap', 'MapPin', 'MapRegionTabs', 'MapLegend'].flatMap(name => [
    join(SHARED, 'ui', `${name}.vue`),
    join(SHARED, 'ui', `${name}.stories.ts`),
  ]),
  ...['mapPins.ts', 'mapRegions.ts', 'layout.ts'].map(name =>
    join(SHARED, 'data', name)
  ),
  ...['useMapRegion.ts', 'useDesktopLayout.ts'].map(name =>
    join(SHARED, 'logic', name)
  ),
  join(SHARED, 'utils', 'mapGeometry.ts'),
  join(SHARED, 'utils', 'mapCityList.ts'),
  join(ROOT, 'app', 'pages', 'index.vue'),
]

const SCANNED = [
  ...COMPONENTS.flatMap(name => [
    join(SHARED, 'ui', `${name}.vue`),
    join(SHARED, 'ui', `${name}.stories.ts`),
  ]),
  join(SHARED, 'ui', 'tokens.stories.ts'),
  ...[
    'useReducedMotion.ts',
    'useRotatingText.ts',
    'useShaderCanvas.ts',
    'shaderRenderer.ts',
  ].map(name => join(SHARED, 'logic', name)),
  join(SHARED, 'utils', 'shaderFrame.ts'),
  join(SHARED, 'data', 'glassPresets.ts'),
  join(SHARED, 'data', 'backgroundPresets.ts'),
  ...SHELL_SCANNED,
  ...HOME_SCANNED,
]

const FORBIDDEN: [string, RegExp][] = [
  ['hex colour', /#[0-9a-f]{3,8}\b/i],
  ['rgb() colour', /\brgba?\(/i],
  ['px length', /\b\d+(\.\d+)?px\b/],
  /* `-\d`: the v1 families are numeric ramps (`--red-400`); the v2
     `--red-muush-500` shares the `red-` stem and is not v1. */
  ['v1 token', /--(bone|ink|red|wine)-\d/],
  ['v1 utility', /\b[\w:-]*-(bone|ink|red|wine)-\d/],
  /* Feature 44 · any quarantined `legacy-*` token or utility. */
  ['legacy token', /\blegacy-[\w-]+/],
]

function withoutComments(source: string): string {
  return source
    .replaceAll(/\/\*[\s\S]*?\*\//g, '')
    .replaceAll(/<!--[\s\S]*?-->/g, '')
    .replaceAll(/(^|[^:])\/\/.*$/gm, '$1')
}

describe('token literals · new files speak tokens only (SC-007)', () => {
  it('should find every file it is meant to scan when the feature is built', () => {
    /* A scan of nothing is green forever (rules.md § R39). */
    expect(SCANNED.filter(path => !existsSync(path))).toEqual([])
  })

  for (const path of SCANNED) {
    const name = path.slice(ROOT.length + 1)

    it(`should hold no literal or v1 token when ${name} is scanned`, () => {
      const code = withoutComments(readFileSync(path, 'utf8'))

      for (const [label, pattern] of FORBIDDEN) {
        expect(code.match(pattern)?.[0], `${label} in ${name}`).toBeUndefined()
      }
    })
  }
})
