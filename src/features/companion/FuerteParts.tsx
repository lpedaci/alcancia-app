import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { formatDate } from '@/lib/dates';
import { formatMoney } from '@/lib/money';
import { cn } from '@/lib/utils';
import { Fuerte, type FuerteState } from './Fuerte';
import type { Notice, NoticeKind } from './notices';

/**
 * The pieces of Fuerte's panel (D-290, D-291), shared by the floating panel and the design system,
 * so both show the same thing.
 */

/** His face follows what he has to tell: worried with a problem, thinking with something pending,
 *  happy when everything is up to date. A state the screen chose on purpose (a scam, sleep) wins. */
export function fuerteMood(state: FuerteState, notices: Pick<Notice, 'kind'>[]): FuerteState {
  if (state === 'sorry' || state === 'attention' || state === 'sleeping') return state;
  if (notices.some((n) => n.kind === 'alert')) return 'attention';
  if (notices.some((n) => n.kind === 'pending')) return 'thinking';
  return state === 'neutral' || state === 'greeting' ? 'celebration' : state;
}

export const KIND_TONE: Record<NoticeKind, string> = {
  alert: 'bg-warning-container text-on-warning-container',
  pending: 'bg-primary-container text-on-primary-container',
  invest: 'bg-secondary-container text-on-secondary-container',
  goal: 'bg-tertiary-container text-on-tertiary-container',
  progress: 'bg-surface-container-high text-on-surface-variant',
};

/** The text of a notice, with dates and amounts in the format of 2.9. */
export function useNoticeText() {
  const { t } = useTranslation();
  return (n: Pick<Notice, 'key' | 'params'>) => {
    const params: Record<string, string | number> = { ...n.params };
    if (typeof params.date === 'string') params.date = formatDate(params.date);
    if (typeof params.amount === 'string') params.amount = formatMoney(params.amount);
    if (params.expenseKey) params.name = t(`wallet.expenses.${params.expenseKey}`);
    return t(`wallet.fuerte.notices.${n.key}`, params);
  };
}

/** Header as a chat, like helper avatars do: Fuerte and his name with the actions, his message below in
 *  a full-width speech bubble with a light tint and its corner pointing at him. */
export function FuerteSpeech({ mood, lights, message, actions }: { mood: FuerteState; lights: number; message: string; actions?: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Fuerte state={mood} lights={lights} size={2.5} />
        <p className="min-w-0 flex-1 text-title-small text-on-surface">{t('wallet.fuerte.title')}</p>
        {actions && <div className="-mr-1 flex shrink-0">{actions}</div>}
      </div>
      <p className="rounded-2xl rounded-tl-sm bg-primary-container/50 px-3.5 py-2.5 text-body-medium text-pretty text-on-surface">{message}</p>
    </div>
  );
}

/** One notice: an icon in the color of its kind and the text; the kind is read before it. */
export function NoticeRowContent({ notice }: { notice: Pick<Notice, 'kind' | 'icon' | 'key' | 'params'> }) {
  const { t } = useTranslation();
  const text = useNoticeText();
  return (
    <>
      <span aria-hidden className={cn('inline-flex size-7 shrink-0 items-center justify-center rounded-full', KIND_TONE[notice.kind])}>
        <Icon name={notice.icon} size={16} />
      </span>
      <span className="min-w-0 flex-1 text-body-small text-on-surface">
        <span className="sr-only">{t(`wallet.fuerte.kinds.${notice.kind}`)}: </span>
        {text(notice)}
      </span>
    </>
  );
}

export const noticeRowClass = 'flex min-h-11 items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-surface-container';

/** The badge on Fuerte: a warning sign when there is a problem, the count when there are pending tasks. */
export function FuerteBadge({ alert, count }: { alert: boolean; count: number }) {
  if (alert && count > 0) {
    return (
      <span aria-hidden className="absolute top-0.5 right-0.5 flex size-6 items-center justify-center rounded-full border-2 border-surface-container-lowest bg-warning text-on-warning">
        <Icon name="warning" size={16} />
      </span>
    );
  }
  if (count > 0) {
    return (
      <span aria-hidden className="absolute top-1 right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-surface-container-lowest bg-primary px-1 text-label-small text-on-primary tabular-nums">
        {count > 9 ? '9+' : count}
      </span>
    );
  }
  return <span aria-hidden className="absolute top-2 right-2 size-3.5 rounded-full border-2 border-surface-container-lowest bg-primary" />;
}

/** "Estás al día con todo": the line that goes with his happy face. */
export function UpToDate() {
  const { t } = useTranslation();
  return (
    <p className="flex items-center gap-2 rounded-md bg-tertiary-container px-3 py-2 text-label-large text-on-tertiary-container">
      <Icon name="task_alt" size={18} />
      {t('wallet.fuerte.upToDate')}
    </p>
  );
}
