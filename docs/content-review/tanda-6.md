# Tanda 6 del paso 27: guías para revisar

> **Aprobada por Lourdes el undefined/undefined/15/11/2026.** Las guías pasaron a `src/data/guides.json` y se ven en la app. Las ampliaciones siguen pendientes de revisión del Lic. Kevin Giampieri.

> Borradores de `src/data/guides-drafts.json`, generados con `node scripts/guides-review.mjs 6`. **No se muestran en la app** hasta que Lourdes los apruebe; las ampliaciones quedan marcadas para el Lic. Kevin Giampieri (D-276).

Cómo revisar: marca en cada guía "Aprobada", "Con cambios" (y cuáles) o "No va". Lo validado viene del taller o de la presentación y no cambia datos; las ampliaciones son lo nuevo.

## Módulo 5 · El orden importa: "Si te ofrecen refinanciar" (6 min)

- **Id:** `module-05-guide-3` · **Fuentes:** A-23, B-04, B-06, F-01
- **Validado (sin cambiar datos):** Pagar una deuda cara equivale a un ahorro asegurado (A-23); El CFT suma tasa, comisiones y cargos y se informa destacado (B-04); La Central de Deudores del BCRA (B-06)
- **Ampliación, pendiente del Lic. Kevin Giampieri:** Refinanciar: cuándo reduce el costo y la condición de no volver a financiar; Ejemplo de interés de 30 días con TNA de ejemplo del 120 % y del 70 % ($ 9.863,01 y $ 5.753,42), con la fórmula F-01 y calculado a mano
- **Decisión de Lourdes:** ☑ Aprobada (undefined/undefined/15/11/2026)

**Situación:** Te llega una oferta: "Cancela tu tarjeta con un préstamo y paga menos". A veces es cierto. A veces solo cambia la deuda de lugar.

**Objetivo:** Al terminar vas a poder comparar el costo mensual de dos deudas con su tasa y decidir cuándo refinanciar reduce lo que pagas.

**Para empezar**

**¿Alguna vez cambiaste una deuda por otra?**

- Sí: _Bien. En esta guía ves cómo saber si te convino._
- No: _En esta guía ves qué mirar si te lo ofrecen._

### Cambiar una deuda por otra

**Refinanciar** es tomar una deuda nueva para pagar otra. Solo reduce lo que pagas si la deuda nueva **cuesta menos**: compara el **CFT** de las dos, porque suma la tasa, las comisiones y los cargos. Pagar una deuda cara es un ahorro asegurado; cambiarla por otra igual de cara no lo es.

### La condición que más se olvida

Si refinancias la tarjeta y la vuelves a usar, ahora tienes **dos deudas**. Refinanciar sirve cuando además dejas de sumar consumos financiados. Y antes de pedir un crédito, puedes revisar tu situación en la **Central de Deudores** del BCRA: es lo que mira la entidad.

### Ejemplo resuelto: $ 100.000 durante 30 días

1. Tarjeta con una TNA de ejemplo del 120 %: 100.000 × 1,20 × 30 ÷ 365 = $ 9.863,01 de intereses en el mes.
2. Préstamo con una TNA de ejemplo del 70 %: 100.000 × 0,70 × 30 ÷ 365 = $ 5.753,42.
3. Diferencia: $ 4.109,59 por mes, sin contar comisiones ni impuestos. Por eso hay que mirar el CFT, no solo la TNA.
4. Solo conviene si el CFT del préstamo es menor y no vuelves a financiar con la tarjeta.

**Práctica**

**Te ofrecen un préstamo para cancelar el saldo de tu tarjeta. ¿Cuándo te conviene?**

- ✔ Si su CFT es menor que el de la tarjeta y dejas de financiar con la tarjeta: _Correcto. El CFT dice cuál cuesta menos, y la deuda baja solo si no vuelves a financiar con la tarjeta._
- ✖ Si la cuota es más baja que el pago mínimo de la tarjeta: _Una cuota baja puede esconder un plazo largo y un costo total mayor. Compara el CFT y, además, deja de financiar con la tarjeta._
- ✖ Siempre: así tienes una sola deuda: _No siempre: si el préstamo cuesta más, o si vuelves a usar la tarjeta, terminas pagando más. Compara el CFT._

**Para tu vida:** si tienes una deuda cara, busca el CFT en tu resumen o tu contrato. Ese es el número para comparar cualquier oferta de refinanciación.

---

## Módulo 6 · Tarjeta de crédito: pago mínimo, TNA y CFT: "La tasa lo cambia todo" (6 min)

- **Id:** `module-06-guide-3` · **Fuentes:** T, B-04, F-14, F-15
- **Validado (sin cambiar datos):** Pago mínimo y saldo financiado con intereses (T); TNA, TEA y CFT; el CFT destacado (B-04); Casos F-14 (55 meses, $ 83.880,36) y F-15 (237 meses, $ 813.271,16) de docs/formulas.md, con test
- **Ampliación, pendiente del Lic. Kevin Giampieri:** Comparación del mismo saldo con dos tasas de ejemplo y la idea de que pagar algo más que el mínimo baja el costo
- **Decisión de Lourdes:** ☑ Aprobada (undefined/undefined/15/11/2026)

