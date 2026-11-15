import { describe, expect, it } from 'vitest';
import { buildDemoWallet } from '@/features/wallet/engine/demo';
import { createPocket, createWallet, markMessage, moveToPocket } from '@/features/wallet/engine/engine';
import type { WalletState } from '@/features/wallet/engine/types';
import { nestSummary } from './nest';

const withBalance = (balance: string): WalletState => ({ ...createWallet('p-test'), balance, day: 31 });

describe('Hornero nest summary (D-85)', () => {
  it('the nest grows with what went into pockets this month, and remembers the last addition', () => {
    let s = createPocket(withBalance('100000.00'), { id: 'p1', name: 'Viaje' });
    s = moveToPocket(s, 'p1', '15000');
    s = moveToPocket(s, 'p1', '5000');
    const nest = nestSummary(s);
    expect(nest.grewThisMonth.toFixed(2)).toBe('20000.00');
    expect(nest.lastAddition?.toFixed(2)).toBe('5000.00');
    expect(nest.total.toFixed(2)).toBe('20000.00');
  });

  it('a new wallet has an empty nest, no months covered and has not resisted anything yet', () => {
    const nest = nestSummary(createWallet('p-test'));
    expect(nest.grewThisMonth.toFixed(2)).toBe('0.00');
    expect(nest.lastAddition).toBeNull();
    expect(nest.monthsCovered).toBeNull();
    expect(nest.resisted).toBe(false);
  });

  it('Mariana: her emergency fund holds about 2 months of expenses (demo state)', () => {
    const nest = nestSummary(buildDemoWallet('p-mariana')!);
    expect(Number(nest.monthsCovered)).toBeGreaterThanOrEqual(2);
    expect(Number(nest.monthsCovered)).toBeLessThan(3);
  });

  it('the nest resisted only when a suspicious message was reported and none was answered', () => {
    const base: WalletState = {
      ...createWallet('p-test'),
      messages: [
        { id: 'm1', day: 1, templateId: 'fake-support', suspicious: true, status: 'unread' },
        { id: 'm2', day: 2, templateId: 'fake-link', suspicious: true, status: 'unread' },
      ],
    };
    const reported = markMessage(base, 'm1', 'reported');
    expect(nestSummary(reported).resisted).toBe(true);
    expect(nestSummary(markMessage(reported, 'm2', 'fell')).resisted).toBe(false);
  });
});
