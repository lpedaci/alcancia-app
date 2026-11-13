# Contenido

> Fecha: 12/11/2026 · Segunda tanda del paso 0 (spec 14.9). Por módulo: objetivo, evidencia, actividades, fuentes y estado de revisión. Las guías completas se escriben en el paso de su sección (D-61) y se agregan acá cuando estén listas para revisar.

## Reglas de este documento

- **Fuentes:** **T** sitio del taller; **A-xx** diapositiva del Anexo A (Lic. Kevin Giampieri); **B-xx** dato oficial del Anexo B; **Anexo C** y **Anexo D**, fichas informativas.
- **Estado de revisión:**
  - *Validado, adaptar sin cambiar datos:* contenido de T o A-xx. Se cambia el registro (tuteo, tono corporativo, vocabulario de 2.9), nunca los datos ni los conceptos.
  - *Ampliación: pendiente de revisión del Lic. Kevin Giampieri:* lo que agrega Alcancía, construido sobre B-xx.
  - *⚠ Pendiente de verificación:* dato con una pregunta abierta en `questions.md`. No se muestra hasta resolverla, o se muestra con la redacción más prudente y su fuente.
- **Ejemplos:** números redondos y ficticios; sin estadísticas inventadas.
- **Fase A (D-61):** cada módulo tiene objetivo, **una guía completa** y su parte del banco de preguntas. Las guías 2 y 3 de cada módulo pasan a fase B.

## Resumen

| Mód. | Título | Nivel | Dimensión | Fuente | Estado |
| --- | --- | --- | --- | --- | --- |
| 1 | Tu recibo de sueldo | 1 | Presupuesto | T | Validado |
| 2 | Tu cerebro y el dinero | 1 | Presupuesto | A-06 a A-16 | Validado |
| 3 | Presupuesto y gastos hormiga | 3 | Presupuesto | A-32 a A-34, T | Validado |
| 4 | Fondo de emergencia | 4 | Ahorro y emergencias | A-35, A-36 | Validado |
| 5 | El orden importa | 5 | Deudas y crédito | A-22, A-23 | Validado |
| 6 | Tarjeta de crédito: mínimo, TNA y CFT | 5 | Deudas y crédito | T, B-04, B-05 | Validado (T) + ampliación |
| 7 | Salir de deudas | 5 | Deudas y crédito | A-24 a A-30 | Validado |
| 8 | ¿Cuotas sin interés o contado? | 5 | Deudas y crédito | B-04 | Ampliación |
| 9 | Inflación y poder de compra | 6 | Inflación y tasas | A-21, T | Validado |
| 10 | Tasas sin misterio | 6 | Inflación y tasas | B-04 | Ampliación |
| 11 | Plazo fijo, UVA y money market | 6 | Inflación y tasas | A-36, B-01 a B-03, B-12 a B-14, B-26 | Validado (A-36) + ampliación |
| 12 | Ahorrar e invertir no son lo mismo | 7 | Metas e inversión | A-19, A-20, A-38, A-39, A-55 | Validado (A-20 ⚠) |
| 13 | Tu perfil de inversor y cómo elegir un bróker | 7 | Metas e inversión | A-53, A-54, B-20 a B-23, Anexo C | Validado + ampliación |
| 14 | Mercado de capitales | 7 | Metas e inversión | A-40, A-42 a A-45, B-25 | Validado (A-40 y A-42 ⚠) + ampliación |
| 15 | CEDEARs | 7 | Metas e inversión | A-46, B-30 a B-36 | Ampliación |
| 16 | Criptomonedas | 8 (fase B) | Metas e inversión | A-48 a A-51, B-18, B-27 | Fase B |
| 17 | Billeteras virtuales y fintech | 2 (D-65) | Ahorro y emergencias | B-10 a B-19, Anexo D | Ampliación |
| 18 | Estafas y mensajes sospechosos (guía base) | 2 | Ahorro y emergencias | T (sala 5 del escape room), B-24 | Validado (T) + ampliación |

Dimensiones: D-116, aprobada; la quinta se llama "Metas e inversión" (D-64; en el código, `goals`).

---

## Nivel 0 · Abrir tu cuenta

