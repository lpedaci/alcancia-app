# Diseño de aprendizaje

> Fecha: 12/11/2026 · Segunda tanda del paso 0 (spec 14.8). El detalle por módulo (objetivo, evidencia, actividades y fuentes) está en `content.md`.

## 1. Idea central

Alcancía no enseña finanzas "sobre" una billetera: **enseña dentro de una billetera** (D-50). La persona aprende haciendo lo mismo que haría con su dinero (cobrar, pagar, presupuestar, ahorrar, endeudarse o no, invertir) en un entorno donde equivocarse es gratis, y el orden en que se abren las secciones **es** la secuencia del programa: primero lo que te protege, después lo que te hace crecer (A-23). El diseño combina tres tradiciones:

| Tradición | Qué aporta | Dónde se ve |
| --- | --- | --- |
| Diseño instruccional (Backward Design, Gagné, Bloom revisada) | Resultados observables, evidencia antes que actividades, secuencia de cada guía | Guías, desafíos de nivel, `content.md` |
| Aprendizaje experiencial y situado | Práctica en un contexto parecido al real, con consecuencias y reflexión | Misiones, herramientas, tarjetas en el momento justo |
| Prácticas corporativas (LMS y LXP) | Programa asignado, cohortes, seguimiento, medición de impacto | Paneles de tutor, admin y decisor (5.2) |

### 1.1 Ajuste después de la fase A: aprender en el momento justo y con consecuencias (D-76 a D-78)

Una auditoría del 13/11/2026 encontró que el aprendizaje todavía dependía de **entrar** a una misión o a una guía: las tarjetas vivían dentro de las misiones, las misiones se jugaban en una cuenta aparte y los errores no dejaban huella. El ajuste lleva el aprendizaje a la acción:

| Principio | Qué cambia | Por qué |
| --- | --- | --- |
| **El momento justo también en el modo libre** (D-76) | Las tarjetas se disparan por acciones de la billetera, haya o no misión, desde un catálogo declarativo (`learning-cards.json`). "¿Por qué importa?" está visible en cada pantalla, también con Fuerte en "Silencio" (D-209) | La explicación llega cuando la persona tiene la pregunta, no antes ni en otro lugar: el aprendizaje en el momento de la necesidad (Gottfredson y Mosher, 2011). Una tarjeta por acción y sin repetir lo ya respondido bien, para no saturar |
| **Las acciones tienen consecuencias** (D-77, D-208) | Todas las misiones se juegan en la billetera de la persona: un préstamo queda en Tus deudas y bloquea Invertir, pagar el mínimo genera intereses, una estafa descuenta el monto. Se revierte con acciones de la simulación (pagar, cancelar, reportar), nunca con "deshacer" | La consecuencia es la retroalimentación más fuerte del aprendizaje experiencial (Kolb, 1984): vivir el costo, reflexionar con la devolución y probar otra decisión. "Equivocarte es gratis" sigue valiendo: el dinero es ficticio y "Empezar de cero" está siempre |
| **La guía nace de la acción** (D-78) | Una tarjeta o un "¿Por qué importa?" llevan a la parte exacta de la guía y ofrecen volver a la pantalla de origen, con lo cargado intacto | El contenido se consulta como apoyo al desempeño, sin perder el hilo de la tarea (aprendizaje en el flujo de trabajo) |

Los paneles no cambian: tutoría y L&D siguen viendo solo avance de aprendizaje agregado (D-58). Las tarjetas mostradas y respondidas se registran como eventos tipo xAPI para F21, sin montos.

## 2. Análisis del público

### 2.1 Principios de andragogía aplicados

Siguen los seis supuestos del aprendizaje adulto de Knowles, Holton y Swanson (2015):

