import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { SkipLink } from '@/components/layout/InPageLink';
import { Logo } from '@/components/layout/Logo';
import { UserMenu } from '@/components/layout/UserMenu';
import { ViewAsMenu } from '@/components/layout/ViewAsMenu';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';

/**
 * G6 layout of the tutor (D-193): the staff top bar (logo, "Ver como", help, user menu) and the
 * tutoring navigation. From 1200 px it is a side menu with the active item in a primary pill; below,
 * a row of tabs under the top bar that scrolls inside itself if it does not fit (2.7). Unanswered
 * questions show their count, with text, not only a dot.
 */
const NAV: { key: 'home' | 'assessments' | 'questions'; to: string; icon: IconName; match: (path: string) => boolean }[] = [
  { key: 'home', to: '/tutor', icon: 'home', match: (p) => p === '/tutor' || p.startsWith('/tutor/cohorts') },
  { key: 'assessments', to: '/tutor/assessments', icon: 'quiz', match: (p) => p.startsWith('/tutor/assessments') },
  { key: 'questions', to: '/tutor/questions', icon: 'forum', match: (p) => p.startsWith('/tutor/questions') },
];

export function TutorShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const user = useCurrentUser();
  const cohorts = useDataStore((s) => s.cohorts);
  const questions = useDataStore((s) => s.tutorQuestions);
  const mine = new Set(cohorts.filter((c) => c.tutorId === user?.personId).map((c) => c.id));
  const unanswered = questions.filter((q) => !q.answer && mine.has(q.cohortId)).length;

  const item = (n: (typeof NAV)[number], compact: boolean) => {
    const active = n.match(pathname);
    return (
      <Link
        key={n.key}
        to={n.to}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'relative flex min-h-12 shrink-0 items-center gap-3 rounded-full px-4 text-label-large transition-colors',
          active ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container',
          compact && 'min-h-10 px-3',
        )}
      >
        <Icon name={n.icon} filled={active} size={20} />
        <span>{t(`tutor.nav.${n.key}`)}</span>
        {n.key === 'questions' && unanswered > 0 && (
          <span className="ml-auto rounded-full bg-primary px-2 text-label-small text-on-primary">
            {unanswered}
            <span className="sr-only"> {t('tutor.nav.unanswered', { count: unanswered })}</span>
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-dvh bg-surface">
      <SkipLink />
      <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface-container-lowest">
        <div className="mx-auto flex h-16 max-w-[120rem] items-center gap-2 px-(--space-gutter) medium:px-8">
          <Link to="/tutor" className="inline-flex min-w-0 rounded-sm">
            <Logo />
          </Link>
          <span className="flex-1" />
          <ViewAsMenu />
          <IconButton icon="help" label={t('demo.help')} />
          <UserMenu />
        </div>
        <nav aria-label={t('tutor.nav.label')} className="large:hidden">
          <div className="mx-auto flex max-w-[120rem] gap-1 overflow-x-auto px-(--space-gutter) pb-2 medium:px-8">{NAV.map((n) => item(n, true))}</div>
        </nav>
      </header>
      <div className="mx-auto flex w-full max-w-[120rem] gap-8 px-(--space-gutter) py-8 medium:px-8">
        <nav aria-label={t('tutor.nav.label')} className="hidden w-60 shrink-0 large:block">
          <div className="sticky top-24 flex flex-col gap-1 rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
            <p className="px-4 pt-1 pb-2 text-label-medium text-on-surface-variant">{t('tutor.nav.title')}</p>
            {NAV.map((n) => item(n, false))}
          </div>
        </nav>
        <main id="main-content" tabIndex={-1} className="flex min-w-0 flex-1 flex-col gap-6 focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
