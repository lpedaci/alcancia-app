# Arquitectura de la información

> Fecha: 12/11/2026 · Primera tanda del paso 0. Marco: los cuatro sistemas de Rosenfeld, Morville y Arango (2015): organización, rotulado, navegación y búsqueda.

## 1. Principio rector

**Para el participante, la estructura del producto es la estructura de una billetera** (D-50). El contenido de aprendizaje no tiene un "campus" aparte: vive dentro de la sección de la billetera donde se usa, y el orden en que se desbloquean las secciones es el orden del programa (5.0). Para el tutor, el admin y el decisor, la estructura es la de una herramienta de gestión, organizada por tarea.

## 2. Inventario de contenidos

| Tipo de contenido | Cantidad en fase A | Dónde vive | Fuente |
| --- | --- | --- | --- |
| Niveles y secciones | 8 (0 a 7); el 8, Cripto, en fase B | Mapa de niveles (P9) y navegación | 5.0 |
| Módulos | 16 (el 16, Cripto, en fase B; el 18, una guía base en fase A) | Como guías dentro de su sección | F3 |
| Guías | 16 en fase A, una por módulo (D-61); 2 y 3 de cada módulo en fase B | P10, pestaña Aprender y tarjetas en el momento justo | F3, `docs/content.md` |
| Bancos de preguntas | Uno por módulo, con los 9 tipos de 5.1 | Desafíos de nivel y de suficiencia (P11) | 5.1, D-57 |
| Desafíos de nivel | 7 (niveles 1 a 7) | P11 | 5.0 |
| Desafíos de suficiencia | Uno por sección desbloqueable por "Ya sé esto" | P11 | 5.0 |
| Misiones | 13 (D-59) | P12 y su sección | 5.3, 5.0 |
| Tarjetas de aprendizaje en el momento justo | Varias por misión y por pantalla ("¿Por qué importa?") | Dentro de la billetera | 5.3 |
| Herramientas (simuladores) | 12 (SIM-1 a SIM-12) | En su sección y juntas en P13 | F4 |
| Escenarios de ejemplo | 3 (inflación baja, media y alta) | `scenarios.json`, panel de supuestos | F4 |
| Términos del glosario | Al menos TNA, TEA, TEM, CFT, UVA, CER, CEDEAR, ETF, FCI, CVU, CBU, PSP, PSPCP, PSAV, ALyC, DCA, aguinaldo | Chip junto al término; glosario completo en fase B (F10) | 1.1.1 |
| Fichas informativas | 2: "Brókers registrados" (Anexo C) y "Billeteras y fintech en Argentina" (Anexo D) | Aprender > Fichas y registros, y área "Verificar" | D-22, D-26 |
| Fuentes oficiales | Las del Anexo B | Panel "Dónde ver los valores reales" | `sources.ts` |
| Mensajes de Fuerte | Por evento y estado, con variantes | `fuerte-lines.json` | 5.0.1 |
| Logros e insignias | Por módulo y por conducta financiera sana | Aprender > Logros | 5.0 |
| Avisos legales | Pie de cada herramienta, landing y cartel fijo "Simulador de finanzas personales · dinero ficticio" | `legal.ts` | 1.2 |
| Contenido corporativo | Programa, cohortes, personas, desafíos semanales, consultas, métricas | Paneles de tutor, admin y decisor | F1, F6 a F8 |

## 3. Sistema de organización

### 3.1 Participante: esquemas combinados

- **Por tarea** (esquema principal de la navegación): Pagar, Ahorrar, Invertir. Es como se organiza una billetera real y como piensa una persona su dinero.
- **Por progresión** (esquema secundario, visible en Aprender): niveles 0 a 7. Se ve como línea de tiempo con estados.
- **Por tipo de contenido** dentro de Aprender: guías, desafíos, misiones, herramientas, logros, fichas.

La relación entre sección y nivel es fija y está en una sola tabla de datos (`levels.json`), para que navegación, mapa de niveles y desbloqueos lean lo mismo.

