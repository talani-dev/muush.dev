# Data model: Root `/` locale redirect by country

**Feature**: 33 · `ip_locale_root_redirect` | **Date**: 2026-10-15

Three pieces of data. Only the first one is code in this repository.

## 1 · Locale preference (this repository + edge)

| Field | Type | Rule |
|---|---|---|
| name | constant `muush_locale` | Declared once in `app/features/shell/data/localePreference.ts`. Same literal in `contracts/locale-preference-cookie.md`. |
| value | `ShellLocale` (`'es' \| 'en'`) | Reuses `SHELL_LOCALES` from `data/types.ts`. No other value is ever written. |
| max age | constant `31_536_000` seconds (365 days) | Named constant (Article VIII, no magic numbers). Gate G4. |
| attributes | `Path=/; SameSite=Lax; Secure` | No `Domain`, no `HttpOnly`, no `Expires` (Max-Age wins). |

**Serialised form** (exact, order fixed so a test can assert the string):

```
muush_locale=en; Path=/; Max-Age=31536000; SameSite=Lax; Secure
```

**Lifecycle**

```
(absent) --toggle click towards L--> L          (written, Max-Age reset)
L        --toggle click towards M--> M          (overwritten)
L        --365 days without a toggle--> (absent)
any      --user clears cookies--> (absent)
```

No state transition happens on page load, navigation, form use or the not-found page (spec FR-014).

**Reader**: only the edge, at `/` only. The site never reads it.

**Validation at the reader**: the value must equal `es` or `en` exactly (case-sensitive, no whitespace). Anything else counts as absent.

## 2 · Spanish-speaking country list (edge contract only)

A closed set of ISO 3166-1 alpha-2 codes, uppercase. Authoritative copy: `contracts/edge-root-locale-redirect.md` § 3 (21 codes: G5 included `GQ` and excluded `US`, 2026-10-15). No representation in `app/` (research R7, gate G6).

## 3 · Viewer country (edge only, transient)

The value of `cloudfront-viewer-country` for the current request. It is valid only if it matches `^[A-Z]{2}$`. It is read, compared and discarded within the request: never stored, logged, returned or forwarded. The IP it was derived from is never touched by this rule.

## Decision table at `/` (the whole behaviour)

| # | Preference cookie | Country | Destination |
|---|---|---|---|
| 1 | `es` | any | `/es` |
| 2 | `en` | any | `/en` |
| 3 | absent / invalid | on the list | `/es` |
| 4 | absent / invalid | well-formed, not on the list | `/en` |
| 5 | absent / invalid | absent / malformed | G2 default: `/en` |

The query string of the request, if any, is appended unchanged.
