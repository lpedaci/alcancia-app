import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import brokers from '@/data/brokers.json';
import fintech from '@/data/fintech.json';
import es from '@/locales/es.json';
import { writeWallet } from '@/store/wallet-store';
import { resetAll } from '@/test/session';
import { advanceDays, createWallet } from './engine/engine';
import { LEGIT_TEMPLATES, MESSAGE_BAIT, SUSPICIOUS_TEMPLATES } from './engine/profile';
import { InboxMenu } from './InboxMenu';

/** D-211: the rules of the inbox messages, approved by Lourdes on 14/11/2026. */
const templates = es.wallet.inbox.templates as Record<string, { from: string; body: string; signals?: string[] }>;
const REAL_NAMES = [
  ...fintech.map((f) => f.nombreComercial),
  ...(brokers as { nombreComercial: string }[]).map((b) => b.nombreComercial),
  'BCRA',
  'Banco Central',
  'CNV',
  'ANSES',
  'AFIP',
  'ARCA',
  'INDEC',
  'Banco Nación',
  'Banco Provincia',
];

beforeEach(() => resetAll());

describe('inbox messages (D-211)', () => {
  it('suspicious messages use invented senders, brands and domains, never a real bank, wallet or agency', () => {
    for (const id of [...SUSPICIOUS_TEMPLATES, ...LEGIT_TEMPLATES]) {
      const text = `${templates[id]!.from} ${templates[id]!.body}`;
      for (const name of REAL_NAMES) expect(text.toLowerCase(), `${id} names ${name}`).not.toContain(name.toLowerCase());
      // Any domain is a reserved one for examples.
      for (const domain of text.match(/\b[\w-]+\.[a-z]{2,}\b/gi) ?? []) expect(domain, id).toMatch(/\.(example|demo)$/i);
    }
  });

  it('no message has a link that leaves the app', () => {
    for (const id of [...SUSPICIOUS_TEMPLATES, ...LEGIT_TEMPLATES]) {
      expect(templates[id]!.body, id).not.toMatch(/https?:|www\./i);
    }
  });

  it('every suspicious message has a simulated bait and at least two signals for its feedback', () => {
    for (const id of SUSPICIOUS_TEMPLATES) {
      expect(MESSAGE_BAIT[id], id).toBeDefined();
      expect(templates[id]!.signals?.length, id).toBeGreaterThanOrEqual(2);
    }
  });

  it('reporting or taking the bait ends in the feedback with the signals', async () => {
    // Day 45: the first message, a suspicious one (fake support).
    writeWallet('p-test', advanceDays(createWallet('p-test'), 45));
    render(<InboxMenu personId="p-test" />);
    fireEvent.click(screen.getByRole('button', { name: /Mensajes/ }));
    const item = (await screen.findByText(templates['fake-support']!.body)).closest('li')!;
    fireEvent.click(within(item).getByRole('button', { name: es.wallet.inbox.bait.reply_code }));
    expect(await within(item).findByText(es.wallet.inbox.fellTitle)).toBeInTheDocument();
    for (const signal of templates['fake-support']!.signals!) expect(within(item).getByText(signal)).toBeInTheDocument();
    expect(within(item).queryByRole('button', { name: es.wallet.inbox.report })).toBeNull();
  });

  it('a report also shows the signals', async () => {
    writeWallet('p-test', advanceDays(createWallet('p-test'), 45));
    render(<InboxMenu personId="p-test" />);
    fireEvent.click(screen.getByRole('button', { name: /Mensajes/ }));
    const item = (await screen.findByText(templates['fake-support']!.body)).closest('li')!;
    fireEvent.click(within(item).getByRole('button', { name: es.wallet.inbox.report }));
    expect(await within(item).findByText(es.wallet.inbox.reportedTitle)).toBeInTheDocument();
    expect(within(item).getByText(templates['fake-support']!.signals![0]!)).toBeInTheDocument();
  });
});