**Situación:** Dos tarjetas, el mismo saldo de $ 100.000 y el mismo pago mínimo del 10 %. Con una terminas de pagar en cuatro años y medio. Con la otra, en casi veinte.

**Objetivo:** Al terminar vas a poder explicar cómo la tasa cambia el tiempo y el costo de pagar solo el mínimo, y elegir la forma de pago que menos cuesta.

**Para empezar**

**¿Sabes qué tasa cobra tu tarjeta cuando financias?**

- Sí: _Bien. En esta guía ves cuánto pesa ese número._
- No: _Está en tu resumen, con el CFT destacado. En esta guía ves por qué conviene buscarla._

### El mínimo crece con los intereses

Si pagas solo el **mínimo**, lo que queda se financia y genera intereses todos los meses. Con una tasa alta, buena parte de cada pago son intereses y el saldo baja muy despacio. Por eso la misma deuda puede durar años más.

### Lo que menos cuesta

Pagar el **total** antes del vencimiento no genera intereses. Si no puedes, cada peso que pagas por encima del mínimo baja el saldo que se financia. Y para comparar tarjetas, el número es el **CFT**: la simulación usa la tasa, pero el costo real se acerca más al CFT, porque suma comisiones y cargos.

### Ejemplo resuelto: el mismo saldo con dos tasas

1. Saldo: $ 100.000, pago mínimo del 10 % con un piso de $ 1.000, sin consumos nuevos y sin impuestos.
2. Con una TNA de ejemplo del 60 %: 55 meses y $ 83.880,36 de intereses.
3. Con una TNA de ejemplo del 120 %: 237 meses y $ 813.271,16 de intereses.
4. Pagando el total el primer mes, en los dos casos: $ 0 de intereses.

**Práctica**

**Tienes un saldo de $ 100.000 en una tarjeta con una TNA de ejemplo del 120 %. Si pagas solo el mínimo del 10 %, ¿cuánto pagas de intereses en total, sin consumos nuevos?**

- ✔ $ 813.271,16, en 237 meses: _Correcto. Con esa tasa, cada mínimo es casi todo interés: el saldo baja muy despacio y los intereses superan ocho veces la deuda._
- ✖ $ 83.880,36, en 55 meses: _Ese es el caso con una TNA del 60 %. Con el 120 % son 237 meses y $ 813.271,16 de intereses._
- ✖ $ 120.000, en 12 meses: _El mínimo no cancela la deuda en un año. Con el 120 % son 237 meses y $ 813.271,16 de intereses._

**Para tu vida:** prueba en la herramienta "Tarjeta de crédito" tu saldo con el mínimo y con un pago un poco mayor, y compara los intereses.

---

## Módulo 7 · Salir de deudas: bola de nieve o avalancha: "Los dos métodos con números" (7 min)

- **Id:** `module-07-guide-3` · **Fuentes:** A-24, A-28, A-29, A-30, F-16, F-17
- **Validado (sin cambiar datos):** Bola de nieve y avalancha, y cuándo usar cada una (A-24, A-28, A-30); Deudas y tasas de ejemplo de A-29
- **Ampliación, pendiente del Lic. Kevin Giampieri:** Los mínimos ($ 4.000, $ 1.500 y $ 10.000) y los $ 20.000 extra no están en A-29: son los supuestos de práctica de la misión "Sal de tus deudas" (docs/formulas.md, sección 8), y la guía los rotula así; Resultados de la simulación con test: 11 meses, $ 109.817,08 y $ 111.507,88, diferencia de $ 1.690,80
- **Decisión de Lourdes:** ☑ Aprobada (undefined/undefined/15/11/2026)

**Situación:** Tres deudas, $ 20.000 extra por mes. La avalancha y la bola de nieve terminan el mismo mes. ¿Entonces da igual cuál elijas?

**Objetivo:** Al terminar vas a poder comparar la avalancha y la bola de nieve con el tiempo, los intereses y la primera deuda saldada, y elegir con tus prioridades.

**Para empezar**

**Si tuvieras tres deudas, ¿qué te motivaría más?**

- Saldar una pronto: _Esa es la fuerza de la bola de nieve. En esta guía ves cuánto cuesta en intereses._
- Pagar menos intereses: _Esa es la fuerza de la avalancha. En esta guía ves la diferencia en números._
- No lo sé: _En esta guía tienes los números para decidir._

### Qué comparar

Para elegir, mira tres cosas: **cuántos meses** tardas en quedar sin deudas, **cuántos intereses** pagas en total y **cuándo saldas la primera**. La **avalancha** ataca la tasa más alta y paga menos intereses; la **bola de nieve** ataca el saldo más chico y da la primera deuda saldada antes.

### Lo que no cambia

