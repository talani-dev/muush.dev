import { describe, expect, it } from 'vitest'
import { expireCookies } from './thirdPartyCookies'

function jar() {
  const writes: string[] = []
  return {
    writes,
    get cookie() {
      return ''
    },
    set cookie(value: string) {
      writes.push(value)
    },
  }
}

describe('expireCookies', () => {
  it('should expire each name host-only and on the dot-domain at path / when on muush.dev', () => {
    const cookies = jar()

    expireCookies(['_ga', '_ga_RHZC650SQS', '_fbp'], 'muush.dev', cookies)

    expect(cookies.writes).toEqual([
      '_ga=; max-age=0; path=/',
      '_ga=; max-age=0; path=/; domain=.muush.dev',
      '_ga_RHZC650SQS=; max-age=0; path=/',
      '_ga_RHZC650SQS=; max-age=0; path=/; domain=.muush.dev',
      '_fbp=; max-age=0; path=/',
      '_fbp=; max-age=0; path=/; domain=.muush.dev',
    ])
  })

  it('should leave every other cookie alone', () => {
    const cookies = jar()

    expireCookies(['_fbp'], 'muush.dev', cookies)

    expect(cookies.writes.every(write => write.startsWith('_fbp='))).toBe(true)
  })

  it('should also expire on the registrable domain when on a subdomain', () => {
    const cookies = jar()

    expireCookies(['_ga'], 'www.muush.dev', cookies)

    expect(cookies.writes).toEqual([
      '_ga=; max-age=0; path=/',
      '_ga=; max-age=0; path=/; domain=.www.muush.dev',
      '_ga=; max-age=0; path=/; domain=.muush.dev',
    ])
  })

  it('should write host-only when the host has no dot', () => {
    const cookies = jar()

    expireCookies(['_ga'], 'localhost', cookies)

    expect(cookies.writes).toEqual(['_ga=; max-age=0; path=/'])
  })
})
