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

## 3. Inflación: del INDEC, por dos caminos oficiales (D-264, reemplaza D-223)

La inflación mensual se lee **de las dos fuentes oficiales** y gana la más reciente:

- **INDEC en datos.gob.ar:** el IPC nacional (base diciembre 2016, serie `148.3_INIVELNAL_DICI_M_26`) como variación mensual (`representation_mode=percent_change`). Se rotula "Fuente: INDEC, en datos.gob.ar".
- **INDEC publicado por el BCRA:** la variable 27 de la API del BCRA. Se rotula "Fuente: INDEC, publicado por el BCRA".

Si las dos traen el mismo mes, gana la serie del INDEC (más decimales). La variable 28 (interanual) sigue saliendo del BCRA.

**Por qué las dos:** el 15/11/2026 el BCRA ya publicaba octubre (2,2 %) y la serie de datos.gob.ar seguía en septiembre (1,93 %). Leer las dos da el dato más nuevo sin dejar de citar al INDEC.

| Mes | Índice INDEC | Variación calculada | Variable 27 del BCRA |
| --- | --- | --- | --- |
| Agosto de 2026 | 12.276,7660 | 1,66 % | 1,7 % |
| Septiembre de 2026 | 12.514,1508 | 1,93 % | 1,9 % |
| Octubre de 2026 | 12.785,9321 | 2,17 % | 2,2 % |

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

## 7. Frecuencia y despliegue (construido en el paso 22)

- El workflow de despliegue corre **una vez por día** (`schedule`, 10:15 UTC, 07:15 en Argentina) y además en cada push a `main`.
- Antes del build **descarga el snapshot publicado** (`https://lpedaci.github.io/alcancia-app/market/snapshot.json`). Así, si una fuente falla, el script conserva el último valor válido con su fecha original (`stale`).
- Después corre `node scripts/fetch-market.mjs`, que escribe `public/market/snapshot.json`; Vite lo copia a `dist/market/`. El script nunca rompe el build.
- La app lee `market/snapshot.json` del mismo origen: la CSP no cambia (`connect-src 'self'`) y el navegador nunca llama a terceros.
- Son 12 pedidos por día (11 al BCRA y 1 a datos.gob.ar).

## 8. Precios de acciones y CEDEARs: quedan de ejemplo

BYMA exige licencia para mostrar sus precios, y no se va a gestionar (D-79). Por eso:

- **No se usan** precios reales ni los endpoints públicos de open.bymadata, ni fuentes de terceros que los repliquen. No se investigaron.
- Los precios de Invertir siguen siendo **de ejemplo**, con la serie sintética rotulada.
- En la ficha de cada instrumento de Invertir hay un enlace a **BYMADATA**, el sitio de datos de BYMA, para ver los precios reales: `https://open.bymadata.com.ar/#/dashboard`, el mismo enlace que publica byma.com.ar. Se abre en una pestaña nueva, con `rel="noopener noreferrer"`.
- El 14/11/2026 ese sitio mostraba "Sitio en mantenimiento", y `www.bymadata.com.ar` no respondía. Se revisa antes de publicar la fase B (Q-17).

## 9. Dónde se ven en la interfaz (paso 22)

| Pantalla | Valores reales | Cómo se usan |
| --- | --- | --- |
| Rendir | Inflación mensual e interanual, plazo fijo de personas, tasa adicional del UVA, BADLAR, UVA y CER | Tarjeta "Valores reales de hoy" y, arriba, "¿Cómo sigue la inflación desde hoy?": la persona elige el escenario de su billetera (baja, media o alta) con la inflación real del último mes como referencia |
| Tarjeta y préstamos | Préstamos personales (TNA) e inflación | Tarjeta "Valores reales de hoy", para comparar con las ofertas de práctica |
| Invertir | Dólar mayorista y minorista | Tarjeta "Valores reales de hoy"; los precios de acciones y CEDEARs siguen de ejemplo, con el enlace a BYMADATA |
| Herramientas (SIM-3 a SIM-6, SIM-8, SIM-12) | Inflación mensual, plazo fijo de personas, tasa adicional del UVA | "Usar el último dato real" debajo de cada campo: completa el valor y dice la fecha y la fuente; el resto sigue editable |

Cada valor dice "Valor al DD/MM/AAAA · Fuente: …" y enlaza a su fuente oficial. Sin snapshot, la tarjeta lo dice y la pantalla sigue con los escenarios de ejemplo. Tests en `src/components/market/RealValues.test.tsx` y en `engine.test.ts`.

**Pendiente:** BYMADATA seguía sin responder el 15/11/2026 (Q-17).

## Referencias

Banco Central de la República Argentina. (2026). *API de estadísticas monetarias, versión 4.0* [Interfaz de programación]. https://api.bcra.gob.ar/estadisticas/v4.0/monetarias

Instituto Nacional de Estadística y Censos. (2026). *Índice de precios al consumidor nacional, base diciembre 2016* [Serie 148.3_INIVELNAL_DICI_M_26]. Datos Argentina. https://apis.datos.gob.ar/series/api/series/?ids=148.3_INIVELNAL_DICI_M_26
