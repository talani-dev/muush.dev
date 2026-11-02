# Review 43c: feature 43 `m1_site_shell`, reopen 2 (static grain + header isotipo)

**Verdict: APPROVED**

Reviewer run on 2026-11-01, branch `feat/v2-site-shell`, nothing committed.
Scope: only what changed since `review-43b.md`. These are the files with mtime
after review-43b: both shaders, `SiteHeader.{vue,test.ts,stories.ts}`,
`backgroundPresets.{ts,test.ts}`, `tests/static-output.test.ts`, spec 042
`plan.md` / `research.md` / `tasks.md`, spec 043 `spec.md` / `plan.md` /
`tasks.md`, and the harness docs. The feature's status was `reviewing` before
the review started.

## Findings

### Blocking

None.

### Should-fix (non-blocking)

None.

### Nits (non-blocking, may be folded into a later feature)

1. `app/features/shell/ui/SiteHeader.vue:24`: the doc comment still describes
   the desktop slots as "(lockup | link bar | language + CTA …)". After FR-059
   the first slot holds the isotipo. The template comment at `:111-113` is
   correct.
2. `app/shared/ui/Lockup.vue:8`: "`isotipo` renders the 40 × 22 mark alone
   (the mobile nav)". The isotipo form is now used by the whole header at
   every width. This file was not touched in this cycle.
3. `specs/043-site-shell/plan.md`: there is no "Amendment" note for reopen 2.
   `spec.md:763-797` and `tasks.md:178-184` carry it, so traceability holds.
4. Acceptance item 4 gives "muush.dev — Inicio" as an example ("p. ej.") of
   the accessible name. The implementer reused the existing
   `shell.nav.home` = "Inicio de muush" / "muush home" (`es.json:270`,
   `en.json:270`). This meets the item, but Roberto may want to confirm the
   wording. If he wants a change, it is two values in the locale files.
5. Observation outside this reopen's scope: on `/es` and `/en` the logo link
   also gets `aria-current="page"`, from NuxtLink's exact-active state
   (`.output/public/es/index.html`), alongside the "Inicio" item. This was
   already present in the 43b build and nothing here changed it.

## What I verified

### 1. Shader diffs are confined to the grain line plus its comment (CONFIRMED)

- `git diff` on `app/assets/shaders/liston.glsl` and `acanalado.glsl`: one
  hunk each, 5 lines added and 1 removed (`--numstat` 5/1).
- `diff` against `docs/handoff/muush-1.0/shaders/m1-{liston,acanalado}.glsl`
  gives exactly `79c79,83` for each file. Line 79 becomes 79-82, a `//`
  comment recording the divergence (Roberto, 2026-11-01), plus line 83, the
  `finish()` line. Every other byte matches the handoff.
- Inside `finish()`, the only change is
  `hash(gl_FragCoord.xy+fract(u_time*7.0)*91.0)` →
  `hash(gl_FragCoord.xy)`. `u_time` no longer appears on that line, and
  `*u_grain` is kept.
- The handoff shaders are unchanged (`git diff HEAD` on them is empty).
- `u_grain` stays at 0.07: `app/shared/utils/shaderFrame.ts:19`
  `SHADER_DEFAULTS`, pinned by `shaderFrame.test.ts:21`. No preset overrides
  `u_grain`.
- The comment is a `//` line comment, so `readShaderDefaults` (which reads
  only `/** */` blocks) is unaffected. The browser compile succeeds (see
  section 5).

### 2. Tests pin the change (CONFIRMED)

- `app/shared/data/backgroundPresets.test.ts:220-238` has one case per
  shader. Each reads the real `.glsl` and isolates the `finish()` line. It
  asserts that the grain term `col+=(hash(X)-0.5)*u_grain;` is present, that
  `X === 'gl_FragCoord.xy'`, and that the line does not contain `u_time`.
- The regex `[^()]*` does not match the handoff's nested argument, so the
  test would fail if the file were reverted.

### 3. Byte-identical claims updated (CONFIRMED)

- `app/shared/data/backgroundPresets.ts:203-209`: the comment now names the
  divergence and FR-057.
- `specs/042-m1-visual-foundation/research.md:232-237`: a dated R8
  amendment.
- `specs/042-m1-visual-foundation/plan.md:117-118`: "copied verbatim" was
  replaced.
- `specs/042-m1-visual-foundation/tasks.md:25`: T001 records that `cmp` now
  reports one deliberate difference.
