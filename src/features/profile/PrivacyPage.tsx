import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { DEMO_TODAY } from '@/app/config';
import { PRIVACY_DEADLINES, type PrivacyRight, privacyDueDate } from '@/app/legal';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { StatusPill } from '@/components/ui/StatusPill';
import { TextArea } from '@/components/ui/TextArea';
import { toast } from '@/components/ui/toast-store';
import { WalletShell } from '@/features/wallet/WalletShell';
import { formatDate } from '@/lib/dates';
import { collectMyData, exportMyData } from '@/lib/my-data';
import { useDataStore } from '@/store/data-store';
import { readLocal } from '@/store/local-store';
import { useCurrentUser } from '@/store/session-store';
import { readWallet } from '@/store/wallet-store';

/**
 * Mi privacidad (F16, step 33, D-320): what the platform keeps about the person, split in what the
 * organization holds (learning data) and what never leaves her browser; the download of her data
 * (right of access); and requests of access, rectification and deletion with the deadlines of the
 * Ley 25.326 from `src/app/legal.ts`. In the demo nobody answers a request: it shows how it is followed.
 */
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';
const RIGHTS: PrivacyRight[] = ['access', 'rectification', 'deletion'];

export function PrivacyPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const state = useDataStore();
  const add = useDataStore((s) => s.addPrivacyRequest);
  const [right, setRight] = useState<PrivacyRight>('access');
  const [details, setDetails] = useState('');
  const [tried, setTried] = useState(false);
  const local = readLocal(personId);
  const data = collectMyData(personId, state, local, readWallet(personId));
  const requests = (state.privacyRequests ?? []).filter((r) => r.personId === personId).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));

  const download = () => {
    const json = JSON.stringify(exportMyData(personId, state, local, readWallet(personId), DEMO_TODAY), null, 2);
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `alcancia-mis-datos-${DEMO_TODAY}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success(t('privacy.downloaded'));
  };

  const submit = () => {
    setTried(true);
    if (details.trim().length < 10) return;
    add({ id: `privacy-${Date.now().toString(36)}`, personId, right, details: details.trim(), requestedAt: DEMO_TODAY, dueDate: privacyDueDate(right, DEMO_TODAY), status: 'received' });
    setDetails('');
    setTried(false);
    toast.success(t('privacy.sent'));
  };

  const platformRows: [IconName, string, string | number][] = [
    ['psychology', t('privacy.platform.diagnostics'), data.platform.diagnostics],
    ['menu_book', t('privacy.platform.guidesRead'), data.platform.guidesRead],
    ['quiz', t('privacy.platform.challengeAttempts'), data.platform.challengeAttempts],
    ['flag', t('privacy.platform.missionsCompleted'), data.platform.missionsCompleted],
    ['checklist', t('privacy.platform.weeklyReports'), data.platform.weeklyReports],
    ['fact_check', t('privacy.platform.followUps'), data.platform.followUps],
    ['forum', t('privacy.platform.questions'), data.platform.questions],
    ['event', t('privacy.platform.sessionRequests'), data.platform.sessionRequests],
    ['door_front', t('privacy.platform.escape'), data.platform.escape ? t('privacy.yes') : t('privacy.no')],
    ['verified_user', t('privacy.platform.consents'), data.platform.consents],
  ];
  const browserRows: [IconName, string, string | number][] = [
    ['account_balance_wallet', t('privacy.browser.wallet'), data.browser.wallet ? t('privacy.yes') : t('privacy.no')],
    ['psychology', t('privacy.browser.habitAnswers'), data.browser.habitAnswers],
    ['edit_note', t('privacy.browser.reflections'), data.browser.reflections],
    ['savings', t('privacy.browser.goals'), data.browser.goals],
    ['calculate', t('privacy.browser.scenarios'), data.browser.scenarios],
    ['replay', t('privacy.browser.reviews'), data.browser.reviews],
    ['door_front', t('privacy.browser.escape'), data.browser.escape ? t('privacy.yes') : t('privacy.no')],
  ];

  return (
    <WalletShell section={t('privacy.title')} fuerte={{ state: 'neutral', message: t('privacy.fuerte') }}>
      <div className="flex flex-col gap-(--space-section)">
        <header className="flex flex-col gap-2">
          <Link to="/app/profile" className="flex w-fit items-center gap-1 text-label-large text-primary underline-offset-4 hover:underline">
            <Icon name="arrow_back" size={18} />
            {t('privacy.back')}
          </Link>
          <h1 className="text-headline-medium text-on-surface">{t('privacy.title')}</h1>
          <p className="max-w-prose text-body-large text-on-surface-variant">{t('privacy.intro')}</p>
        </header>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) large:grid-cols-2 large:items-start">
          <section aria-labelledby="platform-title" className={card}>
            <div className="flex items-center gap-3">
              <IconTile icon="domain" tone="primary" />
              <h2 id="platform-title" className="text-title-large text-on-surface">
                {t('privacy.platform.title')}
              </h2>
            </div>
            <p className="text-body-medium text-on-surface-variant">{t('privacy.platform.intro')}</p>
            {data.account && (
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 rounded-lg bg-surface-container p-3 sm:grid-cols-2">
                <Row label={t('privacy.account.name')} value={data.account.name} />
                <Row label={t('privacy.account.email')} value={data.account.email} />
                <Row label={t('privacy.account.job')} value={data.account.jobOrProgram} />
                <Row label={t('privacy.account.cohorts')} value={data.account.cohorts.join(', ') || t('privacy.no')} />
              </dl>
            )}
            <Counts rows={platformRows} label={t('privacy.platform.title')} />
          </section>

          <section aria-labelledby="browser-title" className={card}>
            <div className="flex items-center gap-3">
              <IconTile icon="lock" tone="tertiary" />
              <h2 id="browser-title" className="text-title-large text-on-surface">
                {t('privacy.browser.title')}
              </h2>
            </div>
            <p className="text-body-medium text-on-surface-variant">{t('privacy.browser.intro')}</p>
            <Counts rows={browserRows} label={t('privacy.browser.title')} />
            <p className="text-body-small text-on-surface-variant">
              {t('privacy.browser.reset')}{' '}
              <Link to="/app/profile" className="text-primary underline underline-offset-2">
                {t('privacy.browser.resetLink')}
              </Link>
            </p>
          </section>
        </div>

        <section aria-labelledby="download-title" className={card}>
          <div className="flex items-center gap-3">
            <IconTile icon="download" tone="secondary" />
            <h2 id="download-title" className="text-title-large text-on-surface">
              {t('privacy.download.title')}
            </h2>
          </div>
          <p className="max-w-prose text-body-medium text-on-surface-variant">{t('privacy.download.body')}</p>
          <Button variant="tonal" leadingIcon="download" className="w-full medium:w-auto medium:self-start" onClick={download}>
            {t('privacy.download.action')}
          </Button>
        </section>

        <section aria-labelledby="requests-title" className={card}>
          <div className="flex items-center gap-3">
            <IconTile icon="gavel" tone="primary" />
            <h2 id="requests-title" className="text-title-large text-on-surface">
              {t('privacy.requests.title')}
            </h2>
          </div>
          <p className="max-w-prose text-body-medium text-on-surface-variant">{t('privacy.requests.intro')}</p>
          <RadioGroup
            name="privacy-right"
            legend={t('privacy.requests.right')}
            value={right}
            onChange={(e) => setRight(e.target.value as PrivacyRight)}
            options={RIGHTS.map((r) => ({
              value: r,
              label: t(`privacy.rights.${r}.label`),
              description: t(`privacy.rights.${r}.help`, { days: PRIVACY_DEADLINES[r].days }),
            }))}
          />
          <TextArea
            label={t('privacy.requests.details')}
            helperText={t(`privacy.requests.detailsHelp.${right}`)}
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            error={tried && details.trim().length < 10 ? t('privacy.requests.detailsError') : undefined}
          />
          <p className="text-body-small text-on-surface-variant">{t('privacy.requests.due', { date: formatDate(privacyDueDate(right, DEMO_TODAY)) })}</p>
          <Button leadingIcon="send" className="w-full medium:w-auto medium:self-end" onClick={submit}>
            {t('privacy.requests.send')}
          </Button>
          {requests.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-outline-variant pt-4">
              <h3 className="text-title-small text-on-surface">{t('privacy.requests.mine')}</h3>
              <ul className="flex flex-col gap-2">
                {requests.map((r) => (
                  <li key={r.id} className="flex flex-col gap-1 rounded-lg bg-surface-container p-3">
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-title-small text-on-surface">{t(`privacy.rights.${r.right}.label`)}</span>
                      <StatusPill tone="info" icon="schedule" label={t('privacy.requests.received')} />
                    </span>
                    <span className="text-body-small text-on-surface-variant">{t('privacy.requests.dates', { from: formatDate(r.requestedAt), due: formatDate(r.dueDate) })}</span>
                    <p className="text-body-medium text-on-surface">{r.details}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <InlineAlert tone="info" live="none">
            {t('privacy.requests.demo')}
          </InlineAlert>
        </section>
      </div>
    </WalletShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col">
      <dt className="text-body-small text-on-surface-variant">{label}</dt>
      <dd className="text-body-medium break-words text-on-surface">{value}</dd>
    </div>
  );
}

function Counts({ rows, label }: { rows: [IconName, string, string | number][]; label: string }) {
  return (
    <dl aria-label={label} className="flex flex-col divide-y divide-outline-variant">
      {rows.map(([icon, name, value]) => (
        <div key={name} className="flex items-center justify-between gap-3 py-2">
          <dt className="flex min-w-0 items-center gap-2 text-body-medium text-on-surface">
            <Icon name={icon} size={18} className="shrink-0 text-on-surface-variant" />
            {name}
          </dt>
          <dd className="text-title-small text-on-surface tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
