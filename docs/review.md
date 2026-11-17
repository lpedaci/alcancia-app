# Informe final (paso 36)

> Fecha: 16/11/2026. Cierra la fase B y acompaña la release **v1.0.0**. La revisión intermedia de la fase A, su auditoría y su ajuste están en [review-fase-a.md](review-fase-a.md).

## 1. Resumen

Alcancía es un simulador de finanzas personales en el que se aprende usando una billetera virtual con dinero ficticio. Lo puede ofrecer una organización, una institución educativa o un producto existente. Con este paso quedan completas la fase A, su ajuste y los quince pasos de la fase B (22 a 36).

- **Producto:**
  - billetera de 9 niveles (0 a 8, cripto incluido);
  - 13 misiones;
  - 18 módulos con tres guías cada uno;
  - 12 herramientas;
  - cuenta comitente de práctica;
  - escape room con tres versiones;
  - paneles del tutor, el admin y el decisor;
  - tres contextos de uso y el modo integrado en Hornero;
  - modo oscuro e interfaz completa en inglés.
- **Calidad:** al 16/11/2026 pasan 777 tests unitarios (58 archivos), 1.181 de Playwright en desarrollo y 130 de Playwright sobre el build de producción con la CSP activa.
- **Decisiones:** 242 decisiones registradas en [decisions.md](decisions.md), de la D-01 a la D-327.
- **Pendiente:** contenido y datos que esperan la revisión del Lic. Kevin Giampieri o la lectura de una norma (sección 9). Mientras una pregunta sigue abierta, la app no muestra el dato, o lo muestra con la redacción más prudente.

## 2. Qué se hizo en la fase B, por paso

| Paso | Función | Qué quedó |
| --- | --- | --- |
| 22 | Valores reales (D-79) | Snapshot diario del BCRA y el INDEC generado en la CI, con fecha y fuente; Rendir, Tarjeta y préstamos y las herramientas parten de esos valores. Los precios de acciones y CEDEARs siguen siendo de ejemplo |
| 23 | Contextos de uso (D-74, D-83, D-84) | Andina, Instituto Superior Ceibo (solo personas de 18 años o más) y Hornero, con vocabulario y roles por contexto y "Ver como" con contexto |
| 24 | Modo integrado y F21 | Página de Hornero con marca ficticia rotulada, billetera sin la barra de Alcancía, avisos al socio y registro tipo xAPI con seudónimos |
| 25 | F19 y F9 | Repasos a los 7 y 30 días, y recordatorios con vista previa por canal según el contexto |
| 26 | D-80 y F20 | Meta colectiva por cohorte y espacio de preguntas moderado, sin rankings ni montos |
| 27 | Contenido, F11 y F22 | Guías 2 y 3 de los 16 módulos de fase A, módulos 16 y 18 completos y nivel 8 Cripto, publicados por tandas aprobadas |
| 28 | F18 | Escape room "Tu primer sueldo" con Fuerte: cinco salas en tres versiones, insignias de bronce, plata y oro descargables, y modo simple como alternativa accesible |
| 29 | F12 | Insignias de módulo en SVG y certificado imprimible, sin datos económicos |
| 30 | F15 | Seguimiento a 30 días que alimenta el nivel 3 de Kirkpatrick, agregado y con umbral |
| 31 | F14 | Constructor de lecciones con los nueve tipos de pregunta de 5.1 y de tarjetas en el momento justo, publicados por cohorte |
| 32 | F13 | Agenda de encuentros grupales y 1:1, pedidos de la persona y grabaciones simuladas |
| 33 | F16 | Mi privacidad: qué hay guardado, dónde y quién lo ve, con descarga de datos y pedidos según los plazos de la Ley 25.326 |
| 34 | F10 | Glosario de 54 términos con búsqueda sin acentos, y biblioteca con un resumen imprimible por módulo |
| 35 | F17 | Modo claro, oscuro o del sistema, con AA en los dos temas; interfaz completa en inglés, con el contenido de aprendizaje en español y un aviso |
| 36 | Informe y release | Este informe, imágenes del README e imagen para compartir regeneradas, y la release v1.0.0 |

**Ajustes de diseño posteriores, pedidos por Lourdes (D-308 a D-327):**
- acciones a todo el ancho en celular;
- panel de avance y salida del escape room;
- botones del perfil;
- Fuerte y Hornero más apagados en modo oscuro;
- landing en celular: portada en una pantalla, menos texto, recorridos como filas, simulador a pedido, sin carruseles, cifras en 2 × 2;
- maqueta del teléfono sin Fuerte en el inicio.

## 3. Criterios de aceptación

Los criterios de la fase A y de su ajuste siguen cumpliéndose; la evidencia está en [review-fase-a.md](review-fase-a.md) y en las suites, que se corrieron completas antes de cada commit. Lo que agrega la fase B:

| Criterio | Evidencia |
| --- | --- |
| Valores reales con fecha y fuente, dinero ficticio y futuro como escenario | `scripts/fetch-market.mjs`, `public/market/snapshot.json`, tests del snapshot y de las pantallas que lo usan |
| La privacidad no cambia con el contexto | `privacy-boundaries.test.ts` y `org-scope.test.ts`: ningún panel ve montos, movimientos, metas ni hábitos, y cada organización ve solo sus datos |
| Contexto educativo solo con personas de 18 años o más | Datos semilla del Instituto Superior Ceibo y su test |
| Hornero rotulado y sin parecido con apps reales | Etiqueta "Marca ficticia de demostración" en la página, el aviso y el menú (D-87); paleta propia verificada en AA (D-248) |
| Umbral de 5 en todo lo nuevo (meta colectiva, escape room, seguimiento, registro xAPI) | Tests de `metrics.ts` y de cada panel |
| Escape room accesible | Todo por teclado, modo simple sin capa de juego, axe sin errores en 3 anchos y en modo oscuro |
| Inglés completo | `locales.test.ts`: mismas claves y placeholders en los dos idiomas, sin "¿", "¡" ni guiones largos; 0 textos de interfaz sin traducir |
| Modo oscuro en AA | `tokens.test.ts` corre el contraste en los dos temas; axe sobre 12 pantallas oscuras |
| Sin desbordes en los 6 anchos | `overflow.spec.ts` sobre todas las pantallas de todos los roles y contextos |

