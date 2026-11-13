import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

type Tone = 'token' | 'use' | 'check';
const TONE: Record<Tone, string> = {
  token: 'border-primary/40 bg-primary-container text-on-primary-container',
  use: 'border-tertiary/40 bg-tertiary-container text-on-tertiary-container',
  check: 'border-success/40 bg-success-container text-on-success-container',
};

function Group({ title, items, tone, className }: { title: string; items: string[][]; tone: Tone; className?: string }) {
  return (
    <section className={cn('flex min-w-0 flex-col gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4', className)}>
      <h3 className="text-title-small text-on-surface">{title}</h3>
      <ul className="flex flex-col gap-2">
        {items.map(([name, note]) => (
          <li key={name} className={cn('flex min-w-0 flex-col gap-0.5 rounded-md border px-3 py-2', TONE[tone])}>
            <code className="break-words text-label-large">{name}</code>
            <span className="text-body-small opacity-80">{note}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Arrow between two tiers: down on phones and tablets, right from 1024 px. */
function Arrow() {
  return (
    <div aria-hidden className="flex items-center justify-center py-1 text-on-surface-variant lg:px-1 lg:py-0">
      <Icon name="arrow_downward" size={20} className="lg:hidden" />
      <Icon name="arrow_forward" size={20} className="hidden lg:block" />
    </div>
  );
}

/**
 * Token tiers (G8, D-199): reference → system → Tailwind theme → components, with the automatic
 * checks under them. Drawn with the system's own tokens, as in Rumbo.
 */
export function TokenTiersFigure() {
  const { t } = useTranslation();
  const tier = (key: string) => t(`designSystem.tiers.${key}`, { returnObjects: true }) as { title: string; items: string[][] };
  return (
    <figure className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
      <div className="grid grid-cols-[minmax(0,1fr)] items-stretch lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]">
        <Group {...tier('ref')} tone="token" />
        <Arrow />
        <Group {...tier('sys')} tone="token" />
        <Arrow />
        <Group {...tier('theme')} tone="token" />
        <Arrow />
        <Group {...tier('comp')} tone="use" />
      </div>
      <Group {...tier('qa')} tone="check" className="sm:[&>ul]:flex-row sm:[&>ul>li]:flex-1" />
      <figcaption className="text-body-small text-on-surface-variant">{t('designSystem.tiers.caption')}</figcaption>
    </figure>
  );
}
