# Fórmulas

> Fecha: 12/11/2026 · Segunda tanda del paso 0. Cada fórmula de `src/lib/finance/` está acá con su explicación, supuestos, simplificaciones y 28 casos de prueba. Los casos se calcularon paso a paso y se verificaron con aritmética decimal de 40 dígitos (no con punto flotante); en el paso 3 se convierten en tests de Vitest con los mismos números.

## 0. Convenciones comunes

| Convención | Regla | Por qué |
| --- | --- | --- |
| Tipo numérico | `Decimal` (decimal.js) con precisión de 40 dígitos en todos los cálculos; los montos se guardan como texto (`"150000.00"`) | Spec 3 y 7: nunca `number` de punto flotante para dinero |
| Tasas | Fracciones (`0.36`), se muestran como porcentaje (`36 %`) | Spec 3 |
| Redondeo | **Solo al mostrar**, a centavos, con redondeo comercial (mitad hacia arriba). Excepción: los **movimientos de la billetera** se redondean a centavos al registrarse, porque son "dinero" que se acredita o debita | Una billetera real acredita centavos; un simulador no debe acumular errores de redondeo |
| Mes simulado | 30 días | Coherente con `i_d = TNA × d / 365` y con el motor de la billetera (`wallet-engine.md`) |
| Año | 365 días para tasas | Práctica habitual del sistema financiero argentino para la TNA |
| Inflación de un período de `d` días | `(1 + π_m)^(d / 30) − 1` | Convierte la inflación mensual del escenario a cualquier plazo |
| Escenarios | Inflación mensual baja 1,5 %, media 3 %, alta 6 % (`scenarios.json`), siempre rotulados "Valores de ejemplo" | Spec F4 |

**Tasas de ejemplo de cada escenario (D-110, ajustada por Lourdes el 12/11/2026, pendiente de Kevin):** valores coherentes con la inflación de cada escenario, nunca presentados como actuales. En el escenario bajo, el plazo fijo y el fondo le ganan a la inflación por poco, para que SIM-4 y la misión 4 muestren también una tasa real positiva (caso F-28).

| Tasa de ejemplo (TNA) | Baja (1,5 %) | Media (3 %) | Alta (6 %) |
| --- | --- | --- | --- |
| Cuenta remunerada | 15 % | 30 % | 60 % |
| Fondo money market | 20 % | 31 % | 62 % |
| Plazo fijo tradicional | 22 % | 34 % | 68 % |
| Tasa adicional del plazo fijo UVA | 1 % | 1 % | 1 % |
| Financiación de la tarjeta | 45 % | 60 % | 120 % |
| Préstamo personal | 40 % | 55 % | 110 % |

---

## 1. Tasa del período a partir de la TNA

**Fórmula:** `i_d = TNA × d / 365`

**Explicación:** la tasa nominal anual se "reparte" en partes iguales por día; para un plazo de `d` días se toma la parte que corresponde. Es la tasa que paga un plazo fijo tradicional de `d` días.

**Caso F-01** · TNA 36 %, 30 días
- `i_30 = 0,36 × 30 / 365 = 0,0295890411` → **2,9589 %** en 30 días (se muestra "2,96 % en 30 días").

## 2. Tasa efectiva anual (TEA)

**Fórmula:** `TEA = (1 + TNA × d / 365)^(365 / d) − 1`

**Explicación:** si al vencer cada plazo se renueva todo (capital más interés), el interés también gana interés. La TEA mide cuánto rinde en un año con esas renovaciones.

**Caso F-02** · TNA 36 %, renovando cada 30 días
- `1 + i_30 = 1,0295890411`
- `365 / 30 = 12,1666…`
- `1,0295890411^12,1666… = 1,4258623040`
- **TEA = 42,59 %**. Frase: "Una TNA del 36 % renovada cada 30 días equivale a una TEA del 42,59 %".

**Simplificación:** supone que la tasa no cambia en el año. Se dice en los supuestos.

