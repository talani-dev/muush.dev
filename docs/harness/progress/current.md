# Current session

- **Feature:** none active — 49 `consented_tracking` closed (`done`) on 2026-11-07 (review-49: first review and fix round 1 both APPROVED); 50 `mobile_fixes_map_process_footer` closed earlier the same day.
- **Branch:** `feat/v2-consented-tracking` (from `fix/v2-mobile-fixes`, which is merged into master).
- **Next:** merge `feat/v2-consented-tracking` into master and deploy when Roberto asks.

## Feature 49 · open after close-out

- **At merge (leader):** set A1 `legal.privacy.updated` (ES and EN) to the merge date (impl-49, A1 note). The no-placeholder test fails on a `[…]` value.
- **After deploy (Roberto's decision, 2026-11-07):** Meta re-test (`trackSingle` PageView on navigation, `Contact`, `Schedule`) and the real assessment send (`generate_lead`, Meta `Lead` with 64-hex `ud[em]`/`ud[ph]`). Include review-49 F2: after a confirmed Lead, check whether a later in-app PageView carries `ud[em]`/`ud[ph]` (INFERRED, unverified). Also review F3: check DebugView and Admin → Data filters.
- **GA4 admin (Roberto, tracking-plan-49 § 9):** after the first events, register the custom dimensions (including `result` for `form_response`) and the `section_seconds` metric; mark `generate_lead`, `book_call_click`, `contact_click` as key events. GA4 reception itself is CONFIRMED (see below).
- **`.pen` copy (leader, via the Pencil MCP, Pencil app open):** Analítica row and the changed legal/consent strings listed in the impl-49 "R32 hand-off to Clau" item, plus A1 once dated.
- **`docs/business` (Roberto updates, human-only):** `muush-1.0.md` § 1 / § 4.6 ("no se construye" note superseded by the website field) and `landing/form-api-contract.md` § 3 (add `website`).
- **Search Console:** request re-indexing of the changed pages after deploy.
- Review F1 is fixed: tasks.md T016 and research.md R3 now describe the fix-round-1 calls (GA `set`/`consent default` before `js`; Meta `trackSingle` PageView), pointing to findings.md § R80.

### Manual checks record (feature 49)

- 2026-11-07: GA4 CONFIRMED in Realtime (event-count card) from Roberto's walks and a real automated walk by the leader (7 hits, all 204, `npa=1`, section_view/form_*/form_response/form_error received). The "Vista general de usuario" card under-shows events; read the event-count card.
- R43 for `website`: Roberto confirmed 2026-11-07 that the API release accepting `website` is live in production (FR-067 precondition met).

## Open with Roberto

- OG image 1200×630 from Clau (safe zone 630×630 centred), uploaded to assets.muush.dev → one-value change in `app/features/shell/data/siteIdentity.ts`.
- Feature 51 `faq_content` blocked: questions ES/EN + .pen design.
- R32 hand-off to Clau for feature 50: timeline emphasis, footer spacing, new cursor.
