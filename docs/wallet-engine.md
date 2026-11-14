# Motor económico de la billetera

> Fecha: 12/11/2026 · Segunda tanda del paso 0 (spec 14.13). Define las reglas de la economía simulada de la billetera Alcancía (SIM-13): tiempo, cobro del sueldo, débitos, inflación sobre precios, rendimientos, "meses de gastos", deudas y eventos. Es la especificación de `src/features/wallet/engine/` y de `walletStore`. Las fórmulas están en `formulas.md`.

## 1. Principios

1. **Determinista:** el mismo estado inicial y las mismas acciones dan siempre el mismo resultado. No hay azar; las "variaciones" (por ejemplo, el rendimiento diario del fondo money market) salen de series fijas en `scenarios.json`. Así los tests son reproducibles y la demo se ve igual para cualquier visitante.
2. **Solo dinero ficticio y local:** todo vive en `walletStore`, en el navegador, en un espacio separado por persona (spec 7). Ningún dato del motor llega a otro rol (D-58, D-62).
3. **Errores con red y con huella (D-77, D-208):** el motor permite decisiones malas (aceptar un préstamo caro, transferir al alias equivocado, responder un mensaje falso) y su consecuencia **queda en la billetera de la persona**: saldo, movimientos, deudas, apartados y desbloqueos. Cada consecuencia se revierte con una acción de la simulación (pagar, cancelar, reportar), nunca con "deshacer". El motor nunca deja la cuenta en un estado del que no se pueda salir, y "Empezar de cero" siempre está disponible.
4. **Simple de explicar:** cada regla se puede contar en una frase en "¿Por qué importa?". Lo que se simplifica se dice en los supuestos.

## 2. Tiempo

| Regla | Valor |
| --- | --- |
| Unidad | Día simulado (`WalletState.day`, entero desde 0) |
| Mes simulado | 30 días. El mes `k` va del día `30k + 1` al `30(k + 1)` |
| Fecha que se muestra | `DEMO_TODAY` (16/11/2026, D-60) + días simulados, en formato `DD/MM/AAAA` |
| Día 0 | Apertura de la cuenta (fin del nivel 0) |
| Día 1 | Primer cobro de sueldo (misión 1) |
| Avanzar | "Avanzar un día", "Avanzar una semana" (7 días) y "Avanzar un mes" (hasta el último día del mes simulado en curso) |
| Disponible desde | Nivel 1, después de la misión 1 |

**Procesamiento:** "Avanzar" procesa día por día, en este orden (D-158): (1) rendimiento del día; (2) nuevo mes: precios y cobro del sueldo, a primera hora; (3) débitos programados del día; (4) eventos del escenario y de la misión activa; (5) cierre de mes si es el último día. **Se detiene** en el primer evento que pide una decisión (vencimiento de la tarjeta, una oferta, un mensaje, un débito que no se pudo cobrar) y muestra lo procesado hasta ahí. El resumen del período se anuncia en una región en vivo (spec 2.10).

## 3. Ingresos

| Ingreso | Regla |
| --- | --- |
| Sueldo | Neto de **$ 1.284.958,86** (D-54), de Andina Servicios S.A., el día 1 de cada mes simulado |
| Actualización del sueldo (D-111, aprobada) | Cada 3 meses simulados, el sueldo sube por la inflación acumulada del trimestre en el escenario (`(1 + π_m)^3 − 1`), como un acuerdo salarial de ejemplo. No se puede desactivar en fase A. Sin esta regla, con inflación del 3 % mensual el presupuesto se pondría en rojo en pocos meses solo por el paso del tiempo |
| Aguinaldo | No se simula en fase A (solo aparece como opción prorrateada en SIM-1, Q-12) |
| Transferencias recibidas | Solo las que generan las misiones (por ejemplo, un compañero que devuelve un préstamo de práctica) |

## 4. Gastos de la simulación

Perfil de gastos ficticio, igual para Mariana y Diego (las diferencias entre ellos están en el estado de demo, no en la economía). Montos del mes 1, a precios del día 0:

| Gasto | Tipo | Categoría sugerida (50/30/20) | Monto | Cómo se paga |
| --- | --- | --- | --- | --- |
| Alquiler | Fijo | Necesidades | $ 380.000 | Transferencia a un alias ficticio, día 5 |
| Supermercado | Variable | Necesidades | $ 190.000 | Cuatro pagos con QR, días 3, 10, 17 y 24 |
| Luz | Fijo | Necesidades | $ 26.000 | Servicio, día 12 |
| Gas | Fijo | Necesidades | $ 16.000 | Servicio, día 12 |
| Celular | Fijo | Necesidades | $ 18.000 | Servicio, día 15 |
| Transporte | Variable | Necesidades | $ 20.000 | Pagos con QR, días 2 y 16 |
| Salidas | Variable | Deseos | $ 120.000 | Pagos con QR, cuatro fines de semana |
| Ropa | Variable | Deseos | $ 60.000 | Un pago con QR, día 20 |
| Streaming | Fijo | Deseos | $ 6.500 | Débito programado, día 8 |
| Suscripción sorpresa | Fijo | Deseos | $ 4.990 | Débito sin aviso desde la misión 1 (D-55), día 1 de cada mes hasta que se cancele |

- **Necesidades:** $ 650.000 (50,6 % del neto). **Deseos:** $ 191.490 (14,9 %). Queda margen para ahorrar el 20 % y cerrar el mes en verde.
- **Quién paga qué:** en los niveles 1 y 2, los gastos variables y fijos se registran solos como movimientos del día (para que la cuenta "tenga vida"); en el nivel 2 en adelante, la persona puede pagarlos ella misma desde Pagar, y las misiones 2, 3 y 7 lo piden.
- **Saldo insuficiente:** si un débito no se puede cobrar, queda **pendiente** y se detiene el avance. Nunca hay saldo negativo. En cuanto el saldo lo cubre (por ejemplo, después de pasar dinero desde un apartado), el siguiente avance cobra el débito pendiente, los demás débitos de ese día y el cierre de mes si era el día 30, y el tiempo sigue (D-178). Una cuota de préstamo o de compra en cuotas también puede quedar pendiente: el aviso la nombra por su prestamista o comercio.

## 5. Inflación sobre precios

- Escenario por defecto: **medio, 3 % mensual** (`scenarios.json`); la persona puede cambiarlo en Perfil.
- **Índice de precios** del día `d`: `(1 + π_m)^(d / 30)` (F-26). El "poder de compra" que se muestra al lado del saldo es `saldo ÷ índice` (spec 5.3).
- **Precios de los gastos:** al empezar cada mes simulado, los montos de la tabla 4 se multiplican por `(1 + π_m)` y se redondean a centavos. Excepciones: el alquiler se actualiza cada 3 meses por la inflación acumulada (como un contrato con ajuste trimestral de ejemplo); la suscripción sorpresa no cambia.
- **Eventos de suba:** la misión 7 agrega una suba puntual de un servicio (por ejemplo, +15 % en la luz) además de la inflación.

## 6. Rendimientos

| Modo (`yieldMode`) | Disponible desde | Regla |
| --- | --- | --- |
| `none` | Siempre | Sin rendimiento |
| `remunerated` (cuenta remunerada de práctica) | Nivel 6 | Cada día: `saldo × TNA / 365`, redondeado a centavos y acreditado como movimiento `yield`. TNA de ejemplo del escenario (30 % en el medio) |
| `money_market` (fondo de práctica) | Nivel 6 | Igual que la cuenta, con la TNA de ejemplo del escenario (31 % en el medio) multiplicada por un factor diario de una serie fija de 30 valores entre 0,95 y 1,05, con promedio 1 (`money-market-series.json`), para mostrar que el rendimiento varía a diario y no está garantizado (B-14, B-26). El rescate se acredita el mismo día |