| Principio | Cómo lo aplica Alcancía |
| --- | --- |
| **Necesidad de saber** por qué se aprende algo | Cada guía empieza con una situación con números ("Te ofrecen 12 cuotas sin interés o 15 % de descuento") y cada pantalla tiene "¿Por qué importa?" |
| **Autoconcepto:** la persona adulta decide | Elige el orden de las guías dentro de un nivel, salta con "Ya sé esto", elige el nivel de presencia de Fuerte y el escenario de inflación |
| **Experiencia previa** como recurso | "Conocerte" detecta lo que ya sabe y ofrece desafíos de suficiencia; los ejemplos usan situaciones cotidianas, no casos abstractos |
| **Disposición** ligada a su vida | Contenido argentino (inflación, plazo fijo UVA, cuotas, aguinaldo) y el recibo de sueldo como punto de partida |
| **Orientación a problemas** | Misiones con un objetivo concreto ("Transfiere sin errores") en lugar de temas |
| **Motivación interna** | Logros que celebran conductas sanas, sin rankings ni rachas que castiguen (5.0); privacidad que da confianza (G5) |

### 2.2 Dos públicos en la misma empresa

| | Personal de oficina (Mariana) | Personal operativo (Diego) |
| --- | --- | --- |
| Dispositivo | Computadora, a veces celular | Celular, de gama media, conexión variable |
| Tiempo | Ratos de 10 a 20 minutos | Ratos de 5 minutos, en pausas o viajes |
| Diseño que responde | Herramientas con comparación de escenarios, panel de la misión al lado | Una acción por pantalla, guías de 5 minutos, misión como hoja inferior, nada de arrastrar sin alternativa |
| Lenguaje | El mismo para los dos: vocabulario de 2.9, una idea por oración, términos técnicos con chip del glosario | |

Ambos son hipótesis sin validar (`personas.md`).

### 2.3 Microaprendizaje en el celular

- Guías de 5 a 8 minutos, misiones de 3 a 6 minutos (las 6 cortas, de 2 a 4, D-59) y tarjetas de aprendizaje de 20 a 40 segundos.
- Todo se puede pausar y retomar donde quedó (estado persistido).
- Un solo objetivo por guía y por misión.
- Lectura en `body-large`, con 60 a 72 caracteres por línea.

## 3. Resultados de aprendizaje (Backward Design)

Siguiendo a Wiggins y McTighe (2005): primero los resultados, después la evidencia, después las actividades.

### 3.1 Etapa 1: resultados esperados

**Meta de transferencia del programa:** que la persona tome decisiones cotidianas de dinero con criterio propio (leer su sueldo, presupuestar, protegerse de imprevistos, evaluar el costo real de una deuda y de la inflación, y saber cómo verificar a quién le confía su dinero) sin depender de recomendaciones de terceros.

| Tramo | Comprensión duradera | Pregunta esencial |
| --- | --- | --- |
| 1 · Bases | El dinero se administra: saber cuánto entra y adónde va es la base de cualquier decisión | ¿Cuánto me queda y en qué lo uso? |
| 2 · Deudas y crédito | Una deuda cara es una inversión negativa garantizada; el costo real está en el CFT | ¿Cuánto me cuesta de verdad? |
| 3 · Ahorro e inflación | El dinero quieto pierde poder de compra; la tasa que importa es la real | ¿Mi ahorro le gana a los precios? |
| 4 · Invertir | Invertir es aceptar riesgo a cambio de tiempo; el orden importa: primero el fondo de emergencia y sin deudas caras | ¿Estoy en condiciones de asumir este riesgo? |
| 5 · Billeteras, fintech y seguridad | La protección de tu dinero depende del tipo de cuenta, no de la marca; nadie legítimo te pide un código | ¿Quién tiene mi dinero y cómo lo verifico? |

Los objetivos de cada módulo usan verbos observables de la taxonomía revisada de Anderson y Krathwohl (2001), en los niveles aplicar, analizar y evaluar (calcular, comparar, clasificar, decidir, verificar), nunca "conocer" ni "entender" (`content.md`).

### 3.2 Etapa 2: evidencia

| Evidencia | Qué comprueba | Tipo (5.1) |
| --- | --- | --- |
| Práctica formativa dentro de la guía | Comprensión inmediata, sin nota | Cualquiera, con reintentos ilimitados |
| **Desafío de nivel** (D-57) | Dominio de los módulos del nivel | Preguntas de los bancos de cada módulo |
| **Desafío de suficiencia** | Que la persona ya sabe lo de una sección | El mismo banco, más exigente en cantidad |
| **Misiones** | **Desempeño** en una situación realista | Criterios de éxito sobre el estado de la billetera (por ejemplo, apartado con el monto correcto) y preguntas embebidas |
| Desafío semanal del tutor | Transferencia a la vida real | Autoinforme (cumplido, parcial, no) y reflexión opcional |
| "Conocerte" final | Avance pre y post | Solo las preguntas de conocimiento salen del navegador (D-62) |

