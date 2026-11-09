import { describe, expect, it } from 'vitest'
import { SHARE_IMAGE } from '@/features/shell/data/siteIdentity'
import { resolveShareMeta } from './resolveShareMeta'

const SIZE = { width: 1200, height: 630 }
const DETAILS = { ...SIZE, type: 'image/png', alt: 'muush' } as const

describe('resolveShareMeta', () => {
  it('should return a summary card and no image when the url is null', () => {
    expect(resolveShareMeta({ url: null, ...DETAILS })).toEqual({
      twitterCard: 'summary',
    })
  })

  it('should return a large card with the image, its size, type and alt when the url is set', () => {
    const url = 'https://assets.example.test/share.png'

    expect(resolveShareMeta({ url, ...DETAILS })).toEqual({
      twitterCard: 'summary_large_image',
      ogImage: { url, ...DETAILS },
      twitterImage: url,
    })
  })

  it('should give the shipped share image the large card when useSiteSeo spreads it', () => {
    /* `useSiteSeo` passes `SHARE_IMAGE` straight through this function. */
    expect(resolveShareMeta(SHARE_IMAGE)).toEqual({
      twitterCard: 'summary_large_image',
      ogImage: {
        url: 'https://assets.muush.dev/brand/cover/og-image.png',
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'muush',
      },
      twitterImage: 'https://assets.muush.dev/brand/cover/og-image.png',
    })
  })
})