- El rendimiento se calcula sobre el **saldo disponible y los apartados** (los apartados son parte de la misma cuenta). Se dice en "¿Por qué importa?".
- La ficha de cada opción dice qué protección tiene: la cuenta de pago no tiene la garantía de los depósitos (B-12); el fondo es una inversión en un FCI, tampoco la tiene (B-14). En la práctica no hay cuenta bancaria con CBU: se explica con la ficha del Anexo D.
- **Plazo fijo y plazo fijo UVA de práctica (nivel 6):** se constituyen desde Rendir con un monto que sale del saldo; se acreditan al vencimiento con las fórmulas de F-08 y F-09. No admiten precancelación en fase A (supuesto visible). Plazos de la práctica: 30, 60 o 90 días el tradicional y 90 o 180 días el UVA (supuestos: los reales dependen de cada banco, B-02, B-03). Al constituirlo sale como movimiento `term_deposit` y cuenta como dinero separado en el presupuesto (como un apartado); al vencimiento vuelve el capital (`term_deposit`) y los intereses o el ajuste UVA se acreditan como rendimiento (`yield`). No cuenta para los meses del fondo de emergencia, que es un apartado.

## 7. Apartados y "meses de gastos"

- **Apartado "Ahorro"** (nivel 1, D-53): único, sin meta. Se crea en la misión 1. En el nivel 4 puede convertirse en un apartado con meta.
- **Apartados con meta** (nivel 4): nombre, monto objetivo ajustado por inflación (SIM-8) y fecha estimada. Uno de ellos puede marcarse como **fondo de emergencia** (solo uno). La **fecha estimada** usa el ritmo real: lo separado neto en el apartado dividido por los meses desde el primer aporte (`averageMonthlyContribution`, `monthsToGoal`, D-175). La meta guarda su plan (precio de hoy y plazo) para mostrar el ajuste.
- **Gastos esenciales mensuales** (`essentialMonthlyExpenses`): suma de los movimientos categorizados como **Necesidades** en el último mes cerrado. Si todavía no hay un mes cerrado, se usa la suma de necesidades del perfil a precios del día (tabla 4).
- **`emergency_months`** = saldo del apartado marcado como fondo de emergencia ÷ gastos esenciales mensuales, con un decimal, hacia abajo. Con el perfil del mes 1: 3 meses = **$ 1.950.000**.
- Estado de demo de Mariana: fondo de **2 de 3 meses** (spec 7). **Pendiente para el paso 6 (INC-08):** "2 de 3 meses" se calcula con los gastos esenciales del último mes cerrado, ajustados por inflación, no con los del mes 1. En el día 154 (mes 5 de la simulación) el último mes cerrado es el 4: alquiler $ 415.236,26 (ajuste trimestral) y el resto de las necesidades $ 303.887,38, en total **$ 719.123,64 por mes**. Para que el fondo marque 2 de 3 meses, el motor tiene que generar un apartado de al menos **$ 1.438.247,28** (y menos de $ 2.157.370,92). Los $ 1.300.000 del piloto equivalen a 2 meses a precios del mes 1 y a 1,8 meses en el día 154. **Resuelto en el paso 6:** el guion de Mariana (`engine/demo.ts`) separa cada mes el 25 % del sueldo en el fondo y el 5 % en una meta; en el día 154 el fondo tiene $ 1.695.561,37 (2,3 meses) y los gastos esenciales del mes 4 dan exactamente $ 719.123,64.

## 8. Presupuesto y cierre de mes

- **Movimiento categorizado:** un movimiento al que la persona le asignó una categoría (Necesidades, Deseos o Ahorro). Desde el nivel 1 se puede categorizar desde el detalle de cada movimiento en Inicio, porque la condición del nivel 3 ("10 movimientos categorizados") se cumple **antes** de tener Presupuesto. Los movimientos que el motor registra solos llegan con una **categoría sugerida** que la persona confirma o cambia; solo cuentan los confirmados (`categorized_movements`).
- **Cierre de mes:** el último día del mes simulado se genera el **resumen del mes** (ingresos, gastos por categoría, ahorro, rendimiento, poder de compra) y se guarda en Comprobantes y resumen.
- **Mes en verde** (`months_closed_green`): (1) los gastos del mes no superan los ingresos del mes, (2) lo separado en apartados durante el mes es al menos el 10 % de los ingresos (el mínimo de la regla 70/20/10, A-33) y (3) no se sacó dinero del apartado "Ahorro" ni del fondo de emergencia para gastos que no son emergencias. La misión 7 usa estos tres criterios (spec 5.3, D-53). **Qué cuenta como gasto (D-174):** los débitos programados y también los pagos que la persona hace en Pagar (transferencias y QR). Un pago sin categoría cuenta como deseo hasta que la persona lo categoriza. `monthBreakdown` calcula el reparto del mes cerrado o en curso, que muestra Presupuesto (P4).

