# Tanda 4 del paso 27: guías para revisar

> Borradores de `src/data/guides-drafts.json`, generados con `node scripts/guides-review.mjs 4`. **No se muestran en la app** hasta que Lourdes los apruebe; las ampliaciones quedan marcadas para el Lic. Kevin Giampieri (D-276).

Cómo revisar: marca en cada guía "Aprobada", "Con cambios" (y cuáles) o "No va". Lo validado viene del taller o de la presentación y no cambia datos; las ampliaciones son lo nuevo.

## Módulo 12 · Ahorrar e invertir no son lo mismo: "Empezar antes pesa más" (6 min)

- **Id:** `module-12-guide-2` · **Fuentes:** A-39, A-55, F-19
- **Validado (sin cambiar datos):** El tiempo es el factor más potente del interés compuesto (A-39); USD 200 por mes al 12 % anual durante 33 años ≈ USD 1.008.712,49 (A-55, caso F-19 de docs/formulas.md, con test)
- **Ampliación, pendiente del Lic. Kevin Giampieri:** Fórmula del valor futuro de aportes mensuales de la spec (sección 5, F-19) explicada paso a paso; Comparación de empezar diez años después: USD 291.694,51 con 276 meses, calculado a mano con la misma fórmula; Práctica con USD 100 por mes al 1 % mensual durante 12 meses = USD 1.268,25, calculado a mano
- **Decisión de Lourdes:** ☐ Aprobada · ☐ Con cambios · ☐ No va

**Situación:** Dos personas aportan USD 200 por mes con la misma tasa de ejemplo. Una empieza diez años antes que la otra. ¿Cuánta diferencia puede hacer una década?

**Objetivo:** Al terminar vas a poder calcular el valor futuro de aportes mensuales y explicar por qué el tiempo pesa más que el monto.

**Para empezar**

**¿Hoy apartas un monto fijo todos los meses?**

- Sí: _Bien. En esta guía ves cuánto puede crecer ese hábito con el tiempo._
- A veces: _Es un buen comienzo. La regularidad es lo que más ayuda al interés compuesto._
- No: _Ninguna culpa: en esta guía ves por qué empezar con poco ya suma._

### Aportar todos los meses

Cuando aportas un monto fijo cada mes, cada aporte empieza a generar interés desde ese mes. El total se calcula con el **valor futuro de aportes**: **VF = a × ((1 + r) ^ n − 1) ÷ r**, donde **a** es el aporte, **r** la tasa mensual y **n** la cantidad de meses.

### El tiempo es el factor más potente

El **interés compuesto** hace que los intereses también generen intereses. Por eso los últimos años son los que más crecen, y empezar antes pesa más que aportar más. Son **escenarios**: una tasa de ejemplo no es una promesa, y los rendimientos pasados no garantizan rendimientos futuros.

### Ejemplo resuelto: la misma cuota, diez años menos

1. Aportes de USD 200 por mes, con una tasa de ejemplo del 12 % anual (1 % por mes).
2. Durante 33 años (396 meses): aportas USD 79.200 y el total llega a USD 1.008.712,49.
3. Empezando diez años después, durante 23 años (276 meses): aportas USD 55.200 y el total llega a USD 291.694,51.
4. Con USD 24.000 más de aportes, quien empezó antes termina con USD 717.017,98 más: esa diferencia es tiempo.

**Práctica**

**Aportas USD 100 por mes durante 12 meses con una tasa de ejemplo del 1 % mensual. ¿Con cuánto terminas? (VF = a × ((1 + r) ^ n − 1) ÷ r)**

- Respuesta: 1268.25 (tolerancia 1.00)
- Correcta: _Correcto. 100 × (1,01^12 − 1) ÷ 0,01 = USD 1.268,25: aportaste USD 1.200 y el resto es interés._
- Incorrecta: _Aplica la fórmula: 100 × (1,01^12 − 1) ÷ 0,01 = USD 1.268,25. Tus aportes suman USD 1.200 y el resto es interés._

**Para tu vida:** en la herramienta "Interés compuesto y aportes periódicos", prueba el mismo aporte mensual empezando hoy y empezando dentro de cinco años, y compara.

---

## Módulo 13 · Tu perfil de inversor y cómo elegir un bróker registrado en la CNV: "Tu perfil de inversor" (6 min)

- **Id:** `module-13-guide-2` · **Fuentes:** A-54, B-20
- **Validado (sin cambiar datos):** Pasos para abrir una cuenta: elegir bróker, validar identidad, test de inversor (conservador, moderado o agresivo), fondear (A-54); Los agentes deben informar sus costos antes de operar (B-20)
- **Ampliación, pendiente del Lic. Kevin Giampieri:** Qué mide el test: horizonte, objetivo y caída tolerada; Descripción de cada perfil y la idea de que el perfil depende del objetivo y del plazo; Ejemplo con Mariana y práctica de clasificar respuestas; el perfil nunca se traduce en una cartera (1.2, D-67)
- **Decisión de Lourdes:** ☐ Aprobada · ☐ Con cambios · ☐ No va

