# Casos de uso

> Fecha: 12/11/2026 · Segunda tanda del paso 0 (spec 14.4). Incluye los 9 casos que pide la spec y 4 propios de la billetera. Los diagramas de flujo de cada caso están en `flows.md`.

## Índice

| ID | Caso | Actor | Pantallas | Flujo |
| --- | --- | --- | --- | --- |
| CU-01 | Hacer el diagnóstico ("Conocerte") | Participante | P2 | `flows.md` 2.1 |
| CU-02 | Completar una guía con práctica | Participante | P10 | 2.8 |
| CU-03 | Comparar dos escenarios en una herramienta | Participante | P13 | — |
| CU-04 | Crear una meta (apartado con meta) | Participante | P5 | — |
| CU-05 | Asignar un desafío semanal | Tutor | T2, T3 | 3.2 |
| CU-06 | Importar personas por CSV | Admin | O3 | 4.1 |
| CU-07 | Configurar el programa como asignado con fecha límite | Admin | O4 | 4.2 |
| CU-08 | Resolver un caso con decisiones | Participante | P11, P12 | — |
| CU-09 | Consultar el reporte de impacto | Decisor | D1 | 5.1 |
| CU-10 | Completar la misión 1 "Tu primer cobro" | Participante | P12, P1 | 2.3 |
| CU-11 | Desbloquear una sección con "Ya sé esto" | Participante | P11 | 2.4 |
| CU-12 | Habilitar un nivel con motivo | Tutor | T2 | 3.1 |
| CU-13 | Avanzar el tiempo y cerrar un mes | Participante | P1 | 2.7 |

---

## CU-01 · Hacer el diagnóstico ("Conocerte")

- **Actor:** participante. **Disparador:** primer ingreso, dentro de "Abrir tu cuenta" (nivel 0), o "Repetir Conocerte" al final del programa.
- **Precondiciones:** sesión iniciada y consentimiento aceptado (G5).
- **Flujo principal:**
  1. Fuerte presenta "Conocerte": 12 preguntas, unos 4 minutos, sin respuestas correctas en las de hábitos.
  2. La persona responde una pregunta por pantalla, con progreso arriba; puede volver atrás.
  3. Al final ve la retroalimentación de las preguntas de conocimiento.
  4. Ve su resultado por 5 dimensiones (barras horizontales con "Ver como tabla") y un nivel por dimensión.
  5. Ve la ruta explicada ("Empezamos por presupuesto porque es la base de todo lo demás").
- **Alternativos:**
  - 4a. Si una dimensión sale en nivel avanzado, se ofrece "Ya sé esto" (CU-11) para la sección correspondiente.
  - 2a. Sale a mitad de camino: se guarda el avance y retoma en la misma pregunta.
- **Postcondiciones:** `DiagnosticResult` inicial (o final) guardado. Las respuestas de hábitos quedan **solo en el navegador** (D-62); los puntajes de conocimiento por dimensión quedan como dato de aprendizaje.
- **Privacidad:** el tutor ve los puntajes de conocimiento de sus cohortes; nadie ve las respuestas de hábitos.

## CU-02 · Completar una guía con práctica

- **Actor:** participante (por ejemplo, Diego desde el celular).
- **Precondiciones:** nivel de la guía desbloqueado para la persona.
- **Flujo principal:**
  1. Abre la guía desde Aprender, desde su sección o desde una tarjeta en el momento justo.
  2. Lee la situación, el objetivo y responde la pregunta de recuperación.
  3. Recorre los bloques con progreso arriba; abre los chips del glosario si los necesita.
  4. Sigue el ejemplo resuelto.
  5. Responde la práctica (pregunta o herramienta embebida) y recibe retroalimentación inmediata y explicada.
  6. Lee "Para tu vida", califica la guía de 1 a 5 (opcional) y ve la misión o el desafío de nivel sugerido.
- **Alternativos:**
  - 5a. Respuesta incorrecta: retroalimentación en `info` con pista; puede reintentar sin límite.
  - 1a. Nivel bloqueado: se muestra la tarjeta "qué falta" (no se abre la guía).
