import { execFileSync } from 'node:child_process'

/**
 * Builds the static site once, before any test file runs.
 *
 * `tests/static-output.test.ts` asserts on `.output/public` — the artefact
 * that is actually deployed — because that is the only place SC-001 and
 * SC-003 are observable. Nothing short of the emitted HTML can prove that a
 * route produced a file, or that the locale toggle in that file points at the
 * equivalent route.
 *
 * It runs here rather than in a `beforeAll` for two reasons. Vitest runs test
 * files in parallel, and a build rewriting `.nuxt/` underneath them is a race;
 * `globalSetup` completes before any file is loaded. And an "only build if the
 * output is missing" guard would let a stale artefact pass a suite whose whole
 * point is to check the current one — the same class of mistake as the parity
 * assertion that could never go red (docs/business/rules.md § R27).
 *
 * A cold `pnpm generate` takes about 3s in this repository, which is the price
 * of the assertions being real.
 */
export default function setup() {
  execFileSync('pnpm', ['generate'], {
    stdio: 'ignore',
    cwd: process.cwd(),
  })
}
