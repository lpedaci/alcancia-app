# Alcancía · Plataforma corporativa de aprendizaje en finanzas personales (MVP)

> Nombre de trabajo: **Alcancía** (provisorio, se puede cambiar; ver D-02 en la sección 0).
> Autora: Lourdes Pedaci, Experience Designer (Learning y UX/UI).
> Este archivo es la especificación completa del proyecto. Léelo entero antes de empezar y vuelve a consultarlo en cada paso.
> Proyecto de portfolio: prototipo navegable de alta fidelidad (nivel 2), con datos simulados y sin backend.
> Proyecto hermano: **Rumbo** (plataforma de onboarding, `https://lpedaci.github.io/rumbo-app/`, repositorio `rumbo-app`). Comparten forma de trabajo, stack y criterios de calidad. Si tienes acceso a ese repositorio, puedes **reutilizar su arquitectura de tokens, componentes base, tests de desbordes y de contraste, y el sitio del sistema de diseño**, pero Alcancía tiene **identidad visual propia** (nombre, paleta, logo y tono) y no debe parecer una copia de Rumbo.

---

## 0. Decisiones de base

> Numeración: las decisiones de esta tabla las define Lourdes. Claude Code numera las suyas en `docs/decisions.md` a partir de **D-100** (cambio del 12/11/2026, para no chocar con las referencias a D-31, D-32 y D-38 de antes del reinicio); las de la spec usan D-01 a D-99.
>
> **Reinicio del 12/11/2026:** el proyecto se vuelve a construir desde cero con esta versión de la spec. Las decisiones de Claude Code ya aprobadas en la versión anterior se incorporaron a esta tabla (D-52, D-54, D-55) y la verificación de billeteras y fintech, al Anexo D. Lo construido antes no se reutiliza salvo que Lourdes lo indique.

| ID | Decisión | Estado |
| --- | --- | --- |
| D-01 | Paleta de 2.1.1 (índigo + verde azulado) | Provisoria, confirmar en el piloto visual |
| D-02 | Nombre "Alcancía" | Provisorio |
| D-03 | Español latinoamericano neutro y profesional, con **tú** | Confirmada por Lourdes |
| D-04 | **Solo contexto empresa** (plataforma corporativa de aprendizaje). Reemplaza la propuesta de institución terciaria: se descarta el contexto educativo | Confirmada por Lourdes |
| D-20 | El rol que acompaña a las cohortes se llama **tutor** (no "docente" ni "facilitador") | Confirmada por Lourdes |
| D-21 | Base de contenido: presentación del Lic. Kevin Giampieri y sitio del taller (1.1); ampliaciones marcadas para su revisión | Confirmada |
| D-22 | Se nombran instrumentos e índices como ejemplo educativo. Se nombran **brókers (ALyC) registrados en la CNV** en una ficha informativa neutral (Anexo C). No se nombran bancos (billeteras y fintech: ver D-26) | Confirmada |
| D-26 | Se nombran **billeteras y fintech argentinas** en una ficha informativa que las clasifica por el **tipo de cuenta** que ofrecen (Anexo D), con las mismas reglas que los brókers | Confirmada |
| D-27 | **Billetera de práctica (SIM-13)**: billetera virtual ficticia con aprendizaje integrado, en fase A (5.3) | Confirmada |
| D-28 | La billetera se llama **Alcancía** (reemplaza a "Faro"): el producto entero es la billetera. Fuerte es el guía | Provisoria, Lourdes confirma |
| D-51 | **Fuerte es el compañero de la billetera, con personalidad propia** (5.0.1) | Confirmada |
| D-50 | **Todo el entorno del participante simula ser una billetera virtual y plataforma de inversión.** Se aprende usándola y cada sección se **desbloquea por logros y metas** (1.3, 5.0). Las lecciones, evaluaciones, simuladores y metas pasan a vivir dentro de esas secciones | Confirmada |
| D-52 | **El naranja de Fuerte es la única excepción a la paleta fría**, en todo el entorno del participante (no solo en el escape room), con relleno plano, sin degradés, y solo en el personaje y sus luces (2.1.1, 5.0.1; antes D-32 de Claude Code) | Confirmada |
| D-53 | **Apartado "Ahorro" básico desde el nivel 1:** la misión 1 crea un único apartado sin meta; el nivel 4 suma apartados con meta y el fondo de emergencia (5.0, 5.3) | Confirmada |
| D-54 | **Recibo de sueldo de demo:** se usa el recibo del taller, con empleador Andina Servicios S.A. y **neto de $ 1.284.958,86**; ese neto es el sueldo que se cobra en la misión 1 (antes D-31 de Claude Code). El recibo se muestra **tal como está en el taller, con su nombre ficticio y rotulado "Recibo de ejemplo"**, no a nombre de Mariana ni de Diego: tienen puestos distintos y el mismo sueldo de práctica es una simplificación (respuesta a Q-11) | Confirmada |
| D-55 | **Evento sorpresa de la misión 1:** una suscripción ficticia de **$ 4.990** que se debita sin aviso, para trabajar gastos hormiga y débitos programados (antes D-38 de Claude Code) | Confirmada |
| D-56 | **Crédito vive dentro de Pagar** como subsección "Tarjeta y préstamos" (nivel 5); los destinos siguen siendo 5 (5.3) | Confirmada |
| D-57 | **Desafío de nivel armado con los bancos de sus módulos:** toma preguntas del banco de cada módulo del nivel; la insignia de un módulo sale de su parte del desafío. Si se agotan los intentos, no se bloquea para siempre: el desbloqueo pasa al tutor y no se pierde nada (5.0, 5.1) | Confirmada |
| D-58 | **El tutor ve solo el avance de aprendizaje de cada nivel:** guías leídas, estado del desafío de nivel (pendiente, aprobado, intentos agotados), si se habilitó por suficiencia o por un tutor, y si el nivel está completado. **No ve si un nivel está bloqueado o desbloqueado**, porque de ahí se deduciría una condición de la billetera (por ejemplo, desafío aprobado pero Invertir bloqueado = falta fondo o hay deudas). Puede habilitar cualquier nivel con motivo (4.2, 5.3; ajustado el 12/11/2026) | Confirmada |
| D-62 | **Las respuestas de hábitos de "Conocerte" nunca salen del navegador, ni siquiera agregadas** (coherente con el aviso de G5). Kirkpatrick 2 compara pre y post por dimensión **solo con las preguntas de conocimiento**; los cambios de hábitos se miden en Kirkpatrick 3 con el autoinforme a 30 días (F7) | Confirmada |
| D-63 | **Cada nivel se abre con el desafío del nivel anterior**, también el 2: Pagar pide la misión 1 y el desafío del nivel 1 (5.0) | Confirmada |
| D-59 | **Misiones de fase A: 13** (las 7 numeradas de 5.3 y las 6 de la tabla de 5.0). Las 6 adicionales son cortas, de 2 a 4 minutos | Confirmada |
| D-60 | **Fecha de la demo:** `DEMO_TODAY` = 16/11/2026; programa "Bienestar financiero 2026", iniciado el 03/08/2026, coherente con la verificación de los Anexos B, C y D (11/11/2026) | Confirmada |
| D-61 | **Alcance del contenido en fase A:** cada uno de los 16 módulos tiene objetivo, **una guía completa** y su parte del banco de preguntas; las guías 2 y 3 de cada módulo pasan a fase B. Claude Code escribe el borrador de cada tanda junto con su sección y Lourdes lo revisa por tanda, con las ampliaciones marcadas para Kevin | Provisoria, Lourdes puede ampliar |
| D-64 | **La quinta dimensión de "Conocerte" es "Metas e inversión"** (antes "Metas"), porque agrupa los módulos 12 a 15 (D-116 de Claude Code). En el código sigue siendo `goals` | Confirmada |
| D-65 | **El módulo 17 tiene una sola guía en fase A, en el nivel 2.** La parte "cuenta o fondo" del nivel 6 la cubren la guía del módulo 11 y las tarjetas de la misión 4 (D-117 de Claude Code, opción a) | Confirmada |
| D-66 | **`design-references/` no se publica:** queda solo en la computadora de Lourdes (`.gitignore`) y se quita del historial del repositorio, como en Rumbo (2.2) | Confirmada |
| D-67 | **El test de perfil de inversor se hace antes de abrir Invertir:** se ofrece desde la tarjeta "qué falta" de Invertir y desde la guía del módulo 13, aunque la sección esté bloqueada. Es educativo y su resultado nunca se traduce en una cartera (1.2). Al abrir la cuenta comitente (5.4) se reutiliza el resultado | Confirmada |
| D-68 | **Montos sin cortes de línea:** entre `$`, `USD` o `−` y el número va siempre un espacio de no separación, para que el signo nunca quede solo al final de una línea (2.9) | Confirmada |
| D-69 | **Cómo se presenta el producto:** "Simulador de finanzas personales" (para equipos de trabajo) en lugar de "plataforma de aprendizaje corporativo" en la landing y la pestaña; el carácter B2B se mantiene en el cuerpo del hero, los recorridos y el pie. El cartel fijo de la billetera dice **"Simulador de finanzas personales · dinero ficticio"**: lo de dinero ficticio no se quita nunca (D-154 y D-156 de Claude Code) | Confirmada |
| D-70 | **Hosting y seguridad del front:** el prototipo se queda en **GitHub Pages**. `docs/security.md` y la sección "Seguridad y privacidad" del sistema de diseño documentan qué se protege hoy (CSP en `<meta>`, sin `dangerouslySetInnerHTML`, dependencias auditadas en la CI, sin datos reales, montos en el navegador) y sus límites (GitHub Pages no permite encabezados HTTP propios). **Mejora futura:** con un dominio propio, Cloudflare (delante de GitHub Pages o con Cloudflare Pages y un archivo `_headers` versionado) para sumar encabezados reales: `frame-ancestors`, HSTS, `X-Content-Type-Options`, `Referrer-Policy` y `Permissions-Policy`, más protección ante bots y denegación de servicio (8.3, 9) | Confirmada |
| D-71 | **Atribución de Magnific en el pie de la landing:** las fotos de las personas de la demo usan la licencia gratuita, que pide la línea "Designed by Magnific" con enlace junto al recurso o en el pie del sitio. Va en el pie de la landing, discreta, y también en el case study, la documentación y el sistema de diseño (ajusta D-165 de Claude Code) | Confirmada |
| D-72 | **Barra inferior con el nombre del destino activo:** en celular y tablet, los 5 destinos van con ícono y solo el activo muestra su nombre, sobre el indicador en píldora; los demás conservan el nombre accesible y un tooltip (ajusta D-164) | Confirmada |
| D-73 | **El tutor de la demo se llama Kevin Giovanni** (homenaje intencional al Lic. Kevin Giampieri, que validó el contenido). Reemplaza a Andrés Molina en todo el producto, los datos y `docs/` | Confirmada |
| D-29 | **Invertir (cuenta comitente de práctica, SIM-14)** pasa a la **fase A** como nivel 7 (5.0, 5.4); cripto queda en fase B | Confirmada |
| D-24 | La presentación del taller **no se sube** al repositorio: la base de contenido es su resumen en el Anexo A | Confirmada |
| D-25 | Los datos regulatorios salen de fuentes oficiales (BCRA, CNV, BYMA, Caja de Valores, argentina.gob.ar, INDEC) y se registran en el Anexo B con fecha de verificación | Confirmada |
| D-23 | Programa en cinco tramos con 16 módulos en fase A y 2 en fase B (F3, F11) | Provisoria, Lourdes puede reordenar |

---

## 1. Qué es este proyecto

Una **plataforma corporativa de aprendizaje** sobre bienestar financiero: una empresa la ofrece a su gente como beneficio y como capacitación. **Para quien aprende, la plataforma es una billetera virtual y plataforma de inversión simulada** (D-50, 1.3): no entra a "un curso", entra a su cuenta. Combina lo que hoy usa el mercado corporativo de aprendizaje: la estructura y el seguimiento de un **LMS** (programas asignados, cohortes, evaluaciones, reportes) con la experiencia personalizada de una **LXP** (diagnóstico, ruta adaptativa, aprendizaje práctico, recordatorios en el momento justo). Ver 5.2.

El contenido está pensado para **Argentina**: inflación, plazo fijo tradicional y UVA, tasas TNA y TEA, costo financiero total, cuotas sin interés, aguinaldo.

El objetivo es **mostrar en un portfolio** el diseño de experiencias de aprendizaje corporativo (diagnóstico, rutas adaptativas, módulos, práctica con simuladores, evaluaciones variadas y medición de impacto), flujos con varios roles y privacidad por diseño. No es un producto en producción.

**Pensado para crecer:** el modelo de datos se organiza como academia > programa > módulo > lección, para que este programa de finanzas pueda vivir más adelante dentro de una **academia corporativa interna** con otros programas (ciberseguridad, IA, etc.), que es el siguiente proyecto de Lourdes.

### Principios

- **Prototipo funcional, no maqueta:** las pantallas responden y los cambios persisten en `localStorage`.
- **Sin backend:** datos en JSON en `src/data/`, manejados en el cliente.
- **Educación, no asesoramiento:** la plataforma enseña conceptos y deja practicar con escenarios. **Nunca recomienda** un producto, una entidad financiera ni una decisión de inversión concreta, y lo dice en forma visible (ver 1.2).
- **Datos financieros ficticios o locales:** en la demo, todos los montos son ficticios. Lo que una persona carga en un simulador queda **solo en su navegador** y la empresa nunca lo ve.
- **Supuestos editables y fechados, nunca "tasas actuales":** sin backend no hay datos en vivo. Los valores por defecto son **escenarios de ejemplo** rotulados como tales, con enlaces a las fuentes oficiales para consultar los valores reales.
- **Cálculos verificables:** cada fórmula está documentada en `docs/formulas.md` y tiene tests unitarios con casos calculados a mano.
- **Privacidad por diseño:** la empresa solo ve métricas de aprendizaje agregadas, con un mínimo de personas por grupo. Nunca ve la situación financiera de nadie.
- **Seguridad de nivel corporativo en tres capas**, igual que Rumbo: simulada en la interfaz, aplicada de verdad en el front y documentada para producción (sección 8).
- **Sin fricción para el visitante:** accesos de demo de un clic.
- **Selector "Ver como" visible** para cambiar de rol.
- **Accesibilidad WCAG 2.2 AA** desde el diseño (2.10).
- **Responsive verificado, sin desbordes** (2.7).

### 1.3 Concepto central: aprender usando la billetera (D-50)

- **El participante no ve un campus:** ve una app de billetera e inversión con dinero ficticio. Cobra su sueldo de demo, paga, presupuesta, ahorra, hace rendir su dinero, toma o rechaza crédito e invierte. Cada uso enseña algo en el momento.
- **Progresión por desbloqueo:** la app empieza con lo básico (la cuenta) y las secciones se habilitan al cumplir **logros y metas** (5.0). El orden de desbloqueo **es** el contenido: por ejemplo, Invertir se habilita cuando tienes fondo de emergencia y no tienes deudas caras, que es la regla "pagar deudas, después ahorrar, después invertir" de la presentación (A-23).
- **Qué pasa con las piezas de aprendizaje:**
  - **Módulos y lecciones (F3)** → **guías** de 5 a 8 minutos dentro de cada sección, en la pestaña Aprender y en tarjetas en el momento justo. Mantienen la secuencia de Gagné y los objetivos observables.
  - **Evaluaciones (5.1)** → **desafíos de nivel**: para desbloquear una sección hay que superar su desafío (70 % mínimo, cuenta el mejor intento).
  - **Simuladores (F4)** → **herramientas** dentro de las secciones (la calculadora de tasa real en Rendir, la de CFT en Crédito, la de CEDEAR en Invertir) y también juntas en "Herramientas".
  - **Metas y desafíos (F5)** → **apartados con meta** y **logros**; los desafíos semanales del tutor siguen igual.
  - **Diagnóstico (F2)** → "**Conocerte**", parte de la apertura de la cuenta. Sus resultados pueden **desbloquear secciones** directamente si la persona ya sabe (5.0).
- **Lo corporativo no cambia:** landing, acceso con SSO y MFA simulados, roles, paneles del tutor, el admin de L&D y el decisor, cohortes, privacidad y medición de impacto siguen igual. Solo cambia lo que ve el participante.
- **La landing** sigue mostrando SIM-3 sin iniciar sesión y presenta el producto como "la billetera donde tu equipo aprende finanzas usándola".

### 1.1 Fuente del contenido

La base del contenido es material **ya validado** del taller "Del aula al primer trabajo" de Lourdes:
- **Presentación "Educación financiera: transformá tu relación con el dinero"** del Lic. Kevin Giampieri. **El archivo no se sube al repositorio (D-24):** su contenido está resumido, diapositiva por diapositiva, en el **Anexo A** de este documento, y ese resumen es la fuente que usas. Cubre psicología del dinero, conceptos fundamentales, deudas, administración, inversión (interés compuesto, ETFs e índices, cripto) y ejecución (brókers regulados por la CNV y apertura de cuenta).
- **Sitio del taller** (`https://lpedaci.github.io/taller-primerempleo/`): secciones "El recibo de sueldo" y "Finanzas personales", con calculadoras de inflación e interés compuesto.
- **Escape room "Tu primer sueldo"** (ver 5.1).

- **Datos oficiales verificados (Anexo B):** normativa y datos del BCRA, la CNV, BYMA, Caja de Valores, argentina.gob.ar e INDEC, relevados el 11/11/2026 con su fuente. Toda ampliación se construye sobre esos datos y no sobre blogs, medios ni sitios de brókers.
- **Brókers registrados (Anexo C)** y **billeteras y fintech (Anexo D).**

Reglas para usar esa base:
- Lo que está en esas fuentes se considera **contenido validado**: se adapta (tono corporativo, tuteo neutro, vocabulario de 2.9), pero **no se cambian datos ni conceptos** sin consultar a Lourdes. Registrar en `docs/content.md` de qué diapositiva (A-xx), sección del taller o dato oficial (B-xx) sale cada contenido.
- Lo que Alcancía **agrega para profundizar** (mercado de capitales, CEDEARs, billeteras virtuales y fintech) se marca en `docs/content.md` como "Ampliación: pendiente de revisión del Lic. Kevin Giampieri", con las fuentes oficiales usadas.
- Los **datos fechados** del material (precios de ETFs en pesos, tasas de ejemplo, rendimientos históricos) se muestran siempre con su fecha y su fuente, y como referencia histórica, nunca como valor actual.
- El tono del material original, pensado para jóvenes (por ejemplo, comparaciones con influencers), se adapta a un público adulto y corporativo sin perder la cercanía.

### 1.1.1 Contexto argentino: qué enseña y cómo se trata

El programa se organiza en **cinco tramos** (ver el catálogo en F3): bases y mentalidad; deudas y crédito; ahorro e inflación; invertir y mercado de capitales; billeteras, fintech y seguridad.

