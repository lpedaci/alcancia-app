# Escape room "Tu primer sueldo": versiones intermedia y avanzada para revisar

> Segunda tanda del paso 28 (D-310). Cada sala suma dos versiones adaptadas de `escape-versiones.js` del original: solo cambian la escena, los objetos, el desafío previo, el candado, los errores esperados, las pistas y la explicación; el resto (lugar, hábito, guía y reflexión) es el de la versión inicial, ya aprobada. Con tú, el vocabulario de la app ("dinero", "deseo", "tarjeta de transporte") y los montos del original. Las preguntas extra del original pasan a ser el desafío previo que enciende el candado.

Para mirar en especial:

- **Cómo se elige la versión:** el original sortea una versión por sala; acá la persona la elige antes de entrar (con la que todavía le falta preseleccionada), así cada insignia depende de una partida y no del azar (D-310).
- **Sala 5 avanzada** nombra a ARCA, como el original, con un dominio falso (`arca-gob-ar.com`) para enseñar a mirar el `.gob.ar`. Si prefieres no nombrar un organismo real, se cambia por "un organismo público".
- **Insignia descargable:** imagen SVG plana con el nombre del juego, la versión y la fecha, sin el nombre ni los datos de la persona.

Cómo revisar: marca en cada versión "Aprobada", "Con cambios" (y cuáles) o "No va".

## Sala 1 · Recepción: "El recibo" (luz de Claridad)

### Intermedia (plata)

- **Decisión de Lourdes:** ☑ Aprobada (16/11/2026) · ☐ Con cambios · ☐ No va

**Escena:** En el escritorio de recepción quedó tu recibo de sueldo, con horas extras y una taza de café volcada encima. Al lado hay una nota de Recursos Humanos.

**Objetos**

- Recibo de sueldo: Andina Servicios S.A. · Recibo de ejemplo · Mes 1 · Sueldo básico (30 días): $ 1.100.000,00 · Horas extras (10 horas): $ 100.000,00 · Sueldo bruto: $ 1.200.000,00 · Jubilación: 11 % · Ley 19.032 (PAMI): 3 % · Obra social: 3 % · Contribuciones de la empresa, aparte: seguridad social 18 % ($ 216.000) y obra social patronal 6 % ($ 72.000). Las paga la empresa además de tu sueldo; no se descuentan de lo que cobras.
- Nota de Recursos Humanos: Recursos Humanos · Te damos la bienvenida al equipo. · Este mes hiciste horas extras: ya están en tu recibo. · Revisa que cada descuento esté bien calculado.

**Candado: ¿Cuál es tu sueldo neto?** (numeric)

- Respuesta: 996000
- Al acertar: _Abriste el candado. $ 1.200.000 − 17 % = $ 996.000._

**Errores esperados**

- 1200000: _Ese es el bruto. El neto es lo que te queda después de los descuentos._
- 204000: _Eso es lo que te descuentan. ¿Cuánto te queda a ti?_
- 913000: _Calculaste el neto solo del básico. Las horas extras también son parte del bruto._
- 1068000, 1032000, 1164000: _Revisa: ¿sumaste los tres descuentos?_
- 912000: _Restaste las contribuciones de la empresa. Esas las paga la empresa aparte: no salen de tu sueldo._

**Pistas:** Primero suma el básico y las horas extras: ese es el bruto. / Los descuentos suman 11 + 3 + 3 = 17 %. El 17 % de $ 1.200.000 es $ 204.000.

**Explicación:** Las horas extras forman parte del sueldo bruto, así que también llevan descuentos: el 17 % de $ 1.200.000 son $ 204.000 y te quedan $ 996.000. Tus aportes son jubilación (11 %), Ley 19.032 o PAMI (3 %) y obra social (3 %). Aparte, la empresa paga contribuciones que no se te descuentan.

### Avanzada (oro)

- **Decisión de Lourdes:** ☑ Aprobada (16/11/2026) · ☐ Con cambios · ☐ No va

**Escena:** En el escritorio de recepción quedó tu recibo de sueldo, con una suma no remunerativa y una taza de café volcada encima. Al lado hay una nota de Recursos Humanos.

**Objetos**

