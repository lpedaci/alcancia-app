# Valores reales del mercado (D-79)

> Sección 14.14 de la spec. Paso 20 del ajuste de fase A: **solo investigación, documentación y un script de prueba local**. La interfaz todavía no usa estos valores; eso es el paso 22 (fase B). Verificado el 14/11/2026.

## 1. La idea

El dinero es ficticio, pero el mundo es el real (5.6). El punto de partida de los escenarios usa tasas, UVA, CER, tipo de cambio e inflación **reales, con fecha y fuente**. Lo que viene después de hoy, al avanzar el tiempo, sigue siendo un **escenario** rotulado, nunca una predicción. Los avisos de 1.2 se mantienen en cada resultado.

## 2. Fuente: API de estadísticas monetarias del BCRA, versión 4.0

- **Base:** `https://api.bcra.gob.ar/estadisticas/v4.0/monetarias`. Pública, sin clave.
- **Catálogo:** `GET /monetarias?limit=1000&offset=0` devuelve las variables con `idVariable`, `descripcion`, `categoria`, `periodicidad` (D diaria, M mensual), `unidadExpresion`, `ultFechaInformada` y `ultValorInformado`. Al 14/11/2026 hay **1.610 variables**.
- **Serie:** `GET /monetarias/{idVariable}?desde=AAAA-MM-DD&hasta=AAAA-MM-DD&limit=n` devuelve `results[0].detalle`, una lista de `{ fecha, valor }` ordenada de la más reciente a la más antigua.
- **Errores:** un identificador inválido responde HTTP 400 con `errorMessages`. Los valores llegan como números; el script los convierte a texto decimal con decimal.js (3, "dinero como Decimal").

### Identificadores verificados (14/11/2026)

| Dato de 5.6 | `idVariable` | Descripción del BCRA | Periodicidad y unidad | Último valor leído |
| --- | --- | --- | --- | --- |
| Tasa de plazo fijo (referencia) | **12** | Tasa de interés de depósitos a 30 días de plazo en entidades financieras | Diaria, % nominal anual | 21,22 % al 12/11/2026 |
| Tasa de plazo fijo de personas | **1190** ⚠ | Tasa de interés de depósitos a plazo fijo en pesos de personas humanas | Diaria, % nominal anual | 19,86 % al 12/11/2026 |
| Tasa adicional del plazo fijo UVA | **1227** ⚠ | Tasa de interés de depósitos a plazo fijo UVA | Diaria, % nominal anual | 0,99 % al 12/11/2026 |
| BADLAR | **7** (TNA) y 35 (TEA) | Tasa de interés BADLAR de bancos privados | Diaria, % nominal anual | 22,125 % al 12/11/2026 |
| Tasa de préstamos personales | **14** | Tasa de interés de préstamos personales | Diaria, % nominal anual | 63,08 % al 12/11/2026 |
| UVA | **31** | Unidad de valor adquisitivo (base 31.3.16=14.05) | Diaria, en pesos | $ 2.196,12 al 14/11/2026 |
| CER | **30** | Coeficiente de estabilización de referencia (base 2.2.02=1) | Diaria, índice | 870,1648 al 14/11/2026 |
| Tipo de cambio mayorista | **5** | Tipo de cambio mayorista de referencia | Diaria, pesos por dólar | $ 1.547,03 al 13/11/2026 |
| Tipo de cambio minorista | **4** | Tipo de cambio minorista (promedio vendedor) | Diaria, pesos por dólar | $ 1.571,80 al 13/11/2026 |
| Inflación mensual | **27** | Inflación mensual | Mensual, % | 2,2 % en octubre de 2026 |
| Inflación interanual | **28** | Inflación interanual | Mensual, % | 33,1 % en octubre de 2026 |

⚠ Las series 1190 y 1227 están en las categorías "Series.xlsm" e "Informe Monetario Diario", no en "Principales Variables". Responden bien, pero conviene confirmar en la fase B que se siguen publicando (Q-18).

Otras series útiles para más adelante: 29 (expectativa de inflación a 12 meses del REM), 44 y 45 (TAMAR), 1187 y 1188 (bandas cambiarias). No se usan por ahora.

## 3. Inflación: del BCRA, con el INDEC como fuente de origen

**Decisión (D-223):** la inflación se toma de la misma API del BCRA (variables 27 y 28) y se rotula "Fuente: INDEC (IPC), publicado por el BCRA".

**Por qué:**
- Es la misma API, con el mismo formato y la misma validación que el resto. Una fuente menos que pueda fallar.
- Los valores coinciden con el INDEC. Lo verifiqué contra el IPC nacional (base diciembre 2016) de la API de series de datos.gob.ar (`148.3_INIVELNAL_DICI_M_26`), cuya fuente declarada es el INDEC:

| Mes | Índice INDEC | Variación calculada | Variable 27 del BCRA |
| --- | --- | --- | --- |
| Agosto de 2026 | 12.276,7660 | 1,66 % | 1,7 % |
| Septiembre de 2026 | 12.514,1508 | 1,93 % | 1,9 % |
| Octubre de 2026 | 12.785,9321 | 2,17 % | 2,2 % |

- El BCRA publica la variación redondeada a un decimal, igual que el INDEC en su informe. Para el punto de partida de un escenario alcanza.

**Alternativa descartada por ahora:** leer el índice del INDEC en datos.gob.ar y calcular la variación. Da más decimales, pero suma una fuente, un formato y un cálculo. Si la variable 27 dejara de publicarse, es el reemplazo (Q-19).

## 4. Hallazgo: la UVA y el CER se publican por adelantado

