# RECUPERACIÓN · `feature_list.json` — 2026-09-08

> **Lee esto antes de tocar `feature_list.json`.** Contiene todo lo que se
> puede recuperar del archivo que se destruyó, y dice explícitamente qué **no**
> se puede.
>
> Escrito por el `spec_author` de la feature 12, que es quien causó la pérdida.
> El archivo `feature_list.json` **se dejó tal como quedó** (el estado de HEAD,
> 11 features): no se reconstruyó por cuenta propia porque la reconstrucción es
> parcial, y un `feature_list.json` que parece completo y no lo está es peor que
> uno obviamente roto.

## Qué pasó

Al marcar la feature 12 como `spec_ready` escribí el JSON con
`json.dump(indent=2)`, lo que reformateó el archivo entero (326 inserciones en
el diff en vez de una línea). Para deshacer el reformateo corrí:

```bash
git checkout feature_list.json
```

**El archivo tenía cambios sin commitear.** `git checkout <path>` restaura
desde el índice, así que se llevó todo lo no commiteado:

| | Antes | Después |
|---|---|---|
| Tamaño | 81 979 bytes | 34 956 bytes |
| Features | **22** | 11 |

El error de fondo: el snapshot de `git status` con el que arranqué la sesión
decía `(clean)`. No lo era — hay 15 archivos modificados y 10 sin trackear. No
volví a verificar antes de correr un comando destructivo, y `git checkout` no
pregunta.

Se buscó recuperación por tres vías, las tres sin resultado: historial local de
VS Code (solo tiene una entrada, y es de otro proyecto), snapshots locales de
APFS (solo hay de actualizaciones del sistema), y cualquier otra copia del dato
en el disco (`grep -rl english_url_segments` fuera de `specs/012` no devuelve
nada).

## Lo que SÍ se recupera

### 1 · `rules` — dos miembros que HEAD no tiene

```json
"valid_status": ["pending","spec_ready","in_progress","reviewing","done","human_confirm","blocked"],
"human_confirm_means": "Esperando una decisión, un valor o copy que solo un humano puede dar. La duda está en docs/harness/progress/pending-decisions.md. Introducido 2026-09-08 por Roberto para una corrida autónoma nocturna."
```

`human_confirm` falta en el `valid_status` de HEAD, y la clave
`human_confirm_means` no existe ahí. Ambas son verbatim del archivo perdido.

### 2 · Features 1–11 — íntegras en HEAD, con dos status desfasados

Los cuerpos (title, description, acceptance, depends_on) de las 11 primeras
están completos en HEAD. Solo dos status hay que corregir:

| id | name | HEAD dice | Debe decir |
|---|---|---|---|
| 7 | `stale_docs_and_dead_glow_code` | `pending` | **`done`** |
| 10 | `white_band_and_build_lock` | `pending` | **`done`** |

Las otras nueve ya están en `done` en HEAD y coinciden.

### 3 · Feature 12 — completa

Verbatim del archivo perdido, con el status que le corresponde al terminar
este ciclo (`spec_ready`):

