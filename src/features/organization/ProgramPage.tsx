import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBlocker } from 'react-router';
import { DEMO_TODAY } from '@/app/config';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { IconTile } from '@/components/ui/IconTile';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { SegmentedButton } from '@/components/ui/SegmentedButton';
import { StatusPill } from '@/components/ui/StatusPill';
import { TextArea } from '@/components/ui/TextArea';
import { TextField } from '@/components/ui/TextField';
import { toast } from '@/components/ui/toast-store';
import MODULES from '@/data/modules.json';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/store/data-store';
import type { Program } from '@/types/domain';
import { AdminShell } from './AdminShell';

/**
 * O4, program settings (CLAUDE.md F1, D-197): name and description, voluntary or assigned with a
 * due date per cohort, enabled and required modules, privacy threshold (never below 5), passing
 * score and attempts of the level challenges, reminder channels (configuration only in phase A)
 * and free mode. The level order is not editable: it is the content (5.0). Leaving with unsaved
 * changes asks first (useBlocker).
 */
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';
const CHANNELS: Program['reminderChannels'] = ['email', 'teams', 'slack'];
const PHASE_A = MODULES.filter((m) => m.phase === 'A');

interface Form {
  name: string;
  description: string;
  mode: Program['mode'];
  moduleIds: string[];
  requiredModuleIds: string[];
  threshold: string;
  passing: string;
  attempts: string;
  channels: Program['reminderChannels'];
  freeMode: boolean;
  dueDates: Record<string, string>;
}

