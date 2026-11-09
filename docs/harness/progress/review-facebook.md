# Review: Facebook as the fourth social profile

Verdict: APPROVED

Scope: only the Facebook changes listed in `impl-facebook.md`. The feature 51 work on this branch was not reviewed.

## Findings

- SVG (`app/assets/social/facebook.svg`), CONFIRMED: root `viewBox="0 0 24 24"` with no width or height, one `<g transform>`, `<title>Facebook</title>`, `fill="currentColor"`. No style, defs, prolog or class. I recomputed the transform: path x [-500,0] maps to [0,24], and y [-248.169,250] maps to [0,23.912]. The circle's centre maps to (12, 12.0), so the circle fills the box exactly. This matches the README's shared contract.
- Consumers, CONFIRMED: `SocialNetwork` includes `facebook`. `SocialIcon` GLYPHS, the test and the story are updated. `SOCIAL_PROFILES` has 4 entries. `useSiteSeo` (sameAs), `useShellNavigation` and `profileUrls` all derive from the record. The test fixtures are updated. `shell.social.facebook` exists in both es.json and en.json, so i18n parity holds.
- No leftover "three" assumption, CONFIRMED: grep finds no social-related "three" or `toHaveLength(3)`. The remaining hits are unrelated: menu lines, contact channels, nav children, assessment items and forms.
- Constitution, CONFIRMED: no hard-coded colours (the glyph uses currentColor), alias imports only, no server route, no new page.
- sameAs on the built site, CONFIRMED on /es/ and /en/ at 127.0.0.1:4321: four URLs, ending with `https://www.facebook.com/profile.php?id=61595800850873`.
- Screenshots, CONFIRMED (menu-es-390, footer-es-390, footer-en-1440): 4 icons on one row, the menu row is centred, the Facebook glyph matches the others in optical size and colour, and the desktop Social column lists Facebook fourth without making the footer taller.
- `./init.sh`: exit 0 (re-run by the reviewer).

## Non-blocking note (human decision)

The legal terms copy (ES/EN) lists "Cal.com, WhatsApp, LinkedIn e Instagram" as examples. It leaves out TikTok and Facebook. The wording is "such as", so the list is not exhaustive, but whether to add them is a decision for legal or the product owner.
