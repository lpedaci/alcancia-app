import { describe, expect, it } from 'vitest';
import { D } from '@/lib/finance';
import { advanceDays, createPocket, createWallet, deletePocket, moveToPocket, nextGoalPocketId, setPocketGoal, WalletError } from './engine';

describe('new goal pockets', () => {
  it('gives every new goal its own id, so five goals are five pockets', () => {
    let s = createWallet('p');
    const before = s.pockets.length;
    for (let i = 1; i <= 5; i += 1) {
      const id = nextGoalPocketId(s);
      s = setPocketGoal(createPocket(s, { id, name: `Meta ${i}` }), id, '1000.00');
    }
    const goals = s.pockets.slice(before);
    expect(goals).toHaveLength(5);
    expect(new Set(goals.map((p) => p.id)).size).toBe(5);
    expect(goals.map((p) => p.name)).toEqual(['Meta 1', 'Meta 2', 'Meta 3', 'Meta 4', 'Meta 5']);
  });

  it('skips an id that is already taken', () => {
    const s = createPocket(createWallet('p'), { id: `pocket-goal-${createWallet('p').pockets.length + 1}`, name: 'Tomada' });
    expect(s.pockets.some((p) => p.id === nextGoalPocketId(s))).toBe(false);
  });
});

describe('deleting a goal (D-220)', () => {
  it('returns what the pocket holds to the available balance and removes it', () => {
    let s = advanceDays(createWallet('p'), 1);
    const id = nextGoalPocketId(s);
    s = moveToPocket(createPocket(s, { id, name: 'Viaje' }), id, '120000.50');
    const before = D(s.balance);
    const after = deletePocket(s, id);
    expect(after.pockets.some((p) => p.id === id)).toBe(false);
    expect(D(after.balance).minus(before).toFixed(2)).toBe('120000.50');
    expect(after.movements.at(-1)).toMatchObject({ type: 'pocket_out', amount: '120000.50' });
  });

  it('deletes an empty pocket without a movement', () => {
    const s = createPocket(createWallet('p'), { id: 'g', name: 'Vacía' });
    const after = deletePocket(s, 'g');
    expect(after.pockets.some((p) => p.id === 'g')).toBe(false);
    expect(after.movements).toHaveLength(s.movements.length);
  });

  it('keeps the basic Ahorro pocket and the emergency fund', () => {
    const s = createPocket(createPocket(createWallet('p'), { id: 'pocket-savings', name: 'Ahorro' }), { id: 'fund', name: 'Fondo', isEmergencyFund: true });
    expect(() => deletePocket(s, 'pocket-savings')).toThrow(WalletError);
    expect(() => deletePocket(s, 'fund')).toThrow(WalletError);
  });
});
