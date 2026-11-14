# Revisión intermedia de la fase A

> Fecha: 13/11/2026 · Paso 14 de la spec (sección 10), con el formato de la sección 13. Revisa lo construido en los pasos 0 a 13 contra los criterios de aceptación de la sección 11 y los requerimientos de [`requirements.md`](requirements.md). Dice qué está hecho con su evidencia, qué falta y qué no se pudo verificar.

## Actualización: faltantes completados (paso 14b, 13/11/2026)

Después de esta revisión se construyeron los 8 faltantes de la sección 4 (D-202 a D-207):

| Requerimiento | Qué se hizo |
| --- | --- |
| RF-50 | Desafío semanal en Aprender: autoinforme "Sí, En parte, No" y reflexión que queda solo en el navegador |
| Consultas | "Tus consultas" en Aprender y "¿Te quedó una duda?" en cada guía; llegan a la bandeja de tutoría (T5) |
| RF-62 | Escenarios guardados en el espacio local de cada persona: siguen al recargar |
| RF-47 | Glosario con 15 términos y chips en la primera aparición dentro de las guías |
| RF-43 | Ejercicio con simulador: el noveno tipo de 5.1, con dos preguntas verificadas a mano |
| RF-33 | Las 59 frases de Fuerte en `fuerte-lines.json`, con variantes por sesión |
| RF-64 y RF-36 | Resumen imprimible de cada herramienta y comprobante en PDF, con el aviso de dinero ficticio |

Evidencia: 526 tests unitarios (incluidos los nuevos de glosario, Fuerte, tutoría, escenarios y ejercicio con simulador) y 632 de Playwright en verde. Lo que sigue sin verificar es lo de la sección 6. Las tablas de abajo quedan como estaban el día de la revisión.

## 1. Resumen

