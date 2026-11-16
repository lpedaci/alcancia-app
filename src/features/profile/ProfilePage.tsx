import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { MoneyInput } from '@/components/money/MoneyInput';
import { MoneyText } from '@/components/money/MoneyText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SegmentedButton } from '@/components/ui/SegmentedButton';
import { StatusPill } from '@/components/ui/StatusPill';
import { toast } from '@/components/ui/toast-store';
import { findPerson } from '@/features/auth/auth-service';
import { AccountData } from '@/features/onboarding/AccountData';
import { WalletShell } from '@/features/wallet/WalletShell';
import { MIN_DAILY_LIMIT, paidToday, setDailyLimit, setTwoFactor } from '@/features/wallet/engine/engine';
import { walletDate } from '@/lib/dates';
import { formatMoney, parseDecimalInput } from '@/lib/money';
import { type FuertePresence, readLocal, writeLocal } from '@/store/local-store';
import { useCurrentUser } from '@/store/session-store';
import { clearWallet, useWallet } from '@/store/wallet-store';
import { fuerteLine } from '@/features/companion/fuerte-lines';
import { WhyMatters } from '@/features/learning-cards/WhyMatters';
import { clearReturnState } from '@/lib/use-return-state';

/**
 * P14, profile, security and receipts (CLAUDE.md 5.3, information-architecture.md): the practice
 * account data (all fictitious), the security settings of the wallet, the presence of Fuerte
 * (5.0.1) and the summary of each closed month. "Empezar de cero" goes back to the person's
 * starting state, with confirmation. Everything here stays in the person's browser (D-58).
 */
const LIMITS = ['100000.00', '300000.00', '500000.00'] as const;
const PRESENCES: FuertePresence[] = ['chatty', 'important', 'silent'];
const MONTH_NAMES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** "ago 2026": months in words (2.9), from the first day of the simulated month. */
function monthLabel(month: number) {
  const iso = walletDate(month * 30 + 1);
  const [year, mm] = iso.split('-');
  return `${MONTH_NAMES[Number(mm) - 1]} ${year}`;
}