- Recibo de sueldo: Andina Servicios S.A. · Recibo de ejemplo · Mes 1 · Sueldo básico (30 días): $ 1.000.000,00 · Suma no remunerativa (acuerdo) (Fija): $ 100.000,00 · Sueldo bruto: $ 1.000.000,00 · Jubilación: 11 % · Ley 19.032 (PAMI): 3 % · Obra social: 3 % · Contribuciones de la empresa, aparte: seguridad social 18 % ($ 180.000) y obra social patronal 6 % ($ 60.000). Las paga la empresa además de tu sueldo; no se descuentan de lo que cobras.
- Nota de Recursos Humanos: Recursos Humanos · Te damos la bienvenida al equipo. · Este mes cobras una suma no remunerativa por acuerdo. · En tu recibo, esa suma no tiene descuentos.

**Candado: ¿Cuál es tu sueldo neto?** (numeric)

- Respuesta: 930000
- Al acertar: _Abriste el candado. $ 1.000.000 − $ 170.000 + $ 100.000 = $ 930.000._

**Errores esperados**

- 913000: _Le aplicaste los descuentos también a la suma no remunerativa. Esa se cobra entera._
- 830000: _Te faltó sumar la suma no remunerativa: también la cobras._
- 1100000: _Eso es todo lo que figura antes de los descuentos. Todavía falta restarlos._
- 1000000: _Ese es el bruto remunerativo. El neto es lo que te queda después de descontar y sumar lo no remunerativo._
- 170000, 187000: _Eso es lo que te descuentan. ¿Cuánto te queda a ti?_

**Pistas:** Los descuentos se calculan solo sobre el sueldo básico. La suma no remunerativa se cobra entera. / $ 1.000.000 − $ 170.000 + $ 100.000.

**Explicación:** Las sumas no remunerativas se cobran, pero en este recibo no forman parte de la base de los descuentos. Por eso el neto es $ 1.000.000 − $ 170.000 + $ 100.000 = $ 930.000. Ojo con esto: como no llevan aportes, tampoco suman para tu jubilación. Por eso conviene que los aumentos sean remunerativos.

---

## Sala 2 · Oficina: "El presupuesto" (luz de Orden)

### Intermedia (plata)

- **Decisión de Lourdes:** ☑ Aprobada (16/11/2026) · ☐ Con cambios · ☐ No va

**Escena:** En el escritorio de la oficina hay una lista con tus gastos del mes. Pegado en la taza, un post-it.

**Objetos**

- Lista de gastos del mes: Mis gastos del mes · Alquiler compartido: $ 250.000 · Carga de la tarjeta de transporte: $ 35.000 · Plan básico de celular: $ 18.000 · Salida del sábado: $ 40.000 · Zapatillas de marca para estrenar: $ 100.000 · Café y alfajor de la tarde: Mira el post-it
- Post-it de la taza: Tú, ayer · Café: $ 2.500. Alfajor: $ 1.500. · Los dos, todos los días hábiles (22 al mes). · ¿Cuánto es por mes?

**Desafío previo: Antes de abrir el candado, clasifica cada gasto como necesidad o deseo.** (categorize)

- Alquiler compartido: Necesidad
- Carga de la tarjeta de transporte: Necesidad
- Plan básico de celular: Necesidad
- Salida del sábado: Deseo
- Zapatillas de marca para estrenar: Deseo
- Café y alfajor de la tarde: Deseo
- Al acertar: _Bien clasificados. Se encendió el candado._

**Candado: ¿Cuánto se va por mes en café y alfajor?** (numeric)

- Respuesta: 88000
- Al acertar: _Abriste el candado. ($ 2.500 + $ 1.500) × 22 = $ 88.000._

**Errores esperados**

- 4000: _Eso es lo de un solo día. ¿Y en el mes?_
- 55000: _Contaste solo el café. El alfajor también es todos los días._
- 33000: _Contaste solo el alfajor. Súmale el café._
- 120000, 124000: _Contaste todos los días del mes. El post-it dice días hábiles._
- 20000: _Eso es lo de una semana hábil. El candado pide el mes._

**Pistas:** Suma lo que gastas en un día y multiplícalo por los días hábiles. / ($ 2.500 + $ 1.500) × 22.