Reglas:
- **Nada de valores presentados como actuales.** Los simuladores usan escenarios de ejemplo, con el texto "Valores de ejemplo para aprender. Consulta los valores vigentes en las fuentes oficiales".
- **Fuentes oficiales para consultar**, en un panel "Dónde ver los valores reales": Banco Central de la República Argentina (tasas, UVA, CER, garantía de los depósitos, registro de proveedores de servicios de pago, Central de Deudores), INDEC (IPC), Comisión Nacional de Valores (registros públicos de agentes, idóneos y PSAV, alertas al inversor, fondos comunes de inversión), Bolsas y Mercados Argentinos (listado y ratios de CEDEARs, horarios) y Caja de Valores (custodia y CEDEARs de ETF). Las URL del Anexo B van a `src/app/sources.ts` con su fecha de verificación; si alguna dejó de responder al construir, regístralo en `docs/questions.md` y no la reemplaces por una fuente no oficial.
- **Instrumentos e índices sí:** se pueden nombrar como ejemplos educativos (acciones, bonos, obligaciones negociables, FCI, CEDEARs, ETFs como los que replican el S&P 500, el Nasdaq 100 o el ACWI, Bitcoin), igual que en el material del taller.
- **Brókers sí, con reglas (D-22, Anexo C):** se nombran ALyC registradas en la CNV en la ficha "Brókers registrados", con razón social, categoría y matrícula, en orden alfabético y con el enlace al Registro Público de Agentes de la CNV para que la persona verifique. Sin logos, sin comisiones, sin rankings, sin "el mejor" ni enlaces de alta. Los flujos simulados (por ejemplo, abrir una cuenta en SIM o en una lección) usan siempre un **bróker ficticio** ("Bróker de Ejemplo S.A., matrícula ficticia") para no imitar la interfaz de una empresa real.
- **Billeteras y fintech sí, con las mismas reglas (D-26, Anexo D):** se nombran en la ficha "Billeteras y fintech en Argentina", clasificadas por el tipo de cuenta que te dan (cuenta de pago con CVU, cuenta bancaria con CBU, billetera que solo conecta tus cuentas, o servicios cripto), porque ese tipo define qué protección tiene tu dinero. Sin logos, colores de marca, tasas, promociones ni rankings, y con enlace al registro oficial correspondiente.
- **Los bancos tradicionales no se listan:** se nombran solo cuando son los que están detrás de una billetera (por ejemplo, el banco de una billetera bancaria). En el resto del contenido se usa "un banco".
- **Simulaciones siempre ficticias:** la billetera de práctica (SIM-13) y la cuenta comitente de práctica (SIM-14) tienen marca, colores y pantallas propias de Alcancía, sin parecerse a ninguna app real.
- **Rendimientos históricos con su contexto:** período, moneda, fuente y la frase "Los rendimientos pasados no garantizan rendimientos futuros".
- **Riesgo siempre visible:** cada instrumento muestra su nivel de riesgo, su liquidez y en qué moneda está, en una ficha estándar.
- **Glosario integrado:** cada término técnico (TNA, CFT, UVA, CER, CEDEAR, ETF, FCI, CVU, PSP, DCA) se explica la primera vez que aparece, con un chip que abre la definición.

### 1.2 Avisos legales y éticos

- Aviso visible en el pie de cada simulador y en la landing: "Contenido educativo. No es asesoramiento financiero ni una recomendación de inversión."
- Los resultados se presentan como **escenarios**, no como predicciones: "Si la inflación fuera del 3 % mensual…", nunca "Vas a ganar…".
- Mostrar siempre los supuestos usados junto al resultado.
- Ningún texto genera urgencia o presión para invertir.
- El contenido base es del Lic. Kevin Giampieri (1.1); las ampliaciones quedan marcadas como pendientes de su revisión en `docs/content.md`.
- **Perfil de inversor:** el test del módulo es educativo (enseña qué es y para qué lo piden los brókers); el resultado nunca se traduce en una cartera recomendada.
- **Cripto y productos de alto riesgo:** solo conceptos, riesgos y custodia; nunca "cuánto" ni "cuál" comprar.

---

## 2. Sistema de diseño y referencias

Se mantiene **la misma forma de trabajo de Rumbo**. Lo que sigue define lo propio de Alcancía y repite las reglas comunes para que este archivo sea autosuficiente.

### 2.1 Base: Material Design 3, personalizado
- Fundamentos de **Material Design 3** (roles de color, escala tipográfica, elevación tonal, estados, patrones), implementados con **Tailwind + shadcn/ui** y tokens propios, sin librería de Material.
- **Arquitectura de tokens en cuatro niveles**, como Rumbo (siguiendo M3 y el W3C Design Tokens Community Group): (1) referencia, valores crudos; (2) sistema, `--md-sys-color-*`, `--role-*`, `--chart-*`, `--space-*`, `--elevation-*`, `--md-sys-motion-*`; (3) tema de Tailwind con `@theme inline`, sin la paleta ni los radios por defecto; (4) componentes con variantes en `cva`. Ningún componente usa un valor suelto.
- `tokens.test.ts` verifica el contraste AA de cada combinación de tokens.
- **Personalización obligatoria:** paleta, tipografía, radios y densidad propios. Sin logos ni marcas de otras empresas, salvo los logos oficiales de Microsoft y Google en los botones de inicio de sesión y las marcas de LinkedIn y GitHub en los enlaces a los perfiles de Lourdes en el pie de la landing.
- **Densidad:** más aireada que Rumbo en las vistas de aprendizaje y simuladores (se leen y se exploran), y de herramienta en los paneles del tutor, el admin y el decisor.
- Modo claro como principal; tokens preparados para modo oscuro.

### 2.1.1 Paleta: roles de color de Material 3 (provisoria, D-01)

**Carácter:** confiable, clara y tranquila, sin estética de casino ni de "trading". Fondos blancos y neutros grises fríos. **No** usar fondos crema o beige, tonos tierra, terracota ni coral (no debe parecerse a Claude ni a otras herramientas de IA), ni el verde dinero chillón ni el dorado. **Única excepción (D-52):** el naranja de Fuerte (5.0.1), solo en el personaje y sus luces, con relleno plano; nunca en botones, fondos, gráficos, estados ni ningún otro componente.

| Rol M3 | Base | Container | On-container | Uso |
| --- | --- | --- | --- | --- |
| `primary` (índigo) | `#3D4FA8` | `#DEE1FA` | `#141F5C` | Acción principal, navegación activa, enlaces, foco |
| `secondary` (índigo apagado) | `#55607A` | `#DCE2F2` | `#1A2236` | Botones tonales, chips de filtro, menor énfasis |
| `tertiary` (verde azulado) | `#00796B` | `#CDEDE8` | `#00332D` | Acentos: logros, metas alcanzadas, segunda serie de gráficos |
| `error` | `#B3261E` | `#F9DEDC` | `#5C1210` | Errores y acciones destructivas |
| `success` (personalizado) | `#2E7D32` | `#DCEFDD` | `#123D15` | Completado, correcto |
| `warning` (personalizado) | `#8A5300` | `#FCEBC7` | `#4A2C00` | Atención, riesgo, pendiente |
| `info` (personalizado) | `#2457C5` | `#DCE6FB` | `#0F2A66` | Avisos, ayuda, supuestos |

Los "on" de las bases son `#FFFFFF`. Contraste verificado: bases sobre blanco desde 5,3:1; on-container desde 11:1.

**Superficies y neutros:** `surface` `#F1F3F5`, `surface-container-lowest` `#FFFFFF`, `surface-container` `#EEF2F4`, `surface-container-high` `#E4E9EC`, `on-surface` `#111827`, `on-surface-variant` `#4B5563`, `outline` `#7D8793` (3:1), `outline-variant` `#D5DBE0`, `inverse-surface` `#1F2A30` (tooltips y toasts).

**Colores por rol** (identifican personas, nunca estados):

| Rol | Base | Container |
| --- | --- | --- |
| `role-org-admin` | `#3D4FA8` | `#DEE1FA` |
| `role-tutor` | `#00796B` | `#CDEDE8` |
| `role-participant` | `#7A4FB0` | `#EDE3F8` |
| `role-sponsor` (decisor) | `#5D6B2F` | `#E7ECD6` |

**Reglas de color**
- Profundidad por elevación tonal, no por sombra.
- El color nunca es la única señal: estados con ícono y texto.
- **Ganancias y pérdidas:** no se pintan solo de verde y rojo. Llevan signo (+ / −), ícono de tendencia y texto ("Pierdes poder de compra"). Una pérdida de poder de compra usa `warning`, no `error`: es información, no una falla de la persona.
- Colores de estado solo para estados, nunca como series.
- Series de gráficos, en este orden: `primary`, `tertiary`, `#7C8BD6` (índigo claro), `#3B8C80` (verde azulado claro), `#6B7280` (gris). Todas con al menos 3:1 sobre blanco.

### 2.1.2 Tipografía: Inter con la escala de Material 3
- Inter alojada en el proyecto (`@fontsource-variable/inter`).
- Roles tipográficos de M3; títulos con la variante enfatizada de M3 Expressive:

| Rol M3 | Tamaño / interlineado | Peso | Uso |
| --- | --- | --- | --- |
| `display-medium` (enfatizado) | 45 / 52 | 600 | Resultado principal de un simulador desde 1024 px |
| `display-small` (enfatizado) | 36 / 44 | 600 | KPIs desde 1280 px, resultado del simulador en mobile, títulos de sección de la landing |
| `headline-medium` (enfatizado) | 28 / 36 | 600 | Título de página (único `h1`) en la app y el acceso (D-163 de Claude Code) |
| `headline-small` (enfatizado) | 24 / 32 | 600 | Título destacado dentro de una página; títulos de la landing en mobile |
| `title-large` (enfatizado) | 22 / 28 | 600 | Título de sección (`h2`) |
| `title-medium` (enfatizado) | 16 / 24 | 600 | Título de tarjeta, modal y grupo (`h3`) |
| `title-small` | 14 / 20 | 500 | Subtítulos, encabezados de tabla |
| `body-large` | 16 / 24 | 400 | **Texto de las lecciones** y texto base en mobile |
| `body-medium` | 14 / 20 | 400 | Texto base en paneles, celdas |
| `body-small` | 12 / 16 | 400 | Ayuda de campos, supuestos, metadatos |
| `label-large` | 14 / 20 | 500 | Botones, pestañas, navegación |
| `label-medium` | 12 / 16 | 500 | Etiquetas, chips, píldoras |
| `label-small` | 11 / 16 | 500 | Solo contadores e insignias |

- Lecciones con un ancho de lectura de 60 a 72 caracteres por línea.
- **Montos, porcentajes, tablas y fechas con cifras tabulares** (`tabular-nums`).
- `rem`, nunca `px` fijos en el CSS final.

### 2.1.3 Botones (Material 3 Expressive)
Igual que Rumbo: Filled (uno solo por región), Filled tonal, Outlined, Text, Filled de error solo para confirmar acciones destructivas, e Icon buttons con `aria-label` y tooltip. Tamaños S (40 px) por defecto, XS (32 px) en filas densas y M (56 px) para la acción principal de pantallas de un paso en mobile. Una sola forma, cuadrada con esquinas suaves, sin animación de cambio de forma. Área táctil de 48 × 48 px en mobile. Sin Elevated buttons ni FAB. Estados: reposo, hover, foco, presionado, deshabilitado (con explicación) y cargando. Segmented buttons o chips para alternativas excluyentes (por ejemplo, escenarios de inflación).

### 2.2 Referencias visuales
- Las referencias de Lourdes están en `/design-references/` (las mismas de Rumbo, más las que se sumen para este producto). **Esa carpeta es solo local: está en `.gitignore` y nunca se publica**, porque son capturas de otros autores. En `docs/visual-audit.md` se describen con palabras, con el nombre del autor y el enlace a la publicación original, sin copiar las imágenes (D-66). Abre cada archivo antes de diseñar la pantalla relacionada y registra en `docs/visual-audit.md` qué se toma de cada una.
- **Para la billetera (D-50):** las imágenes de `/design-references/` muestran cómo deben verse el inicio de la cuenta, el dashboard y las demás secciones. Son la referencia principal de layout, jerarquía, densidad y componentes del entorno del participante. Antes de construir cada sección de 5.0, compárala con su referencia; si una pantalla no tiene referencia, deriva el estilo de las que sí tienen. Registra la correspondencia en `docs/visual-audit.md`.
- Se aplican los mismos criterios de Rumbo: tomar funcionalidad y modalidad visual; **nunca fondos con degradé**; gráficos de área con relleno plano de baja opacidad; no copiar ilustraciones, íconos ni textos de terceros.
- Si Lourdes suma referencias específicas de apps financieras o de aprendizaje, agregarlas a la tabla de abajo con qué tomar de cada una.

**Referencias de la landing:** Payora y Finotive (D-150 y D-151 de Claude Code), descritas en `docs/visual-audit.md`, que es la fuente de qué se toma de cada una.

**Referencias del dashboard (agregadas el 12/11/2026).** Son paneles de plataformas de aprendizaje y de salud, no billeteras: se toma **estructura y jerarquía**, nunca su contenido, marca ni estilo de ilustración.

| Referencia | Qué tomar | Qué no tomar |
| --- | --- | --- |
| Cognify (panel de exámenes) | Título con subtítulo de una línea; fila de KPIs en tarjetas de contenedor de color con ícono arriba a la derecha y texto de contexto debajo ("Weakest topic: …" → "Te falta: …"); tabla de resultados con barra de progreso y porcentaje | La tarjeta azul con degradé y brillo (se reemplaza por `primary-container` plano); el gráfico de barras sin frase de conclusión |
| Coursify (panel de cursos) | Menú lateral con ítem activo en píldora y tarjeta de acción abajo (→ indicador de nivel y próximo desbloqueo); columna derecha fija (→ panel de la misión con Fuerte); lista de actividad reciente con ícono en círculo (→ últimos movimientos) | Rellenos de área con degradé, rosa y amarillo de marca, ilustraciones 3D, mapa y dona decorativos |
| Educo (inicio del estudiante) | Banner de saludo de ancho completo con nombre y frase (→ saludo de P1 con Fuerte en lugar de la ilustración); lista de tarjetas con miniatura, título, metadatos y botón tonal (→ guías y misiones); KPIs pequeños en grilla 2 × 2 | Ilustraciones 3D, fotos de terceros, la tarjeta de clase en vivo |
| Avenra (panel clínico) | Saludo grande con fecha y acciones a la derecha (filtro, fecha, asistente); tarjetas con botón de flecha en la esquina para ir al detalle; selector de días en pestañas con contador (→ "Avanzar un día / semana / mes" y calendario de vencimientos); tabla con chips de estado con punto e ícono | El objeto translúcido con degradé y el fondo lila con degradé; tarjetas apiladas con sombra; gráfico de líneas diagonales decorativo |

Reglas comunes al usar estas referencias: fondos y tarjetas planos (2.2, 2.5); cada gráfico con frase de conclusión y "Ver como tabla" (2.10); dona solo si hay una parte de un total que importa (por ejemplo, el reparto 50/30/20 del presupuesto), con su tabla; fotos de personas solo en los avatares de las cinco personas de la demo (D-165 de Claude Code); el resto, iniciales sobre el color del rol.

### 2.2.1 Dirección visual: propia, no genérica

Aprendizaje de Rumbo: la sobriedad (sin degradés, pocas sombras, paleta fría) **no es una interfaz plana**. La riqueza visual sale de la jerarquía, los datos, el acento y la composición. Patrones a usar desde la primera versión:

1. **Capas visibles:** fondo `surface` gris con tarjetas blancas encima.
2. **Saludo en el inicio de cada rol:** fecha, saludo con el nombre en `primary` (único `h1`) y chips de contexto ("Nivel 3 · Presupuesto", "Próximo desbloqueo: Apartados"). El dato que pide atención va en `tertiary-container`.
3. **KPIs con vida:** ícono en contenedor de color, sparkline, etiqueta, número grande y píldora de variación debajo.
4. **Gráficos protagonistas** con relleno plano y tooltip oscuro (`inverse-surface`).
5. **Navegación lateral flotante** plegable a íconos, con el ítem activo en píldora `primary`; barra superior flotante con logo, "Ver como", Ayuda y Notificaciones.
6. **Personas con color de rol:** las cinco personas de la demo tienen foto de perfil con un anillo del color de su rol (fotos de stock de Magnific con licencia gratuita, atribuidas en el pie de la landing, el case study, la documentación y el sistema de diseño; D-165 de Claude Code y D-71); el resto, iniciales sobre el contenedor del rol.
7. **Bienvenida guiada** de 3 o 4 pasos al primer ingreso de cada rol, con zona ilustrativa hecha con componentes reales en miniatura, puntos de progreso, "Anterior" y "Continuar" (como el video `original-d624f662` de las referencias).
8. **Mapa de niveles como línea de tiempo (5.0):** un tramo por nivel, con estado (completado, en curso, bloqueado con qué falta) con ícono y texto, y el nivel actual destacado.
9. **Anatomía del simulador** (patrón propio, el más importante del producto):
    - **Desktop:** a la izquierda, el panel de datos (campos con etiqueta, ayuda y ejemplo); a la derecha, el **resultado principal** en `display-medium`, una frase que lo explica en lenguaje simple ("Con 3 % de inflación mensual, en 12 meses tu dinero compra un 30 % menos"), el gráfico y "Qué significa esto".
    - **Mobile:** datos arriba, resultado fijo en una franja visible al cambiar los datos, gráfico y explicación debajo.
    - **Panel de supuestos** plegable, siempre visible en resumen ("Escenario: inflación media, 3 % mensual · Valores de ejemplo"), con "Dónde ver los valores reales".
    - **Comparar escenarios:** guardar el escenario actual y verlo al lado de otro.
    - **"Prueba cambiar…":** una sugerencia didáctica que invita a mover un dato para ver el efecto.
    - Aviso legal al pie del simulador (1.2).
10. **Lección por pasos:** pantalla de lectura con progreso arriba, bloques cortos, un ejemplo con números, una pregunta de práctica con retroalimentación inmediata y el simulador embebido cuando corresponde.
11. **Retroalimentación formativa:** respuestas correctas con `success` y explicación; incorrectas con `info` (no `error`) y la pista para volver a intentarlo, nunca un mensaje que culpe.
12. **Logros con medida:** insignias simples al completar módulos y metas, con el acento `tertiary`; sin confeti ni animaciones en bucle.
13. **Tarjetas de meta:** nombre, monto objetivo ajustado por inflación, ahorro acumulado, barra de progreso y fecha estimada.

**Proceso:** igual que en Rumbo, antes de construir el resto de las pantallas armar un **piloto** (styleguide, landing G0, inicio del participante P1 y el simulador de inflación SIM-3), mostrar capturas a Lourdes y **esperar su aprobación**.

### 2.3 Íconos
**Material Symbols** Rounded, peso 300, en SVG importado por ícono, mediante un componente único `<Icon name="..." />`. Contorno por defecto y relleno solo para lo activo o seleccionado. Decorativos con `aria-hidden`; botones de solo ícono con `aria-label` y tooltip.