export function ProfilePage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const person = findPerson(personId);
  const [wallet, setWallet] = useWallet(personId);
  const [presence, setPresence] = useState<FuertePresence>(() => readLocal(personId).fuertePresence ?? 'chatty');
  const [confirmReset, setConfirmReset] = useState(false);
  const security = wallet.securitySettings;
  // Own limit, at least $ 1.000 (D-222); the error appears only after trying to save
  const [ownLimit, setOwnLimit] = useState('');
  const [limitError, setLimitError] = useState<string | undefined>();
  const saveOwnLimit = () => {
    const parsed = parseDecimalInput(ownLimit);
    if (!parsed || Number(parsed) < Number(MIN_DAILY_LIMIT)) {
      setLimitError(t('profile.security.limitTooLow', { min: formatMoney(MIN_DAILY_LIMIT, { decimals: 0 }) }));
      return;
    }
    setWallet((w) => setDailyLimit(w, parsed));
    setLimitError(undefined);
    setOwnLimit('');
    toast.success(t('profile.security.limitSaved'));
  };
  const card = 'flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';

  const changePresence = (value: FuertePresence) => {
    setPresence(value);
    writeLocal(personId, (d) => ({ ...d, fuertePresence: value }));
    toast.success(t('profile.fuerte.saved'));
  };

  return (
    <WalletShell section={t('profile.section')} fuerte={{ state: 'neutral', message: fuerteLine('profile.fuerteLine') }}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) large:grid-cols-2 large:items-stretch">
        <header className="flex items-center gap-4 large:col-span-2">
          {person && <Avatar name={person.name} role={person.role} personId={person.id} size="xl" />}
          <div className="min-w-0 flex-1">
            <h1 className="text-headline-medium text-on-surface">{person?.name}</h1>
            <p className="text-body-large text-on-surface-variant">{person?.jobOrProgram}</p>
          </div>
          <WhyMatters screen="profile" className="ml-auto self-start" />
        </header>

        <section aria-labelledby="profile-account" className={card}>
          <h2 id="profile-account" className="text-title-large text-on-surface">
            {t('profile.account')}
          </h2>
          <AccountData name={person?.name ?? ''} />
          <p className="text-body-small text-on-surface-variant">{t('profile.accountNote')}</p>
          <Button asChild variant="text" className="self-start" leadingIcon="person">
            <Link to="/app/welcome">{t('profile.conocerte')}</Link>
          </Button>
        </section>

        <section aria-labelledby="profile-security" className={card}>
          <h2 id="profile-security" className="text-title-large text-on-surface">
            {t('profile.security.title')}
          </h2>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-title-small text-on-surface">{t('profile.security.twoFactor')}</p>
              <p className="text-body-small text-on-surface-variant">{t('profile.security.twoFactorHelp')}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusPill
                tone={security.twoFactor ? 'success' : 'warning'}
                icon={security.twoFactor ? 'check_circle' : 'error'}
                label={security.twoFactor ? t('profile.security.on') : t('profile.security.off')}
              />
              <Button
                variant="outlined"
                size="xs"
                onClick={() => {
                  setWallet((w) => setTwoFactor(w, !security.twoFactor));
                  toast.success(security.twoFactor ? t('profile.security.disabled') : t('profile.security.enabled'));
                }}
              >
                {security.twoFactor ? t('profile.security.disable') : t('profile.security.enable')}
              </Button>
            </div>
          </div>
          {!security.twoFactor && <p className="text-body-small text-on-surface-variant">{t('profile.security.offNote')}</p>}
          <div className="flex flex-col gap-3 border-t border-outline-variant pt-4">
            <div className="flex flex-col gap-1">
              <p className="text-title-small text-on-surface">{t('profile.security.limit')}</p>
              <p className="text-body-small text-on-surface-variant">{t('profile.security.limitWhat')}</p>
            </div>
            <SegmentedButton
              label={t('profile.security.limit')}
              value={security.dailyLimit ?? ''}
              onValueChange={(value) => {
                if (!value) return;
                setWallet((w) => setDailyLimit(w, value));
                toast.success(t('profile.security.limitSaved'));
              }}
              options={LIMITS.map((value) => ({ value, label: t('profile.security.limitOption', { amount: formatMoney(value, { decimals: 0 }) }) }))}
            />
            <div className="flex flex-wrap items-start gap-3">
              <MoneyInput
                label={t('profile.security.limitOwn')}
                helperText={t('profile.security.limitOwnHelp', { min: formatMoney(MIN_DAILY_LIMIT, { decimals: 0 }) })}
                value={ownLimit}
                onChange={(e) => {
                  setOwnLimit(e.target.value);
                  if (limitError) setLimitError(undefined);
                }}
                error={limitError}
                className="min-w-0 flex-1 basis-48"
              />
              <Button variant="tonal" className="mt-7 shrink-0" onClick={saveOwnLimit}>
                {t('profile.security.limitSave')}
              </Button>
            </div>
            {security.dailyLimit ? (
              <div className="flex flex-col gap-1.5">
                <ProgressBar
                  value={Math.min(100, paidToday(wallet).div(security.dailyLimit).times(100).toNumber())}
                  label={t('profile.security.limitUsedLabel')}
                  valueText={t('profile.security.limitUsed', { used: formatMoney(paidToday(wallet).toFixed(2)), limit: formatMoney(security.dailyLimit, { decimals: 0 }) })}
                />
                <p className="text-body-small text-on-surface-variant">{t('profile.security.limitReset')}</p>
              </div>
            ) : (
              <p className="text-body-small text-on-surface-variant">{t('profile.security.limitNone')}</p>
            )}
          </div>
        </section>

        <section aria-labelledby="profile-receipts" className={`${card} large:col-span-2`}>
          <h2 id="profile-receipts" className="text-title-large text-on-surface">
            {t('profile.receipts.title')}
          </h2>
          {wallet.monthSummaries.length === 0 ? (
            <p className="text-body-medium text-on-surface-variant">{t('profile.receipts.empty')}</p>
          ) : (
            <ul className="grid grid-fill-3 gap-3">
              {[...wallet.monthSummaries].reverse().map((m) => (
                <li key={m.month} className="@container flex min-w-0 flex-col gap-3 rounded-lg bg-surface-container px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-title-small text-on-surface">{monthLabel(m.month)}</p>
                    <StatusPill
                      tone={m.green ? 'success' : 'warning'}
                      icon={m.green ? 'check_circle' : 'schedule'}
                      label={m.green ? t('profile.receipts.green') : t('profile.receipts.notGreen')}
                    />
                  </div>
                  <dl className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-4 gap-y-2 text-body-small @xl:grid-cols-4">
                    {(
                      [
                        ['income', m.income],
                        ['needs', m.needs],
                        ['wants', m.wants],
                        ['saved', m.saved],
                      ] as const
                    ).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <dt className="text-on-surface-variant">{t(`profile.receipts.${key}`)}</dt>
                        <dd className="text-label-large text-on-surface">
                          <MoneyText value={value} className="tabular-nums" />
                        </dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ul>
          )}
          <p className="text-body-small text-on-surface-variant">{t('profile.receipts.note')}</p>
        </section>

        {/* F16 (D-320): what the platform keeps, the download of one's data and the requests of Ley 25.326 */}
        <section aria-labelledby="profile-privacy" className={card}>
          <h2 id="profile-privacy" className="text-title-large text-on-surface">
            {t('privacy.title')}
          </h2>
          <p className="text-body-medium text-on-surface-variant">{t('privacy.profileBody')}</p>
          <Button asChild variant="tonal" leadingIcon="shield" className="w-full medium:w-auto medium:self-start">
            <Link to="/app/profile/privacy">{t('privacy.open')}</Link>
          </Button>
        </section>
        <section aria-labelledby="profile-reset" className={card}>
          <h2 id="profile-reset" className="text-title-large text-on-surface">
            {t('profile.reset.title')}
          </h2>
          <p className="text-body-medium text-on-surface-variant">{t('profile.reset.body')}</p>
          <Button variant="outlined" className="self-start" leadingIcon="restart_alt" onClick={() => setConfirmReset(true)}>
            {t('profile.reset.action')}
          </Button>
        </section>
        <section aria-labelledby="profile-fuerte" className={card}>
          <h2 id="profile-fuerte" className="text-title-large text-on-surface">
            {t('profile.fuerte.title')}
          </h2>
          <SegmentedButton
            label={t('profile.fuerte.label')}
            value={presence}
            onValueChange={(value) => value && changePresence(value as FuertePresence)}
            options={PRESENCES.map((value) => ({ value, label: t(`profile.fuerte.options.${value}`) }))}
          />
          <p className="text-body-medium text-on-surface-variant">{t(`profile.fuerte.help.${presence}`)}</p>
        </section>

      </div>
      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title={t('profile.reset.confirmTitle')}
        description={t('profile.reset.confirmBody')}
        confirmLabel={t('profile.reset.action')}
        onConfirm={() => {
          clearWallet(personId);
          clearReturnState(personId);
          writeLocal(personId, (d) => ({ ...d, missionRuns: {} }));
          toast.success(t('profile.reset.done'));
        }}
      />
    </WalletShell>
  );
}