export function ProgramPage() {
  const { t } = useTranslation();
  const program = useDataStore((s) => s.program);
  const threshold = useDataStore((s) => s.organization.privacyThreshold);
  const cohorts = useDataStore((s) => s.cohorts);
  const updateProgram = useDataStore((s) => s.updateProgram);
  const setCohortDueDates = useDataStore((s) => s.setCohortDueDates);
  const initial = (): Form => ({
    name: program.name,
    description: program.description,
    mode: program.mode,
    moduleIds: program.moduleIds,
    requiredModuleIds: program.requiredModuleIds,
    threshold: String(threshold),
    passing: String(Math.round(program.passingScore * 100)),
    attempts: String(program.maxAttempts),
    channels: program.reminderChannels,
    freeMode: program.freeMode,
    dueDates: Object.fromEntries(cohorts.map((c) => [c.id, c.dueDate ?? ''])),
  });
  const [form, setForm] = useState<Form>(initial);
  const [saved, setSaved] = useState<Form>(form);
  const [tried, setTried] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));
  const toggle = (list: string[], id: string, on: boolean) => (on ? [...list, id] : list.filter((x) => x !== id));

  const num = (v: string) => (/^\d+$/.test(v.trim()) ? Number(v) : NaN);
  const errors = {
    name: form.name.trim().length < 3 ? t('org.program.errors.name') : undefined,
    threshold: !(num(form.threshold) >= 5) ? t('org.program.errors.threshold') : undefined,
    passing: !(num(form.passing) >= 50 && num(form.passing) <= 100) ? t('org.program.errors.passing') : undefined,
    attempts: !(num(form.attempts) >= 1 && num(form.attempts) <= 10) ? t('org.program.errors.attempts') : undefined,
    modules: form.moduleIds.length === 0 ? t('org.program.errors.modules') : undefined,
    due: form.mode === 'assigned' && cohorts.some((c) => !form.dueDates[c.id] || form.dueDates[c.id]! < DEMO_TODAY) ? t('org.program.errors.due') : undefined,
  };
  const show = (e?: string) => (tried ? e : undefined);

  const save = () => {
    setTried(true);
    if (Object.values(errors).some(Boolean)) {
      toast.error(t('org.program.errors.summary'));
      return;
    }
    updateProgram(
      {
        ...program,
        name: form.name.trim(),
        description: form.description.trim(),
        mode: form.mode,
        moduleIds: PHASE_A.map((m) => m.id).filter((id) => form.moduleIds.includes(id)),
        requiredModuleIds: form.requiredModuleIds.filter((id) => form.moduleIds.includes(id)),
        passingScore: num(form.passing) / 100,
        maxAttempts: num(form.attempts),
        reminderChannels: CHANNELS.filter((c) => form.channels.includes(c)),
        freeMode: form.freeMode,
      },
      num(form.threshold),
    );
    if (form.mode === 'assigned') setCohortDueDates(form.dueDates);
    setSaved(form);
    setTried(false);
    toast.success(t('org.program.saved'));
  };

  return (
    <AdminShell>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-headline-medium text-on-surface">{t('org.program.title')}</h1>
          <p className="max-w-[72ch] text-body-large text-on-surface-variant">{t('org.program.intro')}</p>
        </div>
        {dirty && <StatusPill tone="warning" icon="edit" label={t('org.program.unsaved')} />}
      </header>

      <section aria-labelledby="program-data" className={cn(card, '@container')}>
        <SectionTitle id="program-data" icon="school" title={t('org.program.data')} />
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 @3xl:grid-cols-2">
          <TextField label={t('org.program.name')} helperText={t('org.program.nameHelp')} value={form.name} onChange={(e) => set('name', e.target.value)} error={show(errors.name)} required />
          <TextArea
            label={t('org.program.description')}
            helperText={t('org.program.descriptionHelp')}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            optional
            rows={4}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-label-medium text-on-surface">{t('org.program.mode')}</span>
          <SegmentedButton
            label={t('org.program.mode')}
            value={form.mode}
            onValueChange={(v) => set('mode', v)}
            options={[
              { value: 'voluntary', label: t('org.program.modes.voluntary') },
              { value: 'assigned', label: t('org.program.modes.assigned') },
            ]}
          />
          <p className="text-body-small text-on-surface-variant">{t(`org.program.modeHelp.${form.mode}`)}</p>
        </div>
        {form.mode === 'assigned' && (
          <fieldset className="flex flex-col gap-3 rounded-lg bg-surface-container p-4">
            <legend className="sr-only">{t('org.program.dueDates')}</legend>
            <p className="text-title-medium text-on-surface" aria-hidden>
              {t('org.program.dueDates')}
            </p>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 @3xl:grid-cols-2">
              {cohorts.map((c) => (
                <TextField
                  key={c.id}
                  type="date"
                  label={c.name}
                  helperText={t('org.program.dueHelp')}
                  value={form.dueDates[c.id] ?? ''}
                  min={DEMO_TODAY}
                  onChange={(e) =>
                    set('dueDates', {
                      ...form.dueDates,
                      [c.id]: e.target.value,
                    })
                  }
                  error={tried && (!form.dueDates[c.id] || form.dueDates[c.id]! < DEMO_TODAY) ? t('tutor.assign.dueError') : undefined}
                />
              ))}
            </div>
          </fieldset>
        )}
      </section>

      <section aria-labelledby="program-modules" className={cn(card, '@container')}>
        <SectionTitle id="program-modules" icon="menu_book" title={t('org.program.modules')} />
        <p className="text-body-medium text-on-surface-variant">{t('org.program.modulesIntro')}</p>
        <InlineAlert tone="info" live="none">
          {t('org.program.orderFixed')}
        </InlineAlert>
        {show(errors.modules) && (
          <InlineAlert tone="error" live="status">
            {errors.modules}
          </InlineAlert>
        )}
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-1 @3xl:grid-cols-2">
          {PHASE_A.map((m) => {
            const enabled = form.moduleIds.includes(m.id);
            return (
              <li key={m.id} className="flex flex-col border-b border-outline-variant py-2 @3xl:flex-row @3xl:items-start @3xl:justify-between @3xl:gap-3">
                <Checkbox
                  label={t('org.program.moduleLabel', {
                    n: m.order,
                    title: m.title,
                  })}
                  description={t('org.program.moduleLevel', {
                    level: t(`wallet.sections.${m.levelId}`),
                  })}
                  checked={enabled}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      moduleIds: toggle(f.moduleIds, m.id, e.target.checked),
                      requiredModuleIds: e.target.checked ? f.requiredModuleIds : f.requiredModuleIds.filter((x) => x !== m.id),
                    }))
                  }
                />
                <Checkbox
                  label={t('org.program.required')}
                  checked={form.requiredModuleIds.includes(m.id)}
                  disabled={!enabled}
                  onChange={(e) => set('requiredModuleIds', toggle(form.requiredModuleIds, m.id, e.target.checked))}
                  aria-label={t('org.program.requiredFor', { title: m.title })}
                  className="ml-8 shrink-0 @3xl:ml-0"
                />
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) large:grid-cols-2 large:items-start">
        <section aria-labelledby="program-assessment" className={card}>
          <SectionTitle id="program-assessment" icon="quiz" title={t('org.program.assessment')} />
          <TextField
            label={t('org.program.passing')}
            helperText={t('org.program.passingHelp')}
            value={form.passing}
            onChange={(e) => set('passing', e.target.value)}
            error={show(errors.passing)}
            inputMode="numeric"
            trailing="%"
          />
          <TextField
            label={t('org.program.attempts')}
            helperText={t('org.program.attemptsHelp')}
            value={form.attempts}
            onChange={(e) => set('attempts', e.target.value)}
            error={show(errors.attempts)}
            inputMode="numeric"
          />
        </section>

        <section aria-labelledby="program-privacy" className={card}>
          <SectionTitle id="program-privacy" icon="visibility_off" title={t('org.program.privacy')} />
          <TextField
            label={t('org.program.threshold')}
            helperText={t('org.program.thresholdHelp')}
            value={form.threshold}
            onChange={(e) => set('threshold', e.target.value)}
            error={show(errors.threshold)}
            inputMode="numeric"
          />
          <Checkbox label={t('org.program.freeMode')} description={t('org.program.freeModeHelp')} checked={form.freeMode} onChange={(e) => set('freeMode', e.target.checked)} />
        </section>
      </div>

      <section aria-labelledby="program-reminders" className={card}>
        <SectionTitle id="program-reminders" icon="notifications" title={t('org.program.reminders')} />
        <p className="text-body-medium text-on-surface-variant">{t('org.program.remindersIntro')}</p>
        <fieldset className="flex flex-wrap gap-x-8">
          <legend className="sr-only">{t('org.program.reminders')}</legend>
          {CHANNELS.map((c) => (
            <Checkbox
              key={c}
              label={t(`org.program.channels.${c}`)}
              checked={form.channels.includes(c)}
              onChange={(e) => set('channels', toggle(form.channels, c, e.target.checked) as Program['reminderChannels'])}
            />
          ))}
        </fieldset>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button leadingIcon="check" onClick={save} disabled={!dirty}>
          {t('org.program.save')}
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setForm(saved);
            setTried(false);
          }}
          disabled={!dirty}
        >
          {t('org.program.discard')}
        </Button>
      </div>

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        onOpenChange={(open) => !open && blocker.reset?.()}
        title={t('org.program.leaveTitle')}
        description={t('org.program.leaveBody')}
        confirmLabel={t('org.program.leaveConfirm')}
        onConfirm={() => blocker.proceed?.()}
        destructive
      />
    </AdminShell>
  );
}

function SectionTitle({ id, icon, title }: { id: string; icon: Parameters<typeof IconTile>[0]['icon']; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <IconTile icon={icon} tone="primary" />
      <h2 id={id} className="text-title-large text-on-surface">
        {title}
      </h2>
    </div>
  );
}