## 9. Deudas de la simulación

**Origen (propuesta, D-112):** al habilitarse el nivel 5 (Tarjeta y préstamos), la cuenta recibe una **tarjeta de crédito de práctica** ("Tarjeta Alcancía de práctica", límite de ejemplo $ 1.500.000) con un **resumen ya emitido**: $ 240.000 de consumos del mes anterior, vencimiento el día 10 del mes siguiente, pago mínimo 10 %, TNA y CFT de ejemplo del escenario. Fuerte lo presenta: "Esta tarjeta trae un resumen del mes pasado. Veamos cuánto cuesta cada forma de pagarlo".

| Situación | Qué pasa |
| --- | --- |
| Paga el total al vencimiento | No hay deuda; logro "Pagaste el total" |
| Paga el mínimo o un parcial | El resto pasa a **saldo financiado** con interés diario a la TNA de financiación; aparece en el próximo resumen |
| Acepta el préstamo preaprobado (misión 5) | Se acredita el capital; se agenda la cuota mensual con el sistema francés de ejemplo; el CFT se muestra en la oferta (B-04) |
| Compra en cuotas (oferta) | Se agenda cada cuota; si es "sin interés", no es deuda de tasa alta |
| Misión "Sal de tus deudas" | Con lo que haya (saldo financiado y préstamo, si se aceptó; si no hay ninguna deuda, la misión usa un caso de un compañero ficticio con los datos de A-29), elige bola de nieve o avalancha con SIM-9 y aplica el plan |

**`high_rate_debt`** (condición del nivel 7): cantidad de deudas activas con **TEA mayor que la inflación anual del escenario** (`(1 + π_m)^12 − 1`), es decir, deudas que te cuestan más que lo que suben los precios. Con el escenario medio, la tarjeta (TNA 60 %, TEA ≈ 79,6 %) y el préstamo (TNA 55 %) son de tasa alta; unas cuotas sin interés, no. El nivel 7 pide `high_rate_debt == 0`. El estado de demo de Mariana no tiene deudas (spec 7).

## 10. Eventos

| Evento | Cuándo | Para qué |
| --- | --- | --- |
| Suscripción sorpresa de $ 4.990 | Misión 1 (D-55) | Gastos hormiga y débitos programados |
| Alias con error de tipeo | Misión 2 | Revisar titular antes de confirmar (B-15) |
| Pago en un comercio ficticio | Misión 3 | QR interoperable y comprobante |
| Tres mensajes, uno falso | Misión 6 (llegan a la campana, D-102) | Señales de estafa (B-24) |
| Un mensaje por mes en la campana (D-211) | Día 15 de cada mes simulado desde el segundo: los meses impares, uno sospechoso (falso soporte que pide un código, enlace parecido o "inversión garantizada", rotando); los pares, un aviso legítimo de la app | Practicar en el modo libre lo de la misión 6: la tarjeta "Ojo con este mensaje" (D-76) y el hábito de reportar. Reportar un aviso legítimo explica por qué no lo era; un reporte no se deshace. Reglas de D-211: remitentes, marcas y dominios inventados (`.example` o `.demo`); ningún enlace sale de la app ("Abrir el enlace" y las demás acciones son simuladas); al reportar o al caer, la devolución muestra las señales del mensaje |
| Suba de un servicio y gasto imprevisto ($ 85.000, una reparación) | Misión 7 | Cerrar el mes en verde con imprevistos |
| Oferta de préstamo preaprobado y de compra en cuotas | Nivel 5 (misión 5) | CFT frente a TNA (B-04) |
| Resumen de la tarjeta de práctica | Al habilitarse el nivel 5 | Pago mínimo frente a total (SIM-7) |
| Caída en la serie de precios | Misión "Aguanta la caída" (nivel 7) | No vender en pánico (5.4) |

