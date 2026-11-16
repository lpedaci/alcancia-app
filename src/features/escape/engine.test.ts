import { describe, expect, it } from 'vitest';
import { isCorrect } from '@/features/learning/questions';
import {
  ECONOMY,
  expectedError,
  failTry,
  lettersOf,
  newGame,
  openDoor,
  openHint,
  reflect,
  ROOMS,
  sealOf,
  solveRoom,
  tryDoor,
  word,
} from './engine';

/** D-304: the rules of the original escape room "Tu primer sueldo", adapted to Alcancía. */
const fixed = () => 0; // always the first word, METAS

describe('escape room rules', () => {
  it('has five rooms in order, each with a lock of a different evaluation type (5.1)', () => {
    expect(ROOMS.map((r) => r.habit)).toEqual(['Claridad', 'Orden', 'Prudencia', 'Previsión', 'Seguridad']);
    const types = ROOMS.map((r) => r.before?.type ?? r.lock.type);
    expect(new Set(types).size).toBe(5);
    expect(types).toEqual(['numeric', 'categorize', 'single', 'ordering', 'branching']);
  });

  it('every lock and challenge accepts its right answer (hand-checked amounts of the original)', () => {
    const right = (q: (typeof ROOMS)[number]['lock']) => {
      switch (q.type) {
        case 'numeric':
          return q.numeric.answer;
        case 'single':
          return q.correctOptionIds[0];
        case 'categorize':
          return Object.fromEntries(q.categorize.items.map((i) => [i.id, i.categoryId]));
        case 'ordering':
          return q.ordering.correctOrder;
        case 'branching':
          return ['app', 'keep', 'drop', 'check'];
        default:
          return undefined;
      }
    };
    for (const room of ROOMS) {
      expect(isCorrect(room.lock, right(room.lock)), room.id).toBe(true);
      if (room.before) expect(isCorrect(room.before, right(room.before)), room.id).toBe(true);
    }
    expect(ROOMS[0]!.lock.type === 'numeric' && ROOMS[0]!.lock.numeric.answer).toBe('830000'); // 1.000.000 − 17 %
    expect(ROOMS[1]!.lock.type === 'numeric' && ROOMS[1]!.lock.numeric.answer).toBe('66000'); // 3.000 × 22
    expect(ROOMS[3]!.lock.type === 'numeric' && ROOMS[3]!.lock.numeric.answer).toBe('10000'); // 110.000 − 100.000
  });

  it('explains the expected mistakes of a numeric lock', () => {
    expect(expectedError(ROOMS[0]!, '1.000.000')).toMatch(/bruto/);
    expect(expectedError(ROOMS[0]!, '760000')).toMatch(/contribuciones/);
    expect(expectedError(ROOMS[1]!, '3000')).toMatch(/un solo café/);
    expect(expectedError(ROOMS[0]!, '123')).toBeUndefined();
  });

  it('hints cost a key, a reflection gives one, and three fails in a row give a free hint', () => {
    let s = newGame(fixed);
    expect(s.keys).toBe(ECONOMY.keys);
    s = openHint(s, ROOMS[0]!);
    expect(s.keys).toBe(2);
    expect(s.hintsUsed).toBe(1);
    s = reflect(s, 'room-1', 'El neto');
    expect(s.keys).toBe(3);
    s = reflect(s, 'room-1', 'Otra vez'); // once per room
    expect(s.keys).toBe(3);
    s = failTry(failTry(failTry(s, 'room-1'), 'room-1'), 'room-1');
    s = openHint(s, ROOMS[0]!);
    expect(s.keys).toBe(3); // free
    expect(s.hintsUsed).toBe(2);
    expect(openHint(s, ROOMS[0]!)).toBe(s); // no more hints in this room
  });

  it('without keys, a hint does not open until three fails', () => {
    let s = { ...newGame(fixed), keys: 0 };
    expect(openHint(s, ROOMS[1]!)).toBe(s);
    s = failTry(failTry(failTry(s, 'room-2'), 'room-2'), 'room-2');
    expect(openHint(s, ROOMS[1]!).hintsOpen['room-2']).toBe(1);
  });

  it('each solved room gives a letter, and the door opens only with the word that answers', () => {
    let s = newGame(fixed);
    expect(word(s).word).toBe('METAS');
    expect(tryDoor(s, 'metas')).toBe('missing');
    for (const room of ROOMS) s = solveRoom(s, room.id);
    expect(lettersOf(s).join('')).toBe('METAS');
    expect(tryDoor(s, 'temas')).toBe('anagram');
    expect(tryDoor(s, 'samet')).toBe('wrong');
    expect(tryDoor(s, ' Metas ')).toBe('open');
    s = openDoor(s);
    expect(s.badges).toEqual(['bronze']);
    expect(newGame(fixed, s.badges).badges).toEqual(['bronze']); // badges are kept
  });

  it('gives the seal by hints used', () => {
    expect([0, 1, 2, 4, 5].map(sealOf)).toEqual(['gold', 'gold', 'silver', 'silver', 'bronze']);
  });

  it('never breaks an amount between the sign and the number (D-68)', () => {
    expect(JSON.stringify(ROOMS)).not.toMatch(/\$ \d/);
  });

  it('keeps the voice rules: tú, no exclamations and no em dashes', () => {
    expect(JSON.stringify(ROOMS)).not.toMatch(/—|¡|\b(vos|tenés|podés|sabés|fijate|probá|mirá)\b/);
  });
});
