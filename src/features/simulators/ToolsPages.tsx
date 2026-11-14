import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { useLevels } from '@/features/levels/use-levels';
import { NotFoundPage } from '@/features/system/NotFoundPage';
import { WalletShell } from '@/features/wallet/WalletShell';
import { useCurrentUser } from '@/store/session-store';
import { useWallet } from '@/store/wallet-store';
import { GenericSimulator } from './GenericSimulator';
import { simById, TOOL_IDS, TOOL_LEVEL } from './defs';
import { fuerteLine } from '@/features/companion/fuerte-lines';

/**
 * P13, Herramientas (CLAUDE.md F4, D-176): the 12 tools together under Aprender, grouped by the
 * section where they are also used. They can be explored at any level: they are learning aids, and
 * their numbers are examples or the person's own practice data, never current rates.
 */
const ICONS: Record<string, IconName> = { 'SIM-3': 'trending_down' };

export function ToolsPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const { isOpen } = useLevels(user?.personId ?? '');
  const groups = ['level-3', 'level-4', 'level-5', 'level-6', 'level-7'];

  return (
    <WalletShell section={t('wallet.nav.learn')} fuerte={{ state: 'neutral', message: fuerteLine('sims.common.fuerte') }}>
      <div className="flex flex-col gap-6">
        <Breadcrumbs current={t('wallet.sub.tools')} />
        <header className="flex flex-col gap-2">
          <h1 className="text-headline-medium text-on-surface">{t('wallet.sub.tools')}</h1>
          <p className="text-body-large text-on-surface-variant">{t('sims.common.intro')}</p>
        </header>
        {groups.map((levelId) => {
          const ids = TOOL_IDS.filter((id) => TOOL_LEVEL[id] === levelId);
          if (ids.length === 0) return null;
          const open = isOpen(levelId);
          return (
            <section key={levelId} aria-labelledby={`tools-${levelId}`} className="flex flex-col gap-3">
              <h2 id={`tools-${levelId}`} className="flex flex-wrap items-center gap-2 text-title-large text-on-surface">
                {t(`wallet.sections.${levelId}`)}
                {!open && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant px-2 py-0.5 text-label-medium text-on-surface-variant">
                    <Icon name="lock" size={16} />
                    {t('sims.common.sectionLocked', { level: levelId.replace('level-', '') })}
                  </span>
                )}
              </h2>
              <ul className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) md:grid-cols-2 large:grid-cols-3">
                {ids.map((id) => (
                  <li key={id}>
                    <Link to={`/app/tools/${id}`} className="group flex h-full flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding) hover:border-primary">
                      <span className="flex items-start justify-between gap-2">
                        <IconTile icon={simById(id)?.icon ?? ICONS[id] ?? 'calculate'} tone="primary" />
                        <Icon name="arrow_forward" size={20} className="text-on-surface-variant transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" />
                      </span>
                      <span className="text-title-medium text-on-surface">{id === 'SIM-3' ? t('sim3.title') : t(`sims.${id}.title`)}</span>
                      <span className="text-body-medium text-on-surface-variant">{id === 'SIM-3' ? t('sims.SIM-3.short') : t(`sims.${id}.short`)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        <p className="text-body-small text-on-surface-variant">{t('sim3.legal')}</p>
      </div>
    </WalletShell>
  );
}

function Breadcrumbs({ current }: { current: string }) {
  const { t } = useTranslation();
  return (
    <nav aria-label={t('wallet.breadcrumbs')} className="text-body-small text-on-surface-variant">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link to="/app/learn" className="underline-offset-4 hover:underline">
            {t('wallet.nav.learn')}
          </Link>
        </li>
        <li aria-hidden>
          <Icon name="chevron_right" size={16} />
        </li>
        {current !== t('wallet.sub.tools') && (
          <>
            <li>
              <Link to="/app/tools" className="underline-offset-4 hover:underline">
                {t('wallet.sub.tools')}
              </Link>
            </li>
            <li aria-hidden>
              <Icon name="chevron_right" size={16} />
            </li>
          </>
        )}
        <li aria-current="page" className="text-on-surface">
          {current}
        </li>
      </ol>
    </nav>
  );
}

/** One tool (P13), with its data preloaded from the person's wallet when it makes sense (F4). */
export function SimToolPage() {
  const { simId = '' } = useParams();
  const { t } = useTranslation();
  const user = useCurrentUser();
  const [wallet] = useWallet(user?.personId ?? '');
  const def = simById(simId);
  if (!def) return <NotFoundPage />;
  const preset = def.preset?.(wallet);
  const titleId = `p13-${def.id}-title`;
  return (
    <WalletShell section={t('wallet.nav.learn')} fuerte={{ state: 'neutral', message: fuerteLine(`sims.${def.id}.fuerte`) }}>
      <div className="flex flex-col gap-4">
        <Breadcrumbs current={t(`sims.${def.id}.title`)} />
        <h1 id={titleId} className="text-headline-medium text-on-surface">
          {t(`sims.${def.id}.title`)}
        </h1>
        <p className="text-body-large text-on-surface-variant">
          {t(`sims.${def.id}.intro`)}
          {preset && Object.keys(preset).length > 0 && ` ${t('sims.common.preset')}`}
        </p>
        <GenericSimulator key={def.id} def={def} preset={preset} labelledBy={titleId} />
      </div>
    </WalletShell>
  );
}
