# Review — feature 41 `v2_foundation_docs`

**Verdict: REJECTED**

Reviewer run: 2026-10-31, branch `docs/v2-foundation` (uncommitted working tree;
`muush-v2` = 2475b8f is an ancestor of HEAD). `"sdd": false`, so the review is
against the feature's `acceptance` array, `current.md` and
`v2-foundation-proposal.md`. I did not open the `.pen`. I took the copy in
`muush-1.0.md` as extracted by the leader.

## Blocking (must fix before APPROVED)

### B1 — The amended Development Workflow contradicts the two agent definitions that act on it. The Sync Impact Report does not list them.

- The constitution was changed at `.specify/memory/constitution.md:337`. It now says design
  values come from the `.pen` via the leader, and a subagent missing a value "asks the
  leader instead of falling back to `docs/business/`".
- `.claude/agents/implementer.md:36` still says "`docs/business/landing/design-extract.md` is
  the source of truth for every measurement".
- `.claude/agents/implementer.md:43` says "Read `design-extract.md` for any
  geometry/color/spacing/type value".
- `.claude/agents/implementer.md:48` says "Colors and typography come from
  `docs/business/branding.md`".
- `.claude/agents/implementer.md:51` says "The extract wins" about design-file disagreements.
  That is also the opposite of R32.
- `.claude/agents/spec_author.md:24` says "`design-extract.md` holds every measurement ...
  that is your source of truth".
- Both `design-extract.md` and `branding.md` now carry the v1 notice. So for features
  42–48 the spec_author and implementer would be told to take values from documents
  that describe a design that has been withdrawn. They would also be told to use v1
  tokens, which constitution Art. VII now forbids in new code.
- `.claude/skills/speckit-constitution/SKILL.md` step 4 requires reading
  "agent-specific guidance files" and updating references to changed principles.
  The Sync Impact Report (`constitution.md:21-25`) reviewed only `.specify/templates/*`.
  Acceptance item 1 ("el Sync Impact Report lista los templates afectados") is therefore
  only met literally. The affected guidance files are not listed.
- Fix (outside `app/`/`tests/`, so the leader may edit):
  - Update the design-source paragraphs in `implementer.md` and `spec_author.md` to match the
    amended Development Workflow: values come from the leader's task, with `muush-1.0.md` and
    `docs/handoff/muush-1.0/` for v2, and v1 docs only for v1.
  - Add both files to the 2.1.0 Sync Impact Report as updated.

## Should fix (not blocking on their own; cheap to fix in the same pass)

- S1 — The feature range is out of date in AGENTS.md. `AGENTS.md:32` ("Before any v2 feature (41–47)") and
  `AGENTS.md:61` ("§ 3.1 ... features 41–47") leave out feature 48. `muush-1.0.md:7`, the
  four v1 notices and `feature_list.json` all say 41–48.
- S2 — Every v2 description shares the same boilerplate. Feature 47's copy contradicts the
  feature itself. `feature_list.json:1020` says "Rama: sale de `muush-v2` y se mergea de
  vuelta a `muush-v2`, nunca a master". But the feature's title (`:1019`), its own RELEASE
  text, and `AGENTS.md:65` say feature 47 is the one that merges `muush-v2` into `master`.
  Reword the branch sentence for 47 only.
- S3 — One acceptance criterion in feature 43 is out of date. `feature_list.json:924` says the legal
  links point "a lo que Roberto decida (ver pending-decisions)". Roberto has already decided:
  the legal pages are feature 48, and feature 48 at `:1000` says the footer links point to
  them. `pending-decisions.md` has no legal entry (grep: none). Point the criterion at
  feature 48's routes. If the routes don't exist yet when 43 is built, also say what 43
  should do in the meantime.
- S4 — Leader log hygiene in `docs/harness/progress/current.md`:
  - Plan step 5 is still marked ⏸ "waiting for Roberto" (`:15`), but A and B were approved.
  - The log entry about privacy pages and cursor is duplicated (`:25` and `:28`).
  - `:24` says "features compressed to 41–47", and 48 came later.
  - `:33` points to `docs/harness/progress/muush-1.0-draft.md`, which no longer exists.