### 3.3 Etapa 3: actividades

Guías, herramientas, misiones, tarjetas en el momento justo y encuentros con el tutor. El mapa completo está en la sección 4 y en `content.md`.

## 4. Mapa de módulos, dimensiones y niveles

Las cinco dimensiones de "Conocerte" (F2) ordenan la ruta; los niveles (5.0) son la secuencia.

| Nivel | Sección | Módulos (guía de fase A, D-61) | Dimensión principal | Misiones |
| --- | --- | --- | --- | --- |
| 0 | Abrir tu cuenta | Guía de bienvenida y seguridad básica (sin módulo) | — | Configura tu seguridad |
| 1 | Cuenta | 1 Recibo de sueldo · 2 Tu cerebro y el dinero | Presupuesto | 1 Tu primer cobro |
| 2 | Pagar | 17 Billeteras y fintech (parte pagos) · 18 Estafas (guía base) | Ahorro y emergencias | 2 Transfiere sin errores · 3 Paga con QR · 6 El mensaje falso |
| 3 | Presupuesto | 3 Presupuesto y gastos hormiga | Presupuesto | 7 Mes completo |
| 4 | Apartados y metas | 4 Fondo de emergencia | Ahorro y emergencias | Crea tu fondo de emergencia |
| 5 | Tarjeta y préstamos | 5 El orden importa · 6 Tarjeta y CFT · 7 Salir de deudas · 8 Cuotas o contado | Deudas y crédito | 5 El préstamo tentador · Sal de tus deudas |
| 6 | Rendir | 9 Inflación · 10 Tasas · 11 Plazo fijo, UVA y money market (la parte "cuenta o fondo" del 17, en la misión 4, D-65) | Inflación y tasas | 4 ¿Cuenta o fondo? |
| 7 | Invertir | 12 Ahorrar e invertir · 13 Perfil y bróker · 14 Mercado de capitales · 15 CEDEARs | Metas e inversión | Abre tu cuenta comitente · Tu primer CEDEAR de ETF · Aguanta la caída |

**Dimensión de cada módulo** (`Module.dimension`): presupuesto 1, 2 y 3; ahorro y emergencias 4, 17 y 18; deudas y crédito 5, 6, 7 y 8; inflación y tasas 9, 10 y 11; metas e inversión 12, 13, 14 y 15 (planificar el largo plazo; D-64, en el código `goals`). D-116, aprobada.

**Módulo 17 (D-65):** una sola guía en fase A, en el nivel 2 (pagos, CVU y CBU, protección por tipo de cuenta). La parte "cuenta o fondo" del nivel 6 la cubren la guía del módulo 11 y las tarjetas de la misión 4.

### 4.1 Ruta adaptativa

- "Conocerte" calcula, **en el navegador**, un nivel por dimensión (inicial, intermedio, avanzado) combinando hábitos y conocimientos; ese resultado solo lo ve la persona.
- La ruta respeta el orden de los niveles (el admin no lo cambia, F1). Dentro de un nivel, sugiere qué guía leer primero según la dimensión más débil y lo explica ("Empezamos por presupuesto porque es la base de todo lo demás").
- Si el conocimiento de una dimensión es avanzado, ofrece el desafío de suficiencia de la sección correspondiente ("Ya sé esto").

## 5. Secuencia de una guía (Gagné)

Los nueve eventos de instrucción de Gagné, Wager, Golas y Keller (2005), comprimidos en una guía de 5 a 8 minutos:

| Evento | En la guía | Tiempo aproximado |
| --- | --- | --- |
| 1. Captar la atención | Situación cotidiana con números | 20 s |
| 2. Informar el objetivo | "Al terminar vas a poder…" con verbo observable | 10 s |
| 3. Recuperar lo previo | Pregunta corta de un toque | 20 s |
| 4. Presentar el contenido | 2 o 3 bloques breves con un ejemplo cada uno; chips del glosario | 2 a 3 min |
| 5. Guiar el aprendizaje | Ejemplo resuelto paso a paso | 1 min |
| 6. Provocar el desempeño | Pregunta de práctica o herramienta embebida | 1 a 2 min |
| 7. Retroalimentación | Inmediata y explicada; correcta en `success`, incorrecta en `info` con pista (2.2.1) | Incluida |
| 8. Evaluar | No dentro de la guía: el desafío de nivel reúne los bancos de los módulos (D-57) | Aparte |
| 9. Retención y transferencia | "Para tu vida": una acción para esta semana, y la misión de la sección como práctica | 20 s |

