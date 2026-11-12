# Motor económico de la billetera

> Fecha: 12/11/2026 · Segunda tanda del paso 0 (spec 14.13). Define las reglas de la economía simulada de la billetera Alcancía (SIM-13): tiempo, cobro del sueldo, débitos, inflación sobre precios, rendimientos, "meses de gastos", deudas y eventos. Es la especificación de `src/features/wallet/engine/` y de `walletStore`. Las fórmulas están en `formulas.md`.

## 1. Principios

1. **Determinista:** el mismo estado inicial y las mismas acciones dan siempre el mismo resultado. No hay azar; las "variaciones" (por ejemplo, el rendimiento diario del fondo money market) salen de series fijas en `scenarios.json`. Así los tests son reproducibles y la demo se ve igual para cualquier visitante.
2. **Solo dinero ficticio y local:** todo vive en `walletStore`, en el navegador, en un espacio separado por persona (spec 7). Ningún dato del motor llega a otro rol (D-58, D-62).
3. **Errores con red:** el motor permite decisiones malas (aceptar un préstamo caro, transferir al alias equivocado) y registra su consecuencia; nunca deja la cuenta en un estado del que no se pueda salir, y "Empezar de cero" siempre está disponible.
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
- **Saldo insuficiente:** si un débito no se puede cobrar, queda **pendiente**, se detiene el avance y Fuerte ofrece opciones (pasar dinero de un apartado, pagar con la tarjeta si existe, posponer). Nunca hay saldo negativo.

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
| `money_market` (fondo de práctica) | Nivel 6 | Igual que la cuenta, con la TNA de ejemplo del escenario (31 % en el medio) multiplicada por un factor diario de una serie fija entre 0,95 y 1,05 (`scenarios.json`), para mostrar que el rendimiento varía a diario y no está garantizado (B-14, B-26). El rescate se acredita el mismo día |

- El rendimiento se calcula sobre el **saldo disponible y los apartados** (los apartados son parte de la misma cuenta). Se dice en "¿Por qué importa?".
- La ficha de cada opción dice qué protección tiene: la cuenta de pago no tiene la garantía de los depósitos (B-12); el fondo es una inversión en un FCI, tampoco la tiene (B-14). En la práctica no hay cuenta bancaria con CBU: se explica con la ficha del Anexo D.
- **Plazo fijo y plazo fijo UVA de práctica (nivel 6):** se constituyen desde Rendir con un monto que sale del saldo; se acreditan al vencimiento con las fórmulas de F-08 y F-09. No admiten precancelación en fase A (supuesto visible).

## 7. Apartados y "meses de gastos"

- **Apartado "Ahorro"** (nivel 1, D-53): único, sin meta. Se crea en la misión 1. En el nivel 4 puede convertirse en un apartado con meta.
- **Apartados con meta** (nivel 4): nombre, monto objetivo ajustado por inflación (SIM-8) y fecha estimada. Uno de ellos puede marcarse como **fondo de emergencia** (solo uno).
- **Gastos esenciales mensuales** (`essentialMonthlyExpenses`): suma de los movimientos categorizados como **Necesidades** en el último mes cerrado. Si todavía no hay un mes cerrado, se usa la suma de necesidades del perfil a precios del día (tabla 4).
- **`emergency_months`** = saldo del apartado marcado como fondo de emergencia ÷ gastos esenciales mensuales, con un decimal, hacia abajo. Con el perfil del mes 1: 3 meses = **$ 1.950.000**.
- Estado de demo de Mariana: fondo de **2 de 3 meses** (spec 7). **Pendiente para el paso 6 (INC-08):** "2 de 3 meses" se calcula con los gastos esenciales del último mes cerrado, ajustados por inflación, no con los del mes 1. En el día 154 (mes 5 de la simulación) el último mes cerrado es el 4: alquiler $ 415.236,26 (ajuste trimestral) y el resto de las necesidades $ 303.887,38, en total **$ 719.123,64 por mes**. Para que el fondo marque 2 de 3 meses, el motor tiene que generar un apartado de al menos **$ 1.438.247,28** (y menos de $ 2.157.370,92). Los $ 1.300.000 del piloto equivalen a 2 meses a precios del mes 1 y a 1,8 meses en el día 154. **Resuelto en el paso 6:** el guion de Mariana (`engine/demo.ts`) separa cada mes el 25 % del sueldo en el fondo y el 5 % en una meta; en el día 154 el fondo tiene $ 1.695.561,37 (2,3 meses) y los gastos esenciales del mes 4 dan exactamente $ 719.123,64.

## 8. Presupuesto y cierre de mes

- **Movimiento categorizado:** un movimiento al que la persona le asignó una categoría (Necesidades, Deseos o Ahorro). Desde el nivel 1 se puede categorizar desde el detalle de cada movimiento en Inicio, porque la condición del nivel 3 ("10 movimientos categorizados") se cumple **antes** de tener Presupuesto. Los movimientos que el motor registra solos llegan con una **categoría sugerida** que la persona confirma o cambia; solo cuentan los confirmados (`categorized_movements`).
- **Cierre de mes:** el último día del mes simulado se genera el **resumen del mes** (ingresos, gastos por categoría, ahorro, rendimiento, poder de compra) y se guarda en Comprobantes y resumen.
- **Mes en verde** (`months_closed_green`): (1) los gastos del mes no superan los ingresos del mes, (2) lo separado en apartados durante el mes es al menos el 10 % de los ingresos (el mínimo de la regla 70/20/10, A-33) y (3) no se sacó dinero del apartado "Ahorro" ni del fondo de emergencia para gastos que no son emergencias. La misión 7 usa estos tres criterios (spec 5.3, D-53).

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
## 15. Implementación (paso 6)

- Código en `src/features/wallet/engine/`: `types.ts` (estado), `profile.ts` (tabla 4), `engine.ts` (tiempo, precios, sueldo, débitos, rendimiento, apartados, categorías, cierre de mes y métricas) y `demo.ts` (guiones de Diego y Mariana). Tests en `engine.test.ts`, con casos calculados a mano.
- **Estados de demo generados por el motor:**
  - **Diego, día 12:** un sueldo, apartado "Ahorro" con el 20 % ($ 256.991,77), suscripción sorpresa activa (todavía no la canceló), 4 movimientos categorizados de 10, saldo $ 459.477,09.
  - **Mariana, día 154:** cinco meses cerrados en verde, 83 movimientos categorizados, suscripción cancelada en la misión 1, "Ahorro" $ 256.991,77, fondo de emergencia $ 1.695.561,37 (2,3 meses), meta "Vacaciones de invierno" $ 339.112,26 de $ 2.138.641, cuenta remunerada desde el día 125, saldo $ 1.372.112,09.
- **Pendiente para los pasos 7 y 8:** la serie diaria del fondo money market (por ahora usa la TNA de ejemplo sin el factor diario), la tarjeta y el préstamo de práctica (sección 9) y los plazos fijos de práctica.