**Explicación:** Los gastos hormiga son gastos chicos y repetidos: un café y un alfajor por día parecen poco, pero son $ 88.000 por mes, más del 10 % de un sueldo neto de $ 830.000. Para repartir el ingreso, una referencia es la regla 50/30/20: la mitad para lo esencial, un 30 % para deseos y un 20 % para ahorro e inversión. Es un punto de partida, no una obligación.

### Avanzada (oro)

- **Decisión de Lourdes:** ☑ Aprobada (16/11/2026) · ☐ Con cambios · ☐ No va

**Escena:** En el escritorio de la oficina hay una lista con tus gastos del mes. Pegado en la taza, un post-it.

**Objetos**

- Lista de gastos del mes: Mis gastos del mes · Alquiler compartido: $ 250.000 · Carga de la tarjeta de transporte: $ 35.000 · Plan básico de celular: $ 18.000 · Salida del sábado: $ 40.000 · Zapatillas de marca para estrenar: $ 100.000 · Café diario y delivery del sábado: Mira el post-it
- Post-it de la taza: Tú, ayer · Café de paso: $ 3.000, los días hábiles (22 al mes). · Delivery: $ 12.000, cada sábado (4 al mes). · ¿Cuánto suman por mes?

**Desafío previo: Antes de abrir el candado, clasifica cada gasto como necesidad o deseo.** (categorize)

- Alquiler compartido: Necesidad
- Carga de la tarjeta de transporte: Necesidad
- Plan básico de celular: Necesidad
- Salida del sábado: Deseo
- Zapatillas de marca para estrenar: Deseo
- Café diario y delivery del sábado: Deseo
- Al acertar: _Bien clasificados. Se encendió el candado._

**Candado: ¿Cuánto suman por mes tus gastos hormiga?** (numeric)

- Respuesta: 114000
- Al acertar: _Abriste el candado. $ 3.000 × 22 + $ 12.000 × 4 = $ 114.000._

**Errores esperados**

- 66000: _Contaste solo el café. Súmale el delivery de los sábados._
- 48000: _Contaste solo el delivery. Súmale el café de los días hábiles._
- 15000: _Eso es un café y un delivery. ¿Cuánto es en todo el mes?_
- 330000: _Multiplicaste todo por 22. El delivery es solo los sábados._
- 138000, 141000: _Contaste el café todos los días del mes. El post-it dice días hábiles._

**Pistas:** Calcula cada gasto por separado: el café por los días hábiles y el delivery por los sábados. / $ 3.000 × 22 + $ 12.000 × 4.

**Explicación:** Los gastos hormiga son gastos chicos y repetidos. Sumados, el café de los días hábiles y el delivery de los sábados son $ 114.000 por mes, casi el 14 % de un sueldo neto de $ 830.000. Para repartir el ingreso, una referencia es la regla 50/30/20: la mitad para lo esencial, un 30 % para deseos y un 20 % para ahorro e inversión. Es un punto de partida, no una obligación.

---

## Sala 3 · Caja: "La tarjeta" (luz de Prudencia)

### Intermedia (plata)

- **Decisión de Lourdes:** ☑ Aprobada (16/11/2026) · ☐ Con cambios · ☐ No va

**Escena:** Sobre el mostrador de la caja quedaron el resumen de tu tarjeta y dos folletos del mismo celular en 12 cuotas.

**Objetos**

- Resumen de la tarjeta: Resumen de tu tarjeta de crédito · Saldo total a pagar: $ 200.000 · Pago mínimo: $ 20.000 · Vencimiento: Día 10 · Si pagas menos que el saldo total, la diferencia se financia y genera intereses.
- Folleto A: Oferta A · 12 cuotas de $ 26.000 · Precio de contado: $ 240.000 · Comisión de otorgamiento: $ 30.000 · Seguro: $ 2.000 por mes · TNA: 47 % · CFTEA: 157 %
- Folleto B: Oferta B · 12 cuotas de $ 28.000 · Precio de contado: $ 240.000 · Comisiones y seguros: No tiene · TNA: 67 % · CFTEA: 92 %

**Candado: ¿Cuánto pagas en total por el celular con la oferta que más conviene?** (numeric)

