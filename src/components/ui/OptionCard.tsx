import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { IconName } from './Icon';
import { IconTile } from './IconTile';
import { StatusPill } from './StatusPill';

export interface OptionFact {
  label: string;
  value: ReactNode;
  /** A short note under the value (for example, that the rate varies each day). */
  caption?: string;
}

interface OptionCardProps {
  icon: IconName;
  title: string;
  /** The fact the options are compared by (the example rate), shown larger. */
  highlight: OptionFact;
  /** The rest of the standard sheet (risk, liquidity, currency, protection: 1.1.1). */
  facts: OptionFact[];
  selected?: boolean;
  /** Text of the pill on the selected option, so the state is not only color (2.1.1). */
  selectedLabel: string;
  /** The action to choose it; hidden on the selected option. */
  action?: ReactNode;
  as?: 'li' | 'div';
  className?: string;
}

/**
 * Option card (D-218): one option among several to compare side by side before choosing.
 * Same anatomy in every option, so the eye compares row by row: icon, name, the key fact
 * larger, the standard sheet with aligned labels and the action at the bottom. The selected
 * one goes on the primary container with its border and a pill with a check; no shadow (2.5).
 * Labels and values stack when the card is narrow (container query, 2.7).
 */
export function OptionCard({
  icon,
  title,
  highlight,
  facts,
  selected = false,
  selectedLabel,
  action,
  as: Tag = 'div',
  className,
}: OptionCardProps) {
  return (
    <Tag
      className={cn(
        '@container flex min-w-0 flex-col gap-4 rounded-lg border p-4 transition-colors duration-150',
        selected
          ? 'border-primary bg-primary-container/40 ring-1 ring-inset ring-primary'
          : 'border-outline-variant bg-surface-container-lowest hover:border-outline',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <IconTile icon={icon} tone={selected ? 'primary' : 'secondary'} size="sm" />
        {selected && <StatusPill tone="primary" icon="check" label={selectedLabel} />}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-title-medium text-on-surface">{title}</h3>
        <p className="text-label-medium text-on-surface-variant">{highlight.label}</p>
        <p className="text-title-large text-on-surface tabular-nums">{highlight.value}</p>
        {highlight.caption && <p className="text-body-small text-on-surface-variant">{highlight.caption}</p>}
      </div>
      <dl className={cn('flex flex-col divide-y border-y', selected ? 'divide-primary/25 border-primary/25' : 'divide-outline-variant border-outline-variant')}>
        {facts.map((fact) => (
          <div key={fact.label} className="grid gap-0.5 py-2 @min-[17rem]:grid-cols-[6rem_minmax(0,1fr)] @min-[17rem]:gap-3">
            <dt className="text-label-medium text-on-surface-variant">{fact.label}</dt>
            <dd className="text-body-small text-on-surface">{fact.value}</dd>
          </div>
        ))}
      </dl>
      {!selected && action && <div className="mt-auto">{action}</div>}
    </Tag>
  );
}