### 2.4 Layout bento
Paneles y resúmenes (P1, T1, O1, D1) en grilla bento: 12 columnas desde 1200 px (coincide con el menú lateral, D-104 de Claude Code), 6 en tablet y 1 en mobile, con `<BentoCard size="sm | md | lg | wide | tall">`, el mismo espacio, radio y padding, y sin huecos (una tarjeta sola en media fila ocupa la fila completa). Ritmo vertical de 8 px: 32 px entre secciones y de 8 a 16 px dentro de cada una.

### 2.5 Sombras
Tarjetas separadas por superficie y borde, sin sombras. Solo dos niveles de sombra (`--elevation-1` para menús, popovers y tooltips; `--elevation-2` para modales y toasts). Prohibido: sombras en tarjetas en reposo, de colores, apiladas o decorativas.

### 2.6 Animaciones concretas
Con **Motion**, de 150 a 300 ms y curvas de M3:
- **Resultado del simulador:** el número cambia con una transición corta al modificar un dato (sin contar desde cero cada vez) y el gráfico se redibuja con transición.
- **Respuesta de práctica:** la opción elegida muestra su estado con un fundido; la explicación se despliega.
- **Progreso de ruta y metas:** las barras se llenan al entrar y se actualizan al cambiar.
- **KPIs:** cuentan hasta su valor la primera vez en la sesión.
- **Bento y listas:** entrada escalonada, 50 ms entre elementos.
- **Flujos por pasos** (diagnóstico, bienvenida, lecciones): transición lateral y avance de los puntos.
- **Logro desbloqueado:** la insignia aparece con escala corta, una sola vez.
- Modales, menús y toasts con fundido y escala corta; esqueletos de carga con pulso suave.
- Respetar `prefers-reduced-motion` y la preferencia "reducir animaciones": solo opacidad.
- Nada de rebotes, confeti ni animaciones en bucle.

### 2.7 Responsive y desbordes
- Anchos a verificar: **320, 375, 768, 1024, 1280 y 1440 px**.
- Cero desborde horizontal de la página. Textos largos con puntos suspensivos y tooltip o en dos líneas.
- **Montos largos** (por ejemplo `$ 12.345.678,90`): nunca se cortan; si no entran, bajan un rol tipográfico o pasan a notación abreviada con el valor completo accesible ("$ 12,3 M", con `aria-label` del valor completo).
- Tablas en mobile como listas de tarjetas; si una tabla debe quedar, el desplazamiento ocurre dentro de su contenedor.
- Componentes que viven en tarjetas de distinto ancho se reacomodan con container queries (`@container`).
- Áreas táctiles de 48 × 48 px en mobile. Botón "Volver arriba" que aparece al desplazarse.
- **Test de Playwright** que recorre las pantallas de cada rol en los 6 anchos, saca capturas en `docs/screenshots/` y falla ante desbordes, textos aplastados o botones que cruzan el borde de su tarjeta.

### 2.8 Reglas de uso
- Si una referencia contradice este documento en **funcionalidad**, manda este documento; en **aspecto visual**, manda la referencia (salvo los degradés).
- Tokens en `src/styles/tokens.css` y en el tema de Tailwind antes de construir pantallas; página interna `/styleguide`.
- **Sitio público del sistema de diseño** en `/#/design-system`, como el de Rumbo: principios, arquitectura de tokens, color (con contraste leído en vivo), tipografía, espacio y forma, íconos, movimiento, componentes reales, patrones (con el número de decisión que los originó), accesibilidad y voz y tono. Sumar dos secciones propias: **"Cómo mostramos el dinero"** (formato de montos, porcentajes, ganancias y pérdidas, supuestos y avisos) y **"Seguridad y privacidad"** (D-70): las capas de la seguridad simulada como patrones de diseño (cartel "dinero ficticio", marca propia, sin datos reales, montos solo en el navegador, umbral de 5, lo que ve cada rol), qué protege hoy el front en GitHub Pages y qué se sumaría en producción, con enlace a `docs/security.md`. **Créditos:** las fotos de stock y cualquier otro recurso con licencia que pida atribución se acreditan también aquí, además del pie (D-71). `docs/design-system.md` es su versión en Markdown.

### 2.9 Voz y tono

**Idioma:** español latinoamericano neutro, con **tuteo** (confirmado en D-03). Contenido financiero argentino, explicado para que se entienda en cualquier país de la región.

**Personalidad:** clara, paciente y sin juicio. Como una docente que explica finanzas sin hacerte sentir mal por lo que no sabes. Nunca alarmista ni vendedora.

**Principios**
1. **Claridad primero:** frases cortas, una idea por oración, ejemplos con números redondos.
2. **Sin culpar ni avergonzar:** hablar de hábitos, no de errores personales. "Muchas personas pagan el mínimo de la tarjeta; veamos cuánto cuesta", no "Pagar el mínimo es un error".
3. **Términos técnicos explicados:** la primera vez, con definición breve y chip al glosario.
4. **Escenarios, no promesas:** "Si…, entonces…", nunca "Vas a ganar".
5. **Lenguaje inclusivo sin marcas tipográficas:** "Te damos la bienvenida", "las personas participantes".
6. **Tono según el momento:** cálido en logros y metas; neutro en paneles; serio en deudas, estafas y privacidad.
7. Sin signos de exclamación salvo para celebrar avances reales, como máximo uno por pantalla.

**Vocabulario fijo**

| Usar | Evitar o aclarar |
| --- | --- |
| Iniciar sesión / Cerrar sesión | Ingresar, loguearse |
| Correo / cuenta de trabajo | Mail, cuenta corporativa |
| Panel | Dashboard |
| Plazo fijo tradicional / plazo fijo UVA | Plazo fijo "común" |
| Tasa nominal anual (TNA) | "Tasa" sola, sin decir cuál |
| Tasa efectiva anual (TEA) | Explicar la diferencia con la TNA la primera vez |
| Costo financiero total (CFT) | "Interés de la tarjeta" como si fueran lo mismo |
| Inflación / poder de compra | "Pérdida de plata" |
| Cuotas sin interés | "Cuotas gratis" |
| Fondo de emergencia | "Colchón" (puede usarse como sinónimo coloquial una vez, entre comillas) |
| Aguinaldo (sueldo anual complementario) | SAC sin explicar |
| Meta de ahorro | Objetivo, target |
| Programa / módulo / lección | Curso, clase, materia |
| Tutor o tutora (persona); "Tutoría" en chips y menús | Docente, profesor, facilitador |
| Persona colaboradora / participante | Colaborador/a, empleado (en la interfaz) |
| Cohorte | Grupo, comisión |
| Desafío de nivel (evaluación para desbloquear) / desafío semanal (del tutor); nunca "desafío" solo | Examen, prueba |
| Celular / computadora | Móvil, ordenador |

**Formato de números**
- Pesos: `$ 1.234.567,89` (signo, espacio de no separación, punto de miles y coma decimal; D-68). En moneda extranjera, siempre con código: `USD 1.200`.
- Porcentajes: `3 %` mensual, `42,5 %` anual, siempre aclarando el período.
- Fechas `DD/MM/AAAA`; meses en palabras en los gráficos ("ene 2027").

**Microcopy**
- Títulos sin punto final. Botones con verbo + objeto ("Calcular escenario", "Guardar meta").
- Confirmaciones destructivas que repiten la consecuencia ("Eliminar meta"), nunca "Sí / No".
- Estados vacíos que explican qué va a aparecer y cómo empezar.
- Toasts en pasado y breves ("Meta guardada").

**Inglés:** misma personalidad, inglés estadounidense, sentence case. Los términos argentinos se mantienen con su explicación ("plazo fijo UVA (inflation-indexed term deposit)").

### 2.10 Accesibilidad (WCAG 2.2 AA, ISO/IEC 40500:2025)

Todo lo de Rumbo aplica igual:
- **Formularios:** etiqueta visible arriba; texto de ayuda debajo con **qué poner, formato y ejemplo**, asociado con `aria-describedby`; el placeholder nunca reemplaza la etiqueta; "(obligatorio)" en texto; errores que no aparecen mientras se escribe por primera vez, que van donde está el problema, dicen qué corregir, desaparecen al corregirse y nunca borran lo cargado; error de servidor simulado con "Reintentar"; `autocomplete` correcto; no pedir dos veces el mismo dato; autenticación accesible.
- **Teclado y foco:** todo con teclado, "Saltar al contenido", foco visible y nunca tapado, foco atrapado en modales, alternativa a cualquier gesto.
- **Estructura:** landmarks, un `h1` por pantalla, `lang` correcto, `aria-live` para cambios de estado, estados con ícono y texto.
- **Tiempo y tamaño:** aviso de sesión por vencer, `prefers-reduced-motion`, áreas de clic de 24 × 24 px en desktop y 48 × 48 px en mobile, reflujo a 320 px y zoom al 200 %.

Propio de Alcancía:
- **Campos de dinero y porcentajes con máscara:** solo aceptan dígitos, coma decimal y, en porcentajes, el signo menos si corresponde; formatean el miles al salir del campo; aceptan pegar "$ 1.500,50" o "1500.50" y lo normalizan; el lector de pantalla anuncia el valor final. Texto de ayuda con rango y ejemplo: "Monto en pesos, por ejemplo: 150.000".
- **Deslizadores siempre con campo numérico al lado**, sincronizados, y operables con flechas del teclado.
- **Resultados del simulador anunciados** con `aria-live="polite"` cuando cambian, con una demora breve para no anunciar cada tecla.
- **Gráficos:** título, frase con la conclusión, y tabla equivalente ("Ver como tabla").
- **Preguntas de práctica y evaluaciones:** grupos de opciones con `fieldset` y `legend`, retroalimentación anunciada, sin límite de tiempo.
- **Lecturas:** texto `body-large`, ancho de lectura cómodo, sin bloques de texto justificado.

**Verificación:** axe sin errores en todas las pantallas, recorrido con teclado de cada flujo principal y prueba con lector de pantalla en el diagnóstico, una lección y un simulador. Hallazgos en `docs/issues.md`.

---

## 3. Stack técnico

| Capa | Herramienta |
| --- | --- |
| Base | React 18 + Vite + TypeScript |
| Estilos | Tailwind CSS, tokens propios en cuatro niveles |
| Componentes | shadcn/ui (Radix) con variantes `cva` adaptadas a M3 |
| Navegación | React Router con `createHashRouter` (GitHub Pages; permite `useBlocker` para avisar cambios sin guardar) |
| Estado | Zustand con persistencia en `localStorage` |
| Formularios | React Hook Form + Zod |
| **Cálculos financieros** | Módulo propio en `src/lib/finance/`, con **decimal.js** para evitar errores de punto flotante en dinero y tasas |
| Gráficos | Recharts |
| Fechas | date-fns con locale `es` |
| Íconos | Material Symbols en SVG |
| Animaciones | Motion |
| Idiomas | react-i18next: todos los textos pasan por i18n; en fase A, español completo y la landing en inglés; el resto en inglés en fase B (F17) |
| Tests | Vitest (unitarios y de fórmulas) y Playwright (desbordes, axe, flujos) |
| Deploy | GitHub Pages vía GitHub Actions |

### Convenciones
- Interfaz en español latinoamericano neutro (2.9) e inglés; textos en `src/locales/`.
- Código, variables, comentarios y commits en inglés.
- **Dinero como `Decimal` o en centavos enteros**, nunca como `number` de punto flotante en los cálculos. Tasas como fracciones (`0.03`), mostradas como porcentaje.
- Fechas `DD/MM/AAAA` en la interfaz e ISO en los datos.
- Sin guiones largos (—) en los textos de la interfaz.

### Estructura sugerida
```
src/
  app/              # router, layout, providers, sources.ts, legal.ts, config.ts
  components/       # ui/, charts/, layout/, money/ (MoneyInput, PercentInput, MoneyText)
  features/
    landing/        # G0
    auth/           # G1 a G5
    wallet/         # la billetera del participante (P1 a P8, P12, P14): secciones, navegación de 5.3
    levels/         # motor de niveles y desbloqueos (5.0), "Ya sé esto", modo demo
    missions/       # motor de misiones declarativo y misiones (5.3)
    companion/      # Fuerte: estados, mensajes y niveles de presencia (5.0.1)
    invest/         # cuenta comitente de práctica (SIM-14, 5.4)
    diagnostic/     # "Conocerte" (diagnóstico) y resultado
    learning/       # mapa de niveles, guías, desafíos y logros (P9 a P11)
    simulators/     # herramientas SIM-1 a SIM-12, comparación de escenarios (P13)
    goals/          # apartados con meta y desafíos semanales
    tutor/          # cohortes, progreso, desafíos
    organization/   # panel, personas, configuración del programa
    assessments/    # tipos de evaluación (5.1)
    sponsor/        # reporte de impacto
    glossary/
  lib/
    finance/        # fórmulas puras con tests
    metrics.ts      # métricas agregadas con umbral de privacidad
    permissions.ts
  data/             # JSON semilla
  store/
  styles/
design-references/
docs/
```

---

## 4. Empresa y roles del MVP

### 4.1 Empresa de demo
**Andina Servicios S.A.**, empresa de logística con unas 500 personas en cuatro áreas: Operaciones (incluye un centro de distribución), Administración, Tecnología y Comercial. Ofrece Alcancía dentro de su programa de bienestar.

Esto obliga a diseñar para públicos distintos dentro de la misma empresa, como pasa en el mercado corporativo:
- **Personal de oficina** que entra desde la computadora.
- **Personal operativo del centro de distribución** que entra sobre todo desde el **celular**, en ratos cortos: lecciones de 5 minutos, interfaz mobile impecable y textos simples.

### 4.2 Roles

| Rol | Persona de ejemplo | Qué hace en el MVP |
| --- | --- | --- |
| **Admin de L&D y Beneficios** | Paula Gómez, Líder de Aprendizaje y Beneficios | Configura el programa, carga personas, arma cohortes, asigna módulos y sigue la adopción |
| **Tutor** | Kevin Giovanni, tutor de bienestar financiero | Acompaña a sus cohortes: sigue el avance de aprendizaje, asigna desafíos, responde consultas y refuerza los temas con más errores |
| **Participante** | Mariana López, Analista de Operaciones (oficina), y Diego Suárez, Operario de depósito (celular) | Hace el diagnóstico, cursa su ruta, usa simuladores, define metas y responde evaluaciones |
| **Decisor** | Ricardo Benítez, Gerente de Compensaciones | Ve el reporte de impacto agregado, sin datos individuales |

- **"Ver como"** en la barra superior para cambiar de rol; para participante se elige entre Mariana y Diego, para mostrar las dos experiencias.
- **Qué ve cada rol** (mínimo privilegio):
    - El participante ve todo lo suyo. Sus **montos de simuladores y metas nunca salen de su navegador** ni los ve nadie más.
    - El tutor ve **avance de aprendizaje** de sus cohortes: módulos, resultados de evaluaciones y desafíos, de forma individual para poder acompañar, y el avance de aprendizaje de cada nivel (guías, desafío de nivel, completado), pero nunca montos, respuestas de las preguntas de hábitos del diagnóstico ni si un nivel está bloqueado o desbloqueado (D-58).
    - El admin ve adopción y avance agregados, y gestiona personas y cohortes.
    - El decisor ve solo el reporte de impacto agregado.
- Las cuentas son de trabajo: los problemas de acceso se derivan a la mesa de ayuda de la empresa, sin autogestión (como en Rumbo).

## 5. Funciones principales del MVP

Priorizadas con la misma matriz de decisión que Rumbo (valor para el usuario 40 %, demostración de habilidades 35 %, facilidad 25 %).

- **Fase A, núcleo (F0 a F8).**
- **Fase B, ampliación (F9 a F22).**

### F0. Landing, acceso y seguridad base (simulados)

**Landing (G0)**, con la estructura de página de producto B2B que funcionó en Rumbo:
1. Barra superior flotante con logo, enlaces a secciones y "Elegir un recorrido".
2. Hero con la etiqueta "Plataforma de aprendizaje corporativo en finanzas personales · Caso de diseño UX/UI B2B", titular con palabras clave en `primary`, texto breve, "Elegir un recorrido" y "Ver el case study"; a los costados, desde 1280 px, piezas reales del producto (resultado de un simulador, una tarjeta de meta, un KPI de avance).
3. **El problema:** tres tarjetas (no sé si me alcanza a fin de mes; la inflación se come mis ahorros; no entiendo cuánto me cuesta la tarjeta), cada una con una escena hecha con piezas del producto.
4. **La solución:** bento con diagnóstico y ruta, lecciones con práctica, evaluaciones variadas, simuladores, metas y panel de seguimiento.
5. **Aprende en cualquier lugar:** la misma lección en la computadora de Mariana y en el celular de Diego, para mostrar el diseño para personal de oficina y operativo.
6. **Un recorrido para cada rol:** una sección por rol con la foto de la persona y un anillo del color del rol (D-165), chip del rol, qué hace, qué se puede recorrer y "Recorrer como…", con una miniatura de su pantalla.
7. **Prueba un simulador sin iniciar sesión:** el simulador de inflación (SIM-3) embebido y funcionando en la landing.
8. **Cifras** calculadas desde los datos de demo.
9. **Recorre la demo en tres pasos** y **Preguntas frecuentes** (incluida "¿Es asesoramiento financiero?").
10. Franja final con "Elegir un recorrido" y **pie** con columnas "Explorar", "El proyecto" (case study, documentación, sistema de diseño) y "La demo"; abajo, "Diseño y desarrollo: Lourdes Pedaci, Experience Designer (Learning y UX/UI)" con enlaces a LinkedIn, portfolio y GitHub, el aviso legal y el copyright.
- URL del case study en `CASE_STUDY_URL` (mientras no exista, el portfolio: `https://lpedaci.github.io/portfolio/`).
- Sin logos de empresas "que confían" ni testimonios inventados.

**Acceso (G1 a G5)**, igual que Rumbo:
- Login limpio con "Continuar con Microsoft" y "Continuar con Google" (**logos oficiales sin modificar**, misma prominencia) e "Iniciar sesión con correo y contraseña". Texto: "Usa tu cuenta de trabajo de Andina".
- Rol preseleccionado desde la landing (`/login?demo=mariana`).
- Simulación de SSO **neutra y rotulada**, que nunca imita las páginas de Microsoft ni de Google.
- Verificación en dos pasos con código precargado en la demo (`246810`), obligatoria para admin y decisor. Se muestra solo en el acceso desde la landing; cambiar de rol con "Ver como" dentro de la demo no la repite.
- Error de credenciales genérico; bloqueo tras 5 intentos sin autodesbloqueo; "¿Problemas para iniciar sesión?" deriva a la mesa de ayuda de la empresa con un formulario de solicitud (sin rol de sistemas en el MVP: la solicitud queda registrada y se muestra la confirmación).
- Expiración de sesión por inactividad con aviso previo.
- **RBAC** desde `src/lib/permissions.ts`; rutas protegidas; "Acceso no permitido" para rutas ajenas.
- **Aviso de privacidad y consentimiento** al primer ingreso (G5), con lo que ve y no ve la empresa, en lenguaje simple: "Tu empresa ve tu avance en los módulos, nunca tus montos ni tus respuestas sobre hábitos".

