import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { DEMO_TODAY } from '@/app/config';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/Dialog';
import { IconTile } from '@/components/ui/IconTile';
import { MetaChips } from '@/components/ui/MetaChips';
import { SegmentedButton } from '@/components/ui/SegmentedButton';
import { Select } from '@/components/ui/Select';
import { StatusPill, type StatusTone } from '@/components/ui/StatusPill';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table';
import { TextField } from '@/components/ui/TextField';
import { toast } from '@/components/ui/toast-store';
import { formatDate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/store/data-store';
import type { Area, Person } from '@/types/domain';
import { AdminShell } from './AdminShell';
import { toPeople, validateRows } from './csv-import';

/**
 * O2, people and cohorts (CLAUDE.md F8, D-195): the list of participants with filters by cohort,
 * status and name; adding one person (always invited); and the cohorts with their tutor, size and
 * deadline, with the form to create one. Learning results are not here: the admin sees them only
 * aggregated in the panel.
 */
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';
type Status = 'all' | Person['status'];
const STATUS_TONE: Record<Person['status'], StatusTone> = { active: 'success', invited: 'info', inactive: 'neutral' };
const PAGE_SIZE = 20;
const STATUS_ICON = { active: 'check_circle', invited: 'mail', inactive: 'pause' } as const;

export function PeoplePage() {
  const { t } = useTranslation();
  const people = useDataStore((s) => s.people);
  const cohorts = useDataStore((s) => s.cohorts);
  const [status, setStatus] = useState<Status>('all');
  const [cohort, setCohort] = useState('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [creating, setCreating] = useState(false);
  const participants = people.filter((p) => p.role === 'participant');
  const q = query.trim().toLowerCase();
  const list = participants
    .filter((p) => (status === 'all' || p.status === status) && (cohort === 'all' || p.cohortIds.includes(cohort)) && (!q || p.name.toLowerCase().includes(q) || p.email.includes(q)))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = list.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);
  const count = (s: Person['status']) => participants.filter((p) => p.status === s).length;
  const statusOptions: { value: Status; label: string }[] = [
    { value: 'all', label: t('org.people.all', { count: participants.length }) },
    { value: 'active', label: t('org.people.statusCount.active', { count: count('active') }) },
    { value: 'invited', label: t('org.people.statusCount.invited', { count: count('invited') }) },
    { value: 'inactive', label: t('org.people.statusCount.inactive', { count: count('inactive') }) },
  ];
  const cohortName = (id?: string) => cohorts.find((c) => c.id === id)?.name ?? '';

  return (
    <AdminShell>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-headline-medium text-on-surface">{t('org.people.title')}</h1>
          <p className="text-body-large text-on-surface-variant">{t('org.people.intro', { count: participants.length })}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button leadingIcon="person_add" onClick={() => setAdding(true)}>
            {t('org.people.add')}
          </Button>
          <Button asChild variant="outlined" leadingIcon="upload_file">
            <Link to="/admin/people/import">{t('org.people.import')}</Link>
          </Button>
        </div>
      </header>

      <section aria-labelledby="cohorts-list" className={cn(card, '@container')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <IconTile icon="groups" tone="secondary" />
            <h2 id="cohorts-list" className="text-title-large text-on-surface">
              {t('org.cohorts.listTitle')}
            </h2>
          </div>
          <Button variant="tonal" leadingIcon="group_add" onClick={() => setCreating(true)}>
            {t('org.cohorts.create')}
          </Button>
        </div>
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 @3xl:grid-cols-2">
          {cohorts.map((c) => {
            const tutor = people.find((p) => p.id === c.tutorId);
            const size = participants.filter((p) => p.cohortIds.includes(c.id)).length;
            return (
              <li key={c.id} className="flex flex-col gap-2 rounded-lg border border-outline-variant p-4">
                <p className="text-title-medium text-on-surface">{c.name}</p>
                <MetaChips
                  label={t('tutor.home.cohortData')}
                  items={[
                    { icon: 'person', label: t('tutor.home.people', { count: size }) },
                    { icon: 'school', label: t('org.cohorts.tutor', { name: tutor?.name ?? '' }) },
                    ...(c.dueDate ? [{ icon: 'event_available' as const, label: t('tutor.home.due', { date: formatDate(c.dueDate) }), dateTime: c.dueDate }] : []),
                  ]}
                />
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="people-list" className={cn(card, '@container')}>
        <h2 id="people-list" className="sr-only">
          {t('org.people.listTitle')}
        </h2>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 @3xl:grid-cols-2">
          <TextField
            label={t('org.people.search')}
            helperText={t('org.people.searchHelp')}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            type="search"
          />
          <Select
            label={t('org.people.cohort')}
            helperText={t('org.people.cohortHelp')}
            value={cohort}
            onChange={(e) => {
              setCohort(e.target.value);
              setPage(0);
            }}
            options={[{ value: 'all', label: t('org.people.allCohorts') }, ...cohorts.map((c) => ({ value: c.id, label: c.name }))]}
          />
        </div>
        <Select
          className="md:hidden"
          label={t('org.people.status')}
          helperText={t('org.people.statusHelp')}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as Status);
            setPage(0);
          }}
          options={statusOptions}
        />
        <div className="hidden md:block">
          <SegmentedButton
            label={t('org.people.status')}
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(0);
            }}
            options={statusOptions}
          />
        </div>
        <p className="text-body-small text-on-surface-variant" aria-live="polite">
          {t('org.people.showing', { count: list.length, from: list.length ? current * PAGE_SIZE + 1 : 0, to: current * PAGE_SIZE + visible.length })}
        </p>
        {/* A table from 768 px; a list of cards on the phone (2.7) */}
        <div className="hidden md:block">
          <TableContainer label={t('org.people.listTitle')}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell className="text-left">{t('org.people.name')}</TableHeaderCell>
                  <TableHeaderCell className="text-left">{t('org.people.cohort')}</TableHeaderCell>
                  <TableHeaderCell className="text-left">{t('org.people.job')}</TableHeaderCell>
                  <TableHeaderCell className="text-left">{t('org.people.status')}</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visible.map((p) => (
                  <TableRow key={p.id}>
                    <TableHeaderCell scope="row" className="text-left">
                      <span className="flex items-center gap-3">
                        <Avatar name={p.name} personId={p.id} role="participant" size="sm" />
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-body-medium text-on-surface">{p.name}</span>
                          <span className="truncate text-body-small font-normal text-on-surface-variant">{p.email}</span>
                        </span>
                      </span>
                    </TableHeaderCell>
                    <TableCell className="text-body-small">{cohortName(p.cohortIds[0])}</TableCell>
                    <TableCell className="text-body-small">{p.jobOrProgram}</TableCell>
                    <TableCell>
                      <StatusPill tone={STATUS_TONE[p.status]} icon={STATUS_ICON[p.status]} label={t(`tutor.status.${p.status}`)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <ul className="flex flex-col divide-y divide-outline-variant md:hidden">
          {visible.map((p) => (
            <li key={p.id} className="flex items-start gap-3 py-3">
              <Avatar name={p.name} personId={p.id} role="participant" size="sm" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-body-medium text-on-surface">{p.name}</span>
                <span className="truncate text-body-small text-on-surface-variant">{p.email}</span>
                <span className="text-body-small text-on-surface-variant">{cohortName(p.cohortIds[0])}</span>
                <StatusPill tone={STATUS_TONE[p.status]} icon={STATUS_ICON[p.status]} label={t(`tutor.status.${p.status}`)} className="self-start" />
              </div>
            </li>
          ))}
        </ul>
        {list.length === 0 && <p className="text-body-medium text-on-surface-variant">{t('org.people.empty')}</p>}
        {pages > 1 && (
          <nav aria-label={t('org.people.pagination')} className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant pt-4">
            <Button variant="outlined" size="xs" leadingIcon="chevron_left" disabled={current === 0} onClick={() => setPage(current - 1)}>
              {t('org.people.prev')}
            </Button>
            <span className="text-body-small text-on-surface-variant tabular-nums">{t('org.people.page', { n: current + 1, total: pages })}</span>
            <Button variant="outlined" size="xs" trailingIcon="chevron_right" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>
              {t('org.people.next')}
            </Button>
          </nav>
        )}
      </section>

      {adding && <AddPersonDialog onClose={() => setAdding(false)} />}
      {creating && <CreateCohortDialog onClose={() => setCreating(false)} />}
    </AdminShell>
  );
}

function AddPersonDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const people = useDataStore((s) => s.people);
  const cohorts = useDataStore((s) => s.cohorts);
  const orgId = useDataStore((s) => s.organization.id);
  const addPeople = useDataStore((s) => s.addPeople);
  const [row, setRow] = useState({ name: '', email: '', cohort: cohorts[0]?.id ?? '', job: '' });
  const [tried, setTried] = useState(false);
  const errors = validateRows([row], people, cohorts)[0]!;
  const errorOf = (field: 'name' | 'email') => {
    if (!tried) return undefined;
    const e = errors.find((x) => (field === 'name' ? x === 'name_missing' : x.startsWith('email')));
    return e ? t(`org.import.errors.${e}`) : undefined;
  };
  const save = () => {
    setTried(true);
    if (errors.length) return;
    addPeople(toPeople([{ ...row, email: row.email.toLowerCase() }], cohorts, orgId, DEMO_TODAY));
    toast.success(t('org.people.added'));
    onClose();
  };
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        title={t('org.people.addTitle')}
        description={t('org.people.addIntro')}
        actions={
          <>
            <DialogClose asChild>
              <Button variant="outlined" fullWidth className="sm:w-auto">
                {t('ui.cancel')}
              </Button>
            </DialogClose>
            <Button fullWidth className="sm:w-auto" leadingIcon="person_add" onClick={save}>
              {t('org.people.addSubmit')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <TextField
            label={t('org.people.name')}
            helperText={t('org.people.nameHelp')}
            value={row.name}
            onChange={(e) => setRow({ ...row, name: e.target.value })}
            error={errorOf('name')}
            autoComplete="off"
          />
          <TextField
            label={t('org.people.email')}
            helperText={t('org.people.emailHelp')}
            value={row.email}
            onChange={(e) => setRow({ ...row, email: e.target.value })}
            error={errorOf('email')}
            type="email"
            autoComplete="off"
          />
          <Select
            label={t('org.people.cohort')}
            helperText={t('org.people.cohortAddHelp')}
            value={row.cohort}
            onChange={(e) => setRow({ ...row, cohort: e.target.value })}
            options={cohorts.map((c) => ({ value: c.id, label: c.name }))}
          />
          <TextField label={t('org.people.job')} helperText={t('org.people.jobHelp')} value={row.job} onChange={(e) => setRow({ ...row, job: e.target.value })} optional autoComplete="off" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

const AREAS: Area[] = ['operations', 'administration', 'technology', 'commercial'];

function CreateCohortDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const people = useDataStore((s) => s.people);
  const program = useDataStore((s) => s.program);
  const orgId = useDataStore((s) => s.organization.id);
  const cohorts = useDataStore((s) => s.cohorts);
  const addCohort = useDataStore((s) => s.addCohort);
  const tutors = people.filter((p) => p.role === 'tutor');
  const [name, setName] = useState('');
  const [area, setArea] = useState<Area>('operations');
  const [tutorId, setTutorId] = useState(tutors[0]?.id ?? '');
  const [due, setDue] = useState('');
  const [tried, setTried] = useState(false);
  const nameError = tried && name.trim().length < 3 ? t('org.cohorts.nameError') : undefined;
  const dueError = tried && program.mode === 'assigned' && (!due || due < DEMO_TODAY) ? t('tutor.assign.dueError') : undefined;
  const save = () => {
    setTried(true);
    if (name.trim().length < 3 || (program.mode === 'assigned' && (!due || due < DEMO_TODAY))) return;
    addCohort({
      id: `cohort-${name
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')}-${cohorts.length + 1}`,
      orgId,
      name: name.trim(),
      tutorId,
      area,
      moduleIds: program.moduleIds,
      startDate: DEMO_TODAY,
      ...(due ? { dueDate: due } : {}),
    });
    toast.success(t('org.cohorts.created'));
    onClose();
  };
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        title={t('org.cohorts.createTitle')}
        description={t('org.cohorts.createIntro')}
        actions={
          <>
            <DialogClose asChild>
              <Button variant="outlined" fullWidth className="sm:w-auto">
                {t('ui.cancel')}
              </Button>
            </DialogClose>
            <Button fullWidth className="sm:w-auto" leadingIcon="group_add" onClick={save}>
              {t('org.cohorts.createSubmit')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <TextField label={t('org.cohorts.name')} helperText={t('org.cohorts.nameHelp')} value={name} onChange={(e) => setName(e.target.value)} error={nameError} autoComplete="off" />
          <Select
            label={t('org.cohorts.area')}
            helperText={t('org.cohorts.areaHelp')}
            value={area}
            onChange={(e) => setArea(e.target.value as Area)}
            options={AREAS.map((a) => ({ value: a, label: t(`org.areas.${a}`) }))}
          />
          <Select
            label={t('org.cohorts.tutorLabel')}
            helperText={t('org.cohorts.tutorHelp')}
            value={tutorId}
            onChange={(e) => setTutorId(e.target.value)}
            options={tutors.map((p) => ({ value: p.id, label: p.name }))}
          />
          <TextField
            type="date"
            label={t('org.cohorts.due')}
            helperText={program.mode === 'assigned' ? t('org.cohorts.dueHelpAssigned') : t('org.cohorts.dueHelpVoluntary')}
            value={due}
            min={DEMO_TODAY}
            onChange={(e) => setDue(e.target.value)}
            error={dueError}
            optional={program.mode !== 'assigned'}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