## 3. Tasa real del período

**Fórmula:** `r = (1 + i) / (1 + π) − 1`, con `i` y `π` del mismo período.

**Explicación:** cuánto cambia tu poder de compra, descontando la inflación. Si `r` es negativa, el dinero creció en pesos pero compra menos.

**Caso F-03** · TNA 36 % a 30 días contra inflación del 3 % mensual (escenario medio)
- `i = 0,0295890411`, `π = 0,03`
- `r = 1,0295890411 / 1,03 − 1 = −0,000398989`
- **Tasa real: −0,04 % en 30 días**. Frase: "En este escenario, el plazo fijo no le gana a la inflación: pierdes poder de compra" (con ícono de tendencia y `warning`, spec 2.1.1).

**Caso F-04** · la misma tasa contra inflación del 1,5 % mensual (escenario bajo)
- `r = 1,0295890411 / 1,015 − 1 = 0,014373` → **+1,44 % en 30 días**.

## 4. Inflación acumulada y poder de compra (SIM-3)

**Fórmulas:**
- Inflación acumulada de `n` meses: `(1 + π_m)^n − 1`
- Poder de compra al final: `M / (1 + π_m)^n`
- Pérdida de poder de compra: `1 − 1 / (1 + π_m)^n`
- Precio futuro de algo que hoy cuesta `M`: `M × (1 + π_m)^n`

**Caso F-05** · $ 100.000, 3 % mensual, 12 meses
- `1,03^12 = 1,4257608868`
- Inflación acumulada: **42,58 %**
- Poder de compra: `100.000 / 1,4257608868` = **$ 70.137,99**
- Pérdida: **29,86 %** (la frase de la spec, "en 12 meses tu dinero compra un 30 % menos", redondea este valor)
- Precio futuro: **$ 142.576,09**

**Caso F-06** · $ 100.000, 6 % mensual, 12 meses
- `1,06^12 = 2,0121964718` → acumulada **101,22 %**; poder de compra **$ 49.696,94**.

**Caso F-07** · verificación contra la calculadora del taller (inflación **anual**, $ 100 a 5 años con 25 % anual)
- `100 / 1,25^5 = 100 / 3,0517578125` = **$ 32,77**. SIM-3 admite inflación anual con la misma fórmula, con `n` en años.

## 5. Plazo fijo tradicional y UVA (SIM-5)

**Tradicional:** `M_final = M × (1 + TNA × d / 365)`

**UVA, versión didáctica:** `M_final = M × (1 + π_m)^(d / 30) × (1 + TNA_adicional × d / 365)`

**Supuestos y simplificaciones (visibles en el panel):**
- La UVA real se ajusta por CER, con rezago respecto de la inflación; acá se aproxima con la inflación del escenario (spec F4, B-03).
- Plazo mínimo, precancelación y disponibilidad del UVA dependen de cada entidad (B-03): son **supuestos editables**, con valores por defecto de 90 días y sin precancelación.
- La tasa mínima del tradicional no se menciona (Q-01).

**Caso F-08** · tradicional, $ 1.000.000, 30 días, TNA 36 %
- Interés: `1.000.000 × 0,0295890411` = $ 29.589,04 → **$ 1.029.589,04**
- En poder de compra con 3 % mensual: `1.029.589,04 / 1,03` = **$ 999.601,01**

**Caso F-09** · UVA, $ 1.000.000, 90 días, inflación 3 % mensual, adicional 1 % TNA
- Ajuste por inflación: `1,03^3 = 1,092727` → $ 1.092.727,00
- Adicional: `1.092.727 × 0,01 × 90 / 365` = $ 2.694,40
- **Total: $ 1.095.421,40**
- Comparación: tradicional a 90 días con TNA 36 % = `1.000.000 × (1 + 0,36 × 90 / 365)` = **$ 1.088.767,12**. En este escenario, el UVA termina con más pesos.

