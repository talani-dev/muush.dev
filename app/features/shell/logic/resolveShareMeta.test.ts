import { describe, expect, it } from 'vitest'
import { resolveShareMeta } from './resolveShareMeta'

const SIZE = { width: 1200, height: 630 }

describe('resolveShareMeta', () => {
  it('should return a summary card and no image when the url is null', () => {
    expect(resolveShareMeta({ url: null, ...SIZE })).toEqual({
      twitterCard: 'summary',
    })
  })

  it('should return a large card with the image and its size when the url is set', () => {
    const url = 'https://assets.example.test/share.png'

    expect(resolveShareMeta({ url, ...SIZE })).toEqual({
      twitterCard: 'summary_large_image',
      ogImage: { url, ...SIZE },
      twitterImage: url,
    })
  })
})
