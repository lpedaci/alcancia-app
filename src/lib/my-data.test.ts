import { describe, expect, it } from 'vitest';
import { seedData } from '@/store/data-store';
import type { LocalData } from '@/store/local-store';
import { collectMyData, exportMyData } from './my-data';

/** F16 (D-320): "Mi privacidad" shows and downloads only the person's own data. */
describe('my data', () => {
  const shared = seedData();
  const local: LocalData = { scenarios: [], goals: [], habitAnswers: { q1: 'sometimes' }, reflections: { w1: 'texto' }, levelProgress: [] };

  it('counts the platform records of the person and what is in her browser', () => {
    const data = collectMyData('p-mariana', shared, local, { balance: '1' });
    expect(data.account?.name).toBe('Mariana López');
    expect(data.account?.cohorts.length).toBe(1);
    expect(data.platform.guidesRead).toBeGreaterThan(0);
    expect(data.platform.escape).toBe(true);
    expect(data.browser).toMatchObject({ wallet: true, habitAnswers: 1, reflections: 1 });
  });

  it('the download never carries a record of another person', () => {
    const out = exportMyData('p-mariana', shared, local, null, '2026-11-16');
    for (const list of Object.values(out.platform)) for (const record of list) expect(record.personId).toBe('p-mariana');
    const text = JSON.stringify(out);
    expect(text).not.toContain('p-diego');
    // Her own records may name her tutor (a request for a 1:1), never another participant
  });
});
