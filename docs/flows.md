# Flujos

> Fecha: 12/11/2026 · Primera tanda del paso 0. Los wireflows se dibujan a nivel de bloques; el detalle visual se resuelve en el piloto (paso 4) y se registra en `visual-audit.md`.

Este documento usa tres niveles, rotulados en cada diagrama:

- **Task flow:** el camino único de una tarea, sin variantes.
- **User flow:** el recorrido de una persona con decisiones y caminos alternativos.
- **Wireflow:** pantallas en bloques con las transiciones entre ellas.

Al final están el mapa de pantallas por rol y los diagramas de estados.

---

## 1. Acceso y primer ingreso

### 1.1 User flow · Elegir un recorrido desde la landing

```mermaid
flowchart TD
  L["G0 Landing"] --> R{"¿Qué hace?"}
  R -- "Prueba SIM-3 sin iniciar sesión" --> S["SIM-3 embebido<br/>(sin sesión)"] --> R
  R -- "Recorrer como Mariana / Diego / Andrés / Paula / Ricardo" --> LG["G1 Login<br/>/login?demo=persona"]
  R -- "Ver el case study" --> CS["Portfolio (externo)"]
  LG --> M{"Método"}
  M -- "Continuar con Microsoft o Google" --> SSO["G2 SSO simulado<br/>neutro y rotulado"]
  M -- "Correo y contraseña" --> PW["Campos precargados<br/>en la demo"]
  SSO --> MFA{"¿Admin o decisor?"}
  PW --> MFA
  MFA -- "Sí" --> V["G3 Verificación en dos pasos<br/>código 246810 precargado"]
  MFA -- "No" --> C{"¿Primer ingreso?"}
  V --> C
  C -- "Sí" --> G5["G5 Aviso de privacidad<br/>y consentimiento"] --> H
  C -- "No" --> H["Inicio del rol"]
  H --> HP{"Rol"}
  HP -- "Participante sin cuenta abierta" --> P2["P2 Abrir tu cuenta"]
  HP -- "Participante con cuenta" --> P1["P1 Inicio de la cuenta"]
  HP -- "Tutor" --> T1["T1"]
  HP -- "Admin" --> O1["O1"]
  HP -- "Decisor" --> D1["D1"]
```

### 1.2 User flow · Errores de acceso

```mermaid
flowchart TD
  A["G1 Correo y contraseña"] --> B{"¿Credenciales válidas?"}
  B -- "Sí" --> OK["Sigue el flujo 1.1"]
  B -- "No" --> E["Error genérico:<br/>'El correo o la contraseña no coinciden'"]
  E --> N{"¿5 intentos?"}
  N -- "No" --> A
  N -- "Sí" --> BL["Cuenta bloqueada<br/>sin autodesbloqueo"]
  BL --> G4["G4 ¿Problemas para iniciar sesión?<br/>formulario a la mesa de ayuda"]
  A -- "¿Problemas para iniciar sesión?" --> G4
  G4 --> CF["Solicitud registrada<br/>con número de seguimiento"]
```

### 1.3 Task flow · Expiración de sesión

```mermaid
flowchart LR
  I["Inactividad"] --> AV["Aviso: 'Tu sesión vence en 2 minutos'<br/>Seguir conectado / Cerrar sesión"]
  AV -- "Seguir conectado" --> CONT["Sesión renovada"]
  AV -- "Sin respuesta" --> X["Sesión cerrada"] --> G1["G1 con mensaje<br/>'Cerramos tu sesión por inactividad'"]
```

Los cambios sin guardar se protegen con `useBlocker` antes del cierre o de salir de la pantalla.

### 1.4 Task flow · "Ver como" y modo demo

```mermaid
flowchart LR
  B["Barra superior · Ver como"] --> M["Menú: Mariana · Diego · Andrés · Paula · Ricardo"]
  M --> S["Cambia la sesión simulada<br/>sin repetir la verificación"]
  B --> U["Interruptor 'Ver todo desbloqueado'"]
  B --> E["Cargar estado de ejemplo:<br/>Diego en nivel 2 · Mariana en nivel 6"]
  B --> R["Restablecer demo<br/>(con confirmación)"]
```

