/**
 * Legal configuration of the prototype (F16, D-320). Deadlines of the rights of the Ley 25.326 de
 * Protección de los Datos Personales (Argentina), as the spec sets them: access within 10 calendar
 * days (art. 14), rectification and deletion within 5 business days (art. 16). Business days skip
 * Saturdays and Sundays; national holidays are not modeled in the demo (a real system would read
 * the official calendar).
 */
export const PRIVACY_DEADLINES = {
  access: { days: 10, business: false },
  rectification: { days: 5, business: true },
  deletion: { days: 5, business: true },
} as const;

export type PrivacyRight = keyof typeof PRIVACY_DEADLINES;

/** The last day to answer a request made on `from` (ISO date), by the deadline of its right. */
export function privacyDueDate(right: PrivacyRight, from: string): string {
  const { days, business } = PRIVACY_DEADLINES[right];
  const date = new Date(`${from}T12:00:00Z`);
  let left = days;
  while (left > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    const weekday = date.getUTCDay();
    if (!business || (weekday !== 0 && weekday !== 6)) left -= 1;
  }
  return date.toISOString().slice(0, 10);
}
