# Current session

- **Feature:** 47 `v2_cleanup_and_release` (rescoped to v1 cleanup only, Roberto 2026-11-07) is `done`: review-47 APPROVED, Roberto approved the close-out on 2026-11-07. Not committed; the patch bump goes through `/commit-flow` when Roberto asks.
- **Branch:** `chore/v2-legacy-cleanup` (from master, after `feat/v2-consented-tracking` was merged into master on 2026-11-07).
- **Feature 49:** `done` and merged into master (53749f0). Deploy status not yet confirmed by Roberto.

## Feature 47 · follow-ups (from review-47)

- **N1 · test guard gap:** `tests/v1-retired.test.ts` does not catch a re-added theme key like `--color-bone-*` or a utility class like `bg-ink-*`. Add a `--color-(?:bone|ink|red|wine)-\d` pattern and a class-name pattern in a later change.
- **N4 · i18n keys:** keys read only by v1 components were not audited (impl-47). Candidate follow-up.
- N2 (constitution 2.1.4, implementer.md) and N3 (this header, feature title) were applied by the leader.

## Feature 49 · open after close-out

- **At merge (leader):** set A1 `legal.privacy.updated` (ES and EN) to the merge date (impl-49, A1 note). The no-placeholder test fails on a `[…]` value. **Done 2026-11-07:** privacy set to 7 Nov 2026 (ES/EN, merge 53749f0); terms stay at 5 Nov.
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
- Feature 51 `faq_content`: `spec_ready` 2026-11-08, waiting on the human approval gate.
- R32 hand-off to Clau for feature 50: timeline emphasis, footer spacing, new cursor.

## Feature 51 · spec (spec_author, 2026-11-08)

- **Status:** `pending` (not `spec_ready`): 4 blocking questions open in
  `specs/051-faq-content/open-questions.md` (OQ-1 vertical framing vs the
  section-centring rule; OQ-2 "Preguntas" header item vs the feature 43/46
  "permanently out of the bar" ruling; OQ-3 new `faq` module + Constitution
  Article I amendment; OQ-4 llms.txt copy). OQ-5…OQ-8 are non-blocking, with
  defaults applied in the spec.
- **Package:** `specs/051-faq-content/` — spec.md, open-questions.md,
  plan.md, research.md, data-model.md, quickstart.md, contracts/
  (ui-contract, build-output, llms-txt draft), checklists/requirements.md,
  tasks.md (39 tasks; OQ-dependent tasks tagged with the alternative).
- **Decided in the spec (task asked for it):** FAQPage JSON-LD in both
  locales via nuxt-schema-org (supersedes spec 046 FR-038); llms.txt keeps
  its index shape, only the two FAQ lines change; all 20 answers in the
  prerendered HTML; meta copy from the approved JSON.
- **Not read:** `muush.pen` (no Pencil MCP in the subagent). Visual values
  come from the handoff README and PNGs; the leader may correct from the
  frames.
- **For the leader:** `faq.tabsLabel` ("Temas"/"Topics", screen-reader only)
  is new copy not in the approved JSON, needs approval at the gate. spec-kit
  scripts reject the `feat/v2-*` branch name; they were run with
  `SPECIFY_FEATURE=051-faq-content` and `.specify/feature.json` now points to
  `specs/051-faq-content`. The CLAUDE.md agent-context step was skipped (no
  SPECKIT markers, and the file is outside the spec_author's write scope).
- **No new business rule** was written or inferred; the FAQ answers state
  business facts (5-business-day proposal, deposit, 1-year CV retention), all
  from the approved JSON; CV retention matches the privacy notice.

### Feature 51 · answers applied (spec_author, 2026-11-08)

- **Status:** `spec_ready`. Roberto answered OQ-1…OQ-8 (1B, 2A, 3A, 4A,
  5 `.pen` export, 6A, 7A, 8 A+B); spec, plan, research, data-model,
  contracts, quickstart, checklist and tasks (41 tasks) rewritten to match.
  speckit-analyze: no critical or high finding.
- **Constitution 2.1.5** applied (PATCH, `faq` in Article I, Roberto's
  written approval in `open-questions.md`).
- **Framing:** site-wide centring (no `faq-arriba`/`faq-abajo` tokens); the
  band stays at its drawn offset from the page top, so the title may sit on
  it. Fallback if Roberto dislikes it: handoff values.
- **Header:** fourth item Preguntas/FAQ; every pin of "FAQ not in nav" is
  listed in tasks T036; specs 046 (FR-029, FR-032, FR-038, US3 sc. 4,
  Context) and 043 annotated as superseded.
- **New event:** `faq_question_open { faq_topic, faq_question }`, GA4 only,
  open only; Roberto registers 2 event-scoped dimensions. Tracking plan
  update is task T038.
- **For the leader:** `faq.tabsLabel` "Temas"/"Topics" still needs copy
  approval at the gate; `docs/business/muush-1.0.md` § 3 line 79 still says
  Preguntas is "En construcción" (human-only file); the poster PNGs live in
  the session scratchpad (temporary); no mobile poster (presets hold one).

### Feature 51 · implementation (implementer, 2026-11-08)

- **Status:** implementation complete, `in_progress` (the leader moves it to
  `reviewing`). Report: `docs/harness/progress/impl-51.md`. `./init.sh`
  exits 0 (205 files, 2893 tests; generate and Storybook build green). Not
  committed.
- **For Roberto's look (OQ-1 = B):** centred framing; at 1440 × 900 and
  390 × 844 the content is taller than the viewport, so the pill starts at
  120 / 100 px and the title sits on the band (84–684 / 68–368). Fallback
  ready in the `global.css` "Preguntas" comment (200 → 300 top, 64 → 200
  bottom, no centring).
- **Header at 1024 — FIXED in round 2 (option A, `--spacing-enlace-x` fluid 8 → 18 between 1024 and 1104; see impl-51 Round 2). Original report:** the four-item bar
  (424 px) no longer fits centred between the logo and the end group below
  ≈ 1077 px: at 1024 it sits 26 px left of centre and touches the ES button
  (0 px gap), no overlap, no wrap. Centred at 1280 / 1440 / 1920. Needs a
  decision (tokens not shrunk on my own).
- **Poster:** `.pen` export `h3JSJ` → `preguntas-acanalado.webp`, `cwebp -q 85
  -m 6`, 129,850 bytes, 1440 × 600.
- **GA4 (Roberto):** register event-scoped dimensions `faq_topic` and
  `faq_question`. **Search Console:** re-request indexing of `/es/preguntas`
  and `/en/faq` after deploy.
- **R32 values for Clau's `.pen`:** the four-item nav, the centred framing,
  `faq.tabsLabel` "Temas"/"Topics", underlined inline links in answers and
  the card (the handoff draws them plain).
