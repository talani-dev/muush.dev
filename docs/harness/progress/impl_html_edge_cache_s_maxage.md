# Feature 40 · html_edge_cache_s_maxage — implementation report

Date: 2026-10-20 · Agent: implementer · Status left at `in_progress` (not changed). No commit, no deploy, no aws command, muush-foundation not touched.

## Files changed

1. `.github/workflows/deploy.yml`
   - Step renamed `Upload HTML/payload/other files (revalidate on every request)` → `Upload HTML/payload/other files (browser revalidates; CDN keeps 5 min)`.
   - `--cache-control "public,max-age=0,must-revalidate"` → `--cache-control "public,max-age=0,s-maxage=300,must-revalidate"`.
   - Comment added: `max-age=0` + `must-revalidate` govern the browser; `s-maxage=300` is read only by shared caches, inside the html cache policy (min_ttl 0 / default 300 / max_ttl 3600); without it every visit was an S3 miss and would run the Stage 2 Lambda@Edge origin-response (edge-not-found.md § 4); deploys visible at once via the `/*` invalidation.
   - `Invalidate CloudFront cache`: comment added (must stay last, after both uploads and `--delete`, covering `/*`; it is what makes a deploy visible at once despite s-maxage). Command unchanged, still last, still `--paths "/*"`.
   - `_nuxt/`/`_fonts/` step (`public,max-age=31536000,immutable`) untouched. No other "revalidate on every request" wording remained in the file.
   - YAML parses (python yaml.safe_load).
2. `specs/036-not-found-page/contracts/edge-not-found.md`
   - § 4.5: new paragraph after "Accepted cost" recording the decision (Roberto, 2026-10-20, feature 40): header value (CONFIRMED in deploy.yml); page miss ≈ once per 5 min per path per edge cache (INFERRED); `/*` invalidation makes deploys visible at once; Stage 2 unchanged (404s `private, no-store`, not cached; Accepted cost unchanged); pre-existing lag: the function's in-memory 404 body (§ 4.3, up to `html_default_ttl_seconds`) is not cleared by an invalidation, so the 404 text can lag up to 300 s (INFERRED).
   - § 5 Stage 1 `cache-control` cell: "what the HTML object carries — `public,max-age=0,s-maxage=300,must-revalidate` since feature 40 (§ 4.5); never `immutable`".
3. `docs/harness/progress/current.md`: log line appended.

No app/ or tests/ file changed. `grep -rn must-revalidate tests/ app/` → no hits, so no test asserted the old header.

## Checks

| Command | Exit |
|---|---|
| `pnpm typecheck` | 0 |
| `pnpm lint` | 0 |
| `pnpm test` | 0 (98 files, 1395 tests) |
| `./init.sh` (includes `pnpm generate`, storybook build) | 0 |

## Notes for leader / reviewer

- `max_ttl 3600` is cited from the feature 40 description (measured from muush-foundation); I did not verify it. In the contract it is labeled as "recorded in feature 40", not CONFIRMED.
- § 7 V-8 ("second request `Hit from cloudfront`" for `/es`, `/en`, …) expects a hit; with the old `max-age=0` that likely could not happen (INFERRED), so feature 40 is what makes V-8 achievable. V-8's "same `cache-control` as before" will now read the new value after deploy. I left § 7 as is; flag if the leader wants it reworded.
- The post-deploy acceptance item (head-object, two curls, visible text change) is pending and requires Roberto's approval for the production deploy.