La fase A está **casi completa**. Funcionan las 33 pantallas de la sección 6, con los cuatro roles, en el sitio publicado (https://lpedaci.github.io/alcancia-app/):

- La billetera del participante, con los 8 niveles de la fase A.
- Las 13 misiones y las 17 guías.
- Los desafíos de nivel y de suficiencia.
- Las 12 herramientas y la cuenta comitente de práctica.

Los paneles de tutoría, de L&D y del decisor se calculan desde los datos y respetan el umbral de 5. El sistema de diseño es público y la seguridad del front se verifica en cada build.

**Faltan cinco funciones de la fase A de prioridad "Must"** (sección 4), más tres menores. La más visible es el glosario con chips en el primer uso. Las otras cuatro son:

- el autoinforme del desafío semanal del lado del participante;
- el ejercicio con simulador como tipo de pregunta;
- guardar escenarios entre sesiones;
- los textos de Fuerte leídos desde su archivo editable.

Ninguna rompe la demo. **Propuesta:** construirlas en un paso 14b antes de empezar la fase B.

**Lo que no se pudo verificar** (sección 6): la prueba con lector de pantalla, Lighthouse en celular, otros navegadores además de Chromium y la cobertura de tests medida con una herramienta.

## 2. Qué se hizo, por función y pantalla

| Función | Pantallas | Estado | Decisiones |
| --- | --- | --- | --- |
| F0 Landing, acceso y seguridad base | G0 a G8 | Hecho: landing con las 10 secciones y SIM-3 embebido; SSO y verificación en dos pasos simulados; bloqueo a los 5 intentos; mesa de ayuda; expiración con aviso; RBAC; aviso de privacidad por rol; "Ver como"; sistema de diseño público | D-143 a D-152, D-199 |
| F1 Configuración del programa | O4 | Hecho: modo, fechas por cohorte, módulos y obligatorios, umbral ≥ 5, puntaje, intentos, canales y modo libre, con aviso de cambios sin guardar | D-198 |
| F2 Diagnóstico y ruta | P2 | Hecho: "Conocerte" con 12 preguntas, resultado por las 5 dimensiones con tabla, ruta explicada, "Ya sé esto" y repetición al final | D-167 |
| F3 Módulos, guías y evaluaciones | P9, P10, P11 | Hecho en lo principal: 17 guías con la secuencia de Gagné y satisfacción de 1 a 5, desafíos de nivel y de suficiencia con mejor intento. **Falta** el ejercicio con simulador como tipo de pregunta | D-171, D-177, D-184 |
| F4 Simuladores | P13, SIM-1 a SIM-12 | Hecho: anatomía completa de 2.2.1, precarga desde la billetera y comparación de escenarios. **Faltan** guardar escenarios al recargar y el resumen imprimible | D-176 |
| 5.0 Niveles y desbloqueos | P1, P9, todas las secciones | Hecho: motor con las condiciones de 5.0, secciones bloqueadas con qué falta, suficiencia, habilitación por tutoría con motivo, modo libre y "Ver todo desbloqueado" | D-161, D-144 |
| 5.0.1 Fuerte | Toda la billetera | Hecho en lo principal: 6 estados, 7 luces, 3 niveles de presencia, flotante y movible. **Falta** leer sus textos desde `fuerte-lines.json`: hoy salen de los archivos de idioma y de las misiones | D-160, D-134 |
| 5.3 Billetera (SIM-13) | P1, P3 a P7, P12, P14 | Hecho: cobro, transferencias, QR, servicios, presupuesto, apartados y metas, rendir, tarjeta y préstamos, control del tiempo y las 13 misiones. Comprobante en pantalla; **falta** descargarlo | D-163 a D-187 |
| 5.4 Invertir (SIM-14) | P8 | Hecho: apertura con el test de perfil, fondeo, compra y venta, liquidación, tenencia y serie sintética; ficha de brókers | D-185 a D-187 |
| F5 Metas y desafíos | P5 | Metas hechas. **Falta** el lado del participante del desafío semanal: ver el desafío, responder "sí, en parte, no" y escribir una reflexión. Hoy el autoinforme existe solo en los datos semilla y en la vista previa de tutoría | D-175 |
| F6 Panel de tutoría | T1 a T5 | Hecho: KPIs, alertas, mapa de calor, avance por nivel sin estado de bloqueo, asignar desafío, resultados con umbral y bandeja de consultas. Las consultas vienen de la semilla: el participante todavía no puede enviar una | D-193, D-194 |
| F7 Panel y reporte de impacto | O1, D1 | Hecho: adopción, alertas y niveles 1 a 3 de Kirkpatrick con supresión complementaria; reporte imprimible y exportable a CSV | D-195, D-197 |
| F8 Personas y cohortes | O2, O3 | Hecho: filtros, paginación, alta, cohortes y carga por CSV con revisión fila por fila | D-196 |

## 3. Criterios de aceptación (sección 11)

Pruebas corridas el 13/11/2026, todas en verde: **507 tests unitarios**, **623 de Playwright** con el servidor de desarrollo (desbordes en 6 anchos, axe a 375 y 1280 px, un solo `h1` por página) y **70 sobre el build de producción** (CSP en 68 pantallas, más la etiqueta y los archivos de indexación). La CI del último commit también está en verde.

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| Desde la landing se elige el rol y se entra en un clic pasando por SSO y MFA simulados | Cumple | Recorrido G0 → G1 → G2 → G3; pruebas de `auth` |
| El simulador de inflación funciona en la landing sin iniciar sesión | Cumple | SIM-3 en G0; prueba de desbordes y axe de `g0-landing` |
| La experiencia de Diego en el celular funciona sin desbordes ni gestos sin alternativa | Cumple | Pantallas de Diego en 320 y 375 px en la prueba de desbordes; QR con lista como alternativa |
| Las evaluaciones usan los tipos de 5.1, con alternativa al arrastre y retroalimentación | **Parcial** | 7 tipos en los desafíos (opción única y múltiple, verdadero o falso con por qué, numérica, ordenar, unir, clasificar) y el caso con decisiones en las misiones. **Falta** el ejercicio con simulador |
| El diagnóstico genera niveles por dimensión y una ruta explicada; se puede repetir | Cumple | P2; tests de `conocerte` |
| Cada lección sigue la secuencia de F3 y cada módulo tiene objetivo observable y evaluación | Cumple | 17 guías en `guides.json`; tests de contenido |
| Los 12 simuladores calculan correctamente | Cumple | Tests de `src/lib/finance/` con los casos de `formulas.md` |
| Ningún cálculo de dinero usa `number` de punto flotante | Cumple | Fórmulas con `Decimal`; montos guardados como texto |
| Cada resultado muestra supuestos, frase, gráfico con tabla y aviso legal | Cumple | Simulador genérico y SIM-3 |
| Ningún texto presenta un valor como actual ni recomienda un producto | Cumple, con revisión pendiente | Valores rotulados "de ejemplo"; entidades reales solo en las fichas. Las ampliaciones esperan la revisión del Lic. Kevin Giampieri |
| El participante entra a una billetera: mapa, bloqueos con qué falta, suficiencia, desbloqueo por tutoría, modo demo | Cumple | P1, P9, T2; tests del motor de niveles |
| La billetera completa las misiones en celular y escritorio, con devolución, sin datos reales y sin parecerse a una app real | Cumple | Las 13 misiones; tests del motor de misiones |
| Los paneles muestran solo métricas agregadas de las misiones | Cumple | `privacy-boundaries.test.ts`; tests de `tutor-data` y `org-data` |
| Montos y metas no aparecen en vistas de otros roles | Cumple | `privacy-boundaries.test.ts` |
| Ninguna métrica para grupos de menos de 5 personas | Cumple | `metrics.test.ts`; cohorte Comercial como ejemplo en T2 |
| La carga por CSV valida fila por fila y permite corregir | Cumple | O3; tests de `org-data` |
| Paneles calculados desde los datos con Kirkpatrick 1 a 3 | Cumple | O1 y D1; tests de `org-data` |
| Español neutro con el vocabulario y el formato de números de 2.9 | Cumple | Test de vocabulario en `App.test.tsx`; tests de `money.ts` |
| Campos de dinero y porcentaje con máscara; deslizadores con campo numérico | Cumple | `MoneyInput`, `PercentInput` y sus tests |
| axe sin errores, teclado y resultados anunciados | Cumple, salvo el lector de pantalla | axe en las 69 páginas a 375 y 1280 px. Teclado recorrido en los flujos principales durante la construcción. **No se probó con un lector de pantalla real** |
| Sin desbordes en los 6 anchos | Cumple | Prueba de desbordes en las 69 páginas por 6 anchos, con capturas en `docs/screenshots/` |
| Sin degradés ni sombras en tarjetas; animaciones que respetan "reducir animaciones" | Cumple | `no-raw-values.test.ts`; Motion con `useShouldReduceMotion` |
| Sistema de diseño público con "Cómo mostramos el dinero" | Cumple | G8 (D-199) |
| CSP, `npm audit` en CI y deploy público | Cumple | Paso 13 (D-200): la CSP se verifica en las 68 pantallas del build |
| Documentación de la sección 14 completa y coherente | Cumple, con ajustes en esta revisión | `requirements.md` tenía 18 estados atrasados; se corrigieron en esta revisión |

## 4. Qué falta de la fase A

| Requerimiento | Qué falta | Prioridad | Esfuerzo estimado |
| --- | --- | --- | --- |
| RF-47 | **Glosario integrado:** chip en el primer uso de TNA, TEA, CFT, UVA, CER, CEDEAR, ETF, FCI, CVU, PSP y DCA, que abre la definición con su fuente (1.1.1). El tipo `GlossaryTerm` existe; faltan los datos y el componente | M | Medio |
| RF-50 | **Desafío semanal del participante:** verlo en Aprender o en Inicio, autoinforme "sí, en parte, no" y reflexión opcional que no sale del navegador; tutoría ve solo si lo cumplió | M | Bajo |
| RF-43 | **Ejercicio con simulador** como tipo de pregunta: el simulador embebido en el desafío, con respuesta y tolerancia | M | Medio |
| RF-62 | **Guardar escenarios** en `LocalScenario` para que sigan al recargar (hoy se comparan solo en la sesión) | M | Bajo |
| RF-33 | Leer los textos de Fuerte desde `fuerte-lines.json`, con variantes, para que L&D los edite sin tocar código | M | Medio |
| RF-64 | Resumen imprimible del resultado de un simulador, con los supuestos | S | Bajo |
| RF-36 | Comprobante ficticio descargable | S | Bajo |
| Consultas | Que el participante pueda enviar una consulta a tutoría desde una guía (la bandeja de T5 ya existe) | S | Bajo |

## 5. Qué ajustar

- **Desbordes, sombras, íconos y animaciones:** sin hallazgos abiertos en las pruebas automáticas. Los ajustes visuales que pediste en cada paso están aplicados.
- **Textos:** quedan abiertas 9 preguntas de contenido (Q-01 a Q-06, Q-12, Q-13 y Q-15). Mientras sigan abiertas, esos datos no se muestran o se muestran con la redacción más prudente.
- **Accesibilidad:** falta la prueba con lector de pantalla en "Conocerte", una guía y un simulador (2.10).
- **Documentación:** el índice `docs/README.md` todavía dice "en revisión" en documentos que ya revisaste. Se actualiza en esta revisión.

## 6. Lo que no se pudo verificar

| Qué | Por qué | Cómo cerrarlo |
| --- | --- | --- |
| Lector de pantalla (NVDA o VoiceOver) en "Conocerte", una guía y un simulador | No se puede manejar un lector de pantalla desde este entorno | Recorrido manual de Lourdes, o una sesión con NVDA |
| Lighthouse en celular ≥ 85 en la landing (RNF-03) | Lighthouse no está instalado en el proyecto | Correrlo desde Chrome DevTools sobre el sitio publicado |
| Firefox, Safari e iOS (RNF-05) | Las pruebas corren solo en Chromium | Sumar los proyectos `firefox` y `webkit` a Playwright, o probarlo a mano en un iPhone |
| Cobertura ≥ 90 % de `lib/finance` y del motor (RNF-15) | No hay herramienta de cobertura instalada | Sumar `@vitest/coverage-v8` |
| Avanzar un mes en menos de 200 ms (RNF-04) | No se midió con un cronómetro; a simple vista es instantáneo | Un test de rendimiento del motor |
| Datos de los Anexos C y D al día | Verificados el 12/11/2026; PPI tiene una fusión anunciada (Q-15) | Volver a verificar antes de difundir el sitio |

## 7. Cálculos

- Las fórmulas de `formulas.md` (casos F-01 a F-34) tienen tests con valores calculados a mano. Todos pasan.
- Los casos del material del taller están verificados:
  - US$ 200 por mes al 12 % anual durante 33 años dan US$ 1.008.712.
  - Bola de nieve y avalancha, con los datos de A-25 y A-29.
- Los montos se calculan con `Decimal` y se guardan como texto. El rendimiento diario se acredita como `saldo × TNA / 365`.
- Simplificaciones declaradas en la interfaz y en `formulas.md`:
  - la UVA aproximada con la inflación del escenario;
  - la tarjeta sin impuestos ni consumos nuevos;
  - el aguinaldo prorrateado como neto ÷ 12 (Q-12).

## 8. Seguridad y privacidad

- **Simulado (8.1):** SSO, MFA, bloqueo, mesa de ayuda, expiración, RBAC, consentimiento y umbral de privacidad.
- **Aplicado (8.2):**
  - CSP estricta, verificada en cada pantalla del build de producción.
  - Sin HTML crudo ni código desde texto, con tests.
  - Enlaces con `rel="noopener noreferrer"`.
  - Dependencias de producción sin vulnerabilidades conocidas, con la CI exigiéndolo.
  - Dependabot.
  - Zod sin `new Function`.
- **Privacidad:**
  - Los datos de la billetera, los hábitos, las reflexiones y el estado de los niveles viven en un espacio por persona en el navegador, y ninguna vista de otro rol los importa (test).
  - El umbral de 5 usa supresión complementaria.
- **Límites:** GitHub Pages no permite encabezados HTTP. La mejora con Cloudflare y un dominio propio está documentada en [`security.md`](security.md) (D-70).

## 9. Dudas y decisiones

- **Decisiones:** registradas de D-100 a D-201 en [`decisions.md`](decisions.md). Unas 30 esperan tu confirmación. Conviene repasarlas juntas antes de la fase B.
- **Preguntas de contenido:** 9 abiertas en [`questions.md`](questions.md). Seis son para el Lic. Kevin Giampieri (Q-01, Q-05, Q-06, Q-12, Q-13 y la redacción de Q-02) y el resto son verificaciones de normas.
- **Incidencias:** 3 abiertas en [`issues.md`](issues.md):
  - INC-01: avisos moderados en herramientas de desarrollo.
  - INC-02: commits antiguos en la caché de GitHub; borrarlos requiere un pedido al soporte de GitHub.
  - INC-04: una diferencia en el texto de la spec.
- **Fuentes oficiales:** las 20 URL de `src/app/sources.ts` respondieron el 13/11/2026.

## 10. Documentación

Están todos los documentos de la sección 14: personas, roles, requerimientos, casos de uso, flujos, arquitectura de la información, sistema de diseño, diseño de aprendizaje, contenido, fórmulas, seguridad y motor de la billetera, más decisiones, avance, incidencias y preguntas.

En esta revisión se actualizaron dos cosas:
- `requirements.md`: 18 estados atrasados.
- `docs/README.md`: el estado de cada documento.

## 11. Riesgos para la demo

- **Contenido sin revisar por un especialista:** las ampliaciones (mercado de capitales, CEDEARs, billeteras y fintech) están marcadas como pendientes de la revisión del Lic. Kevin Giampieri. Es lo primero que puede cuestionar alguien del rubro.
- **Datos de entidades reales que cambian:** la fusión de PPI y las licencias bancarias de fintech. Las fichas muestran la fecha de verificación, pero hay que revisarlas antes de difundir el sitio.
- **Estado en el navegador:** si alguien recorre la demo y la deja a mitad de camino, la próxima persona en esa computadora la ve igual. "Restablecer demo" está en la landing y en el menú de usuario.
- **Glosario ausente:** una persona sin formación financiera encuentra TNA o CFT sin un chip para consultarlo. Algunas guías los explican en el texto, pero no siempre la primera vez que aparecen.

## 12. Próximos pasos

1. **Paso 14b (propuesto):** completar la fase A con lo de la sección 4. Primero los "Must": el desafío semanal (RF-50) y guardar escenarios (RF-62), que son los de menor esfuerzo; después el glosario (RF-47), el ejercicio con simulador (RF-43) y los textos de Fuerte (RF-33); por último los tres "Should".
2. Tu recorrido con lector de pantalla y Lighthouse sobre el sitio publicado, o sumar Firefox, WebKit y la cobertura a las pruebas.
3. Enviar al Lic. Kevin Giampieri las ampliaciones de `content.md` y las preguntas abiertas.
4. Fase B, pasos 15 a 28 (F9 a F22), en el orden de la spec.