**Guía de bienvenida y seguridad básica** (sin módulo, 3 minutos)
- **Objetivo:** configurar un segundo factor de práctica e identificar que un código de verificación nunca se comparte.
- **Evidencia:** misión "Configura tu seguridad" (segundo factor activado) y una pregunta de opción única ("¿Quién puede pedirte el código?").
- **Actividades:** bienvenida guiada con Fuerte; alta simulada sin datos reales; "Conocerte".
- **Fuentes:** B-24 (señales de alerta). **Estado:** ampliación.

### "Conocerte" (las 12 preguntas)

Versión con opciones y explicaciones en `src/data/conocerte.json` (paso 6, D-167). Las explicaciones de las preguntas de conocimiento salen de T, A-21, A-35, A-38 y B-04; la frase "cerca de 42,6 % en 12 meses" es el cálculo de `(1,03)^12 − 1`. **Estado:** borrador para revisión de Lourdes; las ampliaciones, para revisión del Lic. Kevin Giampieri.

Las de **hábitos** no tienen respuesta correcta ni juicio, y **nunca salen del navegador** (D-62). Las de **conocimiento** dan retroalimentación al final y son las únicas que entran en Kirkpatrick 2.

| # | Tipo | Dimensión | Pregunta (borrador) |
| --- | --- | --- | --- |
| 1 | Hábito | Presupuesto | ¿Llevas registro de tus gastos? (Siempre · A veces · Casi nunca) |
| 2 | Hábito | Ahorro y emergencias | Si mañana tuvieras un gasto imprevisto grande, ¿cómo lo cubrirías? (Con ahorros · Con la tarjeta o un préstamo · Pidiendo prestado · No sé) |
| 3 | Hábito | Deudas y crédito | ¿Cómo pagas habitualmente la tarjeta? (El total · Más del mínimo · El mínimo · No tengo tarjeta) |
| 4 | Hábito | Inflación y tasas | Cuando te sobra dinero a fin de mes, ¿qué haces con él? (Lo dejo en la cuenta · Lo pongo a rendir · Lo gasto · No me suele sobrar) |
| 5 | Hábito | Metas e inversión | ¿Tienes una meta de ahorro con monto y fecha? (Sí · Tengo una idea · No) |
| 6 | Conocimiento | Presupuesto | En un recibo, ¿qué es el sueldo neto? (opción única) |
| 7 | Conocimiento | Ahorro y emergencias | ¿Cuántos meses de gastos básicos se suele recomendar para un fondo de emergencia? (opción única, A-35) |
| 8 | Conocimiento | Deudas y crédito | ¿Qué incluye el CFT que no incluye la TNA? (opción única, B-04) |
| 9 | Conocimiento | Deudas y crédito | Si pagas solo el mínimo de la tarjeta, ¿qué pasa con el resto? (opción única) |
| 10 | Conocimiento | Inflación y tasas | Si la inflación es del 3 % mensual, ¿$ 100.000 guardados un año compran más, lo mismo o menos? (opción única) |
| 11 | Conocimiento | Inflación y tasas | ¿Qué indica la TNA? (opción única) |
| 12 | Conocimiento | Metas e inversión | ¿Cuál es la diferencia entre ahorrar e invertir? (opción única, A-38) |

---

## Tanda del paso 7: guías y bancos de los niveles 1 a 4 (D-171)

Texto completo en `src/data/guides.json` (una guía por módulo) y `src/data/question-banks.json` (5 preguntas por módulo). **Estado:** borrador para revisión de Lourdes; las ampliaciones (módulos 17 y 18), además, para revisión del Lic. Kevin Giampieri.

