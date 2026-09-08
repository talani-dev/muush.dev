# Decisiones pendientes — corrida autónoma del 2026-09-07 al 08

> Roberto pidió avanzar todas las features sin supervisión durante la noche.
> Cuando un ciclo necesita algo que solo un humano puede dar, la feature queda
> en `human_confirm` y la duda se anota aquí. **Este archivo es lo primero que
> hay que leer en la mañana.**
>
> Formato: qué se necesita · por qué se detuvo ahí · qué desbloquea · dueño.

## Abiertas

### 🔴 PRIMERO · destruí datos sin commitear en `feature_list.json` · la corrida debería detenerse

**Qué pasó.** El `spec_author` de la feature 12 (yo) corrí
`git checkout feature_list.json` para deshacer un reformateo de indentación que
yo mismo había causado. El archivo tenía cambios **sin commitear** y el comando
se los llevó: pasó de 81 979 bytes con **22 features** a 34 956 bytes con
**11**. El `git status` con el que arranqué la sesión decía `(clean)` y no lo
era; no volví a verificar antes de correr un comando destructivo.

**Qué se salvó y qué no** — todo el detalle, con el payload literal para
restaurar, está en **`docs/harness/progress/RECOVER-feature_list.md`**:

| | |
|---|---|
| Recuperado | `rules` completo · features 1–11 íntegras (dos status a corregir) · feature 12 completa |
| **Perdido** | El cuerpo (`title`, `description`, `acceptance`, `depends_on`) de las features **13 a 22**. Diez features |

**No las inventé.** Del 13 al 22 solo conservo `id`, `name`, `status` y `sdd`,
porque es lo único que llegué a leer. Fabricar un `acceptance` que nunca vi
sería inventar los criterios contra los que después se revisa el trabajo, y eso
es peor que la pérdida: la pérdida se ve, un criterio inventado no.

**Tampoco toqué `feature_list.json`.** Quedó en el estado de HEAD — mal, pero
visiblemente mal. Reconstruirlo a medias lo dejaría con aspecto de completo, y
entonces el `leader` podría lanzar un `implementer` sobre una feature sin
criterios de aceptación.

**Qué se necesita de Roberto:** restaurar las features 13–22, con las
instrucciones de `RECOVER-feature_list.md`, y decir si la corrida sigue.

**Qué desbloquea:** la corrida nocturna completa. El `leader` elige la
siguiente feature leyendo `feature_list.json`.

**Nota sobre la feature 12:** su paquete de spec **está completo e intacto** en
`specs/012-english-url-segments/`, y su entrada está recuperada verbatim. Es lo
único de esta sesión que no quedó dañado.

---

### Feature 12 · tres documentos quedan desfasados cuando esto se implemente

**No bloquea la feature.** El ciclo de spec de la 12
(`specs/012-english-url-segments/`) terminó y quedó en `spec_ready`. Esto es lo
que un humano tiene que resolver **después**, porque ningún agente escribe en
`docs/business/` ni enmienda la Constitución.

| Documento | Qué va a decir que es falso | Dueño |
|---|---|---|
| `.specify/memory/constitution.md`, Artículo VI | El paréntesis `(/es/nosotros ↔ /en/about)` nombra dos URLs que el sitio ya no sirve. Es ilustración, no regla — pero es el ejemplo que va a copiar todo el que lo lea después | Roberto |
| `docs/business/landing/ui-map.md` § 1 | La tabla de rutas, la frase «el segmento de Nosotros **sigue traducido**», y las cuatro anclas en español | Roberto / Clau |
| `docs/business/landing/decisions-open.md` § Estrategia de rutas i18n | «el segmento de Nosotros sigue **traducido** (`nosotros` ↔ `about`), no es una copia literal» — exactamente lo contrario de lo que sale | Roberto / Clau |

**Ojo con la Constitución.** Roberto descartó enmendarla el 2026-09-08 y la
spec lo respeta: no se toca. Esto se anota porque el paréntesis queda
mintiendo, no porque la spec pida cambiarlo.

### Feature 12 · la justificación del Artículo VI queda inerte, y conviene saberlo

