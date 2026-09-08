# review · 7 · stale_docs_and_dead_glow_code (2026-09-08)

**APPROVED**

Status was `reviewing` at review start (only feature in that state — C2 holds).

## Gates
`./init.sh` → **exit 0**. **30 test files / 373 tests** passed — baseline exact.
check, typecheck, test, generate, storybook:build all green.

## Comment-only, proved mechanically
Stripped all `/* */`, `//` and `<!-- -->` content from HEAD vs working tree for
all five files and compared remaining code lines:
SectionGlow.vue 80=80, SectionGlow.stories.ts 118=118, SectionGlow.test.ts
170=170, Wordmark.stories.ts 27=27 — **IDENTICAL**. global.css differs by
exactly `html { background-color: var(--ink-500) }`, which belongs to the
white-band feature, not this one; feature 7's global.css edit is the single
word "22 degradados"→"21 degradados". No assertion, import, `fills`, `sizes`,
variant or token changed anywhere.

## Survivors confirmed independently
`'920'` GlowSize (SectionGlow.vue:67 + map:115), `--spacing-glow-920`
(global.css:690), `--radius-control` (global.css:797, guarded by
BotonPrimario.test.ts:113). The every-declared-token-is-reachable assertion
(SectionGlow.test.ts:178-190) is untouched and green (32/32) — it is the guard
that reddens if `'920'` is dropped while its token stands.

## Output unchanged
Emitted CSS re-hashes to `entry.DbyTAhZp.css`, the pre-edit name. The hash is
content-derived, so an identical hash is direct proof the comment never reaches
the stylesheet. 35 files in `.output/public`; zero emitted CSS comments; none
of the changed comment text appears anywhere under `.output/public`. 12 routes
prerendered (es/en + nosotros/about + 404).

## Wordmark replacement is true, not merely different
`public/fonts/` does not exist at all; `@nuxt/fonts` is a registered module
self-hosting into `.output/public/_fonts`; `.storybook/preview-head.html`
declares Poppins 600 + Instrument Sans 400/500/600 for the catalogue, which
runs Vite outside Nuxt. All three retired claims are gone.

## Stories still render every variant
`allFills` = 12, `allSizes` = 13 — unchanged.

## On the authorised deviation (acceptance #7)
**I agree with your reading.** The criterion names its own object in the same
sentence — "no se toca ninguna variante ni ningún token de su namespace
cerrado (§ R36)". It protects variants and tokens, not bytes; the edit touched
neither, and the assertion is intact. A literal "zero bytes" reading would
have forced this feature to preserve a false count as the price of retiring
false counts, which is self-defeating. The moved second line was load-bearing:
"wrong 21 times" was arithmetic derived from the false 22.

## Noted, not blocking
Acceptance #1's literal wording ("no longer says '22'") is still technically
unmet: SectionGlow.vue:27 reads "**Why 21 and not § 10's 22**". Same
intent-over-literal call as #7 — it is an attributed reference to the stale
document's number, immediately corrected, not a stale claim. "12 on Landing"
is gone repo-wide. Flagging for transparency, not as a defect.
`design-extract.md` § 10 and the rules.md preamble remain out of scope
(human-owned, logged in pending-decisions.md).
