/**
 * Internal style guide (CLAUDE.md 2.8). Development only: never bundled in production.
 * Texts are inline Spanish on purpose: it is an internal reference page, not product UI.
 * It must match docs/design-system.md.
 */
import { type ReactNode, useState } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { MoneyInput } from '@/components/money/MoneyInput';
import { MoneyText } from '@/components/money/MoneyText';
import { PercentInput } from '@/components/money/PercentInput';
import { formatPercent } from '@/lib/money';
import { Fuerte, FUERTE_STATES } from '@/features/companion/Fuerte';
import { Avatar } from '@/components/ui/Avatar';
import { BentoCard } from '@/components/ui/BentoCard';
import { BentoGrid } from '@/components/ui/BentoGrid';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog, Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/Dialog';
import { FilterChip } from '@/components/ui/FilterChip';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { IconTile } from '@/components/ui/IconTile';
import { KpiCard, KpiRow } from '@/components/ui/KpiCard';
import { type IconName, iconPaths } from '@/components/ui/icon-paths.generated';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SegmentedButton } from '@/components/ui/SegmentedButton';
import { SegmentedProgress } from '@/components/ui/SegmentedProgress';
import { Skeleton } from '@/components/ui/Skeleton';
import { Sparkline } from '@/components/ui/Sparkline';
import { StatusPill } from '@/components/ui/StatusPill';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/Table';
import { toast } from '@/components/ui/toast-store';
import { ValidationDemoForm } from './ValidationDemoForm';

