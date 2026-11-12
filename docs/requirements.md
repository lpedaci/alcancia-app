# Requerimientos

> Fecha: 12/11/2026 · Segunda tanda del paso 0 (spec 14.3). Prioridad **MoSCoW** para la fase A: **M** (must, imprescindible), **S** (should, importante), **C** (could, deseable), **W** (won't, fase B o fuera de alcance). Estado inicial: todos **Pendiente**; se actualiza en cada paso y en `review-fase-a.md`.

## 1. Requerimientos funcionales

### 1.1 Landing y acceso (F0)

| ID | Requerimiento | Prioridad | Criterio de aceptación | Estado |
| --- | --- | --- | --- | --- |
| RF-01 | Landing con las 10 secciones de F0 y piezas reales del producto | M | Todas las secciones presentes; sin logos de terceros ni testimonios inventados | Pendiente |
| RF-02 | SIM-3 funcionando en la landing sin iniciar sesión | M | Cambiar un dato actualiza el resultado, la frase, el gráfico y su tabla | Pendiente |
| RF-03 | Entrar como cualquier persona de demo en un clic desde la landing | M | `/login?demo=persona` precarga la persona; el recorrido llega al inicio del rol | Hecho (paso 5) |
| RF-04 | SSO simulado neutro y rotulado (Microsoft y Google con logos oficiales) | M | La pantalla G2 no imita las páginas de Microsoft ni de Google | Hecho (paso 5) |
| RF-05 | Verificación en dos pasos obligatoria para admin y decisor, con código `246810` precargado | M | Solo en el acceso desde la landing; "Ver como" no la repite | Hecho (paso 5) |
| RF-06 | Error genérico, bloqueo a los 5 intentos y derivación a la mesa de ayuda | M | El sexto intento muestra el bloqueo; G4 registra la solicitud y muestra la confirmación | Hecho (paso 5) |
| RF-07 | Expiración por inactividad con aviso previo | S | Aviso 2 minutos antes; cambios sin guardar protegidos con `useBlocker` | Parcial: expiración con aviso hecha en el paso 5; `useBlocker` llega con los primeros formularios que guardan cambios |
| RF-08 | Aviso de privacidad y consentimiento al primer ingreso (G5) | M | Dice qué ve y qué no ve la empresa con la frase de F0 | Hecho (paso 5, D-143) |
| RF-09 | RBAC desde `permissions.ts` y "Acceso no permitido" en rutas ajenas | M | Tests de `roles.md` en verde | Hecho (paso 5) |
| RF-10 | "Ver como", "Ver todo desbloqueado", estados de ejemplo y "Restablecer demo" | M | Diego carga en nivel 2 y Mariana en nivel 6, coherentes con el motor | Parcial: menú y "Restablecer demo" en el paso 5 (D-144); los estados con el motor en el paso 6 |

### 1.2 Billetera y niveles (D-50, 5.0, 5.3)

| ID | Requerimiento | Prioridad | Criterio de aceptación | Estado |
| --- | --- | --- | --- | --- |
| RF-20 | Navegación de 5 destinos con barra inferior, riel o menú lateral según el ancho | M | Verificado en los 6 anchos; `aria-current`; foco al título al cambiar de destino | Pendiente |
| RF-21 | Motor de niveles con las condiciones de 5.0, incluida la del nivel 2 (D-63) | M | Cada condición tiene test; un nivel nunca vuelve a bloquearse | Pendiente |
| RF-22 | Secciones bloqueadas visibles con candado, para qué sirven y qué falta con progreso | M | Un toque lleva a la acción que acerca el desbloqueo | Pendiente |
| RF-23 | "Ya sé esto": desafío de suficiencia que desbloquea | M | Aprobar con 70 % desbloquea con `unlockedBy: mastery` | Pendiente |
| RF-24 | Habilitación de niveles por el tutor con motivo y modo libre del admin | M | Queda registro con fecha, autor y motivo | Pendiente |
| RF-25 | Motor económico de `wallet-engine.md` (tiempo, sueldo, gastos, inflación, rendimientos, deudas, cierre de mes) | M | Casos de `formulas.md` y tests del motor en verde; determinista | Pendiente |
| RF-26 | Pagar: transferir (alias, CBU o CVU con titular y entidad ficticios), QR con alternativa sin cámara, servicios y débitos | M | Misiones 2 y 3 completables por teclado y en celular | Pendiente |
| RF-27 | Categorizar movimientos desde Inicio desde el nivel 1 (D-114) | M | Cuenta para la condición del nivel 3 | Pendiente |
| RF-28 | Presupuesto con reparto frente a 50/30/20 o 70/20/10 | M | Dona solo con su tabla (2.2) | Pendiente |
| RF-29 | Apartados: "Ahorro" básico desde el nivel 1; apartados con meta y fondo de emergencia desde el nivel 4 | M | `emergency_months` según `wallet-engine.md` | Pendiente |
| RF-30 | Rendir: cuenta remunerada y fondo money market de práctica; plazo fijo y UVA de práctica | M | Rendimiento diario acreditado; fichas con protección de cada opción | Pendiente |
| RF-31 | Tarjeta y préstamos: tarjeta de práctica con resumen, préstamo preaprobado y compra en cuotas | M | El CFT siempre visible antes de decidir | Pendiente |
| RF-32 | Invertir: cuenta comitente de práctica con el bróker ficticio (5.4) | M | Los 7 pasos de 5.4; serie de precios sintética rotulada | Pendiente |
| RF-33 | Fuerte con 6 estados, mensajes de `fuerte-lines.json` y 3 niveles de presencia | M | Nunca interrumpe dos veces la misma acción; mensaje anunciado como texto | Pendiente |
| RF-34 | "¿Por qué importa?" y tarjetas de aprendizaje en el momento justo | M | Una por acción como máximo; no se repite si ya se respondió bien | Pendiente |
| RF-35 | Cartel fijo "Simulador de finanzas personales · dinero ficticio" y ningún dato real pedido | M | Revisión de formularios: no hay campos de DNI, CBU, tarjeta ni contraseña reales | Pendiente |
| RF-36 | Comprobantes y resumen del mes | S | Comprobante ficticio descargable; resumen en cada cierre | Pendiente |
| RF-37 | Empezar de cero la billetera con confirmación | M | No borra el avance de aprendizaje | Pendiente |

### 1.3 Aprendizaje (F2, F3, 5.1)

| ID | Requerimiento | Prioridad | Criterio de aceptación | Estado |
| --- | --- | --- | --- | --- |
| RF-40 | "Conocerte" con 10 a 12 preguntas, resultado por 5 dimensiones en barras horizontales con tabla | M | Hábitos sin juicio y solo en el navegador (D-62) | Pendiente |
| RF-41 | Ruta explicada dentro de cada nivel y repetición final para pre y post | M | Frase que explica el orden | Pendiente |
| RF-42 | 16 guías de fase A con la secuencia de Gagné (D-61) | M | Cada una con objetivo observable y "Para tu vida" | Pendiente |
| RF-43 | Los 9 tipos de pregunta de 5.1 con alternativa accesible al arrastre | M | Ordenar con "Subir" y "Bajar"; unir con selects; clasificar con menú | Pendiente |
| RF-44 | Desafíos de nivel con los bancos de sus módulos, mejor intento e intentos configurables (D-57) | M | Insignia por módulo según su parte | Pendiente |
| RF-45 | 13 misiones con el motor declarativo (D-59) | M | Cada una con objetivo, pasos, evento, devolución y criterios de éxito | Pendiente |
| RF-46 | Mapa de niveles como línea de tiempo y logros | M | Estado con ícono y texto | Pendiente |
| RF-47 | Glosario integrado con chip en el primer uso | M | Términos de 1.1.1 | Pendiente |
| RF-48 | Fichas "Brókers registrados" y "Billeteras y fintech" verificadas | M | Solo filas verificadas en el registro oficial, con fecha | Pendiente |
| RF-49 | Satisfacción de 1 a 5 al terminar cada guía | S | Alimenta Kirkpatrick 1 | Pendiente |
| RF-50 | Desafíos semanales con autoinforme y reflexión opcional | M | La reflexión no sale del navegador de la persona | Pendiente |
| RF-51 | Registro de eventos tipo xAPI en misiones | C | Visor en fase B (F21) | Pendiente |

### 1.4 Herramientas (F4)

| ID | Requerimiento | Prioridad | Criterio de aceptación | Estado |
| --- | --- | --- | --- | --- |
| RF-60 | SIM-1 a SIM-12 con la anatomía de 2.2.1 | M | Datos, resultado, frase, gráfico con tabla, "Qué significa esto", supuestos, comparar, "Prueba cambiar…" y aviso legal | Pendiente |
| RF-61 | Escenarios de ejemplo de `scenarios.json` y "Dónde ver los valores reales" | M | Rotulados "Valores de ejemplo" | Pendiente |
| RF-62 | Guardar y comparar dos escenarios, en el navegador | M | `LocalScenario` por persona | Pendiente |
| RF-63 | Precargar herramientas con datos de la billetera | S | SIM-2 con los gastos esenciales del último mes | Pendiente |
| RF-64 | Exportar el resultado como resumen imprimible con supuestos | S | Vista de impresión | Pendiente |

### 1.5 Tutor, admin y decisor (F1, F6 a F8)

| ID | Requerimiento | Prioridad | Criterio de aceptación | Estado |
| --- | --- | --- | --- | --- |
| RF-70 | Inicio del tutor con KPIs y alertas | M | Calculados desde los datos | Pendiente |
| RF-71 | Detalle de cohorte con mapa de calor de avance de aprendizaje (D-58) | M | Nunca muestra bloqueado o desbloqueado | Pendiente |
| RF-72 | Asignar desafío semanal | M | Con fecha; toast "Desafío asignado" | Pendiente |
| RF-73 | Resultados: preguntas con más errores y opciones más elegidas | M | Con umbral de 5 | Pendiente |
| RF-74 | Bandeja de consultas | S | Sin datos económicos | Pendiente |
| RF-75 | Panel del admin: adopción, avance por cohorte, Kirkpatrick 1 a 3, alertas | M | Todo con umbral | Pendiente |
| RF-76 | Personas y cohortes: listado con filtros, alta, cohortes con tutor y fecha | M | Estados invitada, activa, inactiva | Pendiente |
| RF-77 | Carga por CSV con validación fila por fila y corrección | M | Correo inválido, duplicado y cohorte inexistente detectados | Pendiente |
| RF-78 | Configuración del programa (F1) | M | Umbral no baja de 5; el orden de los niveles no se edita | Pendiente |
| RF-79 | Reporte de impacto del decisor, de solo lectura y exportable | M | Kirkpatrick 1 a 3, metodología y umbral | Pendiente |

### 1.6 Sistema de diseño y difusión

| ID | Requerimiento | Prioridad | Criterio de aceptación | Estado |
| --- | --- | --- | --- | --- |
| RF-80 | `/styleguide` interno | M | Tokens y componentes base | Pendiente |
| RF-81 | Sistema de diseño público con "Cómo mostramos el dinero" | M | Secciones de 2.8 | Pendiente |
| RF-82 | Indexación, Open Graph, favicon y manifiesto (spec 15) | S | `og-image.png` de 1200 × 630 | Pendiente |

### 1.7 Fase B (Won't en fase A)

F9 a F22: recordatorios, glosario completo, módulos 16 y 18 completos, certificados, sesiones, constructor de lecciones, seguimiento a 30 días con recordatorio, Mi privacidad, inglés completo, escape room, repaso espaciado, aprendizaje social, visor xAPI y cripto. Prioridad **W**.

## 2. Requerimientos no funcionales (ISO/IEC 25010:2023)

| ID | Característica | Requerimiento | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- | --- |
| RNF-01 | Adecuación funcional · corrección | Cálculos financieros exactos | M | Tests de `formulas.md` en verde; ningún `number` de punto flotante para dinero |
| RNF-02 | Adecuación funcional · pertinencia | Ningún valor presentado como actual ni recomendación de producto | M | Revisión de textos; entidades reales solo en las fichas |
| RNF-03 | Eficiencia de desempeño | Carga inicial rápida en un celular de gama media | S | Lighthouse móvil con rendimiento ≥ 85 en la landing; rutas con carga diferida |
| RNF-04 | Eficiencia de desempeño | Simuladores y motor sin bloqueos | S | Avanzar un mes en menos de 200 ms |
| RNF-05 | Compatibilidad | Navegadores actuales | M | Últimas 2 versiones de Chrome, Edge, Firefox y Safari (incluido iOS) |
| RNF-06 | Capacidad de interacción · accesibilidad | WCAG 2.2 AA | M | axe sin errores en todas las pantallas; teclado en los flujos principales; lector de pantalla en "Conocerte", una guía y una herramienta |
| RNF-07 | Capacidad de interacción · protección contra errores | Errores que no culpan y no borran lo cargado | M | Patrones de 2.10 |
| RNF-08 | Capacidad de interacción · responsive | Sin desbordes en 320, 375, 768, 1024, 1280 y 1440 px | M | Test de Playwright en verde con capturas |
| RNF-09 | Capacidad de interacción · lenguaje | Español neutro con tú, vocabulario y números de 2.9 | M | Revisión de textos y tests de formato de montos |
| RNF-10 | Fiabilidad | El estado sobrevive a recargas; ningún estado sin salida | M | Persistencia en `localStorage`; "Empezar de cero" y "Restablecer demo" |
| RNF-11 | Seguridad · confidencialidad | Datos de la billetera, hábitos y estado de niveles nunca en vistas de otros roles (D-58, D-62) | M | Tests de `roles.md` |
| RNF-12 | Seguridad · privacidad | Umbral de 5 en toda métrica agregada | M | `metrics.test.ts` |
| RNF-13 | Seguridad · integridad | CSP estricta, sin `dangerouslySetInnerHTML`, Zod en formularios, `npm audit` en CI | M | La CI falla si falta la CSP |
| RNF-14 | Mantenibilidad | Tokens en cuatro niveles; ningún componente con valores sueltos; misiones y textos de Fuerte en JSON editable | M | Revisión de código y lint |
| RNF-15 | Mantenibilidad · capacidad de prueba | Motor y fórmulas como funciones puras | M | Cobertura de `lib/finance` y del motor ≥ 90 % |
| RNF-16 | Flexibilidad | Modelo academia > programa > módulo > lección; i18n en todos los textos | S | Landing en inglés en fase A |
| RNF-17 | Protección (safety) | El contenido no genera urgencia ni presión para invertir ni endeudarse | M | Revisión de textos de Fuerte y de las ofertas simuladas |

## Referencias

International Organization for Standardization. (2023). *ISO/IEC 25010:2023 Systems and software engineering: Systems and software Quality Requirements and Evaluation (SQuaRE): Product quality model*.

World Wide Web Consortium. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2*. https://www.w3.org/TR/WCAG22/
