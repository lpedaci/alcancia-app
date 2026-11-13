# Sistema de diseño de Alcancía

> Versión en Markdown del sitio público del sistema de diseño (`/#/design-system`, G8), que se construye en el **paso 12**. Mientras tanto, este archivo es el índice de sus secciones y la referencia interna es `/styleguide` (solo en desarrollo). La spec de origen es la sección 2 de [`CLAUDE.md`](../CLAUDE.md).

## Índice

| Sección | Contenido | Estado |
| --- | --- | --- |
| Principios | Sobriedad sin interfaz plana, educación y no asesoramiento, accesibilidad desde el diseño | Paso 12 |
| Arquitectura de tokens | Cuatro niveles: referencia, sistema, tema de Tailwind y componentes | Paso 12 (tokens en `src/styles/tokens.css`) |
| Color | Roles de Material 3, colores por rol, series de gráficos, contraste leído en vivo; el naranja de Fuerte como única excepción (D-52) | Paso 12 |
| Tipografía | Inter con la escala de M3; título de página en `headline-medium` (D-163) | Paso 12 |
| Espacio y forma | Ritmo de 8 px, radios, elevación tonal y dos niveles de sombra | Paso 12 |
| Íconos | Material Symbols Rounded 300 | Paso 12 |
| Movimiento | Duraciones y curvas de M3, "reducir animaciones" | Paso 12 |
| Componentes | Componentes reales, incluidos `MoneyInput`, `PercentInput`, `MoneyText`, `MetaChips` y el avatar con foto (D-165) | Paso 12 |
| Patrones | Con el número de decisión que los originó (navegación por tamaño D-164 y D-72: en la barra inferior, solo el destino activo muestra su nombre, Fuerte movible D-164, anatomía del simulador, misiones D-166) | Paso 12 |
| Cómo mostramos el dinero | Formato de montos y porcentajes, espacio de no separación (D-68), ganancias y pérdidas, supuestos y avisos | Paso 12 (ya en `/styleguide`) |
| **Seguridad y privacidad** | Las capas de la seguridad simulada como patrones de diseño (SSO, verificación en dos pasos, bloqueo, expiración de sesión, aviso de privacidad, umbral de 5 personas, seguridad de la billetera), qué ve cada rol (D-58, D-62) y un resumen de lo que se aplica de verdad y de sus límites en GitHub Pages, con enlace a [`security.md`](security.md) (D-70) | Paso 12 |
| Accesibilidad | WCAG 2.2 AA, formularios, foco, gráficos con tabla | Paso 12 |
| Voz y tono | Personalidad, vocabulario fijo y microcopy (2.9) | Paso 12 |
| Créditos | Fotos de personas: "Designed by Magnific", con enlace a magnific.com (D-71) | Paso 12 |
