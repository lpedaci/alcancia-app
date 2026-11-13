import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StaffShell } from '@/components/layout/StaffShell';
import { useDataStore } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';

/**
 * Layout of the tutor (D-193): the shared staff layout with the Tutoría navigation (Inicio,
 * Resultados, Consultas). Unanswered questions show their count, with text, not only a dot.
 */
export function TutorShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const cohorts = useDataStore((s) => s.cohorts);
  const questions = useDataStore((s) => s.tutorQuestions);
  const mine = new Set(cohorts.filter((c) => c.tutorId === user?.personId).map((c) => c.id));
  const unanswered = questions.filter((q) => !q.answer && mine.has(q.cohortId)).length;

  return (
    <StaffShell
      home="/tutor"
      navLabel={t('tutor.nav.label')}
      nav={[
        { key: 'home', to: '/tutor', icon: 'home', label: t('tutor.nav.home'), match: (p) => p === '/tutor' || p.startsWith('/tutor/cohorts') },
        { key: 'assessments', to: '/tutor/assessments', icon: 'quiz', label: t('tutor.nav.assessments'), match: (p) => p.startsWith('/tutor/assessments') },
        {
          key: 'questions',
          to: '/tutor/questions',
          icon: 'forum',
          label: t('tutor.nav.questions'),
          match: (p) => p.startsWith('/tutor/questions'),
          badge: { count: unanswered, label: t('tutor.nav.unanswered', { count: unanswered }) },
        },
      ]}
    >
      {children}
    </StaffShell>
  );
}