Todos los nombres de comercios, titulares, entidades y alias son ficticios ("Almacén Don Ramiro", "Bróker de Ejemplo S.A."), y ninguno imita una marca real (spec 1.1.1).

## 11. Datos que nunca se piden

DNI, CUIT, CBU o CVU reales, tarjetas, contraseñas, teléfonos ni correos personales (spec 5.3). El CVU se muestra como `0000000 0000000 EJEMPLO 00` y el alias como `alcancia.practica.<persona>`.

## 12. Estado y reinicio

- `walletStore` guarda `WalletState` (spec 7) más: perfil de gastos vigente, apartados, deudas, plazos fijos, resúmenes de mes, mensajes y la serie del fondo.
- **Empezar de cero:** con confirmación ("Empezar de cero borra tus movimientos, apartados y misiones de práctica"), vuelve al día 0 sin tocar el avance de aprendizaje.
- **Estados de demo:** "Diego en el nivel 2" y "Mariana en el nivel 6" cargan estados completos y coherentes con estas reglas (días simulados, movimientos, apartados y resúmenes ya generados por el motor, no escritos a mano).

## 13. Lo que el motor expone al motor de niveles

Solo estas métricas, calculadas en el navegador de la persona y consumidas por el motor de niveles (`features/levels`), nunca por vistas de otros roles (D-58):

| Métrica | Definición |
| --- | --- |
| `categorized_movements` | Movimientos con categoría confirmada por la persona (sección 8) |
| `months_closed_green` | Meses cerrados en verde (sección 8) |
| `emergency_months` | Sección 7 |
| `high_rate_debt` | Sección 9 |

## 14. Decisiones de este documento

| ID | Qué | Dónde | Estado |
| --- | --- | --- | --- |
| D-110 | Tasas de ejemplo de cada escenario (escenario bajo ajustado: plazo fijo 22 %, fondo 20 %) | `formulas.md`, sección 0 | Aprobada por Lourdes; pendiente de Kevin |
| D-111 | Actualización trimestral del sueldo y del alquiler por la inflación del escenario, sin interruptor en fase A | Secciones 3 y 5 | Aprobada |
| D-112 | La tarjeta de práctica llega con un resumen emitido al habilitarse el nivel 5, y el caso de A-29 como respaldo de "Sal de tus deudas" | Sección 9 | Aprobada |
| D-113 | "Deuda de tasa alta" = TEA mayor que la inflación anual del escenario | Sección 9 | Aprobada, provisoria hasta que la confirme Kevin |
| D-114 | Categorizar desde Inicio en los niveles 1 y 2, con categorías sugeridas que se confirman | Sección 8 | Aprobada |
| D-115 | Definición de "mes en verde" | Sección 8 | Aprobada |
| D-208 | Todas las misiones se juegan en la billetera de la persona; excepciones solo si rompen algo; repetir usa una copia de práctica | Sección 16 | Aprobada por Lourdes (14/11/2026) |
| D-211 | Bandeja de mensajes de la campana con un mensaje por mes (`WalletState.messages`), con las reglas de remitentes inventados, sin enlaces externos y con devolución | Sección 10 | Aprobada por Lourdes (14/11/2026) |
## 15. Implementación (paso 6)

- Código en `src/features/wallet/engine/`: `types.ts` (estado), `profile.ts` (tabla 4), `engine.ts` (tiempo, precios, sueldo, débitos, rendimiento, apartados, categorías, cierre de mes y métricas) y `demo.ts` (guiones de Diego y Mariana). Tests en `engine.test.ts`, con casos calculados a mano.
- **Estados de demo generados por el motor:**
  - **Diego, día 12:** un sueldo, apartado "Ahorro" con el 20 % ($ 256.991,77), suscripción sorpresa activa (todavía no la canceló), 4 movimientos categorizados de 10, saldo $ 459.477,09.
  - **Mariana, día 154:** cinco meses cerrados en verde, 83 movimientos categorizados, suscripción cancelada en la misión 1, "Ahorro" $ 256.991,77, fondo de emergencia $ 1.695.561,37 (2,3 meses), meta "Vacaciones de invierno" $ 339.112,26 de $ 2.138.641, cuenta remunerada desde el día 125, saldo $ 1.372.112,09.