- Respuesta: 336000
- Al acertar: _Abriste el candado. La B cuesta 12 × $ 28.000 = $ 336.000; la A, con comisión y seguro, $ 366.000._

**Errores esperados**

- 366000: _Ese es el total de la oferta A, con comisión y seguro. Compara con la B._
- 312000: _Esas son solo las cuotas de la A. La comisión y el seguro también se pagan._
- 240000: _Ese es el precio de contado. La pregunta es por la compra en cuotas._
- 26000, 28000: _Esa es una sola cuota. ¿Y las 12?_

**Pistas:** Suma todo lo que pagas en cada oferta: cuotas, comisión y seguro. / A: 12 × $ 26.000 + $ 30.000 + 12 × $ 2.000 = $ 366.000. B: 12 × $ 28.000.

**Explicación:** La oferta A tiene la cuota más baja, pero con la comisión y el seguro pagas $ 366.000. La B, sin cargos extra, cuesta $ 336.000. El costo financiero total (CFT o CFTEA) resume esa diferencia: compáralo siempre antes de elegir. Si pagas solo el mínimo del resumen, el resto queda financiado: genera intereses, más IVA sobre esos intereses, y aparece en el resumen del mes siguiente.

### Avanzada (oro)

- **Decisión de Lourdes:** ☑ Aprobada (16/11/2026) · ☐ Con cambios · ☐ No va

**Escena:** Sobre el mostrador de la caja quedaron el resumen de tu tarjeta y dos folletos de otro celular en 12 cuotas.

**Objetos**

- Resumen de la tarjeta: Resumen de tu tarjeta de crédito · Saldo total a pagar: $ 200.000 · Pago mínimo: $ 20.000 · Vencimiento: Día 10 · Si pagas menos que el saldo total, la diferencia se financia y genera intereses.
- Folleto A: Oferta A · 12 cuotas de $ 30.000 · Precio de contado: $ 280.000 · Comisión de otorgamiento: $ 40.000 · Seguro: $ 2.500 por mes · TNA: 49 % · CFTEA: 168 %
- Folleto B: Oferta B · 12 cuotas de $ 33.000 · Precio de contado: $ 280.000 · Comisiones y seguros: No tiene · TNA: 71 % · CFTEA: 97 %

**Desafío previo: Antes de abrir el candado: ¿qué incluye el CFT que no incluye la TNA?** (single)

- · Solo el IVA de la compra: _El CFT incluye mucho más que el IVA: suma todos los costos de financiarte._
- ✔ Las comisiones, los seguros y los impuestos, además de los intereses: _Exacto. Se encendió el candado: por eso el CFT es el dato para comparar ofertas._
- · Nada: son el mismo dato con otro nombre: _La TNA es solo la tasa de interés. El CFT suma también comisiones, seguros e impuestos._

**Candado: ¿Cuánto más pagas en total si eliges la oferta A en vez de la B?** (numeric)

- Respuesta: 34000
- Al acertar: _Abriste el candado. A: $ 430.000; B: $ 396.000. La diferencia es $ 34.000._

**Errores esperados**

- 36000: _Comparaste solo las cuotas. La A suma comisión y seguro: calcula el total de cada una._
- 70000: _Esos son los cargos extra de la A. Te falta restar lo que la B te cobra de más en las cuotas._
- 430000: _Ese es el total de la A. La pregunta es la diferencia con la B._
- 396000: _Ese es el total de la B. La pregunta es la diferencia con la A._
- 150000: _Eso es lo que la A te cobra por encima del contado. Compara con la B._

**Pistas:** Calcula el total de cada oferta: cuotas, comisión y seguro. / A: 12 × $ 30.000 + $ 40.000 + 12 × $ 2.500 = $ 430.000. B: 12 × $ 33.000 = $ 396.000.

**Explicación:** Con la cuota más baja, la oferta A termina costando $ 34.000 más que la B: la comisión y el seguro pesan más que la diferencia de cuota. Por eso el CFTEA de la A es mucho más alto. Para comparar compras en cuotas, mira el costo financiero total (CFT o CFTEA): suma intereses, comisiones, seguros e impuestos.

---

