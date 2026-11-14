import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { MoneyInput } from '@/components/money/MoneyInput';
import { MoneyText } from '@/components/money/MoneyText';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { MetaChips } from '@/components/ui/MetaChips';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Select } from '@/components/ui/Select';
import { StatusPill } from '@/components/ui/StatusPill';
import { TextField } from '@/components/ui/TextField';
import { toast } from '@/components/ui/toast-store';
import scenarios from '@/data/scenarios.json';
import { guideOfModule } from '@/features/learning/questions';
import { UnlockCard } from '@/features/levels/UnlockCard';
import { LEVELS, MISSIONS, useLevels } from '@/features/levels/use-levels';
import { WalletShell } from '@/features/wallet/WalletShell';
import {
  createPocket,
  DAYS_IN_MONTH,
  essentialMonthlyExpenses,
  moveToPocket,
  monthsToGoal,
  setPocketGoal,
  walletMetrics,
  WalletError,
  withdrawFromPocket,
} from '@/features/wallet/engine/engine';
import type { Pocket } from '@/features/wallet/engine/types';
import { formatDate, walletDate } from '@/lib/dates';
import { D, savingsGoal } from '@/lib/finance';
import { formatNumber, formatPercent, parseDecimalInput } from '@/lib/money';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';
import { useWallet } from '@/store/wallet-store';
import { fuerteLine } from '@/features/companion/fuerte-lines';

/**
 * P5, Apartados y metas (level 4, CLAUDE.md 5.3, F5, D-175): the emergency fund with the months of
 * essential expenses it covers (the condition that opens Invertir), and goal cards (2.2.1 pattern 13)
 * with the goal adjusted by the scenario's inflation (SIM-8), what is set aside, a progress bar and
 * the estimated date at the person's own pace. "Ahorro" of level 1 can get a goal (D-53).
 */
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';
const TERMS = ['3', '6', '12', '24'] as const;

export function PocketsPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const { statuses, isOpen } = useLevels(user?.personId ?? '');
  const status = statuses.find((s) => s.level.id === 'level-4');
  if (status && !isOpen('level-4')) {
    return (
      <WalletShell section={t('wallet.sub.pockets')} fuerte={{ state: 'thinking', message: fuerteLine('pockets.fuerte.locked') }}>
        <div className="flex flex-col gap-6">
          <h1 className="text-headline-medium text-on-surface">{t('wallet.placeholder.lockedTitle', { section: t('wallet.sub.pockets') })}</h1>
          <UnlockCard status={status} />
        </div>
      </WalletShell>
    );
  }
  return <Pockets />;
}

type Move = { pocket: Pocket; kind: 'in' | 'out' } | { pocket: Pocket; kind: 'goal' };

