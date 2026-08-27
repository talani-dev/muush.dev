# Landing — decisiones abiertas y discrepancias

> Fuente: Notion → Landing · Mapa de UI § 11-12, Project State § Próximo
> trabajo. Sincronizado 2026-08-27. **Cualquier spec que toque estas áreas
> debe marcarlas `[NEEDS CLARIFICATION]` en vez de asumir una respuesta.**

## Bloqueantes (sin esto, la feature correspondiente no se puede cerrar)

| # | Decisión | De quién | Por qué bloquea |
|---|---|---|---|
| 1 | A dónde llegan los formularios: servicio externo (Formspree/Web3Forms), función serverless a support@muush.dev, o directo a CRM del Company OS | Roberto y Clau | Sin esto no hay formulario funcional |
| 2 | Link real de Google Calendar para el CTA de llamada | Clau | Aparece en hero, CTA final y footer |
| 3 | Qué pasa con FAQ: escribirla, quitar el link del footer, o dejarla "próximamente" sin link | Clau | Hoy sería un 404 en el footer de todo el sitio |
| 4 | Estrategia de URL del idioma: prefijo `/en/` vs. parámetro vs. estado del cliente | Roberto | Afecta SEO y el enrutamiento i18n de todo el sitio (ver conflicto con el scaffold en `ui-map.md`) |

## No bloqueantes (afectan diseño/UX, no impiden implementar)

| # | Decisión | De quién |
|---|---|---|
| 5 | Nav fijo al hacer scroll y su estado comprimido — falta el frame | Clau y Roberto |
| 6 | Frame del menú hamburguesa abierto — el contenido ya está definido en `ui-map.md` | Clau |
| 7 | Si el CV de la aplicación (Nosotros) es obligatorio, y dónde se guardan los archivos | Clau |
| 8 | Borde LED en móvil: estático o en loop permanente (no hay hover en móvil) | Clau |
| 9 | Si el envío del formulario dispara también un correo de confirmación al usuario | Clau |

## Discrepancias detectadas (documentar o resolver antes de codear)

| Qué | Detalle |
|---|---|
| Slots de proyectos | Escritorio tiene 4, móvil tiene 3 — igualar o documentar la diferencia a propósito |
| Opciones de "¿Cómo te identificas?" | El archivo de diseño (Pencil) tiene 6 opciones; `content.md` documenta 5. "Restaurante o bar" está en el diseño sin documentar — conecta con el tema de restaurantes/bares como vertical, guardado para después |
| Copy de Nosotros | Hero, Network y Work with muush siguen marcados como borrador, falta aprobar |

## Conflicto de arquitectura (no viene de Notion — detectado al comparar con este repo)

El scaffold de este repo configuró rutas simétricas con prefijo en ambos
locales (`prefixDefaultLocale: true` → `/es/`, `/en/`). El diseño real
(ver `ui-map.md` § 1) usa ES sin prefijo (`/`) y Nosotros con rutas
**asimétricas** por locale (`/nosotros` vs `/en/about`, no una traducción
literal de segmento). Esto requiere either reconfigurar el i18n routing de
Astro, o resolver el mapeo de rutas manualmente (patrón
`useTranslatedPath`/`getRouteFromUrl` de la recipe de i18n de Astro) —
decisión que le toca a la primera spec real de la landing, no algo para
asumir en `docs/business/`.