| Módulo | Guía | Banco (tipos) | Fuentes |
| --- | --- | --- | --- |
| 1 · Tu recibo de sueldo | "Del bruto al neto" (6 min) | numérica (neto), opción única (bruto, costo laboral), clasificar (aportes y contribuciones), verdadero o falso con justificación | T |
| 2 · Tu cerebro y el dinero | "Esperar 48 horas" (6 min) | opción única (regla de las 48 horas, descuento hiperbólico, riqueza real), verdadero o falso (minimalismo), opción múltiple (frenar el impulso) | A-06, A-08, A-10, A-12 a A-16 |
| 17 · Billeteras y fintech | "Qué tipo de cuenta tienes" (7 min) | unir pares (CVU, CBU, PSPCP, QR), opción única (garantía, transferencia inmediata, registro), numérica (tope prorrateado: $ 50.000.000 ÷ 2) | B-01, B-10, B-12, B-14 a B-16, B-19 |
| 18 · Estafas (guía base) | "Nadie legítimo te pide un código" (5 min) | opción múltiple (señales de alerta), opción única (código, alertas de la CNV), clasificar (tres mensajes sospechosos y uno esperable), verdadero o falso (página parecida) | T, B-24 |
| 3 · Presupuesto | "Adónde va tu sueldo" (7 min) | clasificar (8 gastos), numéricas (20 % y 50 % del neto), opción única (70/20/10), verdadero o falso (gastos hormiga) | A-32 a A-34, T |
| 4 · Fondo de emergencia | "Tu colchón para imprevistos" (6 min) | numérica ($ 700.000 × 3), opción múltiple (qué es una emergencia), opción única (liquidez y riesgo), ordenar (4 pasos), verdadero o falso (no invertirlo todo) | A-35, A-36 |

Cálculos verificados a mano: $ 1.559.263,32 − $ 274.304,46 = $ 1.284.958,86; 50 % = $ 642.479,43; 30 % = $ 385.487,66; 20 % = $ 256.991,77; $ 700.000 × 3 = $ 2.100.000; con $ 250.000 por mes se llega en 9 meses (8 × 250.000 = 2.000.000 no alcanza).

## Nivel 1 · Cuenta

### Misiones del paso 6 (D-166)

- **Configura tu seguridad** (nivel 0): tarjeta "Tus códigos son solo tuyos" (B-24), activar el segundo factor, elegir un límite diario y reconocer un pedido falso de código (opción única con devolución por opción). Criterios: segundo factor activado, límite elegido y respuesta correcta.
- **Tu primer cobro** (nivel 1): cobrar el sueldo neto de demo ($ 1.284.958,86, D-54), elegir el neto entre bruto, neto y costo laboral del recibo del taller (T), separar el 20 % en "Ahorro" ($ 256.991,77, tolerancia $ 1, A-32), el débito sorpresa de $ 4.990 (D-55, A-34) y decidir si se cancela. Se juega en una cuenta de práctica nueva.

### Módulo 1 · Tu recibo de sueldo
- **Objetivo:** calcular el sueldo neto a partir del bruto y los descuentos de un recibo, y clasificar cada concepto como aporte, contribución o suma no remunerativa.
- **Evidencia:** respuesta numérica (neto del recibo de demo, tolerancia de $ 1); clasificar 6 conceptos del recibo; misión 1 (separar el 20 % del neto).
- **Guía de fase A:** "Del bruto al neto", con el recibo del taller (D-54): bruto $ 1.559.263,32 (remunerativo $ 1.469.263,32 y no remunerativo $ 90.000), descuentos $ 274.304,46 (jubilación 11 %, Ley 19.032 3 %, obra social 3 %, aporte solidario), neto **$ 1.284.958,86**; costo total para el empleador $ 2.171.180,60.
- **Actividades:** recibo interactivo con los números del taller; "Para tu vida": revisar tu recibo y verificar que bruto menos descuentos dé el neto (T).
- **Fuentes:** T, sección "El recibo de sueldo". **Estado:** validado.
- **Cómo se muestra (D-54, respuesta a Q-11):** tal como está en el taller, con su nombre ficticio y el rótulo "Recibo de ejemplo", no a nombre de Mariana ni de Diego (tienen puestos distintos; el mismo sueldo de práctica es una simplificación).

### Módulo 2 · Tu cerebro y el dinero
- **Objetivo:** identificar la gratificación inmediata y el sesgo de descuento hiperbólico en situaciones de consumo, y aplicar la regla de las 48 horas para decidir una compra no esencial.
- **Evidencia:** caso con decisiones (una compra impulsiva con fricción); verdadero o falso con justificación sobre el minimalismo como estrategia.
- **Guía de fase A:** "Esperar 48 horas": tabú del dinero (A-06), administración y disciplina (A-08), riqueza real frente a apariencia sin referencias a influencers (A-10 a A-12), trampa dopamínica (A-13), US$ 100 hoy o US$ 110 mañana (A-14), menos suscripciones y gastos fijos (A-15, A-16).
- **Actividades:** se conecta con la suscripción sorpresa de la misión 1 (D-55).
- **Fuentes:** A-06, A-08, A-10 a A-16. **Estado:** validado.