## 6. Cuotas sin interés o contado con descuento (SIM-6)

**Fórmula:** `VP = Σ c / (1 + π_m)^k`, con `k` de 1 a `n` (primera cuota a un mes). Opción configurable: primera cuota hoy, `k` de 0 a `n − 1`.

**Explicación:** una cuota que pagas dentro de varios meses "pesa" menos, porque para entonces el dinero compra menos. Se compara el valor presente de las cuotas con el precio de contado con descuento.

**Caso F-10** · precio $ 120.000 en 12 cuotas de $ 10.000; contado con 15 % de descuento; inflación 3 % mensual
- `VP = 10.000 × (1 − 1,03^−12) / 0,03` = **$ 99.540,04**
- Contado: `120.000 × 0,85` = **$ 102.000,00**
- Conclusión **en ese escenario**: las cuotas cuestan menos en valor presente ($ 2.459,96 menos).

**Caso F-11** · el mismo caso con 1,5 % mensual: `VP` = **$ 109.075,05** → conviene el contado.

**Caso F-12** · 6 % mensual: `VP` = **$ 83.838,44**.

**Caso F-13** · 3 % mensual, primera cuota hoy: `VP` = **$ 102.526,24** → contado apenas más barato. Muestra por qué importa el supuesto de la primera cuota.

## 7. Pago mínimo de la tarjeta (SIM-7)

**Algoritmo (mes a mes, sin consumos nuevos):**
1. `interés = saldo × TNA × 30 / 365`, redondeado a centavos
2. `saldo = saldo + interés`
3. `pago = máx(saldo × mínimo %, piso)`, sin superar el saldo
4. `saldo = saldo − pago`; repetir hasta saldo 0 (corte de seguridad a 600 meses con el aviso "Con estos datos la deuda no se termina de pagar")

**Simplificaciones (visibles):** sin consumos nuevos, sin impuestos (IVA sobre intereses), sin cargos ni seguros. Por eso el **CFT** se pide aparte y se muestra al lado: incluye tasa, comisiones y cargos (B-04) y siempre es mayor que la TNA. La simulación usa la TNA de financiación; el texto explica que el costo real se acerca más al CFT. Piso del pago mínimo por defecto: $ 1.000 (supuesto editable).

**Caso F-14** · saldo $ 100.000, TNA 60 %, mínimo 10 %, piso $ 1.000
- Mes 1: interés `100.000 × 0,60 × 30 / 365` = $ 4.931,51; saldo $ 104.931,51; pago $ 10.493,15; queda $ 94.438,36
- Total: **55 meses**, **$ 83.880,36 de intereses**, $ 183.880,36 pagados en total.
- Pagando el total el primer mes: $ 0 de intereses.

**Caso F-15** · el mismo saldo con TNA 120 %: **237 meses** y **$ 813.271,16 de intereses**.

## 8. Salir de deudas: bola de nieve y avalancha (SIM-9)

**Algoritmo (mes a mes):**
1. A cada deuda con saldo se le suma el interés del mes: `saldo × TNA × 30 / 365` (redondeado a centavos).
2. Presupuesto mensual fijo = suma de los pagos mínimos originales + monto extra. Al saldar una deuda, su mínimo queda en el presupuesto (eso es "el pago liberado se suma a la siguiente").
3. Se paga el mínimo de cada deuda (o su saldo, si es menor).
4. Lo que sobra va a la deuda prioritaria, y si la salda, a la siguiente:
   - **Bola de nieve:** prioridad al menor saldo (A-24 a A-27).
   - **Avalancha:** prioridad a la mayor tasa (A-28, A-29).
5. Corte de seguridad a 600 meses.

**Caso F-16** · datos de A-29 (Tarjeta 150 % · $ 40.000; Financiera 110 % · $ 15.000; Crédito bancario 80 % · $ 200.000). A-29 no trae pagos mínimos ni monto extra; **para el test** se suponen mínimos de $ 4.000, $ 1.500 y $ 10.000 y $ 20.000 extra por mes (no es contenido: solo datos de prueba).

