import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SECURITY_MD_URL } from '@/app/links';
import { MoneyInput } from '@/components/money/MoneyInput';
import { MoneyText } from '@/components/money/MoneyText';
import { PercentInput } from '@/components/money/PercentInput';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { KpiCard, KpiRow } from '@/components/ui/KpiCard';
import { MetaChips } from '@/components/ui/MetaChips';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SegmentedButton } from '@/components/ui/SegmentedButton';
import { SegmentedProgress } from '@/components/ui/SegmentedProgress';
import { StatusPill } from '@/components/ui/StatusPill';
import { TextField } from '@/components/ui/TextField';
import { Fuerte, FUERTE_STATES } from '@/features/companion/Fuerte';
import { SourceList } from '@/features/learning/SourceList';
import { formatMoney, formatPercent } from '@/lib/money';
import { cn } from '@/lib/utils';

/**
 * Components, Fuerte, money and security sections of the public design system (G8, D-199). Every
 * specimen is the real component with the product's copy; nothing here is a picture.
 */
const panel = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';

function Specimen({ title, note, children, className }: { title: string; note: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn(panel, className)}>
      <div className="flex flex-col gap-1">
        <h3 className="text-title-large text-on-surface">{title}</h3>
        <p className="text-body-medium text-on-surface-variant">{note}</p>
      </div>
      {/* The specimen sits on the page gray, as in the product */}
      <div className="@container min-w-0 rounded-lg bg-surface p-4">{children}</div>
    </section>
  );
}

export function ComponentsSection() {
  const { t } = useTranslation();
  const c = (k: string) => t(`designSystem.components.${k}`);
  const [scenario, setScenario] = useState<'low' | 'medium' | 'high'>('medium');
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) xl:grid-cols-2">
      <Specimen title={c('buttons')} note={c('buttonsNote')}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <Button leadingIcon="save">{c('filled')}</Button>
            <Button variant="tonal" leadingIcon="table_view">
              {c('tonal')}
            </Button>
            <Button variant="outlined">{c('outlined')}</Button>
            <Button variant="text" trailingIcon="arrow_forward">
              {c('text')}
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="danger" leadingIcon="delete">
              {c('danger')}
            </Button>
            <Button disabledReason={t('designSystem.components.alertWarning')}>{c('disabled')}</Button>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <Button size="xs" variant="tonal">
              {c('xs')} · 32 px
            </Button>
            <Button size="s" variant="tonal">
              {c('s')} · 40 px
            </Button>
            <Button size="m" variant="tonal">
              {c('m')} · 56 px
            </Button>
          </div>
        </div>
      </Specimen>

      <Specimen title={c('fields')} note={c('fieldsNote')}>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 @lg:grid-cols-2">
          <TextField label={c('alias')} helperText={c('aliasHelp')} defaultValue={c('aliasValue')} error={c('aliasError')} className="@lg:col-span-2" autoComplete="off" />
          <MoneyInput label={c('amount')} helperText={c('amountHelp')} defaultValue="150.000" />
          <PercentInput label={c('rate')} helperText={c('rateHelp')} defaultValue="3" />
        </div>
      </Specimen>

      <Specimen title={c('chips')} note={c('chipsNote')}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="success" icon="check_circle" label={c('statuses.done')} />
            <StatusPill tone="info" icon="pending" label={c('statuses.progress')} />
            <StatusPill tone="warning" icon="schedule" label={c('statuses.soon')} />
            <StatusPill tone="error" icon="error" label={c('statuses.error')} />
            <StatusPill tone="neutral" icon="lock" label={c('statuses.neutral')} />
          </div>
          <MetaChips
            label={c('chips')}
            items={[
              { icon: 'flag', label: c('meta1') },
              { icon: 'schedule', label: c('meta2') },
              { icon: 'calendar_month', label: c('meta3'), dateTime: '2026-11-16' },
            ]}
          />
          <SegmentedButton
            label={c('segmentLabel')}
            value={scenario}
            onValueChange={setScenario}
            options={(['low', 'medium', 'high'] as const).map((v) => ({ value: v, label: c(`seg.${v}`) }))}
          />
        </div>
      </Specimen>

      <Specimen title={c('kpi')} note={c('kpiNote')}>
        <KpiRow minCardWidth="11rem">
          <KpiCard label={c('kpiBalance')} value={formatMoney('842310.55')} icon="account_balance_wallet" caption={c('kpiBalanceCaption')} series={[3, 4, 3.6, 5, 5.4, 6]} headingLevel="h3" />
          <KpiCard label={c('kpiFund')} value="2 / 3" icon="savings" iconTone="tertiary" caption={c('kpiFundCaption')} headingLevel="h3" />
        </KpiRow>
      </Specimen>

      <Specimen title={c('alerts')} note={c('alertsNote')}>
        <div className="flex flex-col gap-3">
          <InlineAlert tone="info" live="none">
            {c('alertInfo')}
          </InlineAlert>
          <InlineAlert tone="success" live="none">
            {c('alertSuccess')}
          </InlineAlert>
          <InlineAlert tone="warning" live="none">
            {c('alertWarning')}
          </InlineAlert>
          <InlineAlert tone="error" live="none">
            {c('alertError')}
          </InlineAlert>
        </div>
      </Specimen>

      <Specimen title={c('progress')} note={c('progressNote')}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <span className="text-body-small text-on-surface" aria-hidden>
              {c('progressLabel')}
            </span>
            <ProgressBar value={66.7} label={c('progressLabel')} valueText={c('progressValue')} tone="tertiary" />
          </div>
          <SegmentedProgress done={3} total={5} label={c('progress')} valueText={c('stepsValue')} />
        </div>
      </Specimen>

      <Specimen title={c('sources')} note={c('sourcesNote')} className="xl:col-span-2">
        <SourceList codes={['A-35', 'A-36', 'B-12', 'B-14']} variant="footer" />
      </Specimen>
    </div>
  );
}

