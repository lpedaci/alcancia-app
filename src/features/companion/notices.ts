import Decimal from 'decimal.js';
import type { IconName } from '@/components/ui/Icon';
import type { LevelStatus } from '@/features/levels/engine';
import { dayOfMonth, statementLeft } from '@/features/wallet/engine/engine';
import type { WalletState } from '@/features/wallet/engine/types';
import type { Reminder } from '@/lib/reminders';

/**
 * Fuerte's notices (D-290): what he tells the person when she opens him, computed in her browser
 * from her own wallet and learning data. Nothing leaves the browser and no other role sees them.
 *
 * - `alert`: something the simulation could not do (a debit without balance), the card statement
 *   about to fall due, a loan installment coming. Unread messages stay in the bell, not here.
 * - `pending`: the active mission, weekly challenges, reviews, the next guide, the program deadline.
 * - `invest`: time of the investments: a fixed-term deposit maturing, units settling, days held.
 * - `goal`: goals and the emergency fund, how far they are or that they were reached.
 * - `progress`: the next unlock and how many of its conditions are met.
 *
 * Texts are i18n keys with their values; amounts appear only as the person's own, in her browser.
 */
export type NoticeKind = 'alert' | 'pending' | 'invest' | 'goal' | 'progress';

export interface Notice {
  id: string;
  kind: NoticeKind;
  icon: IconName;
  /** i18n key under `wallet.fuerte.notices` and its values. */
  key: string;
  params: Record<string, string | number>;
  to: string;
}

/** Days ahead that make a due date worth a notice. */
export const SOON_DAYS = 7;

const ORDER: Record<NoticeKind, number> = { alert: 0, pending: 1, invest: 2, goal: 3, progress: 4 };

/** The first simulated day after `from` that falls on a day of the month. */
function nextDayOfMonth(from: number, dom: number): number {
  for (let d = from + 1; d <= from + 31; d++) if (dayOfMonth(d) === dom) return d;
  return from + 30;
}

export function fuerteNotices(input: {
  wallet: WalletState;
  next?: LevelStatus;
  sectionName: (levelId: string) => string;
  activeMission?: { id: string; title: string; minutes: number };
  reminders: Reminder[];
  instrumentName: (id: string) => string;
  /** Where each level's section lives, for the progress notice. */
  levelRoute: (levelId: string) => string;
}): Notice[] {
  const { wallet } = input;
  const out: Notice[] = [];

  // Alerts
  if (wallet.pendingDebit) {
    out.push({ id: 'alert:debit', kind: 'alert', icon: 'warning', key: 'debit', params: { name: wallet.pendingDebit.counterparty ?? '', expenseKey: wallet.pendingDebit.expenseKey ?? '', amount: wallet.pendingDebit.amount }, to: '/app/save/pockets' });
  }
  const statement = wallet.card?.statement;
  if (statement && statementLeft(wallet).gt(0) && statement.dueDay >= wallet.day && statement.dueDay - wallet.day <= SOON_DAYS) {
    out.push({ id: `alert:card:${statement.dueDay}`, kind: 'alert', icon: 'credit_card', key: 'card', params: { count: statement.dueDay - wallet.day }, to: '/app/pay/credit' });
  }
  for (const plan of wallet.plans ?? []) {
    if (plan.closed || plan.paid >= plan.count) continue;
    const day = nextDayOfMonth(wallet.day, plan.dayOfMonth);
    if (day - wallet.day <= SOON_DAYS) {
      out.push({ id: `alert:plan:${plan.id}:${plan.paid}`, kind: 'alert', icon: 'request_quote', key: 'installment', params: { n: plan.paid + 1, total: plan.count, name: plan.counterparty, count: day - wallet.day }, to: '/app/pay/credit' });
    }
  }

  // Pending tasks
  if (input.activeMission) {
    out.push({ id: `pending:mission:${input.activeMission.id}`, kind: 'pending', icon: 'flag', key: 'mission', params: { title: input.activeMission.title, minutes: input.activeMission.minutes }, to: `/app/missions/${input.activeMission.id}` });
  }
  for (const r of input.reminders) {
    if (r.kind === 'goal') continue; // goals are told below, with their progress
    const icon: IconName = r.kind === 'review' ? 'replay' : r.kind === 'guide' ? 'menu_book' : r.kind === 'weekly' ? 'checklist' : 'event';
    out.push({ id: `pending:${r.id}`, kind: 'pending', icon, key: `reminder_${r.kind}`, params: r.params, to: r.to });
  }

  // Time of the investments
  for (const dep of wallet.deposits ?? []) {
    if (dep.paidOut) continue;
    const left = dep.startDay + dep.days - wallet.day;
    if (left >= 0) out.push({ id: `invest:deposit:${dep.id}`, kind: 'invest', icon: 'account_balance', key: left === 0 ? 'depositToday' : 'deposit', params: { kind: dep.kind, count: left }, to: '/app/save/yield' });
  }
  const holdings = wallet.brokerage?.holdings ?? [];
  const settling = holdings.filter((h) => h.settlesDay > wallet.day);
  if (settling.length > 0) {
    const first = Math.min(...settling.map((h) => h.settlesDay));
    out.push({ id: `invest:settling:${first}`, kind: 'invest', icon: 'schedule', key: 'settling', params: { count: first - wallet.day }, to: '/app/invest' });
  }
  const firstBuy = (wallet.brokerage?.trades ?? []).filter((tr) => tr.side === 'buy').map((tr) => tr.day);
  if (holdings.length > 0 && firstBuy.length > 0) {
    const ids = [...new Set(holdings.map((h) => h.instrumentId))];
    out.push({ id: `invest:held:${ids.join(',')}`, kind: 'invest', icon: 'trending_up', key: ids.length === 1 ? 'heldOne' : 'heldMany', params: { name: input.instrumentName(ids[0]!), count: wallet.day - Math.min(...firstBuy), instruments: ids.length }, to: '/app/invest' });
  }

  // Goals and the emergency fund
  for (const p of wallet.pockets) {
    if (!p.goal || new Decimal(p.goal).lte(0)) continue;
    const pct = Decimal.min(100, new Decimal(p.amount).div(p.goal).times(100)).floor().toNumber();
    out.push({ id: `goal:${p.id}:${pct >= 100 ? 'done' : 'open'}`, kind: 'goal', icon: pct >= 100 ? 'task_alt' : p.isEmergencyFund ? 'shield' : 'savings', key: pct >= 100 ? 'goalReached' : 'goal', params: { name: p.name, pct }, to: '/app/save/pockets' });
  }

  // The next unlock
  if (input.next) {
    const met = input.next.conditions.filter((c) => c.met).length;
    out.push({ id: `progress:${input.next.level.id}:${met}`, kind: 'progress', icon: 'lock_open', key: 'unlock', params: { section: input.sectionName(input.next.level.id), met, total: input.next.conditions.length }, to: input.levelRoute(input.next.level.id) });
  }

  return out.map((n, i) => ({ n, i })).sort((a, b) => ORDER[a.n.kind] - ORDER[b.n.kind] || a.i - b.i).map(({ n }) => n);
}

/** Which notices make Fuerte show a badge: all of them when chatty, only alerts with "Solo lo importante". */
export const badgeNotices = (list: Notice[], presence: 'chatty' | 'important' | 'silent') =>
  presence === 'silent' ? [] : presence === 'important' ? list.filter((n) => n.kind === 'alert') : list.filter((n) => n.kind === 'alert' || n.kind === 'pending');
