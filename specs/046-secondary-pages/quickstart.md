# Quickstart — verifying feature 46

1. `./init.sh` exits 0 (check, typecheck, tests).
2. `pnpm generate`, then confirm in `.output/public`:
   - `es/nosotros/index.html`, `en/about/index.html`, `es/preguntas/index.html`,
     `en/faq/index.html`, `es/404/index.html`, `en/404/index.html` exist.
   - `sitemap.xml` lists exactly six URLs, each with es-MX, en-US and
     x-default alternates; no 404 document in it.
   - Preguntas: canonical present, no `noindex`; 404: `noindex`, no canonical.
3. `pnpm dev` (or serve `.output/public`) and review at 390 and 1440 in ES and
   EN against frames `gQ0NG`/`D1CqYA`/`trkk7`/`XoSI5` (Nosotros),
   `FXvwz`/`Gc1U5`/`pDsNQ`/`qSDZU` (Preguntas), `X9EQIz`/`zV0qI`/`Y2fsOQ`/`son4B`
   (404), then at 360, 768, 1024, 1280, 1920: no horizontal scroll, clipping
   or overlap.
4. Nosotros: the map tabs work by keyboard below 1024; the application form
   still sends (two steps below 768, consent gate, CV); the footer's "Trabaja
   con muush" lands on the v2 section.
5. Preguntas: ES/EN toggles between `/es/preguntas` and `/en/faq`;
   "Diagnóstico gratis" goes to `/<locale>#diagnostico`; "Agenda una llamada"
   opens the booking page in a new tab; the footer shows "Preguntas" / "FAQ";
   the header link bar does not.
6. 404: open a missing URL; press ES/EN: text, both buttons, header and footer
   switch, the URL stays, `muush_locale` is written (feature 39).
7. Reduced motion and no WebGL: posters show, no ping, no map zoom animation.
8. `pnpm storybook:build` passes; new stories render in both viewports and
   locales.