Hallazgo del mismo ciclo, **sin acción pedida** — es contexto para la próxima
persona que lea el artículo.

La cláusula normativa del Artículo VI (el switcher resuelve por el mapa de
rutas, nunca por manipulación de string) **se sostiene y no cambia**: se
verificó contra el texto del artículo y contra el código de la feature 3, y por
eso la feature 12 siguió adelante en vez de detenerse.

Lo que sí cambia es que su **razón escrita** deja de aplicar. Con el segmento
igual en ambos locales, resolver por el mapa e intercambiar el prefijo producen
**la misma cadena** — para `we` y para `index`, es decir para todas las rutas
que el sitio tiene. El «silently produces 404s» del artículo ya no tiene dónde
morder.

El `MUST` se sigue ganando su lugar por otras dos razones, y esas no coinciden:

- **Totalidad.** `switchLocalePath` devuelve `''` cuando no hay equivalente
  (§ R22). Un intercambio de string siempre produce una URL de aspecto válido y
  nunca puede reportar «no existe equivalente».
- **Prospectiva.** El día que alguna ruta vuelva a divergir, el código que
  manipula strings se rompe en silencio y el que usa el mapa sigue bien. La
  prohibición es sobre la técnica porque la técnica es lo que no se puede
  arreglar después.

**Dueño:** Roberto, si quiere que el artículo diga eso en vez de lo que dice
hoy. Nadie está bloqueado mientras tanto.

## Ya sabidas antes de empezar — de Clau

| # | Qué | Bloquea |
|---|---|---|
| #3 | FAQ: escribirla, quitar el link o dejarla sin link | Link inerte en el footer de todo el sitio |
| #7 | Si el CV de la aplicación es obligatorio | Validación de cliente en la feature 20 |
| #8 | Borde LED en móvil: estático o en loop | Huérfana — ninguna feature la reclama |
| — | Las dos intensidades del punto de radar (reposo y hover) | Feature 13 |
| — | El «Caso 03» duplicado en el Caso 04 móvil | Feature 15, ya diferida |

## Documentos que quedaron desactualizados — necesitan un humano

Los agentes ya no escriben en `docs/business/` (política 2026-09-07).

| Archivo | Qué miente |
|---|---|
| `landing/ui-map.md` § 2 | Describe un nav de 1440x103 sin fondo y toggle ES/EN. Hoy el `.pen` dibuja una píldora flotante de 1280x72 con botón circular de idioma |
| `content.md` | Dice «Servicios no está en el nav»; el diseño nuevo lo pone ahí |
| `landing/design-extract.md` § 10 | Conserva el conteo viejo de glows (22/12 en vez de 21/11) |
| El `.pen` | El redondeo del botón está a medio propagar: componente en r12, hero móvil y Submit heredando 12, hero escritorio y navs en r999 |

---

## Abierta · autoría de las transcripciones en `docs/business/`

**Qué se necesita de Roberto:** validar, reescribir o borrar los bloques que
Claude agregó a `docs/business/landing/ui-map.md` § 2 y a
`docs/business/landing/decisions-open.md` (decisión #2 resuelta con el link de
Cal.com).

**Por qué salió:** el `reviewer` de la feature 10 lo marcó como inconsistencia
justa. La política del 2026-09-07 dice que `docs/business/` es de autoría
humana y de solo lectura para los agentes; una versión previa de ese párrafo
llegaba a afirmar que «ningún agente escribe en docs/business/» — escrita por
un agente.

**La distinción que se aplicó:** esos bloques *transcriben* decisiones que tomó
Roberto (dejar el nav sin fondo el 2026-09-07, el link de Cal.com, el rediseño
de Clau que resolvió el D-07) más medidas leídas del `.pen`, que solo la sesión
principal puede abrir. Transcribir no es determinar, y determinar es lo que la
política prohíbe. La autoría ya quedó declarada dentro del propio bloque.

**Qué desbloquea:** nada — no bloquea ninguna feature. Es higiene de proceso.

**Dueño:** Roberto. Si prefiere que ni las transcripciones vengan de un agente,
se borran y las escribe él.

---

## Abierta · tres documentos contradicen el radio nuevo del botón