- **Postcondiciones:** guía marcada como leída (`Progress.lessonIdsDone`); satisfacción registrada si la dio.

## CU-03 · Comparar dos escenarios en una herramienta

- **Actor:** participante (por ejemplo, Mariana con SIM-5).
- **Flujo principal:**
  1. Abre la herramienta, carga datos (campos con máscara, ayuda y ejemplo).
  2. Ve el resultado, la frase, el gráfico y los supuestos.
  3. Elige "Guardar escenario" y le pone un nombre.
  4. Cambia un dato (por ejemplo, de escenario medio a alto).
  5. Elige "Comparar" y ve los dos escenarios lado a lado (en celular, uno debajo del otro con las diferencias destacadas).
- **Alternativos:** 3a. Ya hay dos guardados: elige cuál reemplazar.
- **Postcondiciones:** `LocalScenario` guardado en el espacio local de la persona.
- **Privacidad:** nunca sale del navegador; ninguna vista de otro rol lo lee (test).

## CU-04 · Crear una meta (apartado con meta)

- **Actor:** participante. **Precondiciones:** nivel 4 desbloqueado.
- **Flujo principal:**
  1. En Ahorrar > Apartados y metas elige "Crear apartado con meta".
  2. Carga nombre, precio actual y plazo.
  3. Ve el monto objetivo ajustado por inflación (SIM-8) y el ahorro mensual sugerido.
  4. Elige "Guardar meta"; toast "Meta guardada".
  5. Separa dinero del saldo al apartado; ve la barra de progreso y la fecha estimada.
- **Alternativos:**
  - 1a. Convierte el apartado "Ahorro" del nivel 1 en uno con meta (D-53).
  - 2a. Lo marca como fondo de emergencia: la meta se calcula con los gastos esenciales (`wallet-engine.md` 7).
- **Postcondiciones:** apartado con meta en `walletStore`; puede cumplir la condición del nivel 6.

## CU-05 · Asignar un desafío semanal

- **Actor:** tutor. **Precondiciones:** tiene al menos una cohorte asignada.
- **Flujo principal:**
  1. Desde T1 o T2 elige "Asignar desafío semanal".
  2. Elige la cohorte, un desafío de la lista o escribe uno propio, y la fecha de cierre.
  3. Ve la vista previa de cómo lo verá la persona.
  4. Elige "Asignar desafío"; toast "Desafío asignado".
- **Alternativos:** 2a. Fecha en el pasado: error en el campo con qué corregir.
- **Postcondiciones:** `WeeklyChallenge` creado; aparece en el inicio de cada participante de la cohorte.
- **Privacidad:** el tutor verá el resultado (cumplido, parcial, no), nunca la reflexión.

## CU-06 · Importar personas por CSV

- **Actor:** admin.
- **Flujo principal:**
  1. En O3 descarga la plantilla o sube su archivo.
  2. Ve la vista previa con validación fila por fila.
  3. Corrige en la tabla las filas con error (correo inválido, duplicado, cohorte inexistente); los errores desaparecen al corregirse.
  4. Elige "Invitar N personas" y confirma.
  5. Ve el resumen: invitadas y omitidas.
- **Alternativos:**
  - 2a. Archivo ilegible o con columnas faltantes: error del archivo con ejemplo.
  - 3a. Decide omitir las filas con error.
- **Postcondiciones:** personas con estado `invited` en sus cohortes.

## CU-07 · Configurar el programa como asignado con fecha límite

- **Actor:** admin.
- **Flujo principal:**
  1. En O4 cambia el modo a "Asignado".
  2. Fija la fecha límite de cada cohorte.
  3. Revisa módulos habilitados y obligatorios (el orden de los niveles no se edita).
  4. Ajusta puntaje mínimo e intentos (70 % por defecto).
  5. Elige "Guardar configuración"; toast "Configuración guardada".
- **Alternativos:** 4a. Intenta bajar el umbral de privacidad de 5: el campo no lo permite y explica por qué.
- **Postcondiciones:** el tutor ve "El plazo del programa vence en N días" cuando corresponde.

## CU-08 · Resolver un caso con decisiones

