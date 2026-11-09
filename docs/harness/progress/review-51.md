# Review · Feature 51 `faq_content`

Reviewer, 2026-11-08. Branch `feat/v2-faq-content`, uncommitted tree. Status
was `reviewing` at the start (confirmed in `feature_list.json`); not changed.

## Verdict: CHANGES_REQUESTED

One blocking finding (F1, the header at 1024 px, which breaks FR-021 on every
page). Fix it, or have Roberto explicitly accept it. F2 and F3 are small
corrections to the docs and evidence that go with this round. Everything else
is in good shape.

## Gates (re-run by the reviewer)

- `./init.sh`, first run: EXIT 1. `pnpm test` and `pnpm generate` failed with
  "Another Nuxt build is already running (PID 33551)". That process was gone
  when I checked, so it was a concurrent build from another agent, not a code
  failure.
- `./init.sh`, second run: **EXIT 0**. typecheck OK, Biome OK (594 files),
  **205 files / 2,893 tests** pass, `pnpm generate` OK, `pnpm storybook:build`
  OK. CONFIRMED.

## What I verified (CONFIRMED unless marked)

- **Copy fidelity.** My own script compared both locale files with the handoff
  JSON: meta, pill, two-line title, subtitle, card title, text and button,
  5 topic titles, 5/5/4/3/3 questions, and all 20 Q&A per locale, with
  `{privacy}`, `{about}` and `{email}` filled in. **0 mismatches** in ES and EN.
  No literal `@` in the `faq.*` keys. The test fixtures
  `tests/fixtures/faq-approved.{es,en}.json` are semantically identical to the
  handoff JSON; only the line wrapping differs (Biome).
- **i18n parity.** The ES and EN key sets are identical. `shell.faq.*` is gone.
- **Static HTML.** In both `es/preguntas/index.html` and `en/faq/index.html`,
  all 20 questions and all 20 answers are present as body text. There is no
  "En construcción", "Under construction", "Mientras tanto" or "In the
  meantime". The pages have 1 tablist, 5 tabs and 5 tabpanels. Exactly one
  `aria-expanded="true"` and 19 `false`. The privacy and about links resolve
  to the JSON URLs. The card button goes to `cal.com/muush/intro-call` with
  `_blank` and `noopener noreferrer` and `book_call_click`/`faq`. The card and
  q19 have mailto links. The title, description, `og:title` and
  `og:description` match the approved meta. The sitemap still has 10 URLs.
- **ARIA and keyboard.** The tabs follow the WAI-ARIA tabs pattern: roving
  tabindex, `aria-selected`, `aria-controls`, and panels with
  `aria-labelledby`. Left/Right wrap, Home/End work, and focus follows via
  `nextTick`. Each question is an `h3 > button` with `aria-expanded` and
  `aria-controls`. The answer `section[aria-labelledby]` is always rendered
  and `hidden` while closed. Icons and the band are `aria-hidden`. Native
  buttons give Enter and Space.
- **`faq_question_open`.** It is emitted only from `useFaqAccordion.toggle`
  when that call opens a question. Nothing is emitted by `reset()`, which runs
  on entry, from a hash and on a topic switch, and nothing on close. The
  params are only a closed-enum topic id and a number, so no PII. The event is
  not in `META_EVENT_BY_NAME` or `CLICK_EVENT_NAMES`. The GA4 sink test checks
  exactly the two params, and the Meta test checks it never reaches Meta.
  Consent gating is unchanged (bus + sinks, feature 49).
  `tracking-plan-49.md` § 4, the dimensions and § 9 are updated.
- **Hash and language switch.** `replaceState` keeps `history.state`, so the
  page does not scroll and no history entry or page view is added. An unknown
  fragment selects topic 01 and is not "named". The topic is carried by index
  to the other locale's anchor. The state is a `useState` that is set only
  after mount, so the prerendered toggle href has no fragment (checked:
  `href="/en/faq"`), and it is cleared on `onScopeDispose`. The implementer
  measured the deep links and the switch on the built site (impl-51); I did
  not re-run them in a browser.
- **Nav.** All 12 prerendered pages show `Inicio · Servicios · Nosotros ·
  Preguntas` (EN `Home · Services · About · FAQ`). On Preguntas/FAQ only that
  item is `aria-current`. On every other page it is not.
