# Contrato de integración — Form Submission API (muush.dev)

> Entregado por Roberto el 2026-10-05 como el contrato del backend ya
> desplegado. Se guarda aquí sin cambios en el contenido; las decisiones
> del sitio que se tomaron al recibirlo están en § 9 (al final).

Contexto para el agente del repositorio `muush.dev`. Describe los endpoints que
el backend ya expone y lo que el front tiene que hacer para consumirlos.

Este documento se derivó **leyendo el código del handler**, no de un diseño en
papel. Los nombres de campo, los códigos de error y las reglas de validación
son exactamente los que el servidor aplica hoy.

---

## 0. Estado actual — léelo antes de empezar

La infraestructura está aplicada **parcialmente**. Al momento de escribir esto:

- La API existe: `https://ma8y4vvt58.execute-api.us-east-1.amazonaws.com`
- La identidad SES está **verificada** y DKIM en `SUCCESS`.
- El bucket de CVs existe.
- **La API todavía NO tiene rutas** — un apply quedó a medias por una cuota de
  Lambda. Hasta que ese apply termine, los tres endpoints devuelven 404.

Puedes escribir toda la integración ahora, pero **no podrás probarla contra el
servidor real** hasta que el apply complete. Pregunta por el estado antes de
asumir que un 404 es un bug tuyo.

Además: **SES está en sandbox**. El correo de confirmación al usuario **no se
entregará** a direcciones no verificadas hasta que se apruebe el acceso a
producción. Esto no afecta tu integración — la API responde `200` igual — pero
no reportes como bug que "no llegó el correo de confirmación".

---

## 1. Lo esencial

**Base URL:** `https://ma8y4vvt58.execute-api.us-east-1.amazonaws.com`

Léela desde configuración (`runtimeConfig.public`), **nunca inline en un
componente**. Más adelante se migrará a `api.muush.dev` y debe ser un cambio de
configuración, no de código.

| Método y ruta | Para qué |
|---|---|
| `POST /contact` | Formulario "Cuéntanos tu proyecto" |
| `POST /careers` | Formulario de talento |
| `POST /careers/upload` | Pide autorización para subir el CV |

- Todo es JSON. `content-type: application/json`.
- **Sin autenticación.** No hay API key ni token de servicio, y no debes
  inventar uno: es un cliente público y cualquier credencial quedaría impresa
  en el bundle. El control de abuso es Turnstile.
- CORS permite solo `https://muush.dev`.
- **Las propiedades del JSON van siempre en inglés**, sin importar el idioma
  que vea el visitante.

---

## 2. Cloudflare Turnstile — obligatorio

Sin un token válido, **toda** petición se rechaza con `403`. El servidor falla
cerrado: si Cloudflare no responde, la petición también se rechaza.

Lo que tienes que hacer:

1. Cargar `https://challenges.cloudflare.com/turnstile/v0/api.js`.
2. Renderizar el widget con la **sitekey** (pídesela al dueño del repo; es un
   identificador público, va en `runtimeConfig.public`).
3. Mandar el token en el campo `turnstileToken` de cada petición.

### Tres reglas que se olvidan y rompen el flujo

- **El token es de un solo uso.** Reutilizarlo da `403`.
- **Caduca a los 300 segundos.** Si alguien abre el formulario y envía diez
  minutos después, el token ya venció. Maneja ese `403` pidiendo un token
  nuevo y reintentando, no mostrando un error genérico.
- **Una postulación con CV necesita DOS tokens**: uno para `/careers/upload` y
  otro **nuevo** para `/careers`. Son dos peticiones distintas.

---

## 3. `POST /contact`

### Cuerpo

| Campo | Tipo | Requerido | Regla |
|---|---|---|---|
| `name` | string | sí | mínimo 2 caracteres |
| `email` | string | sí | debe parecer un correo |
| `company` | string | no | sin regla; manda `""` si está vacío |
| `identity` | string | sí | uno de la lista de abajo |
| `need` | string | sí | mínimo 10 caracteres |
| `contactPreference` | string | sí | `"email"` o `"whatsapp"` |
| `whatsapp` | string | condicional | ver abajo |
| `locale` | string | sí | `"es"` o `"en"` |
| `turnstileToken` | string | sí | token fresco |