- **Actor:** participante. **Ejemplo:** "Te ofrecen un préstamo para irte de vacaciones" (módulos 5, 6 y 8; misión 5).
- **Flujo principal:**
  1. Lee la situación y elige una opción.
  2. Ve la consecuencia y la siguiente decisión.
  3. Repite hasta un resultado final.
  4. Ve el camino recorrido y la retroalimentación del resultado, con el cálculo del costo total.
- **Alternativos:** 2a. Vuelve a una decisión anterior desde el camino recorrido.
- **Postcondiciones:** respuesta registrada en el desafío o la misión.
- **Accesibilidad:** cada paso es una pantalla con un `fieldset`; el camino recorrido es una lista navegable.

## CU-09 · Consultar el reporte de impacto

- **Actor:** decisor (con verificación en dos pasos).
- **Flujo principal:**
  1. Entra a D1 y lee la conclusión principal.
  2. Recorre Kirkpatrick 1 (reacción), 2 (aprendizaje, solo conocimiento, D-62) y 3 (conducta).
  3. Abre "Cómo se mide" y el umbral de privacidad.
  4. Elige "Exportar reporte".
- **Alternativos:** 2a. Un grupo tiene menos de 5 personas: "Datos insuficientes para mostrar este grupo sin identificar a nadie".
- **Postcondiciones:** ninguna (solo lectura).

## CU-10 · Completar la misión 1 "Tu primer cobro"

- **Actor:** participante. **Precondiciones:** nivel 0 completo.
- **Flujo principal:**
  1. Ve la tarjeta de misión con objetivo, pasos y duración.
  2. Recibe el sueldo de $ 1.284.958,86 (D-54); tarjeta de aprendizaje sobre bruto, aportes y neto.
  3. Separa el 20 % en el apartado "Ahorro" (D-53).
  4. Ocurre el débito sorpresa de $ 4.990 (D-55); tarjeta sobre gastos hormiga.
  5. Cierre con resumen, logro y Fuerte ("Guardado.").
- **Alternativos:** 3a. Monto fuera de la tolerancia de $ 1: devolución con el cálculo paso a paso; reintenta.
- **Postcondiciones:** misión completa. Si además aprobó el desafío del nivel 1, se desbloquea Pagar (D-63).

## CU-11 · Desbloquear una sección con "Ya sé esto"

- **Actor:** participante.
- **Flujo principal:**
  1. Toca una sección bloqueada o la oferta de "Conocerte".
  2. Elige "Ya sé esto" y lee qué implica (preguntas, sin límite de tiempo).
  3. Responde el desafío de suficiencia.
  4. Con 70 % o más, la sección se desbloquea con una celebración breve.
- **Alternativos:** 4a. Menos de 70 %: devolución por pregunta y guías sugeridas; puede reintentar.
- **Postcondiciones:** `LevelProgress.unlockedBy = 'mastery'`. El tutor ve "Por suficiencia", no el estado del nivel (D-58).

## CU-12 · Habilitar un nivel con motivo

- **Actor:** tutor.
- **Flujo principal:**
  1. En T2 elige una persona (o la cohorte) y "Habilitar nivel".
  2. Elige el nivel y escribe el motivo (obligatorio).
  3. Confirma; ve "Nivel habilitado para [persona]".
- **Alternativos:** 1a. Llega desde la alerta "Intentos agotados en el nivel 5".
- **Postcondiciones:** registro con fecha, autor y motivo. La confirmación es la misma esté o no abierto el nivel, para no revelar su estado (D-58).

## CU-13 · Avanzar el tiempo y cerrar un mes

- **Actor:** participante. **Precondiciones:** misión 1 completa.
- **Flujo principal:**
  1. Elige "Avanzar un mes".
  2. El motor procesa día por día (rendimiento, débitos, sueldo, eventos).
  3. Al llegar al último día del mes, ve el resumen del mes y si cerró en verde.
- **Alternativos:** 2a. Aparece un evento que pide decisión (vencimiento, oferta, mensaje, débito sin saldo): el avance se detiene ahí y lo muestra.
- **Postcondiciones:** resumen guardado; `months_closed_green` actualizado si corresponde.
