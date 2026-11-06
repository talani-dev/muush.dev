# Data model · feature 43 site shell

All data is static, compiled into the site. `data/` holds keys and
descriptors; `logic/` resolves them; `ui/` receives resolved values only.

## 1 · Section anchors (`app/shared/data/sectionAnchors.ts`)

| Key | Id | Page | Section owner |
|---|---|---|---|
| `services` | `servicios` | home | 44 (v1 Services until then) |
| `howWeWork` | `como-trabajamos` | home | 44 (no section until then) |
| `assessment` | `diagnostico` | home | 45 (v1 Contact until then) |
| `workWithUs` | `trabaja-con-muush` | Nosotros | 46 (v1 Work with muush until then) |

`type SectionAnchor = (typeof SECTION_ANCHORS)[keyof typeof SECTION_ANCHORS]`.
Ids are bare (no `#`); hashes are built where needed. Unit test: values,
uniqueness, URL-safe (`/^[a-z-]+$/`).

## 2 · Shell types (`app/features/shell/data/types.ts`)

```ts
type ShellRouteName = 'index' | 'about'          // 'faq' added by 46
type ShellDestination =
  | { kind: 'route'; name: ShellRouteName }
  | { kind: 'anchor'; name: ShellRouteName; anchor: SectionAnchor } // was hash: string
  | { kind: 'external'; href: string; messageKey?: string }
  | { kind: 'none' }
interface ShellItem { labelKey: string; destination: ShellDestination }
interface ContactChannel extends ShellItem { hintKey: string }
interface FooterColumnModel { titleKey: string; items: ShellItem[] }
interface ResolvedShellItem {
  label: string; href?: string; external?: boolean
  current?: 'page' | 'section'   // was boolean; drives aria-current
}
interface ResolvedContactChannel extends ResolvedShellItem { hint: string }
type SocialNetwork  // re-exported from the v2 '@/shared/ui/SocialIcon.vue'
```

The anchor variant carries the typed id rather than a free string, so a link
to an undeclared section does not compile. One more member exists only for
the v1 404 shortcuts, which still point at `#proposito` until feature 46
replaces that page: `{ kind: 'legacyHash'; name: ShellRouteName; hash:
string }`. Only `data/notFound.ts` uses it; feature 46 deletes it with the v1
404.

## 3 · Navigation (`data/navigation.ts`)

| Constant | Items (label key → destination) |
|---|---|
| `NAV_ITEMS` | `shell.nav.services` → anchor index/services · `shell.nav.about` → route about |
| `NAV_CTA` | `shell.nav.cta` → anchor index/assessment |
| `MENU_ITEMS` | same list as `NAV_ITEMS` (one constant reused) |

Preguntas (`shell.nav.faq`, route `faq`) is added by feature 46 to this list,
the footer MUSH column and the mobile links line (Clarifications Q5).

## 4 · Footer (`data/footerColumns.ts`, `data/contactChannels.ts`)

`FOOTER_COLUMNS` (desktop, order fixed):

| Title key | Items |
|---|---|
| `shell.footer.nav.title` | services (anchor) · howWeWork (anchor) · about (route) |
| `shell.footer.contact.title` | assessment (anchor) · call (external `CALL_BOOKING_URL`) · email (`mailto:`) · whatsapp (external + `messageKey`) |
| `shell.footer.muush.title` | workWithUs (anchor on about) · blog (`none`, label "Blog · próximamente") |
| `shell.footer.social.title` | LinkedIn · Instagram · TikTok (external, from `SOCIAL_PROFILES`) |

`MOBILE_CONTACT_CHANNELS`: WhatsApp, call, email — each with `hintKey`.
`MOBILE_FOOTER_LINKS`: services · howWeWork · about · workWithUs · blog
(`none`, "Blog (próximamente)").
`LEGAL_ITEMS`: privacy · terms, both `none` until 48.
`SUPPORT_EMAIL`, `WHATSAPP_URL`, `SOCIAL_PROFILES`, `CALL_BOOKING_URL`:
reused unchanged.

## 5 · i18n keys (both locales)

