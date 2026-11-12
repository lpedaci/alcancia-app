import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import { FuerteMessage } from '@/features/companion/FuerteMessage';
import { PILOT } from '@/features/wallet/pilot-fixture';
import { WalletShell } from '@/features/wallet/WalletShell';
import { InflationSimulator } from './InflationSimulator';

/** P13 · SIM-3 inside the wallet (Aprender > Herramientas), visual pilot (step 4). */
export function InflationToolPage() {
  const { t } = useTranslation();
  return (
    <WalletShell section={t('wallet.nav.learn')} completedLevels={PILOT.completedLevels} personName={PILOT.personName}>
      <div className="flex flex-col gap-4">
        <nav aria-label={t('wallet.breadcrumbs')} className="text-body-small text-on-surface-variant">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link to="/app/learn" className="underline-offset-4 hover:underline">{t('wallet.nav.learn')}</Link>
            </li>
            <li aria-hidden><Icon name="chevron_right" size={16} /></li>
            <li>
              <Link to="/app/tools" className="underline-offset-4 hover:underline">{t('wallet.sub.tools')}</Link>
            </li>
            <li aria-hidden><Icon name="chevron_right" size={16} /></li>
            <li aria-current="page" className="text-on-surface">{t('sim3.title')}</li>
          </ol>
        </nav>
        <p className="max-w-prose text-body-large text-on-surface-variant">{t('sim3.intro')}</p>
        <FuerteMessage state="neutral" lights={PILOT.completedLevels} size={3} className="max-w-xl">
          {t('sim3.fuerte')}
        </FuerteMessage>
        <InflationSimulator headingLevel="h1" title={t('sim3.title')} idPrefix="p13-sim3" />
      </div>
    </WalletShell>
  );
}