| Destino | Subsecciones | Nivel que las abre |
| --- | --- | --- |
| **Inicio** | Saldo, misión activa, próximo desbloqueo, últimos movimientos, recibo de sueldo explicado | 1 |
| **Pagar** | Transferir · QR · Servicios | 2 |
| | Tarjeta y préstamos (D-56) | 5 |
| **Ahorrar** | Presupuesto | 3 |
| | Apartados y metas (el apartado "Ahorro" básico existe desde el nivel 1, D-53) | 4 |
| | Rendir | 6 |
| **Invertir** | Cuenta comitente, instrumentos, tenencia | 7 |
| **Aprender** | Mapa de niveles · Guías · Desafíos · Misiones · Herramientas · Logros · Fichas y registros | Desde el nivel 0 (cada pieza respeta el nivel de su sección) |
| Avatar (barra superior) | Perfil · Seguridad · Comprobantes y resumen · Fuerte (nivel de presencia) · Cerrar sesión | 0 |
| Campana (barra superior) | Notificaciones y **Mensajes** (allí llegan los mensajes de la misión 6, uno de ellos falso) | 1 |

Ubicación de las áreas de 5.3 que no son destinos (D-102):

| Área de 5.3 | Dónde vive |
| --- | --- |
| Cobrar | Inicio (el cobro llega como movimiento y en la misión 1) |
| Hacer rendir el saldo / Ganarle o no a la inflación | Ahorrar > Rendir |
| Ofertas (préstamo preaprobado, compra en cuotas) | Llegan como notificación y se abren en Pagar > Tarjeta y préstamos |
| Seguridad (segundo factor, límites) | Avatar > Seguridad; los mensajes, en la campana |
| Verificar | Aprender > Fichas y registros, y como paso dentro de Invertir |
| Comprobantes y resumen | Avatar > Comprobantes y resumen; el resumen del mes también al cerrar un mes |

### 3.2 Tutor, admin y decisor: por tarea y por objeto

| Rol | Esquema | Secciones |
| --- | --- | --- |
| Tutor | Por objeto (cohortes) y por tarea | Inicio · Cohortes · Resultados de desafíos · Consultas |
| Admin | Por tarea | Panel · Personas y cohortes · Programa |
| Decisor | Una sola página, por nivel de Kirkpatrick | Reporte de impacto |

## 4. Sistema de rotulado

Se aplica el vocabulario fijo de 2.9. Rótulos de navegación y de secciones:

| Rótulo | Por qué | No usar |
| --- | --- | --- |
| Inicio | Convención de billeteras | Dashboard, Home |
| Pagar | Verbo, lo que la persona hace | Pagos, Transferencias |
| Ahorrar | Verbo; agrupa presupuesto, apartados y rendir | Ahorro, Finanzas |
| Invertir | Verbo | Inversiones, Trading |
| Aprender | Verbo; deja claro que el contenido también vive acá | Campus, Cursos, Academia |
| Tarjeta y préstamos | Lo que hay adentro, en palabras simples (D-56) | Crédito (se usa como nombre del nivel 5, no del menú) |
| Apartados y metas | "Apartado" es el término de 5.3 | Bolsillos, Huchas |
| Rendir | Acción: hacer rendir el saldo | Rendimientos, Yield |
| Guías | Unidad de lectura de 5 a 8 minutos | Lecciones, Clases (en la billetera) |
| Desafío de nivel / Desafío semanal | Nunca "desafío" solo (2.9) | Examen, Prueba |
| Misiones | Práctica guiada en la billetera | Actividades, Tareas |
| Herramientas | Los simuladores, vistos como utilidades | Simuladores, Calculadoras (como rótulo de menú) |
| Fichas y registros | Las fichas de los Anexos C y D y cómo verificar | Rankings, Proveedores |
| Conocerte | Nombre amable del diagnóstico | Test, Evaluación inicial |
| Ya sé esto | Acción de suficiencia | Saltar, Omitir |
| Panel (tutor y admin) | 2.9 | Dashboard |
| Tutoría (en chips y menús) | 2.9 | Docente, Facilitador |

