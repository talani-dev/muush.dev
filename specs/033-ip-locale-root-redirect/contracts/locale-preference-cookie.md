# Contract: the `muush_locale` preference cookie (muush.dev ↔ muush-foundation)

**Writer**: muush.dev, the language toggle (`app/features/shell/ui/LanguageToggle.vue` through `app/features/shell/logic/localePreference.ts`)
**Reader**: muush-foundation `request-router`, at `/` only (`edge-root-locale-redirect.md` § 3)
**Status**: Agreed at gate G4 (Roberto, 2026-10-15).

## 1 · Exact form

```
muush_locale=<es|en>; Path=/; Max-Age=31536000; SameSite=Lax; Secure
```

| Part | Value | Rule |
|---|---|---|
| name | `muush_locale` | fixed |
| value | `es` or `en` | lowercase, nothing else ever |
| `Path` | `/` | required, so the edge sees it at `/` |
| `Max-Age` | `31536000` (365 days) | G4. Renewed on every toggle activation |
| `SameSite` | `Lax` | sent on top-level navigations from other sites |
| `Secure` | present | HTTPS only |
| `Domain` | **absent** | host-only: never sent to subdomains or other hosts |
| `HttpOnly` | absent | written by script |

## 2 · When the site writes it

- On every `click` event of the language toggle, before navigation, with the **destination** locale (the one the toggle leads to), including clicks with a modifier key (open in new tab).
- Never on page load, link navigation, `auxclick`, form use, or by any component other than the toggle.
- With scripting unavailable it is not written. The toggle still navigates (accepted degradation).

## 3 · What the site never does

- Read it. Nothing in the page changes because of it.
- Write any other cookie, or any identifier, timestamp or country.
- Send it anywhere. It is host-only, so the browser attaches it only to `muush.dev` requests, and only the edge looks at it.

## 4 · What the edge must do

- Read only this cookie, only at `/`, and accept only the exact values `es`/`en`.
- Never set, refresh or delete it.
- Never include it in a cache key.