## 6. Estrategia de evaluación

- **Formativa:** práctica en guías, tarjetas de aprendizaje y misiones, sin nota y con reintentos ilimitados.
- **Sumativa:** desafío de nivel con 70 % mínimo (configurable en F1), mejor intento; los reportes muestran también el primero. Si se agotan los intentos, el tutor puede habilitar el nivel con motivo (D-57).
- **Bancos de preguntas:** uno por módulo, con orden aleatorio de preguntas y opciones (salvo "ordenar"). En fase A, cada banco tiene al menos el doble de preguntas de las que usa un desafío, para que los reintentos no sean idénticos.
- **Variedad con propósito:** el tipo de pregunta sale de lo que se quiere comprobar (tabla de 5.1), por ejemplo respuesta numérica para un cálculo y caso con decisiones para un juicio.
- **Caso con decisiones también en los desafíos** (D-81): los niveles 5 y 6 suman preguntas `branching` (préstamo, tarjeta, tasa real), con retroalimentación por camino, además de las decisiones de las misiones.
- **Sin límite de tiempo** (WCAG 2.2.1) y con alternativa accesible a todo arrastre.
- **Retroalimentación** que explica por qué, nunca solo "Correcto" o "Incorrecto".

## 6.z Meta colectiva y aprendizaje social (D-80 y F20, paso 26, D-274)

**Meta colectiva.** El tutor propone una conducta para toda la cohorte, con porcentaje (50 a 100 %) y fecha: completar una misión (por ejemplo, "Crea tu fondo de emergencia") o aprobar el desafío de un nivel. **Se mide con datos de aprendizaje que el tutor ya ve, nunca con datos de la billetera:** "el 80 % con el fondo de emergencia iniciado" de la idea original se traduce en "el 80 % completó la misión del fondo de emergencia", porque el saldo de un apartado no sale del navegador (D-58). El avance es agregado, con el umbral de 5, sin rankings ni nombres; cada persona ve solo si ella ya sumó. Inspirada en las simulaciones grupales de BYMA LAB, sin su ranking.

**Espacio de la cohorte (F20).** Preguntas y respuestas entre personas de la misma cohorte, moderadas por su tutor o tutora (Comunidad, T6): responde, destaca las buenas respuestas y oculta lo que no corresponde, con un motivo que ve quien lo escribió. Se puede publicar sin el nombre, y en ese caso nadie, ni la tutoría, ve quién fue. **El formulario no publica mensajes con montos, correos, teléfonos ni CBU o CVU**, y dice qué quitar. En Hornero no hay espacio de cohorte: sus usuarios no tienen cohortes ni tutoría (5.5).

## 6.y Repaso espaciado y recordatorios (F19 y F9, paso 25, D-273)

**Repaso espaciado.** A los **7 y a los 30 días** de terminar la guía de un módulo, la persona tiene un repaso de **3 preguntas** de su banco (sin casos ramificados, tareas con simulador ni ordenamientos). Es formativo como la práctica de las guías: retroalimentación inmediata, reintentos ilimitados y sin puntaje. La ronda de 30 días llega después de la de 7, cada módulo muestra una sola ronda pendiente y nunca hay más de 3 repasos pendientes a la vez, para que no se acumulen. Se ven en Aprender ("Repasos") y en la campana. El resultado queda solo en el navegador de la persona.

**Recordatorios.** La campana de la billetera suma "Del programa" arriba de los mensajes: guía pendiente del nivel actual, desafío semanal sin informar (hasta su fecha), plazo del programa a 14 días o menos, repasos y meta alcanzada (con el nombre de la meta, nunca su monto). En la configuración del programa, el admin elige los canales de su contexto y ve una **vista previa simulada** de cada recordatorio por canal:

