import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui/Button';
import { homePath } from '@/lib/permissions';
import { useCurrentUser } from '@/store/session-store';
import { SystemMessage } from './SystemMessage';

/** G7 · Page not found: back to the person's home, the previous page or a place that always works. */
export function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const home = user ? homePath(user) : '/';
  const suggestions = [
    { to: '/', icon: 'home' as const, label: t('notFound.landing') },
    ...(user ? [] : [{ to: '/login', icon: 'person' as const, label: t('notFound.login') }]),
    { to: '/access-help', icon: 'support_agent' as const, label: t('notFound.help') },
  ];
  return (
    <SystemMessage
      icon="search"
      fuerte="thinking"
      code={t('notFound.code')}
      title={t('notFound.title')}
      body={t('notFound.body')}
      suggestionsTitle={t('notFound.suggestionsTitle')}
      suggestions={suggestions}
      actions={
        <>
          <Button variant="outlined" leadingIcon="arrow_back" onClick={() => navigate(-1)}>
            {t('notFound.back')}
          </Button>
          <Button asChild leadingIcon="home">
            <Link to={home}>{t('notFound.home')}</Link>
          </Button>
        </>
      }
    />
  );
}