---

## 2. Participante: la billetera

### 2.1 User flow · Abrir tu cuenta (nivel 0, P2)

```mermaid
flowchart TD
  W["Bienvenida guiada de 3 o 4 pasos<br/>con Fuerte"] --> ALTA["Alta simulada<br/>sin datos reales: solo nombre de demo"]
  ALTA --> CO["Conocerte: 10 a 12 preguntas<br/>hábitos sin juicio y conocimientos"]
  CO --> RES["Resultado por 5 dimensiones<br/>barras horizontales y tabla"]
  RES --> SUF{"¿Nivel avanzado<br/>en alguna dimensión?"}
  SUF -- "Sí" --> OFR["Oferta: 'Ya sé esto'<br/>desafío de suficiencia de esa sección"]
  OFR -- "Ahora" --> CH["P11 Desafío de suficiencia"] --> SEG
  OFR -- "Más tarde" --> SEG
  SUF -- "No" --> SEG["Misión: Configura tu seguridad<br/>segundo factor y nunca compartir códigos"]
  SEG --> DES["Celebración: nivel 1 desbloqueado<br/>Cuenta"] --> P1["P1 Inicio de la cuenta"]
```

### 2.2 Wireflow · Inicio de la cuenta (P1) por tamaño

```mermaid
flowchart LR
  subgraph Celular["Celular (< 600 px)"]
    direction TB
    c1["Barra superior: sección · Fuerte · avatar"]
    c2["Tarjeta fija de la misión activa<br/>(se expande como hoja inferior)"]
    c3["Saldo, poder de compra, CVU y alias"]
    c4["Acciones rápidas"]
    c5["Próximo desbloqueo"]
    c6["Últimos movimientos"]
    c7["Barra inferior: Inicio · Pagar · Ahorrar · Invertir · Aprender"]
    c1 --> c2 --> c3 --> c4 --> c5 --> c6 --> c7
  end
  subgraph Tablet["Tablet (600 a 1199 px)"]
    direction TB
    t1["Riel de navegación con 5 destinos"]
    t2["Columna 1: saldo, acciones, movimientos"]
    t3["Columna 2 (desde 840 px): misión activa,<br/>Fuerte y tarjetas de aprendizaje"]
    t1 --> t2 --> t3
  end
  subgraph Escritorio["Escritorio (1200 px o más)"]
    direction TB
    e1["Menú lateral con subsecciones<br/>e indicador de nivel"]
    e2["Saludo con fecha y chips de contexto"]
    e3["Bento: saldo y acciones · movimientos ·<br/>próximo desbloqueo · KPIs"]
    e4["Panel fijo: misión y Fuerte"]
    e1 --> e2 --> e3 --> e4
  end
```

### 2.3 User flow · Una misión (motor declarativo, P12)

Ejemplo con la misión 1, "Tu primer cobro" (D-53, D-54, D-55).

```mermaid
flowchart TD
  S["Tarjeta de misión: objetivo observable,<br/>pasos y duración (3 a 6 min)"] --> P1s["Paso 1: cobrar el sueldo<br/>$ 1.284.958,86 de Andina Servicios S.A."]
  P1s --> LC1["Tarjeta de aprendizaje (20 a 40 s):<br/>bruto, aportes y neto, con pregunta de un toque"]
  LC1 --> P2s["Paso 2: separar el 20 % en el apartado 'Ahorro'"]
  P2s --> Q{"¿Monto correcto?<br/>tolerancia $ 1"}
  Q -- "No" --> FB["Devolución con el cálculo paso a paso<br/>(info, nunca error)"] --> P2s
  Q -- "Sí" --> EV["Evento sorpresa: débito de una suscripción<br/>de $ 4.990 sin aviso"]
  EV --> LC2["Tarjeta: gastos hormiga y débitos programados"]
  LC2 --> END["Cierre: resumen, logro y Fuerte<br/>'Guardado.'"]
  END --> CH1{"¿Desafío del nivel 1<br/>aprobado? (D-63)"}
  CH1 -- "Sí" --> UNL["Desbloquea nivel 2 · Pagar"]
  CH1 -- "No" --> FAL["Tarjeta 'qué falta':<br/>desafío del nivel 1"]
  S -. "Salir y retomar" .-> S
```

