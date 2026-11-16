import { describe, expect, it } from 'vitest';
import { PRIVACY_DEADLINES, privacyDueDate } from './legal';

/** F16 (D-320): the deadlines of the Ley 25.326 as the spec sets them, counted by hand. */
describe('privacy deadlines', () => {
  it('keeps the deadlines in one constant', () => {
    expect(PRIVACY_DEADLINES.access).toEqual({ days: 10, business: false });
    expect(PRIVACY_DEADLINES.rectification).toEqual({ days: 5, business: true });
    expect(PRIVACY_DEADLINES.deletion).toEqual({ days: 5, business: true });
  });

  it('access: 10 calendar days, weekends included', () => {
    // Monday 16/11/2026 + 10 calendar days = Thursday 26/11/2026
    expect(privacyDueDate('access', '2026-11-16')).toBe('2026-11-26');
  });

  it('rectification and deletion: 5 business days, skipping the weekend', () => {
    // Monday 16/11/2026: Tue 17, Wed 18, Thu 19, Fri 20, Mon 23
    expect(privacyDueDate('rectification', '2026-11-16')).toBe('2026-11-23');
    // Friday 20/11/2026: Mon 23 ... Fri 27
    expect(privacyDueDate('deletion', '2026-11-20')).toBe('2026-11-27');
    // Saturday 21/11/2026: Mon 23 ... Fri 27
    expect(privacyDueDate('deletion', '2026-11-21')).toBe('2026-11-27');
  });
});
