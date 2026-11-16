# Tanda 7 del paso 27: guías para revisar

> Borradores de `src/data/guides-drafts.json`, generados con `node scripts/guides-review.mjs 7`. **No se muestran en la app** hasta que Lourdes los apruebe; las ampliaciones quedan marcadas para el Lic. Kevin Giampieri (D-276).

Cómo revisar: marca en cada guía "Aprobada", "Con cambios" (y cuáles) o "No va". Lo validado viene del taller o de la presentación y no cambia datos; las ampliaciones son lo nuevo.

## Módulo 9 · Inflación y poder de compra: "Lo que vas a pagar mañana" (6 min)

- **Id:** `module-09-guide-3` · **Fuentes:** A-21, B-40, T, F-05, F-06, F-07
- **Validado (sin cambiar datos):** El dinero quieto pierde poder de compra (A-21); el IPC lo publica el INDEC (B-40); Calculadora de inflación del taller: $ 100 con 25 % anual en 5 años = $ 32,77 (T, caso F-07); Casos F-05 ($ 142.576,09) y F-06 ($ 201.219,65) de docs/formulas.md, con test
- **Ampliación, pendiente del Lic. Kevin Giampieri:** Precio futuro de una meta en un escenario y la idea de revisar la meta; Práctica con $ 200.000 × 1,03^12 = $ 285.152,18, calculado a mano
- **Decisión de Lourdes:** ☐ Aprobada · ☐ Con cambios · ☐ No va

**Situación:** Juntas para algo que hoy cuesta $ 200.000. En un año juntaste justo eso, pero el precio ya no es el mismo.

**Objetivo:** Al terminar vas a poder estimar el precio futuro de algo que quieres comprar en un escenario de inflación y ajustar tu meta de ahorro.

**Para empezar**

**Cuando defines una meta de ahorro, ¿tienes en cuenta que el precio va a subir?**

- Sí: _Bien. En esta guía lo calculas con una fórmula corta._
- No: _Es lo más común. En esta guía ves cuánto puede cambiar la meta._

### El precio también se mueve

Con inflación, lo que hoy cuesta **M** cuesta más en el futuro: **precio futuro = M × (1 + inflación mensual) ^ meses**. Si tu meta es un monto fijo de hoy, cuando llegues puede no alcanzar. Por eso una meta de ahorro se ajusta por el escenario de inflación.

### Escenarios, no predicciones

No sabemos la inflación futura: por eso se calculan **escenarios** (baja, media o alta) y se revisa la meta cada tanto. La inflación oficial del pasado es el **IPC** que publica el INDEC; la del futuro siempre es un supuesto.

### Ejemplo resuelto: algo que hoy cuesta $ 100.000

1. Con 3 % mensual durante 12 meses: $ 100.000 × 1,03^12 = $ 142.576,09.
2. Con 6 % mensual: $ 100.000 × 1,06^12 = $ 201.219,65, el doble.
3. Con inflación anual, la fórmula es la misma con años: en la calculadora del taller, $ 100 con 25 % anual en 5 años compran lo que hoy $ 32,77.
4. Tu meta no es el precio de hoy: es el precio del escenario en la fecha en que vas a comprar.

**Práctica**

**Algo que quieres comprar hoy cuesta $ 200.000. Con una inflación de ejemplo del 3 % mensual, ¿cuánto costaría en 12 meses?**

- Respuesta: 285152.18 (tolerancia 1.00)
- Correcta: _Correcto. $ 200.000 × 1,03^12 = $ 285.152,18: tu meta tendría que ser ese monto, no $ 200.000._
- Incorrecta: _Multiplica por (1 + inflación) elevado a los meses: $ 200.000 × 1,03^12 = $ 285.152,18._

**Para tu vida:** elige algo que quieras comprar y calcula su precio en el escenario medio con la herramienta "Meta de ahorro con inflación".

---

## Módulo 10 · Tasas sin misterio: TNA, TEM, TEA y tasa real: "La misma tasa, dos resultados" (6 min)

- **Id:** `module-10-guide-3` · **Fuentes:** B-40, F-01, F-03, F-04
- **Validado (sin cambiar datos):** Casos F-03 (−0,04 %) y F-04 (+1,44 %) de docs/formulas.md, con test; Tasa del período TNA × d ÷ 365 (F-01)
- **Ampliación, pendiente del Lic. Kevin Giampieri:** Lectura de la tasa real por su signo, con el tono de 2.1.1 (pérdida de poder de compra como información)
- **Decisión de Lourdes:** ☐ Aprobada · ☐ Con cambios · ☐ No va

