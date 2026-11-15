import Decimal from 'decimal.js';
import { monthOf, pocketsTotal, walletMetrics } from '@/features/wallet/engine/engine';
import type { WalletState } from '@/features/wallet/engine/types';

/**
 * The two layers of the Hornero brand (D-85), read from the person's practice wallet. Shown only in
 * the integrated mode (D-75): Alcancía's own mode keeps its tone.
 * - Saving: the nest is built little by little (what went into the pockets this month, the last addition).
 * - Solidity: the nest holds (months of expenses the emergency fund covers, a suspicious message reported).
 * Amounts stay in the browser like the rest of the wallet; the partner never receives them (5.5).
 */
export interface NestSummary {
  /** Everything kept in pockets today. */
  total: Decimal;
  /** Net amount that went into pockets during the current month of the simulation (never negative). */
  grewThisMonth: Decimal;
  /** The last amount moved into a pocket, if any. */
  lastAddition: Decimal | null;
  /** Months of essential expenses the emergency fund covers, when there is one. */
  monthsCovered: string | null;
  /** A suspicious message was reported and none was answered: the nest resisted. */
  resisted: boolean;
}

export function nestSummary(state: WalletState): NestSummary {
  const month = monthOf(state.day);
  const pocketMoves = state.movements.filter((m) => m.type === 'pocket_in' || m.type === 'pocket_out');
  // pocket_in debits the available balance (negative amount); pocket_out credits it back.
  const net = pocketMoves.filter((m) => monthOf(m.day) === month).reduce((acc, m) => acc.minus(m.amount), new Decimal(0));
  const lastIn = [...pocketMoves].reverse().find((m) => m.type === 'pocket_in');
  const metrics = walletMetrics(state);
  const messages = state.messages ?? [];
  return {
    total: pocketsTotal(state),
    grewThisMonth: Decimal.max(net, 0),
    lastAddition: lastIn ? new Decimal(lastIn.amount).abs() : null,
    monthsCovered: metrics.emergency_pocket ? metrics.emergency_months : null,
    resisted: messages.some((m) => m.suspicious && m.status === 'reported') && !messages.some((m) => m.status === 'fell'),
  };
}
