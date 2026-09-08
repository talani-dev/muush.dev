# Review: feature 21 `floating_nav_redesign` (round 2)

APPROVED

All three round-1 defects re-measured live via CDP against a fresh
`pnpm generate`, headless Chrome (`--remote-debugging-port` +
`--remote-allow-origins=*`), `.output/public` served locally.

1. Desktop pill: `.site-nav > div` at 1440px = **1280×72** at x80/y24. Matches.
2. Mobile row: `.site-nav > div` at 390px = **78×...** height **78px**
   (17+44+17, toggle-governed), matching § R55 baseline. Toggle still 44×44;
   hamburger (40×34.1875) sits fully within the row, no clipping/regression.
3. CTA (ES): **220.984375×48** (target 221, 0.016px off — measurement
   noise). CTA (EN): 236.34375×48, confirmed same classes
   (`py-btn-nav-y px-btn-nav-x text-button-sm`) as ES — width delta is pure
   label-length variance, not a padding inconsistency.

`git diff` on `SiteNav.vue`/`LanguageToggle.vue`/`BotonPrimario.vue` this
round is limited to the `lg:top-nav-pill-y`/`lg:py-nav-pill-py` classes plus
doc comments — no markup/prop/logic changes beyond round 1's approved
`switchLabel` prop, arrow span, and `group` class. `global.css` diff is
token values only (`--text-button-sm`, `--spacing-btn-nav-x/-y`,
`--spacing-nav-y`, new `--spacing-nav-pill-py`).

`findings.md` § R64: honest, useful record of the border-height miscount
(border adds to auto-height under border-box) — not padding.

## Gates
`./init.sh` exit 0. 706/706 tests, unchanged from round 1.
