# Specification Quality Checklist: Hero section

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

Three items deserve a note rather than a tick-and-move-on.

1. **"No implementation details" is honoured in spirit, not literally.** The
   spec names existing components (`Pill`, `BotonPrimario`, `LinkArrow`,
   `SectionGlow`, `SectionBackdrop`, `DotGrid`), token names and CSS property
   names. In this repository those are not implementation choices being made
   here — they are **frozen contracts from `done` features** and the
   constitution's own vocabulary, and half the feature is a statement about
   which of them must not change. Removing the names would make FR-030,
   FR-018 and FR-025 unverifiable. The same latitude was taken by
   `specs/006-…/spec.md` and `specs/008-…/spec.md` and passed review both
   times.

2. **Zero `[NEEDS CLARIFICATION]` markers, but two `UNVERIFIED` assumptions.**
   A-02 (the nav's height, feeding the section's top padding) and A-04 (the
   mobile glow offsets) are values nobody has read from the design file. They
   are not clarification markers because each has a stated derivation, a
   named owner and a one-token reversal — the treatment `rules.md` §§ R32 and
   R38 prescribe. Both are also raised as questions for the leader in the
   spec's *Open questions* section, and answering either is cheaper than
   implementing around it.

3. **Two success criteria depend on a measurement method rather than a test
   run.** SC-006 (paint order on the page) and SC-009 (the page scrolls with
   nothing injected) cannot be asserted by Vitest — they are properties of a
   rendered document. A-12 pins the method to the one `rules.md` § R44
   records, so "verified" means the same thing here as it did for feature 8.
