# Quickstart · verifying feature 44

1. `./init.sh` — exits 0 (check, typecheck, test, generate, storybook build).
2. `pnpm storybook` → `Landing/` (v2 sections) and `Shared/UI/WorldMap…`:
   each story at `Móvil (390)` and `Escritorio (1440)`, ES and EN. Compare
   with frames `V2s7T` / `mJxKt` and `Tng1t` / `ZL2Vo` (leader holds the
   `.pen`). `Legacy v1/Landing/` lists the retired sections and the contact.
3. `pnpm generate && pnpm preview` (local only), open `/es` and `/en`:
   - order Hero → Qué es muush → Servicios → Cómo trabajamos → v1 contact;
   - hero "Diagnóstico gratis" lands on the v1 form, "Cómo trabajamos" on the
     timeline;
   - Network panel: no request for the map;
   - widths 360, 390, 768, 1024, 1280, 1440, 1920: no horizontal scroll,
     clipping or overlap;
   - below 1024: tabs with Tab/arrows/Home/End; carousel swipe and keyboard
     scroll, indicator follows, last card at the end;
   - below 1024, scroll through Cómo trabajamos: the rail fills, steps
     light, reverse on scroll up; from 1024 the steps stay unlit with a grey
     line while scrolling, and hovering or tabbing to a step lights the line
     and steps up to it (FR-042…FR-045, amended 2026-11-02);
   - OS "reduce motion": still listón/acanalado, pill fixed, map region jumps,
     rail fully lit, desktop timeline unlit at rest with an instant preview;
   - JavaScript disabled: all text present, rail lit, desktop timeline
     unlit with a grey line, America shown;
   - header at top of `/es`: only "Inicio" has `aria-current="page"`.
4. `pnpm test -- tests/seo-output.test.ts tests/static-output.test.ts` — SEO
   from feature 35 unchanged, fragment targets exist.