const sections = [
  ['colores', 'Colores'],
  ['superficies', 'Superficies'],
  ['tipografia', 'Tipografía'],
  ['forma', 'Forma y elevación'],
  ['iconos', 'Íconos'],
  ['botones', 'Botones'],
  ['campos', 'Campos'],
  ['dinero', 'Dinero'],
  ['fuerte', 'Fuerte'],
  ['chips', 'Chips y estados'],
  ['progreso', 'Progreso y carga'],
  ['datos', 'Datos y personas'],
  ['bento', 'Grilla bento'],
  ['tabla', 'Tabla'],
  ['flotantes', 'Diálogos y avisos'],
] as const;

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-title`} className="flex min-w-0 flex-col gap-4">
      <h2 id={`${id}-title`} className="scroll-mt-6 text-title-large text-on-surface">
        <span id={id} />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`min-w-0 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding) ${className}`}
    >
      {children}
    </div>
  );
}

/** Reads the live token value (client-only page, so reading during render is safe). */
function readCssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim().toUpperCase();
}

function Swatch({ token, bg, fg, label }: { token: string; bg: string; fg: string; label: string }) {
  const value = readCssVar(token);
  return (
    <div className={`flex min-h-16 min-w-0 flex-col justify-between rounded-md p-3 ${bg} ${fg}`}>
      <span className="truncate text-label-large">{label}</span>
      <code className="text-body-small">{value}</code>
    </div>
  );
}

const colorRoles = [
  { role: 'primary', name: 'Primary', prefix: 'md-sys-color' },
  { role: 'secondary', name: 'Secondary', prefix: 'md-sys-color' },
  { role: 'tertiary', name: 'Tertiary', prefix: 'md-sys-color' },
  { role: 'error', name: 'Error', prefix: 'md-sys-color' },
  { role: 'success', name: 'Success (personalizado)', prefix: 'md-custom-color' },
  { role: 'warning', name: 'Warning (personalizado)', prefix: 'md-custom-color' },
  { role: 'info', name: 'Info (personalizado)', prefix: 'md-custom-color' },
] as const;

// Explicit class names so Tailwind can detect them.
const roleClasses: Record<string, { base: string; container: string }> = {
  primary: { base: 'bg-primary text-on-primary', container: 'bg-primary-container text-on-primary-container' },
  secondary: {
    base: 'bg-secondary text-on-secondary',
    container: 'bg-secondary-container text-on-secondary-container',
  },
  tertiary: { base: 'bg-tertiary text-on-tertiary', container: 'bg-tertiary-container text-on-tertiary-container' },
  error: { base: 'bg-error text-on-error', container: 'bg-error-container text-on-error-container' },
  success: { base: 'bg-success text-on-success', container: 'bg-success-container text-on-success-container' },
  warning: { base: 'bg-warning text-on-warning', container: 'bg-warning-container text-on-warning-container' },
  info: { base: 'bg-info text-on-info', container: 'bg-info-container text-on-info-container' },
};

const surfaceTokens = [
  ['md-sys-color-surface', 'bg-surface text-on-surface', 'surface: fondo de página, gris frío'],
  ['md-sys-color-surface-container-lowest', 'bg-surface-container-lowest text-on-surface', 'container-lowest: tarjetas'],
  ['md-sys-color-surface-container', 'bg-surface-container text-on-surface', 'container: sidebar, encabezados'],
  ['md-sys-color-surface-container-high', 'bg-surface-container-high text-on-surface', 'container-high: hover'],
  ['md-sys-color-on-surface', 'bg-on-surface text-surface', 'on-surface: texto'],
  ['md-sys-color-on-surface-variant', 'bg-on-surface-variant text-surface', 'on-surface-variant'],
  ['md-sys-color-outline', 'bg-outline text-on-surface', 'outline: bordes de controles'],
  ['md-sys-color-outline-variant', 'bg-outline-variant text-on-surface', 'outline-variant: divisores'],
  ['md-sys-color-inverse-surface', 'bg-inverse-surface text-inverse-on-surface', 'inverse-surface: tooltips y toasts'],
] as const;

const chartClasses = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5'];

const typeRoles = [
  ['text-display-medium', 'display-medium', '45 / 52 · 600', 'Resultado de una herramienta: $ 70.137,99'],
  ['text-display-small', 'display-small', '36 / 44 · 600', 'KPIs: 1.248'],
  ['text-headline-small', 'headline-small', '24 / 32 · 600', 'Título de página (h1)'],
  ['text-title-large', 'title-large', '22 / 28 · 600', 'Título de sección (h2)'],
  ['text-title-medium', 'title-medium', '16 / 24 · 600', 'Título de tarjeta o modal (h3)'],
  ['text-title-small', 'title-small', '14 / 20 · 500', 'Subtítulo, encabezado de tabla'],
  ['text-body-large', 'body-large', '16 / 24 · 400', 'Texto de las guías y base en celular.'],
  ['text-body-medium', 'body-medium', '14 / 20 · 400', 'Texto base de los paneles y celdas de tabla.'],
  ['text-body-small', 'body-small', '12 / 16 · 400', 'Ayuda de campos, supuestos, 16/11/2026'],
  ['text-label-large', 'label-large', '14 / 20 · 500', 'Botones, pestañas, navegación'],
  ['text-label-medium', 'label-medium', '12 / 16 · 500', 'Etiquetas de campos, chips'],
  ['text-label-small', 'label-small', '11 / 16 · 500', 'Solo contadores e insignias'],
] as const;

const radii = [
  ['rounded-xs', 'xs · 4 px'],
  ['rounded-sm', 'sm · 8 px: botones, campos'],
  ['rounded-md', 'md · 12 px: menús, tooltips'],
  ['rounded-lg', 'lg · 16 px: diálogos, paneles internos'],
  ['rounded-xl', 'xl · 24 px: tarjetas'],
  ['rounded-full', 'full: píldoras'],
] as const;

const iconNames = Object.keys(iconPaths) as IconName[];

export function StyleguidePage() {
  const [chips, setChips] = useState({ overdue: true, blocked: false, done: false });
  const [segment, setSegment] = useState<'low' | 'medium' | 'high'>('medium');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [progress, setProgress] = useState(45);

  return (
    <PageShell width="wide">
      <header className="flex flex-col gap-2">
        <p className="text-label-large text-primary">Alcancía · Solo en desarrollo</p>
        <h1 className="text-headline-small text-on-surface">Guía de estilo</h1>
        <p className="max-w-3xl text-body-large text-on-surface-variant">
          Tokens y componentes base de Alcancía: Material Design 3 personalizado, en cuatro niveles (referencia,
          sistema, tema y componentes). Es la referencia visual de docs/design-system.md y no se publica en producción.
        </p>
        <nav aria-label="Secciones de la guía">
          <ul className="mt-2 flex flex-wrap gap-2">
            {sections.map(([id, label]) => (
              <li key={id}>
                <Button asChild variant="outlined" size="xs">
                  <a href={`#/styleguide`} onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(`${id}-title`)?.scrollIntoView({ behavior: 'smooth' });
                    document.getElementById(`${id}-title`)?.focus();
                  }}>
                    {label}
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <Section id="colores" title="Colores (roles de M3)">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {colorRoles.map(({ role, name, prefix }) => (
            <Panel key={role} className="flex flex-col gap-2">
              <h3 className="text-title-medium text-on-surface">{name}</h3>
              <Swatch token={`--${prefix}-${role}`} bg={roleClasses[role]!.base} fg="" label={role} />
              <Swatch
                token={`--${prefix}-${role}-container`}
                bg={roleClasses[role]!.container}
                fg=""
                label={`${role}-container`}
              />
            </Panel>
          ))}
        </div>
        <p className="text-body-medium text-on-surface-variant">
          Los colores de estado (error, success, warning, info) solo se usan para estados, siempre con ícono y texto.
          En píldoras, el texto va en on-container y el ícono en el color base. El naranja de Fuerte (D-52) no es un rol: vive
          solo dentro de su ilustración y no se usa en ningún componente.
        </p>
      </Section>

      <Section id="superficies" title="Superficies, neutros y series de gráficos">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {surfaceTokens.map(([token, cls, label]) => (
            <div key={token} className="rounded-md border border-outline-variant">
              <Swatch token={`--${token}`} bg={cls} fg="" label={label} />
            </div>
          ))}
        </div>
        <Panel className="flex flex-col gap-3">
          <h3 className="text-title-medium text-on-surface">Series de gráficos, en orden</h3>
          <div className="flex flex-wrap gap-3">
            {chartClasses.map((cls, i) => (
              <div key={cls} className="flex items-center gap-2 text-body-medium text-on-surface">
                <span className={`size-4 rounded-xs ${cls}`} aria-hidden />
                Serie {i + 1}
              </div>
            ))}
          </div>
          <p className="text-body-small text-on-surface-variant">
            Todas las series llegan a 3:1 sobre blanco. El área bajo las líneas va en color plano al 12 %, sin degradé.
          </p>
        </Panel>
      </Section>

      <Section id="tipografia" title="Tipografía: Inter con la escala de M3">
        <Panel className="flex flex-col divide-y divide-outline-variant p-0">
          {typeRoles.map(([cls, role, spec, sample]) => (
            <div key={role} className="flex min-w-0 flex-col gap-1 px-5 py-3 md:flex-row md:items-baseline md:gap-6">
              <div className="w-48 shrink-0">
                <p className="text-label-medium text-on-surface">{role}</p>
                <p className="text-body-small text-on-surface-variant">{spec}</p>
              </div>
              <p className={`${cls} min-w-0 break-words text-on-surface`}>{sample}</p>
            </div>
          ))}
        </Panel>
      </Section>

      <Section id="forma" title="Forma y elevación">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel className="flex flex-wrap gap-4">
            {radii.map(([cls, label]) => (
              <div key={cls} className="flex flex-col items-center gap-2">
                <div className={`size-16 border-2 border-primary bg-primary-container ${cls}`} aria-hidden />
                <span className="text-body-small text-on-surface-variant">{label}</span>
              </div>
            ))}
          </Panel>
          <Panel className="flex flex-col gap-4">
            <p className="text-body-medium text-on-surface-variant">
              Las tarjetas no llevan sombra: se separan con superficie y borde. Solo dos niveles para lo que flota.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-md bg-surface-container-lowest p-4 text-body-medium shadow-elevation-1">
                elevation-1: menús, popovers, tooltips
              </div>
              <div className="rounded-lg bg-surface-container-lowest p-4 text-body-medium shadow-elevation-2">
                elevation-2: diálogos, toasts, arrastre
              </div>
            </div>
          </Panel>
        </div>
      </Section>

      <Section id="iconos" title={`Íconos: Material Symbols Rounded 300 (${iconNames.length})`}>
        <Panel>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2">
            {iconNames.map((name) => (
              <li key={name} className="flex min-w-0 items-center gap-2 rounded-sm p-2 text-on-surface-variant">
                <Icon name={name} size={24} />
                <Icon name={name} size={24} filled className="text-primary" />
                <span className="truncate text-body-small" title={name}>
                  {name}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </Section>

      <Section id="botones" title="Botones: jerarquía de M3 Expressive">
        <Panel className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="filled" leadingIcon="add">
              Crear apartado
            </Button>
            <Button variant="tonal">Guardar escenario</Button>
            <Button variant="outlined" leadingIcon="download">
              Exportar
            </Button>
            <Button variant="text">Ver detalle</Button>
            <Button variant="danger" leadingIcon="delete">
              Eliminar meta
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="xs" variant="outlined">
              XS · 32 px
            </Button>
            <Button size="s">S · 40 px</Button>
            <Button size="m">M · 56 px</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button loading loadingText="Guardando…">
              Guardar meta
            </Button>
            <Button disabledReason="Primero aprueba el desafío del nivel 1">Ir a Pagar</Button>
            <Button variant="outlined" disabled>
              Deshabilitado sin motivo
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <IconButton icon="edit" label="Editar meta" />
            <IconButton icon="more_vert" label="Más acciones" />
            <IconButton icon="notifications" label="Notificaciones" variant="tonal" />
            <IconButton icon="filter_list" label="Filtros" variant="outlined" />
            <IconButton icon="dashboard" label="Panel (seleccionado)" selected />
            <IconButton icon="drag_indicator" label="Reordenar" size="xs" />
          </div>
          <p className="text-body-small text-on-surface-variant">
            Un solo botón filled por región. Los deshabilitados con motivo siguen siendo enfocables y muestran el
            motivo en un tooltip. En mobile, el área táctil mínima es de 48 × 48 px.
          </p>
        </Panel>
      </Section>

      <Section id="campos" title="Campos: etiqueta, texto de ayuda, máscaras y validación">
        <Panel className="flex flex-col gap-4">
          <p className="text-body-medium text-on-surface-variant">
            Prueba escribir letras en el monto, el porcentaje, la fecha o el código: no se aceptan. En el monto puedes
            pegar “$ 1.500,50” o “1500.50”: al salir del campo se normaliza y se formatea. Los errores aparecen al salir del
            campo o al enviar, desaparecen apenas se corrigen y nunca borran lo cargado.
          </p>
          <ValidationDemoForm />
        </Panel>
      </Section>

      <Section id="dinero" title="Cómo mostramos el dinero">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel className="flex flex-col gap-3">
            <h3 className="text-title-medium text-on-surface">Montos y porcentajes (2.9)</h3>
            <ul className="flex flex-col gap-2 text-body-medium text-on-surface">
              <li className="flex flex-wrap justify-between gap-2">
                <span>Pesos</span>
                <MoneyText value="1234567.89" />
              </li>
              <li className="flex flex-wrap justify-between gap-2">
                <span>Moneda extranjera, siempre con código</span>
                <MoneyText value="1200" currency="USD" decimals={0} />
              </li>
              <li className="flex flex-wrap justify-between gap-2">
                <span>Porcentaje con período</span>
                <span className="tabular-nums">{formatPercent('0.03')} mensual · {formatPercent('0.425')} anual</span>
              </li>
              <li className="flex flex-wrap justify-between gap-2">
                <span>Ganancia: signo, ícono y texto accesible</span>
                <MoneyText value="24953.66" trend className="text-on-surface" />
              </li>
              <li className="flex flex-wrap justify-between gap-2">
                <span>Pérdida de poder de compra (warning, no error)</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-warning-container px-2 py-0.5 text-label-medium text-on-warning-container">
                  <MoneyText value="-29862.01" trend />
                  <span>Pierdes poder de compra</span>
                </span>
              </li>
            </ul>
          </Panel>
          <Panel className="flex flex-col gap-3">
            <h3 className="text-title-medium text-on-surface">Montos largos que nunca se cortan (2.7)</h3>
            <div className="@container flex flex-col gap-2">
              {['100%', '12rem', '9rem'].map((width) => (
                <div
                  key={width}
                  className="@container rounded-md border border-outline-variant p-2 text-title-large"
                  style={{ width }}
                >
                  <MoneyText value="12345678.90" compactBelow="xs" />
                </div>
              ))}
            </div>
            <p className="text-body-small text-on-surface-variant">
              Si el monto no entra, pasa a notación abreviada ($ 12,3 M); el valor completo queda en el nombre accesible
              y en el título.
            </p>
          </Panel>
          <Panel className="flex flex-col gap-4 lg:col-span-2">
            <h3 className="text-title-medium text-on-surface">Campos de dinero y porcentaje (2.10)</h3>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <MoneyInput
                label="Monto"
                helperText="Monto en pesos, por ejemplo: 150.000"
                defaultValue="100.000"
              />
              <MoneyInput
                label="Monto en dólares"
                currency="USD"
                helperText="Monto en dólares, por ejemplo: 200"
              />
              <PercentInput
                label="Tasa real del período"
                allowNegative
                helperText="Porcentaje, puede ser negativo, por ejemplo: -0,04"
              />
            </div>
          </Panel>
        </div>
      </Section>

      <Section id="fuerte" title="Fuerte: seis estados (5.0.1)">
        <Panel className="flex flex-col gap-4">
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
            {FUERTE_STATES.map((state, i) => (
              <li key={state} className="flex flex-col items-center gap-2 rounded-lg bg-surface p-3">
                <Fuerte state={state} lights={i + 1} size={7} />
                <span className="text-label-medium text-on-surface">
                  {{ neutral: 'Neutral', greeting: 'Saludo', thinking: 'Pensativo', attention: 'Atención', celebration: 'Celebración', sleeping: 'Dormido' }[state]}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-body-small text-on-surface-variant">
            Relleno plano, sin degradés. El naranja vive solo en Fuerte (D-52). Las luces del panel muestran los niveles
            completados (una por nivel, siete en total); en Celebración se encienden todas.
          </p>
        </Panel>
      </Section>

      <Section id="chips" title="Chips, botones segmentados y píldoras de estado">
        <Panel className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar movimientos">
            <FilterChip
              label="Necesidades"
              count={12}
              selected={chips.overdue}
              onClick={() => setChips((c) => ({ ...c, overdue: !c.overdue }))}
            />
            <FilterChip
              label="Deseos"
              count={6}
              selected={chips.blocked}
              onClick={() => setChips((c) => ({ ...c, blocked: !c.blocked }))}
            />
            <FilterChip label="Ahorro" selected={chips.done} onClick={() => setChips((c) => ({ ...c, done: !c.done }))} />
          </div>
          <SegmentedButton
            label="Escenario de inflación (valores de ejemplo)"
            value={segment}
            onValueChange={setSegment}
            options={[
              { value: 'low', label: 'Baja · 1,5 %' },
              { value: 'medium', label: 'Media · 3 %' },
              { value: 'high', label: 'Alta · 6 %' },
            ]}
          />
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="neutral" icon="radio_button_unchecked" label="Sin empezar" />
            <StatusPill tone="info" icon="pending" label="En curso" />
            <StatusPill tone="success" icon="check_circle" label="Completado" />
            <StatusPill tone="warning" icon="lock" label="Bloqueado" />
            <StatusPill tone="error" icon="error" label="Error de validación" />
            <StatusPill tone="primary" icon="flag" label="Nivel actual" />
          </div>
        </Panel>
      </Section>

      <Section id="progreso" title="Progreso y carga">
        <Panel className="flex flex-col gap-4">
          <ProgressBar value={progress} label="Fondo de emergencia" valueText={`${progress} %`} />
          <ProgressBar value={100} label="Guías del nivel 1" valueText="100 %" tone="success" />
          <ProgressBar value={progress} size="lg" label="Meta de ahorro (barra gruesa)" valueText={`${progress} %`} />
          <div className="flex flex-col gap-2">
            <p className="text-label-medium text-on-surface">Barra segmentada</p>
            <SegmentedProgress
              done={progress}
              total={100}
              label="Avance de la misión"
              valueText={`${progress} de 100`}
              className="max-w-md"
            />
          </div>
          <div>
            <Button variant="outlined" size="xs" onClick={() => setProgress((p) => (p >= 100 ? 10 : p + 15))}>
              Simular avance
            </Button>
          </div>
          <div className="flex flex-col gap-2" aria-label="Ejemplo de carga" role="group">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </Panel>
      </Section>

      <Section id="datos" title="Datos y personas: íconos en contenedor, sparklines, avatares y tooltip">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel className="flex flex-col gap-3">
            <h3 className="text-title-medium text-on-surface">Íconos en contenedor</h3>
            <div className="flex flex-wrap gap-2">
              <IconTile icon="account_balance_wallet" tone="brand" />
              <IconTile icon="savings" tone="primary" />
              <IconTile icon="receipt_long" tone="secondary" />
              <IconTile icon="trophy" tone="tertiary" />
              <IconTile icon="error" tone="error" />
              <IconTile icon="schedule" tone="warning" />
              <IconTile icon="check_circle" tone="success" />
              <IconTile icon="info" tone="info" />
            </div>
            <p className="text-body-small text-on-surface-variant">
              Los tonos de estado solo cuando el ícono representa un estado; el verde azulado (tertiary) para logros.
            </p>
          </Panel>
          <Panel className="flex flex-col gap-3">
            <h3 className="text-title-medium text-on-surface">Avatares por rol</h3>
            <ul className="flex flex-col gap-2">
              {(
                [
                  ['Paula Gómez', 'ld_admin', 'Admin de L&D: role-org-admin'],
                  ['Andrés Molina', 'tutor', 'Tutor: role-tutor'],
                  ['Mariana López', 'participant', 'Participante: role-participant'],
                  ['Diego Suárez', 'participant', 'Participante (celular): role-participant'],
                  ['Ricardo Benítez', 'sponsor', 'Decisor: role-sponsor'],
                ] as const
              ).map(([name, role, note]) => (
                <li key={name} className="flex items-center gap-3">
                  <Avatar name={name} role={role} />
                  <span className="flex flex-col">
                    <span className="text-title-small text-on-surface">{name}</span>
                    <span className="text-body-small text-on-surface-variant">{note}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-body-small text-on-surface-variant">
              Sin fotos de personas: iniciales sobre el contenedor del color del rol (2.2).
            </p>
          </Panel>
          <Panel className="flex flex-col gap-3">
            <h3 className="text-title-medium text-on-surface">Sparklines y tooltip de gráficos</h3>
            <div className="flex items-center gap-4">
              <Sparkline values={[3, 5, 4, 7, 6, 9, 11]} />
              <Sparkline values={[9, 8, 8, 6, 7, 5, 4]} tone="tertiary" />
            </div>
            <span className="w-fit rounded-md bg-inverse-surface px-2 py-1 text-label-medium text-inverse-on-surface tabular-nums">
              Mes 3 · $ 257.000
            </span>
            <p className="text-body-small text-on-surface-variant">
              La línea es decorativa: el valor y su variación siempre van escritos al lado. Relleno plano al 12 %.
            </p>
          </Panel>
        </div>
      </Section>

      <Section id="bento" title="Grilla bento: 12 columnas, 6 en tablet, 1 en mobile">
        <BentoGrid>
          <KpiRow>
          <KpiCard
            headingLevel="h3"
            label="Personas activas"
            value="62"
            icon="group"
            trend={{ tone: 'success', icon: 'trending_up', label: '+8 este mes' }}
            series={[6, 7, 7, 9, 10, 10, 12]}
          />
          <KpiCard
            headingLevel="h3"
            label="Guías completadas"
            value="84 %"
            icon="task_alt"
            iconTone="tertiary"
            trend={{ tone: 'neutral', icon: 'trending_flat', label: 'Sin cambios' }}
            series={[80, 83, 82, 85, 84, 84]}
            seriesTone="tertiary"
          />
          <KpiCard
            headingLevel="h3"
            label="Sin empezar el nivel 3"
            value="3"
            icon="schedule"
            iconTone="secondary"
            trend={{ tone: 'error', icon: 'trending_up', label: '+1 esta semana' }}
          />
          <KpiCard
            headingLevel="h3"
            label="Desafíos aprobados"
            value="57 %"
            icon="query_stats"
            trend={{ tone: 'success', icon: 'trending_up', label: '+6 puntos' }}
            series={[40, 44, 47, 52, 55, 57]}
          />
          </KpiRow>
          <BentoCard
            size="lg"
            title="Avance por nivel (lg)"
            headingLevel="h3"
            description="El gráfico principal ocupa 8 de 12 columnas"
            action={<Button variant="text" size="xs" trailingIcon="chevron_right">Ver detalle</Button>}
          >
            <div className="flex h-40 items-end gap-2" aria-hidden>
              {[30, 55, 42, 70, 64, 88, 50, 76].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-xs bg-chart-1" style={{ height: `${h}%` }} />
              ))}
            </div>
          </BentoCard>
          <BentoCard size="tall" title="Alertas (tall)" headingLevel="h3">
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2 text-body-medium">
                <Icon name="error" className="mt-0.5 text-error" />
                <span>4 personas no leyeron las guías del nivel 3</span>
              </li>
              <li className="flex items-start gap-2 text-body-medium">
                <Icon name="flag" className="mt-0.5 text-warning" />
                <span>Intentos agotados en el nivel 5: 1 persona</span>
              </li>
              <li className="flex items-start gap-2 text-body-medium">
                <Icon name="lock" className="mt-0.5 text-warning" />
                <span>El plazo del programa vence en 10 días</span>
              </li>
            </ul>
          </BentoCard>
          <BentoCard size="md" title="Tarjeta md" headingLevel="h3">
            <p className="text-body-medium text-on-surface-variant">4 de 12 columnas en desktop.</p>
          </BentoCard>
          <BentoCard size="wide" title="Tarjeta wide" headingLevel="h3">
            <p className="text-body-medium text-on-surface-variant">Ancho completo: tablas y bloques largos.</p>
          </BentoCard>
        </BentoGrid>
      </Section>

      <Section id="tabla" title="Tabla">
        <TableContainer label="Ejemplo de tabla de movimientos">
          <Table className="min-w-[40rem]">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Movimiento</TableHeaderCell>
                <TableHeaderCell>Categoría</TableHeaderCell>
                <TableHeaderCell>Fecha</TableHeaderCell>
                <TableHeaderCell className="text-right">Monto</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Sueldo · Andina Servicios S.A.</TableCell>
                <TableCell>Ingreso</TableCell>
                <TableCell>
                  <time dateTime="2026-11-17">17/11/2026</time>
                </TableCell>
                <TableCell className="text-right">
                  <MoneyText value="1284958.86" trend />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Suscripción de streaming</TableCell>
                <TableCell>Deseos</TableCell>
                <TableCell>
                  <time dateTime="2026-11-17">17/11/2026</time>
                </TableCell>
                <TableCell className="text-right">
                  <MoneyText value="-4990" trend />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <p className="text-body-small text-on-surface-variant">
          Si la tabla no entra, se desplaza dentro de su contenedor. En los listados reales, en celular pasa a
          tarjetas (2.7).
        </p>
      </Section>

      <Section id="flotantes" title="Diálogos y avisos">
        <Panel className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outlined">Abrir diálogo</Button>
            </DialogTrigger>
            <DialogContent
              title="Guardar escenario"
              description="Se guarda en tu navegador para compararlo con otro. Nadie más lo ve."
              actions={
                <>
                  <DialogClose asChild>
                    <Button variant="outlined" fullWidth className="sm:w-auto">
                      Cancelar
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button fullWidth className="sm:w-auto" onClick={() => toast.success('Escenario guardado')}>
                      Guardar escenario
                    </Button>
                  </DialogClose>
                </>
              }
            />
          </Dialog>
          <Button variant="outlined" onClick={() => setConfirmOpen(true)}>
            Confirmación destructiva
          </Button>
          <Button variant="outlined" onClick={() => toast.success('Meta guardada')}>
            Mostrar toast de éxito
          </Button>
          <Button variant="outlined" onClick={() => toast.info('Se desbloqueó Pagar')}>
            Mostrar toast informativo
          </Button>
          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="¿Eliminar esta meta?"
            description="El dinero del apartado vuelve a tu saldo de práctica. La meta no se puede recuperar."
            confirmLabel="Eliminar meta"
            onConfirm={() => toast.success('Meta eliminada')}
          />
        </Panel>
      </Section>
    </PageShell>
  );
}