**Desafío del nivel 1:** banco de los módulos 1 y 2 (requisito del nivel 2 junto con la misión 1, D-63).

---

## Nivel 2 · Pagar

### Módulo 17 · Billeteras virtuales y fintech (guía de pagos)
- **Objetivo:** distinguir una cuenta de pago con CVU de una cuenta bancaria con CBU, explicar qué protección tiene el dinero en cada tipo y verificar una entidad en el registro oficial.
- **Evidencia:** unir pares (CVU, CBU, PSPCP, garantía de los depósitos); opción única sobre transferencias inmediatas que no se deshacen desde la app; misiones 2 y 3.
- **Guía de fase A:** "Qué tipo de cuenta tienes": CVU y CBU (B-16), PSPCP y registro del BCRA (B-10, B-19), fondos sin garantía de los depósitos (B-12) frente a cuentas bancarias con garantía hasta el tope (B-01), transferencias inmediatas y QR interoperable (B-15), y la ficha del Anexo D.
- **Actividades:** ficha "Billeteras y fintech en Argentina" (Fichas y registros); área "Verificar".
- **Fuentes:** B-01, B-10 a B-16, B-19, Anexo D. **Estado:** ampliación, pendiente de revisión del Lic. Kevin Giampieri. Las filas del Anexo D se publican solo si se verifican en el paso 3 (Q-09).

### Módulo 18 · Estafas y mensajes sospechosos (guía base, fase A)
- **Objetivo:** reconocer las señales de un mensaje fraudulento y reportarlo sin compartir códigos.
- **Evidencia:** misión 6 (clasificar correctamente tres mensajes); opción múltiple con las señales de alerta.
- **Guía de fase A:** "Nadie legítimo te pide un código": falso soporte, enlace a una página parecida, "inversión garantizada"; señales de alerta de la CNV (B-24).
- **Fuentes:** T (sala 5 del escape room), B-24. **Estado:** validado (T) + ampliación. El módulo completo, en fase B (F11).

**Desafío del nivel 2:** banco de los módulos 17 y 18.

---

## Nivel 3 · Presupuesto

### Módulo 3 · Presupuesto y gastos hormiga
- **Objetivo:** clasificar gastos en necesidades, deseos y ahorro, y armar un presupuesto mensual tomando 50/30/20 o 70/20/10 como punto de partida.
- **Evidencia:** clasificar 8 gastos (5.1); respuesta numérica (20 % del neto, F-24); misión 7 (mes en verde, `wallet-engine.md` sección 8).
- **Guía de fase A:** "Adónde va tu sueldo": 50/30/20 (A-32; el original la llama 50/20/30), 70/20/10 para gastos fijos altos (A-33), gastos hormiga y anotar todo un mes (A-34).
- **Actividades:** SIM-1 precargado con los movimientos de la billetera.
- **Fuentes:** A-32 a A-34, T. **Estado:** validado. ⚠ El "15 % del ingreso anual" de A-34 se muestra como dato del material del taller, con la redacción "pueden llegar a" y sin presentarlo como estadística.

**Desafío del nivel 3:** banco del módulo 3.

---

## Nivel 4 · Apartados y metas

### Módulo 4 · Fondo de emergencia
- **Objetivo:** calcular el monto de un fondo de emergencia de 3 a 6 meses de gastos esenciales y elegir dónde guardarlo según liquidez y riesgo.
- **Evidencia:** respuesta numérica (F-23); opción única sobre qué es y qué no es una emergencia; misión "Crea tu fondo de emergencia".
- **Guía de fase A:** "Lo que te protege": cuánto, dónde y para qué no es (A-35, A-36).
- **Actividades:** SIM-2 y SIM-8.
- **Fuentes:** A-35, A-36. **Estado:** validado.

