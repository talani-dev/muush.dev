# Feature 45 `m1_forms` · spec package summary

- **Package:** `specs/045-forms/` (spec, plan, research R1–R13, data-model,
  contracts/components.md, quickstart, checklists/requirements.md, tasks
  T001–T051).
- **Status:** feature 45 set to `spec_ready`. Branch `feat/v2-forms`. No
  commit made.
- **Sources:** pen-extract-45 (with Roberto's § 7 answers), `muush-1.0.md`
  § 4.6 / § 4.8, the binding form API contract, the handoff
  (`iniciarFormulario`), specs 016/020/029/031/032/042–044 and the current
  `forms/` code. The spec author did not open the `.pen`.

## Key decisions

1. **One shell for both forms (R2).** `SteppedForm` owns the panel, progress,
   steps, consent, notice, actions and success swap. Each form fills `details`
   (Nombre, Correo), `profile` (its own fields) and `channel` (contact
   control + WhatsApp). The shell renders `channel` in step 1 when stepped and
   after `profile` in the single view. That keeps DOM order, visual order
   and focus order the same in both views.
2. **Steps below 768 px** (the handoff's 767 px rule). The stepped view
   engages after mount, so the prerendered page and the no-JS page show the
   single view. Field and panel anatomy switch with `md:`, so they are right
   in the static HTML. The section layout still switches at 1024 like every
   other v2 section.
3. **Logic is additive only.** `useFormSteps` and `useConsentGate` are new,
   `classifyCvFile` is extracted, and `useFormSubmitState` gets a
   `revealField` hook that runs before focus. The payload builders, flows,
   Turnstile, spam guard, server-error map and dial-code logic are not
   edited, so the request bodies stay byte-for-byte. Consent never enters the
   form values.
4. **Disabled submit.** `PrimaryButton` gets `unavailable` (sets
   `aria-disabled`, keeps the button focusable) and `describedBy`. A guard
   blocks click, Enter and `requestSubmit` and moves focus to the checkbox.
5. **Quarantine (R1).** Twelve v1 form components move to `forms/ui/legacy/`
   with `Legacy v1/` stories, and their content types become `Legacy*`.
   The v1 home `ContactSection`, its content seam, `landing.contact.*` and
   the `--contact-*` tokens are **deleted**, not quarantined. Keeping them
   would mean exporting a v1 form through the barrel.
6. **States** map onto the existing state machine. "Intentar de nuevo" is
   the submit itself. Success comes only from a real 200. Destinations for
   the success button come from content, not from `ui/`.
7. **Selects stay native** (Esc, type-ahead and the mobile picker work). The
   segmented control is a radiogroup made of native radios. The progress
   text is a polite live region.

## Provisional answers and open questions for Roberto

- **Q1 · CV size (needs a decision).** The approved copy and the feature
  acceptance say 10 MB. The binding contract caps the upload at 5 242 880
  bytes, and the backend must not change. **Provisional: enforce 5 MiB and
  change the copy to "5 MB".** Shipping "10 MB" would send every 5–10 MB CV
  into the CV-upload error. Choosing 10 MB needs the backend raised first.
- **Q2 · Failed CV upload (no v2 frame).** Provisional: the red notice above
  the submit shows feature 31's message with an "Enviar sin CV" action. The
  submit reads "Intentar de nuevo" and retries with the same file.
  "Reintentar subida" is dropped as a separate control.
- **Q3 · Field errors without approved v2 copy.** Provisional: use the v2
  lines where they exist. For email, the one line covers both empty and
  malformed; for the CV, one line covers both wrong format and too large.
  Every other error keeps today's wording, with a period added.
- **New copy to approve:**
  - identity placeholder "Selecciona una opción" / "Select an option";
  - screen-reader hint "Acepta el aviso de privacidad para enviar." /
    "Accept the privacy notice to send.";
  - the label "Lo que recibes" / "What you get", stored in sentence case.
- **Diagnóstico success no longer names the channel.** The v1 copy did; the
  approved v2 body says "por el medio que elegiste".
- **LinkedIn placeholder.** "linkedin.com/in/…" invites a value without
  `https://`, which the unchanged URL rule (client and server) rejects.
  Keep it as is, or change the placeholder?
- **Contract drift, already known.** The contract still says WhatsApp
  numbers are exactly 10 digits and has no `whatsappDialCode`. The code
  follows the feature 32 backend agreement (6–14 digits plus the dial code),
  and this feature keeps that. A human should update the contract document.

## Values missing for the leader

- **EN mobile copy from `qUy14` / `H3cNSD`.** Assumed: "Step N of 2 ·
  Your details / Your business / Your profile", "Continue", "← Back" (from
  the handoff pattern).
- **Diagnóstico identity select placeholder.** The `.pen` copy has none.
- **Look of the unticked (disabled) submit.** Assumed 70 % opacity with the
  not-allowed cursor.
- **WhatsApp row.** The gap between the dial control and the number (8 / 7
  assumed), and the dial control's width.
- **Mobile values:**
  - the checkbox, privacy text and notice sizes (desktop values assumed);
  - the success stack sizes (desktop values assumed);
  - the "Llamada" row (desktop values assumed);
  - the body size (16 assumed).
- **Whether the mobile segmented control's selected option has the red
  dot.** Assumed: no.
- **Whether the notice has the handoff's 8 px dot.** Assumed: yes, from
  "gap 12".
- **The application panel inside the v1 Nosotros column.** Assumed: capped
  at 600 and start-aligned in the 660 column.
- **The CV box when a file is chosen.** Assumed: the file name in Blanco;
  no remove control, since the native picker replaces the file.

## What changes visually on the integration build after 45

- **Home (`/es`, `/en`):** the v1 contact block at `#diagnostico` is
  replaced by the v2 "Diagnóstico y contacto" section over the `assessment`
  listón: pill, two-tone heading, "Lo que recibes" checklist, call row and
  the glass form panel. The home is now fully v2. On phones the form is two
  steps.
- **Nosotros (`/es/nosotros`, `/en/about`):** the v1 About hero and the v1
  "Trabaja con muush" section stay (v1 pill, headline, body, glows and
  layout), but the form column now holds the v2 glass application panel.
  That panel has the v2 fields, the CV box, the privacy checkbox, two steps
  on phones and the v2 states. The page looks mixed until feature 46.
- **Both forms:** submit stays disabled until privacy is ticked; v2 errors
  and the red notice; the success tile with a pinging red dot.

## Notes

- `.specify/feature.json` now points at `specs/045-forms`. The spec-kit
  scripts were run with `SPECIFY_FEATURE=045-forms`.
- `CLAUDE.md` has no SPECKIT block, so no agent-context update was made.
- No business rule was written, and nothing under `docs/business/` was
  touched. The CV-limit conflict (Q1) and the contract's outdated WhatsApp
  rule are contradictions in human-owned documents, reported above for
  Roberto.
