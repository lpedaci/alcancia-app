import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { StatusPill } from '@/components/ui/StatusPill';
import { toast } from '@/components/ui/toast-store';
import { formatDate, walletDate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { useWallet } from '@/store/wallet-store';
import { fallForScam, markMessage, unreadMessages } from './engine/engine';
import { MESSAGE_BAIT, type SUSPICIOUS_TEMPLATES } from './engine/profile';
import type { InboxMessage } from './engine/types';
import { Link } from 'react-router';
import { useReminders } from '@/features/learning/use-reminders';
import type { IconName } from '@/components/ui/Icon';
import type { ReminderKind } from '@/lib/reminders';

/**
 * The bell of the wallet (D-102, D-211): an inbox with legitimate notices and suspicious messages, one
 * a month (wallet-engine.md, section 10). Rules of D-211: invented senders, brands and domains; no
 * link that leaves the app ("abrir el enlace" is simulated here); and every suspicious message, when
 * it is reported or when the person takes the bait, ends in feedback with the signals it had (B-24).
 */
const REMINDER_ICON: Record<ReminderKind, IconName> = { review: 'replay', guide: 'menu_book', weekly: 'flag', due: 'schedule', goal: 'savings' };

export function InboxMenu({ personId }: { personId: string }) {
  const { t } = useTranslation();
  const [wallet, update] = useWallet(personId);
  const messages = [...(wallet.messages ?? [])].reverse();
  const unread = unreadMessages(wallet);
  const { reminders } = useReminders(personId);
  const [open, setOpen] = useState(false);
  const onOpenChange = (next: boolean) => {
    // Closing the bell marks what was visible as read; a report or a fall is never undone.
    if (!next && unread > 0) update((s) => (s.messages ?? []).reduce((acc, m) => (m.status === 'unread' ? markMessage(acc, m.id, 'read') : acc), s));
    setOpen(next);
  };

  const report = (m: InboxMessage) => {
    update((s) => markMessage(s, m.id, 'reported'));
    toast[m.suspicious ? 'success' : 'info'](t(m.suspicious ? 'wallet.inbox.reported' : 'wallet.inbox.reportedLegit'));
  };
  const fall = (m: InboxMessage) => {
    const bait = MESSAGE_BAIT[m.templateId as (typeof SUSPICIOUS_TEMPLATES)[number]];
    update((s) => fallForScam(markMessage(s, m.id, 'fell'), m.id, bait));
    toast.info(t('wallet.inbox.fell'));
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={
            unread + reminders.length > 0 ? t('wallet.inbox.labelPending', { count: unread + reminders.length }) : t('wallet.inbox.label')
          }
          className="relative inline-flex size-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Icon name="notifications" size={24} />
          {unread + reminders.length > 0 && (
            <span aria-hidden className="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-error px-1 text-label-small text-on-error">
              {unread + reminders.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent label={t('wallet.inbox.title')} align="end" className="w-80">
        <div className="flex max-h-[70dvh] flex-col gap-3 overflow-y-auto">
          {/* F9 (D-273): reminders of the program, in the platform */}
          {reminders.length > 0 && (
            <div className="flex flex-col gap-2 border-b border-outline-variant pb-3">
              <p className="text-title-medium text-on-surface">{t('reminders.inboxTitle')}</p>
              <ul className="flex flex-col gap-1">
                {reminders.map((r) => (
                  <li key={r.id}>
                    <Link to={r.to} onClick={() => onOpenChange(false)} className="flex items-start gap-3 rounded-lg p-2 text-body-medium text-on-surface hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-primary">
                      <Icon name={REMINDER_ICON[r.kind]} size={20} className="mt-0.5 shrink-0 text-primary" />
                      <span className="min-w-0">{t(`reminders.kinds.${r.kind}`, { ...r.params, ...(typeof r.params.date === 'string' ? { date: formatDate(r.params.date) } : {}) })}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-title-medium text-on-surface">{t('wallet.inbox.title')}</p>
          {messages.length === 0 ? (
            <p className="text-body-medium text-on-surface-variant">{t('wallet.inbox.empty')}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {messages.map((m) => (
                <MessageItem key={m.id} message={m} pending={wallet.scamPending?.source === m.id} onReport={() => report(m)} onFall={() => fall(m)} />
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MessageItem({ message: m, pending, onReport, onFall }: { message: InboxMessage; pending: boolean; onReport: () => void; onFall: () => void }) {
  const { t } = useTranslation();
  const key = `wallet.inbox.templates.${m.templateId}`;
  const signals = m.suspicious ? (t(`${key}.signals`, { returnObjects: true }) as string[]) : [];
  const bait = m.suspicious ? MESSAGE_BAIT[m.templateId as (typeof SUSPICIOUS_TEMPLATES)[number]] : undefined;
  const open = m.status === 'unread' || m.status === 'read';

  return (
    <li data-message={m.templateId} className={cn('flex flex-col gap-2 rounded-lg border border-outline-variant p-3', m.status === 'unread' && 'bg-surface-container')}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-label-large text-on-surface">{t(`${key}.from`)}</p>
        <span className="text-label-medium text-on-surface-variant tabular-nums">{formatDate(walletDate(m.day))}</span>
      </div>
      <p className="text-body-medium text-on-surface">{t(`${key}.body`)}</p>
      {open ? (
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          <Button variant="text" size="xs" leadingIcon="flag" onClick={onReport}>
            {t('wallet.inbox.report')}
          </Button>
          {bait && (
            <Button variant="text" size="xs" leadingIcon="touch_app" onClick={onFall} aria-describedby={`${m.id}-bait-note`}>
              {t(`wallet.inbox.bait.${bait}`)}
            </Button>
          )}
          {bait && (
            <p id={`${m.id}-bait-note`} className="w-full text-body-small text-on-surface-variant">
              {t('wallet.inbox.baitNote')}
            </p>
          )}
        </div>
      ) : m.suspicious ? (
        // D-211: the feedback with the signals, after reporting or after taking the bait.
        <InlineAlert tone={m.status === 'reported' ? 'success' : 'info'}>
          <span className="block font-medium">{t(m.status === 'reported' ? 'wallet.inbox.reportedTitle' : 'wallet.inbox.fellTitle')}</span>
          <ul className="mt-1 list-disc pl-5">
            {signals.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          {m.status === 'fell' && <span className="mt-1 block">{t('wallet.inbox.fellReal')}</span>}
        </InlineAlert>
      ) : null}
      {m.status === 'fell' && pending && (
        <Button variant="tonal" size="xs" leadingIcon="flag" className="self-start" onClick={onReport}>
          {t('wallet.inbox.reportAfter')}
        </Button>
      )}
      {m.suspicious || m.status !== 'reported' ? null : (
        <div className="flex flex-col gap-1">
          <StatusPill tone="neutral" icon="flag" label={t('wallet.inbox.reportedPill')} className="self-start" />
          <p className="text-body-small text-on-surface-variant">{t('wallet.inbox.legitNote')}</p>
        </div>
      )}
    </li>
  );
}
