import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { TextField } from '@/components/ui/TextField';
import { digitsMask } from '@/lib/input-masks';
import { useFieldError } from '@/lib/use-field-error';
import { otpField } from '@/lib/validation';
import { useSessionStore } from '@/store/session-store';
import { cancelSignIn, DEMO_MFA_CODE, findPerson, verifyMfa } from './auth-service';
import { AuthLayout } from './AuthLayout';

const schema = z.object({ code: otpField });
type MfaValues = z.infer<typeof schema>;
const codeMask = digitsMask(6);

/**
 * G3 · Two-step verification, required for the admin and the sponsor (roles.md 4). One field that
 * accepts pasting (WCAG 3.3.8); in the one-click demo access the code comes prefilled. "Ver como"
 * never repeats this step (F0).
 */
export function VerifyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pending = useSessionStore((s) => s.pending);
  const fieldError = useFieldError();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MfaValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { code: pending?.demo ? DEMO_MFA_CODE : '' },
  });

  if (!pending) return <Navigate to="/login" replace />;
  const person = findPerson(pending.personId);

  const onSubmit = async ({ code }: MfaValues) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const result = verifyMfa(code);
    if (result.status === 'invalid') {
      setError('code', { message: 'auth.mfa.invalid' }, { shouldFocus: true });
      return;
    }
    navigate(result.path, { replace: true });
  };

  return (
    <AuthLayout>
      <header className="flex flex-col gap-2">
        <h1 className="text-headline-small text-on-surface">{t('auth.mfa.title')}</h1>
        <p className="text-body-large text-on-surface-variant">{t('auth.mfa.subtitle')}</p>
        {person && (
          <p className="text-body-medium text-on-surface-variant">
            {t('auth.mfa.signingAs', { name: person.name })} {t('auth.mfa.required')}
          </p>
        )}
      </header>

      <InlineAlert tone="info">{t(pending.demo ? 'auth.mfa.demoCode' : 'auth.mfa.demoCodeManual', { code: DEMO_MFA_CODE })}</InlineAlert>

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <TextField
          label={t('auth.mfa.codeLabel')}
          inputMode="numeric"
          autoComplete="one-time-code"
          mask={codeMask}
          helperText={t('auth.mfa.codeHelp')}
          error={fieldError(errors.code)}
          {...register('code')}
        />
        <Button
          type="submit"
          fullWidth
          size="m"
          className="md:h-10 md:px-4 md:text-label-large"
          loading={isSubmitting}
          loadingText={t('auth.login.submitting')}
        >
          {t('auth.mfa.submit')}
        </Button>
      </form>

      <div className="flex flex-col items-start gap-1 border-t border-outline-variant pt-6">
        <Button
          variant="text"
          className="-ml-3"
          onClick={() => {
            cancelSignIn();
            navigate('/login', { replace: true });
          }}
        >
          {t('auth.mfa.cancel')}
        </Button>
      </div>
    </AuthLayout>
  );
}
