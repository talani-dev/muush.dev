# Fix · share (Open Graph) image — 2026-11-08

Branch `fix/v2-section-centering`. Nothing committed. The uncommitted section-centering work was not touched: biome `--write` ran only on the files listed below, and `git status` shows no other new changes.

## Brief and the mid-task change

The first brief said to ship `public/og-image.png` and serve it from `https://muush.dev/og-image.png`. Partway through, the leader changed it twice. The final version: the image is hosted in the public assets bucket at **`https://assets.muush.dev/brand/cover/og-image.png`**, and the site ships no copy of its own. An interim `brand/og/` path was dropped. This report describes the final state.

## Changes

- `app/features/shell/data/siteIdentity.ts`
  - `SHARE_IMAGE.url` is now the assets-bucket URL, written as a literal on another host (like `SITE_LOGO_URL`), not built from the site URL.
  - `ShareImage` gains `type: ShareImageType` (`'image/png'`, the union `useSeoMeta` accepts) and `alt: string` (`'muush'`, the same in both locales).
  - The TODO(D6) is resolved and replaced by a comment covering: where the file lives, that the site ships no copy, that a changed image needs a new file name (WhatsApp and LinkedIn cache share images by URL), and that `url: null` reverts to the `summary` card.
- `app/features/shell/logic/resolveShareMeta.ts`: `ogImage` now carries `type` and `alt`. `useSiteSeo` is unchanged because it spreads the result, so `og:image:type` and `og:image:alt` reach every page. `twitter:image:alt` is not emitted, because nothing used it before.
- `public/og-image.png`: removed from the repo. It was untracked, so I moved it instead of deleting it, to `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/removed/og-image.png` (1200×630 PNG, 11 KB). That scratchpad is session-scoped, so keep the designer's original as the source of truth.

## Tests

- `resolveShareMeta.test.ts`: the existing cases now include `type` and `alt`. A new case pins `resolveShareMeta(SHARE_IMAGE)`, which is exactly what `useSiteSeo` spreads. I wrote no direct `useSiteSeo` test, because the repo never mocks Nuxt auto-imports and keeps composables thin over pure functions.
- `tests/seo-output.test.ts`: the test for "small card, no image" is replaced. On all 10 indexed pages (ES/EN home, nosotros/about, preguntas/faq, privacy, terms) it now checks that each of these appears exactly once: `og:image`, `og:image:width` 1200, `og:image:height` 630, `og:image:type` image/png, `og:image:alt` muush, `twitter:card` summary_large_image and `twitter:image`. It also checks that `twitter:image:alt` is absent. A new block checks that `SHARE_IMAGE.url` is the bucket URL and that neither `public/og-image.png` nor `.output/public/og-image.png` exists.
- `tests/not-found-output.test.ts`: on `/es/404` and `/en/404`, a new test checks for exactly one `og:image`, plus its width, height and type and `summary_large_image`.
  - 404 behaviour (INFERRED from spec 036 FR-012 and its implementation report): the 404 has always carried the site-wide tags from the layout (`og:type`, `og:site_name`, `twitter:card`). It strips only the page-level ones (`og:url`, `og:locale`, description, canonical). The share image is site-wide, so it appears on the 404 too. The existing assertions that page-level tags are absent are unchanged.
- I did not edit `tests/static-output.test.ts`, which already has uncommitted centering changes. The output checks live in `seo-output.test.ts`.

## Verification (CONFIRMED)

- `pnpm check`: passed. `pnpm typecheck`: passed. `pnpm test`: 191 files / 2698 tests passed. `pnpm generate`: exit 0. `./init.sh`: exit 0.
- `.output/public/og-image.png`: **does not exist**, as intended after the change. The original brief expected it to exist.
- I grepped the generated HTML for all 12 documents (the 10 pages and both 404s). Each has exactly the 7 tags listed above with the bucket URL, and none has `twitter:image:alt`.

## Hosted file (CONFIRMED, 2026-11-08)

- `curl -I https://assets.muush.dev/brand/cover/og-image.png` returned HTTP 200, `image/png`, 11468 bytes. The downloaded file is byte-identical (`cmp`) to the approved file that was in `public/`.
- Re-run against the final URL: `pnpm check`, `pnpm typecheck` and `pnpm test` (191 files / 2698 tests) passed, and `pnpm generate` and `./init.sh` exited 0. All 12 documents carry the 7 tags with the `brand/cover` URL, and none carries `twitter:image:alt`.

## Notes for the leader

- `siteIdentity.ts` spells out the bucket URL as a literal. If the image ever changes, upload it under a new file name and update `url` (social caches key on the URL).
- The local copy in the scratchpad is no longer needed, since the bucket copy is verified identical.
