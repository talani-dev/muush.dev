import { execFileSync } from 'node:child_process'
import {
  describeHeldBuildLock,
  NUXT_BUILD_DIR,
  readHeldBuildLock,
} from './nuxt-build-lock'

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
 *
 * ## Why the build is guarded (feature 010)
 *
 * Shelling out from `globalSetup` means every reason `pnpm generate` can fail
 * arrives here as one opaque exception. `execFileSync` throws an error whose
 * interesting property is `status`, and Vitest reports it as
 * `Serialized Error: { status: 1 }` — a red suite naming nothing, four times,
 * three of them costing a full run. The commonest cause is a `pnpm dev` left
 * running: it holds a Nuxt build lock, and a second Nuxt refuses to start.
 *
 * So the lock is checked **before** shelling out, checked **again** if the
 * build fails anyway (it can be taken in between), and any other failure
 * reports what the build actually printed instead of its exit code.
 */

/** Generous on purpose: exceeding it would surface as an unrelated ENOBUFS. */
const GENERATE_OUTPUT_LIMIT_BYTES = 8 * 1024 * 1024

/** Enough of the tail to carry a stack or a Nuxt error banner. */
const REPORTED_OUTPUT_LINES = 30

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function streamText(stream: unknown): string {
  if (typeof stream === 'string') return stream
  if (Buffer.isBuffer(stream)) return stream.toString('utf-8')
  return ''
}

/**
 * The tail of what the build printed before it died, which is where the cause
 * is. `stdio` is `pipe` rather than `ignore` for exactly this: on a green run
 * the bytes are dropped, and on a red one they are the only evidence there is.
 */
function reportedOutput(error: unknown): string {
  if (!isRecord(error)) return ''

  const printed = `${streamText(error.stdout)}\n${streamText(error.stderr)}`
  const lines = printed.split('\n').filter(line => line.trim() !== '')

  return lines.slice(-REPORTED_OUTPUT_LINES).join('\n')
}

function describeGenerateFailure(error: unknown): string {
  const printed = reportedOutput(error)
  const lines = [
    '',
    '`pnpm generate` failed, so there is no `.output/public` for the suite to',
    'assert against and no test in this run could have been meaningful.',
    '',
    'No Nuxt build lock was held, so this is not a stray `pnpm dev` — the build',
    'itself is broken. Reproduce it directly with `pnpm generate`.',
    '',
  ]

  lines.push(
    printed === ''
      ? 'The build printed nothing.'
      : `Last ${REPORTED_OUTPUT_LINES} lines of the build output:\n\n${printed}`,
    ''
  )

  return lines.join('\n')
}

/**
 * `NUXT_IGNORE_LOCK` is honoured because `@nuxt/cli` honours it: bypassing this
 * check while Nuxt still enforced its own would only move the same failure two
 * seconds later, and refusing to bypass would leave no way out of a lock whose
 * owner cannot be killed.
 *
 * Reading `process.env` here does not contradict Constitution Article XI, which
 * governs application code and its configuration. This is the test harness
 * asking about the machine it is running on, and there is no `runtimeConfig` in
 * a `globalSetup`.
 */
function heldBuildLock() {
  if (process.env.NUXT_IGNORE_LOCK) return null
  return readHeldBuildLock(NUXT_BUILD_DIR)
}

export default function setup() {
  const lockBeforeBuilding = heldBuildLock()
  if (lockBeforeBuilding) {
    throw new Error(describeHeldBuildLock(lockBeforeBuilding, NUXT_BUILD_DIR))
  }

  try {
    execFileSync('pnpm', ['generate'], {
      stdio: 'pipe',
      cwd: process.cwd(),
      maxBuffer: GENERATE_OUTPUT_LIMIT_BYTES,
    })
  } catch (error) {
    const lockTakenMeanwhile = heldBuildLock()
    if (lockTakenMeanwhile) {
      throw new Error(describeHeldBuildLock(lockTakenMeanwhile, NUXT_BUILD_DIR))
    }
    throw new Error(describeGenerateFailure(error))
  }
}
