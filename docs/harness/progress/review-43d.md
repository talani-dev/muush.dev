# Review 43d — feature 43 `m1_site_shell`, reopen 3 (softer grain)

**Verdict: APPROVED**

Scope: reopen 3 only (feature_list.json "REABIERTA 3"; `impl_site_shell.md`
"## Reopened 3 · 2026-11-01 · Softer grain"). Earlier cycles were approved in
review-43, review-43b and review-43c and were not reviewed again.
Status on entry: `reviewing` (CONFIRMED, feature_list.json).

## Findings

### Blocking
None.

### Should-fix
None.

### Nits (non-blocking)
1. `specs/043-site-shell/spec.md:782-792`: the FR-060 amendment comes
   before the FR-059 amendment (`:794-808`), so the FR numbers are out of order
   in the file. FR-060 is unique within spec 043. Spec 003 also has an FR-060
   (`specs/003-site-shell/spec.md:524`), but FR numbers are scoped to each
   spec, so the two do not clash.
2. `specs/043-site-shell/spec.md:778` and `plan.md:241`: the old 0.07 now has
   an inline "(0.03 since …)" note. That is traceable, but the lines are
   longer than the wrap width around them. This is cosmetic.

## What I verified

1. **Only the engine value changed in code (CONFIRMED).**
   - `app/shared/utils/shaderFrame.ts:23`: `SHADER_DEFAULTS = { u_speed: 1, u_flip: 1, u_grain: 0.03 }`.
     The doc comment at `:18-22` says 0.03 overrides the `.glsl` `@default` 0.07 (FR-060).
     The built bundles contain `u_grain:.03` once each (`.output/public/_nuxt/D1y147Ib.js`,
     `storybook-static/assets/ShaderBackground-*.js`).
   - The engine-value tests now pin 0.03: `shaderFrame.test.ts:21` and `:79`,
     `useShaderCanvas.test.ts:295`, and `shaderUniformDefaults.test.ts:101-102`
     (the case "engine base values win over the @default").
   - The `.glsl` `@default` test is unchanged and correct:
     `shaderUniformDefaults.test.ts:44-55` still expects `u_grain: 0.07` from
     `readShaderDefaults(liston)`, which matches `liston.glsl:20` and
     `acanalado.glsl:20` (`@default 0.07`).
   - `shaderFrame.test.ts:85-87`: a preset can still override the value (0.1). This is unchanged.
   - Files modified after review-43c (mtime newer than `review-43c.md`,
     17:31:27): `shaderFrame.ts`, the three tests above, spec/plan/tasks of
     spec 043, `feature_list.json`, and progress docs. `Lockup.vue` and
     `SiteHeader.vue` (17:32:08) are the reopen-2 close-out fixes for
     review-43c nits 1-2, recorded in `history.md:3083`. They come before
     reopen 3 and are comment-only. That they are comment-only is INFERRED
     from their current text, because the tree is uncommitted.
2. **Docs, comments and stories (CONFIRMED).** Repo-wide grep of `app/`,
   `specs/043-site-shell/`, `docs/business/` and `.specify/memory/` for
   grain/grano: every remaining 0.07 refers either to the `.glsl` `@default`
   or to history and carries an "(0.03 since …)" qualifier
   (`spec.md:778`, `plan.md:241`). No story mentions a grain value. The new
   amendments are `spec.md:782-792` (FR-060), `plan.md:251-262` and
   `tasks.md:186-191` (T062, T063, both `[x]`). No task in `tasks.md` is
   unchecked.
3. **The `.glsl` files are unchanged since review-43c (CONFIRMED).** Both have
   mtime 17:22, before review-43c (17:31). `git diff` still shows only the
   reopen-2 change approved in 43c: the `//` divergence comment plus
   `hash(gl_FragCoord.xy)` in `finish()`. SHA-256: acanalado `31b4e58f…47ec`,
   liston `a5f2f242…eb87`.
4. **No regressions (CONFIRMED).** I ran `./init.sh` myself and it exited 0:
   typecheck OK, check OK, tests 133 files / 1924 passed, generate OK
   (16 routes), storybook:build OK. There was no lock contention and I killed
   no process. I did not repeat the implementer's WebGL σ measurement
   (2.48/2.59 vs control 4.85/4.89). It stays the implementer's evidence and
   is UNVERIFIED by me.

## Security

- No out-of-scope code changes for reopen 3. No change to `package.json` or
  `pnpm-lock.yaml`, so no new dependencies. No active git hooks.
- The changed lines have no new URLs, network calls, secrets or credentials.
- No text addressed to agents or reading as injected instructions in the
  changed files, the feature description or the implementer report.
- The implementer reports a local `http.server` (4175) and a headless Chrome
  (9335) that it says it stopped. Artifacts are in `/tmp/grain43r3/`,
  outside the repo. I did not check them.
- Result: clean.