**`identity`** — valores válidos:
`realEstate`, `creator`, `company`, `independent`, `startup`, `other`

**`whatsapp`** — la regla condicional:
- Si `contactPreference` es `"whatsapp"`: exactamente **10 dígitos**. El
  servidor quita todo lo que no sea dígito antes de contar, así que
  `"55 1234 5678"` es válido.
- Si `contactPreference` es `"email"`: debe ir **vacío o ausente**. Mandar un
  valor aquí es un error de validación — el servidor lo trata como un payload
  que el sitio no pudo haber producido.

### Ejemplo

```json
{
  "name": "María Fernanda Ruiz",
  "email": "mf.ruiz@ejemplo.mx",
  "company": "Inmobiliaria Altavista",
  "identity": "realEstate",
  "need": "Queremos rehacer el sitio de la desarrolladora.",
  "contactPreference": "whatsapp",
  "whatsapp": "5544332211",
  "locale": "es",
  "turnstileToken": "0.abc..."
}
```

### Respuesta

```json
{ "ok": true, "received": true }
```

---

## 4. `POST /careers/upload` — solo si hay CV

El CV **nunca** pasa por la API. Se sube directo a S3 con una URL firmada.

### Cuerpo

| Campo | Tipo | Regla |
|---|---|---|
| `contentType` | string | exactamente `"application/pdf"` |
| `contentLength` | number | entero, > 0, máximo **5242880** (5 MiB) |
| `turnstileToken` | string | token fresco |

`contentLength` es `file.size`. Debe ser el **tamaño real**: queda firmado
dentro de la URL y S3 rechaza cualquier otra cosa.

### Respuesta

```json
{
  "ok": true,
  "cvId": "6f1b...-...-...",
  "uploadUrl": "https://...",
  "method": "PUT",
  "headers": {
    "content-type": "application/pdf",
    "content-length": "182344"
  },
  "expiresInSeconds": 600
}
```

### La subida

```js
await fetch(uploadUrl, {
  method: 'PUT',
  headers: res.headers,   // usa EXACTAMENTE los que devolvió el servidor
  body: file,
})
```

**Manda los headers tal cual vienen.** Están firmados; cualquier diferencia da
`403` de S3. No agregues otros, no cambies mayúsculas, no omitas ninguno.

Guarda el `cvId` — es lo único que mandas después. La ruta del objeto la elige
el servidor y el cliente nunca la ve ni la puede influir.

La URL vive 10 minutos.

---

## 5. `POST /careers`

### Cuerpo

| Campo | Tipo | Requerido | Regla |
|---|---|---|---|
| `name` | string | sí | mínimo 2 caracteres |
| `email` | string | sí | debe parecer un correo |
| `areaRole` | string | sí | un **id de rol** de los 24 (abajo) |
| `portfolio` | string | no | si va, URL bien formada |
| `linkedin` | string | no | si va, URL bien formada |
| `contactPreference` | string | sí | `"email"` o `"whatsapp"` |
| `whatsapp` | string | condicional | misma regla que en `/contact` |
| `locale` | string | sí | `"es"` o `"en"` |
| `cvId` | string | no | el UUID devuelto por `/careers/upload` |
| `turnstileToken` | string | sí | token **nuevo**, no el del upload |

**`cvId` es opcional**: una postulación sin CV es normal y se acepta. Si lo
mandas, debe ser un UUID con el formato exacto que devolvió el upload.

**`areaRole`** — manda el id del **rol**, no el del área. Los 24 válidos:

```
backend, frontend, fullStack, mobile, devOps, infrastructureCloud,
productManager, productOwner, uxResearch, uxUiDesign, productDesign,
designSystems, projectManager, sales, accountManagement, partnerships,
growth, performanceMedia, content, seo, communityManagement,
design3d, graphicDesign, blogStorytelling
```

⚠️ `it`, `product`, `projectManagement`, `marketing`, `creative` son **ids de
área** — etiquetas de grupo del select. No son valores válidos y el servidor
los rechaza. (`sales` es la única cadena que existe en ambas listas.)