En los dos métodos pagas **todos los mínimos** y pones todo el extra en una sola deuda; cuando la saldas, su pago pasa a la siguiente. Lo que no puede pasar es sumar deudas nuevas mientras sales.

### Ejemplo resuelto: las deudas del taller, con supuestos de práctica

1. Tarjeta: $ 40.000 al 150 % anual. Financiera: $ 15.000 al 110 %. Crédito bancario: $ 200.000 al 80 % (tasas de ejemplo). Mínimos de práctica: $ 4.000, $ 1.500 y $ 10.000, y $ 20.000 extra por mes.
2. Avalancha: 11 meses, $ 109.817,08 de intereses, primera deuda saldada en el mes 2.
3. Bola de nieve: 11 meses, $ 111.507,88 de intereses, primera deuda saldada en el mes 1.
4. La avalancha ahorra $ 1.690,80; la bola de nieve da la primera victoria un mes antes.

**Práctica**

**En el ejemplo, la avalancha paga $ 109.817,08 de intereses y la bola de nieve, $ 111.507,88. ¿Cuánto ahorras en intereses con la avalancha?**

- Respuesta: 1690.80 (tolerancia 1.00)
- Correcta: _Correcto. $ 111.507,88 − $ 109.817,08 = $ 1.690,80. En este caso la diferencia es chica: la motivación también cuenta._
- Incorrecta: _Resta los intereses: $ 111.507,88 − $ 109.817,08 = $ 1.690,80._

**Para tu vida:** carga tus deudas en la herramienta "Salir de deudas" y mira los dos métodos lado a lado antes de elegir.

---

## Módulo 8 · ¿Cuotas sin interés o contado con descuento?: "Cambia el escenario, cambia la respuesta" (6 min)

- **Id:** `module-08-guide-3` · **Fuentes:** B-04, F-10, F-11, F-12, F-13
- **Validado (sin cambiar datos):** Casos F-10 a F-13 de docs/formulas.md, con test ($ 99.540,04; $ 109.075,05; $ 83.838,44; $ 102.526,24); Mirar el CFT para confirmar que sean sin interés (B-04)
- **Ampliación, pendiente del Lic. Kevin Giampieri:** Lectura de los casos como escenarios y la importancia de cuándo se paga la primera cuota
- **Decisión de Lourdes:** ☑ Aprobada (undefined/undefined/15/11/2026)

**Situación:** La misma heladera, las mismas 12 cuotas, el mismo descuento por contado. Con una inflación conviene una cosa; con otra, la contraria.

**Objetivo:** Al terminar vas a poder comparar cuotas y contado en distintos escenarios de inflación y explicar por qué importa cuándo se paga la primera cuota.

**Para empezar**

**Cuando eliges entre cuotas y contado, ¿piensas en la inflación?**

- Sí: _Bien. En esta guía ves cómo cambia la respuesta según el escenario._
- No: _Es muy común. En esta guía ves por qué conviene mirarla._

### No hay una respuesta fija

El **valor de hoy** de las cuotas depende de la inflación que esperas: con más inflación, las cuotas futuras pesan menos. Por eso la misma compra puede convenir en cuotas en un escenario y al contado en otro. Son **escenarios**, no predicciones.

### Cuándo se paga la primera cuota

Si la **primera cuota se paga hoy**, pesa igual que el contado y el valor de hoy de las cuotas sube. Lee las condiciones: ese detalle puede dar vuelta la comparación. Y mira el **CFT**: que de verdad sean sin interés.

### Ejemplo resuelto: $ 120.000 en 12 cuotas o $ 102.000 al contado

1. Con 3 % mensual, las cuotas valen hoy $ 99.540,04: convienen las cuotas.
2. Con 1,5 % mensual, valen $ 109.075,05: conviene el contado.
3. Con 6 % mensual, valen $ 83.838,44: convienen todavía más las cuotas.
4. Con 3 % mensual y la primera cuota hoy, valen $ 102.526,24: el contado queda apenas más barato.

**Práctica**

**Precio: $ 120.000 en 12 cuotas de $ 10.000, o $ 102.000 al contado. Si esperas una inflación del 1,5 % mensual, ¿qué conviene en ese escenario?**

- ✔ El contado: las cuotas valen hoy $ 109.075,05: _Correcto. Con inflación baja, las cuotas futuras pesan casi como el dinero de hoy: $ 109.075,05 es más que los $ 102.000 del contado._
- ✖ Las cuotas: siempre convienen si son sin interés: _No siempre: depende del escenario. Con 1,5 % mensual las cuotas valen hoy $ 109.075,05, más que el contado de $ 102.000._
- ✖ Da igual: el precio es el mismo: _El precio en cuotas es $ 120.000 y el contado, $ 102.000. Con 1,5 % mensual, las cuotas valen hoy $ 109.075,05: conviene el contado._

**Para tu vida:** en la herramienta "Cuotas sin interés o contado", prueba tu próxima compra con los tres escenarios de inflación.

---
