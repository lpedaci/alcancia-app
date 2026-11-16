import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';
import type { EscapeObject } from './engine';

/**
 * The objects of the escape room drawn as what they are (D-305): a payslip, a sticky note, a list, a
 * card statement, a flyer, an envelope, a price tag and a phone. Immersion is the point of the game,
 * so they look real, but they are built with the design system's tokens and are always fictitious.
 */
export function EscapeObjectView({ object }: { object: EscapeObject }) {
  switch (object.kind) {
    case 'receipt':
      return <Receipt object={object} />;
    case 'postit':
      return <PostIt object={object} />;
    case 'list':
      return <ExpenseList object={object} />;
    case 'statement':
      return <Statement object={object} />;
    case 'flyer':
      return <Flyer object={object} />;
    case 'envelope':
      return <Envelope object={object} />;
    case 'tag':
      return <PriceTag object={object} />;
    case 'phone':
      return <Phone object={object} />;
  }
}

const paper = 'rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface';

function Receipt({ object }: { object: EscapeObject }) {
  const { t } = useTranslation();
  return (
    // Narrow cards (D-310): the unit goes under the concept, so the amounts keep their width
    <figure className={cn(paper, '@container flex flex-col gap-3 p-4 text-body-small')}>
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-outline-variant pb-3">
        <span className="flex flex-col">
          <span className="text-title-small">{object.company}</span>
          <span className="text-on-surface-variant">{object.companyId}</span>
        </span>
        <span className="flex flex-col items-end text-right">
          <span className="text-label-large">{t('escape.objects.payslip')}</span>
          <span className="rounded-full bg-surface-container px-2 text-label-small text-on-surface-variant">{t('escape.objects.example')}</span>
        </span>
      </header>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
        {object.meta?.map((m) => (
          <div key={m.label} className="flex flex-col">
            <dt className="text-label-small text-on-surface-variant uppercase">{m.label}</dt>
            <dd>{m.value}</dd>
          </div>
        ))}
      </dl>
      <table className="w-full border-collapse text-left tabular-nums">
        <thead>
          <tr className="border-y border-outline-variant text-label-small text-on-surface-variant uppercase">
            <th scope="col" className="py-1 font-medium">{t('escape.objects.concept')}</th>
            <th scope="col" className="hidden py-1 font-medium @md:table-cell">{t('escape.objects.unit')}</th>
            <th scope="col" className="py-1 pl-2 text-right font-medium">{t('escape.objects.earnings')}</th>
            <th scope="col" className="py-1 pl-2 text-right font-medium">{t('escape.objects.deductions')}</th>
          </tr>
        </thead>
        <tbody>
          {object.earnings?.map((e) => (
            <tr key={e.label}>
              <td className="py-1 pr-2">
                {e.label}
                <span className="block text-on-surface-variant @md:hidden">{e.unit}</span>
              </td>
              <td className="hidden py-1 @md:table-cell">{e.unit}</td>
              <td className="py-1 text-right">{e.value}</td>
              <td className="py-1" />
            </tr>
          ))}
          {object.deductions?.map((e) => (
            <tr key={e.label}>
              <td className="py-1 pr-2">
                {e.label}
                <span className="block text-on-surface-variant @md:hidden">{e.unit}</span>
              </td>
              <td className="hidden py-1 @md:table-cell">{e.unit}</td>
              <td className="py-1" />
              <td className="py-1 text-right text-on-surface-variant">{t('escape.objects.toCalculate')}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-outline-variant">
            <th scope="row" className="py-1 text-left font-medium">
              {t('escape.objects.gross')}
            </th>
            <td className="hidden @md:table-cell" />
            <td className="py-1 text-right font-medium">{object.gross}</td>
            <td />
          </tr>
          {/* Advanced version: paid but outside the base of the deductions (D-310) */}
          {object.nonRemunerative?.map((e) => (
            <tr key={e.label} className="border-t border-dashed border-outline-variant">
              <td className="py-1 pr-2">
                {e.label}
                <span className="block text-on-surface-variant @md:hidden">{e.unit}</span>
              </td>
              <td className="hidden py-1 @md:table-cell">{e.unit}</td>
              <td className="py-1 text-right">{e.value}</td>
              <td className="py-1 pl-2 text-right text-on-surface-variant">{t('escape.objects.noDeductions')}</td>
            </tr>
          ))}
        </tfoot>
      </table>
      {/* The net, under a coffee stain: the lock asks for it */}
      <div className="relative flex items-center justify-between gap-3 rounded-sm bg-surface-container px-3 py-2">
        <span className="text-label-large">{object.stained}</span>
        <span className="relative inline-flex h-7 w-28 items-center justify-center">
          <span aria-hidden className="absolute inset-0 rounded-[55%_45%_60%_40%/50%_60%_40%_50%] bg-warning/35" />
          <span aria-hidden className="absolute top-1 right-3 size-3 rounded-full bg-warning/35" />
          <span className="relative text-label-small text-on-warning-container">{t('escape.objects.stain')}</span>
        </span>
      </div>
      {object.note && <figcaption className="text-on-surface-variant">{object.note}</figcaption>}
    </figure>
  );
}

function PostIt({ object }: { object: EscapeObject }) {
  return (
    // A square note stuck with tape, slightly tilted, like on a monitor (decorative, flat)
    <figure className="relative mx-auto mt-3 w-full max-w-72 -rotate-1 rounded-sm bg-warning-container px-5 pt-6 pb-5 text-on-warning-container motion-reduce:rotate-0">
      <span aria-hidden className="absolute -top-2 left-1/2 h-4 w-16 -translate-x-1/2 rotate-2 rounded-xs bg-surface-container-high/80" />
      <ul className="flex flex-col gap-2 text-body-large">
        {object.lines?.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      <figcaption className="pt-3 text-right text-label-large">{object.title}</figcaption>
    </figure>
  );
}

function ExpenseList({ object }: { object: EscapeObject }) {
  return (
    <figure className={cn(paper, 'flex flex-col gap-1 p-4')}>
      <figcaption className="border-b-2 border-primary pb-2 text-title-small">{object.title}</figcaption>
      <dl className="flex flex-col">
        {object.rows?.map((r) => (
          <div key={r.label} className="flex items-baseline gap-2 border-b border-dashed border-outline-variant py-1.5">
            <dt className="text-body-medium">{r.label}</dt>
            <span aria-hidden className="flex-1" />
            <dd className="text-body-medium tabular-nums">{r.value}</dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}

function Statement({ object }: { object: EscapeObject }) {
  const [total, ...rest] = object.rows ?? [];
  return (
    <figure className={cn(paper, 'flex flex-col gap-3 p-4')}>
      <figcaption className="flex items-center gap-2 text-title-small">
        <Icon name="credit_card" size={20} className="text-primary" />
        {object.title}
      </figcaption>
      {total && (
        <div className="flex flex-col rounded-sm bg-surface-container px-3 py-2">
          <span className="text-label-medium text-on-surface-variant">{total.label}</span>
          <span className="text-headline-small tabular-nums">{total.value}</span>
        </div>
      )}
      <dl className="grid grid-cols-2 gap-2">
        {rest.map((r) => (
          <div key={r.label} className="flex flex-col">
            <dt className="text-label-medium text-on-surface-variant">{r.label}</dt>
            <dd className="text-title-small tabular-nums">{r.value}</dd>
          </div>
        ))}
      </dl>
      {object.note && <p className="border-t border-outline-variant pt-2 text-body-small text-on-surface-variant">{object.note}</p>}
    </figure>
  );
}

function Flyer({ object }: { object: EscapeObject }) {
  const rows = object.rows ?? [];
  const cft = rows.find((r) => r.strong);
  const small = rows.filter((r) => r !== cft);
  return (
    <figure className="flex flex-col overflow-hidden rounded-md border border-outline-variant bg-surface-container-lowest">
      <div className="flex flex-col gap-1 bg-primary px-4 py-4 text-on-primary">
        <span className="text-label-medium">{object.name}</span>
        <span className="text-headline-small">{object.title.split(' · ')[1] ?? object.title}</span>
      </div>
      <dl className="flex flex-col gap-1 px-4 py-3 text-body-small">
        {small.map((r) => (
          <div key={r.label} className="flex justify-between gap-3">
            <dt className="text-on-surface-variant">{r.label}</dt>
            <dd className="tabular-nums">{r.value}</dd>
          </div>
        ))}
      </dl>
      {/* The CFT is printed highlighted, as the law asks (B-04) */}
      {cft && (
        <div className="mx-4 mb-4 flex items-baseline justify-between rounded-sm border-2 border-on-surface px-3 py-2">
          <span className="text-label-large">{cft.label}</span>
          <span className="text-title-large tabular-nums">{cft.value}</span>
        </div>
      )}
    </figure>
  );
}

function Envelope({ object }: { object: EscapeObject }) {
  const amount = object.rows?.[0];
  return (
    <figure className="relative mx-auto flex w-full max-w-80 flex-col items-center gap-2 overflow-hidden rounded-md border border-outline-variant bg-surface-container px-4 pt-14 pb-5">
      {/* The flap, drawn with two borders */}
      <span aria-hidden className="absolute top-0 left-0 h-0 w-0 border-t-[3rem] border-r-[10rem] border-t-surface-container-high border-r-transparent" />
      <span aria-hidden className="absolute top-0 right-0 h-0 w-0 border-t-[3rem] border-l-[10rem] border-t-surface-container-high border-l-transparent" />
      <figcaption className="text-title-medium">{object.title}</figcaption>
      {amount && (
        <span className="flex flex-col items-center">
          <span className="text-label-medium text-on-surface-variant">{amount.label}</span>
          <span className="text-headline-small tabular-nums">{amount.value}</span>
        </span>
      )}
      {object.note && <p className="text-center text-body-small text-on-surface-variant">{object.note}</p>}
    </figure>
  );
}

function PriceTag({ object }: { object: EscapeObject }) {
  const [before, now] = object.rows ?? [];
  return (
    <figure className="relative mx-auto flex w-full max-w-72 flex-col gap-2 rounded-md rounded-l-[2rem] border border-outline-variant bg-surface-container-lowest py-4 pr-4 pl-12">
      <span aria-hidden className="absolute top-1/2 left-4 size-4 -translate-y-1/2 rounded-full border border-outline-variant bg-surface" />
      <figcaption className="text-title-small">{object.title}</figcaption>
      {before && (
        <p className="text-body-medium text-on-surface-variant">
          {before.label}: <s className="tabular-nums">{before.value}</s>
        </p>
      )}
      {now && (
        <p className="w-fit rounded-sm bg-warning-container px-2 py-1 text-title-small text-on-warning-container">
          {now.label}: {now.value}
        </p>
      )}
    </figure>
  );
}

function Phone({ object }: { object: EscapeObject }) {
  return (
    <figure className="mx-auto flex w-full max-w-80 flex-col gap-2 rounded-2xl border-4 border-on-surface bg-surface p-3">
      <figcaption className="pb-1 text-center text-label-medium text-on-surface-variant">{object.title}</figcaption>
      <ul className="flex flex-col gap-2">
        {object.messages?.map((m) => (
          <li key={m.from} className="flex flex-col gap-1 rounded-lg rounded-tl-sm bg-surface-container-lowest px-3 py-2 text-on-surface">
            <span className="flex flex-wrap items-center gap-x-2 text-label-small text-on-surface-variant">
              <span className="rounded-full bg-surface-container px-1.5">{m.channel}</span>
              {m.from}
            </span>
            <span className="text-body-small">{m.text}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
