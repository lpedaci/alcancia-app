import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { MoneyText } from '@/components/money/MoneyText';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Fuerte } from '@/features/companion/Fuerte';
import { FuerteMessage } from '@/features/companion/FuerteMessage';
import { D, priceIndex } from '@/lib/finance';
import { cn } from '@/lib/utils';
import { PILOT } from './pilot-fixture';
import { WalletShell } from './WalletShell';

/**
 * P1 · Inicio de la cuenta (CLAUDE.md 6), visual pilot with Mariana at level 6 (step 4). Layout
 * from the references (docs/visual-audit.md): greeting with Fuerte (Educo), date and time actions
 * on the right (Avenra), balance and quick actions, next unlock with progress (Cognify), recent
 * movements with an icon in a circle (Coursify) and the mission panel as a fixed right column.
 */
const QUICK_ACTIONS: { key: string; icon: IconName; to: string }[] = [
  { key: 'transfer', icon: 'send_money', to: '/app/pay/transfer' },
  { key: 'qr', icon: 'qr_code_scanner', to: '/app/pay/qr' },
  { key: 'bills', icon: 'receipt_long', to: '/app/pay/bills' },
  { key: 'pockets', icon: 'savings', to: '/app/save/pockets' },
];

const card = 'flex min-w-0 flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';