### F1. Configuración del programa (admin)
- Datos del programa: nombre ("Bienestar financiero 2026", D-60), descripción, si es **voluntario** o **asignado** con fecha límite por cohorte.
- Módulos habilitados, orden sugerido y módulos obligatorios dentro del programa.
- Umbral de privacidad (mínimo 5, no se puede bajar de 5).
- Puntaje mínimo para aprobar un desafío de nivel y obtener las insignias de sus módulos (por defecto 70 %) y cantidad de intentos; al agotarlos, el desbloqueo pasa al tutor (D-57).
- El admin habilita módulos, marca los obligatorios y fija plazos, pero **no cambia el orden de los niveles** (5.0).
- Canales de recordatorio simulados: correo, Microsoft Teams o Slack (ver F9; en fase A solo la configuración).
- Logo y nombre de la empresa (ficticios) en la barra superior.

### F2. Diagnóstico inicial y ruta adaptativa (participante)
> Con D-50, el diagnóstico se presenta como "Conocerte" dentro de "Abrir tu cuenta" (nivel 0), y la ruta es el mapa de niveles de 5.0. Un nivel avanzado en una dimensión ofrece hacer el desafío de suficiencia de la sección correspondiente.

- Flujo por pasos de **10 a 12 preguntas**: hábitos (¿llevas registro de gastos?, ¿tienes ahorro para imprevistos?, ¿cómo pagas la tarjeta?) y conocimientos (qué es la TNA, qué pasa con el dinero con inflación).
- Preguntas de hábitos **sin respuestas correctas ni juicio**; preguntas de conocimiento con retroalimentación al final, no durante.
- Resultado por **cinco dimensiones**: presupuesto, ahorro y emergencias, deudas y crédito, inflación y tasas, metas e inversión (D-64). Gráfico de barras horizontales (no radar: se lee mejor y es más accesible) con su tabla.
- Nivel por dimensión (inicial, intermedio, avanzado) y **ruta propuesta**: orden de módulos según las dimensiones más débiles, explicada ("Empezamos por presupuesto porque es la base de todo lo demás").
- La persona puede reordenar las guías **dentro de un nivel ya desbloqueado**; saltar un nivel equivale a hacer su desafío de suficiencia ("Ya sé esto"); el diagnóstico se puede repetir al final para medir el avance (pre y post).

### F3. Módulos y lecciones (participante)
> Con D-50, cada módulo se convierte en **guías** dentro de la sección que le corresponde (5.0), y su evaluación en el **desafío de nivel**. El diseño instruccional de abajo no cambia.

Diseño instruccional con **Backward Design** (primero los resultados esperados, después la evidencia y por último las actividades) y la secuencia de los **nueve eventos de Gagné** adaptada a microaprendizaje:

| Evento de Gagné | En cada lección |
| --- | --- |
| Captar la atención | Una situación cotidiana con números ("Te ofrecen 12 cuotas sin interés o 15 % de descuento") |
| Informar el objetivo | "Al terminar vas a poder…" con un verbo observable |
| Recuperar lo previo | Una pregunta corta que conecta con lo que ya sabe |
| Presentar el contenido | Bloques breves con ejemplo |
| Guiar el aprendizaje | Ejemplo resuelto paso a paso |
| Provocar el desempeño | Práctica con el simulador o una pregunta |
| Dar retroalimentación | Inmediata y explicada |
| Evaluar | 3 a 5 preguntas al cierre del módulo |
| Favorecer la retención y la transferencia | "Para tu vida": una acción concreta para esta semana |

**Catálogo de módulos** (cada uno con 2 o 3 lecciones de 5 a 8 minutos), en cinco tramos. Entre paréntesis, la fuente de la base de contenido (1.1): **T** taller, **P** presentación, **A** ampliación de Alcancía.

**Tramo 1 · Bases** (fase A)
1. Tu recibo de sueldo: bruto, neto, aportes, contribuciones y costo laboral (T).
2. Tu cerebro y el dinero: gratificación inmediata, sesgo de descuento hiperbólico, la regla de las 48 horas y el minimalismo como estrategia (P).
3. Presupuesto y gastos hormiga: reglas 50/30/20 y 70/20/10 como puntos de partida (P, T).
4. Fondo de emergencia: cuánto (3 a 6 meses de gastos básicos), dónde (liquidez y bajo riesgo) y para qué no es (P).

**Tramo 2 · Deudas y crédito** (fase A)
5. El orden importa: pagar deudas caras antes de ahorrar e invertir (P).
6. Tarjeta de crédito: pago mínimo, TNA y costo financiero total (T, A).
7. Salir de deudas: bola de nieve o avalancha (P).
8. ¿Cuotas sin interés o contado con descuento? (A).

**Tramo 3 · Ahorro e inflación** (fase A)
9. Inflación y poder de compra (P, T).
10. Tasas sin misterio: TNA, TEM, TEA y tasa real (A).
11. Plazo fijo tradicional, plazo fijo UVA y fondos money market (P, A).

**Tramo 4 · Invertir** (fase A los módulos 12 a 15; fase B el 16)
12. Ahorrar e invertir no son lo mismo: costo de oportunidad e interés compuesto (P).
13. Tu perfil de inversor y cómo elegir un bróker registrado en la CNV (P, A).
14. Mercado de capitales: acciones, bonos, obligaciones negociables, FCI, ETFs e índices (S&P 500, Nasdaq 100, Dow Jones, ACWI), riesgo, horizonte y diversificación (P, A).
15. CEDEARs: qué son, cómo replican una acción o un ETF del exterior, el ratio de conversión, el tipo de cambio implícito y sus riesgos (A).
16. Criptomonedas: qué son, para qué sirve cada una, volatilidad, custodia y compras periódicas (DCA); solo conceptos y riesgos (P) · fase B.

**Tramo 5 · Billeteras, fintech y seguridad** (fase A el 17; fase B el 18)
17. Billeteras virtuales y fintech: CVU y CBU, transferencias inmediatas y QR interoperable, cuenta remunerada o fondo money market, qué protección tiene tu dinero según el tipo de cuenta, el mapa de billeteras y fintech argentinas (Anexo D) y cómo verificar una entidad en los registros oficiales (A). Se practica en la billetera de práctica (SIM-13).
18. Estafas y mensajes sospechosos: phishing, falsos soportes, "inversiones" con rendimientos garantizados y cómo protegerte (T, A) · en fase A, una guía base en el nivel 2 con la misión 6; el módulo completo en fase B, y sala 5 del escape room.

- Objetivos redactados con verbos observables de la taxonomía de Bloom revisada (calcular, comparar, decidir), no "conocer" o "entender".
- Contenido en `src/data/modules/` y documentado en `docs/content.md` con objetivo, evidencia, actividades y fuentes de cada módulo.
- **No inventar estadísticas** ni citar datos reales sin fuente; los ejemplos usan números redondos y ficticios.

### 5.1 Evaluaciones variadas (F3)

Las evaluaciones combinan tipos según lo que se quiere comprobar (evidencia de Backward Design), no por variedad en sí. Cada pregunta tiene retroalimentación por opción, explicada.

| Tipo | Para qué sirve en finanzas | Accesibilidad |
| --- | --- | --- |
| **Opción única** | Conceptos ("¿Qué indica el CFT?") | `fieldset` + radios |
| **Opción múltiple** (varias correctas) | Identificar varios elementos ("¿Qué gastos son fijos?") | `fieldset` + casillas; dice cuántas elegir o "elige todas las que correspondan" |
| **Verdadero o falso con justificación** | Desarmar mitos ("Las cuotas sin interés siempre convienen") | Después de responder, elegir el porqué |
| **Respuesta numérica con tolerancia** | Cálculo ("¿Cuánto vale hoy tu sueldo en 6 meses con 3 % mensual?") | Campo con máscara, tolerancia configurable, retroalimentación con el cálculo paso a paso |
| **Ordenar pasos** | Procesos ("Ordena los pasos para armar tu presupuesto") | Arrastrar con alternativa de botones "Subir" y "Bajar" |
| **Unir pares** | Vocabulario ("Une cada término con su definición") | Selects por fila como alternativa al arrastre |
| **Clasificar en categorías** | "¿Necesidad, deseo o ahorro?" con 8 gastos | Arrastrar a columnas o elegir la categoría desde un menú por tarjeta |
| **Caso con decisiones** (escenario ramificado) | Decidir en una situación ("Te ofrecen un préstamo para irte de vacaciones…"): cada elección lleva a una consecuencia y a la siguiente decisión | Cada paso es una pantalla con opciones; se puede volver y ver el camino recorrido |
| **Ejercicio con simulador** | Usar un simulador para responder ("Con el simulador de tarjeta, ¿cuántos meses tardas pagando el mínimo?") | El simulador embebido cumple 2.10 |

Reglas:
- **Práctica formativa** dentro de las lecciones (sin nota, con reintentos ilimitados) y **evaluación del módulo** al cierre (con puntaje mínimo e intentos configurables en F1).
- Banco de preguntas por módulo con **orden aleatorio** de preguntas y opciones (excepto en "ordenar").
- **Desafío de nivel (D-57):** toma preguntas del banco de cada módulo del nivel; la insignia de cada módulo sale de su parte. Para aprobar cuenta el **mejor intento**; los reportes muestran también el primero, que indica cuánto sabía la persona.
- **Sin límite de tiempo** por defecto (criterio 2.2.1 de WCAG); si se usa, ajustable y con aviso.
- Retroalimentación que explica, nunca solo "Correcto" o "Incorrecto".

**Escape room del programa con Fuerte (fase B, F18):** se adapta el escape room **"Tu primer sueldo"** que Lourdes ya diseñó para su taller "Del aula al primer trabajo" (`https://lpedaci.github.io/taller-primerempleo/escape/`; gamificación y diseño instruccional de Lourdes Pedaci, contenido de finanzas de Lic. Kevin Giampieri). Antes de diseñarlo, recorrerlo completo y documentar sus mecánicas en `docs/learning-design.md`. Se mantienen:
- **Personaje Fuerte**, la caja fuerte naranja que acompaña el juego: cada candado abierto enciende una de sus luces (Claridad, Orden, Prudencia, Previsión y Seguridad). Es un personaje propio de Lourdes, así que conserva su diseño y su naranja aunque no esté en la paleta de Alcancía: es la única excepción a la regla de no usar tonos cálidos (D-52), y aplica a Fuerte en todo el entorno del participante, no solo en el escape room.
- **Cinco salas** que se abren en orden, cada una con una situación, **objetos para inspeccionar** y un **candado** que se abre con un tipo de evaluación distinto de 5.1 (respuesta numérica, opción única, ordenar, clasificar, caso con decisiones).
- Cada candado da **letras del código de la puerta final**.
- **Sin límite de tiempo ni forma de perder**; el tiempo está oculto y se puede mostrar si la persona quiere.
- **Pistas a cambio de llaves:** se empieza con 3 y se gana una por cada reflexión escrita.
- **Tres versiones por sala** (inicial, intermedia y avanzada) e **insignias de bronce, plata y oro** por resolver las cinco salas en una misma versión; insignias descargables.
- "Empezar de cero" con confirmación, enlace para saltar al contenido y modo oscuro.

Adaptación a Alcancía:
- Narrativa en el contexto de Andina (por ejemplo, el cierre de mes de una persona colaboradora) y salas alineadas con los módulos: recibo de sueldo, presupuesto, tarjeta, inflación y mensajes sospechosos (estafas, módulo de fase B).
- Textos con **tú** y vocabulario de 2.9 (el original usa voseo).
- Al tutor y al admin solo les llega si se completó y qué insignia se obtuvo; nunca las reflexiones ni los montos.
- Se puede jugar de forma individual o, en fase B avanzada, en equipo por cohorte.
- Accesibilidad de 2.10: todo por teclado, objetos inspeccionables como botones con nombre, texto alternativo en cada elemento visual y anuncios de cada candado abierto.

Si Lourdes lo prefiere, el escape room puede adelantarse a la fase A como cierre del programa: el diseño y el contenido ya existen.

### F4. Simuladores (participante, y SIM-3 también en la landing)
> Con D-50, los simuladores SIM-1 a SIM-12 son **herramientas** dentro de las secciones de la billetera (5.0) y también están juntos en Aprender > Herramientas. Sus datos se pueden precargar con los de la billetera de la persona (por ejemplo, su gasto mensual real de la simulación en SIM-2).


Cada simulador sigue la anatomía de 2.2.1 (datos, resultado, frase, gráfico, "Qué significa esto", supuestos, comparar escenarios, "Prueba cambiar…" y aviso legal). Las fórmulas viven en `src/lib/finance/`, se documentan en `docs/formulas.md` y tienen tests con casos calculados a mano.

| ID | Simulador | Datos | Resultado |
| --- | --- | --- | --- |
| SIM-1 | Presupuesto mensual | Ingresos (incluido el aguinaldo prorrateado, opcional), gastos fijos y variables por categoría | Saldo, porcentaje por categoría y una guía de referencia (por ejemplo 50/30/20) presentada como punto de partida, no como regla |
| SIM-2 | Fondo de emergencia | Gastos mensuales esenciales, meses de cobertura deseados (3 a 6), ahorro actual | Monto objetivo, cuánto falta y en cuántos meses se llega ahorrando X |
| SIM-3 | Inflación y poder de compra | Monto, inflación mensual (escenario o valor propio), meses | Cuánto compra ese dinero al final, pérdida de poder de compra en % y precio futuro de algo que hoy cuesta ese monto |
| SIM-4 | Tasa real | TNA, plazo en días, inflación esperada | TEM, TEA y **tasa real** del período; si le gana o no a la inflación del escenario |
| SIM-5 | Plazo fijo tradicional o UVA | Monto, plazo, TNA del tradicional, tasa adicional del UVA, inflación esperada (escenarios) | Monto final de cada uno en pesos y en poder de compra, con los supuestos visibles. Condiciones como el plazo mínimo del UVA o la precancelación son **supuestos editables**, no datos fijos |
| SIM-6 | Cuotas sin interés o contado | Precio, cantidad de cuotas, descuento por contado, inflación mensual esperada | Valor presente de las cuotas frente al precio de contado, y cuál conviene **en ese escenario**, con la explicación |
| SIM-7 | Tarjeta de crédito | Saldo, tasa de financiación (TNA), CFT, pago mínimo (%), meses | Costo de pagar el mínimo frente a pagar el total, intereses acumulados y tiempo para cancelar si no hay consumos nuevos |
| SIM-8 | Meta de ahorro con inflación | Precio actual de la meta, plazo, inflación esperada, rendimiento esperado del ahorro | Precio estimado de la meta al final y ahorro mensual necesario |
| SIM-9 | Salir de deudas: bola de nieve o avalancha | Lista de deudas (saldo, tasa anual, pago mínimo) y monto extra mensual | Orden de pago de cada método, meses hasta quedar sin deudas e intereses totales pagados, comparados lado a lado, con la conclusión ("La avalancha te ahorra $ X en intereses; la bola de nieve te da la primera deuda saldada N meses antes") |
| SIM-10 | Interés compuesto y aportes periódicos | Capital inicial, aporte mensual, tasa anual esperada (escenarios), años y moneda (pesos o dólares) | Capital final, cuánto es aporte y cuánto es interés, gráfico de crecimiento. Incluye el preset "gasto hormiga": cuánto sería un gasto diario si se invirtiera |
| SIM-11 | CEDEAR: de la acción al precio en pesos | Precio de la acción o del ETF en dólares, ratio de conversión, tipo de cambio implícito | Precio teórico del CEDEAR en pesos y cómo cambia si sube la acción o el tipo de cambio, para entender las dos fuentes de variación. Todos los valores son de ejemplo y editables |
| SIM-12 | ¿Dónde guardo mi fondo de emergencia? | Monto, plazo, TNA de ejemplo de una cuenta remunerada, de un plazo fijo y de un fondo money market, inflación esperada | Rendimiento de cada opción, si le gana a la inflación y su liquidez (inmediata, al vencimiento, en 24 horas), presentado como comparación de características, no como recomendación |
| SIM-13 | **La billetera Alcancía** (5.0 y 5.3: es el entorno completo del participante) | Dinero ficticio, misiones y eventos del escenario | Una billetera virtual ficticia completa (saldo, CVU, transferencias, QR, rendimiento, presupuesto, metas, seguridad) donde cada acción dispara aprendizaje: explicación breve, pregunta, consecuencia y devolución |
| SIM-14 | **Cuenta comitente de práctica** (5.4, nivel 7, fase A) | Dinero ficticio transferido desde la billetera, precios de ejemplo | Abrir cuenta en un bróker ficticio, conocer tu perfil, comprar un CEDEAR de ETF, ver liquidación, costos y tenencia, y seguir la inversión en el tiempo con una serie de ejemplo |

**Fórmulas de referencia** (los valores regulatorios de los ejemplos salen del Anexo B; documentar con ejemplos en `docs/formulas.md`; las que vienen del material del taller se verifican contra él, por ejemplo que US$ 200 por mes al 12 % anual durante 33 años den alrededor de US$ 1.000.000):
- Interés compuesto: `C = P × (1 + r)^n` (fórmula del taller), y valor futuro de aportes mensuales `VF = a × ((1 + r_m)^n − 1) / r_m`.
- Bola de nieve y avalancha: simulación mes a mes del saldo de cada deuda, con el pago extra aplicado a la deuda prioritaria y el pago liberado sumado a la siguiente.
- CEDEAR, versión didáctica: `precio en pesos = precio en dólares / ratio × tipo de cambio implícito`.
- TEM a partir de la TNA, para un plazo de d días: `i_d = TNA × d / 365`.
- TEA: `TEA = (1 + TNA × d / 365)^(365 / d) − 1`.
- Tasa real del período: `r = (1 + i) / (1 + π) − 1`, donde `i` es la tasa del período y `π` la inflación del mismo período.
- Inflación acumulada de n meses con inflación mensual constante: `(1 + π_m)^n − 1`.
- Valor presente de cuotas iguales `c` con inflación mensual `π_m`: `VP = Σ c / (1 + π_m)^k`, con `k` de 1 a n (la primera cuota a un mes; dejar configurable si la primera se paga en el momento).
- Plazo fijo UVA, versión didáctica: capital ajustado por la variación de la UVA (aproximada con la inflación del escenario) más la tasa adicional; aclarar que la UVA real se ajusta por CER con rezago.
- Pago mínimo de tarjeta: simulación mes a mes del saldo con interés de financiación, sin consumos nuevos y sin impuestos (aclarar la simplificación).

**Escenarios de ejemplo** (en `src/data/scenarios.json`, rotulados "Valores de ejemplo"): inflación mensual baja (1,5 %), media (3 %) y alta (6 %); tasas de ejemplo coherentes con cada escenario. Siempre editables y con "Dónde ver los valores reales".

