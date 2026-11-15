import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { DEMO_PERSON_IDS, findPerson, type SignInStep, signInWithSso } from './auth-service';
import { cn } from '@/lib/utils';
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
    <AuthLayout wide>
      <header className="flex flex-col gap-2">
        <h1 className="text-headline-medium text-on-surface">{t('auth.sso.title', { provider: providerName })}</h1>
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
          {/* Demo accounts as compact choice tiles (D-230): photo with the role ring (2.2.1, pattern 6),
              name and a short role; the e-mail is for screen readers. Native radios in a fieldset, so
              arrow keys and labels work as usual; the chosen one has a border, a fill and a check. */}
          <fieldset className="flex min-w-0 flex-col gap-2" aria-describedby="sso-account-help">
            <legend className="mb-2 text-label-large text-on-surface">{t('auth.sso.accountLegend')}</legend>
            <div className="grid grid-fill-3 gap-2">
              {DEMO_PERSON_IDS.map((personId) => {
                const person = findPerson(personId);
                if (!person) return null;
                const checked = accountId === personId;
                return (
                  <label
                    key={personId}
                    className={cn(
                      'relative flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border p-2.5 pr-8 transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary',
                      checked ? 'border-primary bg-primary-container/40' : 'border-outline-variant hover:bg-surface-container',
                    )}
                  >
                    <input type="radio" name="demo-account" value={personId} checked={checked} onChange={() => setAccountId(personId)} className="sr-only" />
                    <Avatar name={person.name} role={person.role} personId={person.id} size="md" />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-label-large text-on-surface">{person.name}</span>
                      <span className="truncate text-body-small text-on-surface-variant">{t(`demo.people.${personId}`)}</span>
                      <span className="sr-only">, {person.email}</span>
                    </span>
                    {checked && <Icon name="check_circle" size={20} filled className="absolute top-2 right-2 text-primary" />}
                  </label>
                );
              })}
            </div>
            <p id="sso-account-help" className="text-body-small text-on-surface-variant">
              {t('auth.sso.accountHelp')}
            </p>
          </fieldset>
          {/* Back and the main action on one row: the main one on the right, filled (2.1.3) */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button asChild variant="text" leadingIcon="arrow_back" className="-ml-3 w-fit">
              <Link to="/login">{t('auth.sso.back')}</Link>
            </Button>
            <Button type="submit" size="m" className="w-full sm:w-auto md:h-10 md:px-4 md:text-label-large" trailingIcon="arrow_forward">
              {t('auth.sso.continue')}
            </Button>
          </div>
        </form>
      )}

      {preselected && (
        <Button asChild variant="text" leadingIcon="arrow_back" className="-ml-3 w-fit">
          <Link to="/login">{t('auth.sso.back')}</Link>
        </Button>
      )}
    </AuthLayout>
  );
}
