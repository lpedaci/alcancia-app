# Incidencias

> Hallazgos de accesibilidad, desbordes, tests y validación. Formato: fecha, dónde, qué pasa, severidad y estado.

| ID | Fecha | Dónde | Qué pasa | Severidad | Estado |
| --- | --- | --- | --- | --- | --- |
| INC-01 | 12/11/2026 | Dependencias de desarrollo | `npm audit` informa una vulnerabilidad **moderada** en `minimatch` (denegación de servicio), que llega por ESLint 10 y typescript-eslint. Solo afecta herramientas de desarrollo, no el sitio publicado; la CI falla desde severidad alta, así que no bloquea. La corrección que propone npm baja ESLint a la versión 9 (cambio incompatible) | Baja | Abierta: revisar cuando haya una versión corregida de ESLint |
