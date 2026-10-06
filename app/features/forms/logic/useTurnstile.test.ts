import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  TURNSTILE_SCRIPT_URL,
  TURNSTILE_TOKEN_TIMEOUT_MS,
} from '@/features/forms/data/submissionContract'
import type {
  TurnstileApi,
  TurnstileRenderOptions,
} from '@/features/forms/data/turnstile'

/**
 * Turnstile is always faked here: no test loads Cloudflare's script or makes
 * a network request. The script-insertion test intercepts `appendChild`, so
 * the `<script>` element is never attached to the document.
 */

interface FakeTurnstile extends TurnstileApi {
  options: TurnstileRenderOptions | undefined
  calls: string[]
}

/** Each `execute` answers with the next token, or with an error code. */
function fakeTurnstile(answers: ('token' | 'error' | 'silent')[] = []) {
  let issued = 0
  const fake: FakeTurnstile = {
    options: undefined,
    calls: [],
    render(_host, options) {
      fake.calls.push('render')
      fake.options = options
      return 'widget-1'
    },
    reset(widgetId) {
      fake.calls.push(`reset:${widgetId}`)
    },
    execute() {
      fake.calls.push('execute')
      const answer = answers.shift() ?? 'token'
      queueMicrotask(() => {
        if (answer === 'token') fake.options?.callback(`token-${++issued}`)
        if (answer === 'error') fake.options?.['error-callback']('300030')
      })
    },
    remove() {
      fake.calls.push('remove')
    },
  }
  return fake
}

async function importModule() {
  vi.resetModules()
  return import('./useTurnstile')
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
  delete window.turnstile
})

describe('createTurnstileTokenSource', () => {
  it('should load nothing when created, before any engagement', async () => {
    const { createTurnstileTokenSource } = await importModule()
    const loadApi = vi.fn(async () => fakeTurnstile())

    createTurnstileTokenSource({ siteKey: 'site-key', loadApi })

    expect(loadApi).not.toHaveBeenCalled()
  })

  it('should load and render once across many engagements', async () => {
    const { createTurnstileTokenSource } = await importModule()
    const fake = fakeTurnstile()
    const loadApi = vi.fn(async () => fake)
    const source = createTurnstileTokenSource({ siteKey: 'site-key', loadApi })
    const host = document.createElement('div')

    source.engage(host)
    source.engage(host)
    source.engage(host)
    await source.getToken()

    expect(loadApi).toHaveBeenCalledTimes(1)
    expect(fake.calls.filter(call => call === 'render')).toHaveLength(1)
  })

  it('should render an Invisible-friendly, execute-on-demand widget with no hidden field', async () => {
    const { createTurnstileTokenSource } = await importModule()
    const fake = fakeTurnstile()
    const source = createTurnstileTokenSource({
      siteKey: 'site-key',
      loadApi: async () => fake,
    })

    source.engage(document.createElement('div'))
    await source.getToken()

    expect(fake.options).toMatchObject({
      sitekey: 'site-key',
      execution: 'execute',
      appearance: 'interaction-only',
      'response-field': false,
    })
  })

  it('should reset then execute and resolve two different tokens on two requests', async () => {
    const { createTurnstileTokenSource } = await importModule()
    const fake = fakeTurnstile()
    const source = createTurnstileTokenSource({
      siteKey: 'k',
      loadApi: async () => fake,
    })

    source.engage(document.createElement('div'))
    const first = await source.getToken()
    const second = await source.getToken()

    expect(first).not.toBe(second)
    expect(fake.calls).toEqual([
      'render',
      'reset:widget-1',
      'execute',
      'reset:widget-1',
      'execute',
    ])
  })

  it('should reject when Turnstile reports an error', async () => {
    const { createTurnstileTokenSource } = await importModule()
    const source = createTurnstileTokenSource({
      siteKey: 'k',
      loadApi: async () => fakeTurnstile(['error']),
    })

    source.engage(document.createElement('div'))

    await expect(source.getToken()).rejects.toThrow()
  })

  it('should reject when no token arrives within the timeout', async () => {
    vi.useFakeTimers()
    const { createTurnstileTokenSource } = await importModule()
    const source = createTurnstileTokenSource({
      siteKey: 'k',
      loadApi: async () => fakeTurnstile(['silent']),
    })

    source.engage(document.createElement('div'))
    const pending = source.getToken()
    const assertion = expect(pending).rejects.toThrow(/timed out/)
    await vi.advanceTimersByTimeAsync(TURNSTILE_TOKEN_TIMEOUT_MS)

    await assertion
  })

  it('should reject when the script cannot load, and allow a later engagement to retry', async () => {
    const { createTurnstileTokenSource } = await importModule()
    const fake = fakeTurnstile()
    const loadApi = vi
      .fn<() => Promise<TurnstileApi>>()
      .mockRejectedValueOnce(new Error('blocked'))
      .mockResolvedValueOnce(fake)
    const source = createTurnstileTokenSource({ siteKey: 'k', loadApi })
    const host = document.createElement('div')

    source.engage(host)
    await expect(source.getToken()).rejects.toThrow('blocked')

    source.engage(host)
    await expect(source.getToken()).resolves.toBe('token-1')
  })

  it('should reject when asked for a token before any engagement', async () => {
    const { createTurnstileTokenSource } = await importModule()
    const source = createTurnstileTokenSource({
      siteKey: 'k',
      loadApi: async () => fakeTurnstile(),
    })

    await expect(source.getToken()).rejects.toThrow(/never engaged/)
  })
})

describe('loadTurnstileApi', () => {
  function interceptScripts(): HTMLScriptElement[] {
    const inserted: HTMLScriptElement[] = []
    vi.spyOn(document.head, 'appendChild').mockImplementation(node => {
      inserted.push(node as HTMLScriptElement)
      return node
    })
    return inserted
  }

  it('should insert the explicit-render script once and resolve with window.turnstile', async () => {
    const { loadTurnstileApi } = await importModule()
    const inserted = interceptScripts()
    const fake = fakeTurnstile()

    const first = loadTurnstileApi()
    const second = loadTurnstileApi()
    window.turnstile = fake
    inserted[0]?.dispatchEvent(new Event('load'))

    expect(await first).toBe(fake)
    expect(await second).toBe(fake)
    expect(inserted).toHaveLength(1)
    expect(inserted[0]?.src).toBe(TURNSTILE_SCRIPT_URL)
  })

  it('should reject on a script error and insert a new script on the next call', async () => {
    const { loadTurnstileApi } = await importModule()
    const inserted = interceptScripts()

    const failed = loadTurnstileApi()
    inserted[0]?.dispatchEvent(new Event('error'))
    await expect(failed).rejects.toThrow()

    void loadTurnstileApi().catch(() => undefined)
    expect(inserted).toHaveLength(2)
  })
})