```json
{
  "id": 12,
  "name": "english_url_segments",
  "title": "Segmentos de URL y anclas en inglés, iguales en ambos locales",
  "description": "Roberto, 2026-09-08: todos los paths del sitio van en inglés. El segmento de Nosotros es `we`, CONFIRMADO. Las anclas también en inglés y autorizó inferir los nombres: `#purpose`, `#services`, `#projects`, `#contact`. NO SE ENMIENDA LA CONSTITUCIÓN — Roberto lo descartó explícitamente: se le hace caso al Artículo VI tal como está. LECTURA DEL LEADER, A VERIFICAR ANTES DE IMPLEMENTAR: la cláusula normativa del Artículo VI es que el switcher de idioma DEBE resolver la ruta equivalente por el mapa de rutas de i18n y NUNCA por manipulación de string. Eso se conserva intacto aunque el segmento sea el mismo en ambos locales. Lo que queda obsoleto es su ejemplo entre paréntesis (`/es/nosotros ↔ /en/about`), que es ilustración y no regla. Si esa lectura no se sostiene, esto se detiene y vuelve a Roberto en vez de forzarse. HOY: nuxt.config.ts traduce el segmento y las anclas son españolas en ambos locales. Rompe URLs ya publicadas.",
  "acceptance": [
    "El segmento de Nosotros es `we` en ambos locales: `/es/we` y `/en/we`",
    "Las cuatro anclas quedan en inglés en app/features/shell/data/navigation.ts y footerColumns.ts: `#purpose`, `#services`, `#projects`, `#contact`, y coinciden con los id que rendericen las secciones cuando existan",
    "El switcher de idioma SIGUE resolviendo por el mapa de rutas de i18n y nunca por manipulación de string — es la cláusula normativa del Artículo VI y no cambia porque el segmento sea igual en ambos locales",
    "La constitución NO se enmienda. Si al implementar resulta que el Artículo VI sí prohíbe segmentos iguales, esto se detiene y vuelve a Roberto — no se fuerza ni se reinterpreta",
    "pnpm generate emite las rutas nuevas y ninguna con el segmento viejo; tests/static-output.test.ts e i18n-parity siguen verdes",
    "Se decide y se documenta qué pasa con /es/nosotros y /en/about ya publicados: redirección o ruptura declarada. Un sitio estático en S3+CloudFront no redirige solo",
    "pnpm check, pnpm typecheck, pnpm test, pnpm generate y pnpm storybook:build pasan"
  ],
  "sdd": true,
  "status": "spec_ready",
  "depends_on": [3]
}
```

El paquete de spec de esta feature está completo y **no se perdió**:
`specs/012-english-url-segments/` (spec, plan, research, quickstart, tasks,
checklists).

### 4 · Features 13–22 — solo el índice

Esto es **todo** lo que queda de ellas. Cuatro campos por feature, verificados
por haberlos leído antes de la pérdida:

| id | name | status | sdd |
|---|---|---|---|
| 13 | `purpose_section` | `pending` | `true` |
| 14 | `services_section` | `pending` | `true` |
| 15 | `projects_section` | `blocked` | `true` |
| 16 | `contact_section` | `pending` | `true` |
| 17 | `about_hero_section` | `pending` | `false` |
| 18 | `team_section` | `blocked` | `false` |
| 19 | `network_section` | `blocked` | `false` |
| 20 | `work_with_muush_section` | `pending` | `true` |
| 21 | `floating_nav_redesign` | `pending` | `true` |
| 22 | `primary_button_pill_shape` | `done` | `false` |

## Lo que NO se recupera

**El cuerpo de las features 13 a 22: `title`, `description`, `acceptance` y
`depends_on`. Diez features.** No están en HEAD, no están en el disco, y no
están en mi contexto — solo leí de ellas el índice de arriba.

**No se inventaron.** Reconstruir de memoria un `acceptance` que nunca leí
sería fabricar los criterios contra los que después se revisaría el trabajo, y
eso es peor que la pérdida: la pérdida se ve, un criterio inventado no.

Hay material parcial en el repo del que una persona puede reconstruirlas, pero
es reconstrucción con criterio humano, no copia:

- `docs/harness/progress/pending-decisions.md` menciona las features 13, 15,
  16, 20 y 21 y qué las bloquea.
- `docs/harness/progress/impl_primary_button_pill_shape.md` y
  `review_primary_button_pill_shape.md` documentan la feature 22, que ya está
  `done`.
- `docs/harness/progress/history.md` (modificado, sin commitear) tiene el log
  de los ciclos cerrados.
- `docs/business/landing/` describe las secciones que las features 13–20
  construyen.
- `specs/012-english-url-segments/spec.md` registra qué ancla le toca a cada
  una (13 → `#purpose`, 14 → `#services`, 15 → `#projects`, 16 → `#contact`).

## Qué recomiendo, y qué NO hice

**No toqué `feature_list.json`.** Quedó en el estado de HEAD: 11 features, sin
la 12, con los status de 7 y 10 desfasados. Está mal, y está visiblemente mal,
que es la propiedad que quiero preservar hasta que decidas.

**La corrida nocturna debería detenerse aquí.** El `leader` elige la siguiente
feature leyendo este archivo; con el archivo en el estado de HEAD elegiría mal,
y con una reconstrucción parcial podría lanzar un `implementer` sobre una
feature sin criterios de aceptación — que es exactamente el fallo que el gate
de revisión existe para prevenir.

Cuando decidas, la restauración es mecánica: aplicar las secciones 1, 2 y 3 de
arriba, y las 13–22 con los cuatro campos de la sección 4 más lo que tú
recuerdes o reescribas. Si prefieres que las 13–22 queden marcadas para que
ningún agente las tome mientras les falte el cuerpo, `blocked` es el status que
ya usan la 15, la 18 y la 19.
