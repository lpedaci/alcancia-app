# Proto-personas

> **Proto-persona: hipótesis sin validar.** Fecha: 12/11/2026.
> Estas proto-personas se construyeron a partir de supuestos de diseño, sin investigación con usuarios. No contienen citas, entrevistas, estadísticas ni datos reales. Cada supuesto está identificado y tiene un plan para validarlo.

Siguen el enfoque de proto-personas de *Lean UX* (Gothelf & Seiden, 2021): hipótesis explícitas sobre quién usa el producto, pensadas para validarse y corregirse con investigación, no para reemplazarla.

Hay una proto-persona por rol del MVP y dos para el rol participante (personal de oficina y personal operativo), porque la spec pide diseñar para los dos públicos de Andina Servicios S.A. (empresa ficticia de logística, unas 500 personas en Operaciones, Administración, Tecnología y Comercial). No incluyen fotos ni datos demográficos que no cambien una decisión de diseño. En la interfaz cada persona aparece con un avatar de iniciales sobre el color de su rol.

**Qué no sabemos de nadie:** ninguna proto-persona describe la situación financiera real de la persona (sueldo, deudas, ahorros). Es coherente con la privacidad por diseño: el producto tampoco lo sabe ni lo pregunta. Lo único que se supone es su relación con el tema (confianza, hábitos generales, momentos de uso).

---

## 1. Paula Gómez · Admin de L&D y Beneficios

> Proto-persona: hipótesis sin validar · 12/11/2026 · Rol `ld_admin`

**Objetivo principal**
Que el programa "Bienestar financiero 2026" llegue a toda la empresa, que la gente lo use de verdad y poder mostrarle a la dirección que vale lo que cuesta, sin exponer la situación de nadie.

**Tareas clave**
- Configurar el programa: modo voluntario o asignado, módulos habilitados y obligatorios, plazos, puntaje mínimo e intentos.
- Cargar personas (una por una o por CSV) y armar cohortes por área con su tutor.
- Seguir la adopción: invitadas, activas, que hicieron "Conocerte", que avanzan de nivel.
- Detectar áreas con baja participación y coordinar con los tutores.

**Frustraciones (supuestas)**
- Los beneficios de bienestar se lanzan con entusiasmo y se abandonan a las pocas semanas.
- No tiene forma de medir si un programa cambió algo más allá de "cuántos lo abrieron".
- Le preocupa que la gente desconfíe: "¿la empresa va a ver cuánto debo?".
- Las cargas masivas de personas siempre llegan con errores (correos mal escritos, áreas que no existen).

**Cómo encara el trabajo**
Panel primero, detalle después. Quiere ver en una pantalla dónde está el problema (qué cohorte, qué nivel) y bajar solo cuando algo se sale de lo esperado. Valora la privacidad porque le cuida la confianza del programa.

**Criterios de éxito**
- Lanza una cohorte nueva en minutos y sin errores de carga.
- Responde "¿qué área necesita refuerzo?" con un gráfico, no con una planilla.
- Puede explicar a cualquier persona, en una frase, qué ve y qué no ve la empresa.

**Supuestos**

| Supuesto | Riesgo si es falso | Cómo validarlo |
| --- | --- | --- |
| L&D y Beneficios es quien administra el programa (no RR. HH. general ni un proveedor externo). | Medio | Entrevistas a 3 o 4 áreas de L&D sobre quién gestiona hoy los beneficios de bienestar. |
| La principal barrera de adopción es la desconfianza sobre la privacidad. | Alto | Encuesta corta previa al lanzamiento: motivos para no sumarse a un programa de finanzas personales. |
| Le alcanza con métricas agregadas (umbral de 5) para decidir. | Medio | Prueba de concepto del panel O1 con una líder de L&D: qué decisiones puede tomar con lo que ve. |
| Las cargas de personas se hacen por CSV desde el sistema de RR. HH. | Bajo | Revisar con L&D el formato de exportación de su sistema actual. |

---

## 2. Kevin Giovanni · Tutor de bienestar financiero

> Proto-persona: hipótesis sin validar · 12/11/2026 · Rol `tutor`

**Objetivo principal**
Acompañar a sus cohortes para que nadie quede atrás y reforzar en los encuentros los temas que más cuestan, sin meterse en la vida financiera de nadie.

**Tareas clave**
- Ver el avance de cada cohorte por nivel y por módulo (mapa de calor) y detectar a quién acompañar.
- Asignar desafíos semanales con fecha.
- Revisar qué preguntas de los desafíos de nivel tienen más errores para preparar el próximo encuentro.
- Responder consultas sobre las guías.
- Desbloquear un nivel para una persona o una cohorte cuando corresponde (ajuste razonable o intentos agotados, D-57), con un motivo.