- **Tests weakened?** No. Every removed assertion belongs to code that was
  removed: the shell `faq.ts` and `useFaqContent`, the StatusSection `faq`
  preset and the `estado` size. Each test that pinned "FAQ not in nav" was
  rewritten into a positive assertion of the 4-item order, on all
  pages/locales (`navigation.test.ts`, `static-output.test.ts`,
  `shell-copy.test.ts`, MobileMenu, NavLinkBar, SiteHeader fixtures). "Never
  Proyectos/Projects" in the nav is kept. The "never FAQPage" test became a
  20-question equality check against the copy on disk.
- **llms.txt.** `public/llms.txt` matches the fenced block of
  `contracts/llms-txt.md` byte for byte, with a final newline. Only the two
  approved lines changed. A test asserts that no question text leaks in.
- **Poster.** `preguntas-acanalado.webp` is 1440×600 WebP, 129,850 B, inside
  the 75–140 KB range. Its hash differs from master (`3ccd49d…` →
  `57ec8e5…`). Side by side it matches the `.pen` export
  `poster-escritorio-h3JSJ.png`.
- **Preset.** The `faq` uniforms equal the README. The compact set is the same
  plus `u_ribs 18` and `u_th 0.26`.
- **Tokens.** I recomputed the fluid clamps for the heading size, line height
  and tracking, the band top and height, and the question padding. They are
  correct at the 390 and 1440 anchors. The components contain no colour or px
  literals: opacity modifiers on palette tokens only, and gradients via
  `color-mix` on tokens. There is no outer framing token, and the fallback is
  documented. Module boundaries hold: `faq` imports only `@/shared/*` and the
  `@/features/shell` barrel, and `data/` does not import `logic/` or `ui/`.
  Components are under 200 lines. There is no `console` or `TODO`.
  Constitution 2.1.5 lists `faq`.
- **Tasks.** All 41 tasks in `tasks.md` are `[x]`, and the spec has no
  `NEEDS CLARIFICATION`.

## Findings

### Blocking

1. **The header at 1024 px breaks FR-021 on every page.** FR-021 says "the link
   bar stays centred in the header", and the edge case says the bar, the logo
   and the end group "fit at 1024 without overlap". With four items the bar is
   424 px wide, which is more than the centred track allows below about
   1077 px. At 1024 it shifts 26 px left of centre and **touches the ES
   button with a 0 px gap**. This is visible in
   `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/shots51/es-1024.png`
   and affects all 12 pages between 1024 and about 1077 px. The implementer
   correctly stopped and reported it (T035). It still needs a resolution
   before approval. Either:
   - (a) Roberto picks a fix, such as a fluid link padding or gap that closes
     the bar between 1024 and 1080, or a check of the `.pen` header at that
     width. Then it is implemented, with a static or CDP check at 1024, or
   - (b) Roberto explicitly accepts the off-centre, 0-gap header at
     1024–1077, and that acceptance is recorded in the spec (FR-021 / Edge
     Cases).

### Must fix in this round (non-blocking on their own)

2. **The JSON-LD contract doesn't match what ships.** The contract
   (`contracts/build-output.md` § 2) asks for `@type` `"FAQPage"` as a
   string, plus `inLanguage` on the page node. What ships is
   `["WebPage","FAQPage"]` with no `inLanguage` on the WebPage node. The
   language is on all 20 Questions and on the WebSite node.

   **Judgement: the array is acceptable for Google.** This is INFERRED; no
   validator was run. Reasons:
   - schema.org allows multiple types, and `FAQPage` is a subtype of
     `WebPage`, so the array is redundant but valid.
   - Google's structured-data parsing accepts multi-typed entities and keys
     on the `FAQPage` member.
   - Nosotros already ships `["WebPage","AboutPage"]`.
   - `mainEntity` lists 20 `Question` → `Answer` nodes by `@id`, and the
     answers equal the visible copy.
   - Since 2023 the FAQ rich result is shown only for authoritative
     government and health sites, so muush loses nothing either way.

   **Action:**
   - Amend § 2 of the contract to the shipped shape. The leader can edit this
     doc.
   - Fix the stale docblock in `tests/seo-output.test.ts`, which still says
     "a plain string type in both locales" above a test that asserts the
     array.
   - After deploy, run the Rich Results Test or the Schema.org validator on
     both URLs (SC-005).

