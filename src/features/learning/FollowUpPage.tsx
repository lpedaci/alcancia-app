import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEMO_TODAY } from '@/app/config';
import { Button } from '@/components/ui/Button';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { ListLinkRow } from '@/components/ui/ListLinkRow';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { WalletShell } from '@/features/wallet/WalletShell';
import { formatDate } from '@/lib/dates';
import { FOLLOW_UP_DAYS, followUpDue } from '@/lib/reminders';
import { useDataStore } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';
import type { FollowUp30 } from '@/types/domain';

/**
 * 30-day follow-up (F15, Kirkpatrick 3, D-316): 30 days after Conocerte, three yes or no questions
 * about what the person applied (budget, emergency fund, full card payment). L&D and the sponsor
 * only see the share of the program that applied each one, with the privacy threshold (F7); the
 * tutor does not see it. No amounts and no free text. It can be answered again to update it.
 */
const ITEMS = ['budget', 'emergencyFund', 'fullCardPayment'] as const;
type Item = (typeof ITEMS)[number];
type Choice = 'yes' | 'no';

export function FollowUpPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const started = useDataStore((s) => s.diagnostics.find((d) => d.personId === personId && d.kind === 'initial')?.takenAt);
  const saved = useDataStore((s) => s.followUps.find((f) => f.personId === personId));
  const save = useDataStore((s) => s.saveFollowUp);
  const [answers, setAnswers] = useState<Partial<Record<Item, Choice>>>(() =>
    saved ? Object.fromEntries(ITEMS.map((i) => [i, saved.applied[i] ? 'yes' : 'no'])) : {},
  );
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState(false);
  const due = started ? followUpDue(started, DEMO_TODAY) : false;
  const complete = ITEMS.every((i) => answers[i]);

  const submit = () => {
    setTried(true);
    if (!complete) return;
    const followUp: FollowUp30 = {
      personId,
      answeredAt: DEMO_TODAY,
      applied: { budget: answers.budget === 'yes', emergencyFund: answers.emergencyFund === 'yes', fullCardPayment: answers.fullCardPayment === 'yes' },
    };
    save(followUp);
    setDone(true);
  };

  return (
    <WalletShell section={t('followUp.title')} fuerte={{ state: done ? 'celebration' : 'thinking', message: t(done ? 'followUp.fuerteDone' : 'followUp.fuerte') }}>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-(--space-section)">
        <header className="flex flex-col gap-2">
          <p className="text-label-large text-primary">{t('followUp.kicker')}</p>
          <h1 className="text-headline-medium text-on-surface">{t('followUp.title')}</h1>
          <p className="text-body-large text-on-surface-variant">{t('followUp.intro', { days: FOLLOW_UP_DAYS })}</p>
        </header>

        {!started || !due ? (
          <InlineAlert tone="info" title={t('followUp.notYetTitle')}>
            {started ? t('followUp.notYetBody', { days: FOLLOW_UP_DAYS, date: formatDate(started) }) : t('followUp.noStart')}
          </InlineAlert>
        ) : (
          <section aria-labelledby="follow-up-form" className="flex flex-col gap-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
            <h2 id="follow-up-form" className="text-title-large text-on-surface">
              {t('followUp.formTitle')}
            </h2>
            <InlineAlert tone="info" live="none">
              {t('followUp.privacy')}
            </InlineAlert>
            {saved && !done && <p className="text-body-medium text-on-surface-variant">{t('followUp.answeredOn', { date: formatDate(saved.answeredAt) })}</p>}
            {ITEMS.map((item) => (
              <RadioGroup
                key={item}
                name={`follow-up-${item}`}
                legend={t(`followUp.items.${item}.question`)}
                helperText={t(`followUp.items.${item}.help`)}
                value={answers[item] ?? ''}
                onChange={(e) => {
                  setDone(false);
                  setAnswers((a) => ({ ...a, [item]: e.target.value as Choice }));
                }}
                error={tried && !answers[item] ? t('followUp.missing') : undefined}
                options={[
                  { value: 'yes', label: t('followUp.yes') },
                  { value: 'no', label: t('followUp.no') },
                ]}
                optionsClassName="grid grid-cols-2 gap-2"
              />
            ))}
            <Button leadingIcon="send" className="w-full medium:w-auto medium:self-end" onClick={submit}>
              {saved ? t('followUp.update') : t('followUp.send')}
            </Button>
            <div aria-live="polite">{done && <InlineAlert tone="success" title={t('followUp.doneTitle')}>{t('followUp.doneBody')}</InlineAlert>}</div>
          </section>
        )}

        <ListLinkRow to="/app/learn" icon="school" title={t('escape.backToLearn')} detail={t('escape.backToLearnDetail')} />
      </div>
    </WalletShell>
  );
}