Al pedir el último dato (`?limit=1`), la UVA y el CER devolvieron valores del **15/12/2026**, un mes después de hoy. El BCRA los calcula por adelantado hasta el día 15 del mes siguiente. Si el script tomara ese dato, la app mostraría como "de hoy" un valor futuro.

**Corrección:** el script pide siempre `hasta=<hoy>` y rechaza cualquier fecha posterior a hoy. Con eso, la UVA leída es la del 14/11/2026 ($ 2.196,12).

## 5. El script de prueba

`scripts/fetch-market.mjs` (`npm run market -- [ruta de salida]`). Por defecto escribe `public/market/snapshot.json`, que está en `.gitignore`: el snapshot se genera, no se versiona (5.6).

Qué hace con cada variable:
1. Pide el último valor hasta hoy, con 20 segundos de límite y un reintento.
2. Valida la respuesta con Zod: `status` 200, un solo resultado, el `idVariable` pedido y `{ fecha, valor }` con fecha ISO y número finito.
3. Pasa los porcentajes a fracción (21,22 % → `0.2122`), como el resto del código.
4. Revisa que el valor esté en un rango posible y que no sea viejo: hasta 10 días para las series diarias y 70 para la inflación mensual. Así se detecta un identificador o una unidad equivocados antes de que lleguen a la app.
5. Valida el snapshot completo con Zod antes de escribirlo.

Formato del snapshot (el `MarketValue` de la sección 7 de la spec, más `stale`):

```json
{
  "generatedAt": "2026-11-14T23:12:17.280Z",
  "values": [
    { "id": "uva", "label": "Unidad de valor adquisitivo (UVA)", "value": "2196.12", "unit": "ARS", "date": "2026-11-14", "sourceId": "bcra-api" },
    { "id": "inflation-monthly", "label": "Inflación mensual (IPC, INDEC)", "value": "0.022", "unit": "percent", "date": "2026-10-31", "sourceId": "indec-via-bcra" }
  ],
  "missing": [],
  "note": "Valores reales con fecha y fuente para el punto de partida; el dinero es ficticio y el futuro es un escenario (D-79)."
}
```

## 6. Qué pasa si una fuente falla

El build nunca se rompe por una fuente: el script termina siempre con código 0. Lo probé en local simulando una caída (variable de entorno `BCRA_API` apuntando a un host inexistente):

| Caso | Resultado del script | Qué mostrará la app (fase B) |
| --- | --- | --- |
| La fuente responde | Valor nuevo con su fecha | "Valor al 14/11/2026 · Fuente: BCRA" |
| Falla, y hay un snapshot anterior | Conserva el valor anterior con su fecha original y lo marca `stale` | "Valor al 12/11/2026: no pudimos actualizarlo hoy" |
| Falla, y no hay snapshot anterior | La variable va a `missing` | El escenario de ejemplo de `scenarios.json`, con su rótulo "Valores de ejemplo" |
| Responde con un dato fuera de rango, futuro o viejo | Se trata como una falla | Igual que arriba |

## 7. Frecuencia y despliegue (fase B, paso 22)

- Una tarea programada de GitHub Actions, **una vez por día**, corre el script antes del build y publica el snapshot junto al sitio.
- Para conservar el último valor válido entre corridas, el workflow tiene que recuperar el snapshot publicado antes de correr el script (por ejemplo, descargándolo del sitio o guardándolo como artefacto o en la caché de Actions). Se decide en el paso 22.
- La app lee `market/snapshot.json` del mismo origen: la CSP no cambia (`connect-src 'self'`) y el navegador nunca llama a terceros.
- Si el BCRA bloquea por exceso de pedidos, no hay riesgo: son 11 pedidos por día. La API no documenta un límite (Q-20).

## 8. Precios de acciones y CEDEARs: quedan de ejemplo

BYMA exige licencia para mostrar sus precios, y no se va a gestionar (D-79). Por eso:

- **No se usan** precios reales ni los endpoints públicos de open.bymadata, ni fuentes de terceros que los repliquen. No se investigaron.
- Los precios de Invertir siguen siendo **de ejemplo**, con la serie sintética rotulada.
- En la ficha de cada instrumento de Invertir hay un enlace a **BYMADATA**, el sitio de datos de BYMA, para ver los precios reales: `https://open.bymadata.com.ar/#/dashboard`, el mismo enlace que publica byma.com.ar. Se abre en una pestaña nueva, con `rel="noopener noreferrer"`.
- El 14/11/2026 ese sitio mostraba "Sitio en mantenimiento", y `www.bymadata.com.ar` no respondía. Se revisa antes de publicar la fase B (Q-17).

## 9. Qué falta para la fase B

- Conectar el snapshot a Rendir, Tarjeta y préstamos, las herramientas y el punto de partida de los escenarios, con "Valor al DD/MM/AAAA · Fuente: …".
- Dejar elegir cómo sigue el escenario después de hoy (como la última inflación real, más alta o más baja), siempre rotulado.
- La tarea programada y cómo se conserva el último snapshot válido.
- Agregar `bcra-api` e `indec-via-bcra` a `src/app/sources.ts` cuando la interfaz los muestre.
- Confirmar Q-17 a Q-20.

## Referencias

Banco Central de la República Argentina. (2026). *API de estadísticas monetarias, versión 4.0* [Interfaz de programación]. https://api.bcra.gob.ar/estadisticas/v4.0/monetarias

Instituto Nacional de Estadística y Censos. (2026). *Índice de precios al consumidor nacional, base diciembre 2016* [Serie 148.3_INIVELNAL_DICI_M_26]. Datos Argentina. https://apis.datos.gob.ar/series/api/series/?ids=148.3_INIVELNAL_DICI_M_26
