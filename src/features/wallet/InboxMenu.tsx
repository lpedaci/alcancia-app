import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { StatusPill } from '@/components/ui/StatusPill';
import { toast } from '@/components/ui/toast-store';
import { formatDate, walletDate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { useWallet } from '@/store/wallet-store';
import { markMessage, unreadMessages } from './engine/engine';

/**
 * The bell of the wallet (D-102): an inbox with legitimate notices and suspicious messages, one a
 * month (wallet-engine.md, section 10). Reporting a suspicious one is the habit of module 18 (B-24);
 * reporting a legitimate one explains why it was not. Senders are always fictitious (1.1.1).
 */
export function InboxMenu({ personId }: { personId: string }) {
  const { t } = useTranslation();
  const [wallet, update] = useWallet(personId);
  const messages = [...(wallet.messages ?? [])].reverse();
  const unread = unreadMessages(wallet);

  const report = (id: string, suspicious: boolean) => {
    update((s) => markMessage(s, id, 'reported'));
    toast[suspicious ? 'success' : 'info'](t(suspicious ? 'wallet.inbox.reported' : 'wallet.inbox.reportedLegit'));
  };

  return (
    <Popover
      onOpenChange={(open) => {
        // Opening the bell marks what is visible as read; a report is never undone.
        if (!open && unread > 0) update((s) => (s.messages ?? []).reduce((acc, m) => (m.status === 'unread' ? markMessage(acc, m.id, 'read') : acc), s));
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={unread > 0 ? t('wallet.inbox.labelUnread', { count: unread }) : t('wallet.inbox.label')}
          className="relative inline-flex size-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Icon name="notifications" size={24} />
          {unread > 0 && (
            <span aria-hidden className="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-error px-1 text-label-small text-on-error">
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent label={t('wallet.inbox.title')} align="end" className="w-80">
        <div className="flex flex-col gap-3">
          <p className="text-title-medium text-on-surface">{t('wallet.inbox.title')}</p>
          {messages.length === 0 ? (
            <p className="text-body-medium text-on-surface-variant">{t('wallet.inbox.empty')}</p>
          ) : (
            <ul className="flex max-h-96 flex-col gap-2 overflow-y-auto">
              {messages.map((m) => (
                <li key={m.id} className={cn('flex flex-col gap-1.5 rounded-lg border border-outline-variant p-3', m.status === 'unread' && 'bg-surface-container')}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-label-large text-on-surface">{t(`wallet.inbox.templates.${m.templateId}.from`)}</p>
                    <span className="text-label-medium text-on-surface-variant tabular-nums">{formatDate(walletDate(m.day))}</span>
                  </div>
                  <p className="text-body-medium text-on-surface">{t(`wallet.inbox.templates.${m.templateId}.body`)}</p>
                  {m.status === 'reported' ? (
                    <StatusPill tone={m.suspicious ? 'success' : 'neutral'} icon="flag" label={t('wallet.inbox.reportedPill')} className="self-start" />
                  ) : (
                    <Button variant="text" size="xs" leadingIcon="flag" className="self-start" onClick={() => report(m.id, m.suspicious)}>
                      {t('wallet.inbox.report')}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