**Frustraciones (supuestas)**
- En otros programas recibe información de más y no sabe qué hacer con ella; o de menos y no puede ayudar.
- Las personas no preguntan por vergüenza.
- Prepara encuentros "a ciegas", sin saber qué temas costaron.

**Cómo encara el trabajo**
Revisa sus cohortes una o dos veces por semana, en la computadora. Prefiere alertas accionables ("4 personas no empezaron el nivel 3") a tablas largas. Necesita límites claros sobre qué puede ver para no incomodar a nadie.

**Criterios de éxito**
- Sabe en un vistazo quién está atrasado con las guías o los desafíos de nivel.
- Prepara un encuentro con las 3 preguntas que más fallan.
- Nunca ve un monto, un saldo ni si un nivel está bloqueado para alguien (D-58), y puede decirlo con tranquilidad.

**Supuestos**

| Supuesto | Riesgo si es falso | Cómo validarlo |
| --- | --- | --- |
| La tutoría la hace una persona interna formada en el tema (no un asesor externo). | Medio | Entrevistas a L&D sobre cómo se dictan hoy los talleres de bienestar. |
| Ver solo el avance de aprendizaje de cada nivel (sin saber si está bloqueado) le alcanza para acompañar. | Alto | Test de la pantalla T2 con 2 o 3 tutores: qué harían ante "desafío del nivel 6 aprobado, nivel 7 sin empezar". |
| Los encuentros grupales son el principal momento de refuerzo. | Medio | Revisar la agenda de un programa similar: frecuencia y formato de encuentros. |
| Las consultas escritas son pocas y sobre conceptos, no sobre casos personales. | Medio | Piloto de 4 semanas con una cohorte: contar y clasificar las consultas. |

---

## 3. Mariana López · Participante de oficina

> Proto-persona: hipótesis sin validar · 12/11/2026 · Rol `participant` · Analista de Operaciones · Computadora

**Objetivo principal**
Ordenar su dinero con criterio propio: saber si le alcanza, armarse un fondo de emergencia y entender qué hacer con lo que le sobra, sin que nadie le venda nada.

**Tareas clave**
- Usar la billetera de práctica en ratos de 10 a 20 minutos, desde la computadora y a veces desde el celular.
- Probar escenarios en las herramientas (inflación, plazo fijo, tarjeta) con números parecidos a los suyos, sabiendo que no salen de su navegador.
- Avanzar de nivel hasta Invertir.

**Frustraciones (supuestas)**
- Lee sobre finanzas en redes y no sabe a quién creerle.
- Siente que "debería saber" y le da vergüenza preguntar.
- Las calculadoras que encuentra no dicen qué supuestos usan.

**Cómo encara el aprendizaje**
Autónoma y exploradora. Si ya sabe un tema quiere saltarlo ("Ya sé esto"). Lee los supuestos y compara escenarios. Valora entender el porqué más que la respuesta.

**Estado de demo (D-60, 16/11/2026):** nivel 6 (Rendir), con "Conocerte" hecho, un apartado de fondo de emergencia de 2 de 3 meses, una meta de ahorro y un desafío semanal pendiente. Así se ve el bloqueo de Invertir con su progreso.

**Criterios de éxito**
- Desbloquea secciones por lo que ya sabe sin repetir lo básico.
- Entiende por qué Invertir está bloqueado y qué le falta, sin sentirse juzgada.
- Puede explicar con sus palabras la diferencia entre una cuenta remunerada y un fondo money market.

**Supuestos**

| Supuesto | Riesgo si es falso | Cómo validarlo |
| --- | --- | --- |
| Usa principalmente la computadora en horario laboral para el programa. | Medio | Analítica del piloto: dispositivo y franja horaria por área. |
| Aprender usando una billetera simulada le resulta más claro que un curso. | Alto | Test A/B cualitativo con 5 personas: misión 1 frente a la guía equivalente en formato lección. |
| El desbloqueo por suficiencia ("Ya sé esto") reduce el abandono en perfiles con conocimientos previos. | Medio | Comparar en el piloto el avance de quienes usaron suficiencia frente a quienes no. |
| Confía en que sus montos no salen del navegador si se lo explicamos en una frase. | Alto | Test de comprensión del aviso de privacidad (G5) con 5 personas. |

---

## 4. Diego Suárez · Participante operativo

> Proto-persona: hipótesis sin validar · 12/11/2026 · Rol `participant` · Operario de depósito · Celular

**Objetivo principal**
Llegar a fin de mes con menos sobresaltos y no caer en deudas que no entiende. Aprender en ratos cortos, sin sentirse en la escuela.

