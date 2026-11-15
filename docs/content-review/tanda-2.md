# Tanda 2 del paso 27: guías para revisar

> Borradores de `src/data/guides-drafts.json`, generados con `node scripts/guides-review.mjs 2`. **No se muestran en la app** hasta que Lourdes los apruebe; las ampliaciones quedan marcadas para el Lic. Kevin Giampieri (D-276).

Cómo revisar: marca en cada guía "Aprobada", "Con cambios" (y cuáles) o "No va". Lo validado viene del taller o de la presentación y no cambia datos; las ampliaciones son lo nuevo.

## Módulo 5 · El orden importa: "Antes de endeudarte" (6 min)

- **Id:** `module-05-guide-2` · **Fuentes:** A-12, A-13, A-22, A-23, B-04, B-06
- **Validado (sin cambiar datos):** La deuda de consumo compromete tu futuro (A-13); Endeudarse por estatus (A-12); Deudas antes que ahorro e inversión (A-22, A-23)
- **Ampliación, pendiente del Lic. Kevin Giampieri:** Las tres preguntas antes de aceptar un crédito: criterio didáctico; CFT informado destacado (B-04); Central de Deudores del BCRA (B-06); Ejemplo y práctica del total pagado, con números redondos
- **Decisión de Lourdes:** ☐ Aprobada · ☐ Con cambios · ☐ No va

**Situación:** Te ofrecen un préstamo preaprobado con una cuota que parece chica. Antes de aceptar, hay tres preguntas que te ahorran muchos problemas.

**Objetivo:** Al terminar vas a poder calcular cuánto pagas de más por un préstamo y decidir si tomarlo con tres preguntas.

**Para empezar**

**La última vez que te ofrecieron un crédito, ¿miraste cuánto ibas a pagar en total?**

- Sí: _Muy bien: ese es el número que importa. En esta guía lo usamos para decidir._
- No, miré la cuota: _Es lo más común: la cuota es lo que se ve. En esta guía vemos por qué conviene mirar el total._

### La deuda de consumo

La deuda de consumo **compromete tu dinero futuro**: lo que compras hoy lo pagas con tus próximos sueldos. Y endeudarse por estatus es comprar lo que no necesitas para impresionar a quien no conoces.

### Tres preguntas antes de aceptar

**¿Para qué es?** Si es un deseo, quizá puede esperar. **¿Cuánto pago en total?** Suma todas las cuotas y mira el **CFT**, que la entidad debe informar destacado. **¿La cuota entra en tu presupuesto** sin tocar tu fondo de emergencia?

### Tu historial también cuenta

En la **Central de Deudores** del BCRA puedes consultar tu situación crediticia: si pagaste a término tus tarjetas y tus créditos. Es lo que mira una entidad antes de prestarte.

### Ejemplo resuelto: lo que cuesta de verdad

1. Te ofrecen $ 300.000 en 12 cuotas de $ 40.000.
2. Total que pagas: 12 × $ 40.000 = $ 480.000.
3. Pagas de más: $ 480.000 − $ 300.000 = $ 180.000.
4. La cuota parece chica, pero el préstamo cuesta un 60 % más de lo que recibes.

**Práctica**

**Te ofrecen $ 200.000 en 10 cuotas de $ 30.000. ¿Cuánto pagas de más en total?**

- Respuesta: 100000 (tolerancia 1.00)
- Correcta: _Correcto. Pagas 10 × $ 30.000 = $ 300.000 por $ 200.000: son $ 100.000 de más._
- Incorrecta: _Suma todas las cuotas y resta lo que recibes: 10 × $ 30.000 = $ 300.000; $ 300.000 − $ 200.000 = $ 100.000 de más._

**Para tu vida:** antes de tu próximo crédito o compra en cuotas, suma todas las cuotas y compáralas con lo que recibes. Y consulta tu situación en la Central de Deudores del BCRA.

---

## Módulo 6 · Tarjeta de crédito: pago mínimo, TNA y CFT: "Leer tu resumen" (7 min)

- **Id:** `module-06-guide-2` · **Fuentes:** T, B-04
- **Validado (sin cambiar datos):** Pago mínimo, financiación y CFT (T, guía 1 del módulo)
- **Ampliación, pendiente del Lic. Kevin Giampieri:** Cierre y vencimiento; pagar el total antes del vencimiento evita intereses; TNA, TEA y CFT con el CFT destacado (B-04); Interés de un período: TNA × días ÷ 365 (fórmula de la spec, docs/formulas.md), sin impuestos
- **Decisión de Lourdes:** ☐ Aprobada · ☐ Con cambios · ☐ No va