- **Crédito (paso 8.3, D-178):** `openPracticeCard`, `payCard`, `loanOffer`, `acceptLoan`, `buyInInstallments`, `buyInCash`, `payOffPlan` y `activeDebts`, con tests en `credit.test.ts`. Reglas:
  - **Tarjeta:** llega la primera vez que la persona entra a Tarjeta y préstamos con el nivel 5 abierto. Resumen de $ 240.000, mínimo 10 % ($ 24.000), vencimiento el primer día 10 del mes simulado después de hoy, TNA de tarjeta del escenario. Se puede pagar el total, el mínimo u otro monto hasta lo que falta. Cuando pasa el vencimiento: si se pagó todo, la tarjeta queda sin saldo (cuenta para el logro "Pagaste el total"); si no, lo que falta se financia por 30 días a `TNA × 30 / 365` (F-31) y forma el resumen siguiente, con su nuevo mínimo y vencimiento 30 días después. Si se pagó menos que el mínimo, el resumen siguiente lo avisa (en una tarjeta real hay punitorios y queda en la Central de Deudores, B-06); la simulación no cobra punitorios (simplificación).
  - **Préstamo preaprobado:** $ 600.000 en 24 cuotas, sistema francés con `i = TNA / 12` (F-29), TNA de préstamo personal del escenario y comisión de otorgamiento del 5 % que se descuenta al acreditar. El CFT se calcula como tasa interna sobre lo que de verdad se recibe (F-30): en el escenario medio, cuota $ 41.737,16, total $ 1.001.691,84, se reciben $ 570.000 y el CFT es 81,8 % (TEA 71,2 %). Lo acreditado no es ingreso del mes; cada cuota es gasto (necesidad). Un solo préstamo activo por vez.
  - **Compra en cuotas:** auriculares de $ 120.000 en 12 cuotas sin interés de $ 10.000 o $ 102.000 de contado (F-10). Las cuotas se debitan el mismo día del mes de la compra, desde el mes siguiente, como deseo.
  - **Cancelar antes:** un préstamo o una compra en cuotas se puede cancelar con el capital que falta (valor actual de las cuotas restantes a la tasa del plan), sin los intereses futuros.
  - **Deudas activas y `high_rate_debt`:** cuentan el resumen financiado de la tarjeta y los planes con cuotas por pagar. Es de tasa alta si su TEA supera la inflación anual del escenario (D-113); un resumen todavía no vencido no es deuda, y las cuotas sin interés no son de tasa alta.
- **Rendir (paso 8.4, D-180):** `tnaOf` con el factor diario del fondo, `depositQuote`, `makeDeposit`, `activeDeposits` y `yieldOfMonth`, con tests en `yield.test.ts`. El estado de demo de Mariana no cambia: usa la cuenta remunerada desde el día 125.

## 16. Las misiones se juegan en tu billetera (D-77, D-208)

> Agregada el 14/11/2026 (paso 15). Reemplaza la regla de D-179 ("El préstamo tentador" en una cuenta de práctica aparte). Cómo entra y cómo se revierte cada consecuencia, con sus casos calculados a mano, se define en el paso 18, antes de tocar el motor.

**Regla:** todas las misiones se juegan en la billetera de la persona, porque lo que hace tiene que quedar registrado: saldo, movimientos, deudas, apartados y desbloqueos. Una misión solo se juega aparte si jugarla en la billetera **rompe algo**:

1. el **estado de demo** de Mariana o de Diego (spec 7);
2. una **mecánica que necesita un escenario fijo** para que la evidencia sea verificable;
3. un **riesgo de que la persona quede sin poder avanzar** (por ejemplo, sin saldo y sin forma de conseguirlo dentro de la simulación).

Cada excepción se justifica en la tabla de abajo y la interfaz dice que esa misión es una práctica aparte.

