import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEMO_TODAY } from '@/app/config';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { MetaChips } from '@/components/ui/MetaChips';
import { SegmentedButton } from '@/components/ui/SegmentedButton';
import { StatusPill } from '@/components/ui/StatusPill';
import { TextArea } from '@/components/ui/TextArea';
import { toast } from '@/components/ui/toast-store';
import { formatDate } from '@/lib/dates';
import { useDataStore } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';
import type { TutorQuestion } from '@/types/domain';
import { TutorShell } from './TutorShell';
import { cohortsOf, moduleOrder, moduleTitle } from './tutor-data';
import { useTutorData } from './tutor-ui';

/**
 * T5, questions from participants about the modules (CLAUDE.md F6, D-193): the ones waiting first,
 * with who asked, the cohort, the module and the date, and the tutor's answer. A reminder asks not to
 * include amounts or personal data: the conversation is about learning, never about anyone's money.
 */
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';
type Filter = 'pending' | 'answered' | 'all';

export function QuestionsPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const data = useTutorData();
  const [filter, setFilter] = useState<Filter>('pending');
  const mine = new Set(cohortsOf(data, user?.personId ?? '').map((c) => c.id));
  const all = data.tutorQuestions.filter((q) => mine.has(q.cohortId)).sort((a, b) => b.askedAt.localeCompare(a.askedAt));
  const list = all.filter((q) => (filter === 'pending' ? !q.answer : filter === 'answered' ? Boolean(q.answer) : true));
  const pending = all.filter((q) => !q.answer).length;

  return (
    <TutorShell>
      <header className="flex flex-col gap-2">
        <h1 className="text-headline-medium text-on-surface">{t('tutor.questions.title')}</h1>
        <p className="text-body-large text-on-surface-variant">{t('tutor.questions.intro', { count: pending })}</p>
      </header>
      <SegmentedButton
        label={t('tutor.questions.filter')}
        value={filter}
        onValueChange={setFilter}
        options={[
          { value: 'pending', label: t('tutor.questions.pending', { count: pending }) },
          { value: 'answered', label: t('tutor.questions.answered') },
          { value: 'all', label: t('tutor.questions.all') },
        ]}
      />
      {list.length === 0 ? (
        <section className={card}>
          <p className="text-body-medium text-on-surface-variant">{t(`tutor.questions.empty.${filter}`)}</p>
        </section>
      ) : (
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) large:grid-cols-2 large:items-start">
          {list.map((q) => (
            <li key={q.id}>
              <QuestionCard question={q} />
            </li>
          ))}
        </ul>
      )}
    </TutorShell>
  );
}

function QuestionCard({ question }: { question: TutorQuestion }) {
  const { t } = useTranslation();
  const data = useTutorData();
  const answer = useDataStore((s) => s.answerQuestion);
  const [text, setText] = useState('');
  const [tried, setTried] = useState(false);
  const person = data.people.find((p) => p.id === question.personId);
  const cohort = data.cohorts.find((c) => c.id === question.cohortId);
  const error = tried && text.trim().length < 10 ? t('tutor.questions.answerError') : undefined;

  const send = () => {
    setTried(true);
    if (text.trim().length < 10) return;
    answer(question.id, text.trim(), `${DEMO_TODAY}T10:00:00.000Z`);
    toast.success(t('tutor.questions.sent'));
  };

  return (
    <article className={card} aria-labelledby={`q-${question.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={person?.name ?? ''} personId={person?.id} role="participant" size="sm" />
          <div className="min-w-0">
            <p className="text-title-small text-on-surface">{person?.name}</p>
            <p className="text-body-small text-on-surface-variant">{cohort?.name}</p>
          </div>
        </div>
        {question.answer ? (
          <StatusPill tone="success" icon="check_circle" label={t('tutor.questions.statusAnswered')} />
        ) : (
          <StatusPill tone="info" icon="mark_chat_unread" label={t('tutor.questions.statusPending')} />
        )}
      </div>
      <MetaChips
        label={t('tutor.questions.data')}
        items={[
          { icon: 'menu_book', label: t('tutor.assessments.module', { n: moduleOrder(question.moduleId), name: moduleTitle(question.moduleId) }) },
          { icon: 'calendar_month', label: formatDate(question.askedAt), dateTime: question.askedAt.slice(0, 10) },
        ]}
      />
      <p id={`q-${question.id}`} className="text-body-large text-on-surface">
        {question.text}
      </p>
      {question.answer ? (
        <div className="flex flex-col gap-1 rounded-lg bg-surface-container p-4">
          <p className="text-label-medium text-on-surface-variant">{t('tutor.questions.yourAnswer', { date: formatDate(question.answer.answeredAt) })}</p>
          <p className="text-body-medium text-on-surface">{question.answer.text}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <TextArea label={t('tutor.questions.answerLabel')} helperText={t('tutor.questions.answerHelp')} value={text} onChange={(e) => setText(e.target.value)} error={error} rows={3} />
          <InlineAlert tone="info" live="none">
            {t('tutor.questions.privacy')}
          </InlineAlert>
          <Button leadingIcon="send" className="self-start" onClick={send}>
            {t('tutor.questions.send')}
          </Button>
        </div>
      )}
    </article>
  );
}
