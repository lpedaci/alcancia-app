import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router';
import { DEMO_TODAY } from '@/app/config';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog, Dialog, DialogClose, DialogContent } from '@/components/ui/Dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { IconButton } from '@/components/ui/IconButton';
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
import { useDataStore, useOrgData } from '@/store/data-store';
import type { Area, Cohort, Person, OrganizationKind } from '@/types/domain';
import { AdminShell } from './AdminShell';
import { toPeople, validateRows } from './csv-import';
import { ctx } from '@/lib/org-context';

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
  const { people, cohorts } = useOrgData();
  // Filters live in the URL (D-238), so a link like "Ver personas" opens the list already filtered
  const [params, setParams] = useSearchParams();
  const statusParam = params.get('status');
  const status: Status = statusParam === 'active' || statusParam === 'invited' || statusParam === 'inactive' ? statusParam : 'all';
  const cohort = params.get('cohort') && cohorts.some((c) => c.id === params.get('cohort')) ? params.get('cohort')! : 'all';
  const setFilter = (key: 'status' | 'cohort', value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === 'all') next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true },
    );
  const setStatus = (value: Status) => setFilter('status', value);
  const setCohort = (value: string) => setFilter('cohort', value);
  const [editing, setEditing] = useState<Person | undefined>();
  const [removing, setRemoving] = useState<Person | undefined>();
  const [editingCohort, setEditingCohort] = useState<Cohort | undefined>();
  const [removingCohort, setRemovingCohort] = useState<Cohort | undefined>();
  const updatePerson = useDataStore((s) => s.updatePerson);
  const removePerson = useDataStore((s) => s.removePerson);
  const removeCohort = useDataStore((s) => s.removeCohort);
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
  const updateStatus = (person: Person, next: Person['status']) => {
    updatePerson(person.id, { status: next });
    toast.success(t(`org.people.statusDone.${next}`, { name: person.name }));
  };

  return (
    <AdminShell>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-headline-medium text-on-surface">{t('org.people.title')}</h1>
          <p className="text-body-large text-on-surface-variant">{t('org.people.intro', { count: participants.length })}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outlined" leadingIcon="upload_file">
            <Link to="/admin/people/import">{t('org.people.import')}</Link>
          </Button>
          <Button leadingIcon="person_add" onClick={() => setAdding(true)}>
            {t('org.people.add')}
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
                <div className="flex items-start justify-between gap-2">
                  <p className="text-title-medium text-on-surface">{c.name}</p>
                  {/* Cohort actions, top right (D-238) */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <IconButton icon="more_vert" size="xs" label={t('org.cohorts.actions', { name: c.name })} className="-mt-1 -mr-2" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent label={t('org.cohorts.actions', { name: c.name })}>
                      <DropdownMenuItem icon="edit" onSelect={() => setEditingCohort(c)}>
                        {t('org.cohorts.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem icon="group" onSelect={() => setCohort(c.id)}>
                        {t('org.cohorts.seePeople')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        icon="delete"
                        destructive
                        disabled={size > 0}
                        description={size > 0 ? t('org.cohorts.removeBlocked', { count: size }) : undefined}
                        onSelect={() => setRemovingCohort(c)}
                      >
                        {t('org.cohorts.remove')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <MetaChips
                  label={t('tutor.home.cohortData')}
                  items={[
                    { icon: 'person', label: t('tutor.home.people', { count: size }) },
                    { icon: 'school', label: tutor ? t('org.cohorts.tutor', { name: tutor.name }) : t('org.cohorts.noTutor') },
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
                  <TableHeaderCell className="w-14 text-right">
                    <span className="sr-only">{t('org.people.actionsCol')}</span>
                  </TableHeaderCell>
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
                    <TableCell className="text-right">
                      <PersonMenu person={p} onEdit={setEditing} onRemove={setRemoving} onStatus={(st) => updateStatus(p, st)} />
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
              <PersonMenu person={p} onEdit={setEditing} onRemove={setRemoving} onStatus={(st) => updateStatus(p, st)} />
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
      {editing && <EditPersonDialog person={editing} onClose={() => setEditing(undefined)} />}
      {editingCohort && <EditCohortDialog cohort={editingCohort} onClose={() => setEditingCohort(undefined)} />}
      <ConfirmDialog
        open={removing !== undefined}
        onOpenChange={(open) => !open && setRemoving(undefined)}
        title={t('org.people.removeTitle', { name: removing?.name ?? '' })}
        description={t('org.people.removeBody')}
        confirmLabel={t('org.people.removeConfirm')}
        onConfirm={() => {
          if (!removing) return;
          removePerson(removing.id);
          toast.success(t('org.people.removed', { name: removing.name }));
          setRemoving(undefined);
        }}
      />
      <ConfirmDialog
        open={removingCohort !== undefined}
        onOpenChange={(open) => !open && setRemovingCohort(undefined)}
        title={t('org.cohorts.removeTitle', { name: removingCohort?.name ?? '' })}
        description={t('org.cohorts.removeBody')}
        confirmLabel={t('org.cohorts.removeConfirm')}
        onConfirm={() => {
          if (!removingCohort) return;
          removeCohort(removingCohort.id);
          toast.success(t('org.cohorts.removed', { name: removingCohort.name }));
          setRemovingCohort(undefined);
        }}
      />
    </AdminShell>
  );
}

function AddPersonDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { people, cohorts, organization } = useOrgData();
  const orgId = organization.id;
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

/** Areas of each context (5.5): company areas, degrees, or user segments. */
const AREAS: Record<OrganizationKind, Area[]> = {
  employer: ['operations', 'administration', 'technology', 'commercial'],
  education: ['logistics', 'business_admin', 'accounting'],
  product: ['new_users', 'regular_users'],
};

function CreateCohortDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { people, program, organization, cohorts } = useOrgData();
  const orgId = organization.id;
  const addCohort = useDataStore((s) => s.addCohort);
  const tutors = people.filter((p) => p.role === 'tutor');
  const kind = organization.kind;
  const [name, setName] = useState('');
  const [area, setArea] = useState<Area>(AREAS[kind][0]!);
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
      ...(tutorId ? { tutorId } : {}),
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
            helperText={t('org.cohorts.areaHelp', { context: ctx(kind) })}
            value={area}
            onChange={(e) => setArea(e.target.value as Area)}
            options={AREAS[kind].map((a) => ({ value: a, label: t(`org.areas.${a}`) }))}
          />
          {tutors.length > 0 && (
          <Select
            label={t('org.cohorts.tutorLabel')}
            helperText={t('org.cohorts.tutorHelp')}
            value={tutorId}
            onChange={(e) => setTutorId(e.target.value)}
            options={tutors.map((p) => ({ value: p.id, label: p.name }))}
          />
          )}
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

/** Actions on one person (D-238): edit their data, change their status and remove them. */
function PersonMenu({
  person,
  onEdit,
  onRemove,
  onStatus,
}: {
  person: Person;
  onEdit: (p: Person) => void;
  onRemove: (p: Person) => void;
  onStatus: (status: Person['status']) => void;
}) {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton icon="more_vert" size="xs" label={t('org.people.actions', { name: person.name })} />
      </DropdownMenuTrigger>
      <DropdownMenuContent label={t('org.people.actions', { name: person.name })}>
        <DropdownMenuItem icon="edit" onSelect={() => onEdit(person)}>
          {t('org.people.edit')}
        </DropdownMenuItem>
        {person.status === 'invited' && (
          <DropdownMenuItem icon="mail" onSelect={() => onStatus('invited')}>
            {t('org.people.resend')}
          </DropdownMenuItem>
        )}
        {person.status === 'active' && (
          <DropdownMenuItem icon="pause" description={t('org.people.deactivateHelp')} onSelect={() => onStatus('inactive')}>
            {t('org.people.deactivate')}
          </DropdownMenuItem>
        )}
        {person.status === 'inactive' && (
          <DropdownMenuItem icon="play_arrow" onSelect={() => onStatus('active')}>
            {t('org.people.reactivate')}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem icon="delete" destructive onSelect={() => onRemove(person)}>
          {t('org.people.remove')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EditPersonDialog({ person, onClose }: { person: Person; onClose: () => void }) {
  const { t } = useTranslation();
  const { people, cohorts } = useOrgData();
  const updatePerson = useDataStore((s) => s.updatePerson);
  const [row, setRow] = useState({ name: person.name, email: person.email, cohort: person.cohortIds[0] ?? cohorts[0]?.id ?? '', job: person.jobOrProgram });
  const [tried, setTried] = useState(false);
  // Same rules as adding a person; the person's own e-mail is not a duplicate of itself
  const errors = validateRows([row], people.filter((p) => p.id !== person.id), cohorts)[0]!;
  const errorOf = (field: 'name' | 'email') => {
    if (!tried) return undefined;
    const e = errors.find((x) => (field === 'name' ? x === 'name_missing' : x.startsWith('email')));
    return e ? t(`org.import.errors.${e}`) : undefined;
  };
  const save = () => {
    setTried(true);
    if (errors.length) return;
    updatePerson(person.id, { name: row.name.trim(), email: row.email.trim().toLowerCase(), cohortIds: [row.cohort], jobOrProgram: row.job.trim() });
    toast.success(t('org.people.edited'));
    onClose();
  };
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        title={t('org.people.editTitle', { name: person.name })}
        description={t('org.people.editIntro')}
        actions={
          <>
            <DialogClose asChild>
              <Button variant="outlined" fullWidth className="sm:w-auto">
                {t('ui.cancel')}
              </Button>
            </DialogClose>
            <Button fullWidth className="sm:w-auto" leadingIcon="check" onClick={save}>
              {t('org.people.editSubmit')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <TextField label={t('org.people.name')} helperText={t('org.people.nameHelp')} value={row.name} onChange={(e) => setRow({ ...row, name: e.target.value })} error={errorOf('name')} autoComplete="off" />
          <TextField label={t('org.people.email')} helperText={t('org.people.emailHelp')} value={row.email} onChange={(e) => setRow({ ...row, email: e.target.value })} error={errorOf('email')} type="email" autoComplete="off" />
          <Select label={t('org.people.cohort')} helperText={t('org.people.cohortAddHelp')} value={row.cohort} onChange={(e) => setRow({ ...row, cohort: e.target.value })} options={cohorts.map((c) => ({ value: c.id, label: c.name }))} />
          <TextField label={t('org.people.job')} helperText={t('org.people.jobHelp')} value={row.job} onChange={(e) => setRow({ ...row, job: e.target.value })} optional autoComplete="off" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditCohortDialog({ cohort, onClose }: { cohort: Cohort; onClose: () => void }) {
  const { t } = useTranslation();
  const { people, program } = useOrgData();
  const updateCohort = useDataStore((s) => s.updateCohort);
  const tutors = people.filter((p) => p.role === 'tutor');
  const [name, setName] = useState(cohort.name);
  const [tutorId, setTutorId] = useState(cohort.tutorId);
  const [due, setDue] = useState(cohort.dueDate ?? '');
  const [tried, setTried] = useState(false);
  const nameError = tried && name.trim().length < 3 ? t('org.cohorts.nameError') : undefined;
  const dueError = tried && program.mode === 'assigned' && (!due || due < DEMO_TODAY) ? t('tutor.assign.dueError') : undefined;
  const save = () => {
    setTried(true);
    if (name.trim().length < 3 || (program.mode === 'assigned' && (!due || due < DEMO_TODAY))) return;
    updateCohort(cohort.id, { name: name.trim(), ...(tutorId ? { tutorId } : {}), dueDate: due || undefined });
    toast.success(t('org.cohorts.edited'));
    onClose();
  };
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        title={t('org.cohorts.editTitle', { name: cohort.name })}
        description={t('org.cohorts.editIntro')}
        actions={
          <>
            <DialogClose asChild>
              <Button variant="outlined" fullWidth className="sm:w-auto">
                {t('ui.cancel')}
              </Button>
            </DialogClose>
            <Button fullWidth className="sm:w-auto" leadingIcon="check" onClick={save}>
              {t('org.cohorts.editSubmit')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <TextField label={t('org.cohorts.name')} helperText={t('org.cohorts.nameHelp')} value={name} onChange={(e) => setName(e.target.value)} error={nameError} autoComplete="off" />
          {tutors.length > 0 && (
            <Select label={t('org.cohorts.tutorLabel')} helperText={t('org.cohorts.tutorHelp')} value={tutorId ?? ''} onChange={(e) => setTutorId(e.target.value)} options={tutors.map((p) => ({ value: p.id, label: p.name }))} />
          )}
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
