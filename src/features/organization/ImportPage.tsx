import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { DEMO_TODAY } from '@/app/config';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { StatusPill } from '@/components/ui/StatusPill';
import { TextArea } from '@/components/ui/TextArea';
import { TextField } from '@/components/ui/TextField';
import { toast } from '@/components/ui/toast-store';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/store/data-store';
import { AdminShell } from './AdminShell';
import { CSV_EXAMPLE, type CsvRow, parseCsv, type RowError, toPeople, validateRows } from './csv-import';

/**
 * O3, bulk upload by CSV (CLAUDE.md F8, D-196): three steps on one page. 1) paste or upload the
 * file (or load the example); 2) preview with the errors of each row next to the field that has
 * them, fix in place or remove the row; 3) confirm, which adds only the valid rows as invited
 * people. Nothing is sent anywhere: the demo keeps it in this browser.
 */
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';
const FIELD_OF: Record<RowError, keyof CsvRow> = {
  name_missing: 'name',
  email_invalid: 'email',
  email_domain: 'email',
  email_duplicate_file: 'email',
  email_exists: 'email',
  cohort_unknown: 'cohort',
};

export function ImportPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const people = useDataStore((s) => s.people);
  const cohorts = useDataStore((s) => s.cohorts);
  const orgId = useDataStore((s) => s.organization.id);
  const addPeople = useDataStore((s) => s.addPeople);
  const [text, setText] = useState('');
  const [rows, setRows] = useState<CsvRow[] | null>(null);
  const [readError, setReadError] = useState<string>();
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLHeadingElement>(null);

  const errors = rows ? validateRows(rows, people, cohorts) : [];
  const valid = rows ? rows.filter((_, i) => errors[i]!.length === 0) : [];
  const withErrors = errors.filter((e) => e.length > 0).length;

  const preview = (source: string) => {
    const parsed = parseCsv(source);
    if (!parsed.length) {
      setReadError(t('org.import.emptyFile'));
      return;
    }
    setReadError(undefined);
    setRows(parsed);
    requestAnimationFrame(() => previewRef.current?.focus());
  };
  const onFile = async (file?: File) => {
    if (!file) return;
    const content = await file.text();
    setText(content);
    preview(content);
  };
  const update = (i: number, field: keyof CsvRow, value: string) => setRows((r) => r!.map((row, j) => (j === i ? { ...row, [field]: field === 'email' ? value.toLowerCase() : value } : row)));
  const remove = (i: number) => setRows((r) => r!.filter((_, j) => j !== i));
  const confirm = () => {
    addPeople(toPeople(valid, cohorts, orgId, DEMO_TODAY));
    toast.success(t('org.import.done', { count: valid.length }));
    navigate('/admin/people');
  };

  return (
    <AdminShell>
      <header className="flex flex-col gap-2">
        <Link to="/admin/people" className="inline-flex w-fit items-center gap-1 text-label-large text-primary underline-offset-4 hover:underline">
          <Icon name="arrow_back" size={18} />
          {t('org.import.back')}
        </Link>
        <h1 className="text-headline-medium text-on-surface">{t('org.import.title')}</h1>
        <p className="max-w-[72ch] text-body-large text-on-surface-variant">{t('org.import.intro')}</p>
      </header>

      <section aria-labelledby="import-step1" className={cn(card, '@container')}>
        <div className="flex items-center gap-3">
          <IconTile icon="upload_file" tone="primary" />
          <div>
            <p className="text-label-medium text-on-surface-variant">{t('org.import.step', { n: 1 })}</p>
            <h2 id="import-step1" className="text-title-large text-on-surface">
              {t('org.import.step1')}
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 @3xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <TextArea
            label={t('org.import.paste')}
            helperText={t('org.import.pasteHelp')}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            className="font-mono"
            spellCheck={false}
            error={readError}
          />
          <div className="flex flex-col gap-3 rounded-lg bg-surface-container p-4">
            <p className="text-title-medium text-on-surface">{t('org.import.formatTitle')}</p>
            <ul className="flex flex-col gap-1.5 text-body-small text-on-surface-variant">
              <li>{t('org.import.format1')}</li>
              <li>{t('org.import.format2')}</li>
              <li>{t('org.import.format3')}</li>
            </ul>
            <Button variant="text" size="xs" leadingIcon="description" className="self-start" onClick={() => setText(CSV_EXAMPLE)}>
              {t('org.import.useExample')}
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button leadingIcon="table_view" onClick={() => preview(text)} disabled={!text.trim()}>
            {t('org.import.preview')}
          </Button>
          <Button variant="outlined" leadingIcon="upload_file" onClick={() => fileRef.current?.click()}>
            {t('org.import.upload')}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => {
              void onFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
        {!text.trim() && <p className="text-body-small text-on-surface-variant">{t('org.import.previewDisabled')}</p>}
      </section>

      {rows && (
        <section aria-labelledby="import-step2" className={cn(card, '@container')}>
          <div className="flex items-center gap-3">
            <IconTile icon="fact_check" tone="secondary" />
            <div>
              <p className="text-label-medium text-on-surface-variant">{t('org.import.step', { n: 2 })}</p>
              <h2 id="import-step2" ref={previewRef} tabIndex={-1} className="text-title-large text-on-surface focus-visible:outline-none">
                {t('org.import.step2')}
              </h2>
            </div>
          </div>
          <p className="flex flex-wrap gap-2" aria-live="polite">
            <StatusPill tone="success" icon="check_circle" label={t('org.import.validCount', { count: valid.length })} />
            {withErrors > 0 && <StatusPill tone="warning" icon="warning" label={t('org.import.errorCount', { count: withErrors })} />}
          </p>
          {withErrors > 0 && (
            <InlineAlert tone="info" live="none">
              {t('org.import.fixHint')}
            </InlineAlert>
          )}
          <ol className="flex flex-col gap-3">
            {rows.map((row, i) => {
              const rowErrors = errors[i]!;
              const errorFor = (field: keyof CsvRow) => {
                const e = rowErrors.find((x) => FIELD_OF[x] === field);
                return e ? t(`org.import.errors.${e}`) : undefined;
              };
              return (
                <li key={i} className={cn('flex flex-col gap-3 rounded-lg border p-4', rowErrors.length ? 'border-warning bg-warning-container/30' : 'border-outline-variant')}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <span className="text-label-large text-on-surface">{t('org.import.row', { n: i + 1 })}</span>
                      {rowErrors.length ? (
                        <StatusPill
                          tone="warning"
                          icon="warning"
                          label={t('org.import.rowErrors', {
                            count: rowErrors.length,
                          })}
                        />
                      ) : (
                        <StatusPill tone="success" icon="check_circle" label={t('org.import.rowOk')} />
                      )}
                    </span>
                    <Button variant="text" size="xs" leadingIcon="delete" onClick={() => remove(i)} aria-label={t('org.import.removeRow', { n: i + 1 })}>
                      {t('org.import.remove')}
                    </Button>
                  </div>
                  <div className="grid grid-cols-[minmax(0,1fr)] gap-3 @2xl:grid-cols-2 @5xl:grid-cols-4">
                    <TextField
                      label={t('org.people.name')}
                      helperText={t('org.import.nameHelp')}
                      value={row.name}
                      onChange={(e) => update(i, 'name', e.target.value)}
                      error={errorFor('name')}
                      autoComplete="off"
                    />
                    <TextField
                      label={t('org.people.email')}
                      helperText={t('org.import.emailHelp')}
                      value={row.email}
                      onChange={(e) => update(i, 'email', e.target.value)}
                      error={errorFor('email')}
                      autoComplete="off"
                    />
                    <TextField
                      label={t('org.people.cohort')}
                      helperText={t('org.import.cohortHelp')}
                      value={row.cohort}
                      onChange={(e) => update(i, 'cohort', e.target.value)}
                      error={errorFor('cohort')}
                      autoComplete="off"
                    />
                    <TextField label={t('org.people.job')} helperText={t('org.import.jobHelp')} value={row.job} onChange={(e) => update(i, 'job', e.target.value)} optional autoComplete="off" />
                  </div>
                </li>
              );
            })}
          </ol>
          {rows.length === 0 && <p className="text-body-medium text-on-surface-variant">{t('org.import.noRows')}</p>}
        </section>
      )}

      {rows && rows.length > 0 && (
        <section aria-labelledby="import-step3" className={card}>
          <div className="flex items-center gap-3">
            <IconTile icon="person_add" tone="tertiary" />
            <div>
              <p className="text-label-medium text-on-surface-variant">{t('org.import.step', { n: 3 })}</p>
              <h2 id="import-step3" className="text-title-large text-on-surface">
                {t('org.import.step3')}
              </h2>
            </div>
          </div>
          <p className="text-body-medium text-on-surface-variant">
            {withErrors > 0
              ? t('org.import.confirmPartial', {
                  count: valid.length,
                  skipped: withErrors,
                })
              : t('org.import.confirmAll', { count: valid.length })}
          </p>
          <Button leadingIcon="person_add" onClick={confirm} disabled={valid.length === 0} className="self-start">
            {t('org.import.confirm', { count: valid.length })}
          </Button>
        </section>
      )}
    </AdminShell>
  );
}