function Pockets() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const [wallet] = useWallet(personId);
  const { wallet: levelWallet } = useLevels(personId);
  const allMissions = useDataStore((s) => s.missionCompletions);
  const allGuides = useDataStore((s) => s.guideProgress);
  const [move, setMove] = useState<Move | undefined>();

  const essentials = essentialMonthlyExpenses(wallet);
  const metrics = walletMetrics(wallet);
  const fund = wallet.pockets.find((p) => p.isEmergencyFund);
  const others = wallet.pockets.filter((p) => !p.isEmergencyFund);
  const months = D(metrics.emergency_months);
  const level = LEVELS.find((l) => l.id === 'level-4')!;
  const guide = guideOfModule(level.guideModuleIds[0]!);
  const mission = MISSIONS.find((m) => m.levelId === 'level-4');
  const missionDone = mission ? levelWallet.completedMissionIds.includes(mission.id) || allMissions.some((m) => m.personId === personId && m.missionId === mission.id) : false;
  const guideDone = guide ? allGuides.some((g) => g.personId === personId && g.guideIdsDone.includes(guide.id)) : false;
  const monthsText = formatNumber(months.toFixed(1), 1).replace(/,0$/, '');

  return (
    <WalletShell
      section={t('wallet.sub.pockets')}
      fuerte={{ state: 'neutral', message: fund ? fuerteLine('pockets.fuerte.fund', { months: monthsText }) : fuerteLine('pockets.fuerte.noFund'), why: t('wallet.fuerte.why.pockets') }}
    >
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-3">
          <h1 className="text-headline-medium text-on-surface">{t('wallet.sub.pockets')}</h1>
          <p className="text-body-large text-on-surface-variant">{t('pockets.intro')}</p>
          <MetaChips
            label={t('pockets.context')}
            items={[
              { icon: 'savings', label: t('pockets.count', { count: wallet.pockets.length }) },
              { icon: 'calendar_month', label: formatDate(walletDate(wallet.day)), dateTime: walletDate(wallet.day) },
            ]}
          />
        </header>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) large:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)] large:items-start">
          {/* Emergency fund: the months it covers, the condition that opens Invertir (5.0) */}
          <section aria-labelledby="fund-title" className={cn(card, '@container border-primary')}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <IconTile icon="shield" tone="tertiary" />
                <h2 id="fund-title" className="text-title-large text-on-surface">
                  {t('pockets.fund.title')}
                </h2>
              </div>
              {fund && (
                <StatusPill tone={months.gte(3) ? 'success' : 'info'} icon={months.gte(3) ? 'check_circle' : 'pending'} label={t('pockets.fund.months', { months: monthsText })} />
              )}
            </div>
            {fund ? (
              <>
                <p className="text-display-small text-on-surface">
                  <MoneyText value={fund.amount} compactBelow="xs" />
                </p>
                <ProgressBar
                  value={Math.min(100, months.div(3).times(100).toNumber())}
                  label={t('pockets.fund.progressLabel')}
                  valueText={t('pockets.fund.progress', { months: monthsText })}
                  tone="tertiary"
                  size="lg"
                />
                <dl className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-3">
                  {[
                    [t('pockets.fund.essentials'), essentials.toFixed(2)],
                    [t('pockets.fund.three'), essentials.times(3).toFixed(2)],
                    [t('pockets.fund.six'), essentials.times(6).toFixed(2)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-1 rounded-lg bg-surface-container p-3">
                      <dt className="text-label-medium text-on-surface-variant">{label}</dt>
                      <dd className="text-title-medium text-on-surface">
                        <MoneyText value={value!} />
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="text-body-medium text-on-surface-variant">{months.gte(3) ? t('pockets.fund.ready') : t('pockets.fund.invest')}</p>
                <div className="flex flex-wrap gap-3">
                  <Button leadingIcon="add" onClick={() => setMove({ pocket: fund, kind: 'in' })}>
                    {t('pockets.add')}
                  </Button>
                  <Button variant="outlined" leadingIcon="remove" onClick={() => setMove({ pocket: fund, kind: 'out' })}>
                    {t('pockets.withdraw')}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-body-large text-on-surface">{t('pockets.fund.none', { amount: '' })}</p>
                <p className="text-body-medium text-on-surface-variant">
                  {t('pockets.fund.target')} <MoneyText value={essentials.times(3).toFixed(2)} />
                </p>
                {mission && (
                  <Button asChild className="self-start" trailingIcon="arrow_forward">
                    <Link to={`/app/missions/${mission.id}`}>{t('pockets.fund.create')}</Link>
                  </Button>
                )}
              </>
            )}
          </section>

          <div className="flex min-w-0 flex-col gap-(--space-bento-gap)">
            <NewGoal />
            <section aria-labelledby="learn-title" className={card}>
              <h2 id="learn-title" className="text-title-large text-on-surface">
                {t('pay.learn.title')}
              </h2>
              <div className="flex flex-col divide-y divide-outline-variant">
                {guide && (
                  <Link to={`/app/learn/guides/${guide.id}`} className="flex items-center gap-3 py-3 hover:bg-surface-container">
                    <Icon name={guideDone ? 'check_circle' : 'menu_book'} filled={guideDone} className={guideDone ? 'text-success' : 'text-primary'} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-body-medium text-on-surface">{guide.title}</span>
                      <span className="block text-body-small text-on-surface-variant">{t('pay.learn.guideMeta', { minutes: guide.minutes })}</span>
                    </span>
                    <Icon name="chevron_right" size={20} className="text-on-surface-variant" />
                  </Link>
                )}
                {mission && (
                  <Link to={`/app/missions/${mission.id}`} className="flex items-center gap-3 py-3 hover:bg-surface-container">
                    <Icon name={missionDone ? 'check_circle' : 'flag'} filled={missionDone} className={missionDone ? 'text-success' : 'text-primary'} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-body-medium text-on-surface">{mission.title}</span>
                      <span className="block text-body-small text-on-surface-variant">
                        {t('pay.learn.missionMeta', { minutes: mission.minutes })}
                        {missionDone && ` · ${t('learn.map.done')}`}
                      </span>
                    </span>
                    <Icon name="chevron_right" size={20} className="text-on-surface-variant" />
                  </Link>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Goal cards (2.2.1 pattern 13) */}
        <section aria-labelledby="goals-title" className="flex flex-col gap-4">
          <h2 id="goals-title" className="text-title-large text-on-surface">
            {t('pockets.goals.title')}
          </h2>
          {others.length === 0 ? (
            <p className="text-body-medium text-on-surface-variant">{t('pockets.goals.empty')}</p>
          ) : (
            <ul className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) md:grid-cols-2 large:grid-cols-3">
              {others.map((p) => (
                <GoalCard key={p.id} pocket={p} onMove={setMove} />
              ))}
            </ul>
          )}
        </section>
      </div>

      {move && <MoveDialog move={move} onClose={() => setMove(undefined)} />}
    </WalletShell>
  );
}

function GoalCard({ pocket, onMove }: { pocket: Pocket; onMove: (m: Move) => void }) {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const [wallet] = useWallet(user?.personId ?? '');
  const left = monthsToGoal(wallet, pocket);
  const progress = pocket.goal ? Math.min(100, D(pocket.amount).div(pocket.goal).times(100).toNumber()) : 0;
  const reached = pocket.goal && D(pocket.amount).gte(pocket.goal);
  return (
    <li className={card}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <IconTile icon={pocket.goal ? 'flag' : 'savings'} tone="primary" />
          <h3 className="min-w-0 text-title-medium text-on-surface">{pocket.name}</h3>
        </div>
        {reached && <StatusPill tone="success" icon="check_circle" label={t('pockets.goals.reached')} />}
      </div>
      <p className="text-headline-small text-on-surface">
        <MoneyText value={pocket.amount} />
      </p>
      {pocket.goal ? (
        <>
          <ProgressBar value={progress} label={t('pockets.goals.progressLabel', { name: pocket.name })} valueText={formatPercent(progress / 100, { decimals: 0 })} />
          <dl className="flex flex-col gap-2 text-body-small">
            <div className="flex flex-wrap justify-between gap-x-3">
              <dt className="text-on-surface-variant">{t('pockets.goals.goal')}</dt>
              <dd className="text-on-surface">
                <MoneyText value={pocket.goal} />
              </dd>
            </div>
            {pocket.plan && (
              <div className="flex flex-wrap justify-between gap-x-3">
                <dt className="text-on-surface-variant">{t('pockets.goals.today')}</dt>
                <dd className="text-on-surface">
                  <MoneyText value={pocket.plan.currentPrice} />
                </dd>
              </div>
            )}
            <div className="flex flex-wrap justify-between gap-x-3">
              <dt className="text-on-surface-variant">{t('pockets.goals.eta')}</dt>
              <dd className="text-on-surface">
                {left === null ? t('pockets.goals.noPace') : left === 0 ? t('pockets.goals.reached') : formatDate(walletDate(wallet.day + left * DAYS_IN_MONTH))}
              </dd>
            </div>
          </dl>
        </>
      ) : (
        <p className="text-body-medium text-on-surface-variant">{t('pockets.goals.noGoal')}</p>
      )}
      <div className="mt-auto flex flex-wrap gap-2 border-t border-outline-variant pt-4">
        <Button size="xs" leadingIcon="add" onClick={() => onMove({ pocket, kind: 'in' })}>
          {t('pockets.add')}
        </Button>
        <Button size="xs" variant="outlined" leadingIcon="remove" onClick={() => onMove({ pocket, kind: 'out' })}>
          {t('pockets.withdraw')}
        </Button>
        {!pocket.goal && (
          <Button size="xs" variant="text" leadingIcon="flag" onClick={() => onMove({ pocket, kind: 'goal' })}>
            {t('pockets.goals.setGoal')}
          </Button>
        )}
      </div>
    </li>
  );
}

/** New goal with inflation (SIM-8): today's price and term give the goal at the end and the monthly saving. */
function NewGoal() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const [wallet, setWallet] = useWallet(user?.personId ?? '');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [term, setTerm] = useState<string>('12');
  const [tried, setTried] = useState(false);
  const inflation = scenarios.find((s) => s.id === wallet.scenarioId)?.monthlyInflation ?? '0.03';
  const parsed = parseDecimalInput(price);
  const plan = parsed && D(parsed).gt(0) ? savingsGoal({ currentPrice: parsed, months: Number(term), monthlyInflation: inflation, monthlyReturn: '0' }) : undefined;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTried(true);
    if (!name.trim() || !plan || !parsed) return;
    const id = `pocket-goal-${wallet.seq + 1}`;
    setWallet((w) =>
      setPocketGoal(createPocket(w, { id, name: name.trim() }), id, plan.futurePrice.toFixed(2), { currentPrice: D(parsed).toFixed(2), months: Number(term), day: w.day }),
    );
    toast.success(t('pockets.new.saved'));
    setName('');
    setPrice('');
    setTried(false);
  };

  return (
    <form noValidate onSubmit={submit} aria-labelledby="new-goal-title" className={card}>
      <h2 id="new-goal-title" className="text-title-large text-on-surface">
        {t('pockets.new.title')}
      </h2>
      <TextField label={t('pockets.new.name')} helperText={t('pockets.new.nameHelp')} value={name} onChange={(e) => setName(e.target.value)} error={tried && !name.trim() ? t('pockets.new.nameMissing') : undefined} maxLength={40} />
      <MoneyInput label={t('pockets.new.price')} helperText={t('pockets.new.priceHelp')} value={price} onChange={(e) => setPrice(e.target.value)} error={tried && !plan ? t('pockets.new.priceMissing') : undefined} />
      <Select label={t('pockets.new.term')} helperText={t('pockets.new.termHelp')} value={term} onChange={(e) => setTerm(e.target.value)} options={TERMS.map((m) => ({ value: m, label: t('pockets.new.months', { count: Number(m) }) }))} />
      {plan && (
        <div className="flex flex-col gap-1 rounded-lg bg-info-container p-3 text-on-info-container" aria-live="polite">
          <p className="text-body-medium">
            {t('pockets.new.futurePrice')} <MoneyText value={plan.futurePrice.toFixed(2)} className="font-semibold" />
          </p>
          <p className="text-body-medium">
            {t('pockets.new.monthly')} <MoneyText value={plan.monthlySaving.toFixed(2)} className="font-semibold" />
          </p>
          <p className="text-body-small">{t('pockets.new.assumption', { inflation: formatPercent(inflation, { decimals: 1 }) })}</p>
        </div>
      )}
      <Button type="submit" className="self-start" leadingIcon="flag">
        {t('pockets.new.create')}
      </Button>
    </form>
  );
}