- **Guardar escenario** y **comparar dos escenarios** lado a lado (local, en el navegador).
- **Exportar el resultado** como resumen imprimible con los supuestos.

### 5.0 Mapa de niveles y desbloqueos (D-50)

| Nivel | Sección | Se desbloquea con | Guías (módulos de F3) | Misiones | Herramientas |
|---|---|---|---|---|---|
| 0 | **Abrir tu cuenta** | Primer ingreso | Bienvenida; "Conocerte" (diagnóstico); seguridad básica (2FA, nunca compartir códigos) | Configura tu seguridad | Ninguna |
| 1 | **Cuenta** (Inicio, movimientos, recibo de sueldo explicado, un apartado "Ahorro" básico sin meta, D-53) | Terminar el nivel 0 | 1 Recibo de sueldo; 2 Tu cerebro y el dinero | 1 Tu primer cobro | Ninguna |
| 2 | **Pagar** (transferir, QR, servicios) | Misión 1 completa y desafío del nivel 1 (D-63) | 17 Billeteras y fintech (parte pagos); 18 Estafas (base) | 2 Transfiere sin errores; 3 Paga con QR; 6 El mensaje falso | Ninguna |
| 3 | **Presupuesto** | 10 movimientos categorizados y desafío del nivel 2 | 3 Presupuesto y gastos hormiga | 7 Mes completo (se puede hacer desde acá) | SIM-1 |
| 4 | **Apartados y metas** (varios apartados con meta, incluido el fondo de emergencia; el apartado "Ahorro" del nivel 1 se puede convertir en uno con meta) | Un mes cerrado con presupuesto en verde y desafío del nivel 3 | 4 Fondo de emergencia | Crea tu fondo de emergencia | SIM-2, SIM-8 |
| 5 | **Crédito** (tarjeta, préstamos, cuotas) | Desafío del nivel 4 | 5 El orden importa; 6 Tarjeta y CFT; 7 Salir de deudas; 8 Cuotas o contado | 5 El préstamo tentador; Sal de tus deudas | SIM-6, SIM-7, SIM-9 |
| 6 | **Rendir** (cuenta remunerada, fondo money market, plazo fijo y UVA de práctica) | Apartado de emergencia creado y desafío del nivel 5 | 9 Inflación; 10 Tasas; 11 Plazo fijo, UVA y money market (la parte "cuenta o fondo" del 17 va en la misión 4, D-65) | 4 ¿Cuenta o fondo? | SIM-3, SIM-4, SIM-5, SIM-12 |
| 7 | **Invertir** (cuenta comitente de práctica, SIM-14) | **Fondo de emergencia de al menos 3 meses de gastos, sin deudas de tasa alta en la simulación, desafío del nivel 6 y test de perfil de inversor** | 12 Ahorrar e invertir; 13 Perfil y bróker; 14 Mercado de capitales; 15 CEDEARs | Abre tu cuenta comitente; Tu primer CEDEAR de ETF; Aguanta la caída | SIM-10, SIM-11 |
| 8 | **Cripto** (fase B) | Nivel 7 completo y guía de riesgos | 16 Criptomonedas | Ninguna | Ninguna |

**Reglas de la progresión**
- **Lo bloqueado se ve, nunca se esconde:** cada sección bloqueada muestra un candado, para qué sirve y **qué falta**, con progreso ("Fondo de emergencia: 2 de 3 meses"). Un toque lleva a la acción que la acerca.
- **"Ya sé esto":** desde "Conocerte" o desde la tarjeta de una sección bloqueada se puede hacer el **desafío de suficiencia**; si se aprueba, la sección se desbloquea sin pasar por las anteriores. Respeta lo que la persona adulta ya sabe (andragogía).
- **Ajustes razonables:** el tutor puede desbloquear una sección para una persona o una cohorte (por ejemplo, por accesibilidad o por el rol de la persona), con un motivo que queda registrado. El admin puede configurar el programa en modo libre (todo desbloqueado).
- **Modo demo para visitantes del portfolio:** en el selector "Ver como" hay un interruptor "Ver todo desbloqueado" y botones para cargar estados de ejemplo (Diego en el nivel 2, Mariana en el nivel 6). Así un reclutador ve el producto completo en segundos.
- **Gamificación con medida:** niveles, logros e insignias, sin rachas que castiguen, sin pérdida de progreso, sin rankings entre personas, sin cuentas regresivas ni recompensas por pasar tiempo en la app. Los logros celebran conductas financieras sanas (crear el fondo, revisar un CFT, reportar una estafa), no clics.
- **Celebrar el desbloqueo:** animación breve (2.6) con Fuerte y una frase de qué se puede hacer ahora; respeta "reducir animaciones".
- **Nada se pierde:** volver a una sección anterior, repetir misiones y releer guías está siempre disponible.

### 5.0.1 Fuerte, el compañero (D-51)

Fuerte, la caja fuerte naranja del escape room "Tu primer sueldo", pasa a ser el **compañero de la billetera**: te recibe, te acompaña, te avisa y celebra contigo. Conserva su diseño original (naranja, con las luces que se encienden), con relleno plano según el sistema de diseño. Su naranja es la excepción de color de D-52: no se usa en ningún otro elemento de la interfaz.

**Personalidad**
- **Quién es:** un compañero cercano y confiable que "guarda" lo importante. No es un banquero ni un profesor: es como ese compañero de trabajo que sabe de números y te explica sin hacerte sentir mal.
- **Rasgos:** cálido, curioso, con humor seco y breve, prudente sin ser alarmista, honesto (si algo es riesgoso, lo dice), orgulloso de tus avances pequeños.
- **Lo que nunca hace:** juzgar ("¿otra vez gastaste en eso?"), recomendar productos o entidades, prometer rendimientos, usar culpa o urgencia para empujarte a hacer algo, infantilizar, hablar más de dos oraciones seguidas.
- **Muletillas propias** (de vez en cuando, no en cada mensaje): "Guardado." cuando algo sale bien; "Ojo con esto" antes de una advertencia.

**Voz:** español latinoamericano neutro con tú (2.9), frases cortas, un dato concreto por mensaje. Ejemplos:
- Bienvenida: "Hola, Mariana. Soy Fuerte. Acá manejas dinero de práctica, así que equivocarte sale gratis. Empecemos por tu primer cobro."
- Antes de confirmar una transferencia: "Ojo con esto: el titular no coincide con el nombre que buscabas. ¿Lo revisamos?"
- Logro: "Guardado. Tu fondo de emergencia ya cubre un mes. Faltan dos para desbloquear Invertir."
- Error en una misión: "Pasó lo mismo que en la vida real: el préstamo salió casi el doble. Veamos por qué en 30 segundos."
- Sección bloqueada: "Invertir se abre cuando tengas tu fondo de emergencia armado. Primero lo que te protege, después lo que te hace crecer."

**Estados y expresiones** (ilustraciones SVG propias, mismo trazo y paleta): neutral, saludo, pensativo (cuando hay una pregunta), atención (advertencia), celebración (logro o desbloqueo, con las luces encendidas) y dormido (si la persona lo silencia). Las **luces** muestran el avance: **siete**, una por cada nivel completado del 1 al 7 (D-134 de Claude Code, confirmada por Lourdes: reemplaza las cinco luces del escape room original para vincular a Fuerte con este producto; el escape room de fase B adapta sus candados a este diseño).

**Dónde aparece**
- Celular: avatar pequeño en la barra superior; sus mensajes salen como burbuja sobre la navegación inferior o dentro de la hoja de la misión.
- Tablet y escritorio: en el panel de la misión, junto a la tarjeta de aprendizaje.
- Momentos grandes: bienvenida, desbloqueo de nivel, cierre de misión y resumen del mes.

**Reglas de comportamiento**
- Habla en los momentos clave (bienvenida, antes de un error evitable, logro, desbloqueo, cierre) y **nunca interrumpe dos veces seguidas** la misma acción.
- Tres niveles de presencia, que la persona elige en su perfil: **Conversador** (por defecto), **Solo lo importante** y **Silencio** (las tarjetas de aprendizaje siguen apareciendo, sin el personaje).
- Sus textos viven en `src/data/fuerte-lines.json`, por evento y estado, con variantes para no repetirse; L&D puede editarlos sin tocar código.
- Accesibilidad: la ilustración es decorativa (`aria-hidden`) y su mensaje se anuncia como texto; animaciones cortas, sin parpadeo y respetando "reducir animaciones".
- No es un chatbot: reacciona a eventos de la app, no conversa libremente. Un asistente conversacional queda como línea futura (5.2).

### 5.3 La billetera Alcancía (antes SIM-13 "Faro", fase A)

**Qué es:** una billetera virtual **ficticia** dentro de Alcancía donde la persona usa dinero de mentira para hacer lo mismo que haría en una billetera real (cobrar, transferir, pagar con QR, hacer rendir el saldo, armar presupuesto, separar ahorro, cuidarse de estafas) y **aprende mientras lo hace**. No es un juego aparte: es el lugar donde se practican los módulos 1, 3, 4, 6, 9, 10, 11, 17 y 18.

**Principios de diseño**
- **Aprender haciendo, con red:** "Acá equivocarte es gratis". Los errores (transferir a un alias mal escrito, aceptar un préstamo caro, responder un mensaje falso) se permiten, tienen consecuencia dentro de la simulación y siempre terminan en una devolución que explica qué pasó y qué hacer en la vida real.
- **Aprendizaje en el momento justo:** cada pantalla tiene un botón "¿Por qué importa?" y ciertas acciones disparan una **tarjeta de aprendizaje** de 20 a 40 segundos (concepto + dato oficial con su código B-xx + una pregunta de un toque). No se interrumpe más de una vez por acción ni se repite si ya se respondió bien.
- **Dos modos:** **Misiones** (guiado, con objetivos y pasos) y **Libre** (explorar con el saldo que haya). El modo libre igual registra lo aprendido.
- **Fuerte como compañero (5.0.1):** acompaña toda la experiencia con personalidad propia; se puede silenciar.
- **Marca propia y evidente:** se llama Alcancía (D-28), con la paleta y los componentes del sistema de diseño, cartel fijo "Simulador de finanzas personales · dinero ficticio" (D-69: "dinero ficticio" no se quita nunca). Nada imita los colores, íconos, tipografía ni flujos de una billetera real (1.1.1).
- **Sin datos reales:** nunca pide DNI, CUIT, CBU, tarjetas, contraseñas ni datos de contacto reales. El CVU se muestra como `0000000 0000000 EJEMPLO 00` (formato visual, no un número válido) y el alias es `alcancia.practica.mariana` según la persona de demo.
- **Control del tiempo:** "Avanzar un día / una semana / un mes" para ver rendimientos, inflación del escenario, vencimientos y eventos. El escenario de inflación sale de `scenarios.json`.

**Funciones de la billetera**
| Área | Qué hace la persona | Qué aprende (módulo y fuente) |
|---|---|---|
| Inicio | Ve saldo, CVU, alias, últimos movimientos y el cartel de la misión activa | Qué es una cuenta de pago y qué la diferencia de una cuenta bancaria con CBU (17; B-10, B-16) |
| Cobrar | Recibe su sueldo de demo (el neto del módulo 1) o una transferencia de un banco ficticio | Leer el neto del recibo y planificar el mes (1, 3; taller) |
| Transferir | Envía a un alias, CBU o CVU; la confirmación muestra titular y entidad ficticios | Revisar titular antes de confirmar; las transferencias inmediatas se acreditan en segundos y no se pueden deshacer desde la app (17; B-15) |
| Pagar con QR | Escanea un QR de un comercio ficticio (con alternativa sin cámara: elegir de una lista) | QR interoperable: cualquier billetera lee cualquier QR (17; B-15) |
| Pagar servicios | Paga luz, celular y una suscripción ficticios; puede programar débitos | Gastos fijos frente a variables; suscripciones como gasto hormiga (2, 3; A-15, A-34) |
| Hacer rendir el saldo | Elige entre **cuenta remunerada** y **fondo money market** de práctica; ve el rendimiento diario al avanzar el tiempo | Cuenta o fondo: qué es cada uno, liquidez, riesgo y garantía; en Argentina, la mayor parte del dinero "en billeteras" está invertido en fondos de dinero y no en la cuenta (10, 11, 17; B-12, B-13, B-14, B-17) |
| Ganarle o no a la inflación | Compara su rendimiento con la inflación del escenario | Tasa real (9, 10; SIM-4) |
| Presupuesto | Categoriza movimientos y ve su reparto frente a 50/30/20 o 70/20/10 | Reglas de presupuesto y gastos hormiga (3; A-32 a A-34) |
| Apartados y metas | Separa dinero en un apartado "Fondo de emergencia" con meta de 3 a 6 meses | Fondo de emergencia y dónde guardarlo (4; A-35, A-36; SIM-12) |
| Ofertas | Recibe una oferta de "préstamo preaprobado" y otra de "comprar en cuotas"; debe encontrar el CFT antes de decidir | CFT frente a TNA, cuotas o contado (5, 6, 8; B-04; SIM-6, SIM-7) |
| Seguridad | Configura segundo factor y límites; recibe mensajes, uno de ellos falso (falso soporte que pide un código, enlace a una página parecida, "inversión garantizada") y debe reportarlo | Nunca compartir códigos, verificar el canal, señales de estafa (18; B-24) |
| Verificar | Antes de "invertir" desde la billetera, busca la entidad en el registro que corresponde (simulado con los datos del Anexo D) | Cómo verificar una billetera, un bróker o un exchange (13, 17; B-21, B-27) |
| Comprobantes y resumen | Descarga un comprobante ficticio y ve el resumen del mes | Llevar registro; el resumen como herramienta (3) |

**Misiones de fase A** (cada una de 3 a 6 minutos, con objetivo observable, pasos, evento sorpresa y devolución):
1. **Tu primer cobro:** recibir el sueldo, identificar el neto y separar el 20 % en el apartado "Ahorro" básico (D-53: único apartado disponible en el nivel 1, sin meta). Evidencia: apartado con el monto correcto (numérica, tolerancia de $ 1).
2. **Transfiere sin errores:** pagarle a un compañero por alias; el alias tiene un error de tipeo y el titular no coincide. Evidencia: cancela y corrige antes de confirmar.
3. **Paga con QR:** comprar en un comercio de la empresa ficticia y verificar el comprobante. Evidencia: pago hecho y monto verificado.
4. **¿Cuenta o fondo?:** elegir dónde dejar el saldo tras leer la ficha de cada opción; avanzar 30 días y explicar la diferencia de rendimiento y de protección. Evidencia: pregunta con justificación (verdadero o falso con por qué).
5. **El préstamo tentador:** decidir ante una oferta preaprobada con cuota baja y CFT alto; calcular el costo total. Evidencia: caso con decisiones y respuesta numérica.
6. **El mensaje falso:** recibir tres mensajes y reportar el fraudulento sin compartir el código. Evidencia: clasificación correcta de los tres.
7. **Mes completo:** avanzar un mes con eventos (suba de un servicio, gasto imprevisto, rendimiento) y cerrar con el presupuesto en verde y el apartado "Ahorro" intacto (el fondo de emergencia todavía no existe en el nivel 3). Evidencia: resumen del mes con criterios cumplidos.

Las misiones se habilitan desde el mapa de niveles (P9) y desde la sección de la billetera a la que pertenecen (5.0), como actividad práctica de sus guías. Además de las 7 de arriba, la fase A incluye las 6 misiones cortas de la tabla de 5.0 (D-59): Configura tu seguridad (nivel 0), Crea tu fondo de emergencia (4), Sal de tus deudas (5), Abre tu cuenta comitente, Tu primer CEDEAR de ETF y Aguanta la caída (7). Cada misión registra eventos tipo xAPI (inició, completó, respondió, aprobó, pidió pista) para F21, y suma a las insignias de F5.

**Cómo se ve en los paneles:** el tutor y el admin ven **solo** misiones completadas, intentos y aciertos agregados por cohorte (umbral de 5 personas). Nunca ven saldos, movimientos, metas ni decisiones individuales dentro de la billetera, ni el motivo de un bloqueo que dependa de ellos (D-58).

**Técnica**
- Estado en un store propio (`walletStore`) persistido en el navegador, separado de los demás; botón "Empezar de cero" con confirmación.
- Montos con decimal.js; rendimiento diario con `saldo × TNA / 365` por día, acreditado al avanzar el tiempo; inflación del escenario aplicada al "poder de compra" que se muestra al lado del saldo.
- Motor de eventos declarativo (`src/data/wallet-missions.json`): cada misión define estado inicial, pasos, disparadores (acción, monto, día), tarjetas de aprendizaje, preguntas (tipos de 5.1) y criterios de éxito. Así L&D puede sumar misiones sin tocar código (se conecta con F14).
- Accesibilidad: cambios de saldo anunciados con región en vivo, todo operable con teclado, alternativa al escaneo de QR, sin límite de tiempo y con "reducir animaciones".
- **Navegación por tamaño de pantalla** (clases de ventana de Material 3, verificadas en los 6 anchos de 2.7). Hay una sola navegación, la de la billetera; los roles de tutor, admin y decisor conservan su propio layout:
  - **Destinos principales (los mismos en todos los tamaños):** Inicio · Pagar (transferir, QR, servicios y "Tarjeta y préstamos", D-56) · Ahorrar (presupuesto, apartados y rendir) · Invertir · Aprender (mapa de niveles, logros, guías, desafíos y herramientas). Perfil, seguridad y comprobantes van en el avatar de la barra superior. Los destinos bloqueados se muestran con candado y abren su tarjeta de "qué falta".
  - **Celular (menos de 600 px; 320 y 375):** la app a pantalla completa. Barra superior con el nombre de la sección, Fuerte y avatar. **Barra de navegación inferior** con los 5 destinos: íconos, y el nombre visible **solo en el destino activo** (D-72, ajusta D-164); los demás nombres quedan para lectores de pantalla y en un tooltip. La misión activa es una tarjeta fija arriba del contenido que se expande como hoja inferior.
  - **Tablet (600 a 1199 px; 768 y 1024):** igual que en celular, **barra de navegación inferior** con los 5 destinos, íconos y el nombre visible solo en el destino activo (D-164 de Claude Code, pedido de Lourdes; D-72). La misión activa es una tarjeta compacta arriba del contenido.
  - **Escritorio (1200 px o más; 1280 y 1440):** **menú lateral** con los 5 destinos y sus subsecciones desplegables (por ejemplo, Pagar > Transferir, QR, Servicios, Tarjeta y préstamos; Ahorrar > Presupuesto, Apartados, Rendir), más el indicador de nivel. Layout bento en tres zonas: saldo y acciones rápidas, movimientos o sección activa, y panel fijo de la misión con Fuerte. Ancho máximo de lectura de 1200 px, centrado.
  - En todos los tamaños: el destino activo se marca con el indicador de Material 3 y `aria-current`; el foco vuelve al título de la sección al cambiar de destino; objetivos táctiles de 48 × 48 px; las hojas inferiores se cierran con Escape y devuelven el foco.

### 5.4 Invertir: cuenta comitente de práctica (SIM-14, nivel 7, fase A)