Los nombres internos (`budget`, `pockets`, `yield`) quedan en el código; la interfaz siempre usa los rótulos de esta tabla.

## 5. Sistema de navegación

### 5.1 Global del participante (5.3)

| Tamaño | Patrón de Material 3 | Contenido |
| --- | --- | --- |
| Celular, menos de 600 px | Barra de navegación inferior | 5 destinos con ícono y rótulo; barra superior con el nombre de la sección, Fuerte y avatar |
| Tablet, 600 a 1199 px | Riel de navegación | 5 destinos y logo; contenido en dos columnas desde 840 px |
| Escritorio, 1200 px o más | Menú lateral flotante, plegable a íconos | 5 destinos con subsecciones desplegables e indicador de nivel abajo; barra superior flotante con logo, "Ver como", Ayuda y Notificaciones |

En todos: destino activo con el indicador de Material 3 y `aria-current="page"`; el foco vuelve al título (`h1`) al cambiar de destino; los destinos bloqueados muestran candado y, al tocarlos, la tarjeta "qué falta" en lugar de navegar; objetivos táctiles de 48 × 48 px.

**Bento y quiebres (D-104):** la spec fija la grilla de 12 columnas desde 1280 px y el menú lateral desde 1200 px. Entre 1200 y 1279 px se usan 12 columnas también, para que el cambio de navegación y el de grilla ocurran en el mismo punto. Lourdes confirma.

### 5.2 Local y contextual

- **Pestañas** dentro de un destino con subsecciones (por ejemplo, Ahorrar: Presupuesto · Apartados y metas · Rendir) en celular y tablet; en escritorio, las subsecciones están en el menú lateral.
- **Navegación principal del participante (D-164):** barra inferior con los 5 destinos solo con íconos en celular y tablet (menos de 1200 px); menú lateral plegable en escritorio, con el logo arriba y el control de plegar abajo (D-163).
- **Tarjeta de misión activa:** acceso contextual permanente a la misión en curso.
- **"¿Por qué importa?"** en cada pantalla de la billetera: abre la tarjeta de aprendizaje de esa pantalla.
- **Chips del glosario** en el primer uso de cada término.
- **"Dónde ver los valores reales"** en cada herramienta.
- **Migas de pan** solo en pantallas de tercer nivel (por ejemplo, Aprender > Guías > Tarjeta y CFT) y en los paneles de gestión.
- **Volver arriba** al desplazarse en pantallas largas.

### 5.3 Tutor, admin y decisor

Menú lateral (escritorio y tablet) con el mismo componente y estilo del sistema, sin las reglas de desbloqueo; en celular, un menú en hoja lateral. Mantienen su propio layout (5.3).

### 5.4 Pantallas sin navegación global

Landing, acceso (G1 a G5), "Abrir tu cuenta" (P2) y el recorrido de una misión o desafío en celular, donde la tarea ocupa la pantalla con "Salir" visible y confirmación si hay cambios sin guardar.

## 6. Sistema de búsqueda

- **Fase A:** sin búsqueda global. El volumen (16 guías, 12 herramientas) se recorre bien por navegación y la búsqueda agrega complejidad sin valor. Hay **filtros** donde hay listas largas: personas (O2), cohortes (T2) y herramientas (P13, por sección).
- **Glosario:** búsqueda por término dentro del panel del glosario (F10 lo amplía en fase B).
- **Fase B:** búsqueda en Aprender (guías, herramientas, términos) con F10.

## 7. Mapa del sitio por rol

### 7.1 Participante