3. **The implementation report cites evidence files that don't exist.**
   `impl-51.md` lists `shots51/header-1024-crop.png` and
   `shots51/header-1280-crop.png`. Neither file is in `shots51/`. The header
   numbers are still supported by `measure.json` and `es-1024.png`. Correct
   the report so it cites only files that exist.

### Non-blocking (for the leader, Roberto or Clau)

4. **DERIVED values aren't checked against the `.pen`.** These come from the
   PNGs, and the `.pen` is the source of truth:
   - header gap 20 at 1440
   - tab number → name gap 12
   - tab name line height 1.25
   - card title line height 1.4
   - mobile title line height 1.1
   - the card height residual: 275.6 vs about 283 in the reference

   The arithmetic is correct. Confirm the values against frames `h3JSJ` and
   `xJCj0` with the Pencil MCP.
5. **Inline and card links are underlined**, while the handoff draws them
   plain. This is justified by WCAG 1.4.1, because the link colour equals the
   text colour. It is a design deviation for Clau and Roberto to confirm (R32).
6. **Re-clicking the already-selected tab resets the accordion**, reopening
   question 1 and closing the visitor's open question, because `select()`
   always calls `reset()`. FR-012 only asks for this on a topic *switch*.
   Suggest returning early when `index === selected`. Minor UX.
7. **Heading order skips a level.** The page goes h1 → h3 (questions), with
   the card's h2 after them in the DOM. This follows the UI contract. It is a
   minor accessibility best-practice item (axe `heading-order`); it could be
   fixed with a visually hidden h2 per panel, or by accepting it.
8. **Two behaviours lack an automated test.** `useFaqLocaleSwitch`'s clearing
   on dispose and the `route.hash` watch in `useFaqTopics` are covered only
   by the implementer's built-site measurement. `faqSegments.ts` is tested
   indirectly through `useFaqContent.test.ts`. Consider a small unit test for
   each (C5).
9. **Scope addition outside the tasks:** the `estado` heading size and its
   tokens were retired (impl deviation 5). It is justified as dead code
   (Article VIII) and pinned gone by a test. Noted for the record, not an
   objection.
10. **Cosmetic:** one over-long comment line in `usePageSeo.ts` (the
    "`replaceWebPageNode` below), the mechanism feature 46 measured…"
    paragraph).
11. **Docs and follow-ups:**
    - `docs/business/muush-1.0.md` still says "En construcción" (human-only).
    - Roberto registers the GA4 dimensions `faq_topic` and `faq_question`
      (event scope).
    - Request re-indexing of both URLs in Search Console after deploy.

## Re-review scope

