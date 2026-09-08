import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  buildLockPath,
  describeHeldBuildLock,
  isLockHeld,
  isProcessAlive,
  type NuxtBuildLock,
  readBuildLock,
  readHeldBuildLock,
} from './nuxt-build-lock'

/*
 * The lock reader `tests/global-setup.ts` consults before it shells out to
 * `pnpm generate`.
 *
 * These are the branches the reproduction cannot reach. Holding a real lock
 * shows the message a person sees (feature 010, acceptance 7), but it can only
 * ever exercise one path; a false positive here — a stale lock file from a
 * crashed dev server reported as if something were running — would make the
 * suite unrunnable until somebody deleted a file nobody documented. Those are
 * the cases below.
 *
 * A live PID that is not ours comes from `process.ppid`: whatever launched this
 * worker is running by definition. A dead one comes from a child that has
 * already exited — deterministic, and not subject to PID reuse inside a single
 * run.
 */

const DAY_MS = 24 * 60 * 60 * 1000

let buildDir: string

function anExitedPid(): number {
  const finished = spawnSync(process.execPath, ['-e', ''])
  if (finished.pid === undefined)
    throw new Error('the probe process had no pid')
  return finished.pid
}

function writeLock(lock: Partial<NuxtBuildLock> & { pid: number }): void {
  writeFileSync(
    buildLockPath(buildDir),
    JSON.stringify({ startedAt: Date.now(), command: 'dev', ...lock })
  )
}

beforeEach(() => {
  buildDir = mkdtempSync(join(tmpdir(), 'muush-nuxt-lock-'))
})

afterEach(() => {
  rmSync(buildDir, { recursive: true, force: true })
})

describe('nuxt build lock · reading the file', () => {
  it('should read nothing when no lock file exists', () => {
    expect(readBuildLock(buildDir)).toBeNull()
  })

  it('should read nothing when the lock file is not JSON', () => {
    writeFileSync(buildLockPath(buildDir), 'not json at all')

    expect(readBuildLock(buildDir)).toBeNull()
  })

  it('should read nothing when the lock file names no process', () => {
    writeFileSync(buildLockPath(buildDir), JSON.stringify({ command: 'dev' }))

    expect(readBuildLock(buildDir)).toBeNull()
  })

  it('should read every field when the lock file is well formed', () => {
    writeLock({
      pid: 4242,
      startedAt: 1_757_000_000_000,
      command: 'dev',
      cwd: '/somewhere/muush.dev',
      url: 'http://localhost:3000/',
    })

    expect(readBuildLock(buildDir)).toEqual({
      pid: 4242,
      startedAt: 1_757_000_000_000,
      command: 'dev',
      cwd: '/somewhere/muush.dev',
      url: 'http://localhost:3000/',
    })
  })
})

describe('nuxt build lock · whether it is held', () => {
  it('should report a live foreign process as holding the lock', () => {
    expect(
      isLockHeld({ pid: process.ppid, startedAt: Date.now(), command: 'dev' })
    ).toBe(true)
  })

  it('should report no hold when the lock names this very process', () => {
    expect(
      isLockHeld({ pid: process.pid, startedAt: Date.now(), command: 'dev' })
    ).toBe(false)
  })

  it('should report no hold when the process that wrote the lock is gone', () => {
    expect(
      isLockHeld({ pid: anExitedPid(), startedAt: Date.now(), command: 'dev' })
    ).toBe(false)
  })

  it('should report no hold when the lock is older than a day', () => {
    const now = Date.now()

    expect(
      isLockHeld(
        { pid: process.ppid, startedAt: now - DAY_MS - 1, command: 'dev' },
        now
      )
    ).toBe(false)
  })

  it('should see this process as alive and an exited one as gone', () => {
    expect(isProcessAlive(process.pid)).toBe(true)
    expect(isProcessAlive(anExitedPid())).toBe(false)
  })
})

describe('nuxt build lock · what the suite reads', () => {
  it('should surface the lock when a live process holds it', () => {
    writeLock({ pid: process.ppid })

    expect(readHeldBuildLock(buildDir)?.pid).toBe(process.ppid)
  })

  it('should surface nothing when the lock file is stale', () => {
    writeLock({ pid: anExitedPid() })

    expect(readHeldBuildLock(buildDir)).toBeNull()
  })
})

describe('nuxt build lock · the message', () => {
  const held: NuxtBuildLock = {
    pid: 4242,
    startedAt: 1_757_000_000_000,
    command: 'dev',
    cwd: '/somewhere/muush.dev',
    url: 'http://localhost:3000/',
  }

  it('should name the process, the lock file and how to kill it', () => {
    const message = describeHeldBuildLock(held, '.nuxt')

    expect(message).toContain('dev server')
    expect(message).toContain('4242')
    expect(message).toContain('http://localhost:3000/')
    expect(message).toContain(join('.nuxt', 'nuxt.lock'))
    expect(message).toMatch(/kill 4242|taskkill \/PID 4242/)
  })

  it('should never fail with a bare status code', () => {
    /* The defect this replaces: `Serialized Error: { status: 1 }`, which named
       neither the cause nor the process. */
    const message = describeHeldBuildLock(held, '.nuxt')

    expect(message).toContain('pnpm generate')
    expect(message).not.toMatch(/^\s*status: \d+\s*$/m)
  })

  it('should omit the URL when the lock does not carry one', () => {
    /* A `nuxt build` writes no URL; only a dev server that has bound a port
       does. Printing `URL: undefined` would be worse than printing nothing. */
    const message = describeHeldBuildLock(
      { pid: 4242, startedAt: 1_757_000_000_000, command: 'build' },
      '.nuxt'
    )

    expect(message).not.toContain('URL:')
    expect(message).toContain('4242')
  })
})
