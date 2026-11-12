import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { DEMO_PERSON_IDS, findPerson, type SignInStep, signInWithSso } from './auth-service';
import { AuthLayout } from './AuthLayout';
import { SsoSimulation } from './SsoSimulation';

/**
 * G2 · Neutral, clearly labelled simulation of the SSO redirect (CLAUDE.md F0). It never imitates
 * the Microsoft or Google pages: a copy of them would work like a phishing page, even in a demo.
 * With a person chosen on the landing the sign-in runs by itself; otherwise the visitor picks one.
 */
export function SsoPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const provider = params.get('provider') === 'google' ? 'google' : 'microsoft';
  const method = provider === 'google' ? 'sso_google' : 'sso_microsoft';
  const providerName = t(`auth.methods.${method}`);
  const accountParam = params.get('account') ?? '';
  const preselected = DEMO_PERSON_IDS.includes(accountParam) ? findPerson(accountParam) : undefined;
  const demo = params.get('demo') === '1' && Boolean(preselected);
  const [accountId, setAccountId] = useState(preselected?.id ?? DEMO_PERSON_IDS[0]!);

  const go = (result: SignInStep) => {
    if (result.status === 'locked') navigate('/login', { replace: true, state: { locked: true } });
    else if (result.status === 'mfa') navigate('/login/verify', { replace: true });
    else if (result.status === 'signed_in') navigate(result.path, { replace: true });
    else navigate('/login', { replace: true });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    go(signInWithSso(accountId, method, demo));
  };

  return (
    <AuthLayout>
      <header className="flex flex-col gap-2">
        <h1 className="text-headline-small text-on-surface">{t('auth.sso.title', { provider: providerName })}</h1>
      </header>

      <div className="flex gap-4 rounded-lg border border-dashed border-outline bg-surface-container p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
          <Icon name="open_in_new" />
        </span>
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-body-large text-on-surface">{t('auth.sso.simulation', { provider: providerName })}</p>
          <p className="text-body-medium text-on-surface-variant">{t('auth.sso.branding')}</p>
        </div>
      </div>

      {preselected ? (
        <SsoSimulation person={preselected} providerName={providerName} onDone={() => go(signInWithSso(preselected.id, method, demo))} />
      ) : (
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
          <RadioGroup
            legend={t('auth.sso.accountLegend')}
            helperText={t('auth.sso.accountHelp')}
            name="demo-account"
            options={DEMO_PERSON_IDS.map((personId) => {
              const person = findPerson(personId);
              return { value: personId, label: `${person?.name ?? ''}, ${t(`demo.people.${personId}`)}`, description: person?.email };
            })}
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          />
          <Button type="submit" fullWidth size="m" className="md:h-10 md:px-4 md:text-label-large" trailingIcon="arrow_forward">
            {t('auth.sso.continue')}
          </Button>
        </form>
      )}

      <Button asChild variant="text" leadingIcon="arrow_back" className="-ml-3 w-fit">
        <Link to="/login">{t('auth.sso.back')}</Link>
      </Button>
    </AuthLayout>
  );
}
