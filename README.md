# Alcancía

Plataforma corporativa de aprendizaje en finanzas personales, presentada a cada participante como **una billetera de práctica**: se aprende usándola, con dinero ficticio, y cada sección se desbloquea por logros y metas.

> Proyecto de portfolio en construcción (fase A, paso 1). Prototipo navegable con datos simulados y sin backend.
> **Contenido educativo. No es asesoramiento financiero ni una recomendación de inversión.**

- **Demo:** https://lpedaci.github.io/alcancia-app/
- **Documentación:** [docs/README.md](docs/README.md)
- **Especificación:** [CLAUDE.md](CLAUDE.md)

## Stack

React 18, Vite y TypeScript; Tailwind CSS con tokens propios (Material Design 3); shadcn/ui (Radix); React Router con rutas hash; Zustand; React Hook Form y Zod; decimal.js para los cálculos; Recharts; Motion; react-i18next; Vitest y Playwright. Deploy en GitHub Pages con GitHub Actions.

## Cómo correrlo

Requiere Node 22 o superior.

```bash
npm install
npm run dev
```

Otros comandos: `npm test` (tests unitarios), `npm run lint`, `npm run build` (incluye el chequeo de tipos), `npm run test:e2e` (desbordes y accesibilidad, con el servidor de desarrollo), `npm run test:e2e:prod` (el build de producción con la CSP activa) y `npm run og-image` (regenera la imagen para redes, con `npm run dev` corriendo).

## Autoría

Diseño y desarrollo: **Lourdes Pedaci, Experience Designer (Learning y UX/UI)**. Contenido de finanzas basado en el material del Lic. Kevin Giampieri para el taller "Del aula al primer trabajo".