**Situación:** Un plazo fijo con una TNA del 36 %. Con una inflación pierdes poder de compra; con otra, ganas. La tasa no cambió.

**Objetivo:** Al terminar vas a poder calcular la tasa real de un plazo en dos escenarios de inflación y explicar por qué una tasa sola no dice si le ganas a la inflación.

**Para empezar**

**¿Una TNA alta asegura que le ganes a la inflación?**

- Sí: _Es una idea común. En esta guía ves por qué depende de la inflación del mismo período._
- No: _Bien. En esta guía lo pones en números._
- No lo sé: _En esta guía lo ves con un ejemplo._

### Comparar en el mismo período

La **tasa real** compara lo que rinde un plazo con la inflación **del mismo período**: **tasa real = (1 + tasa del período) ÷ (1 + inflación del período) − 1**. Una TNA anual no se compara con una inflación mensual: primero se pasa la TNA al plazo, **TNA × días ÷ 365**.

### El signo es lo que importa

Si la tasa real es **positiva**, tu dinero compra un poco más al final. Si es **negativa**, tienes más pesos pero compras menos: pierdes poder de compra. Es información, no una falla tuya: depende del escenario.

### Ejemplo resuelto: TNA del 36 % a 30 días

1. Tasa del período: 36 % × 30 ÷ 365 = 2,96 %.
2. Con inflación del 3 % mensual: 1,0296 ÷ 1,03 − 1 = −0,04 %. Pierdes poder de compra.
3. Con inflación del 1,5 % mensual: 1,0296 ÷ 1,015 − 1 = +1,44 %. Ganas poder de compra.
4. La misma tasa da dos resultados: por eso se mira siempre con la inflación del escenario.

**Práctica**

**Un plazo fijo a 30 días rinde 2,96 % en el período (TNA del 36 %). Si la inflación del mes es del 1,5 %, ¿cuál es la tasa real del período? (en porcentaje)**

- Respuesta: 1.44 (tolerancia 0.01)
- Correcta: _Correcto. 1,0296 ÷ 1,015 − 1 = 1,44 %: en ese escenario, le ganas a la inflación._
- Incorrecta: _Divide en lugar de restar: (1 + 0,0296) ÷ (1 + 0,015) − 1 = 1,44 %._

**Para tu vida:** en la herramienta "Tasa real", prueba la misma TNA con los tres escenarios de inflación y mira cuándo cambia de signo.

---

## Módulo 11 · Plazo fijo tradicional, plazo fijo UVA y fondos money market: "Cuánto rinde por día" (6 min)

- **Id:** `module-11-guide-3` · **Fuentes:** B-12, B-13, B-14, B-26
- **Validado (sin cambiar datos):** La retribución de los saldos en pesos se traslada por completo al cliente (B-13); Un money market es un FCI, sin garantía y con rendimiento que varía a diario (B-14, B-26); cuentas de pago sin garantía (B-12); Rendimiento diario saldo × TNA ÷ 365, la regla de la billetera de práctica (spec 5.3, docs/wallet-engine.md)
- **Ampliación, pendiente del Lic. Kevin Giampieri:** Ejemplo ($ 821,92 por día) y práctica ($ 410,96 por día), calculados a mano
- **Decisión de Lourdes:** ☐ Aprobada · ☐ Con cambios · ☐ No va

**Situación:** Tu billetera muestra que tu saldo "rindió" unos pesos hoy. ¿De dónde sale ese número y qué tipo de producto lo paga?

**Objetivo:** Al terminar vas a poder calcular el rendimiento diario de un saldo con una TNA y reconocer si viene de una cuenta o de un fondo.

**Para empezar**

**¿Tu billetera te muestra cuánto rinde tu saldo por día?**

- Sí: _Bien. En esta guía ves cómo se calcula._
- No: _En esta guía ves de dónde sale ese número._
- No uso billetera: _En la billetera de práctica lo ves al avanzar el tiempo._

### El cálculo de cada día

Con una tasa anual, lo que rinde un día es **saldo × TNA ÷ 365**. Al otro día, si el rendimiento se suma al saldo, también genera rendimiento: interés sobre interés, de a poco. Es lo que ves en la billetera de práctica al avanzar el tiempo.

### Cuenta o fondo

Si el saldo rinde en una **cuenta remunerada** de una billetera con CVU, el proveedor debe trasladarte **toda** la retribución que cobra por tus pesos depositados en bancos. Si rinde porque suscribe un **fondo money market**, es una inversión en un FCI: el rendimiento **varía a diario** y no tiene la garantía de los depósitos. Mira en los términos de tu billetera cuál de las dos es.