Reglas comunes del motor: los errores se permiten y tienen consecuencia en la simulación; cada error termina en una devolución con "qué pasó" y "qué hacer en la vida real"; Fuerte no interrumpe dos veces seguidas la misma acción; una tarjeta de aprendizaje ya respondida bien no se repite; cada paso registra un evento tipo xAPI.

### 2.4 User flow · Sección bloqueada y "Ya sé esto"

```mermaid
flowchart TD
  T["Toca un destino o sección con candado"] --> CARD["Tarjeta 'qué falta':<br/>para qué sirve, condiciones con progreso"]
  CARD --> A{"¿Qué elige?"}
  A -- "Ir a la acción que acerca" --> ACT["Lleva a la misión, guía<br/>o desafío pendiente"]
  A -- "Ya sé esto" --> SUF["P11 Desafío de suficiencia"]
  SUF --> R{"¿70 % o más?"}
  R -- "Sí" --> U["Sección desbloqueada<br/>unlockedBy: mastery"]
  R -- "No" --> F["Devolución por pregunta y<br/>guías sugeridas; se puede reintentar"]
  A -- "Volver" --> B["Pantalla anterior"]
```

### 2.5 User flow · Desafío de nivel (D-57)

```mermaid
flowchart TD
  G["Guías del nivel leídas"] --> D["P11 Desafío de nivel<br/>preguntas de los bancos de cada módulo,<br/>orden aleatorio, sin límite de tiempo"]
  D --> S{"Puntaje"}
  S -- "70 % o más" --> OK["Aprobado: insignias de los módulos<br/>según su parte y condición cumplida"]
  S -- "Menos de 70 %" --> RE{"¿Quedan intentos?"}
  RE -- "Sí" --> FB["Devolución explicada y<br/>repaso sugerido"] --> D
  RE -- "No" --> TU["'Tu tutor puede habilitarte este nivel'<br/>se avisa al tutor; nada se pierde"]
  OK --> NX{"¿Se cumplen las demás<br/>condiciones del próximo nivel?"}
  NX -- "Sí" --> CEL["Celebración con Fuerte"]
  NX -- "No" --> FAL["Tarjeta 'qué falta' actualizada"]
```

### 2.6 Task flow · Transferir sin errores (misión 2)

```mermaid
flowchart LR
  A["Pagar > Transferir"] --> B["Alias, CBU o CVU"] --> C["Confirmación con<br/>titular y entidad ficticios"]
  C --> D{"¿El titular coincide?"}
  D -- "No y cancela" --> E["Corrige el alias"] --> C
  D -- "No y confirma" --> F["Transferencia hecha a la persona equivocada<br/>(no se puede deshacer desde la app)"] --> G["Devolución: qué hacer en la vida real"]
  D -- "Sí" --> H["Comprobante"]
```

### 2.7 Task flow · Avanzar el tiempo

```mermaid
flowchart LR
  A["Avanzar un día / una semana / un mes"] --> B["Motor económico<br/>(wallet-engine.md)"]
  B --> C["Acredita rendimiento, debita servicios,<br/>cobra sueldo si toca, aplica inflación del escenario"]
  C --> D["Eventos del escenario<br/>y de la misión activa"]
  D --> E["Resumen del período y<br/>anuncio en región en vivo"]
```

### 2.8 User flow · Guía (P10)

Sigue la secuencia de Gagné de F3, adaptada a 5 a 8 minutos: situación con números, objetivo, pregunta de recuperación, bloques breves, ejemplo resuelto, práctica (pregunta o herramienta embebida) con retroalimentación inmediata y "Para tu vida". Al terminar ofrece la misión práctica de la sección o el desafío de nivel si ya leyó todas las guías del nivel.

