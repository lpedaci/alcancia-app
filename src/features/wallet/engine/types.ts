import type { MoneyString } from '@/types/domain';

/**
 * State of the practice wallet (CLAUDE.md 7, docs/wallet-engine.md). It lives only in the
 * participant's browser (`walletStore`, one space per person) and never reaches another role (D-58).
 * Money is always a decimal string with two places.
 */
export type BudgetCategory = 'needs' | 'wants' | 'savings';

export type MovementType =
  | 'income'
  | 'transfer_out'
  | 'transfer_in'
  | 'qr_payment'
  | 'bill'
  | 'yield'
  | 'pocket_in'
  | 'pocket_out'
  | 'loan';

export interface WalletMovement {
  id: string;
  day: number;
  type: MovementType;
  /** Signed: positive enters the available balance, negative leaves it. */
  amount: MoneyString;
  /** Always fictitious (1.1.1). */
  counterparty: string;
  /** Expense key of the profile (wallet-engine.md, section 4), when it comes from it. */
  expenseKey?: ExpenseKey;
  /** Suggested by the engine; the person confirms or changes it (D-114). */
  suggestedCategory?: BudgetCategory;
  /** Confirmed by the person: only these count for `categorized_movements`. */
  category?: BudgetCategory;
}

export interface Pocket {
  id: string;
  name: string;
  amount: MoneyString;
  /** Level 4: pockets with a goal. The basic "Ahorro" pocket of level 1 has none (D-53). */
  goal?: MoneyString;
  /** Only one pocket can be the emergency fund (wallet-engine.md, section 7). */
  isEmergencyFund?: boolean;
  /** How the goal was set (SIM-8): today's price and term, so the card can explain the adjustment. */
  plan?: { currentPrice: MoneyString; months: number; day: number };
}

export type ExpenseKey =
  | 'rent'
  | 'groceries'
  | 'electricity'
  | 'gas'
  | 'phone'
  | 'transport'
  | 'outings'
  | 'clothes'
  | 'streaming'
  | 'subscription';

/** Monthly amount of each expense, updated at the start of each simulated month (section 5). */
export type ExpenseAmounts = Record<ExpenseKey, MoneyString>;

export interface MonthSummary {
  /** Zero-based simulated month: days 30k + 1 to 30(k + 1). */
  month: number;
  income: MoneyString;
  needs: MoneyString;
  wants: MoneyString;
  /** Net amount moved into pockets during the month. */
  saved: MoneyString;
  yield: MoneyString;
  /** Money taken out of "Ahorro" or the emergency fund for things that are not emergencies. */
  savingsWithdrawn: boolean;
  green: boolean;
}

export type YieldMode = 'none' | 'remunerated' | 'money_market';

export interface WalletState {
  version: 1;
  personId: string;
  /** Simulated day, from 0 (account opened). Day 1 is the first salary (section 2). */
  day: number;
  scenarioId: 'low' | 'medium' | 'high';
  balance: MoneyString;
  pockets: Pocket[];
  movements: WalletMovement[];
  yieldMode: YieldMode;
  /** Net salary in force (D-54, raised every 3 months by D-111). */
  salary: MoneyString;
  expenses: ExpenseAmounts;
  /** The surprise subscription of mission 1 (D-55) keeps being debited until it is cancelled. */
  subscriptionActive: boolean;
  /** A debit that could not be charged: the advance stops here (section 4, insufficient balance). */
  pendingDebit?: { expenseKey: ExpenseKey; amount: MoneyString; day: number };
  monthSummaries: MonthSummary[];
  completedMissionIds: string[];
  securitySettings: { twoFactor: boolean; dailyLimit?: MoneyString };
  /** Sequence for movement ids, so the state is deterministic. */
  seq: number;
}

/** Metrics the level engine reads (section 13). Computed in the person's browser only. */
export interface WalletMetrics {
  categorized_movements: number;
  months_closed_green: number;
  /** Has a pocket marked as emergency fund (level 6 condition). */
  emergency_pocket: number;
  /** Fund ÷ essential monthly expenses, one decimal, rounded down. */
  emergency_months: string;
  high_rate_debt: number;
}