| Contexto | Canales |
| --- | --- |
| Organización (Andina) | Correo, Microsoft Teams y Slack |
| Institución educativa (Ceibo) | Correo y campus virtual |
| Producto (Hornero) | Notificación de la app de Hornero (sin desafíos semanales: no hay tutoría) |

La vista previa es neutra: no imita la interfaz de esas aplicaciones y no envía nada.

## 6.x Registro de actividad tipo xAPI (F21, paso 24, D-272)

Cada acción de aprendizaje se expresa como un enunciado **actor, verbo, objeto**, con la forma de xAPI que recibe un LRS o un LMS corporativo.

| Actividad | Verbo (ADL) | Resultado |
| --- | --- | --- |
| Conocerte (inicio y final) | `completed` | Completo (sin puntajes por dimensión) |
| Guía leída | `completed` | Completo |
| Desafío de nivel o de suficiencia | `passed` o `failed` | Puntaje escalado (0 a 1) |
| Misión | `completed` | Completo |
| Desafío semanal del tutor | `attempted` | Cumplido, en parte o no cumplido |

- **De dónde salen:** de los datos de aprendizaje que la organización ya tiene (`deriveStatements` en `src/lib/xapi.ts`). No suman nada que no estuviera: nunca montos, hábitos, reflexiones, decisiones dentro de la billetera ni si un nivel está bloqueado (D-58, D-62).
- **Actor con seudónimo** estable por organización ("Persona 7F3A0C"): el admin ve el flujo de actividad sin saber de quién es, como pide 4.2. Ni el `id` del enunciado lleva el identificador de la persona.
- **Dónde se ven:** el admin, en "Actividad" (O5), con filtro por tipo, el JSON de cada enunciado y la descarga del archivo. En el modo integrado, Hornero recibe **solo hitos** (misiones y guías completadas, desafíos aprobados), sin puntajes, dentro de la sesión de la persona, y se los muestra a ella en "Lo que Alcancía le avisó a Hornero"; el equipo de producto ve solo cifras agregadas.
- **Lo que no se envía:** "nivel desbloqueado". La spec lo menciona como ejemplo de aviso al socio (5.5), pero de un desbloqueo se deduce el estado de la billetera (D-58), así que se manda "desafío aprobado" en su lugar.
- **Línea futura:** enviar los enunciados a un LRS real (con su endpoint y credenciales del lado del servidor) y empaquetar el programa como cmi5.

## 7. Medición de impacto (Kirkpatrick)

Modelo de Kirkpatrick y Kirkpatrick (2016), con la privacidad de D-58 y D-62:

| Nivel | Qué se mide | Fuente | Quién lo ve |
| --- | --- | --- | --- |
| 1 · Reacción | Satisfacción de 1 a 5 con cada guía y comentario opcional | Al terminar cada guía | Admin y decisor, agregado con umbral |
| 2 · Aprendizaje | Diferencia pre y post por dimensión **solo con preguntas de conocimiento** de "Conocerte" (D-62) y resultados de los desafíos de nivel (primer y mejor intento) | "Conocerte" inicial y final, desafíos | Tutor individual (sus cohortes); admin y decisor agregado |
| 3 · Conducta | Autoinforme a 30 días ("¿Aplicaste lo aprendido?": presupuesto armado, fondo iniciado, pago total de la tarjeta) y desafíos semanales cumplidos. Es donde se miden los **hábitos**, por autoinforme y no desde las respuestas de "Conocerte" | Encuesta a 30 días (fase A con datos semilla; F15 en fase B), desafíos semanales | Admin y decisor agregado; tutor ve desafíos individuales |
| 4 · Resultados | Línea futura (por ejemplo, bienestar financiero reportado); no se inventan datos de negocio | — | — |

**Lo que nunca entra en la medición:** montos, saldos, decisiones dentro de la billetera, respuestas de hábitos, reflexiones y el estado bloqueado o desbloqueado de un nivel.

## 8. Gamificación con medida

- Niveles, logros e insignias que **celebran conductas financieras sanas** (crear el fondo, revisar un CFT, reportar una estafa, pagar el total de la tarjeta), no clics ni tiempo de uso.
- Sin rachas que castiguen, sin rankings entre personas, sin cuentas regresivas, sin pérdida de progreso (5.0).
- La celebración es breve, con Fuerte, y respeta "reducir animaciones".

