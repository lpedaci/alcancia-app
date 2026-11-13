import { useTranslation } from 'react-i18next';
import { MoneyInput } from '@/components/money/MoneyInput';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { IconButton } from '@/components/ui/IconButton';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Select } from '@/components/ui/Select';
import type { Answer, LearningQuestion } from './questions';

/**
 * One question of any phase A type (5.1) with its accessible alternative: radios and checkboxes in
 * a fieldset, the reason of a true or false after the answer, a masked amount field, "Subir" and
 * "Bajar" to order, and a select per row to match or to classify (no dragging needed, 2.10).
 * No time limit. Feedback is shown by the parent (formative in guides, at the end in challenges).
 */
export function QuestionView({
  question,
  value,
  onChange,
  disabled = false,
  idPrefix,
}: {
  question: LearningQuestion;
  value: Answer | undefined;
  onChange: (answer: Answer) => void;
  disabled?: boolean;
  idPrefix: string;
}) {
  const { t } = useTranslation();
  const name = `${idPrefix}-${question.id}`;

  switch (question.type) {
    case 'single':
      return (
        <RadioGroup
          name={name}
          legend={question.prompt}
          disabled={disabled}
          options={question.options.map((o) => ({ value: o.id, label: o.text }))}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'multiple': {
      const chosen = new Set((value as string[]) ?? []);
      return (
        <fieldset className="flex flex-col gap-1" disabled={disabled}>
          <legend className="mb-1 text-title-small text-on-surface">{question.prompt}</legend>
          <p className="mb-1 text-body-small text-on-surface-variant">{t('learn.q.chooseAll')}</p>
          {question.options.map((o) => (
            <Checkbox
              key={o.id}
              name={name}
              label={o.text}
              checked={chosen.has(o.id)}
              onChange={(e) => {
                const next = new Set(chosen);
                if (e.target.checked) next.add(o.id);
                else next.delete(o.id);
                onChange(question.options.map((x) => x.id).filter((id) => next.has(id)));
              }}
            />
          ))}
        </fieldset>
      );
    }
    case 'true_false_why': {
      const answer = (value as Record<string, string>) ?? {};
      return (
        <div className="flex flex-col gap-4">
          <RadioGroup
            name={name}
            legend={question.prompt}
            disabled={disabled}
            options={question.options.map((o) => ({ value: o.id, label: o.text }))}
            value={answer.value ?? ''}
            onChange={(e) => onChange({ ...answer, value: e.target.value })}
          />
          {/* After answering, the person picks the reason (5.1) */}
          {answer.value && (
            <RadioGroup
              name={`${name}-why`}
              legend={question.why.prompt}
              disabled={disabled}
              options={question.why.options.map((o) => ({ value: o.id, label: o.text }))}
              value={answer.why ?? ''}
              onChange={(e) => onChange({ ...answer, why: e.target.value })}
            />
          )}
        </div>
      );
    }
    case 'numeric':
      return (
        <MoneyInput
          label={question.prompt}
          helperText={question.help}
          disabled={disabled}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'ordering': {
      const order = (value as string[]) ?? question.ordering.items.map((i) => i.id);
      const move = (index: number, delta: number) => {
        const next = [...order];
        const [item] = next.splice(index, 1);
        next.splice(index + delta, 0, item!);
        onChange(next);
      };
      return (
        <fieldset className="flex flex-col gap-2" disabled={disabled}>
          <legend className="mb-1 text-title-small text-on-surface">{question.prompt}</legend>
          <p className="mb-1 text-body-small text-on-surface-variant">{t('learn.q.orderHelp')}</p>
          <ol className="flex flex-col gap-2">
            {order.map((id, index) => {
              const item = question.ordering.items.find((i) => i.id === id)!;
              return (
                <li key={id} className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2">
                  <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-container text-label-large tabular-nums">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-body-medium text-on-surface">{item.text}</span>
                  <IconButton icon="keyboard_arrow_up" size="xs" label={t('learn.q.up', { item: item.text })} disabled={disabled || index === 0} onClick={() => move(index, -1)} />
                  <IconButton
                    icon="keyboard_arrow_down"
                    size="xs"
                    label={t('learn.q.down', { item: item.text })}
                    disabled={disabled || index === order.length - 1}
                    onClick={() => move(index, 1)}
                  />
                </li>
              );
            })}
          </ol>
        </fieldset>
      );
    }
    case 'matching': {
      const answer = (value as Record<string, string>) ?? {};
      return (
        <fieldset className="flex flex-col gap-3" disabled={disabled}>
          <legend className="mb-1 text-title-small text-on-surface">{question.prompt}</legend>
          {question.matching.left.map((l) => (
            <Select
              key={l.id}
              label={l.text}
              helperText={t('learn.q.matchHelp')}
              value={answer[l.id] ?? ''}
              onChange={(e) => onChange({ ...answer, [l.id]: e.target.value })}
              options={[{ value: '', label: t('learn.q.choose') }, ...question.matching.right.map((r) => ({ value: r.id, label: r.text }))]}
            />
          ))}
        </fieldset>
      );
    }
    case 'categorize': {
      const answer = (value as Record<string, string>) ?? {};
      return (
        <fieldset className="flex flex-col gap-3" disabled={disabled}>
          <legend className="mb-1 text-title-small text-on-surface">{question.prompt}</legend>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
            {question.categorize.items.map((i) => (
              <Select
                key={i.id}
                label={i.text}
                helperText={t('learn.q.categoryHelp')}
                value={answer[i.id] ?? ''}
                onChange={(e) => onChange({ ...answer, [i.id]: e.target.value })}
                options={[{ value: '', label: t('learn.q.choose') }, ...question.categorize.categories.map((c) => ({ value: c.id, label: c.label }))]}
              />
            ))}
          </div>
        </fieldset>
      );
    }
  }
}

/** "Comprobar" for formative practice: unlimited retries, no score (5.1). */
export function CheckButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  const { t } = useTranslation();
  return (
    <Button variant="tonal" className="self-start" leadingIcon="check" onClick={onClick} disabled={disabled}>
      {t('learn.q.check')}
    </Button>
  );
}
