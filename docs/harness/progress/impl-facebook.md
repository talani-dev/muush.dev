# Facebook as the fourth social profile — implementation report

Requested by Roberto, 2026-11-08. Small change on `feat/v2-faq-content`, on
top of the uncommitted feature 51 work. None of that work was touched. Not
committed, and `feature_list.json` was not edited.

Profile: `https://www.facebook.com/profile.php?id=61595800850873`. Order:
fourth, after TikTok. Nothing in `docs/business/`, the specs or the handoff
mentions Facebook, so nothing suggests a different order.

## Files changed

| File | Change |
|---|---|
| `app/assets/social/facebook.svg` | New. The normalised glyph (see below). |
| `app/assets/social/README.md` | "three" changed to "four". New `facebook.svg` section with the source, the transform and what was stripped. |
| `app/features/shell/data/socialProfiles.ts` | Fourth entry `facebook`, with a comment that the URL is the numeric `profile.php?id=` form because there is no vanity handle yet. Header comment changed from "three profiles / three buttons" to four. |
| `app/shared/data/socialNetworks.ts` | `SocialNetwork` now includes `'facebook'`. |
| `app/shared/ui/SocialIcon.vue` | Imports `facebook.svg?raw` and adds it to `GLYPHS`. Comment notes the glyph has no `.pen` counterpart. |
| `app/shared/ui/SocialIcon.test.ts` | Facebook added to the per-network title test. |
| `app/shared/ui/SocialIcon.stories.ts` | New `Facebook` story. Comment changed from three to four. |
| `app/features/shell/ui/SocialLinks.vue`, `SocialLinks.stories.ts`, `MobileMenu.vue`, `data/siteIdentity.ts` | Comments changed from three to four. |
| `app/features/shell/ui/SocialLinks.test.ts`, `MobileMenu.test.ts`, `shellFixtures.testing.ts` | Facebook added to the `ResolvedSocial` fixtures and to the expected labels and networks. |
| `app/features/shell/logic/profileUrls.test.ts` | Expects four hrefs. |
| `app/features/shell/data/footerColumns.test.ts` | Social column length changed from 3 to 4. Only that line; the file's other diff lines belong to feature 51. |
| `i18n/locales/es.json`, `en.json` | `shell.social.facebook` set to "Facebook" in both (ES/EN parity). |

Checked and left unchanged:
- **Tracking network allow-list:** there isn't one. `trackingEvents.ts` has
  no social or network enum; the only `'network'` value there is a
  `form_error` error type. `tracking-plan-49.md` § 3 covers social clicks only
  as GA4 enhanced-measurement outbound clicks ("Cal.com, wa.me, social"),
  with no per-network list. Neither file needed a change.
- **schema.org `sameAs`:** built from `SOCIAL_PROFILES`, so no code change.
  CONFIRMED in the built `.output/public/es/index.html` and
  `en/index.html`: four URLs, Facebook last. `tests/seo-output.test.ts`
  already compares against the record, not a count.
- **Footer column and mobile menu:** both are built from the record through
  `footerColumns.ts` and `useShellNavigation.ts`, so no code change.
- **About page:** has no social list.
- **No other hardcoded profile URLs:** grep found none outside the record and
  the test fixtures.

Not changed, for the leader to raise with a human:
`legal.terms…body` in both locales says the site links to third-party
services "como Cal.com, WhatsApp, LinkedIn e Instagram" / "such as Cal.com,
WhatsApp, LinkedIn and Instagram". It already leaves out TikTok, and the
wording is "such as", so the list is not meant to be complete. It is legal
copy, so whether to add Facebook (and TikTok) is a human decision.

## SVG normalisation

Source: `…/Icons/Redes/Facebook/facebook-logo-white.svg`, viewBox
`0 0 2084 2076`. The source has four nested Serif `<g transform>`s, then
`<g id="Logo">`, then one path with `style="fill:white;fill-rule:nonzero"`.