**Desafío del nivel 4:** banco del módulo 4.

---

## Nivel 5 · Tarjeta y préstamos

### Módulo 5 · El orden importa
- **Objetivo:** ordenar las prioridades (pagar deudas caras, ahorrar, invertir) y justificar el orden comparando la tasa de una deuda con un rendimiento.
- **Evidencia:** ordenar pasos; verdadero o falso con justificación ("Pagar una deuda al 120 % equivale a ganar un 120 % asegurado", A-23).
- **Guía de fase A:** "Primero lo que te cuesta".
- **Fuentes:** A-22, A-23. **Estado:** validado.

### Módulo 6 · Tarjeta de crédito: pago mínimo, TNA y CFT
- **Objetivo:** comparar el costo de pagar el mínimo con el de pagar el total, y distinguir TNA, TEA y CFT en un resumen.
- **Evidencia:** ejercicio con SIM-7 ("¿Cuántos meses tardas pagando el mínimo?", F-14); unir pares de términos; resumen de la tarjeta de práctica (`wallet-engine.md`, sección 9).
- **Guía de fase A:** "Lo que dice tu resumen": obligación de informar TNA, TEA y CFT con el CFT destacado (B-04).
- **Fuentes:** T, B-04. ⚠ El límite del interés compensatorio (B-05) no se menciona hasta resolver Q-02. **Estado:** validado (T) + ampliación.

### Módulo 7 · Salir de deudas: bola de nieve o avalancha
- **Objetivo:** comparar los métodos bola de nieve y avalancha y elegir uno según el objetivo (motivación o menor costo).
- **Evidencia:** ejercicio con SIM-9 (F-16); caso con decisiones; misión "Sal de tus deudas".
- **Guía de fase A:** "Dos caminos para salir": ejemplos de A-25 y A-29, y cuándo usar cada uno (A-30).
- **Fuentes:** A-24 a A-30. **Estado:** validado.

### Módulo 8 · ¿Cuotas sin interés o contado con descuento?
- **Objetivo:** decidir entre cuotas sin interés y contado con descuento calculando el valor presente de las cuotas en un escenario de inflación.
- **Evidencia:** ejercicio con SIM-6 (F-10 a F-13); verdadero o falso con justificación ("Las cuotas sin interés siempre convienen"); misión 5.
- **Guía de fase A:** "Depende del escenario".
- **Fuentes:** B-04 (costo financiero). **Estado:** ampliación, pendiente de revisión del Lic. Kevin Giampieri.

**Desafío del nivel 5:** bancos de los módulos 5 a 8.

---

## Nivel 6 · Rendir

### Módulo 9 · Inflación y poder de compra
- **Objetivo:** calcular la pérdida de poder de compra de un monto para una inflación y un plazo dados.
- **Evidencia:** respuesta numérica con SIM-3 (F-05); opción única.
- **Guía de fase A:** "El ladrón silencioso" (A-21), con la calculadora de inflación del taller (T, F-07).
- **Fuentes:** A-21, T, B-40 (IPC del INDEC). **Estado:** validado.

### Módulo 10 · Tasas sin misterio: TNA, TEM, TEA y tasa real
- **Objetivo:** convertir una TNA en tasa del período y en TEA, y calcular la tasa real frente a la inflación.
- **Evidencia:** respuestas numéricas (F-01 a F-04); ejercicio con SIM-4.
- **Guía de fase A:** "La tasa que importa".
- **Fuentes:** B-04 (TNA, TEA y CFT en los documentos). **Estado:** ampliación.

### Módulo 11 · Plazo fijo tradicional, plazo fijo UVA y fondos money market
- **Objetivo:** comparar plazo fijo tradicional, plazo fijo UVA y fondo money market por rendimiento, liquidez, riesgo y protección.
- **Evidencia:** misión 4 "¿Cuenta o fondo?" (verdadero o falso con por qué); ejercicio con SIM-5 y SIM-12.
- **Guía de fase A:** "Dónde guardar sin perder": garantía de los depósitos hasta $ 50.000.000 (B-01), plazo mínimo de 30 días (B-02), UVA no obligatorio desde 2025 y condiciones de cada banco (B-03), cuenta de pago o fondo (B-12 a B-14), fondos money market (B-26), mayor parte del dinero de las billeteras en fondos (B-17).
- **Fuentes:** A-36, B-01 a B-03, B-12 a B-14, B-17, B-26. ⚠ Sin tasa mínima (Q-01) ni nombres de variantes de fondos (Q-03). **Estado:** validado (A-36) + ampliación.

