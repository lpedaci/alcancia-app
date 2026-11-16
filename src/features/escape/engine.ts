import Decimal from 'decimal.js';
import data from '@/data/escape-room.json';
import type { IconName } from '@/components/ui/Icon';
import type { LearningQuestion } from '@/features/learning/questions';
import { parseDecimalInput } from '@/lib/money';

/**
 * Escape room "Tu primer sueldo" (F18, step 28, D-304): the rules of the original game, as pure
 * functions. Five rooms in order, keys for hints (3 to start, +1 per reflection, a free hint after
 * 3 failed tries in a row), one letter of the door word per room, a seal by hints used and the
 * badge of the version played: bronze, silver or gold for the five rooms in their initial, intermediate
 * or advanced version (D-310). No time limit and no way to lose.
 */
export interface EscapeObject {
  id: string;
  /** What the object is, so it is drawn as such (D-305). */
  kind: 'receipt' | 'postit' | 'list' | 'statement' | 'flyer' | 'envelope' | 'tag' | 'phone';
  company?: string;
  companyId?: string;
  meta?: { label: string; value: string }[];
  earnings?: { label: string; unit: string; value: string }[];
  deductions?: { label: string; unit: string }[];
  gross?: string;
  /** Advanced payslip: sums that are paid but carry no deductions. */
  nonRemunerative?: { label: string; unit: string; value: string }[];
  stained?: string;
  messages?: { channel: string; from: string; text: string }[];
  icon: IconName;
  name: string;
  summary: string;
  title: string;
  rows?: { label: string; value: string; strong?: boolean }[];
  lines?: string[];
  note?: string;
}

export interface EscapeRoom {
  id: string;
  habit: string;
  place: string;
  title: string;
  icon: IconName;
  scene: string;
  objects: EscapeObject[];
  /** A challenge that switches the lock on before it can be tried (room 2 classifies, room 4 orders). */
  before?: LearningQuestion;
  lock: LearningQuestion;
  /** Expected numeric mistakes, each with what to look at again (from the original game). */
  errors?: { values: string[]; message: string }[];
  hints: string[];
  debrief: string[];
  guide: string;
  reflection: string;
  /** Intermediate and advanced versions: only the fields that change (D-310, as in the original). */
  versions?: Partial<Pick<EscapeRoom, 'scene' | 'objects' | 'before' | 'lock' | 'errors' | 'hints' | 'debrief'>>[];
}

export const ROOMS = data.rooms as unknown as EscapeRoom[];
/** Initial, intermediate and advanced (D-310). */
export const VERSIONS = ['initial', 'intermediate', 'advanced'] as const;
export type Version = 0 | 1 | 2;
/** The rooms of a version: each room with the fields of that version over the initial ones. */
export function roomsOf(version: Version): EscapeRoom[] {
  return ROOMS.map((room) => (version === 0 ? room : { ...room, ...room.versions?.[version - 1] }));
}
export const ECONOMY = data.economy;
export const WORDS = data.words;
export type Seal = 'gold' | 'silver' | 'bronze';
export type Badge = 'bronze' | 'silver' | 'gold';
/** The badge of each version: bronze, silver and gold. */
export const BADGES: Badge[] = ['bronze', 'silver', 'gold'];
/** The first version whose badge is still missing (the advanced one when all are earned). */
export function nextVersion(badges: Badge[]): Version {
  const missing = BADGES.findIndex((b) => !badges.includes(b));
  return (missing === -1 ? 2 : missing) as Version;
}

export interface EscapeState {
  /** The version chosen at the start (D-310); missing in games saved before it, so read with versionOf. */
  version?: Version;
  wordIndex: number;
  /** Index of the room being played; ROOMS.length is the door, ROOMS.length + 1 the exit. */
  current: number;
  solved: string[];
  /** Rooms whose challenge before the lock is done. */
  switchedOn: string[];
  keys: number;
  hintsUsed: number;
  hintsOpen: Record<string, number>;
  /** Failed tries in a row, per room: three give the next hint for free. */
  fails: Record<string, number>;
  /** Only in the person's browser: never sent to tutor nor admin (spec 5.1). */
  reflections: Record<string, string>;
  timeMs: number;
  timeVisible: boolean;
  /** Badges are kept when a new game starts. */
  badges: Badge[];
}