- In the path's own coordinates the mark is a circle of radius 250 centred at
  (-250, 1.831). x spans [-500, 0] and the circle's y spans
  [-248.169, 251.831]. The drawn path stops at y 250, where the "f" stem cuts
  the circle.
- The Serif transforms only place that circle on the 2084 × 2076 canvas, so
  I dropped them instead of composing them. The path data is kept exactly.
- I fitted the **circle**, not the path's bounding box: `24 ÷ 500 = 0.048`.
  The translate moves the circle's top-left corner to the origin:
  `translate(24 11.912) scale(0.048)`. The circle fills the 24 × 24 box
  exactly and is centred on both axes, like the LinkedIn square. Extents:
  x [0, 24], y [0, 23.912].
- Output: `<svg xmlns viewBox="0 0 24 24">`, `<title>Facebook</title>`, one
  wrapping `<g transform>`, and the path with `fill="currentColor"`. No
  prolog, DOCTYPE, extra xmlns, `style`, `width` or `height`. That is the
  README's shared contract. The path is a single subpath, so `nonzero` is the
  default fill rule and is not written out.

## Layout check (built site, served from 127.0.0.1:4321, home page, ES and EN)

Measured with headless Chrome over CDP at DPR 2, using a throwaway script in
the scratchpad (not part of the repo). `docOverflowX` was 0 in every case.

| Viewport | Surface | Result |
|---|---|---|
| 390 | Mobile menu (open) | 4 × 48 px buttons on one row with a 12 px gap, x 81–309. The group's centre is 195, half of 390, so it stays centred. 162 px free on each side of the 342 px list. |
| 390 | Mobile footer | 4 × 44 px buttons on one row with a 10 px gap, x 24–230, left-aligned within the 342 px content box. 112 px free. |
| 1024 | Desktop footer, "Redes" / "Social" column | 4 text rows at a 36–37 px pitch. The column is 70 px wide (widest item is "Instagram"). The 4th row, Facebook, lines up with the 4th rows of Navegación and Contacto, so the footer is no taller. |
| 1440 | Desktop footer | Same as 1024. The column ends at x 1360, the 80 px gutter. |

ES and EN measured identically, because the network labels are brand names
in both locales. No mobile menu exists at 1024 or 1440 (desktop nav). **No
layout adjustment was needed**, and no token was changed.

Screenshots in
`/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/fb/`:
- `menu-es-390.png`, `menu-en-390.png`
- `footer-es-390.png`, `footer-en-390.png`, `footer-es-1024.png`,
  `footer-en-1024.png`, `footer-es-1440.png`, `footer-en-1440.png`. For the
  footer captures the cookie banner was hidden in the page so the footer was
  visible. Nothing was changed on the site.
- `measurements.json`: the raw rectangles.

Visual check of the screenshots: the Facebook glyph renders in Blanco
through `currentColor` and matches the other three glyphs in optical size.

## Gates

`./init.sh` exits **0**. Typecheck OK, Biome OK, Vitest 205 files / 2897
tests passed, `pnpm generate` OK (28 routes), Storybook build OK.

The first run failed on one test: `footerColumns.test.ts` hard-coded
`toHaveLength(3)` for the social column. I changed it to 4 and the rerun was
clean.

## Terms copy

Roberto approved adding TikTok and Facebook to the third-party list in the terms. `legal.terms` line 801 in `i18n/locales/es.json` and `en.json` now lists "Cal.com, WhatsApp, LinkedIn, Instagram, TikTok y/and Facebook"; `app/features/legal/data/legalFixtures.testing.ts` mirrors it. No test in `tests/` pins this sentence to the `pen-48` exports (`tests/legal-copy.test.ts` checks only the placeholder substitutions), so no test expectation changed, and the `pen-48` exports were left alone. `./init.sh` exits 0, and the built `/es/terminos/` and `/en/terms/` served on 127.0.0.1:4321 contain the new sentence.
