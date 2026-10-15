import type { ShareImage } from '@/features/shell/data/siteIdentity'

export interface ShareMeta {
  twitterCard: 'summary' | 'summary_large_image'
  ogImage?: { url: string; width: number; height: number }
  twitterImage?: string
}

/**
 * The link-preview tags that depend on whether a share image exists (spec
 * FR-008). With no image, no image key is returned at all — an empty
 * `og:image` would be worse than none — and the card is the small one.
 */
export function resolveShareMeta(image: ShareImage): ShareMeta {
  if (image.url === null) return { twitterCard: 'summary' }

  return {
    twitterCard: 'summary_large_image',
    ogImage: { url: image.url, width: image.width, height: image.height },
    twitterImage: image.url,
  }
}