### Ejemplo resuelto: $ 1.000.000 con una TNA de ejemplo del 30 %

1. Un día: $ 1.000.000 × 0,30 ÷ 365 = $ 821,92.
2. Al día siguiente, el saldo es $ 1.000.821,92 y rinde un poco más.
3. Si es un fondo, la tasa de mañana puede ser otra: el rendimiento varía.
4. Para saber si le gana a la inflación, compara con la inflación del mismo período.

**Práctica**

**Tienes $ 500.000 con una TNA de ejemplo del 30 %. ¿Cuánto rinde en un día?**

- Respuesta: 410.96 (tolerancia 0.01)
- Correcta: _Correcto. $ 500.000 × 0,30 ÷ 365 = $ 410,96 en un día._
- Incorrecta: _Multiplica el saldo por la TNA y divide por 365: $ 500.000 × 0,30 ÷ 365 = $ 410,96._

**Para tu vida:** en Rendir, elige cuenta o fondo y avanza una semana: mira cuánto rindió cada día y lee qué dice la ficha de cada opción.

---

## Módulo 17 · Billeteras virtuales y fintech: "Dónde está el dinero de las billeteras" (6 min)

- **Id:** `module-17-guide-3` · **Fuentes:** B-12, B-14, B-17
- **Validado (sin cambiar datos):** Datos del Informe de Pagos Minoristas del BCRA, septiembre de 2026, con datos de agosto: 70,1 millones de cuentas, $ 0,9 billones en cuentas, $ 9 billones en fondos, 75 % de las transferencias con CVU (B-17); Cuentas de pago y money market sin garantía de los depósitos (B-12, B-14)
- **Ampliación, pendiente del Lic. Kevin Giampieri:** Cálculo de la proporción (9 ÷ 9,9 = 90,9 %), hecho a mano; Rótulo del dato como fechado y actualizable
- **Decisión de Lourdes:** ☐ Aprobada · ☐ Con cambios · ☐ No va

**Situación:** Decimos "tengo el dinero en la billetera". Pero en Argentina, la mayor parte de ese dinero no está en la cuenta: está invertido en un fondo.

**Objetivo:** Al terminar vas a poder interpretar los datos oficiales sobre billeteras y explicar por qué importa si tu dinero está en una cuenta o en un fondo.

**Para empezar**

**¿Sabes si tu dinero en la billetera está en la cuenta o en un fondo?**

- En la cuenta: _En esta guía ves qué protección tiene._
- En un fondo: _Bien. En esta guía ves qué implica._
- No lo sé: _Es lo más común. En esta guía ves dónde mirarlo._

### Lo que dicen los datos

Según el **Informe de Pagos Minoristas del BCRA** de septiembre de 2026 (datos de agosto): había **70,1 millones de cuentas de pago**, con **$ 0,9 billones** en saldos de esas cuentas y **$ 9 billones** invertidos en **fondos de dinero** a través de las billeteras. El 75 % de las transferencias inmediatas en pesos tuvo una CVU de origen o destino.

### Por qué importa

Una **cuenta de pago** y un **fondo money market** no son lo mismo: el fondo es una inversión, su rendimiento varía a diario y ninguno de los dos tiene la garantía de los depósitos. Cuando una billetera dice que tu saldo "rinde", muchas veces es porque lo invierte en un fondo. Saberlo te deja comparar con información.

### Ejemplo resuelto: leer el dato

1. En fondos de dinero: $ 9 billones. En saldos de cuentas de pago: $ 0,9 billones.
2. Total: $ 9,9 billones.
3. En fondos: 9 ÷ 9,9 = 90,9 %. De cada $ 10 en billeteras, unos $ 9 estaban en fondos.
4. Es un dato con fecha (agosto de 2026): los números cambian, y el informe del BCRA los actualiza.

**Práctica**

**Según el informe del BCRA (datos de agosto de 2026), de cada $ 10 que las personas tenían en billeteras, ¿cuántos estaban invertidos en fondos de dinero?**

- ✔ Unos $ 9: _Correcto. $ 9 billones en fondos contra $ 0,9 billones en cuentas: cerca del 91 % estaba en fondos._
- ✖ Unos $ 5: _Era bastante más: $ 9 billones en fondos contra $ 0,9 billones en cuentas, cerca del 91 %._
- ✖ Unos $ 1: _Es al revés: lo que quedaba en las cuentas era cerca de $ 1 de cada $ 10. En fondos estaban unos $ 9._

**Para tu vida:** abre los términos de tu billetera y busca si tu saldo remunerado es una cuenta o un fondo. Si es un fondo, busca su nombre en la CNV.

---
