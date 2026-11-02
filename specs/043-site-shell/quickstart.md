# Quickstart · verifying feature 43

1. `./init.sh` exits 0 (typecheck, check, test, generate, storybook:build).
2. `pnpm storybook`: open `Shell/SiteHeader`, `Shell/MobileMenu`,
   `Shell/SiteFooter`, `Shell/LanguageToggle`, `Shared/UI/Lockup`,
   `Shared/UI/Wordmark`, `Shared/UI/Isotipo`, `Shared/UI/SocialIcon` at the
   "Móvil (390)" and "Escritorio (1440)" viewports, ES and EN. Compare with
   `docs/harness/progress/pen-extract-43.md` §§ 1–6 (SC-001).
3. Confirm `Legacy v1/Shell/*` holds SiteNav, MobileMenu, SiteFooter,
   FooterColumn, NotFoundContent; nothing v1 under `Shell/`.
4. `pnpm generate && npx serve .output/public`:
   - `/es`, `/en`, `/es/nosotros`, `/en/about`, `/es/no-existe`: header and
     footer present; no dotted grid, no glow, no red spotlight; "You"
     cursor still shown.
   - Language button on each page (User Story 2, all six cases, including a
     hash and the 404 in-place switch, and the `locale` cookie in DevTools).
   - Click Servicios, Diagnóstico gratis, Nosotros, Trabaja con muush,
     Cómo trabajamos; the target heading is visible below the header.
   - Scroll the home page: header hides after 80 px going down, returns
     going up; "Servicios" lights only while the section is in view.
   - DevTools "prefers-reduced-motion: reduce": header and menu change with
     no animation; anchor jumps are instant.
5. At 390: open the menu with keyboard (Tab to the button, Enter): focus on
   Cerrar, Tab cycles inside, Esc closes and focus returns to the button;
   the page did not scroll behind. Disable WebGL: menu shows base + glass.
6. Resize 360, 768, 1024, 1280, 1920: no horizontal scroll, clipping or
   overlap (SC-002). Repeat for the 42 primitives' stories and with
   forced colours emulated (FR-049); record results in the implementation
   report.
7. Disable JavaScript: header and footer render, links work, no menu
   button, header never hides.
8. Favicon: tab icon dot is `#E5352F`.