---

## 3. Tutor

### 3.1 User flow · Acompañar una cohorte

```mermaid
flowchart TD
  T1["T1 Inicio: KPIs y alertas"] --> AL{"Alerta"}
  AL -- "'4 personas no leyeron<br/>las guías del nivel 3'" --> T2["T2 Detalle de cohorte<br/>mapa de calor de avance de aprendizaje:<br/>persona × nivel y módulo"]
  AL -- "'Intentos agotados en el nivel 5'" --> T2
  T2 --> P{"Acción"}
  P -- "Habilitar nivel" --> U["Diálogo: persona o cohorte,<br/>cualquier nivel y motivo (obligatorio)"] --> LOG["Queda registrado con fecha y autor;<br/>la confirmación es la misma<br/>esté o no abierto el nivel"]
  P -- "Asignar desafío semanal" --> T3["T3 Asignar desafío"]
  T1 --> T4["T4 Resultados: preguntas con más errores"]
  T1 --> T5["T5 Consultas"]
```

**Qué muestra cada celda del mapa de calor (D-58):** solo avance de aprendizaje. Nunca muestra si el nivel está bloqueado o desbloqueado para la persona.

| Estado de la celda | Ícono y texto | Significado |
| --- | --- | --- |
| Sin actividad | Círculo vacío · "Sin empezar" | 0 guías leídas y desafío sin empezar (puede estar bloqueado o no: el tutor no lo sabe) |
| En curso | Medio círculo · "2 de 4 guías" | Guías leídas o desafío con intentos |
| Intentos agotados | Signo de atención · "Intentos agotados" | Ofrece "Habilitar nivel" |
| Completado | Tilde · "Completado" | Guías leídas y desafío aprobado (con mejor puntaje y primero en el detalle) |
| Habilitación | Etiqueta adicional · "Por suficiencia" o "Habilitado por tutor" | Cómo se abrió, si no fue por la regla |

### 3.2 Task flow · Asignar un desafío semanal (T3)

```mermaid
flowchart LR
  A["Elegir cohorte"] --> B["Elegir de la lista o escribir uno<br/>('Registra tus gastos 7 días')"] --> C["Fecha de cierre"] --> D["Vista previa"] --> E["Asignar"] --> F["Toast: 'Desafío asignado'"]
```

---

## 4. Admin de L&D

### 4.1 User flow · Carga masiva por CSV (O3)

```mermaid
flowchart TD
  A["Subir archivo .csv"] --> B{"¿Formato legible?"}
  B -- "No" --> E1["Error del archivo con ejemplo<br/>y plantilla descargable"] --> A
  B -- "Sí" --> V["Vista previa con validación fila por fila"]
  V --> R{"¿Filas con errores?"}
  R -- "Sí" --> C["Corregir en la tabla:<br/>correo inválido, duplicado, cohorte inexistente"] --> V
  R -- "Sí, omitirlas" --> CF
  R -- "No" --> CF["Confirmar: 'Invitar N personas'"]
  CF --> OK["Resumen: invitadas, omitidas"]
```

### 4.2 Task flow · Configurar el programa como asignado (O4)

```mermaid
flowchart LR
  A["Datos del programa"] --> B["Modo: asignado"] --> C["Fecha límite por cohorte"] --> D["Módulos habilitados y obligatorios<br/>(el orden de los niveles no cambia)"] --> E["Puntaje mínimo e intentos"] --> F["Umbral de privacidad (≥ 5)"] --> G["Guardar"]
```

---

## 5. Decisor

### 5.1 Task flow · Consultar el reporte de impacto (D1)

```mermaid
flowchart LR
  A["D1 Conclusión principal"] --> B["Kirkpatrick 1: reacción"] --> C["Kirkpatrick 2: aprendizaje<br/>pre y post por dimensión"] --> D["Kirkpatrick 3: conducta<br/>a 30 días"] --> E["Cómo se mide y umbral"] --> F["Exportar"]
```

---

## 6. Mapa de pantallas por rol

