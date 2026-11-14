import linesJson from '@/data/fuerte-lines.json';
import type { FuerteState } from './Fuerte';

/**
 * Fuerte's lines (CLAUDE.md 5.0.1, RF-33, D-206) come from `src/data/fuerte-lines.json`, which L&D
 * edits without touching code. Each line has variants: the app picks one per session (a seed set
 * when the app loads), so the same screen keeps the same line while you use it and Fuerte does not
 * repeat itself from one visit to the next.
 */
interface Line {
  state: FuerteState;
  variants: string[];
}

const LINES = { ...(linesJson.lines as Record<string, Line>), ...(linesJson.events as Record<string, Line>) };

let sessionSeed = Math.floor(Math.random() * 1_000_000);

/** Tests fix the seed, so the first variant is always picked. */
export function setFuerteSeed(seed: number) {
  sessionSeed = seed;
}

function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function hasFuerteLine(key: string): boolean {
  return key in LINES;
}

/** The line of a moment, with its placeholders filled ({{name}}). Unknown keys return the key, as i18n does. */
export function fuerteLine(key: string, values: Record<string, string | number> = {}): string {
  const line = LINES[key];
  if (!line || line.variants.length === 0) return key;
  const variant = line.variants[sessionSeed === 0 ? 0 : (hash(key) + sessionSeed) % line.variants.length]!;
  return variant.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, name: string) => String(values[name] ?? ''));
}

/** The state of the illustration that goes with a line (neutral when the key is unknown). */
export const fuerteState = (key: string): FuerteState => LINES[key]?.state ?? 'neutral';