| Misión | Hoy | Decisión | Por qué |
| --- | --- | --- | --- |
| Configura tu seguridad (nivel 0) | Billetera propia | Billetera propia | Ya cumple la regla |
| 1 · Tu primer cobro | Cuenta nueva (`fresh`) | Billetera propia | Es el primer cobro de la persona; la suscripción sorpresa de $ 4.990 (D-55) queda como débito real y se cancela desde Servicios |
| 2 · Transfiere sin errores | Cuenta aparte (`salary`) | Billetera propia | Si confirma el alias equivocado, sale de verdad un **monto chico** ($ 12.000, menos del 1 % del sueldo de práctica), para que nadie quede sin saldo para seguir. La devolución explica que una transferencia inmediata no se deshace desde la app (B-15) y qué hacer en la vida real: contactar a quien la recibió y hacer el reclamo en la billetera, **sin prometer que el dinero se recupera** |
| 3 · Paga con QR | Cuenta aparte | Billetera propia | El pago del comedor ($ 3.500) queda en movimientos y se puede categorizar |
| 6 · El mensaje falso | Cuenta aparte | Billetera propia (D-77) | Compartir el código descuenta el monto; reportarlo lo evita |
| 7 · Mes completo | Cuenta aparte | Billetera propia (D-77) | La suba del servicio y el imprevisto de $ 85.000 entran en el mes real de la persona |
| Crea tu fondo de emergencia | Cuenta aparte | Billetera propia | El fondo cuenta para `emergency_months` y para desbloquear Rendir e Invertir; si el saldo no alcanza para una opción, la opción lo dice y propone avanzar hasta el próximo cobro (evita el bloqueo del criterio 3) |
| 5 · El préstamo tentador | Cuenta aparte | Billetera propia (D-77) | El préstamo tomado queda en Tus deudas, sus cuotas se debitan y bloquea Invertir hasta saldarlo |
| Sal de tus deudas | Cuenta aparte | Billetera propia (D-77) | Aplica el plan a las deudas propias; si no hay ninguna, sigue usando el caso de A-29 de un compañero ficticio (la parte vigente de D-179) |
| 4 · ¿Cuenta o fondo? | Cuenta aparte | Billetera propia | Elegir dónde rinde el saldo y avanzar 30 días mueve el tiempo real de la persona (cobro, débitos, rendimiento, inflación) |
| Abre tu cuenta comitente | Cuenta aparte | Billetera propia | La cuenta comitente queda abierta en Invertir, con el resultado del test de perfil de la persona (D-67) en lugar del perfil de ejemplo |
| Tu primer CEDEAR de ETF | Cuenta aparte | Billetera propia | La tenencia queda en Invertir; si la cuenta ya está abierta, se salta ese paso; el monto a transferir se ajusta al costo de los 4 CEDEARs en lugar de fijarse en $ 300.000 |
| Aguanta la caída | Cuenta aparte | Billetera propia (D-77) | Vender en la caída realiza la pérdida en la tenencia propia; mantener la deja recuperarse con la serie sintética |

**Repetir una misión ya completada (aprobado por Lourdes el 14/11/2026):** la primera vez se juega en la billetera propia. **"Repetir para practicar"** usa una copia de la billetera rotulada como práctica, sin consecuencias, con el rótulo visible durante toda la misión, porque aplicarla de nuevo duplicaría sus efectos (un segundo "primer cobro", otro fondo, otra transferencia) y rompería el estado de la billetera (criterio 1). Los estados de demo de Mariana y Diego ya traen sus misiones completadas, así que esta regla también los protege.

**Clasificación aprobada por Lourdes el 14/11/2026:** las 13 misiones se juegan en la billetera propia. La única excepción es el caso de A-29 en "Sal de tus deudas" cuando la persona no tiene deudas.

## 17. Cómo entra y cómo se revierte cada consecuencia (D-77, paso 18)

> Definido el 14/11/2026, antes de tocar el motor. Los casos con números están en `formulas.md` (F-35 a F-37) y tienen tests.

