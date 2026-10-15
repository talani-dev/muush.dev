# Contract delta: WhatsApp fields of `POST /contact` and `POST /careers`

**Source**: agreement of Roberto with the backend, 2026-10-14 (feature 32
description). Supersedes `form-api-contract.md` § 3 `whatsapp` rule and § 5
by reference, **pending the human rewrite of that document (spec OA-1)**.
Every other row of the contract is unchanged.

## Fields

| Field | Type | Required | Rule |
|---|---|---|---|
| `whatsappDialCode` | string | conditional | `contactPreference === "whatsapp"` → present, `^\+[1-9]\d{0,3}$` ("+" included). `"email"` → absent or empty |
| `whatsapp` | string | conditional | `"whatsapp"` → 6–14 digits after the server strips non-digits, **without** the dial code. `"email"` → absent or empty |

The site always sends the absent form for `"email"` (never `""`), and the
digits-only form of `whatsapp`.

## Examples

```json
{ "contactPreference": "whatsapp", "whatsappDialCode": "+52", "whatsapp": "5544332211" }
{ "contactPreference": "whatsapp", "whatsappDialCode": "+1",  "whatsapp": "8765551234" }
{ "contactPreference": "email" }
```

## Errors

`400 { code: "validation_failed", fields: [...] }` may name
`whatsappDialCode`; the site marks the selector (form field
`whatsappCountry`). Named while the preference is `email` → generic error
(site defect), same as `whatsapp` today.

## Deploy order (spec OA-2)

The server rejects unknown keys (contract § 6). This site version must not
reach production before the backend that accepts `whatsappDialCode`. If the
backend also **requires** it for WhatsApp, the currently deployed site
fails WhatsApp submissions from the moment the backend ships: coordinate.
