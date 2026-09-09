# Feature 25 — purpose_copy_nav_order_and_submit_width

Status: `reviewing`. Branch `feat/purpose-copy-nav-and-submit-width`.

## 1 · Copy real de Propósito

`i18n/locales/es.json` y `en.json`, claves `landing.purpose.{why,how,what}.copy`
reemplazadas verbatim por el copy dado (los nueve valores ES/EN del prompt).
`usePurposeContent`/`purposeContent.ts` solo referencia las claves, así que
`PurposeConstellation.vue` (desktop) y `PurposeCarousel.vue` (mobile) toman el
copy nuevo sin tocar componentes.

Tests/fixtures que pinneaban el copy viejo, actualizados:
- `tests/landing-copy.test.ts` — asserts del Golden Circle actualizados; el
  test `should keep the What block and the hero subhead the same sentence` se
  reescribió a `should no longer duplicate the hero subhead in the What
  block` (`not.toBe` en vez de `toBe`) porque esa igualdad era una coincidencia
  del placeholder viejo, no una regla de negocio — no hay nada en
  `content.md`/`ui-map.md`/el `.pen` que la exija.
- `tests/static-output.test.ts` — `PURPOSE_COPY` actualizado; el `why` en
  inglés usa `&#39;` en vez de `'` porque se compara contra el HTML
  prerenderizado, que entity-encodea el apóstrofo (Nuxt/Vue), no contra el
  JSON crudo.
- `app/features/landing/ui/PurposeSection.stories.ts` — fixtures ES/EN
  actualizados para que Storybook muestre el copy real.

No se tocó `PurposeCard.test.ts` (su fixture es arbitraria, no una aserción de
paridad de copy) ni `specs/013-purpose-section/data-model.md` (artefacto de
spec histórico).

## 2 · Nav — orden y padding

**2a — orden.** `SiteNav.vue`: `<LanguageToggle>` movido antes del div
`.site-nav__cta` dentro de `.nav-row__end`. `SiteNav.test.ts` no tenía
aserciones dependientes del orden; sigue verde.

**2b — padding.** Token nuevo `--spacing-nav-pill-x: 2.5rem` (fijo, mismo
criterio que `--spacing-nav-pill-y`/`-py`) en `global.css`, junto a esos
tokens, con comentario explicando por qué sustituye a `px-page` solo a `lg`.
`SiteNav.vue`: clase `lg:px-nav-pill-x` agregada a `.nav-row` (gana por
especificidad de media query sobre `px-page`, mismo patrón que
`lg:py-nav-pill-py`). `SiteNav.test.ts` actualizado para incluir
`lg:px-nav-pill-x` en la lista de utilidades esperadas de la píldora.

**CDP @1440, `.output/public` real (Chrome headless, `Emulation.setDeviceMetricsOverride`):**

| | ES | EN |
|---|---|---|
| Orden en `.nav-row__end` | Idioma (`left=1015.02`) → CTA (`left=1089.02`) | Idioma (`left=999.66`) → CTA (`left=1073.66`) |
| Ancho de la píldora (`.nav-row`) | 1280 (`80` a `1360`) | 1280 |
| Lockup, borde real del viewport | **121px** (80 inset + ~41 padding) | 121px |
| Extremo derecho del grupo, borde real del viewport | **121px** | 121px |

Idioma antes que CTA en ambos locales; margen izquierdo y derecho simétricos
(~120px, el 1px extra es el `border` de 1px de la píldora, mismo efecto ya
documentado en `global.css` para `--spacing-nav-pill-py`); la píldora sigue en
1280×72 con 80px de inset — nada de eso se tocó.

## 3 · Botón Enviar — CORREGIDO tras revisión del líder contra `OqChv` + 4 instancias reales

Primera pasada usaba `self-center` sin scope, asumiendo `width: fit_content`
en las 4 instancias. El líder verificó el nodo base y las 4 instancias
(Contacto ES/EN, Work with muush ES/EN) directo en el `.pen`: **desktop es
`width: 216` EXPLÍCITO** (fijo, no fit-content — "Enviar"/"Submit" dan el
mismo ancho pese a distinto largo de texto) y **mobile es
`width: "fill_container"` EXPLÍCITO** (debe seguir estirado al ancho del
form). El `self-center` sin scope rompía mobile (lo dejaba en ~100px en vez
de estirado).

Fix corregido: token `--spacing-btn-submit-w: 13.5rem` (216px, fijo) agregado
en `global.css` dentro de `@theme inline` (mismo patrón que
`--spacing-services-text-w` → `w-services-text-w`). En `ContactForm.vue` y
`ApplicationForm.vue` la instancia `<BotonPrimario variant="submit">` lleva
`lg:w-btn-submit-w lg:self-center` — ambas clases con scope `lg:`, nada sin
scope. Tests actualizados en ambos `*.test.ts` para afirmar las clases con
scope y la ausencia de las versiones sin scope.

**CDP, `.output/public` real (regenerado tras la corrección), ambos forms:**

| | Desktop 1440 (form 590px) | Mobile 390 (form 292px) |
|---|---|---|
| Ancho del botón | **216px** exacto | **292px** (= 100% del form) |
| Margen izq. / der. | 187 / 187 (simétrico) | 0 / 0 (estirado) |

Idéntico en Contact y Application. Desktop fijo a 216px y centrado; mobile
vuelto a estirar al ancho completo del form, como antes de la primera pasada.

## Verificación

`pnpm check`, `pnpm typecheck`, `pnpm test` (713/713), `pnpm generate` y
`pnpm storybook:build` — los cinco en verde. CDP corrido contra
`.output/public` servido con `npx serve`, Chrome headless local
(`--remote-debugging-port`), cliente CDP ad-hoc de ~80 líneas sin
dependencias nuevas (mismo método que `findings.md` §§ R44/R64).

No se tocó ningún primitivo congelado (`SectionGlow`, `DotGrid`,
`SectionBackdrop`, `Radar`, `Pill`, `BotonPrimario`). No se escribió en
`docs/business/`.