| Método | Orden | Primera deuda saldada | Meses hasta quedar sin deudas | Intereses totales |
| --- | --- | --- | --- | --- |
| Avalancha | Tarjeta → Financiera → Crédito bancario | Tarjeta, mes 2 | 11 | **$ 109.817,08** |
| Bola de nieve | Financiera → Tarjeta → Crédito bancario | Financiera, mes 1 | 11 | **$ 111.507,88** |

Conclusión con la plantilla de la spec: "La avalancha te ahorra $ 1.690,80 en intereses; la bola de nieve te da la primera deuda saldada 1 mes antes".

**Caso F-17** · datos de A-25 (Tarjeta ropa $ 5.000, mínimo $ 500; Préstamo personal $ 25.000, mínimo $ 2.000; Crédito auto $ 100.000, mínimo $ 10.000). A-25 no trae tasas: el test usa **tasa 0** para verificar solo el orden y el traspaso de pagos, con $ 2.500 extra.
- Bola de nieve: Tarjeta ropa saldada en el mes 2, Préstamo personal en el mes 6, Crédito auto en el mes 9. Intereses $ 0.

## 9. Interés compuesto y aportes periódicos (SIM-10)

**Fórmulas:**
- Sin aportes (fórmula del taller, A-39): `C = P × (1 + r)^n`
- Con aportes mensuales al final de cada mes: `VF = P × (1 + r_m)^n + a × ((1 + r_m)^n − 1) / r_m`, con `r_m = r_anual / 12` y `n` en meses. Es la misma convención que la calculadora del taller (capitalización mensual con tasa anual dividida por 12).
- Aporte total: `P + a × n`; interés ganado: `VF − aporte total`.

**Caso F-18** · USD 1.000 al 10 % anual durante 10 años: `1.000 × 1,1^10` = **USD 2.593,74**.

**Caso F-19** · verificación de A-55: USD 200 por mes al 12 % anual durante 33 años (`r_m = 0,01`, `n = 396`)
- `1,01^396 = 51,4356…`
- `VF = 200 × (51,4356… − 1) / 0,01` = **USD 1.008.712,49** (coincide con el valor verificado en el Anexo A)
- Aportado: USD 79.200; interés: USD 929.512,49.

**Preset "gasto hormiga":** el gasto diario × 30 se toma como aporte mensual. La moneda y la tasa son las del escenario elegido y se muestran en los supuestos, con "Los rendimientos pasados no garantizan rendimientos futuros".

## 10. CEDEAR: de la acción al precio en pesos (SIM-11)

**Fórmula didáctica (B-36):** `precio en pesos ≈ precio en dólares ÷ ratio × tipo de cambio implícito`

**Simplificación:** el precio real puede tener una prima o un descuento por oferta y demanda; los ratios cambian (B-31). Todos los valores son de ejemplo y editables; nunca se muestra un ratio real como fijo.

**Caso F-20** · precio USD 600, ratio de ejemplo 20:1, tipo de cambio implícito $ 1.500

| Variación | Cálculo | Precio teórico |
| --- | --- | --- |
| Base | 600 ÷ 20 × 1.500 | **$ 45.000** |
| Sube la acción 10 % | 660 ÷ 20 × 1.500 | $ 49.500 (+10 %) |
| Sube el tipo de cambio 10 % | 600 ÷ 20 × 1.650 | $ 49.500 (+10 %) |
| Suben los dos 10 % | 660 ÷ 20 × 1.650 | $ 54.450 (+21 %) |

Muestra las dos fuentes de variación y que se multiplican (`1,1 × 1,1 = 1,21`).

## 11. ¿Dónde guardo mi fondo de emergencia? (SIM-12)

