# Quickstart · verifying feature 45

1. `./init.sh` exits 0 (check, typecheck, test, generate, storybook build).
2. `pnpm storybook` → `Forms/…` and `Landing/AssessmentSection`: every story
   at `Móvil (390)` and `Escritorio (1440)`, ES and EN — idle, step 2,
   Faltan datos, Enviando, Error al enviar, CV upload failed, Enviado.
   Compare with `mMSV2`/`ASEvR`, `uUEnn`/`Vh9NI`, `Bw4IB`/`qUy14`, `VtxDP`,
   `w9Owd`/`gNda1`, `u1CDBO`/`H3cNSD` (leader holds the `.pen`).
   `Legacy v1/Forms/…` lists the quarantined v1 parts.
3. `pnpm generate && pnpm preview` (local only; the real API rejects test
   tokens, so sends end in "Error al enviar" unless stubbed):
   - `/es#diagnostico` and `/en#diagnostico`: v2 section over the listón; no
     website field; submit `aria-disabled` until privacy is ticked;
   - DevTools Network, block the API host: "Error al enviar" keeps every value;
     "Intentar de nuevo" sends again;
   - at 390: two steps; Continuar with empty Nombre shows the error and stays;
     Atrás keeps values; WhatsApp appears only when chosen;
   - `/es/nosotros`, `/en/about`: v1 section with the v2 panel; pick a .txt
     and a 6 MB PDF (both refused at once), a 1 MB PDF (accepted);
   - keyboard only: Tab order equals visual order; arrows in the segmented
     control; Esc in a select; the step change is announced (VoiceOver);
   - reduced motion: no ping on the success dot, instant WhatsApp toggle;
   - widths 360, 768, 1024, 1280, 1920: no horizontal scroll, clipping or
     overlap.
4. `pnpm test -- submissionPayloads submissionFlows` — payload tests unchanged
   and green.
