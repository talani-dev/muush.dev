# Contract — tracking runtime (browser)

## 1 · Shared seam (`app/shared/`)

```ts
// app/shared/data/trackingEvents.ts
export type TrackingEvent = /* discriminated union, data-model.md § 2 */
export function trackAttrs(event: ClickTrackingEvent): Record<`data-track${string}`, string>

// app/shared/logic/trackingBus.ts
export function emitTrackingEvent(event: TrackingEvent): void   // no-op without sinks
export function onTrackingEvent(sink: (event: TrackingEvent) => void): () => void // returns unsubscribe
export function resetTrackingBus(): void                        // tests only
```

Rules:
- Emitters (`forms`, `legal`, any feature) import only these; never
  `@/features/tracking`.
- An emitter never puts free text in `params`; types make it impossible
  (`string` is not accepted where a closed list is declared).
- `userData` exists only on `generate_lead` and only `forms` sets it.

## 2 · Tracking feature public API (`app/features/tracking/index.ts`)

```ts
export function startTracking(options: {
  gaMeasurementId: string   // '' disables GA
  metaPixelId: string       // '' disables Meta
  router: Router            // vue-router instance, for page views + language change
}): void                    // idempotent; client only
```

Called once from `app/plugins/tracking.client.ts` with
`useRuntimeConfig().public` and `useRouter()`. It reads consent through
`useCookieConsent()` from `@/features/legal` and reacts to `consent` changes.

## 3 · Behaviour per consent state

| Analytics | Advertising | Scripts injected | Sinks subscribed |
|---|---|---|---|
| no choice / expired | — | none | none |
| false | false | none | none |
| true | false | gtag only | GA |
| false | true | fbevents only | Meta |
| true | true | both | both |

Transitions:
- `→ granted`: inject the script once per document, configure (research R3),
  send a page view for the current route, subscribe the sink.
- `granted → revoked`: unsubscribe the sink, set the tool's opt-out
  (`ga-disable-<id>` / `fbq('consent','revoke')`), expire its cookies. No
  further request to that tool in the document.
- `revoked → granted` (same document): clear opt-out, re-subscribe, page view.

## 4 · Sinks

**GA sink**: `gtag('event', name, params)` for every catalogue event;
`section_view` flushed on hide uses `{ ...params, transport_type: 'beacon' }`.
Never reads `userData`.

**Meta sink**: only `book_call_click → fbq('track','Schedule')`,
`contact_click → fbq('track','Contact')`,
`generate_lead → [fbq('init', id, { em, ph? }) if userData] + fbq('track','Lead')`.
No parameters are forwarded to Meta. Every other event is ignored.

## 5 · Network contract (what a reviewer checks in DevTools)

- Before a grant: 0 requests to `googletagmanager.com`, `google-analytics.com`,
  `analytics.google.com`, `connect.facebook.net`, `facebook.com`.
- After Analytics only: requests to Google hosts only. After Advertising only:
  Meta hosts only.
- Each GA request's event parameters contain only catalogue keys and values.
- The Meta `Lead` request carries `ud[em]` (and `ud[ph]` when WhatsApp) as
  64-character hex hashes, never the plain value.

## 6 · Click delegation

A single `click` listener on `document` (capture phase, passive) added by the
tracking feature looks for the closest `[data-track]` ancestor of the target,
parses `data-track`, `data-track-location`, `data-track-channel`, validates
them against the closed lists and emits the event on the bus. Unknown or
missing values → nothing is emitted.