- S5 — `v2-foundation-proposal.md:85`: the open question C1 ("Falta: ¿entran en v2 y quién da el texto
  legal?") was answered by feature 48 and the muush-1.0.md § 1/§ 5 entries. Mark it resolved.

## Advisory (no action required for 41)

- A1 — The feature 41 description (`feature_list.json:884`, item 2) still describes the original plan
  to rewrite branding/content/ui-map. Roberto then approved the "new muush-1.0.md + v1 notice"
  strategy (proposal B). Acceptance does not depend on this. A one-line update would avoid
  confusion later.
- A2 — `docs/business/rules.md:675` (R32) still says design-extract.md "sigue siendo la referencia
  de medidas que se lee todos los días". Proposal B3, approved by Roberto, kept rules.md
  unchanged, and the constitution supersedes it. Since `docs/business/` is human-owned,
  list this for Roberto rather than editing it.
- A3 — The amended constitution text at `:340` says subagents must not "fall back to
  `docs/business/`". Read literally, that conflicts with `muush-1.0.md`, which lives in
  `docs/business/` and is the authoritative v2 copy and decisions document. The intent
  (visual values) is clear. The B1 fix to the agent files should spell out that the
  copy/decisions in `muush-1.0.md` are still read.
- A4 — `docs/handoff/muush-1.0/componentes/tokens.css:8` has a Google Fonts `@import`. Feature 42
  correctly forbids copying it. The handoff is excluded from Biome and is not imported by the app.

## Verified (CONFIRMED)

- Acceptance 1 (partial, see B1): the amendment was applied and Roberto's approval is recorded
  (SIR `:7-8`, proposal header). The version moved 2.0.1 → 2.1.0, MINOR is justified,
  and the SIR version line, footer `**Version**: 2.1.0` and `**Last Amended**: 2026-10-31`
  (`constitution.md:361`) are consistent. Ratified date is unchanged. The previous report is kept.
- Acceptance 2: `docs/business/` changes are limited to the new `muush-1.0.md` (header records Roberto's
  approval) and an identical four-line v1 notice at the top of `branding.md`,
  `landing/content.md`, `landing/design-extract.md` and `landing/ui-map.md`. That matches
  proposal B1/B2. No other `docs/business/` file changed. Whether Roberto approved before
  the writes is taken from the leader's statement and `current.md`; I cannot check it
  independently (UNVERIFIED).
- Acceptance 3: AGENTS.md names `docs/handoff/muush-1.0/` as reference-only (`:32`), and
  states the 390/1440 anchor rule (`:68-72`), the v2 branch flow and the no-per-feature-bump policy.
- Acceptance 4: `git status`/`git diff HEAD -- app tests` are empty before and after the run.
  `./init.sh` exits 0, with check, typecheck, tests, generate and storybook:build all OK.
- Cross-doc consistency (constitution, AGENTS.md, muush-1.0.md, feature_list.json):
  - Responsive anchors: same rule in all four.
  - Bump: one 2.0.0 bump in feature 47, no per-feature bumps.
  - Branch flow: consistent except S2.
  - Preguntas at /es/preguntas ↔ /en/faq and indexed: in 46 and muush-1.0 § 1.
  - Website field not built and backend unchanged: in 45 and muush-1.0 § 1/§ 4.6.
  - Privacy checkbox gates submit and is not sent: in 45 and muush-1.0.
  - Cursor/spotlight kept: in 42, 47 and muush-1.0. Features 8 and 34 stay `done`.
  - Legal pages: in 48 and muush-1.0 § 1/§ 5.
- feature_list.json:
  - Only features 15, 18 and 19 changed (status `blocked` → `superseded`, with the replacement
    named in each description).
  - 41–48 were added.
  - `superseded` was added to `rules.valid_status` with `superseded_means`.
  - Every status is valid, and only feature 41 is in `reviewing`.
  - Dependency chain: 41→42→43→44→45→46; 48 depends on 43; 47 depends on 46 and 48.
- Quality gates:
  - `.husky/pre-commit` only adds `muush-v2` to `PROTECTED_BRANCHES`, which skips just
    the branch-name check. Biome and typecheck still run on it. `pre-push` and
    `commit-msg` are unchanged.
  - `biome.json` only excludes `docs/handoff` (third-party reference code).
  - No other gate is weakened.
- `docs/handoff/muush-1.0/`: 16 reference files (JS/CSS/GLSL/HTML/webp). No credentials found.
  The only external URLs are Google Fonts, cal.com and wa.me.

## To get to APPROVED

Fix B1 (agent files and Sync Impact Report). Fixing S1–S5 is strongly recommended in the
same pass. Then send the feature back to `reviewing` for another reviewer run.

## Re-review 2

**Verdict: APPROVED**

Reviewer run 2: 2026-10-31, on the current uncommitted tree of `docs/v2-foundation`.
Feature 41 is the only feature in `reviewing`. Same scope and rules as run 1. No files edited.

### Run-1 findings: status

- B1, fixed (CONFIRMED). Both agent files no longer send agents to the v1 docs for v2 values.
  - `.claude/agents/implementer.md:36-60`: values come from the leader's task, the spec,
    `muush-1.0.md` and the handoff (as reference). If a value is missing, the agent stops
    instead of falling back to v1. New code may not use v1 tokens. The responsive anchors
    rule is restated.
  - `.claude/agents/spec_author.md:22-35`: rewritten to match.
  - The 2.1.0 Sync Impact Report now has an "Agent guidance files reviewed" block listing
    `implementer.md`, `spec_author.md` and AGENTS.md.
  - Version line, footer (`2.1.0`, Last Amended `2026-10-31`) and the SIR agree.
- A3, fixed. The Development Workflow now says "the v1 design documents in `docs/business/`".
  The SIR note says the copy and decisions in `muush-1.0.md` are still read.
- S1, fixed. `AGENTS.md:32` and `:61` say 41–48.
- S2, fixed. The feature 47 description says it is the only feature that merges `muush-v2`
  into master, with Roberto's explicit approval. That matches `AGENTS.md:63-67`.
- S3, fixed. The feature 43 criterion points the legal links at feature 48's routes. If those
  routes don't exist yet, the links show as plain text.
- S4, fixed. `current.md` plan and log are current. The duplicate entry and the dangling
  draft path are gone.
  - The first log entry still says "compressed to 41–47". That is a historical entry, and the
    next entry records feature 48, so it is acceptable.
- S5, fixed. `v2-foundation-proposal.md:85` C1 is resolved, and it no longer blocks anything.
- A1, fixed. The feature 41 description now matches the strategy Roberto approved.
- A2 is still open for Roberto, as recorded in `current.md`: `rules.md:675` R32 is human-owned
  and was not edited. This does not block the feature, because the constitution overrides it.

### New findings

- N1 (cosmetic, non-blocking): `.claude/agents/implementer.md` uses the number "5." twice, at
  `:59` (responsive anchors) and `:62` (presentational pieces). Renumber the second one to 6
  when convenient.
- No new contradictions between the constitution, AGENTS.md, both agent files,
  `muush-1.0.md` and `feature_list.json`. I checked the branch flow, bump policy, responsive
  anchors, Preguntas indexing, removed website field, privacy checkbox not sent, cursor and
  spotlight kept, and legal pages.

### Acceptance (feature 41)

1. Amendment approved and applied, version bumped, Sync Impact Report lists templates and
   affected guidance files: met.
2. `docs/business/` changes are limited to `muush-1.0.md` and the four v1 notices, approval
   recorded: met. That the approval came before the writes is still UNVERIFIED, for the reason
   given in run 1.
3. AGENTS.md names `docs/handoff/muush-1.0/` and the responsive anchor rule: met.
4. No `app/` or `tests/` changes (`git status` empty). `./init.sh` exited 0, with check,
   typecheck, test, generate and storybook:build all OK: met.
   - My first rerun failed `pnpm test` and `pnpm generate` with "Another Nuxt build is
     already running". The lock was held by another `init.sh` that was running at the same
     time, so this was not a code fault.
   - After that run finished, a clean rerun exited 0.

### Quality gates

Unchanged from run 1. The only exemption is `muush-v2` from the branch-name check in
`.husky/pre-commit`, and Biome and typecheck still run there. `docs/handoff` is excluded
from Biome. No other gate was weakened.