## Sala 4 · Bóveda: "La inflación" (luz de Previsión)

### Intermedia (plata)

- **Decisión de Lourdes:** ☑ Aprobada (16/11/2026) · ☐ Con cambios · ☐ No va

**Escena:** En la caja fuerte está el sobre donde guardaste dinero para las zapatillas hace dos meses. Al lado, la etiqueta de precio.

**Objetos**

- Sobre de ahorro: Para las zapatillas · En el sobre: $ 100.000 · Lo guardé hace dos meses, justo lo que costaban.
- Etiqueta de precio: Zapatillas de marca · Hace dos meses: $ 100.000 · Desde entonces: Subieron 10 % el mes pasado y otro 10 % este mes

**Desafío previo: Antes de abrir el candado, ordena los pasos para saber cuánto te falta.** (ordering)

1. Aplicar el aumento del mes pasado
2. Aplicar el aumento de este mes sobre el precio ya aumentado
3. Restarle lo que tienes en el sobre
4. Planificar cómo juntar la diferencia
- Al acertar: _Buen orden. Se encendió el candado._
- Al fallar: _Los aumentos van de a uno: primero el del mes pasado, después el de este mes sobre el precio nuevo. Recién ahí restas y planificas._

**Candado: ¿Cuánto dinero te falta ahora para las zapatillas?** (numeric)

- Respuesta: 21000
- Al acertar: _Abriste el candado. $ 100.000 → $ 110.000 → $ 121.000; te faltan $ 21.000._

**Errores esperados**

- 20000: _Sumaste 10 % + 10 %. El segundo aumento se calcula sobre el precio ya aumentado._
- 10000: _Contaste un solo aumento. Fueron dos._
- 121000, 120000: _Ese es el precio. ¿Cuánto te falta con lo que tienes en el sobre?_
- 0: _Los precios subieron, pero tu sobre no._

**Pistas:** Aplica los aumentos de a uno: primero el del mes pasado y después el de este mes. / $ 100.000 → $ 110.000 → $ 121.000.

**Explicación:** Los aumentos se acumulan: dos subas del 10 % no son un 20 %, sino un 21 %, porque la segunda se aplica sobre el precio ya aumentado. El dinero quieto pierde poder de compra mes a mes. Ahorrar es guardar; invertir es poner el dinero en activos que pueden generar más, con algo de riesgo. Para el fondo de emergencia, de 3 a 6 meses de gastos básicos, lo primero es la liquidez.

### Avanzada (oro)

- **Decisión de Lourdes:** ☑ Aprobada (16/11/2026) · ☐ Con cambios · ☐ No va

**Escena:** En la bóveda está el saldo de la cuenta remunerada donde dejaste el dinero de las zapatillas. Al lado, la etiqueta de precio.

**Objetos**

- Saldo de la cuenta remunerada: Cuenta remunerada · zapatillas · Depositaste: $ 100.000 · La dejé el mes pasado, justo lo que costaban. Este mes rindió 4 %.
- Etiqueta de precio: Zapatillas de marca · Mes pasado: $ 100.000 · Este mes: Subieron 10 %

**Desafío previo: Antes de abrir el candado: si tu cuenta rinde 4 % por mes y los precios suben 10 %, ¿qué pasa con tu ahorro?** (single)

- · Gana poder de compra, porque tienes más pesos: _Tienes más pesos, pero los precios subieron más: con ese dinero compras menos que antes._
- ✔ Pierde poder de compra, aunque crezca en pesos: _Exacto. Se encendió el candado: para no perder, el rendimiento tiene que ser igual o mayor que la inflación._
- · Queda igual, porque el dinero no se toca: _Si los precios suben más que tu rendimiento, el dinero alcanza para menos._

**Candado: ¿Cuánto dinero te falta ahora para las zapatillas?** (numeric)

- Respuesta: 6000
- Al acertar: _Abriste el candado. Tienes $ 104.000 y cuestan $ 110.000: te faltan $ 6.000._

**Errores esperados**