### Respuesta

```json
{ "ok": true, "received": true }
```

---

## 6. Errores

Todas las respuestas de error tienen la forma `{ "ok": false, "error": ... }`.

| Código | `error` | Qué pasó | Qué hacer |
|---|---|---|---|
| `400` | `"invalid_json"` | el cuerpo no es un objeto JSON | bug del front |
| `400` | `{ "code": "validation_failed", "fields": [...] }` | uno o más campos inválidos | marcar esos campos |
| `403` | `"challenge_failed"` | token ausente, inválido, vencido o ya usado | token nuevo y reintentar |
| `500` | `"internal_error"` | fallo del servidor | mensaje genérico, permitir reintento |

En `validation_failed`, `fields` trae los **nombres de los campos** que
fallaron (`["email", "whatsapp"]`). Úsalo para marcar los inputs exactos en vez
de un error global.

**Campos desconocidos se rechazan.** Mandar una propiedad que no esté en las
tablas de arriba produce `validation_failed`. No se ignoran en silencio.

---

## 7. Lo que hay que construir en el sitio

1. **Reemplazar el `onSubmit` que hoy es un no-op deliberado** por el envío
   real, con sus estados de carga, error y éxito.
2. **El sitio no debe mostrar éxito falso.** Un estado de éxito solo se pinta
   con una respuesta `200` real.
3. **Base URL desde configuración**, nunca inline.
4. **Widget de Turnstile** en los dos formularios, con token fresco por
   petición.
5. **Flujo de talento con CV, en este orden**:
   `/careers/upload` → `PUT` a S3 → `/careers` con el `cvId`.
   Si la subida falla, la postulación **se puede enviar igual sin `cvId`** —
   es preferible perder el adjunto que perder al candidato.
6. **Manejo del `403` por token vencido**: pedir uno nuevo y reintentar una
   vez, en lugar de mostrar un error.
7. **Validar en cliente lo mismo que valida el servidor**, para no mandar
   peticiones condenadas. Las reglas ya existen en
   `contactFields.ts` / `applicationFields.ts` — el servidor las espeja, no al
   revés. **Si cambias una regla ahí, hay que cambiarla también en el
   backend**, o el usuario verá un formulario válido y recibirá un `4xx`.

---

## 8. Qué NO hacer

- No guardes ninguna credencial en el front. No existe ninguna que debas
  tener, y una variable de entorno en un sitio estático queda horneada en el
  bundle que descarga el navegador.
- No construyas la ruta del objeto del CV. Solo mandas `cvId`.
- No reutilices un token de Turnstile.
- No cambies los headers que devuelve `/careers/upload`.
- No mandes `whatsapp` cuando la preferencia es `email`.
- No mandes ids de **área** en `areaRole`.

---

## 9. Decisiones del sitio al recibir el contrato (Roberto, 2026-10-05)

- **Sitekey de Turnstile:** por ahora se usa la clave de prueba de Cloudflare
  en modo Invisible (`1x00000000000000000000BB`, siempre pasa; corregido el
  2026-10-05: `…AA` es la clave de prueba *visible*, según la documentación
  de Cloudflare). La real la pone Roberto en
  `.env` antes de desplegar. El servidor real **rechaza** tokens de la clave
  de prueba.
- **Modo del widget: Invisible.** Así se respeta "sin captcha visible" de
  `ui-map.md` § 7. La sitekey real tiene que estar configurada como
  *Invisible* en Cloudflare.
- **El honeypot y la marca de tiempo mínima de `ui-map.md` § 7 se
  mantienen** (todavía no existen en el código), pero solo del lado del
  cliente: si se activan, el envío no sale, y nunca se mandan al servidor,
  porque el servidor rechaza campos desconocidos (§ 6). El tiempo mínimo lo
  propone la spec y se aprueba en el gate.
- **Si la subida del CV falla**, la postulación se manda sin `cvId` y el
  estado de éxito lo dice con una nota (no se pierde en silencio). El copy
  ES/EN de esa nota lo propone la spec y Roberto lo aprueba en el gate.
