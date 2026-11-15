# Tanda 3 del paso 27: guías para revisar

> **Aprobada por Lourdes el 15/11/2026.** Las guías pasaron a `src/data/guides.json` y se ven en la app. Las ampliaciones siguen pendientes de revisión del Lic. Kevin Giampieri.

> Borradores de `src/data/guides-drafts.json`, generados con `node scripts/guides-review.mjs 3`. **No se muestran en la app** hasta que Lourdes los apruebe; las ampliaciones quedan marcadas para el Lic. Kevin Giampieri (D-276).

Cómo revisar: marca en cada guía "Aprobada", "Con cambios" (y cuáles) o "No va". Lo validado viene del taller o de la presentación y no cambia datos; las ampliaciones son lo nuevo.

## Módulo 9 · Inflación y poder de compra: "Tu sueldo frente a los precios" (6 min)

- **Id:** `module-09-guide-2` · **Fuentes:** A-21, B-40, F-03
- **Validado (sin cambiar datos):** El dinero quieto pierde poder de compra hoy, en un año y en cinco (A-21); El IPC lo publica el INDEC (B-40)
- **Ampliación, pendiente del Lic. Kevin Giampieri:** Cambio real de un sueldo: (1 + aumento) ÷ (1 + inflación) − 1, la fórmula de tasa real de la spec (docs/formulas.md, F-03) aplicada a un aumento; Ejemplo y práctica con números redondos de ejemplo
- **Decisión de Lourdes:** ☑ Aprobada (15/11/2026)

**Situación:** Te aumentaron el sueldo un 20 %. Suena bien, pero en el mismo año los precios subieron un 30 %. ¿Ganaste o perdiste?

**Objetivo:** Al terminar vas a poder calcular si un aumento de sueldo le ganó a la inflación del mismo período.

**Para empezar**

**Tu último aumento, ¿le ganó a la inflación?**

- Sí: _Bien. En esta guía vas a poder calcularlo con precisión._
- No: _Es muy común. En esta guía vemos cuánto poder de compra se perdió._
- No lo sé: _En esta guía aprendes a calcularlo en un minuto._

### Más pesos no es más poder de compra

Lo que importa no es cuántos pesos cobras, sino **qué puedes comprar con ellos**. Si tu sueldo sube menos que los precios, cobras más pesos pero compras menos. El dinero quieto pierde poder de compra hoy, en un año y en cinco.

### Cómo compararlos

No se restan los porcentajes: se dividen. **Cambio real = (1 + aumento) ÷ (1 + inflación) − 1**, con la inflación del **mismo período** que el aumento. La inflación oficial es el **IPC** que publica el INDEC.

### Ejemplo resuelto: un aumento del 20 %

1. Aumento de sueldo en el año: 20 %. Inflación del mismo año: 30 % (números de ejemplo).
2. Cambio real: 1,20 ÷ 1,30 − 1 = −7,69 %.
3. Cobras un 20 % más de pesos, pero compras un 7,69 % menos que antes.
4. Por eso conviene comparar siempre con la inflación del mismo período.

**Práctica**

**Tu sueldo subió un 30 % y la inflación del mismo período fue del 20 %. ¿Cuánto cambió tu poder de compra? (en porcentaje)**

- Respuesta: 8.33 (tolerancia 0.01)
- Correcta: _Correcto. 1,30 ÷ 1,20 − 1 = 8,33 %: tu poder de compra subió._
- Incorrecta: _Divide en lugar de restar: 1,30 ÷ 1,20 − 1 = 8,33 %. Restar daría 10 %, que exagera la mejora._

**Para tu vida:** busca en el sitio del INDEC la inflación de los últimos 12 meses y compárala con lo que aumentó tu sueldo en ese período.

---

## Módulo 10 · Tasas sin misterio: TNA, TEM, TEA y tasa real: "La TEA y el interés sobre el interés" (6 min)

- **Id:** `module-10-guide-2` · **Fuentes:** B-04, F-01, F-02
- **Validado (sin cambiar datos):** TEA de una TNA del 36 % a 30 días = 42,59 % (caso F-02 de docs/formulas.md, con test)
- **Ampliación, pendiente del Lic. Kevin Giampieri:** Interés sobre interés y comparar tasas en la misma medida; TNA, TEA y CFT en los documentos de crédito (B-04)
- **Decisión de Lourdes:** ☑ Aprobada (15/11/2026)