Un bróker **ficticio** ("Bróker de Ejemplo S.A., matrícula ficticia") conectado a la billetera de práctica:
1. **Abrir la cuenta:** validación de identidad simulada (sin datos reales) y el resultado del **test de perfil de inversor** educativo (conservador, moderado, agresivo), que la persona ya hizo antes de desbloquear el nivel (D-67) y que explica para qué sirve (A-54).
2. **Fondear desde la billetera** por transferencia de práctica.
3. **Elegir un instrumento** entre ejemplos: CEDEAR de un ETF que replica el S&P 500, fondo money market, bono de ejemplo. Cada uno con su ficha estándar (riesgo, liquidez, moneda).
4. **Comprar:** ver precio de ejemplo con fecha, ratio y tipo de cambio implícito (SIM-11), comisión y derechos de mercado ficticios, plazo de liquidación (contado inmediato o 24 horas, B-34).
5. **Ver la tenencia** "en tu subcuenta comitente" con la explicación de Caja de Valores (B-22).
6. **Seguir en el tiempo** con una serie de precios **sintética y rotulada como ejemplo** (no datos reales), con años buenos y malos, para practicar no vender en pánico y comparar con aportes periódicos (SIM-10).
7. **Verificar al bróker real que elegirías** en la ficha del Anexo C, con el enlace al registro de la CNV.

### F5. Metas y desafíos (participante)
> Con D-50, las metas son **apartados con meta** dentro de Ahorrar, y las insignias son los **logros** de 5.0.

- Crear metas (nombre, precio actual, plazo) que se ajustan con el escenario de inflación (usa SIM-8).
- Registrar aportes ficticios y ver el avance; fecha estimada de logro.
- **Desafíos semanales** asignados por el tutor ("Registra tus gastos durante 7 días", "Calcula el CFT de tu tarjeta"), con autoinforme de cumplimiento (sí, parcial, no) y una reflexión opcional.
- Insignias simples al completar módulos y desafíos.
- Todo lo económico queda en el navegador; al tutor solo llega si cumplió el desafío.

### F6. Panel del tutor
- Inicio con saludo, KPIs de sus cohortes (participación, módulos completados, promedio de evaluaciones, desafíos cumplidos) y alertas ("4 personas no empezaron el módulo 3", "El plazo del programa vence en 10 días").
- **Cohortes:** listado y detalle con avance por persona y módulo (mapa de calor), para acompañar a quien se atrasa.
- **Asignar desafíos** a una cohorte con fecha.
- **Resultados de evaluaciones:** preguntas con más errores y opciones más elegidas, para reforzar en la próxima sesión.
- **Consultas:** bandeja de preguntas de las personas participantes sobre los módulos, con respuesta del tutor (sin datos económicos).
- Nunca ve montos de simuladores ni metas, ni las respuestas de hábitos del diagnóstico.

### F7. Panel de seguimiento (admin) y reporte de impacto (decisor)
Medición con el modelo de **Kirkpatrick**:

| Nivel | Qué se mide en la demo |
| --- | --- |
| 1. Reacción | Satisfacción con cada módulo (escala de 1 a 5 y comentario opcional) |
| 2. Aprendizaje | Diferencia entre el diagnóstico inicial y el final por dimensión, **solo con las preguntas de conocimiento** (D-62), y resultados de los desafíos de nivel |
| 3. Conducta | Autoinforme a 30 días: "¿Aplicaste lo aprendido?" (presupuesto armado, fondo iniciado, pago total de la tarjeta) y desafíos cumplidos |
| 4. Resultados | Solo como línea futura y en `docs/learning-design.md` (por ejemplo, bienestar financiero reportado); no se inventan datos de negocio |

- Panel del admin (O1): adopción (invitadas, activas, que completaron el diagnóstico), avance por cohorte, niveles 1 a 3 y alertas.
- Reporte del decisor (D1): versión resumida, solo lectura, exportable.
- **Umbral de privacidad:** ninguna métrica se muestra para grupos de menos de 5 personas ("Datos insuficientes para mostrar este grupo sin identificar a nadie"). Implementado en `src/lib/metrics.ts` con tests.
- Las métricas se calculan desde los datos, nunca se escriben a mano.

### F8. Personas y cohortes (admin)
- Listado de personas con filtros (cohorte, estado: invitada, activa, inactiva).
- Alta individual y **carga masiva por CSV** simulada: subir el archivo, vista previa, validación fila por fila (correo inválido, duplicado, cohorte inexistente), corrección y confirmación.
- Crear cohortes por área, asignar tutor, módulos y fecha límite si el programa es asignado.

### Funciones de fase B
- **F9. Recordatorios en el flujo de trabajo:** notificaciones en la plataforma y **vista previa simulada** de cómo llegan por correo, Microsoft Teams o Slack (sin conexión real): lección pendiente, desafío nuevo, plazo por vencer, meta alcanzada.
- **F10. Glosario y biblioteca:** glosario completo con búsqueda y fuentes oficiales; recursos breves (infografías, guías imprimibles).
- **F11. Módulos de fase B:** criptomonedas (16), estafas y mensajes sospechosos (18), y como línea futura: ahorro en moneda extranjera y dólar MEP, aguinaldo y vacaciones, e impuestos sobre ahorros e inversiones.
- **F12. Insignias y certificados:** insignias por módulo y certificado de finalización del programa (PDF simulado), con formato compatible con Open Badges como línea futura; nunca con datos económicos.
- **F13. Sesiones con el tutor:** agenda simulada de encuentros 1:1 o grupales (webinar en vivo con grabación simulada).
- **F14. Constructor de lecciones para el tutor y L&D:** crear una lección propia con bloques (texto, ejemplo, pregunta de cualquier tipo de 5.1, simulador embebido).
- **F15. Seguimiento a 30 días** (Kirkpatrick nivel 3) con recordatorio y encuesta.
- **F16. Mi privacidad:** datos que tiene la plataforma y solicitudes de acceso, rectificación y supresión con los plazos de la Ley 25.326 (10 días corridos para acceso; 5 días hábiles para rectificación y supresión), en una constante de configuración.
- **F17. Preferencias e inglés completo.**
- **F18. Escape room "Tu primer sueldo" con Fuerte** (ver 5.1).
- **F19. Repaso espaciado:** a los 7 y 30 días de terminar un módulo, 3 preguntas cortas para fijar lo aprendido.
- **F20. Aprendizaje social:** espacio de preguntas y respuestas por cohorte, moderado por el tutor, con buenas prácticas de privacidad ("No compartas montos ni datos personales").
- **F22. Cripto (nivel 8)** y escape room como desafío especial desde el nivel 4.
- **F21. Registro de actividad tipo xAPI:** cada acción de aprendizaje (empezó, completó, respondió, aprobó) se registra como un enunciado "actor, verbo, objeto" visible para el admin, para mostrar cómo se integraría con un LRS o un LMS corporativo.

### 5.2 Qué toma Alcancía del mercado de aprendizaje corporativo

Documentar en `docs/learning-design.md` qué prácticas actuales incorpora y cuáles quedan como línea futura:

| Práctica | En Alcancía |
| --- | --- |
| Estructura de **LMS**: programas asignados, plazos, seguimiento, reportes | Fase A (F1, F6, F7, F8) |
| Experiencia de **LXP**: diagnóstico, ruta personalizada, contenido a demanda | Fase A (F2, F3) |
| **Microaprendizaje** y diseño **mobile first** para personal operativo | Fase A (lecciones de 5 minutos, Diego en el celular) |
| **Aprendizaje práctico** con simulaciones y casos | Fase A (F4, 5.1) |
| **Evaluación de impacto** (Kirkpatrick) | Fase A (F7), nivel 3 ampliado en F15 |
| **Aprendizaje en el flujo de trabajo** (recordatorios por Teams o Slack) | Fase B (F9, simulado) |
| **Repaso espaciado** | Fase B (F19) |
| **Aprendizaje social** y entre pares | Fase B (F20) |
| **Gamificación con medida** e insignias | Fase A (insignias), fase B (F12, F18) |
| **Estándares de interoperabilidad** (SCORM, xAPI, cmi5) | Fase B (F21, simulado); exportar el programa como paquete, línea futura |
| **Asistente con IA** que responda dudas sobre los módulos | Línea futura |
| **Academia interna** con varios programas y **habilidades** asociadas | Siguiente proyecto: este programa se diseña para poder integrarse ahí |

## 6. Pantallas

### Generales
| # | Pantalla | Ruta |
| --- | --- | --- |
| G0 | Landing con simulador embebido | `/` |
| G1 | Login | `/login` |
| G2 | Simulación neutra de SSO | `/login/sso` |
| G3 | Verificación en dos pasos | `/login/verify` |
| G4 | Problemas para iniciar sesión | `/access-help` |
| G5 | Aviso de privacidad y consentimiento | `/consent` |
| G6 | Layout (barra superior, "Ver como", navegación, sesión) | (layout) |
| G7 | Acceso no permitido / 404 y error inesperado | `*` |
| G8 | Sistema de diseño público | `/design-system` |

### Participante (la billetera, D-50)
| # | Pantalla | Ruta |
| --- | --- | --- |
| P1 | Inicio de la cuenta (saldo, misión activa, próximo desbloqueo, últimos movimientos) | `/app` |
| P2 | Abrir tu cuenta y "Conocerte" (bienvenida, alta simulada, diagnóstico, seguridad) | `/app/welcome` |
| P3 | Pagar (transferir, QR, servicios, comprobante) | `/app/pay`, `/app/pay/:flow` |
| P4 | Ahorrar: presupuesto | `/app/save/budget` |
| P5 | Ahorrar: apartados y metas | `/app/save/pockets` |
| P6 | Ahorrar: rendir (cuenta remunerada, fondo, plazo fijo y UVA de práctica) | `/app/save/yield` |
| P7 | Pagar: tarjeta y préstamos (crédito, cuotas; D-56) | `/app/pay/credit` |
| P8 | Invertir (cuenta comitente, instrumentos, tenencia) | `/app/invest`, `/app/invest/:instrumentId` |
| P9 | Aprender: mapa de niveles y logros | `/app/learn` |
| P10 | Guía (lección) | `/app/learn/guides/:guideId` |
| P11 | Desafío de nivel o de suficiencia (evaluación) | `/app/learn/challenges/:challengeId` |
| P12 | Misión | `/app/missions/:missionId` |
| P13 | Herramientas (SIM-1 a SIM-12 y comparar escenarios) | `/app/tools`, `/app/tools/:simId` |
| P14 | Perfil, seguridad y comprobantes | `/app/profile` |

### Tutor
| # | Pantalla | Ruta |
| --- | --- | --- |
| T1 | Inicio del tutor | `/tutor` |
| T2 | Detalle de cohorte | `/tutor/cohorts/:id` |
| T3 | Asignar desafío | `/tutor/cohorts/:id/challenge` |
| T4 | Resultados de evaluaciones | `/tutor/assessments` |
| T5 | Consultas de participantes | `/tutor/questions` |

### Admin de L&D y Beneficios
| # | Pantalla | Ruta |
| --- | --- | --- |
| O1 | Panel de seguimiento del programa | `/admin` |
| O2 | Personas y cohortes | `/admin/people` |
| O3 | Carga masiva por CSV | `/admin/people/import` |
| O4 | Configuración del programa | `/admin/program` |

### Decisor
| # | Pantalla | Ruta |
| --- | --- | --- |
| D1 | Reporte de impacto | `/sponsor` |

Total de fase A: **33 pantallas** (9 generales + 14 participante + 5 tutor + 4 admin + 1 decisor). Estados en cada pantalla: vacío, carga, error de validación y éxito; confirmación antes de acciones destructivas.

---

## 7. Modelo de datos (JSON simulado)

```ts
type Role = 'ld_admin' | 'tutor' | 'participant' | 'sponsor';
type Dimension = 'budget' | 'savings' | 'debt' | 'inflation_rates' | 'goals';
type Level = 'beginner' | 'intermediate' | 'advanced';

interface Organization {
  id: string; name: string; logoUrl?: string; privacyThreshold: number;   // mínimo 5
}

// Pensado para la futura academia corporativa: Academy > Program > Module > Lesson
interface Program {
  id: string; orgId: string; academyId?: string; name: string; mode: 'voluntary' | 'assigned';
  moduleIds: string[]; requiredModuleIds: string[]; passingScore: number; maxAttempts: number;
  reminderChannels: ('email' | 'teams' | 'slack')[];
}

interface Person {
  id: string; orgId: string; role: Role; name: string; email: string;   // dominio .demo
  jobOrProgram: string; cohortIds: string[]; status: 'invited' | 'active' | 'inactive'; avatarUrl?: string;
}

interface Cohort { id: string; orgId: string; name: string; tutorId: string; area: string; moduleIds: string[]; startDate: string; dueDate?: string }

interface Module {
  id: string; order: number; title: string; objective: string;   // verbo observable
  dimension: Dimension; lessons: Lesson[]; quiz: Question[];
}
interface Lesson { id: string; title: string; minutes: number; blocks: LessonBlock[] }
type LessonBlock =
  | { type: 'hook' | 'text' | 'example' | 'takeaway'; body: string }
  | { type: 'objective'; body: string }
  | { type: 'question'; question: Question }
  | { type: 'simulator'; simId: string; preset?: Record<string, string> }
  | { type: 'glossary'; termIds: string[] };
// Niveles y desbloqueos (5.0)
interface LevelDef {
  id: string; order: number; section: 'account' | 'pay' | 'budget' | 'pockets' | 'credit' | 'yield' | 'invest' | 'crypto';
  guideModuleIds: string[]; missionIds: string[]; toolSimIds: string[];
  unlock: { all: UnlockCondition[] }; challengeId: string; masteryChallengeId?: string;
}
type UnlockCondition =
  | { type: 'level_completed'; levelId: string }
  | { type: 'mission_completed'; missionId: string }
  | { type: 'challenge_passed'; challengeId: string; minScore: number }
  | { type: 'wallet_metric'; metric: 'categorized_movements' | 'months_closed_green' | 'emergency_months' | 'high_rate_debt'; op: '>=' | '<=' | '=='; value: string }
  | { type: 'investor_profile_done' };
interface LevelProgress {
  personId: string; levelId: string; status: 'locked' | 'unlocked' | 'completed';
  unlockedBy?: 'rule' | 'mastery' | 'tutor' | 'admin_free_mode' | 'demo'; reason?: string; at?: string;
}
// Billetera (SIM-13)
interface WalletState {
  balance: string; pocketIds: string[]; yieldMode: 'none' | 'remunerated' | 'money_market';
  day: number; scenarioId: string; securitySettings: { twoFactor: boolean; dailyLimit?: string };
  movements: WalletMovement[]; completedMissionIds: string[];
}
interface WalletMovement {
  id: string; day: number; type: 'income' | 'transfer_out' | 'transfer_in' | 'qr_payment' | 'bill' | 'yield' | 'pocket_in' | 'pocket_out' | 'loan';
  amount: string; counterparty: string; category?: string;   // contrapartes siempre ficticias
}
interface WalletMission {
  id: string; moduleIds: string[]; title: string; objective: string; minutes: number;
  initialState: Partial<WalletState>; steps: { id: string; instruction: string; trigger: string }[];
  learningCards: { trigger: string; title: string; body: string; sourceIds: string[]; question?: Question }[];
  successCriteria: { id: string; description: string; check: string }[];
}
type QuestionType = 'single' | 'multiple' | 'true_false_why' | 'numeric' | 'ordering' | 'matching' | 'categorize' | 'branching' | 'simulator_task';
interface Question {
  id: string; type: QuestionType; prompt: string; dimension?: Dimension;
  options?: { id: string; text: string }[];           // single, multiple, true_false_why
  correctOptionIds?: string[];                          // ausente en preguntas de hábitos
  numeric?: { answer: string; tolerance: string; unit: 'ARS' | 'percent' | 'months' };
  ordering?: { items: { id: string; text: string }[]; correctOrder: string[] };
  matching?: { left: { id: string; text: string }[]; right: { id: string; text: string }[]; pairs: [string, string][] };
  categorize?: { categories: { id: string; label: string }[]; items: { id: string; text: string; categoryId: string }[] };
  branching?: { startNodeId: string; nodes: Record<string, { text: string; choices: { text: string; next?: string; outcome?: string }[] }> };
  simulatorTask?: { simId: string; preset?: Record<string, string>; answer: string; tolerance: string };
  feedback: Record<string, string>;                     // por opción o por resultado
}
interface Attempt { personId: string; moduleId: string; number: number; score: number; startedAt: string; finishedAt: string }

interface DiagnosticResult {
  personId: string; kind: 'initial' | 'final'; takenAt: string;
  scores: Record<Dimension, number>; levels: Record<Dimension, Level>;
}
interface Progress { personId: string; moduleId: string; lessonIdsDone: string[]; quizScore?: number; satisfaction?: 1 | 2 | 3 | 4 | 5 }
interface WeeklyChallenge { id: string; cohortId: string; title: string; dueDate: string }   // desafío semanal del tutor
interface LevelChallenge { id: string; levelId: string; mastery: boolean; questionsPerModule: Record<string, number>; passingScore: number; maxAttempts?: number }   // D-57
interface WeeklyChallengeReport { challengeId: string; personId: string; result: 'done' | 'partial' | 'not_done'; reflection?: string }
interface FollowUp30 { personId: string; answeredAt: string; applied: Record<string, boolean> }

// Solo en el navegador del participante, nunca en métricas ni visible para otros roles:
interface LocalScenario { id: string; simId: string; name: string; inputs: Record<string, string>; savedAt: string }
interface LocalGoal { id: string; name: string; currentPrice: string; months: number; contributions: { date: string; amount: string }[] }

interface ScenarioPreset { id: 'low' | 'medium' | 'high'; label: string; monthlyInflation: string; exampleRates: Record<string, string>; note: 'example' }
interface GlossaryTerm { id: string; term: string; definition: string; sourceIds: string[] }
interface OfficialSource { id: string; name: string; url: string; verifiedAt: string }
```

### Reglas de negocio
- Montos y tasas en `src/lib/finance/` con `Decimal`; los montos se guardan como texto decimal (`"150000.00"`), nunca como `number`.
- Toda métrica agregada pasa por `aggregate()` en `metrics.ts`, que devuelve "datos insuficientes" si el grupo tiene menos de `privacyThreshold` personas.
- `LocalScenario` y `LocalGoal` se guardan en un espacio de `localStorage` separado por persona y nunca se leen desde vistas de otros roles (test que lo verifica).
- `DEMO_TODAY` fijo en 16/11/2026 para que los datos se vean coherentes (D-60).

