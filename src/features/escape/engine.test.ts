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
  nextVersion,
  reflect,
  ROOMS,
  roomsOf,
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

  it('has three versions per room, and every lock and challenge of each one accepts its right answer (D-310)', () => {
    const answers: Record<string, string[]> = {
      'esc-5-messages-2': ['official', 'call', 'check', 'confirm'],
      'esc-5-messages-3': ['official', 'check', 'drop', 'balance'],
    };
    const right = (q: (typeof ROOMS)[number]['lock']) => {
      if (answers[q.id]) return answers[q.id];
      switch (q.type) {
        case 'numeric':
          return q.numeric.answer;
        case 'single':
          return q.correctOptionIds[0];
        case 'categorize':
          return Object.fromEntries(q.categorize.items.map((i) => [i.id, i.categoryId]));
        case 'ordering':
          return q.ordering.correctOrder;
        default:
          return undefined;
      }
    };
    for (const room of ROOMS) expect(room.versions, room.id).toHaveLength(2);
    for (const version of [1, 2] as const) {
      for (const room of roomsOf(version)) {
        expect(isCorrect(room.lock, right(room.lock)), `${version} ${room.lock.id}`).toBe(true);
        if (room.before) expect(isCorrect(room.before, right(room.before)), `${version} ${room.before.id}`).toBe(true);
      }
    }
    // Hand-checked amounts of the original (escape-versiones.js)
    const answer = (v: 1 | 2, i: number) => {
      const q = roomsOf(v)[i]!.lock;
      return q.type === 'numeric' ? q.numeric.answer : q.type;
    };
    expect([0, 1, 2, 3].map((i) => answer(1, i))).toEqual(['996000', '88000', '336000', '21000']); // 1.200.000 − 17 %; (2.500 + 1.500) × 22; 12 × 28.000; 100.000 × 1,1 × 1,1 − 100.000
    expect([0, 1, 2, 3].map((i) => answer(2, i))).toEqual(['930000', '114000', '34000', '6000']); // 1.000.000 − 170.000 + 100.000; 3.000 × 22 + 12.000 × 4; 430.000 − 396.000; 110.000 − 104.000
    // A version keeps the fields it does not change
    expect(roomsOf(1)[2]!.objects).toEqual(ROOMS[2]!.objects);
    expect(roomsOf(2)[4]!.guide).toBe(ROOMS[4]!.guide);
  });

  it('explains the expected mistakes of each version', () => {
    expect(expectedError(roomsOf(1)[0]!, '913000')).toMatch(/horas extras/);
    expect(expectedError(roomsOf(2)[0]!, '913000')).toMatch(/no remunerativa/);
    expect(expectedError(roomsOf(1)[3]!, '20000')).toMatch(/precio ya aumentado/);
    expect(expectedError(roomsOf(2)[3]!, '14000')).toMatch(/rendimiento/);
  });

  it('gives the badge of the version played, and suggests the first one still missing', () => {
    let s = newGame(fixed, ['bronze'], 2);
    for (const room of ROOMS) s = solveRoom(s, room.id);
    expect(openDoor(s).badges).toEqual(['bronze', 'gold']);
    expect(openDoor({ ...s, version: undefined }).badges).toEqual(['bronze']); // games saved before D-310
    expect(nextVersion([])).toBe(0);
    expect(nextVersion(['bronze'])).toBe(1);
    expect(nextVersion(['bronze', 'gold'])).toBe(1);
    expect(nextVersion(['bronze', 'silver', 'gold'])).toBe(2);
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
