/** Fixed demo date, so data looks coherent for every visitor (D-60). ISO in data, DD/MM/AAAA in the UI. */
export const DEMO_TODAY = '2026-11-16';

/** Start of the program "Bienestar financiero 2026" (D-60). */
export const PROGRAM_START = '2026-08-03';

/** Privacy threshold (CLAUDE.md F1, F7): no metric for groups smaller than this, and it never goes lower. */
export const PRIVACY_THRESHOLD_MIN = 5;

/** Default passing score of a level challenge, as a fraction (CLAUDE.md 5.0, F1). */
export const DEFAULT_PASSING_SCORE = 0.7;

/** Idle session expiry with a previous warning (F0, WCAG 2.2.1). */
export const SESSION_IDLE_MINUTES = 15;
export const SESSION_WARNING_MINUTES = 13;

/** Lockout after this many failed attempts, without self-unlock (F0). */
export const LOCKOUT_ATTEMPTS = 5;

/** Version of the privacy notice (G5). A new version asks for consent again. */
export const PRIVACY_NOTICE_VERSION = '1.0';