- I grepped for byte, verbatim and identical across `specs/`, `docs/business`,
  `docs/handoff/muush-1.0/README.md`, `.specify/memory`, `app/` and `tests/`.
  No claim about the shaders remains unqualified. R8's original sentence
  (`research.md:219`) stays as history, directly followed by the amendment.
  No test compared the shaders with the handoff.

### 4. Header logo is the isotipo only (CONFIRMED)

- `app/features/shell/ui/SiteHeader.vue:106-115`: a single
  `<Lockup form="isotipo" />` inside the home `NuxtLink`, with
  `:aria-label="homeLabel"`. `homeLabel` comes from `labels.home` in
  `app/layouts/default.vue:105,120,151`, which is `shell.nav.home`, present
  in ES and EN. No i18n file changed in this cycle.
- The footers are unchanged: `SiteFooter.vue:73` and `MobileFooter.vue:60`
  still use the full `<Lockup />`. Their mtime predates the reopen (14:49).
- Tests:
  - `SiteHeader.test.ts:98-108`: exactly one Lockup, `form="isotipo"`, and
    no Wordmark.
  - `tests/static-output.test.ts:347-369`: on `/es`, `/en`, `/es/nosotros`
    and `/en/about`, the header logo link has the i18n `aria-label` and an
    `<svg>`, and no `text-marca`. The footer still has `text-marca`.
- Stories: the `SiteHeader.stories.ts:7-10` doc comment is updated. The
  existing ES/EN × 1440/390 stories render the new header.
- Generated HTML: the `/es` logo link is
  `aria-label="Inicio de muush"`, with no wordmark in the header.
- Spec numbering: `spec.md` adds FR-057 (`:772`), FR-058 (`:777`) and FR-059
  (`:788`), directly after FR-056 (`:758`). An FR-id duplicate scan returns
  nothing. FR-059 states which parts of FR-001, FR-005, US1 scenario 1 and
  extract § 2 it supersedes.
- Tasks: T059-T061 are `[x]`, and 0 tasks are left unchecked.

### 5. No regressions, browser re-check (CONFIRMED, visual)

- **Setup:** I captured with my own headless Chrome (SwiftShader ANGLE)
  against locally served `storybook-static` and `.output/public`, bound to
  127.0.0.1. I stopped both servers afterwards.
- **`shared-ui-shaderbackground--home-hero`, 1440 × 900:** the listón
  draws, rising red to steel from the lower left to the right. Fine static
  grain is visible.
- **`--how-we-work`, 1440 × 900:** the acanalado ribs are present, with
  vertical fluting in the red and steel bands.
- **`/es/` at 1440:** the header shows the isotipo alone at the left, the
  "Inicio · Servicios · Nosotros" link bar centred, and ES plus the CTA at the
  right. There is no wordmark.
- **`/en/` at 390:** the mobile bar shows the isotipo alone. My plain
  `--window-size` capture clips the right side, because headless Chrome
  enforces a minimum window width. That is an artifact of my capture, not
  evidence of overflow. The implementer's CDP device-metrics check reports
  `scrollWidth` equal to the viewport at 390 and 1440 (UNVERIFIED by me).
- **Not re-measured by me:** the frame-to-frame grain metric. I rely on the
  implementer's table (high-pass difference 6.3 → 0.3-0.4) and the unit
  test.

### 6. Constitution v2.1.2 (CONFIRMED)

- The template change adds no hex or px literals, and `token-literals`
  passes.
- No version markers in identifiers.
- `SiteHeader.vue` is 156 lines, under 200.
- No server route. No new page, so the locale-parity rule is not triggered.
- No new dependency.
- Imports use the `@/` alias.

### 7. `./init.sh` (CONFIRMED)

I ran it myself. Nothing held the lock, and the first run exited **0**:
typecheck OK, check OK, `pnpm test` 133 files / 1924 tests passed, generate
OK (16 routes), and `storybook:build` OK.

## Security

- **Scope:** the edited files are limited to the feature's scope. They are
  the two shaders, the header component with its test and story, the preset
  comment and test, `static-output.test.ts`, and spec and harness docs. No
  new untracked files appeared after review-43b.
- **Packages:** `package.json` (mtime Oct 20) and `pnpm-lock.yaml` (mtime
  Oct 15) are untouched, and `git diff HEAD` on both is empty.
- **No external surface:** the changed code and comments contain no URLs,
  network calls, `fetch`, `eval`, hooks, secrets or credentials.
- **No injected instructions:** no agent-directed or instruction-like text
  appears in the changed files or the implementer's report.
- **My own processes:** the processes I started (two `python3 -m http.server`
  instances on 4391 and 4392, bound to 127.0.0.1, and headless Chrome) were
  all stopped. I killed no process I did not start.
