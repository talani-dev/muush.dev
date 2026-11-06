# Spec summary · feature 43 `m1_site_shell`

**Status:** `spec_ready` (2026-11-01). `./init.sh` exits 0. Nothing committed.
Branch `feat/v2-site-shell` unchanged.

## Package

`specs/043-site-shell/`: `spec.md` (8 user stories, FR-001…FR-051,
SC-001…SC-008, Clarifications Q1–Q5), `plan.md` (Phase -1 gates; one
Complexity Tracking entry), `research.md` (R1–R15), `data-model.md`,
`contracts/components.md`, `quickstart.md`, `tasks.md` (52 tasks, 11
phases, tests first), `checklists/requirements.md`.
`.specify/feature.json` points to the folder. spec-kit scripts were run with
`SPECIFY_FEATURE=043-site-shell` (the branch name fails their check).

## Key decisions

- **v2 shell UI is new** in `app/features/shell/ui/` (`SiteHeader`,
  `NavLinkBar`, `MenuButton`, `MobileMenu`, `SiteFooter`, `FooterColumns`,
  `MobileFooter`, `SocialLinks`). The v1 `SiteNav`, `MobileMenu`,
  `SiteFooter`, `FooterColumn`, `NotFoundContent` and `NotFoundRings` move to
  `app/features/shell/ui/legacy/` (stories already in `Legacy v1/Shell/`) for
  feature 47 to delete. `LanguageToggle` is restyled in place (behaviour
  code untouched) and its story moves to `Shell/`.
- **Brand marks** `Isotipo`, `Wordmark`, `Lockup`, `SocialIcon` are new v2
  files in `app/shared/ui/` (inline SVG, colours as tokens; social SVGs from
  `app/assets/social/` in Blanco).
- **Section anchors** live once in `app/shared/data/sectionAnchors.ts`
  (`servicios`, `como-trabajamos`, `diagnostico`, `trabaja-con-muush`); the
  shell's anchor type only accepts these ids. To keep links working on
  `muush-v2`, the v1 Contact section becomes `#diagnostico`, v1 Work with
  muush becomes `#trabaja-con-muush`, and the v1 hero CTA follows (5 small
  edits in landing/about).
- **Language toggle, cookie, 404 in-place switch, route-map resolution**:
  behaviour code and behavioural tests unchanged (features 33/37/39).
- **Header** is fixed (floats over sections), reuses `useNavScrollReveal`
  (80 px zone + Roberto's 10 px anti-bounce, forced visible with the menu
  open) plus a focus `reveal()`; no animation under reduced motion. Anchor
  jumps use `scroll-padding-top` and CSS smooth scrolling only when motion is
  allowed (confirmed in Nuxt's installed router code).
- **Mobile menu**: sibling of the header (never inside its transform),
  `role="dialog"`, focus to Cerrar, Tab trap, background `inert`, scroll
  lock, closes on X/Esc/link/history/resize, focus back to the menu button
  unless a link navigated. New `mobileMenu` listón preset with no poster
  (`poster` becomes optional in `ShaderBackground`).
- **Retirements**: the layout stops mounting `DotGrid` and `CursorSpotlight`;
  every v1 glow is hidden at its single wrapper (legacy `SectionBackdrop`
  gets `hidden`). Tests that pinned the spotlight assert its absence and say
  they supersede feature 42's "spotlight sigue funcionando". The "You" cursor
  is untouched.
- **Inherited 42 items**: shader import try/catch → fallback (test); drop
  `GlassButton.size`; rewrite the stale `global.css` layer comments; v2
  Lockup/Wordmark/SocialIcon; by-eye review at 360/768/1024/1280/1920 and
  forced colours recorded in the implementation report (UNVERIFIED if the
  implementer has no browser).

## Provisional answers and open questions for Roberto

All are applied as written and need a confirm or change at the gate.

1. **Scroll-spy active state** (pen extract § 9): nothing lit at the top of
   home; "Servicios" lit while its section is in view; own item on Nosotros
   and Preguntas; nothing on the 404.
2. **Q1 · Nav CTA always shown**, on every page, including the home page at
   the top and the 404. This drops the v1 hero-reveal (feature 9) and the 404
   "one red button" rule (feature 36), so the v2 404 will show two red
   buttons (nav and page).
3. **Q2 · Isotipo stroke**: the extract says 3.4 at 40 × 22, which is half
   the existing logo's stroke (12 units ≈ 6.8 px). The spec keeps the
   existing stroke ("el logo no cambia"). **Leader: please re-check `uUENh`
   in the `.pen`.**
4. **Q3 · Wordmark weights** 600 / 600 / 400 per the `.pen`, adding Poppins
   400. This deviates from Constitution Article VII's wording ("Poppins 500
   for the logo and wordmark"). It is recorded in Complexity Tracking. Either
   amend Article VII (PATCH, Roberto ratifies) or render at 500.
5. **Q4 · Favicon**: only the dot changes to `#E5352F`; the adaptive stroke
   keeps its current values (#262626 / #FBF8F6, which are v1 hex).
6. **Q5 · Preguntas before 46**: omitted from the link bar, menu, MUUSH
   column and mobile links line (no inert placeholder, per Roberto's
   feature 21/23 precedent). Feature 46 adds it back.
7. **v1 section ids retargeted** (Contact → `diagnostico`, Work with muush →
   `trabaja-con-muush`) so the CTA works on `muush-v2`. Alternative: leave the
   v1 ids, and the CTA opens the home top until 45.
8. **Glows hidden via legacy `SectionBackdrop`**. Alternative: leave them
   until 44/46 replace each section.

Possible undocumented business rules to take to a human (not written
anywhere): none new. The CTA-visibility and Preguntas-placeholder answers
above override earlier Roberto decisions only provisionally.

## What changes visually on the `muush-v2` build after 43

- New v2 header and footer on home, Nosotros/About and the 404, in both
  locales. The v1 nav and its lighter Ink 500 footer band are gone.
- The canvas is flat Negro 950: no dotted paper, no section glows and no
  red-dot spotlight. The v1 sections (Hero, Propósito, Servicios, Contacto;
  Nosotros hero and Work with muush; the v1 404 with its rings) keep their
  own content, cards and forms on that flat canvas.
- The header now floats, so each page's first v1 section moves up by the old
  nav row height. On desktop the hero text stays well below the header, and
  the 404 text sits about 8 px under it. On phones the glass bar (ending at
  76 px) overlaps the top 2–4 px of the v1 hero or 404 first line (74 px /
  72 px top padding) until the visitor scrolls. These figures are INFERRED
  from token values and were not seen in a browser.
- The link bar shows Servicios and Nosotros only. "Diagnóstico gratis" lands
  on the v1 contact form. "Cómo trabajamos" opens the home top until 44.
  "Trabaja con muush" lands on the v1 section.
- The favicon dot is Red muush 500. The "You" cursor is unchanged.
- Production (`master`) does not change until feature 47.