**Situación:** El resumen de la tarjeta tiene muchos números. Solo unos pocos deciden cuánto te cuesta.

**Objetivo:** Al terminar vas a poder encontrar en tu resumen las fechas, el pago total, el mínimo y el CFT, y calcular los intereses de un mes por lo que financias.

**Para empezar**

**¿Sabes cuál es la fecha de vencimiento de tu tarjeta?**

- Sí: _Bien: es la fecha que decide si pagas intereses._
- No la tengo presente: _Es muy común. En esta guía vemos dónde está y por qué importa._

### Las dos fechas

El **cierre** es el día en que se suman los consumos del período. El **vencimiento** es el último día para pagar sin mora. Si pagas el **total** antes del vencimiento, no pagas intereses.

### Lo que financias

Si pagas menos que el total, la diferencia se **financia**: genera intereses a la tasa de la tarjeta y aparece en el resumen siguiente. Las **cuotas** de compras anteriores también están en el resumen, aunque no las hayas comprado este mes.

### Las tasas, destacadas

La entidad debe informar la **TNA**, la **TEA** y el **CFT**, con el CFT destacado. Para comparar tarjetas o créditos, el número es el CFT: suma la tasa, las comisiones y los cargos.

### Ejemplo resuelto: un mes financiado

1. Resumen: $ 240.000. Pagas $ 140.000 y financias $ 100.000.
2. TNA de ejemplo del 60 %. Interés de 30 días: TNA × 30 ÷ 365.
3. $ 100.000 × 0,60 × 30 ÷ 365 = $ 4.931,51 de intereses, sin contar impuestos.
4. Ese monto se suma a tu próximo resumen, además de los consumos nuevos.

**Práctica**

**Financias $ 50.000 durante 30 días con una TNA de ejemplo del 60 %. ¿Cuánto pagas de intereses, sin impuestos?**

- Respuesta: 2465.75 (tolerancia 1.00)
- Correcta: _Correcto. $ 50.000 × 0,60 × 30 ÷ 365 = $ 2.465,75._
- Incorrecta: _Multiplica lo que financias por la TNA y por los días, y divide por 365: $ 50.000 × 0,60 × 30 ÷ 365 = $ 2.465,75._

**Para tu vida:** en tu último resumen, marca el cierre, el vencimiento, el pago total y el CFT. Agenda el vencimiento para pagar el total a tiempo.

---

## Módulo 7 · Salir de deudas: bola de nieve o avalancha: "La bola de nieve, paso a paso" (6 min)

- **Id:** `module-07-guide-2` · **Fuentes:** A-24, A-25, A-26, A-27, A-30
- **Validado (sin cambiar datos):** Bola de nieve, pago liberado y capacidad de pago creciente (A-24 a A-27); Ejemplo de las tres deudas (A-25); Cuándo conviene cada método (A-30)
- **Ampliación, pendiente del Lic. Kevin Giampieri:** No sumar deudas nuevas mientras se sale: criterio didáctico
- **Decisión de Lourdes:** ☐ Aprobada · ☐ Con cambios · ☐ No va

**Situación:** Elegiste un método para salir de deudas. Ahora falta lo más difícil: sostenerlo mes a mes.

**Objetivo:** Al terminar vas a poder aplicar la bola de nieve con tus deudas: ordenarlas, sumar el pago liberado a la siguiente y sostener el plan.

**Para empezar**

**En la bola de nieve, ¿por qué deuda empiezas?**

- La de menor saldo: _Exacto: así llega antes la primera deuda saldada._
- La de tasa más alta: _Ese es el criterio de la avalancha. En la bola de nieve se empieza por el menor saldo._
- No lo recuerdo: _En esta guía lo vemos paso a paso._

### El orden

Pagas **todos los mínimos** y pones **todo el extra** en la deuda de **menor saldo**. Cuando la saldas, lo que pagabas por ella pasa a la siguiente: la capacidad de pago crece con cada deuda saldada.

### Cómo sostenerlo

Mientras sales, **no sumes deudas nuevas**: cada compra financiada te devuelve al principio. Celebra cada deuda saldada; para eso sirve la bola de nieve: resultados que se ven rápido. Si lo que más te importa es pagar menos intereses, la avalancha te conviene.

