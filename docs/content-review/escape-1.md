# Escape room "Tu primer sueldo": salas para revisar (versión inicial)

> Adaptación del escape room del taller "Del aula al primer trabajo" (paso 28, D-304). Las cinco salas en su versión inicial, con tú, el vocabulario de la app y un tipo de evaluación distinto por candado. Los montos son los del original. Las versiones intermedia y avanzada llegan en la segunda tanda.

Cómo revisar: marca en cada sala "Aprobada", "Con cambios" (y cuáles) o "No va".

## Sala 1 · Recepción: "El recibo" (luz de Claridad)

- **Decisión de Lourdes:** ☐ Aprobada · ☐ Con cambios · ☐ No va

**Escena:** En el escritorio de recepción quedó tu recibo de sueldo, con una taza de café volcada encima. Al lado hay una nota de Recursos Humanos.

**Objetos**

- Recibo de sueldo: Andina Servicios S.A. · Recibo de ejemplo · Mes 1 · Sueldo básico (30 días): $ 1.000.000,00 · Sueldo bruto: $ 1.000.000,00 · Jubilación: 11 % · Ley 19.032 (PAMI): 3 % · Obra social: 3 % · Sueldo neto: Tapado por una mancha de café · Contribuciones de la empresa, aparte: seguridad social 18 % ($ 180.000) y obra social patronal 6 % ($ 60.000). Las paga la empresa además de tu sueldo; no se descuentan de lo que cobras.
- Nota de Recursos Humanos: Recursos Humanos · Te damos la bienvenida al equipo. / Los descuentos del trabajador suman 17 %. / Cualquier duda, pasa por la oficina.

**Candado**

**¿Cuál es tu sueldo neto?** (numeric)

- Respuesta: 830000

**Errores esperados**

- 1000000: _Ese es el bruto. El neto es lo que te queda después de los descuentos._
- 170000: _Eso es lo que te descuentan. ¿Cuánto te queda a ti?_
- 890000, 970000, 860000: _Revisa: ¿sumaste los tres descuentos?_
- 760000: _Restaste las contribuciones de la empresa. Esas las paga la empresa aparte: no salen de tu sueldo._
- 1240000: _Eso es lo que le cuesta tu trabajo a la empresa. Tú cobras menos que el bruto, no más._

**Pistas:** Bruto menos descuentos es igual a neto. / El 17 % de $ 1.000.000 es $ 170.000.

**Explicación:** El sueldo bruto es lo que ganas. El neto es lo que cobras después de tus aportes: jubilación (11 %), Ley 19.032 o PAMI (3 %) y obra social (3 %). Según el convenio de tu actividad, puede haber además otros aportes. Y aparte de tu sueldo, la empresa paga contribuciones que no se te descuentan.

**Reflexión:** ¿Qué dato del recibo te conviene revisar todos los meses, y por qué?

---

## Sala 2 · Oficina: "El presupuesto" (luz de Orden)

- **Decisión de Lourdes:** ☐ Aprobada · ☐ Con cambios · ☐ No va

**Escena:** En el escritorio de la oficina hay una lista con tus gastos del mes. Pegado en la taza, un post-it.

**Objetos**

- Lista de gastos del mes: Mis gastos del mes · Alquiler compartido: $ 250.000 · Carga de la tarjeta de transporte: $ 35.000 · Plan básico de celular: $ 18.000 · Salida del sábado: $ 40.000 · Zapatillas de marca para estrenar: $ 100.000 · Café de paso todos los días: Mira el post-it
- Post-it de la taza: Tú, ayer · Café de paso: $ 3.000. / Todos los días hábiles (22 al mes). / ¿Cuánto es por mes?

**Desafío previo**

**Antes de abrir el candado, clasifica cada gasto como necesidad o deseo.** (categorize)

- Necesidad: Alquiler compartido, Carga de la tarjeta de transporte, Plan básico de celular
- Deseo: Salida del sábado, Zapatillas de marca para estrenar, Café de paso todos los días

**Candado**

**¿Cuánto se va por mes en café?** (numeric)

- Respuesta: 66000

**Errores esperados**

