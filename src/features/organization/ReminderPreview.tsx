import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName } from '@/components/ui/Icon';
import { SegmentedButton } from '@/components/ui/SegmentedButton';
import { HorneroMark } from '@/features/partner/HorneroMark';
import { formatDate } from '@/lib/dates';
import type { ReminderChannel, ReminderKind } from '@/lib/reminders';
import { cn } from '@/lib/utils';
import type { OrganizationKind } from '@/types/domain';

/**
 * F9 (D-273): a simulated preview of how a reminder arrives by each chosen channel. Neutral on
 * purpose: it never imitates the look of an email client, Teams, Slack or a real campus, and it
 * sends nothing. The texts are the same ones the person sees in the platform.
 */
const CHANNEL_ICON: Record<ReminderChannel, IconName> = { email: 'mail', teams: 'chat', slack: 'forum', campus: 'school', app: 'mobile' };
const SAMPLE: Record<ReminderKind, Record<string, string | number>> = {
  guide: { module: 'Presupuesto y gastos hormiga' },
  weekly: { title: 'Registra tus gastos durante 7 días', date: formatDate('2026-11-23') },
  due: { date: formatDate('2026-12-04'), count: 18 },
  review: { module: 'Inflación y poder de compra', count: 7 },
  goal: { name: 'Fondo de emergencia' },
};

export function ReminderPreview({ channels, kind }: { channels: ReminderChannel[]; kind: OrganizationKind }) {
  const { t } = useTranslation();
  // No tutor in the product context, so no weekly challenges (5.5)
  const kinds: ReminderKind[] = kind === 'product' ? ['guide', 'review', 'goal'] : ['guide', 'weekly', 'due', 'review', 'goal'];
  const [reminder, setReminder] = useState<ReminderKind>('guide');
  const text = t(`reminders.kinds.${reminder}`, SAMPLE[reminder]);
  const subject = t(`reminders.subjects.${reminder}`);

  return (
    <div className="flex flex-col gap-4 border-t border-outline-variant pt-4">
      <h3 className="text-title-medium text-on-surface">{t('reminders.preview.title')}</h3>
      <p className="text-body-medium text-on-surface-variant">{t('reminders.preview.intro')}</p>
      <SegmentedButton
        label={t('reminders.preview.kindLabel')}
        value={reminder}
        onValueChange={(v) => v && setReminder(v as ReminderKind)}
        options={kinds.map((k) => ({ value: k, label: t(`reminders.short.${k}`) }))}
        className="w-full"
      />
      {channels.length === 0 ? (
        <p className="rounded-lg bg-surface-container p-4 text-body-medium text-on-surface-variant">{t('reminders.preview.none')}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {channels.map((c) => (
            <li key={c} className="flex min-w-0 flex-col gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
              <p className="flex items-center gap-2 text-label-large text-on-surface-variant">
                <Icon name={CHANNEL_ICON[c]} size={20} />
                {t(`reminders.preview.channel.${c}`)}
              </p>
              <div className={cn('flex min-w-0 flex-col gap-2 rounded-lg p-3', c === 'app' ? 'bg-surface-container-high' : 'bg-surface-container')}>
                {c === 'email' ? (
                  <>
                    <p className="text-body-small text-on-surface-variant">{t('reminders.preview.from')}</p>
                    <p className="text-title-small text-on-surface">{subject}</p>
                  </>
                ) : (
                  <p className="flex items-center gap-2 text-title-small text-on-surface">
                    {c === 'app' ? (
                      <span aria-hidden className="inline-flex size-6 items-center justify-center rounded-md bg-partner-hornero text-on-partner-hornero">
                        <HorneroMark size={16} />
                      </span>
                    ) : (
                      <span aria-hidden className="inline-flex size-6 items-center justify-center rounded-md bg-primary text-label-small text-on-primary">A</span>
                    )}
                    {c === 'app' ? t('reminders.preview.appSender') : t('reminders.preview.sender')}
                  </p>
                )}
                <p className="text-body-medium text-on-surface">
                  {t('reminders.preview.hello')} {text}
                </p>
                <span className="text-label-large text-primary">{t('reminders.preview.cta')}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="flex items-start gap-2 text-body-small text-on-surface-variant">
        <Icon name="info" size={16} className="mt-0.5 shrink-0" />
        {t('reminders.preview.disclaimer')}
      </p>
    </div>
  );
}
