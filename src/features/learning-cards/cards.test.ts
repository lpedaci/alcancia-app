import { describe, expect, it } from 'vitest';
import { buy, fundBrokerage, openBrokerage } from '@/features/invest/engine';
import { guideById } from '@/features/learning/questions';
import { describeSources } from '@/app/content-sources';
import {
  acceptLoan,
  advanceDays,
  buyInInstallments,
  chargeSurpriseSubscription,
  createPocket,
  createWallet,
  makeDeposit,
  markEmergencyFund,
  moveToPocket,
  openPracticeCard,
  payCard,
  setYieldMode,
  transferOut,
} from '@/features/wallet/engine/engine';
import type { WalletState } from '@/features/wallet/engine/types';
import { type CardRecord, detectFacts, emptyRecord, guideHref, LEARNING_CARDS, pickCard, recordCard, SCREEN_WHY } from './cards';

/** D-76: the free-mode catalog of 5.3, one card per action, never repeated once answered well. */
const salaried = () => advanceDays(createWallet('p-test'), 1);
const pick = (prev: WalletState, next: WalletState, record: CardRecord = emptyRecord()) => pickCard(prev, next, record)?.id;

describe('learning cards catalog', () => {
  it('covers the ten triggers of the minimum catalog of 5.3', () => {
    expect(new Set(LEARNING_CARDS.map((c) => c.trigger)).size).toBe(10);
  });

  it('every card has a source, an existing guide part and, when it asks, a valid answer', () => {
    for (const card of [...LEARNING_CARDS, ...Object.values(SCREEN_WHY)]) {
      expect(describeSources(card.sourceIds).length, card.body.slice(0, 30)).toBeGreaterThan(0);
      const guide = guideById(card.guide.guideId);
      expect(guide, card.guide.guideId).toBeDefined();
      expect(card.guide.part).toBeGreaterThanOrEqual(1);
      expect(card.guide.part).toBeLessThanOrEqual(guide!.blocks.length);
    }
    for (const card of LEARNING_CARDS) {
      if (card.question) expect(card.question.options.map((o) => o.id)).toContain(card.question.correct);
    }
  });

  it('builds the link to the exact part of the guide with the screen to come back to (D-78)', () => {
    expect(guideHref({ guideId: 'module-09-guide-1', part: 5 }, '/app/save/yield')).toBe('/app/learn/guides/module-09-guide-1?part=5&from=%2Fapp%2Fsave%2Fyield');
  });
});

