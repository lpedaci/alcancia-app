# Logos de proveedores de identidad

Únicos elementos de marcas de terceros del proyecto (CLAUDE.md 2.1 y F0). Se usan **solo** en los botones "Continuar con Microsoft" y "Continuar con Google" del login (G1) y **sin modificar**: ni color, ni proporción, ni tamaño relativo, ni combinados con el logo de Alcancía.

| Archivo | Origen | Descargado | Notas |
| --- | --- | --- | --- |
| `microsoft-logo.svg` | Microsoft Learn, *Sign in with Microsoft branding guidelines*: https://learn.microsoft.com/en-us/entra/identity-platform/howto-add-branding-in-apps (archivo `ms-symbollockup_mssymbol_19.svg`) | 10/11/2026 | Logo de cuatro cuadrados. La guía pide no alterarlo y usar "work or school account" (en la interfaz: "cuenta de trabajo"). |
| `google-g-logo.png` | Google Identity, *Sign in with Google branding guidelines*: https://developers.google.com/identity/branding-guidelines (archivo `g-logo.png`) | 10/11/2026 | "G" estándar a todo color, sobre fondo blanco. Se usa el PNG oficial porque el SVG del paquete `signin-assets.zip` dibuja la "G" con un degradé dentro de un `foreignObject`, que no se ve bien como imagen y choca con la CSP (decisión D-42 de Rumbo). |

Reglas aplicadas en `SsoButton.tsx`:
- Textos exactos: "Continuar con Microsoft" y "Continuar con Google" (Google recomienda "Continue with Google" y permite localizarlo).
- Los dos botones tienen el mismo tamaño, estilo y peso visual (Google pide igual prominencia).
- Fondo blanco con borde, como el tema claro de ambas guías. El logo es decorativo (`alt=""`): el texto del botón ya nombra al proveedor.
Copiados desde Rumbo el 12/11/2026, sin cambios.

## Marcas de LinkedIn y GitHub (pie de la landing)

Únicos otros elementos de marca permitidos (CLAUDE.md 2.1): solo en los enlaces a los perfiles de Lourdes en el pie de la landing, en `src/components/ui/BrandIcon.tsx`, como trazado SVG monocromo dibujado con el color del texto, sin modificar su forma.

| Marca | Versión | Referencia |
| --- | --- | --- |
| LinkedIn | Logotipo "in" en un solo color | Guía de marca de LinkedIn (brand.linkedin.com): permite la versión de un solo color |
| GitHub | Marca "Invertocat" en un solo color | Guía de logos de GitHub (github.com/logos): permite la marca en negro o blanco, y en el color del texto sobre fondos claros |

Cada ícono es un enlace con nombre accesible ("LinkedIn de Lourdes Pedaci (se abre en una pestaña nueva)") y tooltip. El portfolio usa el ícono "palette" de Material Symbols, porque no es una marca.
