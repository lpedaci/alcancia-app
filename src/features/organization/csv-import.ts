import type { Cohort, Person } from '@/types/domain';

/**
 * O3, bulk upload by CSV (CLAUDE.md F8, D-195): reads a simple CSV (comma or semicolon, quotes
 * allowed), validates row by row and lets the admin fix each row before confirming. Pure and
 * tested; the page only shows what this returns. No real data: the demo only accepts `.demo` emails.
 */
export interface CsvRow {
  name: string;
  email: string;
  cohort: string;
  job: string;
}

export type RowError = 'name_missing' | 'email_invalid' | 'email_domain' | 'email_duplicate_file' | 'email_exists' | 'cohort_unknown';

export const CSV_HEADER = ['nombre', 'correo', 'cohorte', 'puesto'] as const;

export const CSV_EXAMPLE = [
  'nombre,correo,cohorte,puesto',
  'Lucía Benítez,lucia.benitez@andina.demo,Operaciones,Auxiliar de depósito',
  'Tomás Ferreyra,tomas.ferreyra@andina,Tecnología,Desarrollador',
  'Valentina Ríos,valentina.rios@andina.demo,Logística,Analista',
  ',sofia.paz@andina.demo,Administración,Asistente contable',
  'Martín Sosa,martin.sosa@andina.demo,Comercial,Ejecutivo de cuentas',
  'Martina Sosa,martin.sosa@andina.demo,Comercial,Ejecutiva de cuentas',
].join('\n');

/** Splits one line, respecting quotes ("a, b" stays one cell). */
function splitLine(line: string, separator: string): string[] {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]!;
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else quoted = !quoted;
    } else if (ch === separator && !quoted) {
      cells.push(current.trim());
      current = '';
    } else current += ch;
  }
  cells.push(current.trim());
  return cells;
}

/** Parses the CSV text. The header row is optional; columns are name, email, cohort and job. */
export function parseCsv(text: string): CsvRow[] {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '');
  if (!lines.length) return [];
  const separator = (lines[0]!.match(/;/g)?.length ?? 0) > (lines[0]!.match(/,/g)?.length ?? 0) ? ';' : ',';
  const first = splitLine(lines[0]!, separator).map((c) => c.toLowerCase());
  const body = first[0] === 'nombre' || first.includes('correo') ? lines.slice(1) : lines;
  return body.map((line) => {
    const [name = '', email = '', cohort = '', job = ''] = splitLine(line, separator);
    return { name, email: email.toLowerCase(), cohort, job };
  });
}

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** The cohort a row refers to: by id, by its full name or by the first part of its name ("Operaciones"). */
export function findCohort(cohorts: Cohort[], value: string): Cohort | undefined {
  const v = normalize(value);
  if (!v) return undefined;
  return cohorts.find((c) => normalize(c.id) === v || normalize(c.name) === v || normalize(c.name.split('·')[0]!) === v);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Errors of each row, in the order of the file. An empty list means the row can be imported. */
export function validateRows(rows: CsvRow[], people: Pick<Person, 'email'>[], cohorts: Cohort[]): RowError[][] {
  const existing = new Set(people.map((p) => p.email.toLowerCase()));
  const seen = new Map<string, number>();
  rows.forEach((r, i) => {
    if (!seen.has(r.email)) seen.set(r.email, i);
  });
  return rows.map((r, i) => {
    const errors: RowError[] = [];
    if (!r.name.trim()) errors.push('name_missing');
    if (!EMAIL.test(r.email)) errors.push('email_invalid');
    else if (!r.email.endsWith('.demo')) errors.push('email_domain');
    else if (existing.has(r.email)) errors.push('email_exists');
    else if (seen.get(r.email) !== i) errors.push('email_duplicate_file');
    if (!findCohort(cohorts, r.cohort)) errors.push('cohort_unknown');
    return errors;
  });
}

const slug = (text: string) =>
  normalize(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** The people to add from valid rows: always invited, with the cohort's area (F8). */
export function toPeople(rows: CsvRow[], cohorts: Cohort[], orgId: string, today: string): Person[] {
  return rows.map((r) => {
    const cohort = findCohort(cohorts, r.cohort)!;
    return {
      id: `p-${slug(r.name)}-${slug(r.email.split('@')[0]!)}`,
      orgId,
      role: 'participant',
      name: r.name.trim(),
      email: r.email,
      jobOrProgram: r.job.trim(),
      area: cohort.area,
      cohortIds: [cohort.id],
      status: 'invited',
      device: 'desktop',
      invitedAt: today,
    };
  });
}
