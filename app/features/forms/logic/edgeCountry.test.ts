import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createEdgeCountryLookup,
  EDGE_COUNTRY_PATH,
  EDGE_COUNTRY_TIMEOUT_MS,
  type EdgeCountryFetch,
  fetchEdgeCountry,
} from './edgeCountry'

/** A fake `Response` whose body is `text`, parsed like the browser would. */
function answer(status: number, text: string) {
  return {
    ok: status >= 200 && status < 300,
    json: async (): Promise<unknown> => JSON.parse(text),
  }
}

function fetchAnswering(status: number, text: string) {
  return vi.fn<EdgeCountryFetch>(async () => answer(status, text))
}

const NOT_FOUND_PAGE = '<!DOCTYPE html><html><body>404</body></html>'

describe('fetchEdgeCountry', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return the reported country when the edge answers with a country', async () => {
    const fetchImpl = fetchAnswering(200, '{"country":"CO"}')
    await expect(fetchEdgeCountry({ fetchImpl })).resolves.toBe('CO')
  })

  it.each([
    ['{"country":null}'],
    ['{}'],
    ['{"country":5}'],
    ['null'],
    ['["CO"]'],
  ])('should return undefined when the body is %s', async body => {
    const fetchImpl = fetchAnswering(200, body)
    await expect(fetchEdgeCountry({ fetchImpl })).resolves.toBeUndefined()
  })

  it('should return undefined when the edge answers 404 with JSON', async () => {
    const fetchImpl = fetchAnswering(404, '{"country":"CO"}')
    await expect(fetchEdgeCountry({ fetchImpl })).resolves.toBeUndefined()
  })

  it.each([[200], [404]])(
    'should return undefined when the answer is an HTML page with status %i',
    async status => {
      const fetchImpl = fetchAnswering(status, NOT_FOUND_PAGE)
      await expect(fetchEdgeCountry({ fetchImpl })).resolves.toBeUndefined()
    }
  )

  it('should return undefined when the request fails', async () => {
    const fetchImpl = vi.fn<EdgeCountryFetch>(async () => {
      throw new TypeError('Failed to fetch')
    })
    await expect(fetchEdgeCountry({ fetchImpl })).resolves.toBeUndefined()
  })

  it('should abort and return undefined when the edge does not answer in time', async () => {
    vi.useFakeTimers()
    let signal: AbortSignal | undefined
    const fetchImpl = vi.fn<EdgeCountryFetch>(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          signal = init.signal ?? undefined
          signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError'))
          )
        })
    )

    const pending = fetchEdgeCountry({ fetchImpl })
    await vi.advanceTimersByTimeAsync(EDGE_COUNTRY_TIMEOUT_MS)

    await expect(pending).resolves.toBeUndefined()
    expect(signal?.aborted).toBe(true)
  })

  it('should send one bare same-origin GET when called', async () => {
    const fetchImpl = fetchAnswering(200, '{"country":"MX"}')
    await fetchEdgeCountry({ fetchImpl })

    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const [input, init] = fetchImpl.mock.calls[0] ?? []
    expect(input).toBe('/__geo')
    expect(EDGE_COUNTRY_PATH).toBe('/__geo')
    expect(init).toMatchObject({
      method: 'GET',
      credentials: 'omit',
      cache: 'no-store',
    })
    expect(init).not.toHaveProperty('body')
    expect(init).not.toHaveProperty('headers')
  })
})

describe('createEdgeCountryLookup', () => {
  it('should request once and share the answer when called three times', async () => {
    const fetchOnce = vi.fn(async () => 'CO')
    const lookup = createEdgeCountryLookup(fetchOnce)

    const answers = await Promise.all([lookup(), lookup(), lookup()])

    expect(fetchOnce).toHaveBeenCalledTimes(1)
    expect(answers).toEqual(['CO', 'CO', 'CO'])
  })

  it('should not request when it is created but never called', () => {
    const fetchOnce = vi.fn(async () => 'CO')
    createEdgeCountryLookup(fetchOnce)
    expect(fetchOnce).not.toHaveBeenCalled()
  })
})