**Fórmulas:**
- Cuenta remunerada y fondo money market: acreditación diaria, `M × (1 + TNA / 365)^d`
- Plazo fijo tradicional: `M × (1 + TNA × d / 365)`, disponible al vencimiento

**Caso F-21** · $ 3.000.000, 30 días, escenario medio (3 % mensual)

| Opción (valores de ejemplo) | TNA | A los 30 días | Liquidez | En poder de compra |
| --- | --- | --- | --- | --- |
| Cuenta remunerada | 30 % | **$ 3.074.860,99** | Inmediata | $ 2.985.301,93 |
| Fondo money market | 31 % | **$ 3.077.387,20** | En el día (B-26) | $ 2.987.754,56 |
| Plazo fijo tradicional | 34 % | **$ 3.083.835,62** | Al vencimiento | $ 2.994.015,17 |

Ninguna le gana a la inflación del escenario medio en 30 días. Se presenta como comparación de características, no como recomendación; el panel dice qué opción tiene garantía de los depósitos (B-01, B-12, B-14).

**Caso F-28** · $ 3.000.000, 30 días, escenario bajo (1,5 % mensual), con las tasas de D-110

| Opción (valores de ejemplo) | TNA | A los 30 días | Rendimiento del período | Tasa real (F-03) | En poder de compra |
| --- | --- | --- | --- | --- | --- |
| Cuenta remunerada | 15 % | **$ 3.037.207,55** | 1,2403 % | **−0,2559 %** | $ 2.992.322,71 |
| Fondo money market | 20 % | **$ 3.049.708,90** | 1,6570 % | **+0,1546 %** | $ 3.004.639,31 |
| Plazo fijo tradicional | 22 % | **$ 3.054.246,58** | 1,8082 % | **+0,3037 %** | $ 3.009.109,93 |

En este escenario, el fondo y el plazo fijo le ganan a la inflación por poco y la cuenta remunerada no: la persona ve los dos casos (D-110).

## 12. Meta de ahorro con inflación (SIM-8)

**Fórmulas:**
- Precio futuro: `P_f = P × (1 + π_m)^n`
- Ahorro mensual necesario, con aportes al final de cada mes y rendimiento mensual `r`: `a = P_f × r / ((1 + r)^n − 1)`; si `r = 0`, `a = P_f / n`

**Caso F-22** · meta de $ 1.500.000 hoy, 12 meses, inflación 3 %, rendimiento 2,5 % mensual
- Precio futuro: **$ 2.138.641,33**
- Ahorro mensual: **$ 155.023,97**
- Sin rendimiento: **$ 178.220,11**

## 13. Fondo de emergencia (SIM-2)

**Fórmulas:** `objetivo = gastos esenciales × meses`; `falta = máx(objetivo − ahorro actual, 0)`; `meses para llegar = ⌈falta / ahorro mensual⌉` (sin rendimiento; opción de sumarlo con la fórmula de la sección 12).

**Caso F-23** · gastos esenciales $ 600.000, 3 meses, ahorro actual $ 400.000, ahorro mensual $ 150.000
- Objetivo **$ 1.800.000**; falta **$ 1.400.000**; **10 meses** (`1.400.000 / 150.000 = 9,33`, se redondea hacia arriba).

## 14. Presupuesto (SIM-1) y misión 1

**Fórmulas:** porcentaje por categoría = gasto de la categoría ÷ ingresos del mes; saldo = ingresos − gastos; referencia 50/30/20 o 70/20/10 (A-32, A-33) como punto de partida.

**Aguinaldo prorrateado (opcional):** `neto mensual ÷ 12`, como aproximación. ⚠ Simplificación pendiente de Kevin (Q-12): el aguinaldo real es el 50 % de la mejor remuneración del semestre y tiene sus propios descuentos.

**Caso F-24** · sueldo neto de demo $ 1.284.958,86 (D-54)
- 50 %: **$ 642.479,43** · 30 %: **$ 385.487,66** · 20 %: **$ 256.991,77**
- Aguinaldo prorrateado aproximado: **$ 107.079,91**

