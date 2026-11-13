import { describe, expect, it } from 'vitest';
import { seedData } from '@/store/data-store';
import { CSV_EXAMPLE, findCohort, parseCsv, toPeople, validateRows } from './csv-import';

const data = seedData();

describe('CSV import (O3, F8)', () => {
  it('reads commas or semicolons, quotes and an optional header', () => {
    expect(parseCsv('nombre;correo;cohorte;puesto\n"Pérez, Ana";ana@andina.demo;Comercial;Ventas')).toEqual([{ name: 'Pérez, Ana', email: 'ana@andina.demo', cohort: 'Comercial', job: 'Ventas' }]);
    expect(parseCsv('Ana,ANA@andina.demo,Tecnología,QA')).toHaveLength(1);
    expect(parseCsv('\n\n')).toEqual([]);
  });

  it('finds a cohort by id, by full name or by the first part of its name, without accents', () => {
    expect(findCohort(data.cohorts, 'tecnologia')?.id).toBe('cohort-technology');
    expect(findCohort(data.cohorts, 'Operaciones')?.id).toBe('cohort-operations');
    expect(findCohort(data.cohorts, 'cohort-commercial')?.id).toBe('cohort-commercial');
    expect(findCohort(data.cohorts, 'Logística')).toBeUndefined();
  });

  it('validates the example row by row: one valid row and one error of each kind', () => {
    const rows = parseCsv(CSV_EXAMPLE);
    expect(validateRows(rows, data.people, data.cohorts)).toEqual([[], ['email_invalid'], ['cohort_unknown'], ['name_missing'], [], ['email_duplicate_file']]);
  });

  it('rejects emails outside the demo and the ones that already exist', () => {
    const rows = [
      { name: 'A', email: 'a@gmail.com', cohort: 'Comercial', job: '' },
      { name: 'Mariana', email: 'mariana.lopez@andina.demo', cohort: 'Comercial', job: '' },
    ];
    expect(validateRows(rows, data.people, data.cohorts)).toEqual([['email_domain'], ['email_exists']]);
  });

  it('valid rows become invited people with the cohort and its area', () => {
    const [person] = toPeople([{ name: 'Lucía Benítez', email: 'lucia.benitez@andina.demo', cohort: 'Operaciones', job: 'Auxiliar' }], data.cohorts, 'org-andina', '2026-11-16');
    expect(person).toMatchObject({ status: 'invited', role: 'participant', cohortIds: ['cohort-operations'], area: 'operations', invitedAt: '2026-11-16' });
  });
});