describe('triggers of the free mode', () => {
  it('cobrar el sueldo sin separar ahorro', () => {
    const start = createWallet('p-test');
    expect(pick(start, advanceDays(start, 1))).toBe('card-salary-save-first');
  });

  it('no card on the next salary when the person saved after the previous one', () => {
    let w = salaried();
    w = createPocket(w, { id: 'pocket-savings', name: 'Ahorro' });
    w = moveToPocket(w, 'pocket-savings', '100000');
    const next = advanceDays(w, 30);
    expect(detectFacts(w, next).find((f) => f.trigger === 'salary_received')?.conditions).toEqual([]);
    expect(pick(w, next)).not.toBe('card-salary-save-first');
  });

  it('el primer débito automático de una suscripción, and not the second one', () => {
    const w = salaried();
    const first = chargeSurpriseSubscription(w);
    expect(pick(w, first)).toBe('card-subscription-first-debit');
    expect(detectFacts(first, chargeSurpriseSubscription(first)).some((f) => f.trigger === 'subscription_first_debit')).toBe(false);
  });

  it('transferir a un alias nuevo, and not to the same one again', () => {
    const w = salaried();
    const once = transferOut(w, { amount: '12000', counterparty: 'Sofía Ramos · alias sofia.ramos.practica' });
    expect(pick(w, once)).toBe('card-transfer-new-payee');
    const twice = transferOut(once, { amount: '1000', counterparty: 'Sofía Ramos · alias sofia.ramos.practica' });
    expect(pick(once, twice)).toBeUndefined();
  });

  it('elegir dónde rinde el saldo', () => {
    const w = salaried();
    expect(pick(w, setYieldMode(w, 'money_market'))).toBe('card-yield-account-or-fund');
    expect(pick(w, setYieldMode(w, 'none'))).toBeUndefined();
  });

  it('constituir un plazo fijo con tasa real negativa en el escenario (alto), and not with a positive one', () => {
    const high = advanceDays({ ...createWallet('p-test'), scenarioId: 'high' }, 1);
    expect(pick(high, makeDeposit(high, 'traditional', '100000', 30))).toBe('card-deposit-negative-real-rate');
    const uva = makeDeposit(high, 'uva', '100000', 90);
    expect(detectFacts(high, uva).find((f) => f.trigger === 'term_deposit_made')?.conditions).toEqual([]);
  });

  it('pagar el mínimo de la tarjeta, and not paying it all', () => {
    const w = openPracticeCard(salaried());
    const minimum = w.card!.statement!.minimum;
    expect(pick(w, payCard(w, minimum))).toBe('card-card-paid-partially');
    expect(pick(w, payCard(w, w.card!.statement!.total))).toBeUndefined();
  });

  it('aceptar una compra en cuotas y tomar un préstamo', () => {
    const w = openPracticeCard(salaried());
    expect(pick(w, buyInInstallments(w))).toBe('card-installment-purchase');
    expect(pick(w, acceptLoan(w))).toBe('card-loan-taken');
  });

  it('intentar una compra en Invertir sin fondo de emergencia, and not with 3 months', () => {
    const w = fundBrokerage(openBrokerage(salaried(), 'moderate'), '300000');
    expect(pick(w, buy(w, 'cedear-sp500', 1))).toBe('card-invest-without-fund');
    let funded = createPocket(w, { id: 'pocket-fund', name: 'Fondo de emergencia' });
    funded = markEmergencyFund(funded, 'pocket-fund');
    funded = moveToPocket(funded, 'pocket-fund', funded.balance);
    funded = { ...funded, pockets: funded.pockets.map((p) => (p.id === 'pocket-fund' ? { ...p, amount: '3000000.00' } : p)) };
    expect(detectFacts(funded, buy(funded, 'cedear-sp500', 1)).find((f) => f.trigger === 'investment_bought')?.conditions).toEqual([]);
  });

  it('recibir un mensaje sospechoso (day 15 of the second month), and not a legitimate notice', () => {
    const w = advanceDays(createWallet('p-test'), 44);
    const next = advanceDays(w, 1);
    expect(next.messages?.at(-1)).toMatchObject({ suspicious: true, status: 'unread' });
    expect(pick(w, next)).toBe('card-suspicious-message');
    const legit = advanceDays(next, 30);
    expect(legit.messages?.at(-1)?.suspicious).toBe(false);
  });
});

describe('rules shared by missions and the free mode', () => {
  it('one card per action: the first of the catalog that matches', () => {
    // Advancing a month credits the salary and debits the first subscription: only one card.
    const start = createWallet('p-test');
    const next = advanceDays(start, 30);
    expect(detectFacts(start, next).length).toBeGreaterThan(1);
    expect(pick(start, next)).toBe('card-salary-save-first');
  });

  it('never repeats a card answered well; a wrong answer lets it come back', () => {
    const w = salaried();
    const next = setYieldMode(w, 'remunerated');
    const wrong = recordCard(emptyRecord(), 'card-yield-account-or-fund', false);
    expect(pick(w, next, wrong)).toBe('card-yield-account-or-fund');
    const right = recordCard(wrong, 'card-yield-account-or-fund', true);
    expect(pick(w, next, right)).toBeUndefined();
  });

  it('a card without a question is shown once', () => {
    const noQuestion = LEARNING_CARDS.map((c) => (c.id === 'card-yield-account-or-fund' ? { ...c, question: undefined } : c));
    const w = salaried();
    const next = setYieldMode(w, 'remunerated');
    const shown = recordCard(emptyRecord(), 'card-yield-account-or-fund');
    expect(pickCard(w, next, shown, noQuestion)).toBeUndefined();
  });
});