**Situación:** Dos ofertas: una dice "TNA 36 %" y otra "TEA 40 %". La segunda parece más alta. ¿Lo es?

**Objetivo:** Al terminar vas a poder pasar una TNA a TEA y comparar dos tasas expresadas de forma distinta.

**Para empezar**

**¿Sabes por qué la TEA suele ser más alta que la TNA?**

- Sí: _Bien. En esta guía lo ponemos en números._
- No: _Es una de las dudas más comunes. En esta guía lo vemos paso a paso._

### Interés sobre interés

Si renuevas un plazo fijo cada 30 días con los intereses incluidos, el mes siguiente ganas interés también sobre esos intereses. La **TEA** mide eso: lo que rinde en un año **con capitalización**. La **TNA** no lo incluye.

### Compara la misma tasa

Para comparar dos ofertas, pásalas a la misma medida: **TEA = (1 + TNA × d ÷ 365)^(365 ÷ d) − 1**, con **d** los días de cada plazo. Y en un crédito, compara el **CFT**, que además suma comisiones y cargos.

### Ejemplo resuelto: TNA del 36 % a 30 días

1. Tasa de 30 días: 36 % × 30 ÷ 365 = 2,96 %.
2. Renovando 12,17 veces en el año (365 ÷ 30): 1,0296^12,17 − 1.
3. TEA: 42,59 %.
4. La TNA del 36 % rinde más que una TEA del 40 %, si renuevas cada 30 días.

**Práctica**

**Oferta A: TNA del 36 % renovando cada 30 días. Oferta B: TEA del 40 %. En un año, con los intereses incluidos, ¿cuál rinde más?**

- ✔ La oferta A: su TEA es de 42,59 %: _Correcto. Pasada a TEA, la TNA del 36 % a 30 días da 42,59 %: más que el 40 % de la oferta B._
- ✖ La oferta B: 40 es más que 36: _36 y 40 no se pueden comparar directamente: una es TNA y la otra TEA. Pasada a TEA, la oferta A da 42,59 %._
- ✖ Rinden lo mismo: _No: pasada a TEA, la oferta A da 42,59 %, más que el 40 % de la B._

**Para tu vida:** la próxima tasa que veas, fíjate si es TNA o TEA, y pásala a la misma medida antes de comparar. Pruébalo en la herramienta "Tasa real".

---

## Módulo 11 · Plazo fijo tradicional, plazo fijo UVA y fondos money market: "El plazo fijo UVA, paso a paso" (7 min)

- **Id:** `module-11-guide-2` · **Fuentes:** B-01, B-03, F-08, F-09
- **Validado (sin cambiar datos):** UVA ajustado por CER, no obligatorio desde 2025, condiciones de cada entidad (B-03); Fórmulas del plazo fijo tradicional y UVA (docs/formulas.md, F-08 y F-09)
- **Ampliación, pendiente del Lic. Kevin Giampieri:** Ejemplo de 180 días con inflación baja: UVA $ 1.098.835,59 y tradicional $ 1.177.534,25 (calculado con las fórmulas F-08 y F-09); Con inflación alta suele ganar el UVA y con baja, el tradicional: lectura didáctica del escenario
- **Decisión de Lourdes:** ☑ Aprobada (15/11/2026)

**Situación:** El plazo fijo UVA promete "ganarle a la inflación". ¿Siempre le gana al tradicional?

**Objetivo:** Al terminar vas a poder calcular, en un escenario, cuánto da un plazo fijo UVA y compararlo con uno tradicional.

**Para empezar**

**¿Hiciste alguna vez un plazo fijo UVA?**

- Sí: _Bien. En esta guía vemos cómo se calcula y cuándo conviene._
- No: _En esta guía vemos cómo funciona antes de decidir._

### Cómo funciona

El capital se expresa en **UVA**, que se actualiza por el **CER**, un índice que sigue a la inflación con algo de **rezago**. Al vencimiento, el capital ajustado suma una **tasa adicional** chica. Desde 2025, los bancos **no están obligados** a ofrecerlo: el plazo mínimo y la precancelación dependen de cada entidad.

### Depende del escenario

Con **inflación alta**, el UVA suele terminar con más pesos que el tradicional. Con **inflación baja**, puede pasar lo contrario. Como el plazo es más largo, también importa la **liquidez**: el dinero queda inmovilizado más tiempo.

### Ejemplo resuelto: 180 días con inflación baja

