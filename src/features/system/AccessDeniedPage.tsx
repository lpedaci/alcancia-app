import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui/Button';
import { homePath } from '@/lib/permissions';
import { useCurrentUser } from '@/store/session-store';
import { SystemMessage } from './SystemMessage';
import { ctx, useOrgKind } from '@/lib/org-context';

/**
 * G7 · Acceso no permitido (roles.md 3.4): a route of another role. Serious and without blame
 * (2.9): what happened, the person's own home, going back and the help desk.
 */
export function AccessDeniedPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const kind = useOrgKind();
  return (
    <SystemMessage
      icon="lock"
      fuerte="attention"
      code={t('forbidden.code')}
      title={t('forbidden.title')}
      body={t('forbidden.body', { context: ctx(kind) })}
      suggestionsTitle={t('forbidden.suggestionsTitle')}
      suggestions={[
        { to: '/', icon: 'home', label: t('forbidden.landing') },
        { to: '/access-help', icon: 'support_agent', label: t('forbidden.help') },
      ]}
      actions={
        <>
          <Button asChild leadingIcon="home">
            <Link to={homePath(user)}>{t('forbidden.backHome')}</Link>
          </Button>
          <Button variant="outlined" leadingIcon="arrow_back" onClick={() => navigate(-1)}>
            {t('forbidden.back')}
          </Button>
        </>
      }
    />
  );
}