**Situación:** Al abrir una cuenta en un bróker te piden completar un test. ¿Para qué sirve y qué dice de ti?

**Objetivo:** Al terminar vas a poder explicar para qué sirve el test de perfil de inversor y reconocer qué rasgos describen a cada perfil.

**Para empezar**

**¿Hiciste alguna vez un test de perfil de inversor?**

- Sí: _Bien. En esta guía ves qué mide cada pregunta._
- No: _Es parte de abrir una cuenta. En esta guía ves para qué sirve._

### Para qué sirve el test

Abrir una cuenta en un bróker tiene cuatro pasos: elegir el bróker, validar tu identidad, completar el **test de perfil de inversor** y fondear la cuenta. El test pregunta por tu **horizonte** (cuándo vas a necesitar el dinero), tu **objetivo** y **cuánta caída tolerarías** sin vender. Con eso, el agente sabe qué tipo de productos se ajustan a ti.

### Tres perfiles

El resultado suele ser **conservador** (priorizas no perder y necesitas el dinero pronto), **moderado** (aceptas algunas caídas a cambio de más crecimiento en unos años) o **agresivo** (toleras caídas fuertes porque inviertes a largo plazo). Un perfil no es una recomendación ni una cartera: es una descripción que cambia si cambia tu situación. Y antes de operar, el agente debe informarte sus costos.

### Ejemplo resuelto: la misma persona, dos momentos

1. Mariana junta para mudarse en un año: necesita ese dinero pronto y no quiere que baje.
2. Para ese objetivo, sus respuestas describen un perfil conservador.
3. Con su fondo de emergencia armado, separa otro dinero para dentro de 15 años y aceptaría caídas en el camino.
4. Para ese otro objetivo, sus respuestas se parecen más a un perfil moderado o agresivo. El perfil depende del objetivo y del plazo.

**Práctica**

**Clasifica cada respuesta según el perfil que describe.**

- Conservador: Necesito el dinero en seis meses y no quiero que baje, Si cae un 5 %, vendo todo
- Moderado: Acepto algunas caídas a cambio de más crecimiento en 3 a 5 años, Combino algo seguro con algo que puede variar
- Agresivo: Invierto para dentro de 15 años y puedo esperar si baja un 30 %, Busco el mayor crecimiento posible a largo plazo, aunque varíe mucho
- Correcta: _Correcto. El plazo y la caída que toleras son lo que más pesa: plazo corto y poca tolerancia es conservador; plazo largo y mucha tolerancia, agresivo._
- Incorrecta: _Mira el plazo y la caída que toleras. Conservador: dinero pronto y sin caídas. Moderado: algunas caídas en 3 a 5 años, una combinación. Agresivo: 15 años o más, tolerando caídas fuertes._

**Para tu vida:** haz el test de perfil de inversor de Alcancía. Es educativo: te muestra qué rasgos tienes, sin recomendarte ninguna inversión.

---

## Módulo 14 · Mercado de capitales: "Diversificar sin adivinar" (6 min)

- **Id:** `module-14-guide-2` · **Fuentes:** A-43, A-44, A-45, B-25
- **Validado (sin cambiar datos):** Qué siguen el Nasdaq 100, el Dow Jones y el MSCI ACWI (A-43, A-44, A-45); Los FCI son patrimonios de los cuotapartistas, regulados por la CNV (B-25)
- **Ampliación, pendiente del Lic. Kevin Giampieri:** Diversificar como repartir para que una caída puntual pese poco, y que el riesgo de mercado no desaparece; Ejemplo y práctica con caídas de una empresa entre diez, con valores de ejemplo calculados a mano (USD 950 y USD 940)
- **Decisión de Lourdes:** ☐ Aprobada · ☐ Con cambios · ☐ No va

**Situación:** Una empresa que parecía segura cae a la mitad en una semana. Si todo tu dinero estaba ahí, perdiste la mitad. ¿Y si estaba repartido?

**Objetivo:** Al terminar vas a poder calcular el efecto de una caída en una inversión concentrada y en una diversificada, y explicar qué hace un fondo o un ETF que replica un índice.

**Para empezar**

**Si tuvieras que invertir hoy, ¿pondrías todo en una sola empresa?**

- Sí, en la que mejor conozco: _Es una intuición común. En esta guía ves qué pasa si esa empresa cae._
- No, lo repartiría: _Bien. En esta guía lo ponemos en números._
- No lo sé: _En esta guía ves la diferencia con un ejemplo._

### No poner todo en un solo lugar

**Diversificar** es repartir el dinero entre muchos activos para que el problema de uno pese poco en el total. No sirve para adivinar cuál va a subir: sirve para que ninguna caída puntual decida todo.

### Fondos e índices

Un **fondo común de inversión (FCI)** reúne el dinero de muchas personas y lo invierte en varios activos; lo regula la CNV. Un **ETF** que replica un índice, como el **S&P 500**, el **Nasdaq 100**, el **Dow Jones** o el **MSCI ACWI**, compra todas las empresas de ese índice. Diversificar reduce el peso de cada empresa, pero **el riesgo del mercado no desaparece**: si cae todo, cae también.