Re-review F1 (fixed with a 1024 check, or Roberto's recorded acceptance), F2
and F3. The other findings need no re-review.

---

## Re-review (round 2, 2026-11-08)

Reviewer, against `impl-51.md` § "Round 2 · review-51 fixes" and Roberto's
"Revisión 1" (option A) in `open-questions.md`. `feature_list.json` still
reads `reviewing` and was not touched.

### Verdict: APPROVED

F1, F2 and F3 are resolved. I checked each one independently against the
code and against the site on 127.0.0.1:4321. I did not start a new server;
my own headless Chrome over CDP was the client, with vendor hosts blocked.

### Gates

`./init.sh` re-run by the reviewer: **EXIT 0**. typecheck, Biome, **205
files / 2,896 tests**, `pnpm generate` and `pnpm storybook:build` all pass.
CONFIRMED.

### F1 · header 1024–1104 (CONFIRMED, my own measurement)

- **The change.** `--spacing-enlace-x` goes from `1.125rem` to
  `clamp(0.5rem, -7.5rem + 12.5vw, 1.125rem)`. That is 8 px at 1024 and
  18 px at 1104 and up, as the arithmetic says.
- **No side effects.** `px-enlace-x` appears only in
  `app/features/shell/ui/NavLinkBar.vue` (`ITEM_CLASSES`). No other
  component, CSS rule or story reads the token.
- **Measured.** I set the device metrics per width (DPR 1) and measured the
  `ul.gap-barra` of the visible link bar against the visible
  `a[hreflang]` toggle on `/es/preguntas/`, `/es/`, `/en/faq/` and
  `/en/about/`:

  | width | ES bar / gap to ES / padding | EN bar / gap to EN | off-centre | link rows | h-scroll |
  |---|---|---|---|---|---|
  | 1024 | 344.3 / 13.6 / 8 | 283.3 / 53.0 | −0.01 | 1 | none |
  | 1050 | 370.3 / 13.6 / 11.25 | 309.3 / 53.0 | −0.01 | 1 | none |
  | 1077 | 397.3 / 13.6 / 14.625 | 336.3 / 53.0 | −0.01 | 1 | none |
  | 1080 | 400.3 / 13.6 / 15 | 339.3 / 53.0 | −0.01 | 1 | none |
  | 1104 | 424.3 / 13.6 / 18 | 363.3 / 53.0 | −0.01 | 1 | none |
  | 1440 | 424.3 / 181.6 / 18 | 363.3 / 221.0 | −0.01 | 1 | none |

  The values are identical on every page of the same locale. The bar is
  50 px tall everywhere. At 1440 the bar width and padding are the same as
  before the change, so 1440 is unchanged. The numbers equal the
  implementer's table to the decimal. The 1024 ES crop
  (`shots51/header-1024-es-crop.png`) shows the bar centred, with clear air
  before ES and no truncation.
- **1104 instead of 1080: justified.** Roberto asked for the bar to be
  "centrado y con aire junto a ES" and said "arriba de ~1080 px no cambia
  nada". With the old fixed padding, the ES bar centres from about 1077 px,
  but at 1080 it sits only about 1.6 px from the ES button. It does not
  reach the header's own 12 px group gap until about 1101 px. Stopping the
  clamp at 1080 would leave a near-touching bar between 1077 and 1100, which
  is the same defect, only narrower. The approximate "~1080" leaves room for
  this. The 1-per-8 slope keeps a constant 13.6 px gap through the whole
  range. Above 1104 nothing changes. Record it for Roberto as a precision of
  his "~1080", not a deviation from it.
- **The test guards the token, not the layout.** The design-tokens block
  fails if the clamp is reverted or retuned: I checked by hand that a fixed
  `1.125rem` breaks the slope test and the ≥ 12 px test at 1024–1080. It
  does not catch layout changes such as longer labels, a fifth item, or a
  wider ES/CTA group. The ≥ 12 px check models the bar from the hard-coded
  measured widths (424.3, 246.3), because Vitest cannot lay out text.
  Acceptable for this fix. If the nav copy or items change, those constants
  must be re-measured. Non-blocking note, R1 below.

### F2 · JSON-LD contract and test comment (CONFIRMED)

- `contracts/build-output.md` § 2 now describes the shipped
  `["WebPage","FAQPage"]` shape and the absence of `inLanguage` on the page
  node. It has a dated amendment note and the post-deploy validator
  reminder (SC-005).
- The `tests/seo-output.test.ts` docblock no longer says "plain string" and
  matches the asserted array.

### F3 · evidence (CONFIRMED)

- `impl-51.md` no longer cites the missing round 1 crops; it explains that
  they were deleted.
- The round 2 evidence it cites exists: `header-1024-es-crop.png`,
  `header-1024-en-crop.png` and `header-round2.txt` in `shots51/`.

### Remaining (non-blocking, carried over or new)

- **R1.** The constants in the nav-gap test (424.3 / 246.3) must be
  re-measured whenever the nav labels, the item count or the header end
  group change.
- **R2.** Not measured: a classic, non-overlay scrollbar (Windows) at 1024.
  The implementer's arithmetic gives about 6 px of gap to ES there. Check
  it on a Windows browser after deploy if wanted.
- **Round 1 findings 4–11** stand as notes for the leader, Roberto and Clau.
  None blocks: the DERIVED values to check against the `.pen`, underlined
  links, re-clicking the selected tab resetting the accordion, heading
  order, the small test gaps, the `estado` retirement, the cosmetic comment
  line, the business doc, the GA4 dimensions and Search Console
  re-indexing.
