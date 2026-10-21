# Feature 40 · html_edge_cache_s_maxage — review

Date: 2026-10-20 · Agent: reviewer · `sdd: false`, so the review is against `feature_list.json` id 40 (`description` + `acceptance`) and `docs/harness/CHECKPOINTS.md` where it applies. Status was `reviewing` when the review started (CONFIRMED). No status change, commit, deploy or aws command.

## Verdict: APPROVED

The post-deploy acceptance item is PENDING DEPLOY. It is not a reason to reject.

## Acceptance

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | HTML upload step uses `public,max-age=0,s-maxage=300,must-revalidate`; name and comment explain browser vs CDN, within max_ttl 3600 | PASS (CONFIRMED) | Parsed YAML: deploy step 3 is `Upload HTML/payload/other files (browser revalidates; CDN keeps 5 min)` with `--cache-control "public,max-age=0,s-maxage=300,must-revalidate"`, an exact match. The comment says `max-age=0` + `must-revalidate` apply to the browser and `s-maxage=300` only to shared caches, within min 0 / default 300 / max_ttl 3600. |
| 2 | `_nuxt/` + `_fonts/` step unchanged | PASS (CONFIRMED) | No diff hunk touches it. Step 2 still has `public,max-age=31536000,immutable` and the same include/exclude. |
| 3 | Invalidation is still last, after both uploads and `--delete`, on `/*`, with a comment | PASS (CONFIRMED) | Deploy step order: 2 hashed upload, 3 HTML upload, 4 `--delete`, 5 `Invalidate CloudFront cache` `--paths "/*"`. The new comment says the step must stay last and is what makes a deploy visible at once despite s-maxage. |
| 4 | Contract § 4.5 and § 5 record the decision; Stage 2 unchanged (`private, no-store`, not cached); the per-page miss is no longer per visit | PASS (CONFIRMED) | `specs/036-not-found-page/contracts/edge-not-found.md` § 4.5 has a new paragraph covering the header, the browser/CDN split and the drop to about one miss per 5 min per path per edge (marked INFERRED). It has a "Stage 2 is unchanged" bullet: 404s stay `private, no-store` and are not cached, and the cost for missing URLs is unchanged. The § 5 Stage 1 `cache-control` cell now cites the new value; the Stage 2 cell is still `private, no-store`. max_ttl 3600 is attributed to feature 40, not marked CONFIRMED, which is correct. |
| 5 | No app/ or tests/ change; typecheck, lint, test and generate pass | PASS (CONFIRMED) | `git status`/`git diff -- app tests` is empty. `./init.sh` exits 0: typecheck OK, check OK, tests 98 files / 1395 passed, generate OK, storybook:build OK. |
| 6 | Post-deploy verification (head-object, two curls with a hit and `age:`, text change visible at once) | PENDING DEPLOY | This needs a production deploy approved by Roberto. Not run (no aws/curl to production). |

## Checkpoints (where they apply)

- C1: PASS. Base files present; `./init.sh` exits 0.
- C2: PASS. Exactly one feature is active (40, `reviewing`). `current.md` describes the active session.
- C3, C4, C8: N/A for the code. No app/, tests/, i18n or alias change. `nitro.preset` is not touched and no server route was added.
- C5: PASS. The tests, generate and storybook build are green.
- C6: N/A until the leader closes the session (history.md entry, final status).
- C7: N/A (`sdd: false`).
- YAML: `yaml.safe_load` parses `.github/workflows/deploy.yml` without error.

## Notes (non-blocking)

- The first `./init.sh` run failed with "Another Nuxt build is already running (PID 6355)" in test global-setup and generate. That was a concurrent Nuxt process outside this review and is an environment problem, not caused by the change. After it ended, a clean rerun exited 0.
- The implementer's open point stands: contract § 7 V-8 ("same `cache-control` as before") will read the new header after deploy. The leader may want to reword V-8 when running the post-deploy checks.
- The 404 body lag after a deploy noted in § 4.5 (up to 300 s, from the Lambda's in-memory copy) existed before this feature. It is documented correctly and is not a regression.
