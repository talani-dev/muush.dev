import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'

/**
 * The booking URL is a **destination**, not copy, and this suite is the
 * mechanical half of that claim: it appears once in `app/`, and never in a
 * locale file.
 *
 * A URL written per locale is two values that can drift apart — one gets
 * updated, the other silently keeps sending visitors to a dead page, and
 * `tests/i18n-parity.test.ts` would call it perfect parity because both keys
 * exist. A URL written per call site is the same failure with three copies
 * instead of two, and `decisions-open.md` scopes this one to three places
 * (*"hero, CTA final y footer"*), only two of which are built.
 *
 * Read from disk with `node:path` and `process.cwd()`, never `new URL`: the
 * global environment is `happy-dom`, whose `URL` `node:fs` rejects
 * (`findings.md` §§ R16, R27).
 */
const APP = join(process.cwd(), 'app')
const LOCALES = join(process.cwd(), 'i18n', 'locales')

/** Every source file under `app/`, recursively. */
function everySourceFile(directory: string): string[] {
  return readdirSync(directory).flatMap(entry => {
    const path = join(directory, entry)
    return statSync(path).isDirectory() ? everySourceFile(path) : [path]
  })
}

function filesContaining(needle: string, root: string): string[] {
  return everySourceFile(root)
    .filter(path => readFileSync(path, 'utf8').includes(needle))
    .map(path => path.slice(root.length + 1))
}

describe('the call booking destination', () => {
  it('should be the URL Roberto gave on 2026-09-07', () => {
    /* Recorded in `decisions-open.md` § Decisión 2. The tool is Cal.com; the
       decision was written assuming Google Calendar, and the destination is
       what it was ever about. */
    expect(CALL_BOOKING_URL).toBe('https://cal.com/muush/intro-call')
  })

  it('should open over https so the new tab is not a downgrade', () => {
    expect(CALL_BOOKING_URL.startsWith('https://')).toBe(true)
  })

  it('should be written as a literal in exactly one file under app', () => {
    /* Every other place names the constant. Two literals here would be two
       things that can drift. */
    expect(filesContaining(CALL_BOOKING_URL, APP)).toEqual([
      join('shared', 'data', 'callBooking.ts'),
    ])
  })

  it('should appear in neither locale file', () => {
    /* The label is translated; the target is not. The booking page is the same
       page in both languages. */
    for (const file of readdirSync(LOCALES)) {
      const contents = readFileSync(join(LOCALES, file), 'utf8')

      expect(contents, file).not.toContain('cal.com')
      expect(contents, file).not.toContain(CALL_BOOKING_URL)
    }
  })
})