- 3000: _Ese es un solo café. ¿Y en el mes?_
- 90000, 93000: _Contaste todos los días del mes. El post-it dice días hábiles._
- 15000: _Eso es lo de una semana hábil. El candado pide el mes._

**Pistas:** Multiplica el precio del café por la cantidad de días. / 3.000 × 22.

**Explicación:** Los gastos hormiga son gastos chicos y repetidos: un café por día parece poco, pero son $ 66.000 por mes, casi el 8 % de un sueldo neto de $ 830.000. Para repartir el ingreso, una referencia es la regla 50/30/20: la mitad para lo esencial, un 30 % para deseos y un 20 % para ahorro e inversión. Es un punto de partida, no una obligación.

**Reflexión:** ¿Qué gasto hormiga tienes tú, o alguien que conoces, y cuánto suma en un mes?

---

## Sala 3 · Caja: "La tarjeta" (luz de Prudencia)

- **Decisión de Lourdes:** ☐ Aprobada · ☐ Con cambios · ☐ No va

**Escena:** Sobre el mostrador de la caja quedaron el resumen de tu tarjeta y dos folletos del mismo celular en 12 cuotas.

**Objetos**

- Resumen de la tarjeta: Resumen de tu tarjeta de crédito · Saldo total a pagar: $ 200.000 · Pago mínimo: $ 20.000 · Vencimiento: Día 10 · Si pagas menos que el saldo total, la diferencia se financia y genera intereses.
- Folleto A: Oferta A · 12 cuotas de $ 26.000 · Precio de contado: $ 240.000 · Comisión de otorgamiento: $ 30.000 · Seguro: $ 2.000 por mes · TNA: 47 % · CFTEA: 157 %
- Folleto B: Oferta B · 12 cuotas de $ 28.000 · Precio de contado: $ 240.000 · Comisiones y seguros: No tiene · TNA: 67 % · CFTEA: 92 %

**Candado**

**¿Qué dato tienes que comparar entre las dos ofertas para saber cuál cuesta menos?** (single)

- ✔ El costo financiero total (CFT o CFTEA): _Abriste el candado. El CFT suma intereses, comisiones y seguros: por eso la oferta B, con cuota más alta, termina siendo más barata._
- ✖ La tasa nominal anual (TNA): _La TNA no incluye todos los costos. Busca el dato que suma todo._
- ✖ El valor de la cuota: _La cuota más baja no siempre es la más barata. Busca el dato que suma todos los costos._

**Pistas:** Búscalo al lado de la tasa en los dos folletos: es el dato que suma todos los costos. / Es el costo financiero total.

**Explicación:** Si pagas solo el mínimo, el resto del resumen queda financiado: genera intereses, más IVA sobre esos intereses, y aparece en el resumen del mes siguiente. En las compras en cuotas, la cuota más baja no siempre es la más barata. Para comparar, mira el costo financiero total (CFT o CFTEA): suma intereses, comisiones y seguros.

**Reflexión:** Antes de comprar algo en cuotas, ¿qué vas a mirar a partir de hoy?

---

## Sala 4 · Bóveda: "La inflación" (luz de Previsión)

- **Decisión de Lourdes:** ☐ Aprobada · ☐ Con cambios · ☐ No va

**Escena:** En la caja fuerte está el sobre donde guardaste dinero para las zapatillas que anotaste en el presupuesto. Al lado, la etiqueta de precio.

**Objetos**

- Sobre de ahorro: Para las zapatillas · En el sobre: $ 100.000 · Lo guardé el mes pasado, justo lo que costaban.
- Etiqueta de precio: Zapatillas de marca · Mes pasado: $ 100.000 · Este mes: Subieron 10 %

**Desafío previo**

**Antes de abrir el candado, ordena los pasos para saber cuánto te falta.** (ordering)

1. Mirar cuánto subió el precio
2. Calcular el precio nuevo
3. Restarle lo que tienes en el sobre
4. Planificar cómo juntar la diferencia

**Candado**

**¿Cuánto dinero te falta ahora para las zapatillas?** (numeric)

- Respuesta: 10000

**Errores esperados**

- 110000: _Ese es el precio nuevo. ¿Cuánto te falta con lo que tienes en el sobre?_
- 0: _Los precios subieron, pero tu sobre no._
- 90000: _Calculaste un 10 % menos. El precio subió, no bajó._

