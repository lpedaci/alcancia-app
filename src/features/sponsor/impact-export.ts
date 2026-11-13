import type { Aggregate } from '@/lib/metrics';
import { adoption, behavior, challengeResults, DIMENSIONS, learning, type OrgMetricsData, reaction, weeklyDone } from '@/features/organization/org-data';

/**
 * D1 export (CLAUDE.md F7, D-198): the impact report as rows of aggregated figures, ready for a CSV.
 * It only reads the aggregated metrics of org-data, so a group below the threshold is exported as
 * "Datos insuficientes", never as a number. Labels come from the caller (i18n).
 */
export type Label = (key: string, values?: Record<string, unknown>) => string;

const pct = (v: number) => `${Math.round(v * 100)} %`;

export function impactRows(data: OrgMetricsData, t: Label): string[][] {
  const missing = t('org.insufficientShort');
  const val = <T>(a: Aggregate<T>, f: (v: T) => string) => (a.status === 'ok' ? f(a.value) : missing);
  const a = adoption(data);
  const rows: string[][] = [[t('sponsor.csv.level'), t('sponsor.csv.indicator'), t('sponsor.csv.value')]];
  const adoptionLabel = t('sponsor.csv.adoption');
  rows.push([adoptionLabel, t('org.kpi.invited'), val(a.invited, String)]);
  rows.push([adoptionLabel, t('org.kpi.active'), val(a.activeShare, pct)]);
  rows.push([adoptionLabel, t('org.kpi.diagnosed'), val(a.diagnosedShare, pct)]);
  rows.push([adoptionLabel, t('org.kpi.modules'), val(a.modulesShare, pct)]);
  const k = (n: number) => `${t('org.k.level', { n })} · ${t(`org.k.l${n}.title`)}`;
  rows.push([k(1), t('sponsor.csv.satisfaction'), val(reaction(data), (r) => r.average.toFixed(1).replace('.', ','))]);
  const l = learning(data);
  for (const d of DIMENSIONS) {
    const dim = t(`welcome.dimensions.${d}`);
    rows.push([k(2), `${dim} · ${t('org.k.l2.before')}`, val(l, (v) => pct(v.byDimension.find((x) => x.dimension === d)!.before))]);
    rows.push([k(2), `${dim} · ${t('org.k.l2.after')}`, val(l, (v) => pct(v.byDimension.find((x) => x.dimension === d)!.after))]);
  }
  for (const { levelId, result } of challengeResults(data)) {
    rows.push([k(2), t('sponsor.csv.challenge', { n: levelId.replace('level-', '') }), val(result, (v) => pct(v.passed))]);
  }
  const b = behavior(data);
  for (const key of ['budget', 'emergencyFund', 'fullCardPayment'] as const) rows.push([k(3), t(`org.k.l3.${key}`), val(b, (v) => pct(v[key]))]);
  rows.push([k(3), t('org.k.l3.weekly'), val(weeklyDone(data), pct)]);
  return rows;
}

/** RFC 4180 CSV with a BOM so spreadsheets read the accents. */
export function toCsv(rows: string[][]): string {
  const cell = (c: string) => (/[",\n;]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c);
  return `\uFEFF${rows.map((r) => r.map(cell).join(',')).join('\r\n')}\r\n`;
}