**Desafío del nivel 6:** bancos de los módulos 9 a 11. La parte "cuenta o fondo" del módulo 17 se practica en la misión 4 (D-65).

---

## Nivel 7 · Invertir

### Módulo 12 · Ahorrar e invertir no son lo mismo
- **Objetivo:** diferenciar ahorrar de invertir y estimar el efecto del interés compuesto y del costo de oportunidad con una herramienta.
- **Evidencia:** ejercicio con SIM-10 (F-19); opción única (A-38).
- **Guía de fase A:** "El tiempo como aliado": costo de oportunidad (A-19), ejemplo histórico del teléfono frente a la acción (A-20, ⚠ con "ejemplo histórico aproximado" y "Los rendimientos pasados no garantizan rendimientos futuros"), interés compuesto (A-39), US$ 200 por mes durante 33 años (A-55, F-19).
- **Fuentes:** A-19, A-20, A-38, A-39, A-55. **Estado:** validado.

### Módulo 13 · Tu perfil de inversor y cómo elegir un bróker registrado en la CNV
- **Objetivo:** explicar para qué sirve el perfil de inversor y verificar a un agente en el Registro Público de Agentes de la CNV.
- **Evidencia:** misión "Abre tu cuenta comitente" (con el bróker ficticio); ordenar los pasos para abrir una cuenta (A-54).
- **Guía de fase A:** "Antes de abrir una cuenta": qué es un bróker (A-53), pasos (A-54), categorías de agentes (B-20), verificar matrícula (B-21), tus títulos a tu nombre (B-22), reclamos (B-23), ficha del Anexo C.
- **Fuentes:** A-53, A-54, B-20 a B-23, Anexo C. ⚠ Categoría de IOL (Q-07). **Estado:** validado + ampliación.

### Módulo 14 · Mercado de capitales
- **Objetivo:** clasificar instrumentos (acciones, bonos, obligaciones negociables, FCI, ETF) por riesgo, liquidez, moneda y horizonte, y explicar la diversificación con índices.
- **Evidencia:** clasificar en categorías; ficha estándar de instrumento.
- **Guía de fase A:** "Qué hay en el mercado": índices S&P 500, Nasdaq 100, Dow Jones y ACWI (A-43 a A-45), FCI (B-25).
- **Fuentes:** A-40, A-42 a A-45, B-25. ⚠ A-40 se atribuye al índice S&P 500 (Q-05); A-42 no se muestra hasta tener fuente, período y moneda (Q-06). **Estado:** validado + ampliación.

### Módulo 15 · CEDEARs
- **Objetivo:** calcular el precio teórico en pesos de un CEDEAR e identificar sus dos fuentes de variación (acción y tipo de cambio).
- **Evidencia:** ejercicio con SIM-11 (F-20); misiones "Tu primer CEDEAR de ETF" y "Aguanta la caída".
- **Guía de fase A:** "De la acción a tu pantalla": qué es un CEDEAR (B-30), ratio (B-31), dividendos en dólares (B-32), CEDEARs de ETF (B-33), operatoria y plazos (B-34), precio teórico (B-36); precios fechados al 14/09/2026 como ejemplo (A-46).
- **Fuentes:** A-46, B-30 a B-36. ⚠ Horario de BYMA (Q-04) no se menciona hasta confirmarlo. **Estado:** ampliación.

**Desafío del nivel 7:** bancos de los módulos 12 a 15, más el test de perfil de inversor (educativo, sin cartera recomendada, spec 1.2).

---

## Fase B

- **Módulo 16 · Criptomonedas** (nivel 8): A-48 a A-51, B-18, B-27. El 90/10 como ejemplo de cómo se piensa la asignación, nunca como recomendación.
- **Guías 2 y 3** de cada módulo (D-61).
- **Módulo 18 completo** y escape room (F11, F18).