export function FuerteSection() {
  const { t } = useTranslation();
  const rules = t('designSystem.fuerte.rules', { returnObjects: true }) as string[];
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className={panel}>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FUERTE_STATES.map((state, i) => (
            <li key={state} className="flex flex-col items-center gap-2 rounded-lg bg-surface p-3">
              <Fuerte state={state} lights={state === 'celebration' ? 7 : i + 1} size={6} />
              <span className="text-label-medium text-on-surface">{t(`designSystem.fuerte.states.${state}`)}</span>
            </li>
          ))}
        </ul>
        <p className="text-body-small text-on-surface-variant">{t('designSystem.fuerte.lights')}</p>
      </div>
      <div className={panel}>
        <blockquote className="flex items-start gap-3 rounded-lg bg-surface-container p-4">
          <Icon name="chat" size={20} className="mt-0.5 shrink-0 text-primary" />
          <p className="text-body-large text-on-surface">{t('designSystem.fuerte.quote')}</p>
        </blockquote>
        <ul className="flex flex-col gap-3">
          {rules.map((r) => (
            <li key={r} className="flex items-start gap-2 text-body-medium text-on-surface">
              <Icon name="check_circle" size={20} className="shrink-0 text-success" />
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FormatRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-outline-variant py-2.5 last:border-b-0">
      <span className="text-body-medium text-on-surface-variant">{label}</span>
      <span className="text-body-large text-on-surface">{children}</span>
    </li>
  );
}

export function MoneySection() {
  const { t } = useTranslation();
  const m = (k: string) => t(`designSystem.money.${k}`);
  const rules = t('designSystem.money.rules', { returnObjects: true }) as string[][];
  return (
    <div className="flex flex-col gap-(--space-bento-gap)">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) lg:grid-cols-2">
        <div className={panel}>
          <h3 className="text-title-large text-on-surface">{m('formats')}</h3>
          <ul className="flex flex-col">
            <FormatRow label={m('rows.ars')}>
              <MoneyText value="1234567.89" />
            </FormatRow>
            <FormatRow label={m('rows.usd')}>
              <MoneyText value="1200" currency="USD" decimals={0} />
            </FormatRow>
            <FormatRow label={m('rows.percent')}>
              <span className="tabular-nums">
                {formatPercent('0.03')} {m('monthly')} · {formatPercent('0.425', { decimals: 1 })} {m('yearly')}
              </span>
            </FormatRow>
            <FormatRow label={m('rows.in')}>
              <MoneyText value="1284958.86" trend flow />
            </FormatRow>
            <FormatRow label={m('rows.out')}>
              <MoneyText value="-26000" trend flow />
            </FormatRow>
            <FormatRow label={m('rows.loss')}>
              <span className="inline-flex flex-wrap items-center gap-1 rounded-full bg-warning-container px-2 py-0.5 text-label-medium text-on-warning-container">
                <MoneyText value="-29862.01" trend />
                <span>{m('rows.lossLabel')}</span>
              </span>
            </FormatRow>
          </ul>
        </div>
        <div className={panel}>
          <h3 className="text-title-large text-on-surface">{m('long')}</h3>
          <div className="flex flex-col gap-2">
            {['100%', '12rem', '8rem'].map((width) => (
              <div key={width} className="@container max-w-full rounded-md border border-outline-variant p-2 text-title-large" style={{ width }}>
                <MoneyText value="12345678.90" compactBelow="xs" />
              </div>
            ))}
          </div>
          <p className="text-body-small text-on-surface-variant">{m('longNote')}</p>
        </div>
      </div>

      <div className={panel}>
        <h3 className="text-title-large text-on-surface">{m('credit')}</h3>
        <dl className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="flex flex-col gap-1 rounded-lg bg-warning-container p-3 text-on-warning-container">
            <dt className="text-label-medium">{m('cft')}</dt>
            <dd className="text-title-medium tabular-nums">{formatPercent('0.818', { decimals: 1 })}</dd>
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-surface-container p-3">
            <dt className="text-label-medium text-on-surface-variant">{m('tna')}</dt>
            <dd className="text-title-medium tabular-nums text-on-surface">{formatPercent('0.55', { decimals: 1 })}</dd>
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-surface-container p-3">
            <dt className="text-label-medium text-on-surface-variant">{m('received')}</dt>
            <dd className="text-title-medium text-on-surface">
              <MoneyText value="570000" />
            </dd>
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-warning-container p-3 text-on-warning-container">
            <dt className="text-label-medium">{m('total')}</dt>
            <dd className="text-title-medium">
              <MoneyText value="1001691.84" />
            </dd>
          </div>
        </dl>
        <p className="text-body-small text-on-surface-variant">{m('creditNote')}</p>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) lg:grid-cols-2">
        <div className={panel}>
          <h3 className="text-title-large text-on-surface">{m('inputs')}</h3>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
            <MoneyInput label={t('designSystem.components.amount')} helperText={t('designSystem.components.amountHelp')} defaultValue="100.000" />
            <MoneyInput label="USD" currency="USD" helperText={t('designSystem.money.rows.usd')} defaultValue="200" />
          </div>
          <p className="text-body-small text-on-surface-variant">{m('inputsNote')}</p>
        </div>
        <ul className={cn(panel, 'gap-3')}>
          {rules.map(([title, body]) => (
            <li key={title} className="flex items-start gap-3">
              <Icon name="check_circle" size={20} className="mt-0.5 shrink-0 text-success" />
              <span className="flex flex-col gap-0.5">
                <span className="text-title-small text-on-surface">{title}</span>
                <span className="text-body-medium text-on-surface-variant">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className="flex items-start gap-2 text-body-small text-on-surface-variant">
        <Icon name="info" size={16} className="mt-0.5 shrink-0 text-info" />
        {m('legal')}
      </p>
    </div>
  );
}

const LAYER_ICON: IconName[] = ['visibility', 'verified_user', 'cloud'];
const LAYER_TONE = ['secondary', 'tertiary', 'primary'] as const;

export function SecuritySection() {
  const { t } = useTranslation();
  const s = (k: string) => t(`designSystem.security.${k}`);
  const layers = t('designSystem.security.layers', { returnObjects: true }) as { title: string; body: string; items: string[] }[];
  const design = t('designSystem.security.designItems', { returnObjects: true }) as string[][];
  const rows = t('designSystem.security.whoRows', { returnObjects: true }) as string[][];
  const cols = ['role', 'learning', 'money', 'habits', 'locked'];
  return (
    <div className="flex flex-col gap-(--space-bento-gap)">
      <ol className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) lg:grid-cols-3">
        {layers.map((l, i) => (
          <li key={l.title} className={panel}>
            <div className="flex items-center gap-3">
              <IconTile icon={LAYER_ICON[i]!} tone={LAYER_TONE[i]!} />
              <h3 className="text-title-large text-on-surface">{l.title}</h3>
            </div>
            <p className="text-body-medium text-on-surface-variant">{l.body}</p>
            <ul className="flex flex-col gap-2">
              {l.items.map((it) => (
                <li key={it} className="flex items-start gap-2 text-body-medium text-on-surface">
                  <Icon name="check" size={18} className="mt-0.5 shrink-0 text-primary" />
                  {it}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <div className={panel}>
        <h3 className="text-title-large text-on-surface">{s('design')}</h3>
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2 xl:grid-cols-3">
          {design.map(([title, body]) => (
            <li key={title} className="flex flex-col gap-1 rounded-lg bg-surface-container p-4">
              <span className="text-title-small text-on-surface">{title}</span>
              <span className="text-body-medium text-on-surface-variant">{body}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={panel}>
        <h3 className="text-title-large text-on-surface">{s('who')}</h3>
        {/* Table from 768 px; one card per role on the phone (2.7) */}
        <div className="hidden overflow-hidden rounded-lg border border-outline-variant md:block">
          <table className="w-full text-left text-body-medium">
            <thead className="bg-surface-container text-title-small text-on-surface-variant">
              <tr>
                {cols.map((c) => (
                  <th key={c} scope="col" className="px-4 py-3 font-medium">
                    {t(`designSystem.security.whoCols.${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([role, ...cells]) => (
                <tr key={role} className="border-t border-outline-variant">
                  <th scope="row" className="px-4 py-3 font-medium text-on-surface">
                    {role}
                  </th>
                  {cells.map((cell, i) => (
                    <td key={i} className="px-4 py-3">
                      <WhoCell value={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="flex flex-col gap-3 md:hidden">
          {rows.map(([role, ...cells]) => (
            <li key={role} className="flex flex-col gap-2 rounded-lg border border-outline-variant p-4">
              <span className="text-title-small text-on-surface">{role}</span>
              <dl className="flex flex-col gap-1.5">
                {cells.map((cell, i) => (
                  <div key={i} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <dt className="text-body-small text-on-surface-variant">{t(`designSystem.security.whoCols.${cols[i + 1]}`)}</dt>
                    <dd>
                      <WhoCell value={cell} />
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
        <Button asChild variant="text" trailingIcon="open_in_new" className="self-start">
          <a href={SECURITY_MD_URL} target="_blank" rel="noopener noreferrer">
            {s('doc')}
            <span className="sr-only"> {t('designSystem.newTab')}</span>
          </a>
        </Button>
      </div>
    </div>
  );
}

/** "Nunca" is a privacy guarantee, shown with an icon and text, never with color alone. */
function WhoCell({ value }: { value: string }) {
  const never = value.startsWith('Nunca');
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-body-medium', never ? 'text-on-surface-variant' : 'text-on-surface')}>
      <Icon name={never ? 'visibility_off' : 'visibility'} size={16} className={never ? 'text-on-surface-variant' : 'text-primary'} />
      {value}
    </span>
  );
}