### Ejemplo resuelto: USD 1.000, una empresa cae a la mitad

1. Concentrado: USD 1.000 en una sola empresa. Cae 50 %: te quedan USD 500.
2. Diversificado: USD 100 en cada una de 10 empresas. La misma empresa cae 50 % y las otras nueve no cambian.
3. Esa parte pasa de USD 100 a USD 50; las otras suman USD 900. Total: USD 950.
4. La misma caída te cuesta USD 500 en un caso y USD 50 en el otro (valores de ejemplo).

**Práctica**

**Repartes USD 1.000 en partes iguales entre 10 empresas. Una cae 60 % y las demás no cambian. ¿Cuánto vale tu inversión?**

- Respuesta: 940 (tolerancia 1.00)
- Correcta: _Correcto. La empresa que cayó pasa de USD 100 a USD 40, y las otras nueve suman USD 900: USD 940._
- Incorrecta: _Cada empresa tiene USD 100. La que cae 60 % queda en USD 40; las otras nueve suman USD 900. Total: USD 940._

**Para tu vida:** cuando veas un instrumento, pregúntate cuántos activos tiene adentro. Si es uno solo, todo depende de él.

---

## Módulo 15 · CEDEARs: "Lo que hay que saber antes de comprar un CEDEAR" (7 min)

- **Id:** `module-15-guide-2` · **Fuentes:** B-22, B-31, B-32, B-34, B-36, F-20
- **Validado (sin cambiar datos):** Fórmula del precio teórico y caso de partida de $ 45.000 (B-36, caso F-20 de docs/formulas.md, con test); Los dividendos se cobran en dólares (B-32); los ratios pueden cambiar (B-31); acreditación en el día o a 24 horas (B-34); tenencia en la subcuenta comitente (B-22)
- **Ampliación, pendiente del Lic. Kevin Giampieri:** Efecto de una baja del tipo de cambio: 600 ÷ 20 × 1.350 = $ 40.500, calculado a mano; Ejemplo de fuentes que se compensan: 540 ÷ 20 × 1.650 = $ 44.550, calculado a mano
- **Decisión de Lourdes:** ☐ Aprobada · ☐ Con cambios · ☐ No va

**Situación:** La acción de una empresa no se movió en un mes, pero tu CEDEAR vale menos. ¿Qué pasó?

**Objetivo:** Al terminar vas a poder calcular el efecto de una baja del tipo de cambio en un CEDEAR y explicar cómo se cobran sus dividendos y cuándo se acredita una compra.

**Para empezar**

**¿Recuerdas de qué dos cosas depende el precio de un CEDEAR en pesos?**

- Sí: _Bien. Ahora vemos qué pasa cuando una sube y la otra baja._
- No del todo: _Del precio del activo en dólares y del tipo de cambio implícito. Lo repasamos con números._

### El tipo de cambio también puede bajar

Precio teórico ≈ **precio del activo en dólares ÷ ratio × tipo de cambio implícito**. Si el tipo de cambio baja, el CEDEAR baja aunque la acción no cambie. Y las dos fuentes pueden moverse en direcciones opuestas. Además, el precio real puede tener una **prima o un descuento** por oferta y demanda, y el **ratio** puede cambiar, por ejemplo por un split: verifícalo siempre en el listado de BYMA con su fecha.

### Dividendos y acreditación

Si la empresa paga dividendos, los cobras **en dólares**, aunque hayas comprado en pesos. Al comprar, eliges el plazo: **contado inmediato** (se acredita en el día) o **24 horas** (el día hábil siguiente). Lo que compras queda en tu subcuenta comitente en Caja de Valores.

### Ejemplo resuelto: una sube y la otra baja

1. Partida: acción USD 600, ratio de ejemplo 20:1, tipo de cambio implícito de ejemplo $ 1.500. Precio: $ 45.000.
2. La acción baja 10 %, a USD 540, y el tipo de cambio sube 10 %, a $ 1.650.
3. Nuevo precio: 540 ÷ 20 × 1.650 = $ 44.550.
4. En pesos casi no cambió, pero por dos motivos que se compensaron. Mirar solo el precio en pesos no te dice qué pasó.

**Práctica**

**La acción sigue en USD 600 y el ratio de ejemplo es 20:1, pero el tipo de cambio implícito baja de $ 1.500 a $ 1.350. ¿Cuál es el nuevo precio teórico del CEDEAR en pesos?**

- Respuesta: 40500 (tolerancia 1.00)
- Correcta: _Correcto. 600 ÷ 20 × 1.350 = $ 40.500: bajó un 10 % aunque la acción no se movió._
- Incorrecta: _Divide el precio por el ratio y multiplica por el nuevo tipo de cambio: 600 ÷ 20 × 1.350 = $ 40.500._

**Para tu vida:** en la herramienta "CEDEAR: de la acción al precio en pesos", baja el tipo de cambio sin tocar la acción y mira cuánto cambia el precio.

---