## 4. Cálculos

Las fórmulas siguen en `src/lib/finance/`, con `decimal.js` y casos calculados a mano en [formulas.md](formulas.md). Lo que se sumó en la fase B:
- el rendimiento con valores reales del BCRA;
- los números de las guías 2 y 3, calculados a mano por tanda y verificados con tests antes de publicarse;
- las cuentas de las salas del escape room en sus tres versiones;
- el ejemplo del simulador en la landing ($ 100.000 a 12 meses con 3 % mensual compran $ 70.137,99, F-05).

Ningún cálculo de dinero usa `number`.

## 5. Seguridad y privacidad

- **En el front:**
  - CSP en `<meta>`, verificada sobre el build real en 130 tests de producción;
  - sin `dangerouslySetInnerHTML`;
  - enlaces externos con `noopener noreferrer`;
  - validación con Zod;
  - `npm audit` en la CI.
- **Datos:** solo de demo en el navegador. Los montos, hábitos, reflexiones y partidas del escape room nunca salen del navegador de la persona. Mi privacidad muestra eso mismo a quien participa.
- **Límites conocidos:** GitHub Pages no permite encabezados HTTP propios. La mejora con Cloudflare y un dominio propio está documentada en [security.md](security.md) (D-70).

## 6. Documentación

Al día con lo construido:
- los documentos de la sección 14 (`docs/`);
- el sistema de diseño público y su versión en Markdown;
- los README en español e inglés.

En este paso se regeneraron:
- **las 13 imágenes de `docs/readme/`:** billetera en computadora y celular, los cuatro roles, el ciclo "¿Por qué importa?", Rendir, una misión, Apartados en tres anchos y Hornero;
- **la imagen para compartir:** `public/og-image.png`;
- **las capturas de `docs/screenshots/`:** 821 archivos generados por las suites;
- **los textos alternativos y el estado del proyecto** en el README.

## 7. Lo que no se pudo verificar

- **Lector de pantalla:** no se hizo una prueba completa con NVDA o VoiceOver en las pantallas de la fase B. La cobertura viene de axe, los recorridos con teclado de Playwright y la estructura semántica.
- **Valores reales:** dependen de que la API del BCRA siga respondiendo. Si falla, la app conserva el último valor con su fecha y lo dice (Q-18 a Q-20).
- **Fallas intermitentes:** algunas pruebas de Playwright fallaron una vez en corridas completas y pasaron solas: el escape room, la barra fija de la landing y desbordes de dos pantallas de contexto. Están en [issues.md](issues.md), INC-12. La de la landing se corrigió; las demás siguen bajo observación.
- **Traducción:** el inglés lo escribió Claude Code y no lo revisó una persona nativa. El contenido de aprendizaje queda en español a propósito.

## 8. Riesgos para la demo

- **Datos en el navegador:** si una persona visitante borra los datos del navegador o usa una ventana privada, la demo vuelve al estado inicial. "Restablecer demo" está en la landing y en el menú de usuario.
- **Mantenimiento:** los datos de los Anexos C y D (brókers, billeteras y fintech) cambian seguido y conviene volver a verificarlos antes de difundir la demo (Q-07 a Q-10, Q-15).
- **Valores reales:** un valor real del BCRA mostrado junto a un resultado puede leerse como recomendación. Por eso el escenario y el aviso legal quedan visibles en cada resultado (1.2).

## 9. Dudas y decisiones abiertas

- **Preguntas de contenido y datos:** quedan 9 abiertas en [questions.md](questions.md), entre ellas:
  - Q-01 a Q-06, de normas y fuentes del material, para Kevin;
  - Q-21, sumar la Ley de Contrato de Trabajo como fuente oficial del aguinaldo.
- **Decisiones de diseño:** Lourdes puede revisar estas, que siguen como están:
  - el fundido de D-262;
  - la flexibilidad de la etiqueta de Hornero (D-87);
  - el ancho de lectura de las guías;
  - si los repasos cuentan en los paneles;
  - que "Tu avance" cuente 7 niveles y no 8 (cripto queda fuera de la cuenta);
  - cómo se interpreta la "guía de riesgos" que abre el nivel 8.
- **Decisiones provisorias de la spec:** siguen así D-01 (paleta), D-02 (nombre "Alcancía"), D-23 (orden de los tramos) y D-61 (alcance del contenido).

## 10. Próximos pasos

- **Contenido:** revisión del Lic. Kevin Giampieri de las ampliaciones marcadas en [content.md](content.md) y cierre de las preguntas abiertas.
- **Inglés:** revisión del inglés por una persona nativa y, si hace falta, traducción del contenido de aprendizaje.
- **Validación:** prueba con usuarios de las proto-personas (plan en [personas.md](personas.md)) y prueba con lector de pantalla de los flujos de la fase B.
- **Infraestructura:** dominio propio con Cloudflare para los encabezados de seguridad (D-70).
- **Siguiente proyecto:** la academia corporativa con varios programas, sobre el modelo academia > programa > módulo > lección. Una posible fase C sumaría backend, SSO real y datos cifrados si el prototipo pasa a piloto.