```
/app/welcome            P2  Abrir tu cuenta y Conocerte (nivel 0)
/app                    P1  Inicio
/app/pay                P3  Pagar
  /app/pay/transfer         Transferir
  /app/pay/qr               Pagar con QR
  /app/pay/bills            Servicios
  /app/pay/credit       P7  Tarjeta y préstamos (D-56, D-103)
/app/save/budget        P4  Presupuesto
/app/save/pockets       P5  Apartados y metas
/app/save/yield         P6  Rendir
/app/invest             P8  Invertir
  /app/invest/:instrumentId
/app/learn              P9  Mapa de niveles y logros
  /app/learn/guides/:guideId          P10
  /app/learn/challenges/:challengeId  P11
/app/missions/:missionId              P12
/app/tools              P13 Herramientas
  /app/tools/:simId
/app/profile            P14 Perfil, seguridad y comprobantes
```

### 7.2 Tutor, admin y decisor

```
/tutor                          T1
/tutor/cohorts/:id              T2
/tutor/cohorts/:id/challenge    T3
/tutor/assessments              T4
/tutor/questions                T5

/admin                          O1
/admin/people                   O2
/admin/people/import            O3
/admin/program                  O4

/sponsor                        D1
```

### 7.3 Público

```
/                 G0  Landing (con SIM-3)
/login            G1
/login/sso        G2
/login/verify     G3
/access-help      G4
/consent          G5
/design-system    G8
/styleguide       (interna, no enlazada)
*                 G7  Acceso no permitido / 404 / error
```

## 8. Plantillas de página

| Plantilla | Usada en | Estructura |
| --- | --- | --- |
| **Inicio de rol** | P1, T1, O1 | Saludo (fecha, `h1` con el nombre en `primary`, chips de contexto) + bento de KPIs y tarjetas |
| **Sección de billetera** | P3 a P8 | Título, acciones principales, contenido de la sección, "¿Por qué importa?", panel de misión (escritorio) |
| **Flujo por pasos** | P2, transferir, pagar con QR, abrir cuenta comitente, carga CSV | Progreso arriba, un paso por pantalla, "Anterior" y "Continuar", salida con confirmación |
| **Herramienta** | SIM-1 a SIM-12 | Anatomía de 2.2.1, punto 9: datos, resultado, frase, gráfico, "Qué significa esto", supuestos, comparar, "Prueba cambiar…", aviso legal |
| **Guía** | P10 | Ancho de lectura de 60 a 72 caracteres, bloques de Gagné, práctica embebida |
| **Evaluación** | P11, Conocerte | Una pregunta por pantalla en celular; `fieldset` y `legend`; retroalimentación explicada |
| **Misión** | P12 | Tarjeta de objetivo, pasos, tarjetas de aprendizaje, Fuerte, cierre con resumen |
| **Listado con detalle** | T2, O2, T5 | Filtros, tabla (tarjetas en celular), detalle en página o panel |
| **Reporte** | D1 | Conclusión, KPIs, gráficos con tabla, metodología, exportar |
| **Estado vacío / error / acceso** | Todas | Qué va a aparecer y cómo empezar; error con "Reintentar"; G7 |

## 9. Plan de validación

| Método | Qué valida | Cuándo | Participantes |
| --- | --- | --- | --- |
| Card sorting abierto | Si las personas agrupan las tareas como Pagar, Ahorrar e Invertir; dónde ubican "Tarjeta y préstamos" | Antes del paso 6 | 10 a 15 personas, oficina y operativas |
| Tree testing | Encontrar: "pagar la luz", "ver por qué no puedo invertir", "calcular el CFT", "ver la ficha de brókers" | Después del paso 6 | 15 a 20 personas |
| Test de primer clic en celular | Barra inferior y tarjeta de misión | Piloto visual | 5 personas operativas |
| Test de comprensión de rótulos | "Rendir", "Apartados", "Ya sé esto", "Fichas y registros" | Piloto visual | 5 a 8 personas |

Los hallazgos se registran en `docs/issues.md` y los cambios de rótulos, en `decisions.md`.

## Referencias

Rosenfeld, L., Morville, P., & Arango, J. (2015). *Information architecture: For the web and beyond* (4.ª ed.). O'Reilly Media.

Google. (s. f.). *Material Design 3: Navigation*. https://m3.material.io/components/navigation-bar/overview
