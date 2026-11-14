import { beforeEach, describe, expect, it } from 'vitest';
import { signOut, switchPerson } from '@/features/auth/auth-service';
import { resetAll, signInAs } from '@/test/session';
import { clearReturnState, rememberScroll, safeReturnPath } from './use-return-state';

/** D-212 and its condition: the kept fields are cleared on sign out, "Ver como" and "Empezar de cero". */
const keep = (personId: string, field: string, value: string) => sessionStorage.setItem(`alcancia-return:${personId}:${field}`, JSON.stringify(value));
const kept = () => Object.keys(sessionStorage).filter((k) => k.startsWith('alcancia-return:') || k.startsWith('alcancia-scroll:'));

beforeEach(() => {
  resetAll();
  sessionStorage.clear();
});

describe('return state of the guide round trip (D-212)', () => {
  it('is cleared when the session closes', () => {
    signInAs('p-mariana');
    keep('p-mariana', 'yield.deposit.amount', '150.000');
    rememberScroll('/app/save/yield');
    signOut();
    expect(kept()).toEqual([]);
  });

  it('is cleared when "Ver como" changes the person', () => {
    signInAs('p-mariana');
    keep('p-mariana', 'pay.transfer.alias', 'sofia.ramos.practica');
    switchPerson('p-diego');
    expect(kept()).toEqual([]);
  });

  it('"Empezar de cero" clears only that person\'s fields', () => {
    keep('p-mariana', 'yield.deposit.amount', '150.000');
    keep('p-diego', 'pay.transfer.amount', '12.000');
    clearReturnState('p-mariana');
    expect(kept()).toEqual(['alcancia-return:p-diego:pay.transfer.amount']);
  });

  it('only accepts app paths as a return target', () => {
    expect(safeReturnPath('/app/save/yield')).toBe('/app/save/yield');
    for (const bad of ['https://evil.example', '//evil.example', '/login', null]) expect(safeReturnPath(bad)).toBeUndefined();
  });
});
