# Current session

- **Feature in progress:** 12 · `english_url_segments`
- **Start:** 2026-09-08
- **Agent:** `spec_author`

## Plan

Ciclo SDD completo de la feature 12: `/speckit-specify` → `/speckit-plan` →
`/speckit-tasks`, con verificación previa de la lectura del Artículo VI de la
que depende toda la feature.

## Log

### El paquete de spec — terminado

`specs/012-english-url-segments/` contiene `spec.md`, `plan.md`, `research.md`,
`quickstart.md`, `tasks.md` (37 tareas) y `checklists/requirements.md`.
**Cero marcadores `[NEEDS CLARIFICATION]`**, así que no se corrió
`/speckit-clarify`: las tres preguntas que podían frenar esto ya venían
contestadas por Roberto el 2026-09-08.

**El gate del Artículo VI: la lectura se sostiene.** Verificada contra el texto
del artículo (los dos `MUST` cuelgan del mecanismo del switcher; la cláusula
inicial es declarativa y su paréntesis es ejemplo) y contra el código de la
feature 3 (`useShellNavigation.ts`, `resolveLocaleDestination.ts`,
`LanguageToggle.vue` — ninguno manipula el prefijo). La Constitución no se
enmienda y ninguno de esos archivos cambia. La feature **no** va a
`human_confirm`.

**Las tres decisiones que la spec cierra:**

1. **URLs publicadas → redirección**, con dos documentos estáticos en `public/`
   siguiendo el precedente de `public/index.html` (§ R25). Se registra el costo:
   un meta refresh es redirección suave, no un 301; el 301 vive en la
   distribución de CloudFront, fuera de este repo (Artículo IV).
2. **Las anclas se renombran ahora.** Renombrar un ancla muerta es neutral, y
   deja de obligar a cuatro features futuras a editar los datos de una feature
   `done`. No resuelve la inconsistencia D-03.
3. **`hreflang` correcto por construcción** — `useLocaleHead()` lee la misma
   tabla de rutas. Consecuencia registrada: con segmentos iguales, los dos
   alternates difieren solo por el prefijo, así que el test tiene que seguir
   afirmando **procedencia**, no forma.

Hallazgo del ciclo (`research.md` § R-4): **ni un solo test existente puede
detectar que se rompa el `aria-current="page"`** del link de Nosotros. El test
de comparación del nav lo borra a propósito, y el de componente lo recibe
inyectado. La spec agrega la aserción y exige el rojo deliberado.

### 🔴 Incidente — destruí datos sin commitear en `feature_list.json`

Corrí `git checkout feature_list.json` para deshacer un reformateo de
indentación mío. El archivo tenía cambios sin commitear: pasó de 22 features a
11. El `git status` del arranque de sesión decía `(clean)` y no lo era.

- Detalle completo y payload de restauración:
  **`docs/harness/progress/RECOVER-feature_list.md`**
- Anotado como primer punto de `pending-decisions.md`
- **Recuperado:** `rules`, features 1–11, feature 12 completa
- **Perdido:** el cuerpo de las features **13–22** (diez). No se inventaron
- `feature_list.json` se dejó en el estado de HEAD, sin reconstruir a medias

**La feature 12 NO quedó marcada `spec_ready`** — no hay dónde marcarla: su
entrada ya no está en el archivo. Su entrada recuperada, con
`"status": "spec_ready"`, está lista para pegar en `RECOVER-feature_list.md`.

## Next step

**Detener la corrida y esperar a Roberto.** El `leader` elige la siguiente
feature leyendo `feature_list.json`, y ahora mismo ese archivo miente. Primero
restaurar las features 13–22 con `RECOVER-feature_list.md`; después, el paquete
de la feature 12 está listo para el gate de aprobación humana.
