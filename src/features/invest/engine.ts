import investJson from '@/data/invest.json';
import { addMovement, clone, scenarioOf, WalletError } from '@/features/wallet/engine/engine';
import type { BrokerageAccount, Holding, InvestorProfileId, Trade, WalletState } from '@/features/wallet/engine/types';
import { cedearTheoreticalPrice, D, type Decimal, ONE, roundCents, toMoneyString, ZERO } from '@/lib/finance';

/**
 * Practice brokerage account (SIM-14, CLAUDE.md 5.4, D-185) at a fictitious broker, connected to the
 * practice wallet. Pure functions over the wallet state, like the wallet engine: the same state and
 * actions always give the same result. Prices are a synthetic example series (never real data):
 * the CEDEAR follows a monthly factor of its dollar price from the day the account was opened, and
 * the implied exchange rate grows with the scenario's inflation, so both sources of variation of a
 * CEDEAR show (B-36, F-20).
 */
export const INVEST = investJson;
export type InstrumentDef = (typeof investJson.instruments)[number];
export const INSTRUMENTS = investJson.instruments as InstrumentDef[];
export const instrumentById = (id: string) => INSTRUMENTS.find((i) => i.id === id);
export const BROKER_NAME = investJson.broker.name;

const DAYS = 30;

/** Factor of a monthly series on a day since opening: linear between month ends, flat after the last. */
function seriesFactor(series: string[], daysSinceOpen: number): Decimal {
  const t = Math.max(0, daysSinceOpen) / DAYS;
  const k = Math.floor(t);
  if (k >= series.length - 1) return D(series[series.length - 1]!);
  const from = D(series[k]!);
  const to = D(series[k + 1]!);
  return from.plus(to.minus(from).times(t - k));
}

export interface Quote {
  price: Decimal;
  /** Only for the CEDEAR: the two sources of its peso price. */
  usdPrice?: Decimal;
  ratio?: Decimal;
  impliedFx?: Decimal;
}

/** Price of one unit on a simulated day (the wallet's current day by default). */
export function quote(state: Pick<WalletState, 'scenarioId' | 'day' | 'brokerage'>, instrumentId: string, day = state.day): Quote {
  const def = instrumentById(instrumentId);
  if (!def) throw new WalletError('unknown_instrument');
  const since = day - (state.brokerage?.openedDay ?? day);
  const scenario = scenarioOf(state);
  if (def.kind === 'cedear') {
    const usdPrice = D(def.usdPrice!).times(seriesFactor(investJson.series.cedearMonthly, since));
    const impliedFx = D(def.impliedFx!).times(ONE.plus(scenario.monthlyInflation).pow(D(Math.max(0, day)).div(DAYS)));
    const ratio = D(def.ratio!);
    return { price: roundCents(cedearTheoreticalPrice({ usdPrice, ratio, impliedFx })), usdPrice: roundCents(usdPrice), ratio, impliedFx: roundCents(impliedFx) };
  }
  if (def.kind === 'fund') {
    // The fund's unit grows every day with the example TNA of the money market fund (B-26).
    return { price: roundCents(D(def.unitPrice!).times(ONE.plus(D(scenario.exampleRates.moneyMarket).div(365)).pow(Math.max(0, since)))) };
  }
  // The bond accrues the example fixed-term TNA and its price moves a little with the market.
  const accrued = D(def.unitPrice!).times(ONE.plus(D(scenario.exampleRates.fixedTerm).times(Math.max(0, since)).div(365)));
  return { price: roundCents(accrued.times(seriesFactor(investJson.series.bondMonthly, since))) };
}

/** Example costs of an order (spec 5.4): commission and market rights, both fictitious. */
export function orderCosts(gross: Decimal) {
  const commission = roundCents(gross.times(investJson.costs.commission));
  const marketFee = roundCents(gross.times(investJson.costs.marketFee));
  return { commission, marketFee, total: commission.plus(marketFee) };
}

const accountOf = (state: WalletState): BrokerageAccount => {
  if (!state.brokerage) throw new WalletError('no_brokerage');
  return state.brokerage;
};

/** Opens the practice account with the profile of the educational test (D-67): no real data is asked. */
export function openBrokerage(state: WalletState, profile: InvestorProfileId): WalletState {
  if (state.brokerage) return state;
  const next = clone(state);
  next.brokerage = { openedDay: next.day, profile, cash: '0.00', holdings: [], trades: [], seq: 0 };
  return next;
}

/** Sends money from the wallet balance to the brokerage account (a practice transfer, spec 5.4). */
export function fundBrokerage(state: WalletState, amount: string): WalletState {
  const value = roundCents(amount);
  accountOf(state);
  if (value.lte(0)) throw new WalletError('amount_not_positive');
  if (D(state.balance).lt(value)) throw new WalletError('insufficient_balance');
  const next = clone(state);
  addMovement(next, { type: 'brokerage', amount: value.neg(), counterparty: `${BROKER_NAME} · fondeo de tu cuenta comitente`, suggestedCategory: 'savings' });
  next.brokerage!.cash = toMoneyString(D(next.brokerage!.cash).plus(value));
  return next;
}

