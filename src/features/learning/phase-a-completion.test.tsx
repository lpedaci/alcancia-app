import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import es from '@/locales/es.json';
import { useDataStore } from '@/store/data-store';
import { readLocal } from '@/store/local-store';
import { renderAt } from '@/test/render-app';
import { resetAll, signInAs } from '@/test/session';
import { QuestionView } from './QuestionView';
import { BANK, isCorrect, type LearningQuestion } from './questions';

/** Phase A completion (review of 13/11/2026, D-202 to D-205). */
beforeEach(() => resetAll());

describe('exercise with a simulator (RF-43)', () => {
  it('embeds the simulator with its preset and takes the result as a number', () => {
    const q = BANK.find((x) => x.id === 'm06-sim-minimum') as LearningQuestion;
    let value: string | undefined;
    const { rerender } = render(<QuestionView question={q} value={value} onChange={(a) => (value = a as string)} idPrefix="t" />);
    expect(screen.getByText(/Abrir el simulador/)).toBeInTheDocument();
    const field = screen.getByRole('textbox', { name: new RegExp(q.prompt.slice(0, 30)) });
    fireEvent.change(field, { target: { value: '237' } });
    rerender(<QuestionView question={q} value={value} onChange={(a) => (value = a as string)} idPrefix="t" />);
    expect(isCorrect(q, value)).toBe(true);
    expect(isCorrect(q, '200')).toBe(false);
  });
});

describe('weekly challenge and questions of the participant (RF-50, D-202)', () => {
  it('sends only the result to the shared data; the reflection stays local', async () => {
    signInAs('p-mariana');
    renderAt('/app/learn');
    const section = (await screen.findByRole('heading', { name: es.learn.weekly.title })).closest('section')!;
    fireEvent.click(within(section).getByRole('radio', { name: new RegExp(es.learn.weekly.results.partial) }));
    fireEvent.change(within(section).getByRole('textbox', { name: new RegExp(es.learn.weekly.reflection) }), { target: { value: 'Me costó la última semana' } });
    fireEvent.click(within(section).getByRole('button', { name: es.learn.weekly.send }));
    const report = useDataStore.getState().weeklyReports.find((r) => r.personId === 'p-mariana' && r.challengeId === 'weekly-operations-3');
    expect(report?.result).toBe('partial');
    expect(JSON.stringify(useDataStore.getState())).not.toContain('Me costó');
    expect(readLocal('p-mariana').reflections['weekly-operations-3']).toBe('Me costó la última semana');
  });

  it('asks the tutor about a module, without economic data reaching anyone else', async () => {
    signInAs('p-diego');
    renderAt('/app/learn');
    const section = (await screen.findByRole('heading', { name: es.learn.ask.title })).closest('section')!;
    fireEvent.click(within(section).getByRole('button', { name: es.learn.ask.open }));
    fireEvent.change(within(section).getByRole('combobox'), { target: { value: 'module-17' } });
    fireEvent.change(within(section).getByRole('textbox'), { target: { value: '¿Cómo sé si mi billetera tiene CVU?' } });
    fireEvent.click(within(section).getByRole('button', { name: es.learn.ask.send }));
    const mine = useDataStore.getState().tutorQuestions.filter((q) => q.personId === 'p-diego');
    expect(mine.at(-1)).toMatchObject({ moduleId: 'module-17', cohortId: 'cohort-operations', text: '¿Cómo sé si mi billetera tiene CVU?' });
    expect(within(section).getByText('¿Cómo sé si mi billetera tiene CVU?')).toBeInTheDocument();
  });
});

describe('saved scenarios (RF-62, D-203)', () => {
  it('keeps the saved scenario in the person\'s local space, so it survives a reload', async () => {
    signInAs('p-mariana');
    const first = renderAt('/app/tools/SIM-4');
    fireEvent.click(await screen.findByRole('button', { name: es.sim3.compare.save }));
    expect(readLocal('p-mariana').scenarios.map((s) => s.simId)).toEqual(['SIM-4']);
    first.unmount();
    renderAt('/app/tools/SIM-4');
    expect(await screen.findByRole('list', { name: es.sim3.compare.listLabel })).toBeInTheDocument();
    expect(readLocal('p-diego').scenarios).toEqual([]);
  });
});

describe('glossary chips in the guides (RF-47, D-204)', () => {
  it('turns the first CFT of the guide into a chip that opens its definition', async () => {
    signInAs('p-mariana');
    renderAt('/app/learn/guides/module-06-guide-1');
    fireEvent.click(await screen.findByRole('button', { name: es.learn.guide.next }));
    const chip = await screen.findByRole('button', { name: 'CFT: ver qué significa' });
    fireEvent.click(chip);
    expect(await screen.findByText(/Todo lo que pagas por un crédito/)).toBeInTheDocument();
  });
});