### Datos semilla
- Andina Servicios: 4 cohortes (una por área) y unas 80 personas participantes, con distinta adopción por área (el centro de distribución, sobre todo desde el celular); con diagnósticos iniciales y algunos finales, progreso variado, satisfacción, desafíos y seguimientos a 30 días, para que los paneles muestren diferencias reales.
- Al menos una cohorte con menos de 5 personas, para mostrar el umbral de privacidad.
- Estados de demo en niveles (coinciden con el modo demo de 5.0): **Diego en el nivel 2** (Pagar), con "Conocerte" hecho, las guías y el desafío del nivel 1 hechos desde el celular y un desafío semanal cumplido. **Mariana en el nivel 6** (Rendir), con "Conocerte" hecho, un apartado de fondo de emergencia de 2 de 3 meses, una meta de ahorro y un desafío semanal pendiente (así se ve el bloqueo de Invertir con su progreso).
- Los 16 módulos de fase A con sus lecciones y evaluaciones.
- Botón "Restablecer demo" en la landing y en el menú de usuario.

---

## 8. Seguridad y privacidad

### 8.1 Simulado en la interfaz
SSO, MFA, bloqueo por intentos, derivación a la mesa de ayuda, expiración de sesión, RBAC, consentimiento y umbral de privacidad.

### 8.2 Aplicado de verdad en el front-end
Igual que Rumbo: sin secretos ni datos reales; validación con Zod; sin `dangerouslySetInnerHTML`; **CSP** inyectada en el build (`script-src 'self'` estricto; `style-src 'self' 'unsafe-inline'` por Radix, Motion y Recharts) y la CI falla si falta; enlaces externos con `rel="noopener noreferrer"`; `npm audit` en CI; dependencias con versión fija; en `localStorage` solo datos de demo.

### 8.3 Arquitectura de producción (`docs/security.md`)
Identidad con SSO (OIDC o SAML) y MFA del proveedor; sesiones en cookies `HttpOnly`; RBAC en servidor; multi-tenant por empresa; **los datos financieros personales no se envían al servidor** (cálculo en el dispositivo) o, si se guardan, cifrados y fuera del alcance de la organización; métricas agregadas con umbral mínimo; Ley 25.326 y, si se trabajara con menores, consentimiento de responsables y mínimos datos.

---

## 9. Fuera del alcance y líneas futuras
- **Encabezados de seguridad por HTTP con Cloudflare** y dominio propio (D-70): hoy no se puede en GitHub Pages.
- **Datos en vivo** (tasas, UVA, inflación) desde fuentes oficiales: requiere backend o un proceso de actualización; hoy son escenarios de ejemplo.
- Recomendaciones personalizadas de productos, conexión con cuentas bancarias o billeteras, y cualquier operación real: **fuera por decisión de diseño**, no solo por alcance.
- Integración real con LMS corporativos (SCORM, xAPI, cmi5) y con Teams o Slack.
- La academia corporativa con varios programas (ciberseguridad, IA, etc.): siguiente proyecto.
- **Asistente conversacional** que responda dudas sobre los módulos: línea futura; dejar previsto el lugar del botón de ayuda flotante.

---

## 10. Orden de trabajo sugerido

### Fase A
0. **Documentación base antes de programar** (sección 14): proto-personas, `docs/learning-design.md`, `docs/content.md` con los objetivos de los módulos, `docs/formulas.md`, arquitectura de la información, requerimientos, casos de uso, roles y flujos. Lourdes los revisa.
1. Setup: Vite + TS + Tailwind + shadcn/ui + `createHashRouter` + react-i18next + deploy a GitHub Pages.
2. Tokens en cuatro niveles, `tokens.test.ts`, componentes base (incluidos `MoneyInput`, `PercentInput` y `MoneyText`), `/styleguide`, test de desbordes y axe.
3. `src/lib/finance/` con todas las fórmulas y sus tests; `metrics.ts` con el umbral de privacidad; datos semilla y stores.
4. **Piloto visual:** G0 (con SIM-3 embebido), P1 y SIM-3. Capturas a Lourdes y esperar aprobación.
5. Acceso y seguridad base (G1 a G7) y "Ver como".
6. **Estructura de la billetera:** navegación de 5.3 en los tres tamaños, motor de niveles y desbloqueos (5.0) y motor de misiones; niveles 0 y 1 (P1, P2, P14). Capturas a Lourdes en celular, tablet y escritorio.
7. Niveles 2 a 4: Pagar, Presupuesto, Apartados (P3, P4, P5), con sus guías, desafíos y misiones (P9 a P12).
8. Niveles 5 y 6: Crédito y Rendir (P6, P7) y las herramientas SIM-1 a SIM-12 (P13).
9. Nivel 7: Invertir con la cuenta comitente de práctica (P8, SIM-14).
10. Tutor (T1 a T5).
11. Admin y decisor (O1 a O4, D1) y configuración del programa.
12. Sistema de diseño público (G8) y `docs/design-system.md`.
13. Pulido, seguridad real del front y `docs/security.md`.
14. **Revisión intermedia** en `docs/review-fase-a.md`.

### Fase B
15 a 28. F9 a F22, en ese orden, y el informe final.

Después de cada paso: build, tests y deploy en verde.

---

## 11. Criterios de aceptación de fase A
- [ ] Desde la landing se elige el rol y se entra en un clic pasando por SSO y MFA simulados.
- [ ] El simulador de inflación funciona en la landing sin iniciar sesión.
- [ ] La experiencia de Diego en el celular (lección de 5 minutos, evaluación y desafío) funciona sin desbordes ni gestos sin alternativa.
- [ ] Las evaluaciones usan los tipos de 5.1, cada uno con su alternativa accesible al arrastre y retroalimentación explicada.
- [ ] El diagnóstico genera niveles por dimensión y una ruta explicada; se puede repetir para medir el avance.
- [ ] Cada lección sigue la secuencia de F3 y cada módulo tiene objetivo con verbo observable y evaluación.
- [ ] Los 12 simuladores calculan correctamente: todos los tests de `src/lib/finance/` pasan, con casos calculados a mano documentados en `docs/formulas.md`.
- [ ] Ningún cálculo de dinero usa `number` de punto flotante.
- [ ] Cada resultado muestra los supuestos, la frase en lenguaje simple, el gráfico con su tabla y el aviso legal.
- [ ] Ningún texto presenta un valor como actual ni recomienda un producto. Las entidades reales aparecen solo en las fichas de los Anexos C y D, con las reglas de 1.1.1.
- [ ] El participante entra a una billetera, no a un campus: el mapa de 5.0 funciona, cada sección bloqueada muestra qué falta, los desafíos de suficiencia desbloquean, el tutor puede desbloquear con motivo y el modo demo muestra todo desbloqueado.
- [ ] La billetera completa las misiones en celular y escritorio, con devolución en cada error, sin pedir ningún dato real y sin parecerse a una app existente.
- [ ] Los paneles muestran solo métricas agregadas de las misiones; ningún saldo, movimiento o decisión de la billetera es visible para otro rol (test).
- [ ] Los montos y metas del participante no aparecen en ninguna vista de otro rol (test).
- [ ] Ninguna métrica se muestra para grupos de menos de 5 personas (test).
- [ ] La carga por CSV valida fila por fila y permite corregir antes de confirmar.
- [ ] Los paneles del tutor, el admin y el decisor se calculan desde los datos y reflejan los niveles 1 a 3 de Kirkpatrick.
- [ ] Textos en español latinoamericano neutro, con el vocabulario y el formato de números de 2.9.
- [ ] Campos de dinero y porcentaje con máscara, ayuda y ejemplo; deslizadores con campo numérico.
- [ ] axe sin errores, flujos principales con teclado y resultados anunciados al lector de pantalla.
- [ ] Sin desbordes en los 6 anchos y montos largos que nunca se cortan.
- [ ] Sin degradés ni sombras en tarjetas en reposo; animaciones de 2.6 que respetan "reducir animaciones".
- [ ] Sistema de diseño público con la sección "Cómo mostramos el dinero".
- [ ] CSP, `npm audit` en CI y deploy público funcionando.
- [ ] Documentación de la sección 14 completa y coherente con lo construido.

---

## 12. Cómo trabajar y registrar dudas
- **Responde siempre en español** (informes, **avances intermedios**, preguntas, decisiones y `docs/`); código y commits en inglés.
- **No resolver dudas en silencio:** elige lo más razonable, sigue y anótalo en `docs/decisions.md` (fecha, duda, decisión, por qué y si Lourdes debe confirmarla). Si cambia alcance, modelo de datos o el flujo de un rol, pregunta antes.
- Con contenido financiero o legal dudoso, **no lo inventes**: márcalo como pendiente de verificación en `docs/content.md` y pregunta.
- `docs/progress.md` al terminar cada paso; incidencias en `docs/issues.md`.
- Si un cambio de código altera un requerimiento, un flujo o un caso de uso, actualiza la documentación en el mismo paso.

## 13. Informe de revisión
Igual formato que Rumbo, en `docs/review-fase-a.md` y `docs/review.md`: resumen; qué se hizo por función y pantalla; criterios de aceptación con evidencia; qué falta; qué ajustar (desbordes, sombras, íconos, animaciones, textos, accesibilidad); **cálculos** (tests de fórmulas y casos revisados a mano); seguridad y privacidad (8.2, umbral, datos locales); dudas y decisiones; documentación; riesgos para la demo; próximos pasos. Decir con honestidad lo que no se pudo verificar.

---

## 14. Documentación del proyecto

En `docs/`, en Markdown, con diagramas Mermaid y citas en **APA 7**. Índice en `docs/README.md`. Referencias base: WCAG 2.2 (ISO/IEC 40500:2025), ISO/IEC 25010:2023, Material Design 3, Gothelf y Seiden (2021) para proto-personas, Rosenfeld, Morville y Arango (2015) para arquitectura de la información, Wiggins y McTighe para Backward Design, Gagné para los eventos de instrucción, Anderson y Krathwohl para la taxonomía de Bloom revisada y Kirkpatrick para la evaluación.

- **14.1 `personas.md`:** proto-personas rotuladas "Hipótesis sin validar", una por rol (dos participantes: oficina y operativo), con tabla de supuestos y plan de validación. Sin datos inventados.
- **14.2 `roles.md`:** diagrama de roles, matriz de permisos desde `permissions.ts` y qué datos ve cada rol.
- **14.3 `requirements.md`:** RF y RNF (ISO/IEC 25010:2023) con prioridad MoSCoW, criterios y estado.
- **14.4 `use-cases.md`:** al menos: hacer el diagnóstico; completar una lección con práctica; comparar dos escenarios en un simulador; crear una meta; asignar un desafío; importar personas por CSV; configurar el programa como asignado con fecha límite; resolver un caso con decisiones; consultar el reporte de impacto.
- **14.5 `flows.md`:** task flows, user flows y wireflows rotulados; mapa de pantallas por rol; diagramas de estados (progreso de módulo, desafío, persona invitada).
- **14.6 `information-architecture.md`:** inventario de contenidos, organización, rotulado (con el vocabulario fijo de 2.9), navegación, búsqueda, mapa del sitio por rol, plantillas de página y plan de validación.
- **14.7 `design-system.md`:** versión Markdown del sitio del sistema de diseño.
- **14.8 `learning-design.md`:** análisis del público (principios de andragogía; personal de oficina y operativo; aprendizaje en el celular y en ratos cortos), resultados de aprendizaje con Backward Design, mapa de módulos y dimensiones, secuencia de Gagné, estrategia de evaluación con Kirkpatrick y plan de mejora.
- **14.9 `content.md`:** por módulo, objetivo, evidencia, actividades, fuentes y estado de revisión por especialista.
- **14.10 `formulas.md`:** cada fórmula con su explicación, supuestos, simplificaciones y casos de prueba calculados a mano.
- **14.11 `issues.md`, `decisions.md`, `progress.md` y `questions.md`** (dudas de contenido y datos pendientes de verificar, incluidos los ⚠ de los Anexos B y C).
- **14.13 `wallet-engine.md`:** reglas de la economía simulada (cobro del sueldo, débitos, inflación sobre precios, cálculo de "meses de gastos" y origen de las deudas de la simulación).
- **14.12 `security.md`** (con las capas actuales en GitHub Pages, sus límites y la mejora futura con Cloudflare, D-70).

---

## 15. Indexación y difusión
Como Rumbo: la landing se puede indexar (`robots`, `canonical`, datos estructurados `WebApplication` con la autora, `robots.txt`, `sitemap.xml`), con Open Graph y `og-image.png` de 1200 × 630 generada desde un componente, favicon y manifiesto. URL absolutas del sitio publicado.

## 16. README del repositorio
Problema, roles, capturas, link a la demo y al case study, enlace a `docs/README.md`, stack, cómo correrlo, aviso de contenido educativo y autoría: **Lourdes Pedaci, Experience Designer (Learning y UX/UI)**.

---

## Anexo A. Resumen de la presentación del taller (contenido validado)

Fuente: Giampieri, K. (2026), presentación del taller "Del aula al primer trabajo" (ver 1.1). Es la base del contenido validado. Se cita en `docs/content.md` como A-xx (número de diapositiva). El original usa voseo y tono juvenil: al adaptarlo, cambia el registro y conserva datos y conceptos.

**Psicología y mentalidad (A-06 a A-16) → módulo 2**
- A-06: hablar de dinero es un tabú ("en la mesa no se habla de plata").
- A-08: las finanzas personales no son magia, son administración y disciplina.
- A-10 a A-12: riqueza real frente a apariencia. Contraste entre un inversor paciente (Charlie Munger, patrimonio acumulado con disciplina) y quienes venden una imagen de éxito en redes; la riqueza real suele ser invisible, son activos y no objetos de consumo; endeudarse por estatus es "comprar lo que no necesitas para impresionar a quien no conoces". Para Alcancía, conservar la idea y quitar referencias a influencers.
- A-13: la trampa dopamínica. El marketing explota la gratificación inmediata; la deuda de consumo compromete tu futuro.
- A-14: sesgo de descuento hiperbólico (US$ 100 hoy o US$ 110 mañana). Clave: sumar fricción entre el impulso y la compra, esperar 48 horas antes de comprar algo no esencial.
- A-15 y A-16: el minimalismo como estrategia: menos suscripciones y gastos fijos, menos decisiones de consumo, evitar la inflación del estilo de vida, dinero con propósito.

**Conceptos fundamentales (A-17 a A-21) → módulos 2, 9 y 12**
- A-18: finanzas personales es la gestión integral de ingresos, gastos, ahorro e inversión a lo largo de la vida.
- A-19: costo de oportunidad. Cada peso gastado en un consumo efímero deja de ganar interés compuesto; "no es solo un café de $ 5.000, es ese capital invertido a 30 años".
- A-20: gastar o invertir. iPhone comprado en 2016 por US$ 969 vale US$ 0 en 2026; US$ 969 invertidos en acciones de Apple en 2016 valdrían unos US$ 11.800 en 2026. ⚠ Mostrar como ejemplo histórico, aproximado, con la frase de rendimientos pasados.
- A-21: inflación, "el ladrón silencioso": el dinero quieto pierde poder de compra (hoy, en 1 año, en 5 años); invertir es una estrategia de defensa.

**Deudas (A-22 a A-30) → módulos 5 y 7, SIM-9**
- A-23: si la tarjeta cobra 120 % anual, pagar esa deuda equivale a ganar un 120 % asegurado. Orden: pagar deudas, después ahorrar, después invertir.
- A-24 a A-27: bola de nieve (psicología): se ataca primero la deuda de menor saldo. Ejemplo: Tarjeta ropa $ 5.000 (mínimo $ 500), Préstamo personal $ 25.000 (mínimo $ 2.000), Crédito auto $ 100.000 (mínimo $ 10.000). Se pagan todos los mínimos y todo el extra va a la deuda más chica; al saldarla, su cuota se suma a la siguiente. La capacidad de pago crece con cada deuda saldada.
- A-28 y A-29: avalancha (matemática): se ataca primero la deuda con mayor tasa. Ejemplo: Tarjeta 150 % anual $ 40.000, Financiera 110 % $ 15.000, Crédito bancario 80 % $ 200.000. Es el método que menos intereses paga.
- A-30: bola de nieve si necesitas motivación y resultados rápidos; avalancha si priorizas pagar menos intereses.
- Los datos de ejemplo de A-25 y A-29 son los casos de prueba iniciales de SIM-9.

**Administración (A-31 a A-36) → módulos 3 y 4, SIM-12**
- A-32: regla 50/30/20 (el original la llama 50/20/30): 50 % esenciales (alquiler, comida, luz), 30 % deseos (salidas, ropa, streaming), 20 % ahorro e inversión.
- A-33: variante 70/20/10 para gastos fijos altos: 70 % gastos fijos y variables, 20 % ocio, 10 % ahorro e inversión.
- A-34: gastos hormiga (café, golosinas, suscripciones sin uso) pueden llegar al 15 % del ingreso anual. Truco: anotar todo durante un mes.
- A-35: fondo de emergencia de 3 a 6 meses de gastos básicos, solo para emergencias reales (salud, pérdida de empleo).
- A-36: dónde guardarlo: liquidez en 24 horas y bajo riesgo (cuentas remuneradas o fondos money market).

**Inversión (A-37 a A-51) → módulos 12, 14, 15 y 16, SIM-10**
- A-38: ahorrar es guardar dinero (retener valor); invertir es poner el dinero en activos que generan más dinero.
- A-39: interés compuesto `C = P × (1 + r)^n`; el tiempo es el factor más potente.
- A-40: SPY es un ETF que replica a las 500 empresas más grandes de EE. UU.; retorno histórico de alrededor de 10 % anual en dólares en los últimos 50 años. ⚠ El dato de 50 años corresponde al **índice S&P 500** (el ETF SPY existe desde 1993); en la app, atribuirlo al índice.
- A-42: con datos desde 1926, probabilidad de resultado positivo: 73 % a 1 año, 87 % a 5 años, 100 % a 15 años. ⚠ Confirmar con Kevin la fuente exacta (las series de períodos móviles del S&P 500 desde 1926 las publican, entre otros, Dimensional Fund Advisors) y mostrar período, moneda y fuente.
- A-43: Nasdaq 100 (QQQ): las 100 mayores empresas no financieras, con peso de tecnología, comunicaciones y consumo.
- A-44: Dow Jones Industrial Average (DIA): 30 grandes empresas de EE. UU. de distintos sectores.
- A-45: MSCI ACWI: empresas grandes y medianas de mercados desarrollados y emergentes; el mercado accionario global en una sola inversión.
- A-46: precios de venta en pesos al 14/09/2026: QQQ $ 56.625, DIA $ 41.820, SPY $ 20.400, ACWI $ 9.780. Solo como ejemplo fechado ("valores al 14/09/2026"), nunca como precio actual. Son precios de CEDEAR, así que se usan en el módulo 15 para mostrar que el precio en pesos depende del ratio.
- A-48 a A-51: criptomonedas. Bitcoin como reserva de valor digital, descentralizada y finita (máximo 21 millones); Ethereum como infraestructura de aplicaciones y contratos inteligentes; alta volatilidad, solo dinero que no necesites a corto plazo. Gestión de riesgo: 90/10 (90 % activos tradicionales, 10 % cripto), DCA (monto fijo todos los meses sin mirar el precio), custodia ("not your keys, not your coins", billeteras frías). Halving cada 4 años: la recompensa por bloque pasó de 6,25 a 3,125 BTC; no garantiza suba de precio. Tabla de para qué sirve cada una: BTC, ETH, USDT (valor cercano al dólar), BNB, XRP. ⚠ En Alcancía, el 90/10 se presenta como un ejemplo de cómo se piensa la asignación, no como recomendación (1.2).