## 9. Fuerte como agente pedagógico

Fuerte (5.0.1) cumple funciones pedagógicas concretas, no decorativas:

| Momento | Función | Ejemplo de la spec |
| --- | --- | --- |
| Bienvenida | Bajar la ansiedad y fijar el marco ("equivocarte sale gratis") | "Hola, Mariana. Soy Fuerte…" |
| Antes de un error evitable | Andamiaje: avisar sin resolver por la persona | "Ojo con esto: el titular no coincide…" |
| Después de un error | Retroalimentación sin culpa, con el porqué | "Pasó lo mismo que en la vida real…" |
| Logro o desbloqueo | Refuerzo de conducta y próximo paso | "Guardado. Tu fondo de emergencia ya cubre un mes…" |
| Sección bloqueada | Explicar la secuencia como contenido | "Primero lo que te protege, después lo que te hace crecer" |

Nunca habla más de dos oraciones, nunca recomienda productos y tiene tres niveles de presencia; las tarjetas de aprendizaje siguen apareciendo aunque esté en silencio.

## 10. Qué toma Alcancía del mercado de aprendizaje corporativo

| Práctica | En Alcancía |
| --- | --- |
| Estructura de **LMS**: programas asignados, plazos, seguimiento, reportes | Fase A (F1, F6, F7, F8) |
| Experiencia de **LXP**: diagnóstico, ruta personalizada, contenido a demanda | Fase A (F2, F3) |
| **Microaprendizaje** y diseño **mobile first** para personal operativo | Fase A (guías de 5 minutos, Diego en el celular) |
| **Aprendizaje práctico** con simulaciones y casos | Fase A (billetera, misiones, F4, 5.1) |
| **Evaluación de impacto** (Kirkpatrick) | Fase A (F7); nivel 3 ampliado en F15 |
| **Aprendizaje en el flujo de trabajo** (recordatorios por Teams o Slack) | Fase B (F9, simulado) |
| **Repaso espaciado** | Fase B (F19) |
| **Aprendizaje social** y entre pares | Fase B (F20) |
| **Gamificación con medida** e insignias | Fase A (niveles, logros); fase B (F12, F18) |
| **Interoperabilidad** (SCORM, xAPI, cmi5) | Fase A registra eventos tipo xAPI en las misiones; visor en fase B (F21); exportar el programa como paquete, línea futura |
| **Asistente con IA** | Línea futura; queda previsto el lugar del botón de ayuda flotante |
| **Academia interna** con varios programas y habilidades | Siguiente proyecto: el modelo academia > programa > módulo > lección ya lo admite |

## 11. Escape room "Tu primer sueldo" (paso 28, F18)

### 11.1 El original, recorrido el 15/11/2026

Fuente: `https://lpedaci.github.io/taller-primerempleo/escape/` (gamificación y diseño instruccional de Lourdes Pedaci; contenido de finanzas del Lic. Kevin Giampieri). Se leyó el código del sitio (`escape.js` y los datos `escape-finanzas.js`, `escape-versiones.js` y `escape-economia.js`), donde vive todo el contenido.

**Historia.** "Es tu primer día de cobro. Fuiste a la empresa a firmar el recibo y la puerta de la oficina se trabó." Para salir hay que abrir 5 candados, uno por sala; cada candado da letras del código de la puerta final.

**Salas** (se abren en orden; cada una con escena, objetos para inspeccionar, un candado, dos pistas, una explicación de cierre con enlace al taller y una reflexión opcional):

