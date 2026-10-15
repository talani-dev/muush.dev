# Review — feature 32 `whatsapp_dial_code_selector`

**Date**: 2026-10-14 · **Agent**: reviewer · **Branch**: `feat/whatsapp-country-code` (uncommitted working tree)
**Status at review start**: `reviewing` (confirmed in `feature_list.json`; the only feature in `in_progress`/`reviewing`).

## Verdict

APPROVED

No blocking findings. The known human items (OA-1 docs rewrite, OA-2 deploy
order, OA-10 visuals against the `.pen`, manual T036/T044) are still open.
They are listed below and are not defects.

## `./init.sh` (run by the reviewer)

Exit 0. Typecheck, `biome check --error-on-warnings`, tests
**76 files / 1072 tests passed**, `pnpm generate`, `pnpm storybook:build`, and
"Environment ready". The only output is Vite's usual chunk-size warning.

## Checks against the leader's focus list

| Item | Result | Evidence |
|---|---|---|
| Country detection makes no network request | CONFIRMED | `logic/countryOptions.ts:39-54` uses only `Intl.Locale` and `navigator.languages`, guarded by `typeof navigator`. It runs from `onContactPreferenceChange`, never at setup (`useContactForm.ts`, `useApplicationForm.ts`). Tests spy on `fetch` and expect zero calls (`useContactForm.test.ts:478`, `useApplicationForm.test.ts:548,698,758`). |
| Payloads `/contact` and `/careers` | CONFIRMED | `submissionPayloads.ts:69-72,94-97` add `whatsappDialCode` and `whatsapp` only inside the `contactPreference === 'whatsapp'` spread, so the email preference sends neither key. Covered by unit tests (`submissionPayloads.test.ts:137-157,275,299-314`, exact key order) and by flow tests over a mocked `fetch` with the real client (`submissionFlows.test.ts:219-290`, both endpoints, with and without WhatsApp). |
| 6–14 digit client validation | CONFIRMED | `validateContactForm` and `validateApplicationForm` count digits after stripping non-digits. Constants are `WHATSAPP_MIN_DIGITS=6` and `WHATSAPP_MAX_DIGITS=14` (`data/contactFields.ts`), re-exported by `applicationFields.ts`. Tests: 5 and 15 digits rejected, 6, 14 and a formatted number accepted (`useContactForm.test.ts:103-104`, `useApplicationForm.test.ts:210-211`). The number is sent digits-only, without the dial code. |
| `validation_failed` naming `whatsappDialCode` marks the selector | CONFIRMED | `SERVER_FIELD_ALIASES` maps it to `whatsappCountry` (`serverFieldErrors.ts`). The error key is `...whatsappCountry.errorInvalid`. `whatsappCountry` comes before `whatsapp` in both `*_FIELD_ORDER` arrays, so focus-first-invalid reaches `#whatsappCountry`. Tested end to end (`submissionFlows.test.ts:288`). The same error with the email preference falls back to a generic failure (tested). |
| Deviation #1 (WhatsApp-only marks ignored while preference is email) | Correct, masks nothing | `resolveServerFields` already turns any WhatsApp-only field named under the email preference into `undefined`, which means a generic error. So a mark on these fields can only exist from a WhatsApp submission. Hiding it while the preference is email only affects a field the visitor cannot see and that is not sent. If the visitor switches back to WhatsApp, the country mark comes back if the country is unchanged, and the number mark is gone because the number was cleared. Without this guard the kept country (OA-9) would block every email submit. |
| Select accessibility | CONFIRMED in code. Manual AT pass still open (T036) | The control is a native `<select>` with `:id`, `aria-label` = "Lada del país" / "Country code", `aria-invalid`, `aria-describedby` set to `whatsappCountry-error` only when there is an error, and `disabled` when readonly (`ui/DialCodeSelect.vue:61-74`). The face is `aria-hidden` and `pointer-events-none`. The select uses `opacity-0` (not `display:none`) and stays focusable and keyboard-operable. Focus ring: `.dial-select:focus-visible + .dial-face { outline: auto; outline-color: var(--color-red-400) }` (`DialCodeSelect.vue:92-95`). It uses a token, not a literal. The sibling order is asserted in a test. There is no positive tabindex, and Tab goes to the selector, then the number (`WhatsappField.test.ts`). |
| i18n parity | CONFIRMED | `forms.{contact,application}.fields.whatsappCountry.{label,errorInvalid}` exist in both `es.json` and `en.json`. `errorDigits` changed in both. Country names come from `Intl.DisplayNames` in the locale's `language`, a single source. `i18n-parity` and the copy tests pass. |
| No fetch in `ui/` | CONFIRMED | No match for `grep fetch\|navigator app/features/forms/ui/*.vue`. |
| No new third-party requests or dependencies | CONFIRMED | `package.json`, `pnpm-lock.yaml` and `nuxt.config.ts` are unchanged (`git diff --stat` is empty). `.output/public` has 16 origins, none of them a flag, country or phone service. Flags are emoji computed from regional indicators. |
| File size | CONFIRMED | `ApplicationForm.vue` 199, `ContactForm.vue` 175, `DialCodeSelect.vue` 103, `WhatsappField.vue` 125, `TextField.vue` 82. All are 200 lines or fewer. |
| Architecture / Constitution | CONFIRMED | Files stay in `forms/{data,logic,ui}`. `data/countries.ts` imports nothing, and `data/*Fields.ts` import only from `data/`. Cross-directory imports use `@/features/forms/...`. Relative imports appear only within the same directory (`./countryOptions`, `./DialCodeSelect.vue`). No hex, oklch or arbitrary values in the touched components. No `server/` directory, and `nitro.preset` is still `'static'`. Components use `<script setup lang="ts">`. No debug prints or TODOs. `landing/` and `about/` fixtures do not import forms internals. |