- 10000: _No contaste lo que rindió la cuenta. Ahora tienes más que $ 100.000._
- 14000: _Restaste el rendimiento en vez de sumarlo. La cuenta te hizo ganar dinero._
- 104000: _Eso es lo que tienes ahora en la cuenta. ¿Cuánto te falta?_
- 110000: _Ese es el precio nuevo. ¿Cuánto te falta con lo que tienes en la cuenta?_
- 0: _La cuenta rindió, pero menos de lo que subió el precio._

**Pistas:** Calcula cuánto tienes ahora en la cuenta y cuánto cuestan ahora las zapatillas. / $ 110.000 − $ 104.000.

**Explicación:** Dejar el dinero rindiendo ayudó: te falta menos que con un sobre. Pero si el rendimiento (4 %) es menor que la inflación (10 %), igual pierdes poder de compra. Ahorrar es guardar; invertir es poner el dinero en activos que pueden generar más, con algo de riesgo. Para el fondo de emergencia, de 3 a 6 meses de gastos básicos, lo primero es la liquidez.

---

## Sala 5 · Salida: "Los mensajes" (luz de Seguridad)

### Intermedia (plata)

- **Decisión de Lourdes:** ☑ Aprobada (16/11/2026) · ☐ Con cambios · ☐ No va

**Escena:** Ya casi estás afuera. Tu celular vibra: llegaron cuatro mensajes. Uno solo es de verdad.

**Objetos**

- Tu celular: Mensajes nuevos · SMS, CORREO-AVISO: "Tu paquete quedó retenido. Paga $ 1.850 de tasa en correo-envios-ar.com antes de las 24 h o se devuelve al remitente." · WhatsApp, Soporte Banco (número nuevo): "Detectamos un movimiento raro en tu cuenta. Para protegerte, instala esta app de asistencia y pásanos el número que te aparece." · Notificación de la app, Tu billetera: "Pagaste $ 35.000 con QR en Supermercado Centro. Si no reconoces el pago, revísalo desde la app." · WhatsApp, Dueño del departamento (número nuevo): "Hola, cambié de banco y de número. Este mes transfiéreme el alquiler a este alias nuevo: depto.pago.hoy"

**Candado: Revisa los cuatro mensajes, uno por uno. ¿Qué haces con cada uno?** (branching)

- SMS: "Tu paquete quedó retenido. Paga $ 1.850 de tasa en el enlace antes de las 24 h."
  - ✘ Pago la tasa para que no lo devuelvan → fell_fee
  - ✔ No pago nada desde el enlace y reviso el envío en el sitio oficial del correo → support
- WhatsApp de "Soporte Banco", con un número nuevo: "Instala esta app de asistencia y pásanos el número que te aparece."
  - ✘ La instalo: me están protegiendo → fell_remote
  - ✔ No instalo nada y llamo al banco por su canal oficial → wallet
- Aviso de la app: "Pagaste $ 35.000 con QR en Supermercado Centro. Si no reconoces el pago, revísalo desde la app."
  - ✔ Es real: lo reviso entrando a la app y coincide con mi compra → rent
  - ✘ Lo borro: seguro es una estafa → missed_real
- WhatsApp del dueño del departamento, con un número nuevo: "Este mes transfiéreme el alquiler a este alias nuevo."
  - ✘ Transfiero al alias nuevo → fell_alias
  - ✔ Antes de transferir, lo llamo a su número de siempre para confirmar → safe

Resultados:
- safe: _Abriste el candado. La tasa urgente, la app de asistencia y el cambio de alias eran estafas; el aviso de la billetera era real: no tenía enlaces y te mandaba a revisar desde la app._
- fell_fee: _El SMS te apura y te manda a pagar en un sitio que no es oficial. Las tasas urgentes con enlaces raros son un engaño clásico._
- fell_remote: _Nadie legítimo te pide instalar una app para "protegerte". Así toman el control de tu celular._
- missed_real: _Ese aviso era real: no tenía enlaces, no te apuraba y te mandaba a revisar desde la app. No todo mensaje es una estafa._
- fell_alias: _Un cambio de alias desde un número nuevo hay que confirmarlo por otro medio antes de transferir. Revisa también el nombre del titular que muestra la app._
- Al acertar: _Abriste el candado._

**Pistas:** Desconfía de los pagos urgentes, de las apps que te piden instalar y de los cambios de alias. / Una de las estafas es el cambio de alias del alquiler.