export const versionOf = (state: EscapeState): Version => state.version ?? 0;

export function newGame(random: () => number = Math.random, badges: Badge[] = [], version: Version = 0): EscapeState {
  return {
    version,
    wordIndex: Math.floor(random() * WORDS.length),
    current: 0,
    solved: [],
    switchedOn: [],
    keys: ECONOMY.keys,
    hintsUsed: 0,
    hintsOpen: {},
    fails: {},
    reflections: {},
    timeMs: 0,
    timeVisible: false,
    badges,
  };
}

export const word = (state: EscapeState) => WORDS[state.wordIndex % WORDS.length]!;

/** The letters already earned: room i gives letter i of the word (five letters, five rooms). */
export const lettersOf = (state: EscapeState) =>
  ROOMS.map((room, i) => (state.solved.includes(room.id) ? word(state).word[i]! : null));

/** Whether the next hint of a room is free (three failed tries in a row). */
export const freeHint = (state: EscapeState, roomId: string) => (state.fails[roomId] ?? 0) >= ECONOMY.freeHintAfterFails;

/** Opens the next hint: free after three fails, otherwise it costs a key. Without keys, nothing changes. */
export function openHint(state: EscapeState, room: EscapeRoom): EscapeState {
  const open = state.hintsOpen[room.id] ?? 0;
  if (open >= room.hints.length) return state;
  const free = freeHint(state, room.id);
  if (!free && state.keys < ECONOMY.hintCost) return state;
  return {
    ...state,
    keys: free ? state.keys : state.keys - ECONOMY.hintCost,
    hintsUsed: state.hintsUsed + 1,
    hintsOpen: { ...state.hintsOpen, [room.id]: open + 1 },
    fails: { ...state.fails, [room.id]: 0 },
  };
}

export const failTry = (state: EscapeState, roomId: string): EscapeState => ({ ...state, fails: { ...state.fails, [roomId]: (state.fails[roomId] ?? 0) + 1 } });

export const switchOn = (state: EscapeState, roomId: string): EscapeState =>
  state.switchedOn.includes(roomId) ? state : { ...state, switchedOn: [...state.switchedOn, roomId] };

export function solveRoom(state: EscapeState, roomId: string): EscapeState {
  if (state.solved.includes(roomId)) return state;
  return { ...state, solved: [...state.solved, roomId], fails: { ...state.fails, [roomId]: 0 } };
}

export const nextRoom = (state: EscapeState): EscapeState => ({ ...state, current: Math.min(state.current + 1, ROOMS.length) });

/** A written reflection gives one key, once per room. It is optional and never corrected. */
export function reflect(state: EscapeState, roomId: string, text: string): EscapeState {
  if (!text.trim() || state.reflections[roomId]) return { ...state, reflections: { ...state.reflections, [roomId]: text.trim() || state.reflections[roomId] || '' } };
  return { ...state, keys: state.keys + ECONOMY.keysPerReflection, reflections: { ...state.reflections, [roomId]: text.trim() } };
}

/** The expected mistake that matches a numeric answer, if any, with its message. */
export function expectedError(room: EscapeRoom, answer: string): string | undefined {
  const value = parseDecimalInput(answer);
  if (value === null) return undefined;
  return room.errors?.find((e) => e.values.some((v) => new Decimal(v).eq(value)))?.message;
}

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '')
    .toUpperCase();

/** The door: the word that answers the question, with all the letters. */
export function tryDoor(state: EscapeState, text: string): 'open' | 'anagram' | 'wrong' | 'missing' | 'empty' {
  if (state.solved.length < ROOMS.length) return 'missing';
  const guess = normalize(text);
  if (!guess) return 'empty';
  const w = word(state);
  if (guess === w.word) return 'open';
  if (w.anagrams.includes(guess)) return 'anagram';
  return 'wrong';
}

/** The door opens: on to the exit, and the badge of the version played. */
export function openDoor(state: EscapeState): EscapeState {
  const badge = BADGES[versionOf(state)]!;
  return { ...state, current: ROOMS.length + 1, badges: state.badges.includes(badge) ? state.badges : [...state.badges, badge] };
}

export const sealOf = (hintsUsed: number): Seal => (data.seals.find((s) => hintsUsed <= s.maxHints)?.id ?? 'bronze') as Seal;

export function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
