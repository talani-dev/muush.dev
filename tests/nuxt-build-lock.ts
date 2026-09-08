import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The Nuxt build lock, read rather than guessed.
 *
 * `@nuxt/cli` writes `<buildDir>/nuxt.lock` before it builds and before it
 * starts a dev server, and refuses to start a second one while a live process
 * holds it (`@nuxt/cli/dist/lockfile-*.mjs`, `acquireLock`). It only does this
 * when locking is enabled, which — as of `@nuxt/cli` 3.37 — it is **by default
 * inside an AI agent**, and off otherwise unless `NUXT_LOCK=1`. That is why
 * this repository's automated sessions hit it and a human at a terminal
 * usually does not.
 *
 * `tests/global-setup.ts` shells out to `pnpm generate` before any test file
 * loads, so a dev server left running turns the whole suite red. Read from the
 * outside, that failure was a `Serialized Error: { status: 1 }` naming nothing:
 * four occurrences, three of them costing a full run. This module is what lets
 * the suite say which process to kill instead.
 *
 * The shape and the two liveness rules below are `nuxi`'s own, deliberately
 * mirrored: reimplementing them differently would produce a message that
 * disagrees with the tool it is describing.
 */
export type NuxtBuildLock = {
  pid: number
  startedAt: number
  command?: string
  cwd?: string
  url?: string
}

/** Nuxt's default `buildDir`; this repository does not override it. */
export const NUXT_BUILD_DIR = '.nuxt'

const LOCK_FILENAME = 'nuxt.lock'

/**
 * `nuxi`'s `MAX_LOCK_AGE_MS` — a lock older than a day is treated as
 * abandoned, because a PID that old has very likely been recycled onto an
 * unrelated process.
 */
const ABANDONED_LOCK_AGE_MS = 24 * 60 * 60 * 1000

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function parseLock(contents: string): NuxtBuildLock | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(contents)
  } catch {
    return null
  }

  if (!isRecord(parsed)) return null
  if (typeof parsed.pid !== 'number') return null
  if (typeof parsed.startedAt !== 'number') return null

  return {
    pid: parsed.pid,
    startedAt: parsed.startedAt,
    command: optionalString(parsed.command),
    cwd: optionalString(parsed.cwd),
    url: optionalString(parsed.url),
  }
}

export function buildLockPath(buildDir: string): string {
  return join(buildDir, LOCK_FILENAME)
}

/**
 * The lock file's contents, or `null` when there is no readable lock. A
 * missing, unreadable or malformed file is not an error: it means nothing is
 * holding the build, which is the normal case.
 */
export function readBuildLock(buildDir: string): NuxtBuildLock | null {
  try {
    return parseLock(readFileSync(buildLockPath(buildDir), 'utf-8'))
  } catch {
    return null
  }
}

/**
 * Whether the process named in the lock still exists. Signal `0` performs the
 * permission and existence checks without delivering anything; `EPERM` means
 * the process is alive and owned by somebody else, which still counts.
 */
export function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return isRecord(error) && error.code === 'EPERM'
  }
}

/**
 * Whether the lock is genuinely held by another live process — the three
 * conditions `nuxi`'s `isLockActive` applies. A lock naming this very process
 * is not held *against* us, a dead PID means the writer crashed without
 * releasing it, and an abandoned one is ignored on age alone.
 */
export function isLockHeld(
  lock: NuxtBuildLock,
  now: number = Date.now()
): boolean {
  if (lock.pid === process.pid) return false
  if (!isProcessAlive(lock.pid)) return false
  return now - lock.startedAt <= ABANDONED_LOCK_AGE_MS
}

/** The lock held against us right now, or `null` when the build is free. */
export function readHeldBuildLock(buildDir: string): NuxtBuildLock | null {
  const lock = readBuildLock(buildDir)
  if (!lock) return null
  return isLockHeld(lock) ? lock : null
}

function killCommandFor(pid: number): string {
  return process.platform === 'win32'
    ? `taskkill /PID ${pid} /F`
    : `kill ${pid}`
}

/**
 * The message the suite fails with. It names the cause, the process to kill and
 * the two ways out, because the failure it replaces named none of them.
 */
export function describeHeldBuildLock(
  lock: NuxtBuildLock,
  buildDir: string
): string {
  const what =
    lock.command === 'dev' ? 'dev server' : (lock.command ?? 'process')
  const lines = [
    '',
    `A Nuxt ${what} is holding the build lock, so \`pnpm generate\` cannot run —`,
    'and this suite generates the site before any test file loads, so the whole',
    'run fails here rather than in a test.',
    '',
    `  PID:     ${lock.pid}`,
  ]

  if (lock.url) lines.push(`  URL:     ${lock.url}`)
  if (lock.cwd) lines.push(`  Dir:     ${lock.cwd}`)

  lines.push(
    `  Started: ${new Date(lock.startedAt).toISOString()}`,
    `  Lock:    ${buildLockPath(buildDir)}`,
    '',
    `Run \`${killCommandFor(lock.pid)}\` to stop it, then run the suite again.`,
    `If that process is already gone, delete ${buildLockPath(buildDir)}.`,
    'Set NUXT_IGNORE_LOCK=1 to build anyway (it will race the other process',
    `over ${buildDir}/).`,
    ''
  )

  return lines.join('\n')
}
