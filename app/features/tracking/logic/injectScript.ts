import type { ScriptHost } from '@/features/tracking/data/vendorTypes'

/**
 * Adds one async `<script>` for `src` to the document head, unless one is
 * already there: a vendor script is injected at most once per document
 * (contract § 3). Called only after the matching category is granted, so it
 * never runs during prerendering and the HTML never carries it (FR-010).
 */
export function injectScript(host: ScriptHost, src: string): void {
  if (host.querySelector(`script[src="${src}"]`)) return
  const script = host.createElement('script')
  script.async = true
  script.src = src
  host.head.append(script)
}
