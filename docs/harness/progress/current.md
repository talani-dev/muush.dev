# Current session

- **Última feature cerrada:** 23 · `visual_polish_round_1` → **`done`** (2026-09-08)
- **Rama:** `feat/visual-polish-round-1`
- **Sin commitear:** el trabajo de la feature 23 sigue en el árbol; commitea el líder

## Estado

La feature 23 (nueve ítems de ajuste visual, `sdd: false`) pasó el ciclo
`in_progress → reviewing → done` con tres rondas de revisión, todas sobre el
mismo ítem (4 · la constelación de Servicios). Los otros ocho quedaron
aprobados desde la ronda 1: flecha del CTA del nav (texto-primero, gap 9),
centrado de los links del nav respecto al ancho total de la píldora, el
token único de espaciado entre secciones (`--spacing-section-gap`), el Pill
de Delivery sin estirarse, el copy real de Contacto + divisor hairline, y la
eliminación completa de FAQ/Blog/Proyectos del footer.

El ítem 4 se resolvió en tres pasadas: la ronda 1 detectó y arregló el
"hugging" del canvas de Servicios contra el borde izquierdo (hipótesis del
padding confirmada por CDP), pero el reviewer la rechazó porque a 1440px —
uno de los cuatro anchos nombrados en el criterio de aceptación — el texto
del nodo 5 seguía recortándose a media palabra. La ronda 2 demostró, midiendo
en vivo, que el recorte era independiente de la fórmula de ancho del canvas
(el borde izquierdo renderizado no se mueve una vez que el ancho ≥ la caja
disponible) y señaló la causa real en vez de adivinarla. El líder leyó
entonces el nodo real del `.pen` (`GiLTU`, 1440×1020): el canvas es el marco
completo de 1440px, no la caja de 1280px de `.closer` anidada adentro — dos
conceptos del diseño que se habían confundido en un solo token. La ronda 3
introdujo `--services-canvas-w` (1440px) y un full-bleed documentado que
rompe el `px-page` de `<main>` solo para este canvas — excepción aprobada
por Roberto al contrato ya revisado de la feature 14 — sin tocar ningún
token de posición de nodo/Pill/closer. Reviewer remidió a 1440 (nodo 5 sin
recorte, 62px de margen real, coincide exacto con la lectura del `.pen`) y
confirmó que 1536/1600/1920/1024/móvil no se rompieron. **Aprobado.**

`./init.sh` exit 0 — **58 archivos / 705 pruebas** (baseline 58/706, neta de
consolidación legítima de pruebas una vez que el estado `kind:'none'` dejó
de existir en `footerColumns.ts` — no es una regresión de cobertura).

## Next step

Con la 23 cerrada, solo quedan **`blocked`** en `feature_list.json`:

- **Features 15, 18, 19** (`projects_section`, `team_section`,
  `network_section`) — las tres siguen diferidas indefinidamente por decisión
  explícita de Roberto (esperando más colaboradores/proyectos/red, no una
  dependencia técnica). Nada más está en cola.

Sigue **abierto para Roberto y Clau**, sin bloquear nada (arrastrado de
sesiones previas): el body copy de `about.work.*` pendiente de confirmación;
la decisión #7 de `decisions-open.md` (si el CV es obligatorio,
`CV_REQUIRED = false` hoy); el catálogo real de roles por área bajo "Área y
rol" (`ROLE_CATALOG`, un placeholder por área hoy, dueño Clau); la
contradicción `content.md`/`.pen` sobre `Servicios` en el nav (feature 21) y
la desactualización de `ui-map.md` § 2 por el mismo rediseño; y ahora
también el `--services-canvas-w`/full-bleed de la feature 23, que diverge a
propósito del contrato "sin padding horizontal" que la feature 14 dejó
revisado — documentado en el propio componente, no oculto.