**Pistas:** Calcula primero el precio nuevo. / $ 100.000 más el 10 % es $ 110.000.

**Explicación:** Con inflación, el dinero quieto pierde poder de compra: el sobre sigue teniendo $ 100.000, pero ahora alcanza para menos. Ahorrar es guardar; invertir es poner el dinero en activos que pueden generar más, con algo de riesgo. Para el fondo de emergencia, de 3 a 6 meses de gastos básicos, lo primero es la liquidez.

**Reflexión:** ¿Para qué te gustaría ahorrar con tu primer sueldo, y dónde guardarías ese dinero?

---

## Sala 5 · Salida: "Los mensajes" (luz de Seguridad)

- **Decisión de Lourdes:** ☐ Aprobada · ☐ Con cambios · ☐ No va

**Escena:** Ya casi estás afuera. Tu celular vibra: llegaron cuatro mensajes. Uno solo es de verdad.

**Objetos**

- Tu celular: Mensajes nuevos · SMS · AVISO-CUENTA: Tu cuenta fue bloqueada. Ingresa YA en un enlace acortado para evitar la baja definitiva. · WhatsApp · Sofi (número nuevo): Te llegó un código de 6 números por SMS, ¿me lo pasas? Es para anotarte en un sorteo, que se termina hoy. · Correo · premios de un dominio desconocido: Ganaste $ 500.000. Completa tus datos y los de tu tarjeta para cobrar el premio antes de las 18 h. · Aviso de la app · Tu cuenta sueldo: Recibiste una transferencia de $ 830.000 de Andina Servicios S.A. Concepto: sueldo.

**Candado**

**Revisa los cuatro mensajes, uno por uno. ¿Qué haces con cada uno?** (branching)

- SMS: "Tu cuenta fue bloqueada. Ingresa YA en el enlace para evitar la baja definitiva."
  - Toco el enlace para desbloquearla → fell_link
  - No toco el enlace y reviso entrando a la app por mi cuenta → whatsapp
- WhatsApp de Sofi, con un número nuevo: "¿Me pasas el código de 6 números que te llegó? Es para un sorteo."
  - Se lo paso: es una amiga → fell_code
  - No lo comparto y le escribo a Sofi a su número de siempre → mail
- Correo: "Ganaste $ 500.000. Completa tus datos y los de tu tarjeta antes de las 18 h."
  - Completo los datos para cobrar el premio → fell_prize
  - Lo descarto: no participé de ningún sorteo → app
- Aviso de la app: "Recibiste una transferencia de $ 830.000 de Andina Servicios S.A. Concepto: sueldo."
  - Es real: lo confirmo en la app y coincide con mi sueldo → safe
  - Lo borro por las dudas → missed_real
- Resultado `safe`: _Abriste el candado. Las tres estafas te apuraban, te pedían un código o tus datos; el aviso real no te pedía nada y coincidía con tu sueldo._
- Resultado `fell_link`: _El SMS te apura y te manda a un enlace acortado. Ninguna entidad te pide entrar así: se revisa entrando a la app por tu cuenta._
- Resultado `fell_code`: _Con ese código pueden robarte la cuenta. Nadie legítimo te lo pide, ni siquiera alguien conocido desde un número nuevo._
- Resultado `fell_prize`: _Un premio que no pediste y que te pide los datos de tu tarjeta es una estafa._
- Resultado `missed_real`: _Ese aviso era real: no tenía enlaces, no te apuraba, no te pedía nada y coincidía con tu sueldo. No todo mensaje es una estafa._

**Pistas:** Desconfía de la urgencia, de los enlaces y de los pedidos de códigos. / Uno solo es real: no te pide nada y coincide con tu sueldo.

**Explicación:** Nunca compartas códigos de verificación ni claves: ninguna entidad te los pide por mensaje. Desconfía de la urgencia, de los enlaces raros y de los premios que no pediste. Antes de transferir a un alias nuevo, revisa el nombre del titular. Si te pasa algo, avisa enseguida a tu banco o billetera por sus canales oficiales.

**Reflexión:** ¿Qué harías si te llega un mensaje pidiéndote un código?

---