| Key | ES | EN |
|---|---|---|
| `shell.nav.services` | Servicios | Services |
| `shell.nav.about` | Nosotros | About |
| `shell.nav.cta` | Diagnóstico gratis | Free assessment |
| `shell.nav.label`, `switchToEs`, `switchToEn` | kept | kept |
| `shell.nav.home` | Inicio de muush | muush home (accessible name of the logo link) |
| `shell.menu.label` / `open` / `close` | kept (`close` → "Cerrar menú") | kept |
| `shell.footer.tagline` | Hablamos negocio y código. | We speak business and code. |
| `shell.footer.category` | Technology Solution Studio. | Technology Solution Studio. |
| `shell.footer.copyright` | © 2026 muush · Todos los derechos reservados | © 2026 muush · All rights reserved |
| `shell.footer.nav.title` / `services` / `howWeWork` / `about` | NAVEGACIÓN* · Servicios · Cómo trabajamos · Nosotros | NAVIGATION* · Services · How we work · About |
| `shell.footer.contact.title` / `assessment` / `call` / `email` / `whatsapp` | CONTACTO* · Diagnóstico gratis · Agenda una llamada · support@muush.dev · WhatsApp | CONTACT* · Free assessment · Book a call · support@muush.dev · WhatsApp |
| `shell.footer.muush.title` / `work` / `blog` / `blogInline` | MUUSH* · Trabaja con muush · Blog · próximamente · Blog (próximamente) | MUUSH* · Work with muush · Blog · coming soon · Blog (coming soon) |
| `shell.footer.social.title` | REDES* | SOCIAL* |
| `shell.footer.contact.hints.whatsapp` / `call` / `email` | Escríbenos → · 30 minutos → · Correo → | Message us → · 30 minutes → · Email → |
| `shell.footer.legal.privacy` / `terms` | Aviso de privacidad · Términos y condiciones | Privacy notice · Terms and conditions |
| `shell.footer.whatsappMessage`, `shell.social.*`, `shell.notFound.*` | kept | kept |

\* Stored as drawn; column titles are uppercase in the design, so the keys
store them in title case ("Navegación") and the `uppercase` utility renders
them, which keeps screen readers from spelling them letter by letter.
Contact hints store the text without the arrow ("Escríbenos"); the
component appends a decorative `→` with `aria-hidden="true"`, matching the
drawn "Escríbenos  →".

Removed (no reader after 43): `shell.menu.purpose`, `shell.menu.services`,
`shell.menu.about`, `shell.footer.nav.purpose`, `shell.footer.location`.

## 6 · Background preset (`app/shared/data/backgroundPresets.ts`)

`mobileMenu`: `{ shader: 'liston', uniforms: { u_flip: 1, u_y0: 1.02, u_y1:
0.8, u_th: 0.06, u_amp: 0.03, u_tdark: 0 }, priority: 'lazy' }`, no poster.
`BackgroundPreset.poster` becomes optional.

## 7 · State

| State | Owner | Values | Transitions |
|---|---|---|---|
| Menu | `useMobileMenu` (module scope) | `isOpen: boolean`, `lastCloseReason: 'dismiss' \| 'navigate' \| null` | open ← menu button; close('dismiss') ← Cerrar, Esc, history, resize ≥ lg; close('navigate') ← link chosen, language chosen |
| Header visibility | `useNavScrollReveal` | `isNavVisible` | hidden ← y > 80 and ≥ 10 px down; visible ← any up, y ≤ 80, menu open, `reveal()` on focus |
| Active section | `useActiveSection` | `SectionAnchor \| null` | set while observed section is in the reading band on home; null otherwise, on server, without JS |

## Amendment 2026-11-01 — Home link added by Roberto 2026-11-01

- `ShellDestination` gains `{ kind: 'top'; name: ShellRouteName }`: same href
  as `route`, current only while that page is shown and the visitor is at
  its top.
- `ResolvedShellItem` gains `scrollsToTop?: true` (set for `top` items only).
- § 3: `NAV_HOME` = `shell.nav.homeLink` → top index, first in `NAV_ITEMS`
  (and therefore `MENU_ITEMS`).
- § 4: `FOOTER_DESTINATIONS.home` = top index; NAVEGACIÓN starts with
  `shell.footer.nav.home`; `MOBILE_FOOTER_LINKS` starts with it too.
- § 5 keys: `shell.nav.homeLink` "Inicio" / "Home"; `shell.footer.nav.home`
  "Inicio" / "Home". `shell.nav.home` stays the logo's accessible name.
- § 7 State: `useActiveSection` also returns `atTop: boolean` — true while no
  spied section is in the band and none is above it; true on the server and
  before the first report. Home item current = home route ∧ ¬error ∧ `atTop`.
- § 6 (shader uniforms, reopened 2026-11-01): uniforms drawn =
  `{ ...readShaderDefaults(source), ...SHADER_DEFAULTS, ...preset.uniforms }`.
