# Specification Quality Checklist: Primitive UI layer

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-09-06
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

### Validation pass 1 → issues found and fixed

1. **Implementation detail leak.** The first draft named the framework, the
   file extension and the catalogue product throughout the requirements. All
   of it moved out: the requirements now say "component", "story", "component
   catalogue" and "browsing context". The stack lives in `plan.md`, where it
   belongs. Two references remain deliberately and are justified below.
2. **Unmeasurable success criteria.** "Matches the design" was replaced with
   counted outcomes (19 variant renderings, 9 catalogue entries, 3 gradient
   stops, 0 literals, 0 stroke values, 0 bytes of runtime script).
3. **Missing edge cases.** Added glass-on-glass nesting, the empty panel, the
   wrapping pill label, the long-locale button label, the browser that cannot
   animate the ring, the glyph on a light surface, and the radar inside the
   mobile services ladder.

### Deliberate, justified deviations

- **Two file paths appear in requirements** (FR-048 and FR-043/FR-044,
  referring to `app/shared/ui/GlassPanel.stories.ts` and
  `app/assets/social/`). Removing them would make the requirement
  unverifiable: FR-048 is specifically "delete this placeholder file", and
  FR-043 is specifically "consume these three files without moving them". A
  path is the only unambiguous way to state either. FR-001 and FR-002 name
  directories for the same reason — the scope boundary *is* a directory
  boundary.
- **Measurements are quoted in requirements** (opacities, blurs, radii,
  diameters, gradient stops). For a design-system layer these are the business
  requirements, not implementation details. Every one cites its section of
  `design-extract.md`. Same precedent as the feature-1 spec.

### No [NEEDS CLARIFICATION] markers — and why that is not a shortcut

Four values are genuinely underdetermined in `design-extract.md`: the
LinkArrow hover affordance (documented as an either/or), the hero button's
mobile padding (two values recorded), the social glyph size (an 18px
placeholder letter, not the final art), and the focus-indicator geometry (no
frame exists). None is marked, because each already has a resolution recorded
in a *different* business document (`ui-map.md`, `rules.md`,
`component-contracts.md`) or in the tokens feature 1 shipped. Each is written
up in Assumptions A-03 through A-07 with its source and its reversal cost, and
A-07 is explicitly labelled UNVERIFIED against the design file.

**No measurement was invented.** Where the design file is silent and no other
document resolves it, the spec says so rather than supplying a number.

### Items the approval gate should look at

- **A-02 (LED on touch devices)** carries an open decision owned by Clau
  (`decisions-open.md` #8). The pre-migration default is carried forward
  unchanged and flagged, not re-decided.
- **A-12 / FR-051 (component tests)** is an addition beyond the originating
  task description, made to satisfy Constitution Article X layer 2. It is the
  only reason this feature touches a file outside `app/shared/ui/`. Trim it
  here if the intent was Storybook-only.
- **A-07 (focus-indicator geometry)** is the one value with no design source
  at all.
