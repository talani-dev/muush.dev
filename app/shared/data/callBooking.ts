/**
 * Where `Agenda una llamada` / `Book a call` goes.
 *
 * Given by Roberto on 2026-09-07, closing blocker #2 of
 * `docs/business/landing/decisions-open.md`. The decision was written as *"link
 * real de Google Calendar"*; the tool turned out to be **Cal.com**, and the
 * destination is what the decision was ever about.
 *
 * ## Why it lives here, in `app/shared/data/`
 *
 * That same decision scopes it to three places — *"hero, CTA final y footer"* —
 * which are two different feature modules today (`landing` and `shell`) and a
 * third that is not built yet. A feature may not read another feature's
 * internals, so the only place both can reach is `app/shared/`
 * (Constitution Article III).
 *
 * ## Why it is not copy
 *
 * It is a **destination**, not a string a visitor reads, so it never enters
 * `i18n/locales/*.json`. A URL duplicated per locale is two values that can
 * drift apart, and the booking page is the same page in both languages. The
 * label is translated; the target is not.
 *
 * `tests/call-booking.test.ts` holds both halves: exactly one literal in
 * `app/`, and none in either locale file.
 */
export const CALL_BOOKING_URL = 'https://cal.com/muush/intro-call'
