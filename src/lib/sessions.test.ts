import { describe, expect, it } from 'vitest';
import { seedData } from '@/store/data-store';
import { formatSessionTime, sessionIcs, sessionsFor, splitByTime } from './sessions';

/** F13 (D-319): who sees which session, what is upcoming and the calendar file. */
describe('sessions with the tutor', () => {
  const { tutorSessions } = seedData();

  it('a participant sees her cohorts group sessions and only her own 1:1', () => {
    const mariana = sessionsFor(tutorSessions, { id: 'p-mariana', cohortIds: ['cohort-operations'] });
    expect(mariana.map((s) => s.id)).toEqual(['session-ops-1', 'session-mariana-1', 'session-ops-2']);
    const diego = sessionsFor(tutorSessions, { id: 'p-diego', cohortIds: ['cohort-operations'] });
    expect(diego.map((s) => s.id)).toEqual(['session-ops-1', 'session-ops-2']);
    expect(sessionsFor(tutorSessions.map((s) => ({ ...s, status: 'canceled' as const })), { id: 'p-diego', cohortIds: ['cohort-operations'] })).toEqual([]);
  });

  it('splits upcoming and past around the demo date (16/11/2026)', () => {
    const { upcoming, past } = splitByTime(sessionsFor(tutorSessions, { id: 'p-mariana', cohortIds: ['cohort-operations'] }));
    expect(past.map((s) => s.id)).toEqual(['session-ops-1']);
    expect(upcoming.map((s) => s.id)).toEqual(['session-mariana-1', 'session-ops-2']);
  });

  it('writes the date with its weekday and the calendar file with start and end', () => {
    expect(formatSessionTime('2026-11-19T14:00')).toBe('jueves 19/11/2026, 14:00');
    const ics = sessionIcs({ ...tutorSessions[1]!, title: 'Cuotas, o contado' }, 'Simulación');
    expect(ics).toContain('DTSTART:20261119T140000');
    expect(ics).toContain('DTEND:20261119T144000');
    expect(ics).toContain('SUMMARY:Cuotas\\, o contado');
  });
});