```mermaid
flowchart TB
  G0["G0 Landing /"] --> G1["G1 /login"] --> G2["G2 /login/sso"] --> G3["G3 /login/verify"] --> G5["G5 /consent"]
  G1 --> G4["G4 /access-help"]
  G0 --> G8["G8 /design-system"]
  G5 --> PART & TUT & ADM & SPO
  subgraph PART["Participante /app"]
    P2["P2 /app/welcome"] --> P1["P1 /app"]
    P1 --> P3["P3 Pagar /app/pay, /app/pay/:flow"]
    P3 --> P7["P7 Tarjeta y préstamos /app/pay/credit"]
    P1 --> P4["P4 /app/save/budget"]
    P1 --> P5["P5 /app/save/pockets"]
    P1 --> P6["P6 /app/save/yield"]
    P1 --> P8["P8 /app/invest"]
    P1 --> P9["P9 /app/learn"]
    P9 --> P10["P10 /app/learn/guides/:guideId"]
    P9 --> P11["P11 /app/learn/challenges/:challengeId"]
    P9 --> P13["P13 /app/tools"]
    P1 --> P12["P12 /app/missions/:missionId"]
    P1 --> P14["P14 /app/profile"]
  end
  subgraph TUT["Tutor /tutor"]
    T1["T1"] --> T2["T2 /tutor/cohorts/:id"] --> T3["T3 .../challenge"]
    T1 --> T4["T4 /tutor/assessments"]
    T1 --> T5["T5 /tutor/questions"]
  end
  subgraph ADM["Admin /admin"]
    O1["O1"] --> O2["O2 /admin/people"] --> O3["O3 /admin/people/import"]
    O1 --> O4["O4 /admin/program"]
  end
  subgraph SPO["Decisor"]
    D1["D1 /sponsor"]
  end
```

La ruta de P7 pasa a `/app/pay/credit` por D-56 (ver D-103 en `decisions.md`).

---

## 7. Diagramas de estados

### 7.1 Nivel (`LevelProgress.status`)

```mermaid
stateDiagram-v2
  [*] --> locked
  locked --> unlocked: se cumplen todas las condiciones (rule)
  locked --> unlocked: aprueba el desafío de suficiencia (mastery)
  locked --> unlocked: lo habilita el tutor con motivo (tutor)
  locked --> unlocked: modo libre del admin (admin_free_mode)
  locked --> unlocked: modo demo (demo)
  unlocked --> completed: guías leídas y desafío de nivel aprobado
  completed --> completed: puede volver, repetir misiones y releer
```

Un nivel nunca vuelve a `locked`: nada se pierde (5.0).

### 7.2 Módulo dentro de un nivel

```mermaid
stateDiagram-v2
  [*] --> no_iniciado
  no_iniciado --> en_curso: abre la guía
  en_curso --> guia_leida: termina la guía y su práctica
  guia_leida --> aprobado: su parte del desafío de nivel ≥ 70 % (insignia, D-57)
  guia_leida --> guia_leida: no alcanza; reintenta el desafío
  aprobado --> [*]
```

### 7.3 Misión

```mermaid
stateDiagram-v2
  [*] --> disponible
  disponible --> en_curso: inicia
  en_curso --> en_curso: paso con error y devolución
  en_curso --> pausada: sale
  pausada --> en_curso: retoma
  en_curso --> completada: cumple los criterios de éxito
  completada --> en_curso: repetir (no cambia lo ya logrado)
```

### 7.4 Desafío semanal (por persona)

```mermaid
stateDiagram-v2
  [*] --> asignado
  asignado --> reportado: autoinforme (cumplido, parcial o no)
  asignado --> vencido: pasa la fecha sin informe
  vencido --> reportado: informe tardío (permitido)
  reportado --> [*]
```

### 7.5 Persona en la organización

```mermaid
stateDiagram-v2
  [*] --> invited: alta individual o CSV
  invited --> active: primer inicio de sesión y consentimiento
  active --> inactive: baja por el admin
  inactive --> active: reactivación
  invited --> inactive: baja antes de ingresar
```