**Tareas clave**
- Entrar desde su celular en pausas o en el viaje, en sesiones de 5 minutos.
- Completar misiones cortas: cobrar, transferir sin errores, pagar con QR, reconocer un mensaje falso.
- Cumplir el desafío semanal de su tutor.

**Frustraciones (supuestas)**
- Las plataformas de capacitación de la empresa están pensadas para la computadora.
- Los textos largos y con palabras técnicas lo expulsan.
- Le da desconfianza poner datos personales en una app "de la empresa".

**Cómo encara el aprendizaje**
Práctico: aprende haciendo y con ejemplos concretos. Necesita retomar donde dejó, con botones grandes y una sola acción por pantalla. Puede tener conexión inestable y un celular de gama media.

**Estado de demo (D-60, 16/11/2026):** nivel 2 (Pagar), con "Conocerte" hecho, las guías y el desafío del nivel 1 hechos desde el celular (D-63) y un desafío semanal cumplido.

**Criterios de éxito**
- Completa una guía y su práctica en 5 minutos, en un celular de 320 a 375 px, sin desbordes.
- Nunca necesita arrastrar para responder (siempre hay alternativa con botones).
- Termina la misión 2 sabiendo revisar el titular antes de confirmar una transferencia.

**Supuestos**

| Supuesto | Riesgo si es falso | Cómo validarlo |
| --- | --- | --- |
| El personal operativo entra sobre todo desde el celular personal. | Alto | Consultar a L&D y a jefes de depósito; revisar la política de uso de celulares en planta. |
| Las sesiones de 5 minutos alcanzan para una guía con práctica. | Alto | Test cronometrado de una guía y una misión con 5 personas operativas. |
| El vocabulario de 2.9 (sin jerga) es comprensible sin apoyo. | Medio | Test de comprensión de 10 términos del glosario con personas operativas. |
| No tiene acceso cómodo a una computadora en el trabajo. | Medio | Relevamiento en el centro de distribución. |

---

## 5. Ricardo Benítez · Decisor (Gerente de Compensaciones)

> Proto-persona: hipótesis sin validar · 12/11/2026 · Rol `sponsor`

**Objetivo principal**
Saber si el programa de bienestar financiero tiene impacto y si conviene renovarlo o ampliarlo, sin ver datos de personas.

**Tareas clave**
- Consultar el reporte de impacto una vez al mes o antes de un comité.
- Exportarlo para compartirlo.

**Frustraciones (supuestas)**
- Los reportes de capacitación muestran asistencia, no cambios.
- Le presentan datos que no sabe interpretar ni de dónde salen.

**Cómo encara el trabajo**
Lectura rápida, de arriba hacia abajo: conclusión, tres números y una explicación de cómo se miden. Nada de configuración.

**Criterios de éxito**
- En 2 minutos entiende reacción, aprendizaje y conducta (Kirkpatrick 1 a 3).
- Sabe por qué un grupo aparece como "datos insuficientes".
- Puede exportar el reporte sin pedir ayuda.

**Supuestos**

| Supuesto | Riesgo si es falso | Cómo validarlo |
| --- | --- | --- |
| Los niveles 1 a 3 de Kirkpatrick son suficientes para decidir la renovación. | Medio | Entrevista a 2 decisores de compensaciones: qué evidencia piden hoy. |
| Prefiere un reporte de solo lectura a un panel interactivo. | Bajo | Mostrar dos versiones del D1 y observar cuál usa. |
| Acepta no ver datos individuales sin reclamarlos. | Medio | Prueba de concepto del reporte con un decisor. |

---

## Plan de validación

| Etapa | Método | Qué valida | Con quién |
| --- | --- | --- | --- |
| 1. Antes de construir más allá del piloto | Entrevistas semiestructuradas (30 min) | Rol de L&D, tutoría, barreras de adopción | 3 personas de L&D, 2 tutores |
| 2. Piloto visual | Test de comprensión del aviso de privacidad y de la misión 1 | Confianza y modelo mental de "billetera de práctica" | 5 participantes (oficina y operativos) |
| 3. Fase A completa | Test de usabilidad moderado en celular y computadora | Navegación, desbloqueos, misiones, guías | 5 de oficina, 5 operativos |
| 4. Piloto con una cohorte | Analítica agregada (umbral de 5) y encuesta | Adopción, dispositivos, abandono por nivel | Una cohorte real |

Los resultados se registran en `docs/issues.md` y, si cambian una proto-persona, se actualiza este documento con la fecha.

## Referencias

Gothelf, J., & Seiden, J. (2021). *Lean UX: Creating great products with agile teams* (3.ª ed.). O'Reilly Media.
