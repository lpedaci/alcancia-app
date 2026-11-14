import Decimal from 'decimal.js';
import cardsJson from '@/data/learning-cards.json';
import { depositQuote, walletMetrics } from '@/features/wallet/engine/engine';
import { EMPLOYER } from '@/features/wallet/engine/profile';
import type { WalletState } from '@/features/wallet/engine/types';

/**
 * Learning cards in the right moment (CLAUDE.md 5.3, D-76): a declarative catalog
 * (`src/data/learning-cards.json`) and the rules that pick a card from what the wallet just did.
 * Triggers are found by comparing the wallet before and after an action, so every screen gets them
 * without wiring each button. Pure functions, tested in `cards.test.ts`.
 */
export type CardTrigger =
  | 'salary_received'
  | 'subscription_first_debit'
  | 'transfer_new_payee'
  | 'yield_mode_chosen'
  | 'term_deposit_made'
  | 'card_paid_partially'
  | 'installment_purchase'
  | 'loan_taken'
  | 'investment_bought'
  | 'message_received';

export type CardCondition = 'no_saving_since_last_salary' | 'real_rate_negative' | 'emergency_below_3_months' | 'suspicious';

export interface GuideLink {
  guideId: string;
  /** Part of the guide as the guide shows it, from 1 (D-78). */
  part: number;
}

export interface CardQuestion {
  prompt: string;
  options: { id: string; text: string }[];
  correct: string;
  feedback: { correct: string; incorrect: string };
}

export interface LearningCardDef {
  id: string;
  trigger: CardTrigger;
  condition?: CardCondition;
  title: string;
  body: string;
  sourceIds: string[];
  question?: CardQuestion;
  guide: GuideLink;
  action?: { label: string; to: string };
}

export interface ScreenWhy {
  title?: string;
  body: string;
  sourceIds: string[];
  guide: GuideLink;
}

export type WhyScreen = 'account' | 'pay' | 'transfer' | 'qr' | 'bills' | 'credit' | 'budget' | 'pockets' | 'yield' | 'invest' | 'profile';

export const LEARNING_CARDS = cardsJson.cards as LearningCardDef[];
export const SCREEN_WHY = cardsJson.screens as Record<WhyScreen, ScreenWhy>;
export const cardById = (id: string) => LEARNING_CARDS.find((c) => c.id === id);

/** What the person already saw and answered well, in the local store (never shared, D-58). */
export interface CardRecord {
  shown: string[];
  correct: string[];
}

export const emptyRecord = (): CardRecord => ({ shown: [], correct: [] });

const SUBSCRIPTION_KEYS = new Set(['subscription', 'streaming']);

/** Which triggers and conditions hold between two wallet states: the facts of one action. */
export function detectFacts(prev: WalletState, next: WalletState): { trigger: CardTrigger; conditions: CardCondition[] }[] {
  const before = new Set(prev.movements.map((m) => m.id));
  const added = next.movements.filter((m) => !before.has(m.id));
  const facts: { trigger: CardTrigger; conditions: CardCondition[] }[] = [];

  if (added.some((m) => m.type === 'income' && m.counterparty === EMPLOYER)) {
    // Savings moved into a pocket since the previous salary (if any) in the state before the action.
    const lastSalary = [...prev.movements].reverse().find((m) => m.type === 'income' && m.counterparty === EMPLOYER);
    const since = lastSalary ? prev.movements.slice(prev.movements.indexOf(lastSalary) + 1) : prev.movements;
    const saved = since.some((m) => m.type === 'pocket_in' && new Decimal(m.amount).lt(0));
    facts.push({ trigger: 'salary_received', conditions: saved ? [] : ['no_saving_since_last_salary'] });
  }

  const hadSubscription = prev.movements.some((m) => m.expenseKey && SUBSCRIPTION_KEYS.has(m.expenseKey));
  if (!hadSubscription && added.some((m) => m.type === 'bill' && m.expenseKey && SUBSCRIPTION_KEYS.has(m.expenseKey))) {
    facts.push({ trigger: 'subscription_first_debit', conditions: [] });
  }

  // Transfers the person makes (expenses of the profile, like the rent, are not new payees).
  const payees = new Set(prev.movements.filter((m) => m.type === 'transfer_out').map((m) => m.counterparty));
  if (added.some((m) => m.type === 'transfer_out' && !m.expenseKey && !m.scam && !payees.has(m.counterparty))) {
    facts.push({ trigger: 'transfer_new_payee', conditions: [] });
  }

  if (prev.yieldMode !== next.yieldMode && next.yieldMode !== 'none') facts.push({ trigger: 'yield_mode_chosen', conditions: [] });

  const depositIds = new Set((prev.deposits ?? []).map((d) => d.id));
  for (const deposit of (next.deposits ?? []).filter((d) => !depositIds.has(d.id))) {
    const quote = depositQuote(next, deposit.kind, deposit.amount, deposit.days);
    facts.push({ trigger: 'term_deposit_made', conditions: quote.purchasingPower.lt(deposit.amount) ? ['real_rate_negative'] : [] });
  }

  const statement = next.card?.statement;
  if (added.some((m) => m.type === 'card_payment') && statement && new Decimal(statement.paid).lt(statement.total)) {
    facts.push({ trigger: 'card_paid_partially', conditions: [] });
  }

  const planIds = new Set((prev.plans ?? []).map((p) => p.id));
  for (const plan of (next.plans ?? []).filter((p) => !planIds.has(p.id))) {
    facts.push({ trigger: plan.kind === 'loan' ? 'loan_taken' : 'installment_purchase', conditions: [] });
  }

  const tradeIds = new Set((prev.brokerage?.trades ?? []).map((t) => t.id));
  if ((next.brokerage?.trades ?? []).some((t) => !tradeIds.has(t.id) && t.side === 'buy')) {
    const months = new Decimal(walletMetrics(next).emergency_months);
    facts.push({ trigger: 'investment_bought', conditions: months.lt(3) ? ['emergency_below_3_months'] : [] });
  }

  const messageIds = new Set((prev.messages ?? []).map((m) => m.id));
  for (const message of (next.messages ?? []).filter((m) => !messageIds.has(m.id))) {
    facts.push({ trigger: 'message_received', conditions: message.suspicious ? ['suspicious'] : [] });
  }

  return facts;
}

/**
 * The card to show for one action, or none (D-76): at most one per action (the first of the catalog
 * that matches), never one already answered well, and a card without a question only once.
 */
export function pickCard(prev: WalletState, next: WalletState, record: CardRecord, catalog = LEARNING_CARDS): LearningCardDef | undefined {
  const facts = detectFacts(prev, next);
  if (facts.length === 0) return undefined;
  return catalog.find((card) => {
    if (record.correct.includes(card.id)) return false;
    if (!card.question && record.shown.includes(card.id)) return false;
    return facts.some((f) => f.trigger === card.trigger && (!card.condition || f.conditions.includes(card.condition)));
  });
}

/** Records a card as shown, and as answered well when it was (missions and free mode share it). */
export function recordCard(record: CardRecord, cardId: string, answeredCorrectly?: boolean): CardRecord {
  return {
    shown: record.shown.includes(cardId) ? record.shown : [...record.shown, cardId],
    correct: answeredCorrectly && !record.correct.includes(cardId) ? [...record.correct, cardId] : record.correct,
  };
}

/** Link to the exact part of a guide, with the screen to come back to (D-78, built in step 17). */
export function guideHref(guide: GuideLink, from: string): string {
  return `/app/learn/guides/${guide.guideId}?part=${guide.part}&from=${encodeURIComponent(from)}`;
}
