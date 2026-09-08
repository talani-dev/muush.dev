# Implementation: `contact_section` (feature 16)

Built `app/features/forms/` (new module: field/data/logic + `ContactForm`)
and `landing/ContactSection.vue` (Pill/heading/body/alt-route, 3 glows,
CSS-grid two-column ↔ stacked layout). `pages/index.vue` composes both
barrels; `HERO_DESTINATIONS.contactHash` filled.

**Both CTAs verified on the built page** (`pnpm generate` + Chrome CDP,
`findings.md` § R44): nav CTA and Hero primary CTA both render as real
`<a href="/es#contacto" ... cursor-pointer">` (and `/en#contacto`); Hero's
stale `<button type="button">` is gone (0 matches; the 3 remaining are
Purpose's unrelated triggers).

**No-submit guarantee, grep/type-provable**: `ContactSubmitState` is
`'idle' | 'invalid'` only — no `sending`/`success`/`server-error` member
exists in `useContactForm.ts`, so no code path reaches them from a click.
Those three exist only as `ContactForm.vue`'s `previewState` prop, consumed
only by its `.stories.ts`. Verified live: a valid submit on the served
artefact fires zero external network requests.

**Bug caught + fixed via CDP**: `errorFor()` showed errors immediately from
the live `errors` computed, before any submit — gated on `state==='invalid'`,
added a regression test.

**Verified live (CDP)**: paint order (`-3`/`-2`/transparent/no transform);
WhatsApp field mounts + discards value on round trip; empty submit focuses
`name`; zero horizontal overflow 320–2560px; mobile alt-route below the form.

**UNVERIFIED, flagged in `global.css`, owner Clau/leader**: `--contact-left-w`
(556px, derived not confirmed), col/text gaps (seeded), `--spacing-contact-top`
(seeded from Services' 110px leftover — Proyectos is `blocked`), and the
glows' vertical baseline (deltas confirmed, `foco-y` origin placeholder — needs
a `.pen` read only the leader can do). Contrast token (80% opacity) computed
against a modelled worst case (~11.9:1), not a live-pixel measurement.

`./init.sh`: exit 0. 49 files / 582 tests (baseline 41/519).
