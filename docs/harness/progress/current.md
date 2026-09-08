# Current session

- **Última feature cerrada:** 21 · `floating_nav_redesign` → **`done`** (2026-09-08)
- **Rama:** `feat/floating-nav-redesign`
- **Sin commitear:** el trabajo de la feature 21 sigue en el árbol; commitea el líder

## Estado

La feature 21 pasó el ciclo `spec_ready → ⏸ humano → in_progress → reviewing
→ done` con dos rondas de revisión. La ronda 1 **rechazó** por tres defectos
de medida que el implementer no pudo verificar en su propio entorno (sin
CDP): la píldora de escritorio a 1280×110 en vez de 1280×72
(`--spacing-nav-y` nunca se ajustó para la píldora), el nav móvil a 88px en
vez de los ~78px que `findings.md` § R55 ya registraba (el círculo de idioma
de 44×44 pasó a ser el contenido más alto de la fila), y el CTA del nav a
232.5×48 en vez de 221×48. El `reviewer` completó esas tres medidas en vivo
por CDP contra `.output/public` y encontró los tres defectos midiendo, no
leyendo. La ronda 2 confirmó los tres arreglos con medición en vivo —incluido
un hallazgo a medio arreglo (`findings.md` § R64: el borde de 1px nuevo de la
píldora suma a su alto automático bajo `border-box`, así que el primer
intento midió 74px, no 72)— y el reviewer remidió las tres cifras de forma
independiente contra un `pnpm generate` fresco.

Un defecto real del paquete de spec se encontró y se resolvió, no solo se
implementó alrededor: `LanguageToggle.vue` no podía conservar su contrato
`{locale, href}` como decía `contracts/components.md` sin violar el
Artículo VI (string sin traducir) o la convención de `rules.md` § R23 (cero
`useI18n()` en `ui/`). Se agregó un prop, `switchLabel`, resuelto en
`default.vue` y pasado por `SiteNav`/`MobileMenu` — el reviewer lo calificó
de arreglo legítimo y proporcionado, no scope creep.

Las dos divergencias respecto al `.pen` quedaron documentadas en código, no
resueltas en silencio: `Proyectos` fuera del nav (instrucción de Roberto,
feature 15 diferida) y `Servicios` dentro (el `.pen` gana por § R32, se
reporta la contradicción con `content.md` para que la resuelva un humano).

`./init.sh` exit 0 — **58 archivos / 706 pruebas** (baseline 58/688).

## Next step

Con la 21 cerrada, solo quedan **`blocked`** en `feature_list.json`:

- **Features 15, 18, 19** (`projects_section`, `team_section`,
  `network_section`) — las tres siguen diferidas indefinidamente por decisión
  explícita de Roberto (esperando más colaboradores/proyectos/red, no una
  dependencia técnica). Nada más está en cola.

Sigue **abierto para Roberto y Clau**, sin bloquear nada (arrastrado de
sesiones previas): el body copy de `about.work.*` pendiente de confirmación;
la decisión #7 de `decisions-open.md` (si el CV es obligatorio,
`CV_REQUIRED = false` hoy); el catálogo real de roles por área bajo "Área y
rol" (`ROLE_CATALOG`, un placeholder por área hoy, dueño Clau); y ahora
también la contradicción `content.md`/`.pen` sobre `Servicios` en el nav
(feature 21) y la desactualización de `ui-map.md` § 2 por el mismo rediseño.
