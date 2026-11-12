import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import { useCurrentUser } from '@/store/session-store';
import { useWallet } from '@/store/wallet-store';
import { WalletShell } from '@/features/wallet/WalletShell';
import { InflationSimulator } from './InflationSimulator';

/**
 * P13 · SIM-3 inside the wallet (Aprender > Herramientas). The page h1 comes first, then the
 * description. With a session, the amount starts with the last practice salary of the wallet (F4,
 * D-142). Fuerte talks from his floating button (D-160).
 */
export function InflationToolPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const [wallet] = useWallet(user?.personId ?? '');
  // F4: inside the wallet the amount starts with the last practice salary (D-142).
  const salary = [...wallet.movements].reverse().find((m) => m.type === 'income')?.amount.replace('-', '') ?? wallet.salary;
  return (
    <WalletShell section={t('wallet.nav.learn')} fuerte={{ state: 'neutral', message: t('sim3.fuerte') }}>
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
        <h1 id="p13-sim3-title" className="text-headline-medium text-on-surface">
          {t('sim3.title')}
        </h1>
        <p className="max-w-prose text-body-large text-on-surface-variant">{t('sim3.intro')}</p>
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
