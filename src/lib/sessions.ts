import type { TutorSession } from '@/types/domain';

/**
 * The agenda of sessions with the tutor (F13, D-319), as pure rules: which sessions a person sees
 * (her cohorts' group sessions and her own 1:1s), what is upcoming and what is past relative to the
 * demo's "now", and the calendar file to add one, built in the browser (no network, no third party).
 */
/** The demo's "now": DEMO_TODAY at midday (D-60). */
export const DEMO_NOW = '2026-11-16T12:00';

export const isPast = (session: TutorSession, now = DEMO_NOW) => session.startsAt < now;

/** The sessions a participant sees: the group ones of her cohorts and her own 1:1s, not canceled. */
export function sessionsFor(sessions: TutorSession[], person: { id: string; cohortIds: string[] }): TutorSession[] {
  return sessions
    .filter((s) => s.status !== 'canceled')
    .filter((s) => (s.kind === 'group' ? Boolean(s.cohortId && person.cohortIds.includes(s.cohortId)) : s.personId === person.id))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function splitByTime(sessions: TutorSession[], now = DEMO_NOW) {
  const upcoming = sessions.filter((s) => !isPast(s, now)).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = sessions.filter((s) => isPast(s, now)).sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  return { upcoming, past };
}

/** "jueves 19/11/2026, 14:00", in Spanish, from the local date and time. */
export function formatSessionTime(startsAt: string): string {
  const [date = '', time = ''] = startsAt.split('T');
  const [y, m, d] = date.split('-').map(Number);
  const weekday = new Intl.DateTimeFormat('es-AR', { weekday: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(y!, m! - 1, d!)));
  return `${weekday} ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}, ${time}`;
}

const icsDate = (local: string) => local.replace(/[-:]/g, '').replace(/(T\d{4})$/, '$100');
const addMinutes = (local: string, minutes: number) => {
  const [date = '', time = ''] = local.split('T');
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  const end = new Date(Date.UTC(y!, m! - 1, d!, h!, min! + minutes));
  return end.toISOString().slice(0, 16);
};
const escapeIcs = (text: string) => text.replace(/\\/g, '\\\\').replace(/[,;]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');

/** An .ics event in local time (floating), with the title and a line that says it is a simulation. */
export function sessionIcs(session: TutorSession, description: string): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Alcancia//Demo//ES',
    'BEGIN:VEVENT',
    `UID:${session.id}@alcancia.demo`,
    `DTSTAMP:${icsDate(`${DEMO_NOW}`)}`,
    `DTSTART:${icsDate(session.startsAt)}`,
    `DTEND:${icsDate(addMinutes(session.startsAt, session.minutes))}`,
    `SUMMARY:${escapeIcs(session.title)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