### Ejemplo resuelto: las deudas del taller

1. Tarjeta de ropa: $ 5.000 (mínimo $ 500). Préstamo personal: $ 25.000 (mínimo $ 2.000). Crédito del auto: $ 100.000 (mínimo $ 10.000).
2. Orden de la bola de nieve: tarjeta de ropa, préstamo personal y crédito del auto.
3. Pagas los mínimos y todo el extra va a la tarjeta de ropa hasta saldarla.
4. Después, sus $ 500 se suman al préstamo: pagas $ 2.500 más el extra, hasta saldarlo. Y así con el auto.

**Práctica**

**Saldaste la tarjeta de ropa, que tenía un mínimo de $ 500. ¿Qué haces con esos $ 500 cada mes?**

- ✔ Los sumo al pago del préstamo personal, la siguiente deuda: _Correcto. Ese pago liberado se suma a la siguiente deuda: por eso la bola de nieve crece y cada deuda se salda más rápido._
- ✖ Los gasto: ya terminé una deuda: _Es tentador, pero la bola de nieve funciona porque el pago liberado se suma a la siguiente deuda._
- ✖ Los reparto entre todas las deudas: _Repartirlo diluye el efecto: en la bola de nieve todo va a la siguiente deuda de menor saldo._

**Para tu vida:** escribe tus deudas de menor a mayor saldo, con su mínimo, y decide cuánto extra pones cada mes. Pruébalo en la herramienta "Salir de deudas: bola de nieve o avalancha".

---

## Módulo 8 · ¿Cuotas sin interés o contado con descuento?: "Las cuotas se suman" (5 min)

- **Id:** `module-08-guide-2` · **Fuentes:** A-15, B-04
- **Validado (sin cambiar datos):** Gastos fijos y menos compromisos fijos (A-15)
- **Ampliación, pendiente del Lic. Kevin Giampieri:** Las cuotas acumuladas como gastos fijos: criterio didáctico; Mirar el CFT si no son realmente sin interés (B-04); Ejemplo y práctica con números redondos
- **Decisión de Lourdes:** ☐ Aprobada · ☐ Con cambios · ☐ No va

**Situación:** Una compra en cuotas parece liviana. Tres compras en cuotas, al mismo tiempo, ya son un gasto fijo más.

**Objetivo:** Al terminar vas a poder sumar las cuotas que ya tienes comprometidas y tratarlas como gastos fijos en tu presupuesto.

**Para empezar**

**¿Sabes cuánto suman este mes las cuotas que estás pagando?**

- Sí, lo sé: _Bien. En esta guía vemos cómo usar ese número en tu presupuesto._
- No exactamente: _Es muy común: cada cuota sola parece chica. En esta guía las sumamos._

### Cuotas que se acumulan

Cada compra en cuotas se paga durante varios meses. Si compras otra antes de terminar la anterior, las cuotas **se suman**, aunque cada una sea chica y sea **sin interés**.

### Son gastos fijos

Mientras duran, las cuotas son **gastos fijos**: ya están comprometidas, pase lo que pase con tu sueldo. Súmalas en tu presupuesto antes de decidir una compra nueva, y mira el **CFT** si no son realmente sin interés.

### Ejemplo resuelto: tres compras

1. Zapatillas: $ 10.000 por mes. Celular: $ 15.000 por mes. Heladera: $ 20.000 por mes.
2. Este mes pagas $ 10.000 + $ 15.000 + $ 20.000 = $ 45.000 en cuotas.
3. Esos $ 45.000 van con tus gastos fijos, como el alquiler y los servicios.
4. Antes de sumar otra cuota, revisa si tu presupuesto sigue cerrando.

**Práctica**

**Este mes pagas cuotas de $ 8.000, $ 12.000, $ 20.000 y $ 5.000. ¿Cuánto suman tus cuotas del mes?**

- Respuesta: 45000 (tolerancia 1.00)
- Correcta: _Correcto. $ 8.000 + $ 12.000 + $ 20.000 + $ 5.000 = $ 45.000: un gasto fijo más de tu mes._
- Incorrecta: _Suma todas las cuotas del mes: $ 8.000 + $ 12.000 + $ 20.000 + $ 5.000 = $ 45.000._

**Para tu vida:** anota todas las cuotas que pagas este mes y hasta cuándo dura cada una. Súmalas a tus gastos fijos en el presupuesto.

---
