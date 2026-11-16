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
- **Colores por rol** (identifican personas, nunca estados): admin `#3D4FA8`, tutor `#00796B`, participante `#7A4FB0`, decisor `#5D6B2F`. Las doce personas de la demo (cinco de Andina, cuatro de Ceibo y tres de Hornero) tienen foto con anillo de ese color.
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
- **Constructor por bloques (D-317):** cada bloque en una tarjeta con borde, su tipo con ícono y número, y acciones de icono (subir, bajar, quitar) con nombre accesible; "Agregar bloque" abre un menú con el tipo y una línea de para qué sirve. Los errores aparecen al intentar publicar, junto a cada campo y resumidos arriba de los botones. "Guardar borrador" contorneado y "Publicar" relleno, a todo el ancho en celular.
- **Certificado (D-315):** tarjeta plana con doble marco (borde `primary` y línea `outline-variant`), centrada, con la medalla en `tertiary`, el nombre en `display-small` `primary` y los módulos en dos columnas con su insignia. Antes de emitirse lleva el chip "Vista previa" (`info-container`). Al imprimir se ocultan la navegación y los avisos de pantalla, y el marco pasa a `on-surface`.
- **Alternativa sin capa de juego (D-312):** un juego ofrece debajo de su acción principal un enlace de texto a su versión lineal ("Usar el modo simple"), con todo visible en una página y la misma recompensa.
- **Secciones dentro de una tarjeta larga (D-311, 2.4):** 32 px entre secciones (`--space-section`) y de 8 a 16 px dentro de cada una, en los tres tamaños. Una fila con un objeto y su acción (por ejemplo, una insignia para descargar): el objeto dibujado a la izquierda, el texto al medio y la acción a la derecha desde tablet; en celular, la acción va debajo a todo el ancho (D-308). Datos de resumen: en celular, una fila por dato con la etiqueta a la izquierda y el valor a la derecha; desde tablet, tarjetas.
- **Elegir una versión con su recompensa (D-310):** tarjetas de opción (radio) con título, una línea de qué cambia y la insignia que da o "Ya tienes…"; la elegida en `primary-container` con borde `primary` e ícono de radio relleno (el estado nunca depende solo del color). Una columna en celular, tres en contenedores anchos. Las insignias ganadas van en `tertiary-container` con "Descargar"; las que faltan, con borde punteado, candado y cómo obtenerlas. La acción que sigue al selector nombra la opción elegida y cambia con ella ("Jugar la versión intermedia", D-314).
- **Datos de avance compactos (D-309):** en celular, chips con ícono y valor (la etiqueta, solo para lectores de pantalla), tres por fila y el dato ancho abajo; en tablet y escritorio, ícono, etiqueta y valor en una línea con divisores, para no sumar altura. Se usa en el panel del escape room.
- **Acciones de un paso en celular (D-308):** como pide Material 3 para la ventana compacta, bajo 600 px la acción principal de un paso (Revisar, Probar, Continuar, Abrir la puerta) y sus acciones secundarias (Ver pista, Guardar reflexión) ocupan todo el ancho, apiladas, para que se vean como botones y se alcancen con el pulgar. Desde 600 px vuelven a su tamaño: la principal a la derecha, la pista a la izquierda. Los enlaces de texto ("Ver más") no cambian.
- **Objetivo de la misión (D-250):** bloque con ícono de diana y "Al terminar vas a poder…", arriba del paso.
- **Pista en dos tiempos (D-251):** el primer error de una cuenta muestra "Tómate un momento" con el método y sin el resultado; el segundo, la cuenta resuelta.
- **"¿Por qué importa?" (D-288, D-292; reemplaza D-252):** botón de atención (`warning-container`, el ámbar del sistema) a la derecha del título de cada pantalla; en celular y tablet, solo el ícono con nombre accesible y tooltip; desde 1200 px, con su nombre. Abre un diálogo con el concepto, las fuentes y "Ver en la guía".
- **Mapa de niveles en celular y tablet (D-254):** filas compactas; el nivel completado se marca con el check del nodo y su píldora queda para lectores de pantalla hasta que la fila es ancha; el desplegable queda en la misma fila del título.
- **Hornero en el menú (D-249, D-253):** "Ver dentro de Hornero" o "Volver a Hornero", con la etiqueta de marca ficticia, arriba de "Tu avance"; en celular y tablet, en el menú de la persona.

### Billetera en celular y tablet, y Fuerte que avisa (D-286 a D-294)

