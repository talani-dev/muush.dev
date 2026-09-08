# impl · 7 · stale_docs_and_dead_glow_code (2026-09-08)

Comment-only cleanup across five files: `git diff -U0` filtered to non-comment
lines returns **nothing** for all five. `'920'`, `--spacing-glow-920`
(global.css:690) and `--radius-control` (global.css:797) verified still present;
no assertion, import, variant list or token was touched anywhere.

- `SectionGlow.vue` — counts → 21 site-wide / 11 Landing / 10 Nosotros, plus the
  reason it is not § 10's 22: `Glow origen` is nested inside the Propósito
  desktop frame, not the page-level background group (`.pen`, leader, 2026-09-08
  · §§ R29, R32). The `'920'` doc line now says it is unconsumed, not dead code.
- `SectionGlow.stories.ts` — same counts in the meta doc and `Default`; `Sizes`
  records that `920` is the one diameter no page-level background uses. The 12
  fills and 13 sizes are unchanged.
- `Wordmark.stories.ts` — the three false claims replaced: Poppins 600 is real
  type; `@nuxt/fonts` self-hosts it on the site and `preview-head.html` declares
  it for the catalogue, which sees no Nuxt module.
- `SectionGlow.test.ts:237` and `global.css:312` — the last two "22"s, fixed on
  the leader's explicit instruction: acceptance #7's "sin modificaciones"
  protects the every-token-is-reachable **assertion**, not a false comment.

`./init.sh` → **exit 0** (twice, before and after the last two fixes): check,
typecheck, test (**30 files / 373 tests**, baseline unchanged), generate,
storybook:build. **Output unchanged** — `.output/public` snapshotted before any
edit and diffed after: all 35 files byte-identical once the per-build UUID and
`prerenderedAt` epoch are normalized (both differ on any two runs). CSS keeps its
hash `entry.DbyTAhZp.css`, so the `global.css` comment never reaches the emitted
stylesheet. No stale background count remains in `app/`. Status left
`in_progress`; nothing committed.
