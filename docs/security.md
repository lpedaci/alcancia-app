# Seguridad y privacidad

> Fecha: 12/11/2026 · Sección 14.12 de la spec, D-70. Alcancía es un prototipo de portfolio sin backend, publicado en GitHub Pages. Este documento separa tres capas, como en Rumbo: lo que se **simula** en la interfaz, lo que se **aplica de verdad** en el front-end y lo que haría falta **en producción**.

## 1. Seguridad simulada en la interfaz (8.1)

Son patrones de diseño: se ven y se recorren como en un producto real, pero no protegen nada, porque no hay servidor.

| Patrón | Dónde | Qué muestra |
| --- | --- | --- |
| Inicio de sesión con SSO | G1, G2 | Microsoft y Google con sus logos oficiales, y una pantalla neutra y rotulada que nunca imita sus páginas |
| Verificación en dos pasos | G3 | Obligatoria para admin y decisor; código de demo `246810` precargado |
| Bloqueo por intentos | G1 | Error genérico (no dice si el correo existe) y bloqueo al quinto intento, sin autodesbloqueo |
| Mesa de ayuda | G4 | Solicitud con número, la misma respuesta exista o no el correo |
| Expiración de sesión | Todas las pantallas con sesión | Aviso a los 13 minutos de inactividad y cierre a los 15 |
| Permisos por rol (RBAC) | Rutas y vistas | Matriz única en `src/lib/permissions.ts`; "Acceso no permitido" en rutas ajenas |
| Aviso de privacidad | G5 | Qué ve y qué no ve la empresa, en lenguaje simple, al primer ingreso |
| Umbral de privacidad | Paneles de tutor, admin y decisor | Ninguna métrica para grupos de menos de 5 personas |
| Seguridad de la billetera | Misión "Configura tu seguridad", P14 | Segundo factor, límite diario y "el código no se comparte nunca" |

## 2. Lo que se aplica de verdad en el front-end (8.2)

| Capa | Cómo | Verificación |
| --- | --- | --- |
| Política de seguridad de contenido (CSP) | Etiqueta `<meta http-equiv="Content-Security-Policy">` inyectada en el build desde `src/app/security.ts`: `default-src 'self'`, `script-src 'self'` estricto, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `upgrade-insecure-requests`. `style-src` permite estilos en línea porque Radix, Motion y Recharts los usan con valores en tiempo de ejecución | La CI falla si `dist/index.html` no tiene la etiqueta |
| Sin HTML inyectado | Regla de ESLint que prohíbe `dangerouslySetInnerHTML` | `npm run lint` en la CI y en el hook `pre-push` (D-141) |
| Dependencias auditadas | `npm audit --audit-level=high` y versiones fijas | Paso "Security audit" de la CI |
| Validación de datos | Zod en los formularios; los montos se normalizan antes de usarse | Tests de `MoneyInput` y `parseDecimalInput` |
| Enlaces externos | `target="_blank"` siempre con `rel="noopener noreferrer"` | Revisión de código |
| Sin datos reales | Nunca se pide DNI, CUIT, CBU, tarjetas, contraseñas ni datos de contacto reales; el CVU es `0000000 0000000 EJEMPLO 00` | Revisión de formularios (RF-35) |
| Montos solo en el navegador | Billetera, escenarios, metas, respuestas de hábitos y reflexiones viven en un espacio de `localStorage` por persona y ninguna vista de otro rol los lee (D-58, D-62) | `privacy-boundaries.test.ts` |
| Umbral de 5 personas | Toda métrica agregada pasa por `aggregate()` en `src/lib/metrics.ts`, con supresión complementaria (D-133) | Tests de `metrics.ts` |

## 3. Límites de GitHub Pages

- **No permite encabezados HTTP propios.** Por eso la CSP va en una etiqueta `<meta>`, que cubre lo principal (scripts, objetos, formularios y conexiones) pero no todo.
- **`frame-ancestors` no funciona desde `<meta>`**: el navegador la ignora, así que la página se podría mostrar dentro de un `<iframe>` de otro sitio (riesgo de *clickjacking*). Tampoco funcionan desde `<meta>` `report-uri` ni `sandbox`.
- **Sin HSTS propio, `X-Content-Type-Options`, `Referrer-Policy` ni `Permissions-Policy`**: GitHub Pages sirve HTTPS, pero no deja configurar estos encabezados.
- **Sin protección configurable** ante bots o denegación de servicio, más allá de la que da GitHub.

Para un prototipo sin datos reales ni sesiones verdaderas, el riesgo es bajo: no hay nada que robar. Igual se documenta, porque es lo que habría que resolver antes de cualquier uso real.

## 4. Mejora futura: Cloudflare con un dominio propio (D-70)

Requiere un **dominio propio**: Cloudflare no puede ponerse delante de `lpedaci.github.io`. Hay dos caminos:

1. **Cloudflare delante de GitHub Pages.** El dominio apunta a GitHub Pages pasando por el proxy de Cloudflare, y los encabezados se agregan con sus reglas de transformación de respuestas. El despliegue sigue igual.
2. **Cloudflare Pages.** El sitio se publica directamente en Cloudflare Pages, con un archivo `_headers` versionado en el repositorio. Es más simple de mantener, porque los encabezados quedan en el código y se revisan como cualquier cambio.

Encabezados que sumaría:

| Encabezado | Para qué |
| --- | --- |
| `Content-Security-Policy` (como encabezado) con `frame-ancestors 'none'` | La misma política de hoy, más la protección contra *clickjacking* |
| `Strict-Transport-Security` (HSTS) | Obliga a usar HTTPS en todas las visitas siguientes |
| `X-Content-Type-Options: nosniff` | Evita que el navegador interprete un archivo con otro tipo |
| `Referrer-Policy: strict-origin-when-cross-origin` | No envía la ruta completa a otros sitios |
| `Permissions-Policy` | Apaga cámara, micrófono, ubicación y otras funciones que la app no usa |

Además, Cloudflare suma protección ante bots y ataques de denegación de servicio.

## 5. Arquitectura de producción (8.3)

Si Alcancía pasara a producción:

- **Identidad:** SSO con OIDC o SAML y MFA del proveedor de identidad de la empresa; sesiones en cookies `HttpOnly`, `Secure` y `SameSite`.
- **Permisos en el servidor:** la matriz de `permissions.ts` se aplica en cada endpoint, no solo en la interfaz.
- **Multi-tenant por empresa:** cada organización ve solo sus datos.
- **Datos financieros personales:** se calculan en el dispositivo y no se envían al servidor; si alguna vez se guardan, cifrados y fuera del alcance de la organización.
- **Métricas agregadas** con el umbral mínimo de 5 personas, calculadas en el servidor.
- **Ley 25.326** de protección de datos personales: acceso, rectificación y supresión (F16). Si se trabajara con menores, consentimiento de sus responsables y mínimos datos.