1. Monto: $ 1.000.000 a 180 días. Inflación del escenario: 1,5 % mensual. Tasa adicional del UVA: 1 % (valores de ejemplo).
2. UVA, versión didáctica: $ 1.000.000 × 1,015^6 × (1 + 1 % × 180 ÷ 365) = $ 1.098.835,59.
3. Tradicional con TNA del 36 %: $ 1.000.000 × (1 + 36 % × 180 ÷ 365) = $ 1.177.534,25.
4. En este escenario de inflación baja, el tradicional termina con más pesos. Con inflación alta, el resultado se invierte.

**Práctica**

**El plazo fijo UVA siempre termina con más pesos que el tradicional.**

- Respuesta: Falso
- ✔ Porque depende de la inflación del período: con inflación baja puede ganar el tradicional
- ✖ Porque el UVA no tiene tasa
- Correcta: _Correcto. El UVA sigue a la inflación: con inflación alta suele ganar, y con inflación baja puede ganar el tradicional._
- Incorrecta: _Es falso: el resultado depende de la inflación del período. Con inflación baja, el tradicional puede terminar con más pesos._

**Para tu vida:** pregunta en tu banco si ofrece plazo fijo UVA, con qué plazo mínimo y si se puede precancelar, y compáralo con el tradicional en la herramienta "Plazo fijo tradicional o UVA".

---

## Módulo 17 · Billeteras virtuales y fintech: "Verificar antes de confiar" (6 min)

- **Id:** `module-17-guide-2` · **Fuentes:** B-12, B-19, B-21, B-27
- **Validado (sin cambiar datos):** nada
- **Ampliación, pendiente del Lic. Kevin Giampieri:** Registro de PSP y listado de entidades financieras del BCRA (B-19); Registro Público de Agentes de la CNV (B-21); Registro de PSAV: la inscripción no implica aval ni garantía (B-27); Leyenda legal de las billeteras de pago (B-12)
- **Decisión de Lourdes:** ☑ Aprobada (15/11/2026)

**Situación:** Una app nueva te ofrece hacer rendir tu dinero y dice estar "aprobada". ¿Cómo sabes si es cierto?

**Objetivo:** Al terminar vas a poder identificar en qué registro oficial verificar una billetera, un bróker o un servicio cripto, y qué significa estar inscripto.

**Para empezar**

**¿Verificaste alguna vez una app financiera en un registro oficial?**

- Sí: _Muy bien. Esta guía te ayuda a saber qué registro mirar en cada caso._
- No: _Es lo más común. En esta guía vemos dónde se hace, en pocos pasos._

### Cada tipo, su registro

Una billetera con **CVU** se busca en el **registro de proveedores de servicios de pago** del BCRA. Un banco o compañía financiera, en el **listado de entidades financieras** del BCRA. Un bróker, en el **Registro Público de Agentes** de la CNV. Un servicio con criptoactivos, en el **registro de PSAV** de la CNV.

### Qué significa estar inscripto

Estar inscripto es una condición para operar, **no un aval**: la CNV aclara que la inscripción de un PSAV no implica que recomiende ni garantice sus servicios. Mira también la **leyenda legal** de la app: una billetera de pago debe aclarar que sus fondos no tienen la garantía de los depósitos.

### Ejemplo resuelto: una billetera nueva

1. La app te da un CVU: es una cuenta de pago.
2. Buscas su nombre en el registro de proveedores de servicios de pago del BCRA.
3. Lees la leyenda legal: dice que ofrece servicios de pago y que los fondos no tienen la garantía de los depósitos.
4. Si la cuenta "rinde", revisas en los términos si el dinero va a un fondo money market.

**Práctica**

**Una app para comprar criptoactivos dice estar "inscripta en la CNV". ¿Qué significa?**

- ✔ Que figura en el registro de PSAV: es una condición para operar, no una garantía: _Correcto. Puedes verificarla en el registro de PSAV de la CNV, pero la inscripción no implica que la CNV recomiende ni garantice sus servicios._
- ✖ Que la CNV recomienda sus servicios: _No: la CNV aclara que la inscripción de un PSAV no implica que recomiende, avale ni garantice sus servicios._
- ✖ Que tu dinero tiene la garantía de los depósitos: _No: los servicios con criptoactivos no tienen la garantía de los depósitos._

**Para tu vida:** elige una app financiera que uses y búscala en el registro que le corresponde. En Aprender, la ficha "Billeteras y fintech en Argentina" te dice cuál es.

---