function MoveDialog({ move, onClose }: { move: Move; onClose: () => void }) {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const [wallet, setWallet] = useWallet(user?.personId ?? '');
  const [amount, setAmount] = useState('');
  const [failure, setFailure] = useState<string | undefined>();
  const protectedPocket = move.pocket.isEmergencyFund || move.pocket.id === 'pocket-savings';
  const title = move.kind === 'in' ? t('pockets.move.inTitle', { name: move.pocket.name }) : move.kind === 'out' ? t('pockets.move.outTitle', { name: move.pocket.name }) : t('pockets.move.goalTitle', { name: move.pocket.name });

  const confirm = () => {
    const parsed = parseDecimalInput(amount);
    if (!parsed || D(parsed).lte(0)) {
      setFailure(t('pockets.move.missing'));
      return;
    }
    try {
      if (move.kind === 'in') setWallet(() => moveToPocket(wallet, move.pocket.id, parsed));
      else if (move.kind === 'out') setWallet(() => withdrawFromPocket(wallet, move.pocket.id, parsed));
      else setWallet(() => setPocketGoal(wallet, move.pocket.id, parsed));
      toast.success(t(`pockets.move.done.${move.kind}`));
      onClose();
    } catch (error) {
      setFailure(error instanceof WalletError ? t(`pockets.errors.${error.message}`) : t('pay.errors.unknown'));
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        title={title}
        description={move.kind === 'goal' ? t('pockets.move.goalBody') : t('pockets.move.available', { amount: '' })}
        actions={
          <>
            <DialogClose asChild>
              <Button variant="outlined" fullWidth className="sm:w-auto">
                {t('pay.cancel')}
              </Button>
            </DialogClose>
            <Button fullWidth className="sm:w-auto" onClick={confirm}>
              {move.kind === 'in' ? t('pockets.add') : move.kind === 'out' ? t('pockets.withdraw') : t('pockets.goals.setGoal')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {move.kind !== 'goal' && (
            <p className="text-body-medium text-on-surface-variant">
              {move.kind === 'in' ? t('pockets.move.balance') : t('pockets.move.inPocket')} <MoneyText value={move.kind === 'in' ? wallet.balance : move.pocket.amount} />
            </p>
          )}
          {move.kind === 'out' && protectedPocket && <InlineAlert tone="warning">{t('pockets.move.warning')}</InlineAlert>}
          {failure && <InlineAlert tone="info">{failure}</InlineAlert>}
          <MoneyInput label={t('pockets.move.amount')} helperText={t('pockets.move.amountHelp')} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
