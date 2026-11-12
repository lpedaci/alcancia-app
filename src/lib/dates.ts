import { DEMO_TODAY } from '@/app/config';

/** Adds days to an ISO date (AAAA-MM-DD), in UTC so the result never depends on the time zone. */
export function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** DD/MM/AAAA, the format of the interface (2.9). */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

/** Date of a simulated wallet day: DEMO_TODAY (day 0) plus the simulated days (wallet-engine.md, 2). */
export const walletDate = (day: number) => addDays(DEMO_TODAY, day);
