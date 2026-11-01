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
]

const FORBIDDEN: [string, RegExp][] = [
  ['hex colour', /#[0-9a-f]{3,8}\b/i],
  ['rgb() colour', /\brgba?\(/i],
  ['px length', /\b\d+(\.\d+)?px\b/],
  /* `-\d`: the v1 families are numeric ramps (`--red-400`); the v2
     `--red-muush-500` shares the `red-` stem and is not v1. */
  ['v1 token', /--(bone|ink|red|wine)-\d/],
  ['v1 utility', /\b[\w:-]*-(bone|ink|red|wine)-\d/],
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
