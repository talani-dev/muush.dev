# Specification Quality Checklist: Site shell — Nav, Footer and mobile menu

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-09-07
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- **Iteration 1** raised two failures, both under *Requirement Completeness*:
  - FR-058 (layout breakpoint) and FR-059 (behaviour above the 1440px frame)
    each carried a `[NEEDS CLARIFICATION]` marker, because no document in
    `docs/business/` states either value. Both were resolved through
    `/speckit-clarify` and encoded into the spec's *Clarifications* section,
    FR-058, FR-059, A-01 and A-02. Both remain flagged **UNVERIFIED against the
    design file** with a named owner and a stated reversal cost, which is the
    honest status — not an unresolved marker.
  - A third item surfaced during clarification: `design-extract.md` § 9.bis
    over-constrains the desktop footer's Top row by 52px
    (`340 + 80 + 912 = 1332` against a `1280` content box). This is a
    discrepancy **in the design file**, not a gap in the spec. Resolved in
    FR-060 and A-16 and flagged for Clau, alongside the off-palette hairline
    of A-06.
- **Content Quality** deliberately admits file paths, token names and section
  references. This repository's specs are read by the implementer agent as much
  as by a stakeholder, and the precedent set by
  `specs/002-primitive-ui-layer/spec.md` is to cite the source document and
  section for every measurement. Naming `design-extract.md § 9.bis` is
  provenance, not an implementation detail.
- Two blocking open decisions (`decisions-open.md` #2 Google Calendar link, #3
  the FAQ page) sit inside this feature's footer. The spec does **not** resolve
  them; FR-039 specifies how their absence renders. They stay open and remain
  Clau's.
- Three further items are flagged for a human at the approval gate rather than
  decided here: A-03 (page background scope), A-08 (two primitives the
  acceptance criteria name that the design does not place in the shell) and
  A-09 (alternate-language metadata, an addition beyond the acceptance
  criteria).