/** Brings pesos back from the brokerage account to the wallet. */
export function withdrawBrokerage(state: WalletState, amount: string): WalletState {
  const value = roundCents(amount);
  const account = accountOf(state);
  if (value.lte(0)) throw new WalletError('amount_not_positive');
  if (D(account.cash).lt(value)) throw new WalletError('insufficient_broker_cash');
  const next = clone(state);
  next.brokerage!.cash = toMoneyString(D(account.cash).minus(value));
  addMovement(next, { type: 'brokerage', amount: value, counterparty: `${BROKER_NAME} · retiro de tu cuenta comitente` });
  return next;
}

/** What a purchase would cost now: price, gross amount, costs and total. */
export function buyPreview(state: WalletState, instrumentId: string, quantity: number) {
  const q = quote(state, instrumentId);
  const gross = q.price.times(quantity);
  const costs = orderCosts(gross);
  return { quote: q, gross, ...costs, totalCost: gross.plus(costs.total) };
}

function addTrade(account: BrokerageAccount, trade: Omit<Trade, 'id'>) {
  account.seq += 1;
  account.trades.push({ ...trade, id: `t-${account.seq}` });
}

/**
 * Buys whole units with the brokerage cash. With 24 hours the units are credited the next day
 * (B-34); the price is the one of the order.
 */
export function buy(state: WalletState, instrumentId: string, quantity: number, settlement: Trade['settlement'] = 'ci'): WalletState {
  const account = accountOf(state);
  if (!Number.isInteger(quantity) || quantity <= 0) throw new WalletError('quantity_not_positive');
  const preview = buyPreview(state, instrumentId, quantity);
  if (D(account.cash).lt(preview.totalCost)) throw new WalletError('insufficient_broker_cash');
  const next = clone(state);
  const acc = next.brokerage!;
  acc.cash = toMoneyString(D(acc.cash).minus(preview.totalCost));
  const settlesDay = next.day + (settlement === '24h' ? 1 : 0);
  acc.holdings.push({ instrumentId, quantity, cost: toMoneyString(preview.totalCost), settlesDay });
  addTrade(acc, {
    day: next.day,
    side: 'buy',
    instrumentId,
    quantity,
    price: toMoneyString(preview.quote.price),
    commission: toMoneyString(preview.commission),
    marketFee: toMoneyString(preview.marketFee),
    total: toMoneyString(preview.totalCost),
    settlement,
  });
  return next;
}

/** Positions of the account grouped by instrument: units, cost, value today and result. */
export function positions(state: WalletState) {
  const account = state.brokerage;
  if (!account) return [];
  const byId = new Map<string, Holding[]>();
  for (const h of account.holdings) byId.set(h.instrumentId, [...(byId.get(h.instrumentId) ?? []), h]);
  return [...byId.entries()].map(([instrumentId, lots]) => {
    const price = quote(state, instrumentId).price;
    const quantity = lots.reduce((n, h) => n + h.quantity, 0);
    const settled = lots.filter((h) => h.settlesDay <= state.day).reduce((n, h) => n + h.quantity, 0);
    const cost = lots.reduce((sum, h) => sum.plus(h.cost), ZERO);
    const value = price.times(quantity);
    const result = value.minus(cost);
    return { instrumentId, quantity, settled, pending: quantity - settled, price, cost, value, result, resultRate: cost.gt(0) ? result.div(cost) : ZERO };
  });
}

/** Total value of the account: cash plus positions at today's price. */
export function portfolioValue(state: WalletState): { cash: Decimal; invested: Decimal; cost: Decimal; result: Decimal; total: Decimal } {
  const cash = D(state.brokerage?.cash ?? '0');
  const list = positions(state);
  const invested = list.reduce((sum, p) => sum.plus(p.value), ZERO);
  const cost = list.reduce((sum, p) => sum.plus(p.cost), ZERO);
  return { cash, invested, cost, result: invested.minus(cost), total: cash.plus(invested) };
}

/** Sells settled units at today's price, net of costs; the cost of the sold units leaves proportionally. */
export function sell(state: WalletState, instrumentId: string, quantity: number): WalletState {
  accountOf(state);
  if (!Number.isInteger(quantity) || quantity <= 0) throw new WalletError('quantity_not_positive');
  const position = positions(state).find((p) => p.instrumentId === instrumentId);
  if (!position || position.settled < quantity) throw new WalletError('not_enough_units');
  const price = quote(state, instrumentId).price;
  const gross = price.times(quantity);
  const costs = orderCosts(gross);
  const next = clone(state);
  const acc = next.brokerage!;
  // Settled lots first, oldest first.
  let left = quantity;
  for (const lot of acc.holdings.filter((h) => h.instrumentId === instrumentId && h.settlesDay <= next.day)) {
    if (left === 0) break;
    const take = Math.min(left, lot.quantity);
    const share = D(lot.cost).times(take).div(lot.quantity);
    lot.cost = toMoneyString(D(lot.cost).minus(share));
    lot.quantity -= take;
    left -= take;
  }
  acc.holdings = acc.holdings.filter((h) => h.quantity > 0);
  const proceeds = gross.minus(costs.total);
  acc.cash = toMoneyString(D(acc.cash).plus(proceeds));
  addTrade(acc, {
    day: next.day,
    side: 'sell',
    instrumentId,
    quantity,
    price: toMoneyString(price),
    commission: toMoneyString(costs.commission),
    marketFee: toMoneyString(costs.marketFee),
    total: toMoneyString(proceeds),
    settlement: 'ci',
  });
  return next;
}
