import { describe, expect, it } from 'vitest';
import { seedData } from '@/store/data-store';
import { impactRows, toCsv } from '@/features/sponsor/impact-export';
import { adoption, adoptionByCohort, behavior, learning, orgAlerts, participantsOf, reaction } from './org-data';

const data = seedData();
const label = (key: string, values?: Record<string, unknown>) => (values ? `${key}:${JSON.stringify(values)}` : key);

describe('organization metrics (O1, D1, F7)', () => {
  it('adoption counts only participants and stays between 0 and 1', () => {
    const a = adoption(data);
    expect(a.invited.status).toBe('ok');
    if (a.invited.status === 'ok') expect(a.invited.value).toBe(participantsOf(data).length);
    for (const s of [a.activeShare, a.diagnosedShare, a.modulesShare]) {
      expect(s.status).toBe('ok');
      if (s.status === 'ok') {
        expect(s.value).toBeGreaterThanOrEqual(0);
        expect(s.value).toBeLessThanOrEqual(1);
      }
    }
  });

  it('hides the small cohort and one more, so the hidden people are never fewer than 5', () => {
    const parts = adoptionByCohort(data);
    const hidden = parts.filter((p) => p.result.status !== 'ok');
    expect(hidden.map((p) => p.key)).toContain('cohort-commercial');
    const hiddenPeople = data.cohorts.filter((c) => hidden.some((h) => h.key === c.id)).reduce((s, c) => s + participantsOf(data).filter((p) => p.cohortIds.includes(c.id)).length, 0);
    expect(hiddenPeople).toBeGreaterThanOrEqual(5);
    expect(orgAlerts(data).some((a) => a.kind === 'hidden')).toBe(true);
  });

  it('Kirkpatrick 2 uses only people with both Conocerte and knowledge scores (D-62)', () => {
    const l = learning(data);
    const pairs = data.diagnostics.filter((d) => d.kind === 'final' && data.diagnostics.some((i) => i.kind === 'initial' && i.personId === d.personId));
    expect(l.status).toBe('ok');
    if (l.status === 'ok') {
      expect(l.value.people).toBe(pairs.length);
      expect(l.value.byDimension).toHaveLength(5);
    }
    // Without enough pairs, nothing is shown
    const few = { ...data, diagnostics: data.diagnostics.filter((d) => d.kind === 'initial' || d.personId === pairs[0]!.personId) };
    expect(learning(few).status).toBe('insufficient');
  });

  it('a threshold raised above the group size hides every metric', () => {
    const strict = { ...data, organization: { ...data.organization, privacyThreshold: 10_000 } };
    expect(reaction(strict).status).toBe('insufficient');
    expect(behavior(strict).status).toBe('insufficient');
    expect(adoption(strict).activeShare.status).toBe('insufficient');
  });

  it('the CSV export only carries aggregated values or "Datos insuficientes", never names or emails', () => {
    const rows = impactRows(data, label);
    expect(rows[0]).toHaveLength(3);
    const csv = toCsv(rows);
    for (const p of data.people) {
      expect(csv).not.toContain(p.email);
      expect(csv).not.toContain(p.name);
    }
    const strict = impactRows({ ...data, organization: { ...data.organization, privacyThreshold: 10_000 } }, label);
    expect(strict.slice(1).every((r) => r[2] === 'org.insufficientShort')).toBe(true);
  });

  it('CSV cells with commas or quotes are escaped', () => {
    expect(toCsv([['a, b', 'c"d']])).toBe('\uFEFF"a, b","c""d"\r\n');
  });
});
