# Review: feature 20 `work_with_muush_section` — re-review (round 2)

APPROVED

## Delta verified (round 1's two rejection points only)

1. **Line count**: `ApplicationForm.vue` = 198 lines, `ApplicationWhatsappField.vue`
   = 89 lines (`wc -l`, both confirmed). Extraction is real, not cosmetic:
   the new component owns only the WhatsApp field markup + its
   mount/unmount `<Transition>` CSS; visibility stays a parent decision
   (`visible` prop from `values.contactPreference === 'whatsapp'`), no
   duplicated validation/state logic. `plan.md`'s Phase -1 gate now records
   the true 249→198 history instead of a false "Yes".
2. **Behavior parity, live CDP** (fresh `pnpm generate`, served on :4173):
   selecting WhatsApp mounts the field; typed value persists; reverting to
   Correo unmounts it; reselecting WhatsApp remounts it empty (value
   discarded) — identical to pre-extraction behavior.
3. **30px offset, live CDP, desktop 1440×900**: `formTop - textTop = -30px`
   exactly (`margin-top: -30px` computed), matching Left@y130/form@y100.
   Confirmed desktop-only: mobile 390×1000 computed `margin-top: 0px`,
   stacked flow untouched (the 32px text-bottom→form-top gap there is just
   `--work-stack-gap`, unrelated to the fix).
4. **No clip/overlap regression**: `--spacing-work-top` ≈ 130px at 1440px
   width, far larger than the 30px pull-up, so the form cell never crosses
   the section's own top boundary into `AboutHeroSection`. `scrollWidth ===
   clientWidth` at 1440 and 1920 (no horizontal overflow introduced). Single
   grid row (text/form side by side, not stacked rows), so the negative
   margin has no sibling row to overlap.

## Gates

`./init.sh` exit 0. **688 tests** (58 files), up from 684 (+4 for
`ApplicationWhatsappField.test.ts`).

Not re-audited (already confirmed round 1, unchanged by this delta):
no-submit guarantee, `previewState` isolation, CV dead end, `SelectField`
additive extension, byte-unchanged `ContactForm`/`useContactForm`/
`contactFields`/`ContactSection`, glow/token non-duplication.