**Caso F-25** · evidencia de la misión 1: 20 % del neto = $ 256.991,772. Se aceptan respuestas entre **$ 256.990,77 y $ 256.992,77** (tolerancia de $ 1, spec 5.3).

## 15. Billetera: rendimiento diario y poder de compra

Detalle del motor en `wallet-engine.md`. Fórmulas:
- Rendimiento del día: `saldo × TNA / 365`, redondeado a centavos y acreditado como movimiento (spec 5.3).
- Índice de precios del día `d`: `(1 + π_m)^(d / 30)`; poder de compra = saldo ÷ índice.

**Caso F-26** · $ 1.000.000 en cuenta remunerada con TNA 30 %, 30 días, redondeando cada acreditación
- Saldo al día 30: **$ 1.024.953,66** (rendimiento acumulado $ 24.953,66)
- Poder de compra con 3 % mensual: `1.024.953,66 / 1,03` = **$ 995.100,64**
- Índice al día 15: `1,03^0,5` = 1,0148891565

## 16. Métrica con umbral de privacidad

**Regla (`metrics.ts`):** `aggregate(grupo)` devuelve "datos insuficientes" si `personas < privacyThreshold` (mínimo 5); si no, el valor agregado. Además, en una misma vista no se muestra un total y sus partes si al restar se pudiera deducir un grupo de menos de 5.

**Caso F-27** · 4 personas → "Datos insuficientes para mostrar este grupo sin identificar a nadie"; 5 personas → valor.

---

## Resumen de casos para los tests

| Caso | Función de `src/lib/finance/` | Resultado esperado |
| --- | --- | --- |
| F-01 | `periodRate(tna, days)` | 0,0295890411 |
| F-02 | `effectiveAnnualRate(tna, days)` | 0,4258623040 |
| F-03, F-04 | `realRate(i, inflation)` | −0,000398989 · 0,014373 |
| F-05 a F-07 | `purchasingPower(...)` | $ 70.137,99 · $ 49.696,94 · $ 32,77 |
| F-08, F-09 | `fixedTermDeposit(...)`, `uvaDeposit(...)` | $ 1.029.589,04 · $ 1.095.421,40 |
| F-10 a F-13 | `installmentsPresentValue(...)` | $ 99.540,04 · $ 109.075,05 · $ 83.838,44 · $ 102.526,24 |
| F-14, F-15 | `minimumPaymentSchedule(...)` | 55 meses, $ 83.880,36 · 237 meses, $ 813.271,16 |
| F-16, F-17 | `debtPayoff(debts, extra, method)` | ver tablas |
| F-18, F-19 | `compoundGrowth(...)` | USD 2.593,74 · USD 1.008.712,49 |
| F-20 | `cedearTheoreticalPrice(...)` | $ 45.000 |
| F-21, F-28 | `emergencyFundOptions(...)` | ver tablas |
| F-22 | `savingsGoal(...)` | $ 2.138.641,33 · $ 155.023,97 |
| F-23 | `emergencyFundTarget(...)` | $ 1.800.000 · 10 meses |
| F-24, F-25 | `budgetSplit(...)` | ver caso |
| F-26 | motor de la billetera | $ 1.024.953,66 |
| F-27 | `aggregate(...)` | ver caso |

## Referencias

Banco Central de la República Argentina. (s. f.). *Tasas de interés en las operaciones de crédito* [Texto ordenado]. https://www.bcra.gob.ar/archivos/Pdfs/Texord/t-tasint.pdf

Bolsas y Mercados Argentinos. (s. f.). *CEDEARs*. https://byma.com.ar/productos/productos-financieros/cedears

Giampieri, K. (2026). *Educación financiera: transformá tu relación con el dinero* [Presentación del taller "Del aula al primer trabajo"]. Resumen en el Anexo A de la spec.
