import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { UnlockCard } from '@/features/levels/UnlockCard';
import { AREA_LEVEL, MISSIONS, useLevels } from '@/features/levels/use-levels';
import { useCurrentUser } from '@/store/session-store';
import { WalletShell } from './WalletShell';

/**
 * Wallet routes whose screens arrive in later steps (CLAUDE.md 10). A locked section never hides:
 * it shows what is missing, with progress (5.0). An open one says honestly in which step it is built.
 */
const STEP: Record<string, number> = {
  pay: 7,
  transfer: 7,
  qr: 7,
  bills: 7,
  budget: 7,
  pockets: 7,
  credit: 8,
  yield: 8,
  invest: 9,
  learn: 7,
  tools: 8,
  mission: 7,
};

export function WalletSectionPage({ area }: { area: string }) {
  const { t } = useTranslation();
  const params = useParams();
  const user = useCurrentUser();
  const { statuses } = useLevels(user?.personId ?? '');
  const key = area === 'pay-flow' ? (params.flow ?? 'pay') : area;
  const levelId = AREA_LEVEL[key];
  const status = levelId ? statuses.find((s) => s.level.id === levelId) : undefined;
  const mission = area === 'mission' ? MISSIONS.find((m) => m.id === params.missionId) : undefined;
  const title = mission?.title ?? (status ? t(`wallet.sections.${status.level.id}`) : t(`wallet.sub.${key}`, { defaultValue: t(`wallet.nav.${key}`) }));
  const section = key === 'learn' || key === 'tools' || key === 'mission' ? t('wallet.nav.learn') : title;

  return (
    <WalletShell section={section}>
      <div className="flex max-w-3xl flex-col gap-6">
        {status && status.status === 'locked' ? (
          <>
            <h1 className="text-headline-small text-on-surface">{t('wallet.placeholder.lockedTitle', { section: title })}</h1>
            <UnlockCard status={status} />
          </>
        ) : (
          <section className="flex flex-col items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
            <span className="flex size-10 items-center justify-center rounded-lg bg-info-container text-on-info-container">
              <Icon name="hourglass_empty" />
            </span>
            <h1 className="text-headline-small text-on-surface">{t('wallet.placeholder.pendingTitle', { section: title, step: STEP[key] ?? 7 })}</h1>
            {mission && <p className="text-body-large text-on-surface">{mission.objective}</p>}
            <p className="text-body-medium text-on-surface-variant">{t('wallet.placeholder.pending', { step: STEP[key] ?? 7 })}</p>
            <Button asChild variant="outlined" leadingIcon="home">
              <Link to="/app">{t('wallet.placeholder.backHome')}</Link>
            </Button>
          </section>
        )}
      </div>
    </WalletShell>
  );
}