## Dial-code sample (countries.ts)

I sampled MX +52, US +1, CA +1, AR +54, CO +57, CL +56, ES +34, BR +55, PE +51,
GB +44, PR +1, DO +1, JM +1, GU +1, VI +1, SX +1, KZ +7, RU +7, XK +383,
BQ/CW +599, TA/SH +290, AC +247, AX +358, VA +39, SJ +47, EH +212 and CC/CX +61.
Then I dumped all 245 rows (`grep -oE "code: '..', dialCode: '...'"`) and read
them all against my own knowledge of the ITU-T E.164 assignments and the
libphonenumber region set. I found no mismatch.

**INFERRED, not CONFIRMED**: I did not check against a fetched ITU or
libphonenumber file in this session. No network was used, by design.
`countries.test.ts` checks the format regex for every row, the count (245),
uniqueness, and the shared and unusual codes.

## Non-blocking notes

1. FR-020 vs the native `<option>`: the option text contains the flag emoji.
   Some screen readers may read it, for example "flag: Mexico", which
   duplicates the name. A native option cannot hide part of its text. This
   trade-off is documented in research.md R3 and was accepted with the OA-6
   baseline. T036 should record how it actually sounds.
2. `outline: auto` with `outline-color` may render in the system color
   instead of red-400 in Safari and Firefox. This needs to be checked by eye
   in T044.
3. Deviation #2 (`leading-error` slot) and the `display: contents` wrapper in
   `TextField.vue` are additive. Existing `TextField` tests pass.

## Open human items (known, not defects)

- OA-1: `form-api-contract.md` § 3/§ 5 and `ui-map.md` § 7 still describe the
  10-digit rule. Only a human may rewrite them.
- OA-2: do not deploy before the backend accepts `whatsappDialCode`. The
  server rejects unknown keys.
- OA-10: the selector's visual values have not been checked against the `.pen`
  (leader).
- T036 (VoiceOver/keyboard) and T044 (manual quickstart, Windows flag
  rendering) are unchecked in `tasks.md`. All other tasks are `[x]`. The TC01–TC07
  tasks (Appendix C) were not selected at the gate.
- C6: the `history.md` entry and the move to `done` belong to the leader.