**Cómo se juega una misión en la billetera propia.** La primera vez, la misión trabaja sobre la billetera de la persona: cada paso que mueve dinero se guarda en el momento, igual que si lo hiciera desde Pagar o Rendir, y dispara las mismas tarjetas de aprendizaje (salvo durante la misión, que tiene las suyas). Si la persona sale y vuelve, la misión retoma con la billetera actualizada. **Una decisión tomada no se cambia** dentro de la misión: se revierte con una acción de la simulación, y la devolución dice cuál. "Repetir para practicar" usa una copia rotulada como práctica, que nunca se guarda.

**Si el saldo no alcanza** para un paso, el paso no avanza y la devolución lo dice, con la salida: avanzar hasta el próximo cobro o pasar dinero desde un apartado (criterio 3 de la sección 16).

| Misión | Qué deja en la billetera | Cómo se revierte en la simulación |
| --- | --- | --- |
| Configura tu seguridad | Segundo factor y límite diario | Desde Perfil, cuando quieras |
| 1 · Tu primer cobro | El sueldo, el 20 % en "Ahorro" y la suscripción sorpresa de $ 4.990 (D-55) | Dar de baja la suscripción en Servicios; retirar del apartado |
| 2 · Transfiere sin errores | Si confirma el alias equivocado: $ 12.000 al titular equivocado (D-208) | No se deshace (B-15): la devolución explica contactar a quien lo recibió y reclamar en la billetera, sin prometer que vuelve |
| 3 · Paga con QR | El pago de $ 3.500 en el comedor | No se revierte: es un gasto real del mes |
| 6 · El mensaje falso | Si comparte el código: la pérdida de F-37 y un segundo intento programado | Reportar el mensaje evita el segundo intento; lo perdido no vuelve |
| 7 · Mes completo | La suba del celular, el imprevisto de $ 85.000, el ahorro del mes y el cierre del mes en la billetera propia | El mes cerrado queda en el resumen; el siguiente se puede cerrar en verde |
| Crea tu fondo de emergencia | El apartado "Fondo de emergencia" con meta y el primer monto | Retirar del apartado (cuenta como uso fuera de emergencia en el resumen del mes) |
| 5 · El préstamo tentador | Si acepta: $ 570.000 netos, la deuda en Tus deudas, la cuota de $ 41.737,16 cada mes e Invertir bloqueado (F-35) | Saldarlo en Tarjeta y préstamos > Tus deudas ("Cancelar ahora", el capital que falta); con la deuda saldada, Invertir vuelve a depender solo del fondo y del desafío |
| Sal de tus deudas | Con deudas propias: el método elegido se aplica saldando la deuda prioritaria (la de mayor tasa en la avalancha, la de menor saldo en la bola de nieve) si el saldo alcanza. Sin deudas: el caso de A-29 de Tomás, sin cambios en la billetera | Es la reversión misma de las deudas |
| 4 · ¿Cuenta o fondo? | Dónde rinde el saldo y 30 días de la billetera (cobro, débitos, rendimiento, inflación) | Cambiar dónde rinde en Rendir; el tiempo no vuelve atrás |
| Abre tu cuenta comitente | La cuenta comitente con el perfil del test de la persona (D-67) y el primer fondeo | Rescatar el efectivo de la cuenta a la billetera |
| Tu primer CEDEAR de ETF | La compra de 4 CEDEARs (F-33) con lo necesario transferido, en la tenencia propia | Venderlos en Invertir |
| Aguanta la caída | Ver la nota de abajo | |
| **Modo libre: caer en un mensaje de la campana** | La pérdida de F-37 | Reportar antes del día siguiente evita el segundo intento |
| **Modo libre: pagar el mínimo** | El resto se financia al vencer (F-36) y es deuda de tasa alta | Pagar el total del resumen siguiente |

**Nota sobre "Aguanta la caída" (pregunta abierta para Lourdes):** la misión avanza 4 meses y después 10 (420 días) y su caída depende de los primeros 150 días de la serie sintética de precios. Jugada en la billetera propia, adelantaría más de un año la vida de la persona (14 cobros y todos sus débitos) y, en el día en que esté, la serie podría no caer. Mientras Lourdes decide, sigue como práctica aparte (rotulada) y es la única misión con esa excepción, por el criterio 2 de la sección 16.
