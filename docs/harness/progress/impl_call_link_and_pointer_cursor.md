# Feature 11 · `call_link_and_pointer_cursor` — implementation

Left at `in_progress`. Review against the `acceptance` array plus
`decisions-open.md` § Decisión 2 and `ui-map.md` §§ 3, 6. Green: `check`,
`typecheck`, `test` (349 pass), `generate`, `storybook:build`, `./init.sh` = 0.

## What changed

- **One URL, one place.** New `app/shared/data/callBooking.ts` exports
  `CALL_BOOKING_URL` — `app/shared/` is the only place `landing` and `shell` both
  reach without breaching Article III. A destination, not copy, so it never
  enters the locale files: `tests/call-booking.test.ts` asserts exactly one
  literal under `app/` and none in `i18n/locales/*.json`.
- **Three symptoms, one data change.** `HERO_DESTINATIONS.callUrl` and the
  footer's `shell.footer.contact.call` (`none` → `external`) now name it. **No
  markup changed in `HeroSection.vue` or `FooterColumn.vue`** — the grey text and
  missing arrow were the inert branch, not styling. Verified on the generated
  page: `text-bone-100`, `_blank`, `noopener noreferrer`, arrow.
- **The cursor.** No `cursor` declaration existed in the emitted stylesheet at
  all: Tailwind v4 dropped v3's preflight rule, so anchors looked right only
  because the user agent does it while native `<button>`s stayed `default`. Fixed
  where defined — `BotonPrimario.vue` (conditionally), `SocialIcon.vue`, the
  inline `<button>`s in `SiteNav.vue`/`MobileMenu.vue`. `findings.md` § R56.
- **Tests.** Added `heroContent.test.ts`, `tests/call-booking.test.ts`, pointer
  cases on five components, hero/footer link assertions on the artefact. The
  inert-branch test was **updated, not deleted**, and says why it outlives its
  blocker; stories ship the real `callHref` plus a `NoDestination` story.

## The primary CTA's cursor — decided: no pointer

Pointer when `BotonPrimario` has an `href` **or** resolves to `type="submit"`;
not for a `type="button"` with no destination, which is the hero's primary CTA
today — no href, no handler, clicking does nothing. `ui-map.md` § 6 already rules
on this shape: *"un espacio reservado que parece clickeable y no lleva a nada se
lee como sitio roto"*. It gains the pointer by construction when `contactHash`
lands, asserted by a test rather than promised in a comment. Stated limit: a
caller attaching a click listener to a `type="button"` gets an action, no pointer.

## Surprises

1. A dead `pnpm dev` held the build lock at start; killed first.
2. `BotonPrimario.test.ts` greps its own source for `/@(click|…)/` — a comment
   naming the binding **in prose** failed the suite. Reworded prose, kept guard.
3. `SocialIcon` is an `<a href>` and already had a pointer; declared it anyway so
   the menu's glass controls stop depending on their element type.

Untouched: the five frozen components, feature 10's and feature 7's scope, the
nav's deferred background. `docs/business/` not written to.