- **Fila de título (D-292):** título a la izquierda, "¿Por qué importa?" a la derecha; la introducción debajo, a todo el ancho.
- **Encabezado del inicio (D-289, D-290):** sin tarjeta. Fecha, "Hola, Nombre" y nivel a la izquierda; "Avanzar el tiempo" (botón con menú: Un día, Una semana, Un mes) y "¿Por qué importa?" a la derecha. Bajo 840 px, los dos son botones redondos de 48 px con ícono y tooltip.
- **Acciones en fila (D-287, D-293):** bajo 840 px, una tarjeta con cuatro íconos redondos de 48 px (`secondary-container`) y un nombre corto; lo bloqueado lleva un candado chico. Desde 840 px, tarjetas con descripción.
- **Saldo (D-287):** el monto completo, un rol tipográfico más chico en tarjetas angostas, nunca abreviado.
- **Movimientos (D-286, D-287):** ícono de 36 px, nombre en una línea, monto en `label-medium`; los últimos 5 y "Ver todos los movimientos (N)" a la derecha, con la lista completa desplazándose dentro de la tarjeta.
- **"Qué falta" (D-287, D-294):** lista liviana con ícono y texto centrados, lo pendiente primero, dos columnas en tarjetas anchas. Cada condición pendiente con un lugar donde resolverla es un enlace de fila completa con hover `surface-container`, sin subrayado, y un chevron.
- **"Ver más" (D-291):** los botones de texto que cierran una lista van a la derecha; volver y salir, a la izquierda.
- **Fuerte avisa (D-290):** avisos de atención, pendientes, inversiones, metas y avance, calculados en el navegador (`src/features/companion/notices.ts`). Insignia: signo de atención en `warning` si hay un problema; el número en `primary` si hay pendientes; nada si está al día. En "Conversador", el primer aviso nuevo de la visita aparece unos segundos en un globo junto a él.
- **Su cara (D-291, `fuerteMood`):** atención con un problema, pensativo con pendientes, celebración si está al día ("Estás al día con todo. Guardado."). Un estado elegido por la pantalla (apenado, atención, dormido) manda.
- **Panel tipo chat (D-291, `FuerteParts.tsx`):** Fuerte y su nombre en una línea con "Mover" y "Cerrar"; su mensaje en un globo de ancho completo con `primary-container` al 50 % y la esquina superior izquierda recta; los tres primeros avisos y "Ver N avisos más"; "¿Por qué importa?" plegado en una línea; el consejo de arrastrar se cierra una vez leído.

- **Control segmentado (D-295, `SegmentedButton`):** riel en píldora `surface-container` con borde `outline-variant`; la opción elegida en `surface-container-lowest` con borde y check en `primary`. Cada opción mide su texto; si no entran, el riel se desplaza y nada se corta.

- **Tablas como tarjetas (D-297, `TableContainer stack` + `Table stack`):** bajo 42 rem de contenedor cada fila es una tarjeta con la primera celda como título y "columna: valor" en las demás; nada se desplaza de costado. Las matrices (mapa de calor) quedan como tabla con desplazamiento interno.
- **Resultados por nivel (D-298):** fila con nombre y cantidad de personas, barra apilada primer intento (`primary`) sobre total (`--chart-3`) con leyenda, y los dos porcentajes en texto.

- **Chips de contexto (D-299, `MetaChips compact`):** debajo del título de la pantalla; en celular y tablet, los dos principales en una fila (el segundo se acorta si no entra); desde 840 px, todos.

- **Filas con una sola acción (D-301, `ListLinkRow`):** toda la fila es el enlace, en superficie tonal, con ícono, título, detalle opcional y chevron. Repasos y atajos de Aprender.

- **Globo de Fuerte (D-303):** el aviso breve que aparece junto a Fuerte va en `inverse-surface` con cola hacia él, como los tooltips: nunca se pierde sobre una tarjeta blanca.

- **Escape room (D-304):** se arma con los componentes de siempre: `QuestionView` para cada candado, `Dialog` para inspeccionar objetos, `ListLinkRow` para ir a la guía, `InlineAlert` para el resultado y `TextArea` para la reflexión. Las pistas van en `warning-container`, como "¿Por qué importa?"; los candados abiertos, en `tertiary-container`, el color de los logros.
- **Diálogos (D-304):** al abrirse enfocan el propio diálogo, no el botón "Cerrar", para que Escape lo cierre a la primera.

- **"Qué falta" en todos lados (D-305, `ConditionList`):** la tarjeta de desbloqueo y el mapa de niveles usan la misma lista; no hay chips de condiciones.
- **Objetos del escape room (D-305):** cada objeto se dibuja como lo que es (recibo, post-it, lista, resumen, folleto, sobre, etiqueta, celular) con tokens, para la inmersión del juego.
- **Pie de autoría (D-306, `RightsNotice`):** "© 2026 Lourdes Pedaci · Todos los derechos reservados" con enlace a `LICENSE`, en `body-small` y `on-surface-variant`, al pie de todas las pantallas.

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
- **Bento de funciones en la landing (D-285):** tarjetas de distinto ancho, cada una con título (palabra clave en primary), una línea de texto y una pieza real del producto; sin listas numeradas ni carruseles.
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
