import { describe, expect, it } from 'vitest';
import { createWallet } from '@/features/wallet/engine/engine';
import type { WalletState } from '@/features/wallet/engine/types';
import { badgeNotices, fuerteNotices } from './notices';

/** D-290: Fuerte tells pending tasks, alerts, the time of the investments, goals and progress. */
const base = (patch: Partial<WalletState> = {}): WalletState => ({ ...createWallet('p-test'), day: 40, ...patch });
const run = (wallet: WalletState, extra: Partial<Parameters<typeof fuerteNotices>[0]> = {}) =>
  fuerteNotices({
    wallet,
    reminders: [],
    sectionName: (id) => id,
    instrumentName: (id) => `name-${id}`,
    levelRoute: () => '/app',
    ...extra,
  });

describe('Fuerte notices', () => {
  it('says nothing when there is nothing to say', () => {
    expect(run(base())).toEqual([]);
  });

  it('puts a debit without balance first, before the pending mission', () => {
    const list = run(base({ pendingDebit: { counterparty: 'Luz', amount: '50000.00', day: 40 } }), {
      activeMission: { id: 'mission-5', title: 'El préstamo tentador', minutes: 5 },
    });
    expect(list.map((n) => n.kind)).toEqual(['alert', 'pending']);
    expect(list[0]!.to).toBe('/app/save/pockets');
    expect(list[1]!.to).toBe('/app/missions/mission-5');
  });

  it('warns about a loan installment within a week, with its number', () => {
    const wallet = base({
      day: 40,
      plans: [{ id: 'l1', kind: 'loan', counterparty: 'Préstamo', principal: '100000.00', tna: '0.9', installment: '12000.00', count: 12, paid: 2, dayOfMonth: 15, startDay: 1 }],
    });
    // Day 40 is day 10 of month 2: the 15th is day 45, five days ahead
    const n = run(wallet).find((x) => x.key === 'installment');
    expect(n?.params).toMatchObject({ n: 3, total: 12, count: 5 });
  });

  it('tells when a fixed-term deposit matures and how long an investment has been held', () => {
    const wallet = base({
      day: 70,
      deposits: [{ id: 'd1', kind: 'traditional', amount: '100000.00', rate: '0.3', days: 30, startDay: 45 }],
      brokerage: {
        openedDay: 50,
        profile: 'moderate',
        cash: '0.00',
        holdings: [{ instrumentId: 'cedear-spy', quantity: 3, cost: '60000.00', settlesDay: 61 }],
        trades: [{ id: 't1', day: 60, side: 'buy', instrumentId: 'cedear-spy', quantity: 3, price: '20000.00', commission: '0.00', marketFee: '0.00', total: '60000.00', settlement: '24h' }],
        seq: 1,
      } as unknown as WalletState['brokerage'],
    });
    const list = run(wallet);
    expect(list.find((n) => n.key === 'deposit')?.params.count).toBe(5);
    expect(list.find((n) => n.key === 'heldOne')?.params).toMatchObject({ name: 'name-cedear-spy', count: 10 });
  });

  it('shows the progress of a goal, and celebrates it when reached', () => {
    const wallet = base({
      pockets: [
        { id: 'p1', name: 'Fondo de emergencia', amount: '230000.00', goal: '300000.00', isEmergencyFund: true },
        { id: 'p2', name: 'Vacaciones', amount: '500000.00', goal: '400000.00' },
      ],
    });
    const goals = run(wallet).filter((n) => n.kind === 'goal');
    expect(goals.map((g) => [g.key, g.params.pct])).toEqual([
      ['goal', 76],
      ['goalReached', 100],
    ]);
  });

  it('counts in the badge only alerts with "Solo lo importante", and nothing in "Silencio"', () => {
    const list = run(base({ pendingDebit: { counterparty: 'Luz', amount: '50000.00', day: 40 } }), {
      activeMission: { id: 'mission-5', title: 'El préstamo tentador', minutes: 5 },
    });
    expect(badgeNotices(list, 'chatty')).toHaveLength(2);
    expect(badgeNotices(list, 'important')).toHaveLength(1);
    expect(badgeNotices(list, 'silent')).toHaveLength(0);
  });
});
