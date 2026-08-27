# SDD process (spec-kit)

## Flow

pending → [spec_author] → spec_ready → ⏸ HUMAN → in_progress → [implementer] → reviewing → [reviewer] → done

`spec_author` is a **wrapper** around spec-kit's skills — it never writes
`spec.md`/`plan.md`/`tasks.md` by hand.

## Order: specify → plan → tasks (mandatory)

1. `/speckit-specify` — the "what" (requirements, acceptance criteria)
2. `/speckit-clarify` — only if `spec.md` has `[NEEDS CLARIFICATION]`
3. `/speckit-plan` — the "how" (architecture + Phase -1 gates from the
   constitution)
4. `/speckit-tasks` — executable breakdown

Inverting this order means planning architecture for requirements that
aren't written yet — never do it.

## Single human gate (not multiple)

There is exactly **one** pause point: after `tasks.md` exists. The human
reviews the full package (spec + plan + tasks) in one pass. Do not stop
after `specify` or after `plan` separately — that produces 3 interruptions
per feature instead of 1.

## Structure of a spec

```
specs/
└── 001-feature-name/
    ├── spec.md          # Requirements and acceptance criteria (the "what")
    ├── plan.md          # Technical architecture + Phase -1 gates
    ├── tasks.md          # Atomic tasks, [P] for parallelizable
    ├── data-model.md    # If the feature has structured content/data
    └── research.md      # Library/API context, if relevant
```

Numbers are sequential (`001-`, `002-`, …) — spec-kit assigns them
automatically. Never create a spec folder by hand.

## Phase -1 Gates in plan.md

spec-kit generates gates in `plan.md` derived from
`.specify/memory/constitution.md`. Example:

```markdown
### Phase -1: Pre-Implementation Gates

#### Static-Site Purity (Article I — NON-NEGOTIABLE)
- [ ] Does the solution avoid any server route or backend dependency?

#### i18n Parity (Article III — NON-NEGOTIABLE)
- [ ] Does the feature ship both an /es/ and an /en/ version?

#### Design Tokens (Article IV)
- [ ] Does every color/spacing value go through the CSS custom properties?
```

`reviewer` MUST verify every Phase -1 gate is checked `[x]`.

## Human approval gate

1. `spec_author` finishes → status = `spec_ready` → PAUSE
2. Human reads `specs/<num>-<name>/` completely
3. Responds "approved" or requests concrete changes
4. Only then does `leader` move the status to `in_progress`
