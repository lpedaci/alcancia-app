import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import { FuerteMessage } from '@/features/companion/FuerteMessage';
import { PILOT } from '@/features/wallet/pilot-fixture';
import { WalletShell } from '@/features/wallet/WalletShell';
import { InflationSimulator } from './InflationSimulator';

/**
 * P13 · SIM-3 inside the wallet (Aprender > Herramientas). The page h1 comes first, then the
 * description and Fuerte. With a session, the amount starts with the practice salary (F4); the
 * pilot takes it from the fixture until the wallet engine exists (step 6).
 */
export function InflationToolPage() {
  const { t } = useTranslation();
  const salary = PILOT.movements.find((m) => m.kind === 'income')?.amount ?? '1284958.86';
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
        <h1 id="p13-sim3-title" className="text-headline-small text-on-surface">
          {t('sim3.title')}
        </h1>
        <p className="max-w-prose text-body-large text-on-surface-variant">{t('sim3.intro')}</p>
        <FuerteMessage state="neutral" lights={PILOT.completedLevels} size={3} className="max-w-xl">
          {t('sim3.fuerte')}
        </FuerteMessage>
        <InflationSimulator
          labelledBy="p13-sim3-title"
          idPrefix="p13-sim3"
          initialAmount={salary}
          amountHelp={t('sim3.amount.helpSalary')}
        />
      </div>
    </WalletShell>
  );
}
