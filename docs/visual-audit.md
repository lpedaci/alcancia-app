# Auditoría visual

> Fecha: 12/11/2026 · Paso 4 (piloto visual). Registra qué se toma de cada referencia de `design-references/` y dónde se usa (spec 2.2). **Las imágenes no se publican** (D-66): la carpeta es solo local. Acá cada referencia se describe con palabras, con su autor y el enlace a la publicación original. No se copian ilustraciones, íconos, textos, marcas ni colores de terceros.

## 1. Referencias

| Archivo local | Publicación original | Autor | Qué es |
| --- | --- | --- | --- |
| `f9c298e7481e7822669ebf9d6a8ef447.webp` | "Cognify" (panel de exámenes). Captura de Dribbble, sin enlace: no se encontró la publicación original (las que se llaman Cognify en Dribbble son otros paneles) | Autor sin identificar | Panel de resultados de exámenes con navegación superior en píldoras |
| `original-7a0529b60b5bbbc5da39f5fd285ea2ca.webp` | [Coursify – Learning Management System Dashboard](https://dribbble.com/shots/26180945-Coursify-Learning-Management-System-Dashboard-Figma) | Peterdraw Studio (el pie de la imagen dice "Copyright © 2025 Peterdraw") | Panel de un LMS con menú lateral y columna derecha fija |
| `original-ef0e125169848c60c815fee0cdbc3e04.webp` y `original-f51fa752dd69b8648c4cb23257f85314.webp` | [Educo – eLearning Dashboard](https://dribbble.com/shots/14789537-Educo-eLearning-Dashboard) | RH LeadCraft Studio | Inicio de un estudiante: banner de saludo, lista de cursos y KPIs chicos (la primera es un recorte de la segunda) |
| `videoframe_6496.png` | [Avenra – AI Neurology Clinical Dashboard](https://dribbble.com/shots/27719176-Avenra-AI-Neurology-Clinical-Dashboard) | DESH. Group | Panel clínico con saludo grande, tarjetas con flecha y agenda por días |
| `original-d624f662813f72270d07325f96f4c17a.mp4` | Captura de Dribbble heredada de Rumbo (D-101), sin enlace: la documentación de Rumbo tampoco registra su autor | Autor sin identificar | Video de una bienvenida guiada de 3 pasos en un modal |

Autores verificados en Dribbble el 12/11/2026, comparando la publicación con la imagen local. Las dos referencias sin autor identificado se describen solo con palabras; como las imágenes no se publican (D-66), alcanza con la descripción (indicación de Lourdes).

## 2. Qué se toma y qué no, por referencia

### Cognify (panel de exámenes)

**Descripción:** fondo gris muy claro con una barra superior blanca en píldora (logo, pestañas con la activa resaltada, íconos de ajustes y notificaciones, avatar). Debajo, título "Dashboard Overview" con subtítulo de una línea y un botón de asistente a la derecha. Una fila de KPIs: una tarjeta grande azul con degradé y brillo, y tres tarjetas de contenedor de color pastel con ícono arriba a la derecha, número grande y una línea de contexto abajo ("Weakest topic: problem solving"). Más abajo, un gráfico de barras apiladas, una dona de respuestas correctas e incorrectas, y una tabla de resultados con barra de progreso y porcentaje por fila.

| Se toma | Dónde | No se toma |
| --- | --- | --- |
| Título con subtítulo de una línea | Encabezado de P1 y de SIM-3 | La tarjeta azul con degradé y brillo: se reemplaza por `primary-container` plano |
| KPI en contenedor de color con ícono arriba a la derecha y una línea de contexto ("Te falta: …") | KPIs de P1 ("Próximo desbloqueo", "Poder de compra") | Los colores pastel de marca (naranja, verde lima) |
| Barra de progreso con porcentaje en filas | Progreso del próximo desbloqueo en P1 | El gráfico de barras sin frase de conclusión |

### Coursify (panel de un LMS)

**Descripción:** layout en tres columnas. A la izquierda, menú lateral blanco con logo, ítems con ícono y el activo en una píldora rosa; abajo, una tarjeta ilustrada de "Upgrade to Pro". En el centro, tres KPIs en tarjetas de colores (rosa, celeste, amarillo), gráficos de área con relleno en degradé, un mapa de calor de actividad, tarjetas de cursos con miniatura ilustrada y una dona. A la derecha, una columna fija con el perfil, un calendario, la agenda y una lista de "actividad reciente" con un ícono en círculo por fila.

| Se toma | Dónde | No se toma |
| --- | --- | --- |
| Menú lateral con ítem activo en píldora y una tarjeta de acción abajo | Menú lateral de P1 en escritorio, con el **indicador de nivel y próximo desbloqueo** abajo | Rosa y amarillo de marca, ilustración 3D de la tarjeta |
| Columna derecha fija | **Panel de la misión con Fuerte** en P1 desde 1200 px | El calendario y el mapa decorativos |
| Lista de actividad con ícono en círculo | **Últimos movimientos** de P1 | Rellenos de área con degradé (en Alcancía, relleno plano de baja opacidad) |

### Educo (inicio del estudiante)

**Descripción:** banner violeta de ancho completo con "Hello Jessica!", una frase y una ilustración 3D de un globo terráqueo y libros. Debajo, una lista de cursos en tarjetas blancas: miniatura cuadrada, título, metadatos (lecciones, horas) y un botón tonal "View Course". A la derecha, una tarjeta de progreso mensual con una curva y una grilla 2 × 2 de KPIs chicos con el número en un círculo de color. Una columna de clases en vivo con fotos.

| Se toma | Dónde | No se toma |
| --- | --- | --- |
| Banner de saludo de ancho completo con nombre y frase | Saludo de P1, con **Fuerte** en lugar de la ilustración, sobre `primary-container` plano | Ilustración 3D, fotos de personas, la tarjeta de clase en vivo |
| Lista de tarjetas con miniatura, título, metadatos y botón tonal | Guías sugeridas en P1 (miniatura = ícono en contenedor) | El emoji del saludo |
| KPIs chicos en grilla 2 × 2 | KPIs de aprendizaje de P1 en tablet | Los números dentro de círculos de colores |

### Avenra (panel clínico)

**Descripción:** fondo lila claro con degradé. Barra superior con logo, pestañas y una píldora negra para la activa, buscador, campana y perfil con foto. Saludo grande ("Good morning, Dr. Carter") con una línea de contexto y, a la derecha, botones de filtro, fecha y un asistente. Tarjetas muy redondeadas con un botón circular de flecha en la esquina para ir al detalle; una tarjeta con un objeto translúcido en degradé; un gráfico de líneas diagonales decorativas; una agenda con pestañas de días y un contador por día; una tabla de resultados con chips de estado con punto de color.

| Se toma | Dónde | No se toma |
| --- | --- | --- |
| Saludo grande con fecha y acciones a la derecha | Encabezado de P1: fecha, saludo y "Avanzar un día / semana / mes" a la derecha | Fondo lila con degradé y objeto translúcido |
| Botón de flecha en la esquina de la tarjeta para ir al detalle | Tarjetas de P1 que llevan a una sección | Tarjetas apiladas con sombra (sombra solo en lo flotante, 2.5) |
| Selector de días en pestañas con contador | Base del control de tiempo de la billetera (paso 6) | Gráfico de líneas diagonales decorativas |
| Chips de estado con punto e ícono | Estados de movimientos y de niveles | Fotos de personas (iniciales sobre el color del rol) |

### Video de bienvenida guiada (`original-d624f662`)

**Descripción:** un modal de 3 pasos sobre la app atenuada. Arriba, una zona ilustrativa con piezas de interfaz en miniatura (un campo con tilde, un perfil que se marca, una tarjeta de resultado). Puntos de progreso, título, descripción de dos líneas y los botones "Anterior" y "Continuar". La ilustración entra con fundido y escala leve.

| Se toma | Dónde | No se toma |
| --- | --- | --- |
| Pasos con puntos de progreso, "Anterior" y "Continuar", miniaturas de componentes reales | Bienvenida de P2 (paso 6) | El difuminado del fondo: en Alcancía, zona ilustrativa plana |

## 3. Pantallas del piloto (paso 4)

| Pantalla | Referencias | Decisiones visuales propias |
| --- | --- | --- |
| **G0 Landing** | Estructura de página de producto B2B de Rumbo (F0); Educo para el banner del hero | Hero con piezas reales del producto a los costados desde 1280 px (resultado de SIM-3, tarjeta de meta, KPI). SIM-3 embebido y funcionando. Fuerte presenta la billetera en la sección de solución. Bandas alternadas de `surface` y blanco, sin degradés |
| **P1 Inicio de la cuenta** | Coursify (menú lateral, columna derecha fija, actividad), Educo (saludo), Avenra (saludo con acciones, flecha en tarjetas), Cognify (KPIs con contexto) | Saldo grande con poder de compra al lado y cartel "Billetera de práctica · dinero ficticio"; tarjeta de misión activa; próximo desbloqueo con progreso; últimos movimientos con `MoneyText` y signo. En celular, barra inferior de 5 destinos y misión como tarjeta fija (5.3) |
| **SIM-3** | Ninguna directa: anatomía del simulador de 2.2.1 | Datos a la izquierda y resultado en `display-medium` a la derecha en escritorio; en celular, resultado en una franja fija. Gráfico de área con relleno plano, "Ver como tabla", supuestos plegables, comparar escenarios, "Prueba cambiar…" y aviso legal |
| **Fuerte** | Diseño original del escape room "Tu primer sueldo" (Lourdes) | Mismo cuerpo, visor, ojos, cejas, perilla y bisagras, **con relleno plano** (el original usa degradés de metal): naranja `#f08c3e` y luces `#ffc387` (D-108). Siete luces, una por nivel de la billetera (el original tiene cinco, una por candado; D-134, confirmada). Seis estados (5.0.1) |

## 4. Celular sin referencia propia

Las referencias son paneles de escritorio. El layout de celular se deriva de **Material 3** (clases de ventana compacta, barra de navegación inferior, hojas inferiores) y de la sección 5.3 de la spec (respuesta a la duda 12):

- Barra superior con el nombre de la sección, Fuerte en miniatura y el avatar.
- Saldo arriba, a ancho completo, con el poder de compra debajo.
- Misión activa como tarjeta fija que se abre en una hoja inferior.
- Barra inferior con los 5 destinos, ícono y rótulo, área táctil de 48 × 48 px; destinos bloqueados con candado.
- Una columna, las tarjetas del escritorio apiladas en orden de importancia.

## 5. Reglas comunes aplicadas

- Fondos y tarjetas planos, sin degradés (2.2, 2.5); sin sombras en tarjetas en reposo.
- Cada gráfico con frase de conclusión y "Ver como tabla" (2.10).
- Sin fotos de personas: iniciales sobre el color del rol.
- El naranja solo en Fuerte (D-52).