**Explicación:** Nadie legítimo te pide instalar una app para protegerte ni pasarle un código. Si alguien te avisa que cambió de cuenta para cobrarte, confírmalo por otro medio antes de transferir. Y las tasas urgentes con enlaces raros son un engaño clásico. Antes de transferir a un alias nuevo, revisa el nombre del titular que muestra la app. Si te pasa algo, avisa enseguida a tu banco o billetera por sus canales oficiales.

### Avanzada (oro)

- **Decisión de Lourdes:** ☑ Aprobada (16/11/2026) · ☐ Con cambios · ☐ No va

**Escena:** Ya casi estás afuera. Tu celular vibra: llegaron cuatro mensajes. Uno solo es de verdad.

**Objetos**

- Tu celular: Mensajes nuevos · Correo, notificaciones@arca-gob-ar.com: "Tienes una deuda pendiente con ARCA. Regularízala hoy desde este enlace para evitar el embargo de tu sueldo." · Correo, avisos@tubanco.com.ar: "Ingresaste a tu home banking desde un dispositivo nuevo. Si no fuiste tú, llama al número que figura al dorso de tu tarjeta." · WhatsApp, RR. HH. Empleos Ya: "Quedaste en la selección para un trabajo desde casa. Para darte de alta, deposita $ 15.000 de matrícula." · WhatsApp, Número desconocido: "Te mandé $ 40.000 por error, te paso el comprobante. ¿Me los devuelves a este alias? devolucion.ya.ok"

**Candado: Revisa los cuatro mensajes, uno por uno. ¿Qué haces con cada uno?** (branching)

- Correo de notificaciones@arca-gob-ar.com: "Tienes una deuda pendiente. Regularízala hoy desde este enlace para evitar el embargo."
  - ✘ Entro al enlace y regularizo → fell_domain
  - ✔ No toco el enlace: el dominio no termina en .gob.ar. Lo reviso en el sitio oficial → bank
- Correo de avisos@tubanco.com.ar: "Ingresaste desde un dispositivo nuevo. Si no fuiste tú, llama al número del dorso de tu tarjeta."
  - ✔ Es real: si no fui yo, llamo al número del dorso de mi tarjeta → job
  - ✘ Lo borro: seguro es una estafa → missed_real
- WhatsApp de "RR. HH. Empleos Ya": "Quedaste en la selección para un trabajo desde casa. Deposita $ 15.000 de matrícula."
  - ✘ Deposito la matrícula para no perder el puesto → fell_job
  - ✔ No pago: ningún trabajo serio te cobra para contratarte → refund
- WhatsApp de un número desconocido: "Te mandé $ 40.000 por error. ¿Me los devuelves a este alias?"
  - ✘ Le devuelvo el dinero al alias que me pasa → fell_refund
  - ✔ Antes de devolver nada, reviso mi saldo en la app → safe

Resultados:
- safe: _Abriste el candado. El dominio falso, la matrícula y la transferencia "por error" eran estafas; el aviso de ingreso era real: no tenía enlaces ni te pedía datos, y te mandaba a un canal oficial._
- fell_domain: _El correo viene de un dominio falso. Los organismos usan dominios .gob.ar y no te intiman con un enlace._
- missed_real: _Ese aviso era real: no tenía enlaces, no te pedía datos y te mandaba a un canal oficial, el teléfono del dorso de tu tarjeta._
- fell_job: _Ningún trabajo serio te cobra para contratarte._
- fell_refund: _El comprobante de una transferencia por error puede ser falso. Revisa tu saldo en la app antes de devolver nada._
- Al acertar: _Abriste el candado._

**Pistas:** Mira de dónde vienen los correos: los organismos usan dominios .gob.ar. / Una de las estafas te pide dinero para darte un trabajo.

**Explicación:** Los organismos usan dominios .gob.ar y no te intiman por correo con un enlace. Ningún trabajo serio te cobra para contratarte. Y ante una transferencia por error, revisa el saldo en tu app: el comprobante puede ser falso. Un aviso real no te pide datos ni te apura con enlaces: te manda a un canal oficial. Si te pasa algo, avisa enseguida a tu banco o billetera y haz la denuncia.