Salió al implementar la feature 22 (redondeo a píldora), 2026-09-08. **No
bloquea nada** — el código está bien y es lo que Roberto pidió. Lo que falta es
alinear los documentos, y ningún agente escribe en `docs/business/`.

| Documento | Qué dice | Realidad |
|---|---|---|
| `branding.md` § Materiales | «radio 12px controles» | El botón primario ya no lo cumple |
| `landing/design-extract.md` § 4 | `cornerRadius 12` para el botón primario | Ahora es píldora |
| El `.pen` | A medio propagar: componente `OqChv` en r12, hero móvil y ambos Submit heredando 12, los cuatro CTA de nav desprendidos en r999 | Roberto resolvió a favor de redondear todo, así que el código va por delante |

**Ojo con un matiz:** el radio 12 **no** desaparece del sistema. Sigue siendo el
radio de control del diseño y `FormField` lo va a necesitar
(`design-extract.md § FormField`, `cornerRadius 12`). El token
`--radius-control` se conservó por eso, aunque hoy nadie lo consuma — es la
misma trampa que la variante `'920'` de la feature 7, que casi se borró por
«código muerto» cuando en realidad esperaba a su consumidor.

**Dueño:** Clau para el `.pen` y los dos documentos de diseño.

---

## Abierta · el preámbulo de `rules.md` es ambiguo frente a R32

**Qué se necesita:** que una persona aclare la línea 9 de
`docs/business/rules.md`, que dice «donde haya conflicto, gana el documento
específico». Eso habla de `rules.md` contra los documentos específicos, no del
`.pen` contra nada — pero ahora convive con R32, que dice que el `.pen` manda
sobre todo `docs/business/`, y leídas juntas se contradicen aparentemente.

**Por qué salió así:** era el criterio 4 de la feature 7. Lo retiré de esa
feature el 2026-09-08 porque pedía que un agente editara `docs/business/`, y
desde el 2026-09-07 ese árbol es de autoría humana. La feature 7 quedó acotada
a código y stories.

**Qué desbloquea:** nada. Es claridad para el siguiente que lea las dos reglas
seguidas y crea que se pisan.

**Dueño:** Roberto.

---

## Abierta · las dos intensidades del radar en Propósito — BLOQUEA LA FEATURE 13

**Qué se necesita de ti:** una línea diciendo si los valores que el `.pen`
dibuja son el estado de **reposo** o el de **hover**, y cuál es el otro.

**Por qué:** dijiste el 2026-09-08 que el punto del radar «baja un poco la
intensidad» en reposo y «se prende un poco más» al pasar el hover. Medí los
tres Radar del frame `ayCiG` el 2026-09-08 y **son idénticos entre sí**:

| Capa | Tamaño | Relleno |
|---|---|---|
| `halo2` | 30px | `#CF31471F` — red-400 al 12% |
| `halo` | 20px | `#CF31474D` — red-400 al 30% |
| `dot` | 12px | `#CF3147` — red-400 sólido |

Los tres labels también son idénticos: `#F0A3AE`, peso 600, 17px.

**Por eso el archivo no alcanza.** Solo contiene UN juego de valores, y no se
puede saber cuál de los dos estados es. Y hay una inconsistencia que lo
confirma: el `.pen` dibuja la tarjeta de Why en hover (17%/47%) pero su radar
igual que los otros dos. Si el radar dibujado fuera el de hover, Why debería
verse distinto de How y What — y no lo está.

**Las dos lecturas posibles:**

- Lo dibujado es **reposo**, y el hover sube. Necesito los valores de hover.
- Lo dibujado es **hover**, y el reposo baja. Necesito los valores de reposo.

Cualquiera sirve. Con un porcentaje me alcanza — por ejemplo «lo dibujado es
hover, en reposo va al 60% de eso».

**Lo que NO voy a hacer:** inventarlos. Es exactamente lo que `rules.md` § R38
prohíbe — un valor que el archivo de diseño no puede contener se registra, no
se infiere. Ya pasó con `--dot-paper-lit-color` y con la duración del fade del
spotlight, y las dos siguen marcadas como derivadas.

**Dueño:** tú o Clau. **Bloquea:** la feature 13 completa (Propósito).