**Ejecución (A-52 a A-58) → módulo 13**
- A-53: el bróker es el intermediario regulado para comprar acciones, ETFs, bonos y FCI; siempre verificar que esté autorizado por la CNV.
- A-54: pasos para abrir cuenta: elegir bróker (comparar comisiones y plataforma), validar identidad (DNI y selfie), test de inversor (conservador, moderado o agresivo), fondear desde tu CBU.
- A-55: mentalidad, disciplina y tiempo: US$ 200 por mes al 12 % anual durante 33 años ≈ US$ 1.000.000 (verificado: US$ 1.008.712 con capitalización mensual; caso de prueba de SIM-10).
- A-58: cierre: "el mejor momento para plantar un árbol fue hace 20 años; el segundo mejor es hoy".

## Anexo B. Datos de fuentes oficiales (verificados el 11/11/2026)

Cada dato tiene un código B-xx para citarlo en `docs/content.md` y en el panel de fuentes. Antes de publicar, Claude Code vuelve a abrir cada URL y, si un dato cambió, lo actualiza con la fecha nueva y lo anota en `docs/questions.md`. Los que tienen ⚠ necesitan confirmación de Kevin o una segunda lectura de la norma.

**Bancos, depósitos y garantía (BCRA)**
- B-01. Garantía de los depósitos: desde el 01/04/2026 cubre hasta **$ 50.000.000 por persona** y por entidad, en pesos y en moneda extranjera (Comunicación "A" 8407 del 05/03/2026; antes $ 25.000.000). Si la cuenta tiene varios titulares, el monto se prorratea. La administra SEDESA. Quedan excluidos, entre otros, los depósitos con tasas superiores a las de referencia que publica el BCRA. Fuente: https://www.bcra.gob.ar/Pdfs/comytexord/A8407.pdf
- B-02. Plazo fijo tradicional: plazo mínimo de 30 días (normas "Depósitos e inversiones a plazo"). ⚠ Verificar si sigue vigente alguna tasa mínima para personas antes de mencionarla; por defecto no se menciona.
- B-03. Plazo fijo UVA: el capital se expresa en UVA, que se actualiza por CER (inflación). Desde el 02/06/2025 los bancos **ya no están obligados** a ofrecerlo (Comunicación "A" 8246), así que puede no estar disponible en todos. Las condiciones (plazo mínimo de 90 o 180 días, precancelación desde el día 30 con tasa menor) dependen de la entidad. En la app: "consulta las condiciones de tu banco". Fuente: BCRA, Informe sobre Bancos, normativa mayo 2025.
- B-04. Costo financiero total (CFT): las entidades deben informar en los documentos la TNA, la TEA y el CFT, con el CFT destacado; el CFT incluye la tasa, las comisiones y los cargos (normas "Tasas de interés en las operaciones de crédito", punto 3). argentina.gob.ar lo explica como CFT = TEA + comisiones + gastos. Fuentes: https://www.bcra.gob.ar/archivos/Pdfs/Texord/t-tasint.pdf y https://www.argentina.gob.ar/node/371108
- B-05. Tarjetas de crédito: la Ley 25.065 limita el interés compensatorio a no más de 25 % por encima de la tasa que la misma entidad cobra en préstamos personales. ⚠ Confirmar redacción con la ley. Fuente: https://www.argentina.gob.ar/normativa/nacional/ley-25065-1998-55556/texto
- B-06. Central de Deudores del BCRA: permite consultar tu situación crediticia (si pagaste a término tarjetas y créditos). Fuente: https://www.argentina.gob.ar/node/371108

**Billeteras virtuales y pagos (BCRA)**
- B-10. Las billeteras que ofrecen cuentas con CVU son **proveedores de servicios de pago que ofrecen cuentas de pago (PSPCP)** y deben inscribirse en el registro del BCRA (Comunicaciones "A" 6859 y "A" 6885).
- B-11. Los fondos de los clientes deben estar disponibles en forma inmediata y depositados en cuentas a la vista en bancos del país ("A" 6859).
- B-12. **Los fondos en una cuenta de pago no tienen la garantía de los depósitos.** Los PSP deben aclarar en su publicidad que se limitan a ofrecer servicios de pago y que los fondos no cuentan con esa garantía ("A" 6885). Fuente: https://www.bcra.gob.ar/archivos/Pdfs/comytexord/A6885.pdf
- B-13. La retribución que el PSPCP cobra por los saldos en pesos depositados en bancos debe trasladarse **por completo** a los clientes ("A" 7825, 2023).
- B-14. Si la "cuenta remunerada" de una billetera en realidad suscribe cuotapartes de un **fondo money market**, es una inversión en un FCI regulado por la CNV, no un depósito: no tiene garantía de los depósitos y su rendimiento varía a diario. La app enseña a mirar en los términos de la billetera si se trata de una cuenta o de un fondo.
- B-15. Transferencias 3.0: transferencias inmediatas (acreditación en línea en un máximo de 15 segundos) entre CBU y CVU, y pagos con **QR interoperable**: cualquier billetera o app bancaria puede leer cualquier QR (puesta en marcha completa el 29/11/2021). No hace falta tarjeta de débito. Fuente: https://www.bcra.gob.ar/transferencias-3-0/
- B-16. CBU (Clave Bancaria Uniforme) identifica cuentas bancarias; CVU (Clave Virtual Uniforme) identifica cuentas de pago en billeteras. Ambas pueden tener alias.
- B-17. Tamaño del fenómeno (Informe de Pagos Minoristas del BCRA, septiembre 2026, datos de agosto): 70,1 millones de cuentas de pago, 16,1 millones con saldo; **$ 0,9 billones en saldos de cuentas de pago frente a $ 9 billones invertidos en fondos de dinero** a través de las billeteras; el 75 % de las transferencias inmediatas en pesos tuvo una CVU como origen o destino; 93 billeteras digitales interoperables registradas. Uso en la app: mostrar que la mayor parte del dinero "en la billetera" está en un fondo, no en la cuenta. Fuente: https://www.bcra.gob.ar/publicaciones/informe-de-pagos-minoristas-septiembre-de-2026/
- B-18. Los PSPCP no pueden realizar ni facilitar operaciones con criptoactivos (Comunicación "A" 7759, mayo 2023). Por eso los servicios cripto los dan empresas distintas, que se registran como PSAV en la CNV (B-27).
- B-19. Una billetera puede ser de un PSPCP (cuenta de pago con CVU), de una entidad financiera (cuenta bancaria con CBU) o solo **iniciar** pagos desde cuentas que no provee (Comunicación "A" 7462 y glosario de pagos minoristas del BCRA). El registro de PSP del BCRA está en https://www.bcra.gob.ar/registro-de-proveedores-de-servicios-de-pago/

**Mercado de capitales (CNV, Caja de Valores)**
- B-20. Agentes registrados: personas humanas o jurídicas inscriptas en la CNV que intermedian entre inversores y el mercado. Categorías principales: **ALyC** (liquida y compensa operaciones), **AN** (canaliza órdenes), **AP** (agente productor, promueve y asesora), **AAGI** (asesora y puede administrar carteras). Los agentes deben informar sus costos antes de operar. Fuente: https://www.argentina.gob.ar/node/356934
- B-21. Cómo verificar un agente: Registro Público de Agentes de la CNV, por nombre, razón social, CUIT o matrícula: https://www.cnv.gov.ar/sitioWeb/RegistrosPublicos/Agentes. La publicidad de un agente debe indicar su categoría y número de registro en la CNV. Si no figura, extremar precauciones.
- B-22. **Tus títulos están a tu nombre:** lo que compras a través de un agente registrado se deposita en una **subcuenta comitente a tu nombre** en Caja de Valores S.A., asociada a la cuenta del agente. Puedes consultar tenencias en los canales del agente y de Caja de Valores. Fuente: https://www.argentina.gob.ar/node/356934
- B-23. Reclamos: primero al Responsable de Relaciones con el Público del agente; si no se resuelve, consulta o denuncia ante la CNV.
- B-24. Alertas al inversor de la CNV (ofertas irregulares, entidades no autorizadas): https://www.argentina.gob.ar/cnv/alertas-al-inversor. Registro de Idóneos: https://www.cnv.gov.ar/SitioWeb/RegistrosPublicos/Idoneos. Señales de alerta: rendimientos garantizados, urgencia, "oportunidad única", falta de matrícula.
- B-25. Fondos comunes de inversión: no son sociedades sino patrimonios formados por los aportes de los cuotapartistas (Ley 24.083), regulados por la CNV. Fuente: https://www.argentina.gob.ar/node/268483
- B-26. Fondos money market (de mercado de dinero): bajo riesgo y muy corto plazo, para manejar liquidez; rescate en el día. La RG CNV 1038 distingue variantes y la RG 1092 limitó desde el 01/12/2025 su inversión en cauciones al 20 % del patrimonio. No tienen garantía de los depósitos. ⚠ Confirmar los nombres de las variantes con la RG 1038 antes de mostrarlos.
- B-27. Criptoactivos: los proveedores de servicios de activos virtuales (exchanges, custodios) deben inscribirse en el **Registro PSAV** de la CNV (Ley 27.739, RG 994/2024 y RG 1058/2025): https://www.cnv.gov.ar/SitioWeb/RegistrosPublicos/Psav. **La inscripción no implica que la CNV recomiende, avale ni garantice** los servicios ni sus rendimientos. Las billeteras de autocustodia están excluidas del registro.

**CEDEARs y ETFs (BYMA, Caja de Valores)**
- B-30. Un CEDEAR (Certificado de Depósito Argentino) es un instrumento emitido en Argentina que da acceso a activos del exterior que no cotizan en el mercado local; cada certificado está respaldado por un depósito del activo. Se custodian en Caja de Valores con las mismas condiciones que las acciones argentinas. Fuente: https://byma.com.ar/productos/productos-financieros/cedears
- B-31. **Ratio de conversión:** cuántos CEDEARs equivalen a una acción o cuotaparte en su mercado de origen (por ejemplo, 20:1 = 20 CEDEARs por acción). El inversor puede convertirlos según el ratio. Los ratios vigentes están en el PDF "CEDEARs negociables en BYMA con ratios de conversión" de la misma página. Los ratios pueden cambiar (por splits o ajustes del programa): la app nunca muestra un ratio real como fijo; los ejemplos usan ratios de ejemplo o citan el PDF con su fecha.
- B-32. Se puede invertir en pesos o en dólares, con baja inversión inicial gracias al ratio. La ganancia puede venir de la valorización o de los dividendos, que **se cobran en dólares** aunque la inversión haya sido en pesos.
- B-33. CEDEARs de ETF: representan fondos que cotizan en el exterior (por ejemplo, los que replican el S&P 500 o el Nasdaq 100). Listado en Caja de Valores: https://www.cajadevalores.com.ar/Servicios/Cedears (⚠ el 12/11/2026 no respondía; probar `https://cajadevalores.com.ar` sin `www`. Si sigue sin responder, usar la página de CEDEARs de BYMA de B-30, que es del mismo grupo y dice que la custodia es de Caja de Valores)
- B-34. Operatoria según BYMA: elegir una ALyC autorizada, abrir cuenta, transferir fondos desde una cuenta bancaria o billetera, indicar instrumento, precio y cantidad. Acreditación en el día (contado inmediato) o al día hábil siguiente (24 horas).
- B-35. Horario: desde el 02/11/2026, la renta variable a 24 horas (acciones y CEDEARs) se negocia de 10:30 a 18:00; contado inmediato de 10:30 a 17:00. ⚠ Confirmar en https://byma.com.ar/mercado/horarios (la fuente leída fue prensa especializada sobre el comunicado de BYMA).
- B-36. Precio teórico de un CEDEAR (didáctico, SIM-11): `precio en pesos ≈ precio del activo en dólares × tipo de cambio implícito ÷ ratio`. El precio real puede tener una prima o un descuento por oferta y demanda. Es la misma fórmula de las "Fórmulas de referencia" de la sección 5, escrita en otro orden.

**Inflación**
- B-40. El IPC lo publica el INDEC (https://www.indec.gob.ar). La UVA y el CER los publica el BCRA a diario.

## Anexo C. Brókers registrados en la CNV (ficha informativa)

Se muestran en el módulo 13 y en el panel de fuentes, en una tabla con este encabezado: "Algunos agentes de liquidación y compensación (ALyC) registrados en la CNV. La lista es informativa y no es una recomendación; hay muchos más. Verifica siempre la matrícula en el Registro Público de Agentes de la CNV antes de abrir una cuenta."

Orden alfabético. Matrículas verificadas el 11/11/2026 en documentos oficiales de cada agente, de los mercados (nómina de agentes de MAV y de BYMA) o de la CNV:

| Nombre comercial | Razón social | Categoría y matrícula CNV |
|---|---|---|
| Allaria | Allaria S.A. | ALyC y AN Integral N° 24 |
| Balanz | Balanz Capital Valores S.A.U. | ALyC Integral N° 210 |
| Bull Market Brokers | Bull Market Brokers S.A. | ALyC Propio N° 247 |
| Cocos Capital | Cocos Capital S.A. | ALyC Propio N° 688 |
| IOL invertironline | InvertirOnline S.A.U. | ALyC N° 273 (figura como Propio o Integral según el documento: ⚠ confirmar categoría en el Registro de la CNV) |
| PPI | PP Inversiones S.A. | ALyC Integral N° 686 (nota: en noviembre de 2026 Banco de Valores S.A. anunció su fusión por absorción, sujeta a la aprobación del BCRA y la CNV y con cierre previsto en 2027; mientras siga en el registro se muestra, con esta nota y la fecha. Volver a revisar antes de publicar) |

Reglas de la ficha:
- Datos en `src/data/brokers.json` con `razonSocial`, `nombreComercial`, `categoria`, `matricula`, `fuente` y `verificadoEl`. Al construir, Claude Code vuelve a verificar cada matrícula en el Registro de la CNV o en la nómina de BYMA (https://www.byma.com.ar/mercado/para-agentes-miembros/listado-de-alycs) y actualiza la fecha.
- Sin logos, colores de marca, comisiones, cantidad de clientes, rankings de volumen ni enlaces de alta. Solo un enlace por fila a la búsqueda en el registro de la CNV.
- El texto de la lección explica **qué mirar al elegir** (registro y matrícula, categoría, costos informados, canales de reclamo, que los títulos queden en tu subcuenta comitente de Caja de Valores) en lugar de comparar empresas.
- Cualquier ejercicio o simulación de apertura de cuenta usa el bróker ficticio (1.1.1).

## Anexo D. Billeteras y fintech en Argentina (ficha informativa)

Se muestra en el módulo 17 y en la billetera de práctica (área "Verificar"). Encabezado: "Algunas billeteras y fintech que se usan en Argentina, ordenadas por el tipo de cuenta que te dan. La lista es informativa, no es una recomendación y puede cambiar: varias fintech están obteniendo licencias bancarias. Verifica siempre en el registro oficial y en la leyenda legal de la app."

**El concepto que enseña la ficha:** lo que importa no es la marca, sino **qué tipo de cuenta tienes**, porque eso define la protección (B-01, B-12, B-19). Una misma app puede ofrecer productos de distinto tipo (cuenta de pago, cuenta bancaria, fondo, servicio cripto), así que se enseña a leer la leyenda legal del pie y los términos de cada producto.

| Tipo | Qué tienes | ¿Garantía de los depósitos? | Ejemplos (verificar al construir) | Dónde se verifica |
|---|---|---|---|---|
| Billetera de un proveedor de servicios de pago (PSPCP) | Cuenta de pago con CVU; si "rinde", suele ser un fondo money market | No | Mercado Pago (Mercado Libre S.R.L.; su leyenda dice que ofrece servicios de pago y no está autorizado a operar como entidad financiera); Ualá (cuenta con CVU; nota: el grupo tiene además Ualá Bank S.A.U.); Personal Pay; Prex | Registro de PSP del BCRA (B-19) |
| Billetera de un banco o compañía financiera | Cuenta bancaria (caja de ahorros) con CBU | Sí, hasta el tope vigente (B-01) | Cuenta DNI (Banco de la Provincia de Buenos Aires, abre una caja de ahorros con CBU); BNA+ (Banco de la Nación Argentina); Naranja X (Naranja Digital Compañía Financiera S.A.U., cuenta con CBU); Brubank (banco digital) | Listado de entidades financieras del BCRA |
| Billetera que conecta tus cuentas | No guarda tu dinero: inicia pagos y transferencias desde tus cuentas bancarias | La de tu banco | MODO (billetera de bancos adheridos) | Registro de PSP del BCRA (función de iniciación) y tu banco |
| Servicios con criptoactivos | Cuenta en un proveedor de servicios de activos virtuales | No; la CNV no garantiza servicios ni rendimientos (B-27) | Belo, Lemon | Registro PSAV de la CNV (B-27) |
| Fintech que pasan a ser bancos (2026) | Depende del producto y de la fecha | Depende | **Fila no publicada por ahora:** Cocos y Revolut no figuraban como bancos en el listado de entidades del BCRA (actualizado a julio de 2026) y la licencia bancaria de Mercado Pago tenía aprobación técnica según la prensa, pendiente del Directorio del BCRA. Se vuelve a revisar antes de publicar | Comunicados del BCRA |

**Estado de la verificación (noviembre de 2026, versión anterior del proyecto):** 11 filas confirmadas en los registros oficiales: Mercado Pago, Ualá, Personal Pay y Prex (cuentas de pago); Cuenta DNI, BNA+, Naranja X y Brubank (bancos y compañías financieras); MODO (iniciador); Belo y Lemon (cripto). **Quedaron fuera:** Buenbit (en la CNV figura como nombre comercial de otra empresa), la fila de fintech que pasan a ser bancos (ver arriba). Al reconstruir, volver a verificar las 11 filas y actualizar `verificadoEl`.

Reglas de la ficha:
- Datos en `src/data/fintech.json` con `nombreComercial`, `razonSocial`, `tipo`, `registro`, `fuente` y `verificadoEl`. **Todo lo marcado con ⚠ se verifica en el registro oficial al construir**; si no se puede confirmar, la fila no se publica y se anota en `docs/questions.md`. La razón social de cada PSPCP se toma del registro de PSP del BCRA.
- Revisar en especial Mercado Pago, Ualá, Cocos y Revolut, porque su situación de licencia cambió durante 2026: si una billetera pasó a ofrecer cuentas bancarias, se actualiza el tipo y se aclara desde cuándo.
- Sin logos, colores de marca, tasas, topes de remuneración, promociones ni rankings: esos datos cambian seguido y la app enseña **dónde** mirarlos, no cuál elegir.
- La billetera de práctica (5.3) nunca reproduce la interfaz de ninguna de estas apps.

