import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/components/ui/toast-store';
import { useNavigate } from 'react-router';
import { MoneyText } from '@/components/money/MoneyText';
import { SkipLink } from '@/components/layout/InPageLink';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { findPerson } from '@/features/auth/auth-service';
import { formatMoney, formatNumber } from '@/lib/money';
import { useCurrentUser } from '@/store/session-store';
import { useWallet } from '@/store/wallet-store';
import { useOrgData } from '@/store/data-store';
import { formatDate } from '@/lib/dates';
import { deriveStatements, partnerEvents } from '@/lib/xapi';
import { FictitiousBrandChip } from './FictitiousBrandChip';
import { HorneroMark } from './HorneroMark';
import { nestSummary } from './nest';
import { enterPartnerMode, exitPartnerMode } from './partner-mode';

const NOTICE_KEY = 'alcancia-hornero-notice';

/** "2.0" → "2", "2.5" → "2,5": months without a useless decimal. */
const monthsText = (months: string) => formatNumber(months, 1).replace(/,0$/, '');

function NestLine({ icon, done, tone = 'brand', children }: { icon: IconName; done: boolean; tone?: 'brand' | 'accent'; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden
        className={
          done
            ? `flex size-10 shrink-0 items-center justify-center rounded-full text-on-partner-hornero ${tone === 'accent' ? 'bg-partner-hornero-accent' : 'bg-partner-hornero'}`
            : 'flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant'
        }
      >
        <Icon name={icon} size={20} />
      </span>
      <p className={done ? 'pt-2 text-body-large text-on-surface' : 'pt-2 text-body-medium text-on-surface-variant'}>{children}</p>
    </li>
  );
}

/**
 * Integrated mode demo (D-75, 5.5): the home of Hornero, a fictitious wallet (D-84), with its own
 * brand built from tokens (D-86) and the "Marca ficticia de demostración" label always in sight
 * (D-87). The brand microcopy of the nest (D-85) lives only here and in the integrated bar.
 * "Abrir Alcancía" opens the person's wallet inside Hornero, with no second sign-in.
 */
