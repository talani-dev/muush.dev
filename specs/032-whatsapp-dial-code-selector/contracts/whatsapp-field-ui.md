# UI contract: `WhatsappField`, `DialCodeSelect`, `TextField` slot

All three live in `app/features/forms/ui/`, stay presentational (props in,
events out, no network, no Nuxt composable — Constitution V, rules § R23)
and under 200 lines.

## `DialCodeSelect.vue` (new) — option N baseline

```ts
interface Props {
  id: string                    // 'whatsappCountry' — DOM id, focus target
  modelValue: CountryCode
  options: CountryOption[]      // already localized + sorted (data-model § 3)
  label: string                 // accessible name, OA-8 ("Lada del país")
  error?: string                // presence → error style + aria-invalid
  errorId?: string              // id of the rendered error, for aria-describedby
  readonly?: boolean            // → disabled, like SelectField
}
emits: { 'update:modelValue': [code: CountryCode] }
```

Markup contract:

- A native `<select :id :aria-label="label" :aria-invalid
  :aria-describedby :disabled>`; one `<option :value="code">` per option,
  text `"{flag} {name} ({dialCode})"`.
- A visible face, `aria-hidden="true"`, showing `{flag} {dialCode}` of the
  selected option and the existing `chevron-down.svg?raw` icon; the select
  is layered over it (full size, transparent) so every click and key goes
  to the select.
- Visible focus: the face shows the existing red focus outline when the
  select has `:focus-visible` (`focus-visible:outline-red-400` recipe).
- Classes: only existing tokens (research R7); **UNVERIFIED against the
  `.pen`** (spec OA-10).

## `TextField.vue` (changed, additive)

New optional named slot `leading`. Absent → markup identical to today
(existing tests keep passing). Present → slot and `<input>` in a flex row
(`gap-field-label-gap`), input `flex-1 min-w-0`. The `<label for>` still
targets the input.

## `WhatsappField.vue` (changed)

```ts
interface Props {
  visible: boolean
  modelValue: string                               // number
  country: CountryCode                             // v-model:country
  content: {
    whatsapp: { label: string }
    whatsappCountry: { label: string; options: CountryOption[] }
  }
  errors?: { number?: string; country?: string }   // already translated
  readonly?: boolean
}
emits: { 'update:modelValue': [string]; 'update:country': [CountryCode] }
```

Renders, inside the existing `<Transition>`: `TextField id="whatsapp"`
(type `tel`, `required`) with `DialCodeSelect id="whatsappCountry"` in its
`leading` slot. Country error rendered by `DialCodeSelect`'s owner under the
row with id `whatsappCountry-error`, before the number error. Tab order:
selector, then number.

## Forms

`ContactForm.vue` / `ApplicationForm.vue` pass
`v-model="values.whatsapp"`, `v-model:country="values.whatsappCountry"`,
`:content="content.fields"` (structurally satisfies the `content` prop) and
`:errors="{ number: errorFor('whatsapp'), country: errorFor('whatsappCountry') }"`.
Country changes go through `onWhatsappCountryChange` of the composable
(sets the "picked" flag).

## Option C delta (only if the gate picks the custom combobox)

`DialCodeSelect.vue` is replaced by `DialCodeCombobox.vue` with the same
props/emits plus internal search state, following the WAI-ARIA APG
"Editable Combobox With List Autocomplete" (research R6), with its
keyboard/filter logic in `logic/useDialCodeCombobox.ts`. Nothing else in
this contract changes.