export function WalletHomePage() {
  const { t } = useTranslation();
  const power = D(PILOT.balance).div(priceIndex(PILOT.day, PILOT.monthlyInflation));
  const totalPockets = PILOT.pockets.reduce((sum, p) => sum.plus(p.amount), D(0));

  const missionPanel = (
    <div className="flex flex-col gap-(--space-bento-gap) large:sticky large:top-22">
      <section aria-labelledby="mission-title" className={cn(card, 'hidden large:flex')}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-label-medium text-primary">{t('wallet.home.mission.kicker')}</p>
          <span className="text-label-medium text-on-surface-variant">{t('wallet.home.mission.minutes', { count: PILOT.mission.minutes })}</span>
        </div>
        <h2 id="mission-title" className="text-title-medium text-on-surface">{PILOT.mission.title}</h2>
        <p className="text-body-medium text-on-surface-variant">{t('wallet.home.mission.objective')}</p>
        <ProgressBar
          value={(PILOT.mission.step / PILOT.mission.steps) * 100}
          label={t('wallet.home.mission.progress')}
          valueText={t('wallet.home.mission.stepOf', { step: PILOT.mission.step, steps: PILOT.mission.steps })}
        />
        <Button asChild trailingIcon="arrow_forward" fullWidth>
          <Link to={`/app/missions/${PILOT.mission.id}`}>{t('wallet.home.mission.continue')}</Link>
        </Button>
      </section>
      <FuerteMessage state="thinking" lights={PILOT.completedLevels} size={3.5}>
        {t('wallet.home.mission.fuerte')}
      </FuerteMessage>
      <section aria-labelledby="why-title" className="rounded-xl bg-info-container p-(--space-card-padding) text-on-info-container">
        <h2 id="why-title" className="flex items-center gap-2 text-title-small">
          <Icon name="lightbulb" size={20} className="text-info" />
          {t('wallet.home.why.title')}
        </h2>
        <p className="mt-1 text-body-medium">{t('wallet.home.why.body')}</p>
      </section>
    </div>
  );

  return (
    <WalletShell section={t('wallet.nav.home')} aside={missionPanel} completedLevels={PILOT.completedLevels} personName={PILOT.personName}>
      <div className="flex flex-col gap-(--space-bento-gap)">
        {/* Phones and tablets: the active mission is a fixed card above the content (5.3); it opens as a bottom sheet in step 6 */}
        <Link
          to={`/app/missions/${PILOT.mission.id}`}
          className="flex items-center gap-3 rounded-xl border border-primary bg-surface-container-lowest p-3 large:hidden"
        >
          <IconTile icon="flag" size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block text-label-medium text-primary">{t('wallet.home.mission.kicker')} · {t('wallet.home.mission.stepOf', { step: PILOT.mission.step, steps: PILOT.mission.steps })}</span>
            <span className="block truncate text-title-small text-on-surface">{PILOT.mission.title}</span>
          </span>
          <Icon name="keyboard_arrow_up" className="text-on-surface-variant" />
        </Link>

        {/* Greeting (2.2.1, pattern 2) with Fuerte instead of an illustration */}
        <section aria-labelledby="home-title" className="flex flex-col gap-4 rounded-xl bg-primary-container p-(--space-card-padding) text-on-primary-container md:flex-row md:items-center">
          <div className="hidden md:block">
            <Fuerte state="greeting" lights={PILOT.completedLevels} size={6.5} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="text-body-small">
              <time dateTime={PILOT.dateIso}>{t('wallet.home.date')}</time> · {t('wallet.home.day', { day: PILOT.day })}
            </p>
            <h1 id="home-title" className="text-headline-small">
              {t('wallet.home.hello')} <span className="text-primary">{PILOT.firstName}</span>
            </h1>
            <p className="text-body-medium">{t('wallet.home.fuerteLine')}</p>
            <ul className="mt-1 flex flex-wrap gap-2" aria-label={t('wallet.home.context')}>
              <li className="rounded-full bg-surface-container-lowest px-3 py-1 text-label-medium text-on-surface">
                {t('wallet.home.chipLevel', { level: PILOT.currentLevel })}
              </li>
              <li className="rounded-full bg-tertiary-container px-3 py-1 text-label-medium text-on-tertiary-container">
                {t('wallet.home.chipNext')}
              </li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-2 md:flex-col md:items-stretch">
            <Button variant="tonal" size="s" leadingIcon="skip_next">{t('wallet.home.advance.day')}</Button>
            <Button variant="outlined" size="s" leadingIcon="fast_forward">{t('wallet.home.advance.week')}</Button>
            <Button variant="outlined" size="s" leadingIcon="calendar_month">{t('wallet.home.advance.month')}</Button>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-(--space-bento-gap) expanded:grid-cols-2">
          {/* Balance */}
          <section aria-labelledby="balance-title" className={cn(card, '@container')}>
            <div className="flex items-start justify-between gap-2">
              <h2 id="balance-title" className="text-title-small text-on-surface-variant">{t('wallet.home.balance.title')}</h2>
              <IconTile icon="account_balance_wallet" size="sm" />
            </div>
            <p className="text-display-small text-on-surface">
              <MoneyText value={PILOT.balance} compactBelow="xs" />
            </p>
            <p className="flex flex-wrap items-center gap-2 text-body-small text-on-surface-variant">
              <span className="inline-flex items-center gap-1 rounded-full bg-warning-container px-2 py-0.5 text-label-medium text-on-warning-container">
                <Icon name="trending_down" size={16} className="text-warning" />
                {t('wallet.home.balance.power')}
              </span>
              <MoneyText value={power} className="text-label-large text-on-surface" />
            </p>
            <dl className="grid grid-cols-1 gap-1 border-t border-outline-variant pt-3 text-body-small">
              <div className="flex flex-wrap justify-between gap-x-3">
                <dt className="text-on-surface-variant">{t('wallet.home.balance.alias')}</dt>
                <dd className="truncate text-on-surface">{PILOT.alias}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-x-3">
                <dt className="text-on-surface-variant">{t('wallet.home.balance.cvu')}</dt>
                <dd className="text-on-surface tabular-nums">{PILOT.cvu}</dd>
              </div>
            </dl>
          </section>

          {/* Quick actions and pockets */}
          <section aria-labelledby="actions-title" className={cn(card, '@container')}>
            <h2 id="actions-title" className="text-title-small text-on-surface-variant">{t('wallet.home.actions.title')}</h2>
            <ul className="grid grid-cols-2 gap-2 @sm:grid-cols-4">
              {QUICK_ACTIONS.map((a) => (
                <li key={a.key}>
                  <Link to={a.to} className="flex min-h-12 flex-col items-center gap-1 rounded-lg p-2 text-center text-label-medium text-on-surface hover:bg-surface-container">
                    <span className="inline-flex size-10 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                      <Icon name={a.icon} />
                    </span>
                    {t(`wallet.home.actions.${a.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 border-t border-outline-variant pt-3">
              <div className="flex items-center justify-between gap-2 text-body-small">
                <span className="text-on-surface-variant">{t('wallet.home.pockets.total')}</span>
                <MoneyText value={totalPockets} className="text-label-large text-on-surface" />
              </div>
              {PILOT.pockets.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2 text-body-medium">
                  <span className="flex min-w-0 items-center gap-2">
                    <Icon name={p.icon} size={18} className="text-tertiary" />
                    <span className="truncate">{p.name}</span>
                  </span>
                  <MoneyText value={p.amount} />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Next unlock: what is missing, with progress (5.0) */}
        <section aria-labelledby="unlock-title" className={card}>
          <div className="flex items-start gap-3">
            <IconTile icon="lock" tone="neutral" />
            <div className="min-w-0 flex-1">
              <p className="text-label-medium text-on-surface-variant">{t('wallet.home.unlock.kicker')}</p>
              <h2 id="unlock-title" className="text-title-medium text-on-surface">{t('wallet.home.unlock.title')}</h2>
              <p className="text-body-medium text-on-surface-variant">{t('wallet.home.unlock.body')}</p>
            </div>
            <Link
              to="/app/save/pockets"
              aria-label={t('wallet.home.unlock.go')}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-outline-variant text-on-surface hover:bg-surface-container"
            >
              <Icon name="arrow_outward" />
            </Link>
          </div>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <li className="flex flex-col gap-2">
              <ProgressBar
                value={(PILOT.emergency.months / PILOT.emergency.monthsTarget) * 100}
                label={t('wallet.home.unlock.emergency')}
                valueText={t('wallet.home.unlock.monthsOf', { months: PILOT.emergency.months, goal: PILOT.emergency.monthsTarget })}
                tone="tertiary"
              />
            </li>
            <li className="flex items-center gap-2 text-body-medium text-on-surface">
              <Icon name="check_circle" filled className="text-success" />
              {t('wallet.home.unlock.challengeDone')}
            </li>
            <li className="flex items-center gap-2 text-body-medium text-on-surface">
              <Icon name="check_circle" filled className="text-success" />
              {t('wallet.home.unlock.noDebt')}
            </li>
            <li className="flex items-center gap-2 text-body-medium text-on-surface">
              <Icon name="radio_button_unchecked" className="text-on-surface-variant" />
              {t('wallet.home.unlock.profile')}
            </li>
          </ul>
        </section>

        {/* Recent movements */}
        <section aria-labelledby="movements-title" className={cn(card, '@container')}>
          <div className="flex items-center justify-between gap-2">
            <h2 id="movements-title" className="text-title-medium text-on-surface">{t('wallet.home.movements.title')}</h2>
            <Button variant="text" size="xs" trailingIcon="chevron_right">{t('wallet.home.movements.all')}</Button>
          </div>
          <ul className="flex flex-col divide-y divide-outline-variant">
            {PILOT.movements.map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-3">
                <span className={cn('inline-flex size-10 shrink-0 items-center justify-center rounded-full', D(m.amount).isNegative() ? 'bg-surface-container text-on-surface-variant' : 'bg-tertiary-container text-on-tertiary-container')}>
                  <Icon name={m.icon} />
                </span>
                {/* Narrow cards: the amount goes under the name, so the name never gets squeezed (2.7) */}
                <span className="flex min-w-0 flex-1 flex-col gap-1 @sm:flex-row @sm:items-center @sm:gap-3">
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 block text-body-medium text-on-surface">{m.counterparty}</span>
                    <span className="block text-body-small text-on-surface-variant">{m.date}</span>
                  </span>
                  <MoneyText value={m.amount} trend className="text-label-large text-on-surface" />
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </WalletShell>
  );
}
