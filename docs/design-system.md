# Sistema de diseño de Alcancía

> Versión en Markdown del sitio público del sistema de diseño, en [`/#/design-system`](https://lpedaci.github.io/alcancia-app/#/design-system) (G8, D-199). El sitio muestra los componentes reales y lee los colores y los contrastes en vivo de los tokens; este archivo resume lo mismo para leerlo en el repositorio. La referencia interna de desarrollo sigue siendo `/styleguide`. La spec de origen es la sección 2 de [`CLAUDE.md`](../CLAUDE.md).

La arquitectura del sitio (índice lateral desde 1200 px, hoja de secciones en celular y tablet, secciones con muestras vivas) se tomó del sistema de diseño de Rumbo, el proyecto hermano. La identidad, los tokens y el contenido son de Alcancía.

## Índice

| Grupo | Sección | Qué muestra |
| --- | --- | --- |
| Fundamentos | [Principios](#principios) | Seis ideas que deciden cada pantalla |
| | [Arquitectura de tokens](#arquitectura-de-tokens) | Cuatro niveles y los controles automáticos |
| | [Color](#color) | Roles de M3 con contraste en vivo, superficies, colores por rol, series de gráficos y la excepción de Fuerte |
| | [Tipografía](#tipografía) | Los 13 roles de la escala de M3, con tamaño leído del navegador |
| | [Espacio y forma](#espacio-y-forma) | Espacios, radios y los tres niveles de elevación |
| | [Íconos](#íconos) | Material Symbols Rounded 300 y sus reglas |
| | [Movimiento](#movimiento) | Curvas dibujadas, duraciones y usos |
| Componentes | [Componentes](#componentes) | Botones, campos, estados y chips, KPIs, avisos, progreso y fuentes |
| | [Fuerte](#fuerte) | Siete estados y reglas de comportamiento |
| | [Hornero](#hornero) | La marca del socio ficticio: paleta del hábitat, ícono, íconos y reglas |
| Patrones | [Patrones](#patrones) | Doce patrones con el número de su decisión |
| | [Cómo mostramos el dinero](#cómo-mostramos-el-dinero) | Formato, montos largos, crédito, campos con máscara y reglas |
| | [Seguridad y privacidad](#seguridad-y-privacidad) | Tres capas, privacidad diseñada y qué ve cada rol |
| Pautas | [Accesibilidad](#accesibilidad) | WCAG 2.2 AA en nueve criterios |
| | [Voz y tono](#voz-y-tono) | Principios y vocabulario fijo |
| | [Créditos](#créditos) | Recursos de terceros y licencias |

## Principios

1. **Aprender usando.** Quien participa entra a una billetera con dinero ficticio, no a un campus. Las secciones se abren con logros (D-50).
2. **Educación, no asesoramiento.** Escenarios con sus supuestos a la vista, nunca predicciones ni recomendaciones.
3. **Sobrio no es plano.** Sin degradés y casi sin sombras: la riqueza sale de la jerarquía, los datos, el acento y las capas.
4. **Privacidad por diseño.** Los montos viven solo en el navegador; la empresa ve aprendizaje agregado, con un mínimo de 5 personas.
5. **Para la oficina y el depósito.** La misma guía en la computadora de Mariana y en el celular de Diego.
6. **Gamificación con medida.** Sin rachas que castigan, sin rankings, sin cuentas regresivas.

## Arquitectura de tokens

```mermaid
flowchart LR
  ref["1 · Referencia<br/>--ref-indigo-40<br/>valores crudos"] --> sys["2 · Sistema<br/>--md-sys-color-primary<br/>--role-*, --chart-*, --space-*"]
  sys --> theme["3 · Tema de Tailwind<br/>@theme inline<br/>bg-primary, rounded-xl"]
  theme --> comp["4 · Componentes<br/>Button (cva), MoneyText,<br/>KpiCard, StatusPill"]
```

Cada nivel solo usa el anterior. Controles automáticos: `tokens.test.ts` (contraste AA de cada combinación), `no-raw-values.test.ts` (ningún color, sombra ni degradé suelto en componentes) y Playwright (sin desbordes en 6 anchos y axe sin errores). Los tokens están en [`src/styles/tokens.css`](../src/styles/tokens.css); el sitio cuenta cuántos hay leyendo la hoja de estilos cargada.

## Color

| Rol | Base | Contenedor | Uso |
| --- | --- | --- | --- |
| Primario (índigo) | `#3D4FA8` | `#DEE1FA` | Acción principal, navegación activa, enlaces y foco |
| Secundario (índigo apagado) | `#55607A` | `#DCE2F2` | Botones tonales, chips de filtro |
| Terciario (verde azulado) | `#00796B` | `#CDEDE8` | Logros, metas, segunda serie |
| Error | `#B3261E` | `#F9DEDC` | Errores y acciones destructivas |
| Correcto | `#2E7D32` | `#DCEFDD` | Completado, dinero que entra |
| Atención | `#8A5300` | `#FCEBC7` | Riesgo, pendiente, pérdida de poder de compra |
| Información | `#2457C5` | `#DCE6FB` | Avisos, supuestos, respuestas para revisar |

- Los estados son solo para estados, nunca series, y siempre van con ícono y texto.
- **Colores por rol** (identifican personas, nunca estados): admin `#3D4FA8`, tutor `#00796B`, participante `#7A4FB0`, decisor `#5D6B2F`. Las cinco personas de la demo tienen foto con anillo de ese color.
- **Series de gráficos**, en este orden: primary, tertiary, índigo claro, verde azulado claro y gris, con relleno plano de baja opacidad.
- **Excepción (D-52):** el naranja de Fuerte (`--fuerte-body`, `--fuerte-light`, `--fuerte-shade`) solo en el personaje y sus luces.
- **Marca del socio (D-248):** los colores de Hornero (`--partner-hornero*`) solo en las piezas de Hornero del modo integrado.

## Tipografía

Inter con la escala de M3 y títulos enfatizados de M3 Expressive: `display-medium` (resultado del simulador), `display-small` (KPIs), `headline-medium` (título de página, único `h1`, D-163), `headline-small`, `title-large` (`h2`), `title-medium` (`h3`), `title-small`, `body-large` (guías), `body-medium`, `body-small`, `label-large` (botones), `label-medium` (chips) y `label-small` (contadores). Cifras tabulares en montos, porcentajes y fechas.

## Espacio y forma

- Espacios: `--space-gutter`, `--space-bento-gap`, `--space-card-padding` y `--space-section`, que crecen en tablet y escritorio. Ritmo vertical de 8 px.
- Radios: 4 px (casillas), 8 px (botones y campos), 12 px (menús), 16 px (diálogos y paneles), 24 px (tarjetas) y píldora.
- Elevación: en reposo, superficie y borde sin sombra; `--elevation-1` para menús, popovers y tooltips; `--elevation-2` para diálogos y avisos.

## Íconos

Material Symbols Rounded, peso 300, en SVG, con un componente único `<Icon name="…" />`. Contorno por defecto y relleno para lo activo. Los decorativos llevan `aria-hidden`; los botones de solo ícono, nombre accesible y tooltip.

## Movimiento

Curvas de M3 (estándar, enfatizada al entrar y al salir) y duraciones de 150, 200 y 300 ms. El resultado de un simulador cambia sin contar desde cero, las barras se llenan al entrar, las listas entran escalonadas (50 ms) y un desbloqueo aparece una sola vez. Con "reducir animaciones" solo queda la opacidad.

## Componentes

Muestras vivas en el sitio: botones (Filled, tonal, outlined, text, danger, deshabilitado con explicación y tamaños XS, S y M), campos (texto con error, `MoneyInput`, `PercentInput`), estados y chips (`StatusPill`, `MetaChips`, `SegmentedButton`), `KpiCard`, tarjetas de opción (`OptionCard`, D-218), el atajo "Ya sé esto" (`MasteryButton`, D-233: botón tonal chico con el rayo, arriba a la derecha de la tarjeta o la fila de una sección bloqueada), avisos (`InlineAlert` en cuatro tonos), progreso (`ProgressBar`, `SegmentedProgress`) y el pie de fuentes (`SourceList`).

## Fuerte

Siete estados (neutral, saludo, pensativo, atención, celebración, dormido y apenado, D-225) con siete luces, una por nivel completado. Habla en los momentos clave, nunca interrumpe dos veces la misma acción, no juzga ni recomienda, se puede silenciar y su mensaje se anuncia como texto (5.0.1, D-51, D-134).

## Hornero

La billetera ficticia que muestra Alcancía integrada en otra app (D-75, D-84). Marca propia hecha con tokens, que nunca se parece a una app real (D-86).

**Paleta "Atardecer" (D-248).** El hornero vive en pastizales abiertos, bordes de monte y parques; la paleta toma el cielo de la pampa al caer el sol. Se distingue del color de Atención (`#8A5300`), del naranja de Fuerte, del rojo de Error y de los colores de Alcancía y de las billeteras reales.

| Token | Nombre | Valor | Uso | Contraste |
| --- | --- | --- | --- | --- |
| `--partner-hornero` | Atardecer | `#7A2E3B` | Marca, ícono y títulos | 9,2:1 sobre blanco; 7,4:1 sobre el contenedor |
| `--partner-hornero-accent` | Arrebol | `#B05A66` | Íconos de la capa de solidez | 4,7:1 sobre blanco |
| `--partner-hornero-container` | Resplandor | `#F7E1E4` | Contenedores chicos, franja en celular | Solo contenedores |
| `--partner-on-hornero-container` | Anochecer | `#3A1018` | Texto sobre el resplandor | 13,3:1 |

**Ícono.** La casita del hornero de perfil, redondeada, con la entrada en arco y apoyada en una rama (`HorneroMark`). Dibujado desde cero en SVG, monocromo (`currentColor`), legible desde 16 px.

**Íconos por capa del concepto (D-85).**

| Ícono | Texto | Capa |
| --- | --- | --- |
| `HorneroMark` | Volver a Hornero | Marca |
| `info` | Marca ficticia de demostración | Etiqueta |
| `trending_up` | Tu nido creció $ X este mes | Ahorro |
| `savings` | Sumaste $ X a tu nido | Ahorro |
| `shield` | Tu nido aguanta X meses de gastos | Solidez |
| `verified_user` | Tu nido resistió: no transferiste a un desconocido | Solidez |
| `logout` | Salir del modo integrado | Interfaz |

**Reglas.** La etiqueta "Marca ficticia de demostración" está siempre a la vista en el modo integrado y un aviso lo dice al abrir Hornero (D-87, D-246). El microcopy del nido va solo en el modo integrado. Nunca la palabra "barro". Los colores de Hornero nunca van en botones, estados ni gráficos de Alcancía.

## Patrones

| Decisión | Patrón |
| --- | --- |
| D-50 | La app es una billetera: guías, desafíos y herramientas dentro de sus secciones |
| 5.0 | Lo bloqueado se ve, con qué falta y progreso |
| D-164, D-72 | Navegación por tamaño: barra inferior con el nombre solo en el destino activo; menú lateral desde 1200 px; Fuerte movible |
| 2.2.1 | Anatomía del simulador |
| D-166 | Misiones declarativas en JSON |
| 2.2.1 | Retroalimentación formativa: success con explicación, info con pista |
| D-188 | Bento por cantidad de contenido |
| D-178 | El CFT antes que la cuota |
| D-182, D-187 | Fuentes al pie, en chips |
| D-195 | "Datos insuficientes" y supresión complementaria |
| D-196 | Carga por CSV en tres pasos con el error junto al campo |
| D-197 | Aviso de cambios sin guardar |

### Patrones del 15/11/2026

- **Paso de una misión, desafío o guía (D-250):** el tipo de paso como etiqueta chica con ícono (Pregunta, Tú decides, Calcula, Clasifica, Para saber), la pregunta como título en `title-large`, las opciones como tarjetas (`RadioGroup variant="cards"`, la elegida en primary-container con borde primary), la acción a la derecha y las fuentes al pie como chips. Navegación de pasos, igual en misiones, guías y desafíos (D-266): salir a la izquierda; "Anterior" y "Continuar" juntos a la derecha, con "Continuar" al final.
- **Objetivo de la misión (D-250):** bloque con ícono de diana y "Al terminar vas a poder…", arriba del paso.
- **Pista en dos tiempos (D-251):** el primer error de una cuenta muestra "Tómate un momento" con el método y sin el resultado; el segundo, la cuenta resuelta.
- **"¿Por qué importa?" (D-252):** borde `tertiary` y fondo `tertiary-surface` (`#EEF8F6`), texto en `on-surface`; en un saludo o una tarjeta de color va en su propia fila a todo el ancho.
- **Mapa de niveles en celular y tablet (D-254):** filas compactas; el nivel completado se marca con el check del nodo y su píldora queda para lectores de pantalla hasta que la fila es ancha; el desplegable queda en la misma fila del título.
- **Hornero en el menú (D-249, D-253):** "Ver dentro de Hornero" o "Volver a Hornero", con la etiqueta de marca ficticia, arriba de "Tu avance"; en celular y tablet, en el menú de la persona.

### Valores reales (D-264)

- **Tarjeta "Valores reales de hoy" (`RealValues`):** cada valor real en una celda con su nombre, la cifra en `title-large` y "Valor al DD/MM/AAAA · Fuente: …"; si no se pudo actualizar, lo dice. Abajo, el recordatorio de que lo que viene es un escenario y el aviso legal, y los enlaces a las fuentes oficiales. Sin snapshot, un aviso en `info` y la pantalla sigue con los escenarios de ejemplo.
- **"Usar el último dato real" (`UseRealValue`):** botón de texto debajo de un campo de porcentaje de una herramienta, con la fecha y la fuente; completa el campo y el valor sigue editable.

## Cómo mostramos el dinero

- Pesos `$ 1.234.567,89` y moneda extranjera con código `USD 1.200`, con espacio de no separación entre el signo y el número (D-68).
- Porcentajes siempre con período: `3 %` mensual, `42,5 %` anual.
- Dinero que entra en success y que sale en error, siempre con signo e ícono (D-170); la pérdida de poder de compra en warning, no en error.
- Montos largos: si no entran, notación abreviada (`$ 12,3 M`) con el valor completo accesible.
- Crédito: el CFT primero, junto a lo que se recibe y lo que se paga en total; "Tasa alta" en warning (D-178).
- Datos clave con tono, metadatos en chips y consecuencias en avisos de color (D-183).
- **Carrusel con pestañas (D-281):** solo para mostrar varias piezas equivalentes en poco espacio. Pestañas visibles, una diapositiva por vez con la misma altura, avance automático que se pausa con el cursor o el foco, se detiene al elegir una pestaña y da una sola vuelta; con "reducir animaciones", sin avance automático; pausa visible en celular y tablet.
- **Sin palabras solas al final (D-282):** `text-wrap: pretty` en los textos y `text-balance` en títulos cortos y tarjetas centradas.
- **Columnas parejas (D-278):** en un panel de dos columnas, si la lateral queda mucho más larga que la principal, las tarjetas que no dependen del contexto inmediato (por ejemplo, Logros en Aprender) pasan debajo de la principal, para que las dos terminen a una altura parecida y la página pida menos scroll. El orden del DOM es el mismo en todos los anchos.
- **Filas de lista con una sola acción (D-279):** toda la fila es el enlace, con ícono inicial, título, texto de apoyo y `chevron_right` al final; sin un botón dentro de la fila. Alto mínimo de 56 px.
- **Botones en columnas angostas:** un botón con texto largo puede pasar a dos líneas (`whitespace-normal`, `max-w-full`) en lugar de salirse de su tarjeta.
- Listas de "lo que se ve" y "lo que nunca se ve" (aviso de privacidad, G5): lo permitido con `check_circle` en success y lo prohibido con `block` en error, con su mosaico del mismo tono; siempre con ícono y texto (D-275).
- Escenarios, no promesas; supuestos a la vista; aviso legal: "Contenido educativo. No es asesoramiento financiero ni una recomendación de inversión."

## Seguridad y privacidad

| Capa | Qué incluye |
| --- | --- |
| 1 · Simulado en la interfaz | SSO neutro y rotulado, verificación en dos pasos, bloqueo tras 5 intentos, aviso de sesión por vencer, aviso de privacidad y roles desde `permissions.ts` |
| 2 · Aplicado de verdad hoy | CSP en la página, con la CI recorriendo cada pantalla del build sin una sola violación; sin HTML crudo ni código desde texto; dependencias con versión fija, auditadas y actualizadas con Dependabot; Zod; enlaces con `rel="noopener noreferrer"` controlados por tests (D-200) |
| 3 · En producción | Encabezados HTTP reales con Cloudflare (`frame-ancestors`, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`), protección ante bots, SSO con OIDC o SAML y permisos en el servidor (D-70) |

La privacidad también se diseña: el cartel "dinero ficticio" nunca se quita (D-69), la billetera tiene marca propia, no pide datos reales, los montos no salen del navegador y el umbral de 5 no se puede bajar.

| Rol | Avance de aprendizaje | Montos y movimientos | Hábitos de Conocerte | Si un nivel está bloqueado |
| --- | --- | --- | --- | --- |
| Participante | Todo lo suyo | Solo los suyos | Solo los suyos | Sí, lo suyo |
| Tutor o tutora | Por persona, de sus cohortes | Nunca | Nunca | Nunca (D-58) |
| Admin de L&D | Agregado, con umbral | Nunca | Nunca | Nunca |
| Decisor | Reporte agregado | Nunca | Nunca | Nunca |

Detalle en [`security.md`](security.md).

## Accesibilidad

WCAG 2.2 AA (ISO/IEC 40500:2025): formularios con etiqueta, ayuda y errores junto al campo; todo con teclado y foco visible; gráficos con frase y tabla; campos de dinero con máscara y deslizadores con campo numérico; cambios anunciados con región en vivo; alternativa a todo arrastre; sin límite de tiempo; áreas táctiles de 48 × 48 px en celular; reflujo a 320 px y zoom al 200 %.

## Voz y tono

Español latinoamericano neutro, con tú. Clara, paciente y sin juicio. Claridad primero, sin culpar, términos explicados, escenarios y no promesas, tono según el momento. Vocabulario fijo: iniciar sesión (no "loguearse"), panel (no "dashboard"), costo financiero total, poder de compra, cuotas sin interés, fondo de emergencia, meta de ahorro, tutor o tutora, desafío de nivel, celular y computadora.

## Créditos

- Contenido de finanzas: basado en la presentación del Lic. Kevin Giampieri para el taller "Del aula al primer trabajo"; las ampliaciones quedan marcadas para su revisión.
- Fuerte: personaje propio de Lourdes Pedaci, del escape room "Tu primer sueldo".
- Fotos de las personas de la demo: fotos de stock con licencia gratuita, [Designed by Magnific](https://www.magnific.com/) (D-71).
- Íconos: Material Symbols de Google, licencia Apache 2.0.
- Tipografía: Inter, de Rasmus Andersson, licencia SIL Open Font.
