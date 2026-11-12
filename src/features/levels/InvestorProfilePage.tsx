import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { WalletShell } from '@/features/wallet/WalletShell';
import { type InvestorProfile, readLocal, writeLocal } from '@/store/local-store';
import { useCurrentUser } from '@/store/session-store';

/**
 * Educational investor profile test (D-67, A-54, module 13). Offered from the "qué falta" card of
 * Invertir and from the module 13 guide, even while Invertir is locked. It teaches what the test is
 * and why brokers ask for it; the result is never turned into a portfolio (1.2). It stays in the
 * person's browser and is reused when she opens her practice brokerage account (5.4).
 */
const QUESTIONS = ['horizon', 'drop', 'priority', 'knowledge', 'base'] as const;

function profileOf(total: number): InvestorProfile {
  if (total <= 3) return 'conservative';
  if (total <= 7) return 'moderate';
  return 'aggressive';
}

export function InvestorProfilePage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [tried, setTried] = useState(false);
  const [result, setResult] = useState<InvestorProfile | undefined>(() => readLocal(personId).investorProfile);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTried(true);
    if (QUESTIONS.some((q) => answers[q] === undefined)) return;
    const total = QUESTIONS.reduce((sum, q) => sum + Number(answers[q]), 0);
    const profile = profileOf(total);
    writeLocal(personId, (d) => ({ ...d, investorProfile: profile }));
    setResult(profile);
  };

  return (
    <WalletShell section={t('wallet.nav.learn')} fuerte={{ state: 'thinking', message: t('wallet.profile.fuerte') }}>
      <div className="flex max-w-3xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-label-large text-primary">{t('wallet.profile.kicker')}</p>
          <h1 className="text-headline-small text-on-surface">{t('wallet.profile.title')}</h1>
          <p className="text-body-large text-on-surface-variant">{t('wallet.profile.intro')}</p>
        </header>
        <InlineAlert tone="info">{t('wallet.profile.notAdvice')}</InlineAlert>

        {result ? (
          <section aria-labelledby="profile-result" className="flex flex-col items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
            <span className="flex size-10 items-center justify-center rounded-lg bg-tertiary-container text-on-tertiary-container">
              <Icon name="psychology" />
            </span>
            <h2 id="profile-result" tabIndex={-1} className="text-title-large text-on-surface">
              {t('wallet.profile.resultTitle', { profile: t(`wallet.profile.names.${result}`) })}
            </h2>
            <p className="text-body-large text-on-surface">{t(`wallet.profile.meaning.${result}`)}</p>
            <p className="text-body-medium text-on-surface-variant">{t('wallet.profile.why')}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild leadingIcon="home">
                <Link to="/app">{t('wallet.placeholder.backHome')}</Link>
              </Button>
              <Button variant="outlined" leadingIcon="refresh" onClick={() => setResult(undefined)}>
                {t('wallet.profile.again')}
              </Button>
            </div>
          </section>
        ) : (
          <form noValidate onSubmit={submit} className="flex flex-col gap-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
            {QUESTIONS.map((q) => (
              <RadioGroup
                key={q}
                name={`profile-${q}`}
                legend={t(`wallet.profile.q.${q}.legend`)}
                required
                error={tried && answers[q] === undefined ? t('wallet.profile.required') : undefined}
                options={[0, 1, 2].map((value) => ({ value: String(value), label: t(`wallet.profile.q.${q}.o${value}`) }))}
                value={answers[q] ?? ''}
                onChange={(e) => setAnswers((a) => ({ ...a, [q]: e.target.value }))}
              />
            ))}
            <Button type="submit" className="self-start" leadingIcon="check">
              {t('wallet.profile.submit')}
            </Button>
          </form>
        )}
      </div>
    </WalletShell>
  );
}
