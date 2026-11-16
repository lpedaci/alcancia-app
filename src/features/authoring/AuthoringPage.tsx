import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEMO_TODAY } from '@/app/config';
import { officialSourceOptions } from '@/app/content-sources';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { type IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { IconTile } from '@/components/ui/IconTile';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { SegmentedButton } from '@/components/ui/SegmentedButton';
import { Select } from '@/components/ui/Select';
import { StatusPill } from '@/components/ui/StatusPill';
import { TextArea } from '@/components/ui/TextArea';
import { TextField } from '@/components/ui/TextField';
import { toast } from '@/components/ui/toast-store';
import { GUIDES, MODULES } from '@/features/learning/questions';
import { AdminShell } from '@/features/organization/AdminShell';
import { TOOL_IDS } from '@/features/simulators/defs';
import { TutorShell } from '@/features/tutor/TutorShell';
import { formatDate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { useDataStore, useOrgData } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';
import type { CustomCard, CustomLesson } from '@/types/domain';
import {
  BLOCK_KINDS,
  type BlockDraft,
  type BlockKind,
  blockErrors,
  cardErrors,
  emptyBlock,
  lessonErrors,
  newKey,
  QUESTION_KINDS,
  type QuestionDraft,
  type QuestionKind,
  toBlocks,
  toDrafts,
} from './authoring';

/**
 * Lesson and card builder (F14, step 31, D-317), for tutors (their cohorts) and L&D (every cohort of
 * the organization). A lesson reuses the guide blocks: objective, text, example, practice question,
 * embedded tool and "Para tu vida"; it is published to cohorts and the people see it in Aprender. A
 * card joins the catalog of the right moment for those cohorts. Learning content only: no money and
 * no data of anyone. Everything stays in the demo data of the browser.
 */
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';
const BLOCK_ICON: Record<BlockKind, IconName> = { objective: 'flag', text: 'article', example: 'format_list_numbered', practice: 'quiz', tool: 'calculate', takeaway: 'event_available' };
const TRIGGERS = ['salary_received', 'subscription_first_debit', 'transfer_new_payee', 'yield_mode_chosen', 'term_deposit_made', 'card_paid_partially', 'installment_purchase', 'loan_taken', 'investment_bought', 'message_received'];

export function AuthoringPage({ role }: { role: 'tutor' | 'admin' }) {
  const { t } = useTranslation();
  const [view, setView] = useState<'lessons' | 'cards'>('lessons');
  const Shell = role === 'tutor' ? TutorShell : AdminShell;
  return (
    <Shell>
      <header className="flex flex-col gap-2">
        <h1 className="text-headline-medium text-on-surface">{t('authoring.title')}</h1>
        <p className="max-w-prose text-body-large text-on-surface-variant">{t(`authoring.intro.${role}`)}</p>
      </header>
      <SegmentedButton
        label={t('authoring.view')}
        value={view}
        onValueChange={setView}
        options={[
          { value: 'lessons', label: t('authoring.lessons') },
          { value: 'cards', label: t('authoring.cards') },
        ]}
      />
      {view === 'lessons' ? <Lessons role={role} /> : <Cards role={role} />}
    </Shell>
  );
}

/** The cohorts the author can publish to: a tutor, hers; L&D, all of the organization. */
function useAudience(role: 'tutor' | 'admin') {
  const user = useCurrentUser();
  const data = useOrgData();
  const cohorts = role === 'tutor' ? data.cohorts.filter((c) => c.tutorId === user?.personId) : data.cohorts;
  return { user, data, cohorts };
}

function CohortPicker({ cohorts, value, onChange, error }: { cohorts: { id: string; name: string }[]; value: string[]; onChange: (ids: string[]) => void; error?: string }) {
  const { t } = useTranslation();
  return (
    <fieldset className="flex flex-col gap-1" aria-describedby={error ? 'cohorts-error' : undefined}>
      <legend className="pb-1 text-label-large text-on-surface">{t('authoring.cohorts')}</legend>
      <p className="text-body-small text-on-surface-variant">{t('authoring.cohortsHelp')}</p>
      {cohorts.map((c) => (
        <Checkbox
          key={c.id}
          label={c.name}
          checked={value.includes(c.id)}
          onChange={(e) => onChange(e.target.checked ? [...value, c.id] : value.filter((id) => id !== c.id))}
        />
      ))}
      {error && (
        <p id="cohorts-error" className="text-body-small text-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}

// ---------- Lessons ----------

function Lessons({ role }: { role: 'tutor' | 'admin' }) {
  const { t } = useTranslation();
  const { user, data, cohorts } = useAudience(role);
  const remove = useDataStore((s) => s.deleteLesson);
  const [editing, setEditing] = useState<CustomLesson | 'new' | undefined>();
  const [toDelete, setToDelete] = useState<CustomLesson | undefined>();
  const mine = data.customLessons.filter((l) => (role === 'admin' ? true : l.authorId === user?.personId)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const authorName = (id: string) => data.people.find((p) => p.id === id)?.name ?? '';

  if (editing) return <LessonEditor role={role} lesson={editing === 'new' ? undefined : editing} cohorts={cohorts} onClose={() => setEditing(undefined)} />;

  return (
    <section aria-labelledby="lessons-title" className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <IconTile icon="menu_book" tone="primary" />
          <h2 id="lessons-title" className="text-title-large text-on-surface">
            {t('authoring.lessons')}
          </h2>
        </div>
        <Button leadingIcon="add" onClick={() => setEditing('new')}>
          {t('authoring.newLesson')}
        </Button>
      </div>
      {mine.length === 0 ? (
        <p className="text-body-medium text-on-surface-variant">{t('authoring.noLessons')}</p>
      ) : (
        <ul className="@container flex flex-col divide-y divide-outline-variant">
          {mine.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span className="flex w-full min-w-0 flex-col gap-1 @md:w-auto @md:flex-1">
                <span className="text-title-small text-on-surface">{l.title}</span>
                <span className="text-body-small text-on-surface-variant">
                  {t('authoring.lessonMeta', {
                    module: MODULES.find((m) => m.id === l.moduleId)?.order ?? '',
                    blocks: l.blocks.length,
                    cohorts: l.cohortIds.length,
                    date: formatDate(l.updatedAt),
                  })}
                  {role === 'admin' && ` · ${t('authoring.by', { name: authorName(l.authorId) })}`}
                </span>
              </span>
              <StatusPill tone={l.status === 'published' ? 'success' : 'neutral'} icon={l.status === 'published' ? 'public' : 'edit_note'} label={t(`authoring.status.${l.status}`)} />
              <span className="flex gap-1">
                <IconButton icon="edit" size="xs" label={t('authoring.edit', { title: l.title })} onClick={() => setEditing(l)} />
                <IconButton icon="delete" size="xs" label={t('authoring.delete', { title: l.title })} onClick={() => setToDelete(l)} />
              </span>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(o) => !o && setToDelete(undefined)}
        title={t('authoring.deleteLessonTitle')}
        description={t('authoring.deleteLessonBody', { title: toDelete?.title ?? '' })}
        confirmLabel={t('authoring.deleteLesson')}
        onConfirm={() => {
          if (toDelete) remove(toDelete.id);
          setToDelete(undefined);
          toast.success(t('authoring.deleted'));
        }}
      />
    </section>
  );
}

function LessonEditor({ role, lesson, cohorts, onClose }: { role: 'tutor' | 'admin'; lesson?: CustomLesson; cohorts: { id: string; name: string }[]; onClose: () => void }) {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const orgId = useOrgData().organization.id;
  const save = useDataStore((s) => s.saveLesson);
  const [title, setTitle] = useState(lesson?.title ?? '');
  const [moduleId, setModuleId] = useState(lesson?.moduleId ?? '');
  const [minutes, setMinutes] = useState(String(lesson?.minutes ?? 5));
  const [cohortIds, setCohortIds] = useState<string[]>(lesson?.cohortIds ?? []);
  const [blocks, setBlocks] = useState<BlockDraft[]>(() => (lesson ? toDrafts(lesson) : [emptyBlock('objective'), emptyBlock('text')]));
  const [tried, setTried] = useState(false);
  const errors = lessonErrors({ title, moduleId, cohortIds, blocks });

  const update = (key: string, next: BlockDraft) => setBlocks((list) => list.map((b) => (b.key === key ? next : b)));
  const move = (i: number, by: number) =>
    setBlocks((list) => {
      const copy = [...list];
      const [item] = copy.splice(i, 1);
      copy.splice(i + by, 0, item!);
      return copy;
    });

  const persist = (status: CustomLesson['status']) => {
    setTried(true);
    if (status === 'published' && errors.length > 0) return;
    if (!title.trim()) return;
    const id = lesson?.id ?? newKey('lesson');
    save({
      id,
      orgId,
      authorId: lesson?.authorId ?? user?.personId ?? '',
      title: title.trim(),
      moduleId,
      minutes: Math.min(15, Math.max(1, Number(minutes) || 5)),
      blocks: toBlocks(blocks, id, moduleId),
      cohortIds,
      status,
      updatedAt: DEMO_TODAY,
    });
    toast.success(t(status === 'published' ? 'authoring.published' : 'authoring.saved'));
    onClose();
  };

  return (
    <div className="flex flex-col gap-(--space-bento-gap)">
      <Button variant="text" leadingIcon="arrow_back" className="self-start" onClick={onClose}>
        {t('authoring.backToList')}
      </Button>
      <section aria-labelledby="lesson-data" className={card}>
        <h2 id="lesson-data" className="text-title-large text-on-surface">
          {lesson ? t('authoring.editLesson') : t('authoring.newLesson')}
        </h2>
        <div className="grid grid-cols-1 gap-4 medium:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <TextField label={t('authoring.lessonTitle')} helperText={t('authoring.lessonTitleHelp')} value={title} onChange={(e) => setTitle(e.target.value)} error={tried && !title.trim() ? t('authoring.required') : undefined} />
          <TextField label={t('authoring.minutes')} helperText={t('authoring.minutesHelp')} inputMode="numeric" value={minutes} onChange={(e) => setMinutes(e.target.value.replace(/\D/g, ''))} />
        </div>
        <Select
          label={t('authoring.module')}
          helperText={t('authoring.moduleHelp')}
          value={moduleId}
          onChange={(e) => setModuleId(e.target.value)}
          error={tried && !moduleId ? t('authoring.required') : undefined}
          options={[{ value: '', label: t('authoring.choose') }, ...MODULES.map((m) => ({ value: m.id, label: t('authoring.moduleOption', { n: m.order, title: m.title }) }))]}
        />
        <CohortPicker cohorts={cohorts} value={cohortIds} onChange={setCohortIds} error={tried && cohortIds.length === 0 ? t('authoring.cohortsError') : undefined} />
      </section>

      <section aria-labelledby="lesson-blocks" className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="lesson-blocks" className="text-title-large text-on-surface">
            {t('authoring.blocks')}
          </h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="tonal" leadingIcon="add">
                {t('authoring.addBlock')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent label={t('authoring.addBlock')}>
              {BLOCK_KINDS.map((k) => (
                <DropdownMenuItem key={k} icon={BLOCK_ICON[k]} description={t(`authoring.blockHelp.${k}`)} onSelect={() => setBlocks((list) => [...list, emptyBlock(k)])}>
                  {t(`authoring.block.${k}`)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-body-small text-on-surface-variant">{t('authoring.blocksHelp')}</p>
        <ol className="flex flex-col gap-3">
          {blocks.map((b, i) => (
            <li key={b.key} className="flex flex-col gap-3 rounded-lg border border-outline-variant p-3 sm:p-4">
              <div className="flex flex-wrap items-center gap-2">
                <IconTile icon={BLOCK_ICON[b.kind]} tone="secondary" size="sm" />
                <h3 className="min-w-0 flex-1 text-title-small text-on-surface">{t('authoring.blockN', { n: i + 1, kind: t(`authoring.block.${b.kind}`) })}</h3>
                <span className="flex gap-1">
                  <IconButton icon="arrow_upward" size="xs" label={t('authoring.up', { n: i + 1 })} disabled={i === 0} onClick={() => move(i, -1)} />
                  <IconButton icon="arrow_downward" size="xs" label={t('authoring.down', { n: i + 1 })} disabled={i === blocks.length - 1} onClick={() => move(i, 1)} />
                  <IconButton icon="delete" size="xs" label={t('authoring.removeBlock', { n: i + 1 })} onClick={() => setBlocks((list) => list.filter((x) => x.key !== b.key))} />
                </span>
              </div>
              <BlockEditor block={b} onChange={(next) => update(b.key, next)} showErrors={tried} />
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-col gap-3">
        <div aria-live="polite">
          {tried && errors.length > 0 && (
            <InlineAlert tone="info" title={t('authoring.missingTitle')}>
              {errors.map((e) => t(`authoring.missing.${e}`)).join(' ')}
            </InlineAlert>
          )}
        </div>
        <div className="flex flex-col gap-2 medium:flex-row medium:justify-end">
          <Button variant="outlined" leadingIcon="save" className="w-full medium:w-auto" onClick={() => persist('draft')}>
            {t('authoring.saveDraft')}
          </Button>
          <Button leadingIcon="public" className="w-full medium:w-auto" onClick={() => persist('published')}>
            {lesson?.status === 'published' ? t('authoring.update') : t('authoring.publish')}
          </Button>
        </div>
        {role === 'tutor' && <p className="text-body-small text-on-surface-variant medium:text-right">{t('authoring.tutorNote')}</p>}
      </div>
    </div>
  );
}

function BlockEditor({ block, onChange, showErrors }: { block: BlockDraft; onChange: (b: BlockDraft) => void; showErrors: boolean }) {
  const { t } = useTranslation();
  const errs = showErrors ? blockErrors(block) : [];
  const err = (key: string) => (errs.includes(key) ? t('authoring.required') : undefined);
  switch (block.kind) {
    case 'objective':
    case 'takeaway':
      return (
        <TextArea
          label={t(`authoring.field.${block.kind}`)}
          helperText={t(`authoring.field.${block.kind}Help`)}
          rows={2}
          value={block.body}
          onChange={(e) => onChange({ ...block, body: e.target.value })}
          error={err('body')}
        />
      );
    case 'text':
      return (
        <>
          <TextField label={t('authoring.field.title')} helperText={t('authoring.field.titleHelp')} value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} error={err('title')} />
          <TextArea label={t('authoring.field.body')} helperText={t('authoring.field.bodyHelp')} rows={4} value={block.body} onChange={(e) => onChange({ ...block, body: e.target.value })} error={err('body')} />
        </>
      );
    case 'example':
      return (
        <>
          <TextField label={t('authoring.field.title')} helperText={t('authoring.field.exampleTitleHelp')} value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} error={err('title')} />
          {block.steps.map((step, i) => (
            <TextField
              key={i}
              label={t('authoring.field.step', { n: i + 1 })}
              helperText={i === 0 ? t('authoring.field.stepHelp') : ''}
              value={step}
              onChange={(e) => onChange({ ...block, steps: block.steps.map((s, j) => (j === i ? e.target.value : s)) })}
              error={i < 2 && errs.includes('steps') && !step.trim() ? t('authoring.required') : undefined}
            />
          ))}
          <Button variant="text" size="xs" leadingIcon="add" className="self-start" disabled={block.steps.length >= 6} onClick={() => onChange({ ...block, steps: [...block.steps, ''] })}>
            {t('authoring.field.addStep')}
          </Button>
        </>
      );
    case 'tool':
      return (
        <>
          <Select
            label={t('authoring.field.tool')}
            helperText={t('authoring.field.toolHelp')}
            value={block.simId}
            onChange={(e) => onChange({ ...block, simId: e.target.value })}
            options={TOOL_IDS.map((id) => ({ value: id, label: id === 'SIM-3' ? t('sim3.title') : t(`sims.${id}.title`) }))}
          />
          <TextArea label={t('authoring.field.tryThis')} helperText={t('authoring.field.tryThisHelp')} rows={2} value={block.body} onChange={(e) => onChange({ ...block, body: e.target.value })} error={err('body')} />
        </>
      );
    case 'practice':
      return <QuestionEditor question={block.question} onChange={(q) => onChange({ ...block, question: q })} errors={errs} />;
  }
}

function QuestionEditor({ question: q, onChange, errors }: { question: QuestionDraft; onChange: (q: QuestionDraft) => void; errors: string[] }) {
  const { t } = useTranslation();
  const req = (key: string) => (errors.includes(key) ? t(`authoring.qMissing.${key}`) : undefined);
  const optionList = (key: 'options' | 'whyOptions', single: boolean) => (
    <fieldset className="flex flex-col gap-2">
      <legend className="pb-1 text-label-large text-on-surface">{t(key === 'options' ? 'authoring.q.options' : 'authoring.q.whyOptions')}</legend>
      <p className="text-body-small text-on-surface-variant">{t(single ? 'authoring.q.markOne' : 'authoring.q.markSome')}</p>
      {q[key].map((o, i) => (
        <div key={o.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-end gap-2">
          <Checkbox
            label={<span className="sr-only">{t('authoring.q.isCorrect', { n: i + 1 })}</span>}
            checked={o.correct}
            onChange={(e) =>
              onChange({ ...q, [key]: q[key].map((x) => (x.id === o.id ? { ...x, correct: e.target.checked } : single && e.target.checked ? { ...x, correct: false } : x)) })
            }
          />
          <TextField label={t('authoring.q.option', { n: i + 1 })} helperText="" value={o.text} onChange={(e) => onChange({ ...q, [key]: q[key].map((x) => (x.id === o.id ? { ...x, text: e.target.value } : x)) })} />
          <IconButton icon="delete" size="xs" label={t('authoring.q.removeOption', { n: i + 1 })} disabled={q[key].length <= 2} onClick={() => onChange({ ...q, [key]: q[key].filter((x) => x.id !== o.id) })} className="mb-1" />
        </div>
      ))}
      {q[key].length < 5 && (
        <Button variant="text" size="xs" leadingIcon="add" className="self-start" onClick={() => onChange({ ...q, [key]: [...q[key], { id: newKey('o'), text: '', correct: false }] })}>
          {t('authoring.q.addOption')}
        </Button>
      )}
    </fieldset>
  );

  return (
    <div className="flex flex-col gap-4">
      <Select
        label={t('authoring.q.kind')}
        helperText={t('authoring.q.kindHelp')}
        value={q.kind}
        onChange={(e) => onChange({ ...q, kind: e.target.value as QuestionKind })}
        options={QUESTION_KINDS.map((k) => ({ value: k, label: t(`authoring.q.kinds.${k}`) }))}
      />
      <TextArea label={t(q.kind === 'true_false_why' ? 'authoring.q.statement' : 'authoring.q.prompt')} helperText={t('authoring.q.promptHelp')} rows={2} value={q.prompt} onChange={(e) => onChange({ ...q, prompt: e.target.value })} error={req('prompt')} />
      {(q.kind === 'single' || q.kind === 'multiple') && optionList('options', q.kind === 'single')}
      {q.kind === 'true_false_why' && (
        <>
          <RadioGroup
            name={`tf-${q.prompt.length}`}
            legend={t('authoring.q.statementIs')}
            value={q.statementTrue ? 'true' : 'false'}
            onChange={(e) => onChange({ ...q, statementTrue: e.target.value === 'true' })}
            options={[
              { value: 'true', label: t('authoring.q.true') },
              { value: 'false', label: t('authoring.q.false') },
            ]}
            optionsClassName="grid grid-cols-2 gap-2"
          />
          <TextField label={t('authoring.q.whyPrompt')} helperText={t('authoring.q.whyPromptHelp')} value={q.whyPrompt} onChange={(e) => onChange({ ...q, whyPrompt: e.target.value })} error={req('why')} />
          {optionList('whyOptions', true)}
        </>
      )}
      {q.kind === 'simulator_task' && (
        <Select
          label={t('authoring.field.tool')}
          helperText={t('authoring.q.simHelp')}
          value={q.simId}
          onChange={(e) => onChange({ ...q, simId: e.target.value })}
          options={TOOL_IDS.filter((id) => id !== 'SIM-3').map((id) => ({ value: id, label: t(`sims.${id}.title`) }))}
        />
      )}
      {(q.kind === 'numeric' || q.kind === 'simulator_task') && (
        <div className="grid grid-cols-1 gap-4 medium:grid-cols-3">
          <TextField label={t('authoring.q.answer')} helperText={t('authoring.q.answerHelp')} inputMode="decimal" value={q.answer} onChange={(e) => onChange({ ...q, answer: e.target.value })} error={req('answer')} />
          <TextField label={t('authoring.q.tolerance')} helperText={t('authoring.q.toleranceHelp')} inputMode="decimal" value={q.tolerance} onChange={(e) => onChange({ ...q, tolerance: e.target.value })} error={req('tolerance')} />
          <Select
            label={t('authoring.q.unit')}
            helperText={t('authoring.q.unitHelp')}
            value={q.unit}
            onChange={(e) => onChange({ ...q, unit: e.target.value as QuestionDraft['unit'] })}
            options={(['ARS', 'percent', 'months'] as const).map((u) => ({ value: u, label: t(`authoring.q.units.${u}`) }))}
          />
        </div>
      )}
      {q.kind === 'ordering' && (
        <fieldset className="flex flex-col gap-2">
          <legend className="pb-1 text-label-large text-on-surface">{t('authoring.q.items')}</legend>
          <p className="text-body-small text-on-surface-variant">{t('authoring.q.itemsHelp')}</p>
          {q.items.map((item, i) => (
            <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
              <TextField label={t('authoring.q.item', { n: i + 1 })} helperText="" value={item.text} onChange={(e) => onChange({ ...q, items: q.items.map((x) => (x.id === item.id ? { ...x, text: e.target.value } : x)) })} />
              <IconButton icon="delete" size="xs" label={t('authoring.q.removeItem', { n: i + 1 })} disabled={q.items.length <= 3} onClick={() => onChange({ ...q, items: q.items.filter((x) => x.id !== item.id) })} className="mb-1" />
            </div>
          ))}
          {q.items.length < 6 && (
            <Button variant="text" size="xs" leadingIcon="add" className="self-start" onClick={() => onChange({ ...q, items: [...q.items, { id: newKey('i'), text: '' }] })}>
              {t('authoring.q.addItem')}
            </Button>
          )}
          {errors.includes('items') && <p className="text-body-small text-error">{t('authoring.qMissing.items')}</p>}
        </fieldset>
      )}
      {q.kind === 'matching' && (
        <fieldset className="flex flex-col gap-3">
          <legend className="pb-1 text-label-large text-on-surface">{t('authoring.q.pairs')}</legend>
          <p className="text-body-small text-on-surface-variant">{t('authoring.q.pairsHelp')}</p>
          {q.pairs.map((pair, i) => (
            <div key={pair.id} className="grid grid-cols-1 items-end gap-2 medium:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]">
              <TextField label={t('authoring.q.term', { n: i + 1 })} helperText="" value={pair.left} onChange={(e) => onChange({ ...q, pairs: q.pairs.map((x) => (x.id === pair.id ? { ...x, left: e.target.value } : x)) })} />
              <TextField label={t('authoring.q.definition', { n: i + 1 })} helperText="" value={pair.right} onChange={(e) => onChange({ ...q, pairs: q.pairs.map((x) => (x.id === pair.id ? { ...x, right: e.target.value } : x)) })} />
              <IconButton icon="delete" size="xs" label={t('authoring.q.removePair', { n: i + 1 })} disabled={q.pairs.length <= 3} onClick={() => onChange({ ...q, pairs: q.pairs.filter((x) => x.id !== pair.id) })} className="mb-1 justify-self-end" />
            </div>
          ))}
          {q.pairs.length < 6 && (
            <Button variant="text" size="xs" leadingIcon="add" className="self-start" onClick={() => onChange({ ...q, pairs: [...q.pairs, { id: newKey('p'), left: '', right: '' }] })}>
              {t('authoring.q.addPair')}
            </Button>
          )}
          {errors.includes('pairs') && <p className="text-body-small text-error">{t('authoring.qMissing.pairs')}</p>}
        </fieldset>
      )}
      {q.kind === 'categorize' && (
        <>
          <fieldset className="flex flex-col gap-2">
            <legend className="pb-1 text-label-large text-on-surface">{t('authoring.q.categories')}</legend>
            <p className="text-body-small text-on-surface-variant">{t('authoring.q.categoriesHelp')}</p>
            <div className="grid grid-cols-1 gap-2 medium:grid-cols-2">
              {q.categories.map((c, i) => (
                <TextField key={c.id} label={t('authoring.q.category', { n: i + 1 })} helperText="" value={c.label} onChange={(e) => onChange({ ...q, categories: q.categories.map((x) => (x.id === c.id ? { ...x, label: e.target.value } : x)) })} />
              ))}
            </div>
            <span className="flex flex-wrap gap-2">
              {q.categories.length < 4 && (
                <Button variant="text" size="xs" leadingIcon="add" onClick={() => onChange({ ...q, categories: [...q.categories, { id: newKey('c'), label: '' }] })}>
                  {t('authoring.q.addCategory')}
                </Button>
              )}
              {q.categories.length > 2 && (
                <Button
                  variant="text"
                  size="xs"
                  leadingIcon="remove"
                  onClick={() => {
                    const last = q.categories[q.categories.length - 1]!;
                    onChange({ ...q, categories: q.categories.slice(0, -1), catItems: q.catItems.map((x) => (x.categoryId === last.id ? { ...x, categoryId: q.categories[0]!.id } : x)) });
                  }}
                >
                  {t('authoring.q.removeCategory')}
                </Button>
              )}
            </span>
            {errors.includes('categories') && <p className="text-body-small text-error">{t('authoring.qMissing.categories')}</p>}
          </fieldset>
          <fieldset className="flex flex-col gap-3">
            <legend className="pb-1 text-label-large text-on-surface">{t('authoring.q.catItems')}</legend>
            <p className="text-body-small text-on-surface-variant">{t('authoring.q.catItemsHelp')}</p>
            {q.catItems.map((item, i) => (
              <div key={item.id} className="grid grid-cols-1 items-end gap-2 medium:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]">
                <TextField label={t('authoring.q.item', { n: i + 1 })} helperText="" value={item.text} onChange={(e) => onChange({ ...q, catItems: q.catItems.map((x) => (x.id === item.id ? { ...x, text: e.target.value } : x)) })} />
                <Select
                  label={t('authoring.q.itemCategory', { n: i + 1 })}
                  helperText=""
                  value={item.categoryId}
                  onChange={(e) => onChange({ ...q, catItems: q.catItems.map((x) => (x.id === item.id ? { ...x, categoryId: e.target.value } : x)) })}
                  options={q.categories.map((c, j) => ({ value: c.id, label: c.label.trim() || t('authoring.q.category', { n: j + 1 }) }))}
                />
                <IconButton icon="delete" size="xs" label={t('authoring.q.removeItem', { n: i + 1 })} disabled={q.catItems.length <= 4} onClick={() => onChange({ ...q, catItems: q.catItems.filter((x) => x.id !== item.id) })} className="mb-1 justify-self-end" />
              </div>
            ))}
            {q.catItems.length < 10 && (
              <Button variant="text" size="xs" leadingIcon="add" className="self-start" onClick={() => onChange({ ...q, catItems: [...q.catItems, { id: newKey('k'), text: '', categoryId: q.categories[0]!.id }] })}>
                {t('authoring.q.addItem')}
              </Button>
            )}
            {errors.includes('catItems') && <p className="text-body-small text-error">{t('authoring.qMissing.catItems')}</p>}
          </fieldset>
        </>
      )}
      {q.kind === 'branching' && (
        <fieldset className="flex flex-col gap-3">
          <legend className="pb-1 text-label-large text-on-surface">{t('authoring.q.steps')}</legend>
          <p className="text-body-small text-on-surface-variant">{t('authoring.q.stepsHelp')}</p>
          {q.steps.map((st, i) => {
            const set = (patch: Partial<typeof st>) => onChange({ ...q, steps: q.steps.map((x) => (x.id === st.id ? { ...x, ...patch } : x)) });
            return (
              <div key={st.id} className="flex flex-col gap-3 rounded-md bg-surface-container p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-title-small text-on-surface">{t('authoring.q.step', { n: i + 1 })}</span>
                  <IconButton icon="delete" size="xs" label={t('authoring.q.removeStep', { n: i + 1 })} disabled={q.steps.length <= 2} onClick={() => onChange({ ...q, steps: q.steps.filter((x) => x.id !== st.id) })} />
                </div>
                <TextArea label={t('authoring.q.situation')} helperText={t('authoring.q.situationHelp')} rows={2} value={st.text} onChange={(e) => set({ text: e.target.value })} />
                <div className="grid grid-cols-1 gap-3 medium:grid-cols-2">
                  <TextField label={t('authoring.q.goodChoice')} helperText={t('authoring.q.goodChoiceHelp')} value={st.good} onChange={(e) => set({ good: e.target.value })} />
                  <TextField label={t('authoring.q.badChoice')} helperText={t('authoring.q.badChoiceHelp')} value={st.bad} onChange={(e) => set({ bad: e.target.value })} />
                </div>
                <TextArea label={t('authoring.q.badFeedback')} helperText={t('authoring.q.badFeedbackHelp')} rows={2} value={st.badFeedback} onChange={(e) => set({ badFeedback: e.target.value })} />
              </div>
            );
          })}
          {q.steps.length < 5 && (
            <Button variant="text" size="xs" leadingIcon="add" className="self-start" onClick={() => onChange({ ...q, steps: [...q.steps, { id: newKey('s'), text: '', good: '', bad: '', badFeedback: '' }] })}>
              {t('authoring.q.addStep')}
            </Button>
          )}
          {errors.includes('steps') && <p className="text-body-small text-error">{t('authoring.qMissing.steps')}</p>}
          <TextArea label={t('authoring.q.goodOutcome')} helperText={t('authoring.q.goodOutcomeHelp')} rows={2} value={q.goodOutcome} onChange={(e) => onChange({ ...q, goodOutcome: e.target.value })} error={errors.includes('goodOutcome') ? t('authoring.required') : undefined} />
        </fieldset>
      )}
      {errors.includes('options') && <p className="text-body-small text-error">{t('authoring.qMissing.options')}</p>}
      {errors.includes('correct') && <p className="text-body-small text-error">{t('authoring.qMissing.correct')}</p>}
      {q.kind !== 'branching' && (
      <div className="grid grid-cols-1 gap-4 medium:grid-cols-2">
        <TextArea label={t('authoring.q.correctFeedback')} helperText={t('authoring.q.correctFeedbackHelp')} rows={2} value={q.correctFeedback} onChange={(e) => onChange({ ...q, correctFeedback: e.target.value })} error={errors.includes('feedback') && !q.correctFeedback.trim() ? t('authoring.required') : undefined} />
        <TextArea label={t('authoring.q.incorrectFeedback')} helperText={t('authoring.q.incorrectFeedbackHelp')} rows={2} value={q.incorrectFeedback} onChange={(e) => onChange({ ...q, incorrectFeedback: e.target.value })} error={errors.includes('feedback') && !q.incorrectFeedback.trim() ? t('authoring.required') : undefined} />
      </div>
      )}
    </div>
  );
}

// ---------- Cards ----------

function Cards({ role }: { role: 'tutor' | 'admin' }) {
  const { t } = useTranslation();
  const { user, data, cohorts } = useAudience(role);
  const remove = useDataStore((s) => s.deleteCard);
  const [editing, setEditing] = useState<CustomCard | 'new' | undefined>();
  const [toDelete, setToDelete] = useState<CustomCard | undefined>();
  const mine = data.customCards.filter((c) => (role === 'admin' ? true : c.authorId === user?.personId)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  if (editing) return <CardEditor card={editing === 'new' ? undefined : editing} cohorts={cohorts} onClose={() => setEditing(undefined)} />;

  return (
    <section aria-labelledby="cards-title" className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <IconTile icon="bolt" tone="tertiary" />
          <h2 id="cards-title" className="text-title-large text-on-surface">
            {t('authoring.cards')}
          </h2>
        </div>
        <Button leadingIcon="add" onClick={() => setEditing('new')}>
          {t('authoring.newCard')}
        </Button>
      </div>
      <p className="text-body-small text-on-surface-variant">{t('authoring.cardsHelp')}</p>
      {mine.length === 0 ? (
        <p className="text-body-medium text-on-surface-variant">{t('authoring.noCards')}</p>
      ) : (
        <ul className="@container flex flex-col divide-y divide-outline-variant">
          {mine.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span className="flex w-full min-w-0 flex-col gap-1 @md:w-auto @md:flex-1">
                <span className="text-title-small text-on-surface">{c.title}</span>
                <span className="text-body-small text-on-surface-variant">{t('authoring.cardMeta', { trigger: t(`authoring.triggers.${c.trigger}`), cohorts: c.cohortIds.length, date: formatDate(c.updatedAt) })}</span>
              </span>
              <StatusPill tone={c.status === 'published' ? 'success' : 'neutral'} icon={c.status === 'published' ? 'public' : 'edit_note'} label={t(`authoring.status.${c.status}`)} />
              <span className="flex gap-1">
                <IconButton icon="edit" size="xs" label={t('authoring.edit', { title: c.title })} onClick={() => setEditing(c)} />
                <IconButton icon="delete" size="xs" label={t('authoring.delete', { title: c.title })} onClick={() => setToDelete(c)} />
              </span>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(o) => !o && setToDelete(undefined)}
        title={t('authoring.deleteCardTitle')}
        description={t('authoring.deleteCardBody', { title: toDelete?.title ?? '' })}
        confirmLabel={t('authoring.deleteCard')}
        onConfirm={() => {
          if (toDelete) remove(toDelete.id);
          setToDelete(undefined);
          toast.success(t('authoring.deleted'));
        }}
      />
    </section>
  );
}

function CardEditor({ card: existing, cohorts, onClose }: { card?: CustomCard; cohorts: { id: string; name: string }[]; onClose: () => void }) {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const orgId = useOrgData().organization.id;
  const save = useDataStore((s) => s.saveCard);
  const [trigger, setTrigger] = useState(existing?.trigger ?? '');
  const [title, setTitle] = useState(existing?.title ?? '');
  const [body, setBody] = useState(existing?.body ?? '');
  const [source, setSource] = useState(existing?.sourceIds[0] ?? '');
  const [guideId, setGuideId] = useState(existing?.guide.guideId ?? '');
  const [part, setPart] = useState(String(existing?.guide.part ?? 1));
  const [cohortIds, setCohortIds] = useState<string[]>(existing?.cohortIds ?? []);
  const [withQuestion, setWithQuestion] = useState(Boolean(existing?.question));
  const [question, setQuestion] = useState(
    existing?.question ?? { prompt: '', options: [{ id: 'a', text: '' }, { id: 'b', text: '' }], correct: 'a', feedback: { correct: '', incorrect: '' } },
  );
  const [tried, setTried] = useState(false);
  const draft = { trigger, title, body, guide: { guideId, part: Number(part) || 0 }, cohortIds, question: withQuestion ? question : undefined };
  const errors = cardErrors(draft);
  const guide = GUIDES.find((g) => g.id === guideId);

  const persist = (status: CustomCard['status']) => {
    setTried(true);
    if (status === 'published' && errors.length > 0) return;
    if (!title.trim()) return;
    save({
      id: existing?.id ?? newKey('card'),
      orgId,
      authorId: existing?.authorId ?? user?.personId ?? '',
      trigger,
      title: title.trim(),
      body: body.trim(),
      sourceIds: source ? [source] : [],
      ...(withQuestion ? { question } : {}),
      guide: { guideId, part: Math.min(Math.max(1, Number(part) || 1), guide?.blocks.length ?? 1) },
      cohortIds,
      status,
      updatedAt: DEMO_TODAY,
    });
    toast.success(t(status === 'published' ? 'authoring.published' : 'authoring.saved'));
    onClose();
  };

  return (
    <div className="flex flex-col gap-(--space-bento-gap)">
      <Button variant="text" leadingIcon="arrow_back" className="self-start" onClick={onClose}>
        {t('authoring.backToList')}
      </Button>
      <section aria-labelledby="card-editor" className={card}>
        <h2 id="card-editor" className="text-title-large text-on-surface">
          {existing ? t('authoring.editCard') : t('authoring.newCard')}
        </h2>
        <Select
          label={t('authoring.trigger')}
          helperText={t('authoring.triggerHelp')}
          value={trigger}
          onChange={(e) => setTrigger(e.target.value)}
          error={tried && !trigger ? t('authoring.required') : undefined}
          options={[{ value: '', label: t('authoring.choose') }, ...TRIGGERS.map((tr) => ({ value: tr, label: t(`authoring.triggers.${tr}`) }))]}
        />
        <TextField label={t('authoring.cardTitle')} helperText={t('authoring.cardTitleHelp')} value={title} onChange={(e) => setTitle(e.target.value)} error={tried && !title.trim() ? t('authoring.required') : undefined} />
        <TextArea label={t('authoring.cardBody')} helperText={t('authoring.cardBodyHelp')} rows={3} value={body} onChange={(e) => setBody(e.target.value)} error={tried && !body.trim() ? t('authoring.required') : undefined} />
        <Select
          label={t('authoring.source')}
          helperText={t('authoring.sourceHelp')}
          value={source}
          onChange={(e) => setSource(e.target.value)}
          options={[{ value: '', label: t('authoring.noSource') }, ...officialSourceOptions().map((o) => ({ value: o.code, label: o.name }))]}
        />
        <div className="grid grid-cols-1 gap-4 medium:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
          <Select
            label={t('authoring.guide')}
            helperText={t('authoring.guideHelp')}
            value={guideId}
            onChange={(e) => setGuideId(e.target.value)}
            error={tried && !guideId ? t('authoring.required') : undefined}
            options={[{ value: '', label: t('authoring.choose') }, ...GUIDES.map((g) => ({ value: g.id, label: g.title }))]}
          />
          <TextField
            label={t('authoring.part')}
            helperText={t('authoring.partHelp', { total: guide?.blocks.length ?? 1 })}
            inputMode="numeric"
            value={part}
            onChange={(e) => setPart(e.target.value.replace(/\D/g, ''))}
          />
        </div>
        <CohortPicker cohorts={cohorts} value={cohortIds} onChange={setCohortIds} error={tried && cohortIds.length === 0 ? t('authoring.cohortsError') : undefined} />
        <Checkbox label={t('authoring.withQuestion')} description={t('authoring.withQuestionHelp')} checked={withQuestion} onChange={(e) => setWithQuestion(e.target.checked)} />
        {withQuestion && (
          <div className={cn('flex flex-col gap-4 rounded-lg border border-outline-variant p-3 sm:p-4')}>
            <TextField label={t('authoring.q.prompt')} helperText={t('authoring.q.promptHelp')} value={question.prompt} onChange={(e) => setQuestion({ ...question, prompt: e.target.value })} />
            {question.options.map((o, i) => (
              <TextField key={o.id} label={t('authoring.q.option', { n: i + 1 })} helperText="" value={o.text} onChange={(e) => setQuestion({ ...question, options: question.options.map((x) => (x.id === o.id ? { ...x, text: e.target.value } : x)) })} />
            ))}
            <RadioGroup
              name="card-correct"
              legend={t('authoring.q.whichCorrect')}
              value={question.correct}
              onChange={(e) => setQuestion({ ...question, correct: e.target.value })}
              options={question.options.map((o, i) => ({ value: o.id, label: o.text.trim() || t('authoring.q.option', { n: i + 1 }) }))}
              optionsClassName="grid grid-cols-1 gap-2 medium:grid-cols-2"
            />
            <div className="grid grid-cols-1 gap-4 medium:grid-cols-2">
              <TextArea label={t('authoring.q.correctFeedback')} helperText={t('authoring.q.correctFeedbackHelp')} rows={2} value={question.feedback.correct} onChange={(e) => setQuestion({ ...question, feedback: { ...question.feedback, correct: e.target.value } })} />
              <TextArea label={t('authoring.q.incorrectFeedback')} helperText={t('authoring.q.incorrectFeedbackHelp')} rows={2} value={question.feedback.incorrect} onChange={(e) => setQuestion({ ...question, feedback: { ...question.feedback, incorrect: e.target.value } })} />
            </div>
          </div>
        )}
      </section>
      <div className="flex flex-col gap-3">
        <div aria-live="polite">
          {tried && errors.length > 0 && (
            <InlineAlert tone="info" title={t('authoring.missingTitle')}>
              {errors.map((e) => t(`authoring.cardMissing.${e}`)).join(' ')}
            </InlineAlert>
          )}
        </div>
        <div className="flex flex-col gap-2 medium:flex-row medium:justify-end">
          <Button variant="outlined" leadingIcon="save" className="w-full medium:w-auto" onClick={() => persist('draft')}>
            {t('authoring.saveDraft')}
          </Button>
          <Button leadingIcon="public" className="w-full medium:w-auto" onClick={() => persist('published')}>
            {existing?.status === 'published' ? t('authoring.update') : t('authoring.publish')}
          </Button>
        </div>
      </div>
    </div>
  );
}