export function HorneroPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const [wallet] = useWallet(personId);
  const nest = nestSummary(wallet);
  const firstName = findPerson(personId)?.name.split(' ')[0] ?? '';
  // Events Alcancía sends to the partner (F21, D-272): milestones only, never amounts or scores
  const data = useOrgData();
  const events = partnerEvents(deriveStatements(data, personId)).slice(0, 5);

  // On opening Hornero, a notice says it is a fictitious demo brand (D-246); once per tab.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(NOTICE_KEY)) return;
      sessionStorage.setItem(NOTICE_KEY, '1');
    } catch {
      // Without storage the notice shows on each visit, which is fine.
    }
    toast.info(t('partner.hornero.notice'));
  }, [t]);

  const open = () => {
    enterPartnerMode('hornero');
    navigate('/app');
  };
  const leave = () => {
    exitPartnerMode();
    navigate('/app');
  };

  return (
    <div className="min-h-dvh bg-surface" data-partner="hornero">
      <SkipLink />
      <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface-container-lowest">
        <div className="mx-auto flex max-w-[90rem] flex-wrap items-center gap-x-3 gap-y-2 px-(--space-gutter) py-3 medium:px-6">
          <span className="inline-flex items-center gap-2 text-title-medium text-on-surface">
            <span aria-hidden className="inline-flex size-9 items-center justify-center rounded-lg bg-partner-hornero text-on-partner-hornero">
              <HorneroMark size={24} />
            </span>
            {t('partner.hornero.name')}
          </span>
          <FictitiousBrandChip />
          <span className="flex-1" />
          <Button variant="text" size="xs" leadingIcon="logout" onClick={leave}>
            {t('partner.hornero.leave')}
          </Button>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-[72rem] flex-col gap-6 px-(--space-gutter) pt-6 pb-16 focus:outline-none medium:px-6">
        <div className="flex flex-col gap-2">
          <p className="text-label-large text-on-surface-variant">{t('partner.hornero.practice')}</p>
          <h1 className="text-headline-medium text-partner-hornero">{t('partner.hornero.greeting', { name: firstName })}</h1>
          <p className="text-body-large text-on-surface-variant">{t('partner.hornero.intro')}</p>
        </div>

        <div className="grid gap-(--space-bento-gap) medium:grid-cols-2">
          {/* Saving layer: the nest is built little by little */}
          <section aria-labelledby="nest-saving" className="flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
            <h2 id="nest-saving" className="text-title-large text-on-surface">
              {t('partner.hornero.savingTitle')}
            </h2>
            <div className="flex flex-col gap-1 rounded-lg bg-partner-hornero-container p-4 text-partner-on-hornero-container">
              <p className="text-label-large">{t('partner.hornero.savingLabel')}</p>
              <MoneyText value={nest.total} className="text-headline-small sm:text-display-small" />
            </div>
            <ul className="flex flex-col gap-3">
              <NestLine icon="trending_up" done={nest.grewThisMonth.gt(0)}>
                {nest.grewThisMonth.gt(0)
                  ? t('partner.hornero.grew', { amount: formatMoney(nest.grewThisMonth) })
                  : t('partner.hornero.grewNone')}
              </NestLine>
              {nest.lastAddition && (
                <NestLine icon="savings" done>
                  {t('partner.hornero.added', { amount: formatMoney(nest.lastAddition) })}
                </NestLine>
              )}
            </ul>
          </section>

          {/* Solidity layer: the nest holds (emergency fund, security, scams) */}
          <section aria-labelledby="nest-solid" className="flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
            <h2 id="nest-solid" className="text-title-large text-on-surface">
              {t('partner.hornero.solidityTitle')}
            </h2>
            <ul className="flex flex-col gap-3">
              <NestLine icon="shield" tone="accent" done={Boolean(nest.monthsCovered && Number(nest.monthsCovered) > 0)}>
                {nest.monthsCovered && Number(nest.monthsCovered) > 0
                  ? t('partner.hornero.holds', { count: Number(nest.monthsCovered), months: monthsText(nest.monthsCovered) })
                  : t('partner.hornero.holdsNone')}
              </NestLine>
              <NestLine icon="verified_user" tone="accent" done={nest.resisted}>
                {nest.resisted ? t('partner.hornero.resisted') : t('partner.hornero.resistedNone')}
              </NestLine>
            </ul>
          </section>
        </div>

        <section aria-labelledby="nest-learn" className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding) medium:flex-row medium:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h2 id="nest-learn" className="text-title-large text-on-surface">
              {t('partner.hornero.learnTitle')}
            </h2>
            <p className="text-body-medium text-on-surface-variant">{t('partner.hornero.learnBody')}</p>
          </div>
          <Button size="m" leadingIcon="savings" onClick={open} className="shrink-0">
            {t('partner.hornero.open')}
          </Button>
        </section>

        <section aria-labelledby="nest-events" className="flex min-w-0 flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
          <h2 id="nest-events" className="text-title-large text-on-surface">
            {t('partner.hornero.eventsTitle')}
          </h2>
          <p className="text-body-medium text-on-surface-variant">{t('partner.hornero.eventsBody')}</p>
          {events.length === 0 ? (
            <p className="flex items-start gap-2 rounded-lg bg-surface-container p-4 text-body-medium text-on-surface-variant">
              <Icon name="info" size={20} className="mt-0.5 shrink-0" />
              {t('partner.hornero.eventsEmpty')}
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-outline-variant">
              {events.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2">
                  <span className="flex min-w-0 items-center gap-3 text-body-medium text-on-surface">
                    <Icon name="task_alt" size={20} className="shrink-0 text-tertiary" />
                    <span className="min-w-0">
                      {t(`partner.hornero.event.${e.object.definition.type}`, { name: e.object.definition.name['es-AR'] })}
                    </span>
                  </span>
                  <span className="text-body-small text-on-surface-variant tabular-nums">{formatDate(e.timestamp.slice(0, 10))}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="flex items-start gap-2 text-body-small text-on-surface-variant">
          <Icon name="lock" size={16} className="mt-0.5 shrink-0" />
          {t('partner.hornero.privacy')}
        </p>
      </main>
    </div>
  );
}