| Sala | Escena | Objetos | Candado (versión inicial) | Errores esperados con mensaje |
| --- | --- | --- | --- | --- |
| 1 · Recepción, "El recibo" | El recibo con una mancha de café sobre el neto | Recibo (bruto $ 1.000.000, aportes 11 + 3 + 3 %, contribuciones aparte) y nota de RR. HH. | **Número:** sueldo neto, $ 830.000 | Bruto, solo descuentos, suma parcial, restar contribuciones, costo empresa |
| 2 · Oficina, "El presupuesto" | Lista de gastos y un post-it | Lista de 6 gastos y post-it del café ($ 3.000 × 22 días hábiles) | **Desafío previo de clasificar** (necesidad o gusto) que "enciende" el candado; después **número:** café por mes, $ 66.000 | Un café, días corridos, una semana |
| 3 · Caja, "La tarjeta" | Resumen y dos folletos del mismo celular | Resumen ($ 200.000, mínimo $ 20.000) y folletos A (cuota más baja, CFTEA 157 %) y B (CFTEA 92 %) | **Palabra:** el dato a comparar, CFT o CFTEA. **Pregunta extra** de opción única: qué pasa si pagas el mínimo | TNA, TEA, IVA, "cuota" |
| 4 · Bóveda, "La inflación" | Sobre de ahorro y etiqueta de precio | Sobre con $ 100.000 y zapatillas que subieron 10 % | **Número:** cuánto falta, $ 10.000. **Pregunta extra:** qué importa en un fondo de emergencia (liquidez) | Precio nuevo, cero, calcular una baja |
| 5 · Salida, "Los mensajes" | Cuatro mensajes en el celular, uno real | SMS con enlace acortado, WhatsApp que pide un código, mail de premio, aviso real de la app | **Selección múltiple:** marcar las tres estafas | El aviso real marcado; cada estafa que falta, con su explicación |

**Versiones.** Cada sala tiene tres: **inicial, intermedia y avanzada** (recibo con horas extras o con suma no remunerativa; dos gastos hormiga con igual o distinta frecuencia; total de la oferta conveniente o diferencia entre ofertas; dos meses de aumentos acumulados o una cuenta remunerada que rindió menos que la inflación; otras estafas: tasa de envío, acceso remoto, cambio de alias, dominio falso de un organismo, trabajo que cobra matrícula, transferencia "por error"). Al empezar, cada sala toma una versión al azar, priorizando las no resueltas; volver a jugar una sala cambia de versión.

**Puerta final.** Una palabra al azar por partida (METAS, RENTA, DISCIPLINA o PLANIFICAR) con su pregunta ("¿Qué necesitás para que tu sueldo te alcance?"). Con 5 letras, cada sala da una; con 10, dos. Se escribe la palabra ordenando las letras; un anagrama válido que no responde tiene su mensaje.

**Economía de pistas** (`escape-economia.js`): 3 llaves iniciales; cada pista cuesta 1; +1 llave por reflexión escrita; tras 3 intentos fallidos seguidos la próxima pista es gratis. **Sello** de salida según pistas usadas: "Salida limpia" (hasta 1), "Buena estrategia" (hasta 4), "Saliste".

**Insignias.** Bronce, plata y oro por resolver las cinco salas en la versión inicial, intermedia o avanzada; se descargan como imagen y se conservan al empezar una partida nueva.

**Fuerte.** Caja fuerte naranja con **5 luces**, una por candado, con niveles de hábito: Claridad, Orden, Prudencia, Previsión y Seguridad. Habla al saludar, ante un error, al dar una pista y al festejar.

**Otras mecánicas.** Sin límite de tiempo ni forma de perder; tiempo oculto que se puede mostrar. Autoevaluación de 5 frases antes y después, con gráfico, "tu fortaleza" y "tu próximo paso". Código de resultado para pegar en un formulario docente. **Modo simple** (`?modo=simple`): las mismas preguntas como cuestionario lineal, sin capa de juego. Tema claro y oscuro, "Saltar al contenido", `prefers-reduced-motion`, objetos como botones, "Empezar de cero" con confirmación. Registro local de eventos.

### 11.2 Propuesta de adaptación a Alcancía (pendiente de confirmación de Lourdes)

1. **Dónde vive:** en Aprender, como **desafío especial desde el nivel 4** (F22). No forma parte del orden de desbloqueo: se juega cuando la persona quiere.
2. **Lo que se conserva:** historia y cinco salas en el mismo orden, objetos para inspeccionar, tres versiones por sala, letras y palabra de la puerta final, llaves y pistas (3 iniciales, +1 por reflexión, pista gratis tras 3 errores), sello por pistas, insignias de bronce, plata y oro descargables, tiempo oculto, sin forma de perder, "Empezar de cero", modo simple como alternativa accesible.
3. **Un tipo de evaluación distinto por candado** (spec 5.1): Sala 1 **respuesta numérica** (neto); Sala 2 **clasificar** (necesidad o deseo, que enciende el candado) y su número; Sala 3 **opción única** (qué dato comparar: el CFT) en lugar de escribir la sigla; Sala 4 **ordenar** (los pasos para saber cuánto falta: precio nuevo, restar lo ahorrado) junto a su número; Sala 5 **caso con decisiones** (qué haces ante cada mensaje) en lugar de marcar los tres.
4. **Textos con tú** y vocabulario de 2.9 ("dinero" en lugar de "plata", "deseo" en lugar de "gusto"); la empresa del recibo pasa a ser Andina Servicios (y la del contexto que corresponda), con los mismos montos del original.
5. **Fuerte con sus 7 luces de nivel intactas** (D-134): el escape room muestra sus **5 candados** como su propio avance, con los nombres de hábito (Claridad, Orden, Prudencia, Previsión, Seguridad).
6. **Lo que no se trae:** la autoevaluación antes y después (ya está Conocerte, que mide lo mismo con más precisión) y el código para el formulario docente (lo reemplaza el registro tipo xAPI, F21).
7. **Privacidad:** al tutor y al admin solo les llega si se completó y qué insignia se obtuvo; nunca las reflexiones ni los montos.
8. **Contenido en dos tandas de revisión:** primero las cinco salas en versión inicial con el motor y la puerta; después las versiones intermedia y avanzada.
9. **Versiones (D-310, 16/11/2026):** la persona elige la versión antes de entrar, en lugar del sorteo por sala del original, para que cada insignia dependa de una partida completa en esa versión. Las preguntas extra del original son el desafío previo que enciende el candado. Las insignias se descargan como imagen, sin datos personales.
10. **Modo simple (D-312):** las mismas preguntas como cuestionario lineal, sin capa de juego, con la misma insignia. **Visibilidad (D-313):** tutoría ve, por persona, si lo completó y con qué insignias; L&D, la proporción por cohorte con el umbral de 5.

### 11.3 Insignias y certificado (F12, D-315)

Las insignias de módulo (D-57) y las del escape room se descargan como imagen, sin datos de la persona. El certificado de finalización reconoce el programa completo (niveles 1 a 7) con los módulos y sus insignias, nunca montos ni hábitos, y es un certificado de demostración sin validez oficial. **Línea futura:** emitirlos como credenciales verificables con el estándar Open Badges 3.0 (1EdTech), para que la persona las lleve a su perfil profesional.

## 12. Plan de mejora

| Cuándo | Qué se revisa | Con qué datos | Qué se puede cambiar |
| --- | --- | --- | --- |
| Después de cada tanda de contenido | Exactitud y tono | Revisión de Lourdes y del Lic. Kevin Giampieri | Textos, ejemplos, preguntas |
| Piloto visual y de usabilidad | Comprensión de la billetera como entorno de aprendizaje | Tests de `personas.md` y `information-architecture.md` | Rótulos, secuencia de pantallas |
| Primeras 4 semanas de una cohorte | Ítems que fallan, abandono por nivel, satisfacción | Paneles con umbral (T4, O1) | Preguntas del banco, guías, condiciones de desbloqueo |
| A 30 días | Conducta | Autoinforme | Acciones de "Para tu vida", desafíos semanales |

## Referencias

Anderson, L. W., & Krathwohl, D. R. (Eds.). (2001). *A taxonomy for learning, teaching, and assessing: A revision of Bloom's taxonomy of educational objectives*. Longman.

Gagné, R. M., Wager, W. W., Golas, K. C., & Keller, J. M. (2005). *Principles of instructional design* (5.ª ed.). Wadsworth.

Gottfredson, C., & Mosher, B. (2011). *Innovative performance support: Strategies and practices for learning in the workflow*. McGraw-Hill.

Kirkpatrick, J. D., & Kirkpatrick, W. K. (2016). *Kirkpatrick's four levels of training evaluation*. ATD Press.

Knowles, M. S., Holton, E. F., III, & Swanson, R. A. (2015). *The adult learner: The definitive classic in adult education and human resource development* (8.ª ed.). Routledge.

Kolb, D. A. (1984). *Experiential learning: Experience as the source of learning and development*. Prentice Hall.

Wiggins, G., & McTighe, J. (2005). *Understanding by design* (2.ª ed. ampliada). ASCD.
