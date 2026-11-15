import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { resetMarket, toMarketState } from '@/lib/market';
import { RealValues, UseRealValue } from './RealValues';

const SNAPSHOT = {
  generatedAt: '2026-11-15T10:15:00.000Z',
  values: [
    { id: 'inflation-monthly', label: 'Inflación mensual (IPC, INDEC)', value: '0.022', unit: 'percent', date: '2026-10-31', sourceId: 'indec-via-bcra' },
    { id: 'term-deposit-people', label: 'Plazo fijo', value: '0.1986', unit: 'percent', date: '2026-11-12', sourceId: 'bcra-api', stale: true },
    { id: 'fx-retail', label: 'Dólar minorista', value: '1520.5', unit: 'ARS', date: '2026-11-13', sourceId: 'bcra-api' },
  ],
  missing: ['cer'],
  note: 'x',
};

afterEach(() => resetMarket());

describe('market snapshot (D-264)', () => {
  it('a valid snapshot is ready, indexed by id; anything else falls back to the example scenario', () => {
    const state = toMarketState(SNAPSHOT);
    expect(state.status).toBe('ready');
    expect(state.status === 'ready' && state.byId['inflation-monthly']?.value).toBe('0.022');
    expect(toMarketState({ values: 'nope' }).status).toBe('unavailable');
    expect(toMarketState({ ...SNAPSHOT, values: [] }).status).toBe('unavailable');
  });

  it('shows each real value with its date and source, and says when it could not be updated', () => {
    resetMarket(toMarketState(SNAPSHOT));
    render(<RealValues ids={['inflation-monthly', 'term-deposit-people', 'cer']} />);
    expect(screen.getByText('2,2 %')).toBeInTheDocument();
    expect(screen.getByText('Valor al 31/10/2026 · Fuente: INDEC, publicado por el BCRA')).toBeInTheDocument();
    expect(screen.getByText('19,86 %')).toBeInTheDocument();
    expect(screen.getByText(/No pudimos actualizarlo hoy/)).toBeInTheDocument();
    // The missing CER is simply not listed; the scenario reminder is always there
    expect(screen.queryByText('Coeficiente CER')).toBeNull();
    expect(screen.getByText(/es un escenario, no una predicción/)).toBeInTheDocument();
  });

  it('without a snapshot the screen keeps the example scenario and says so', () => {
    resetMarket({ status: 'unavailable' });
    render(<RealValues ids={['inflation-monthly']} />);
    expect(screen.getByText(/Hoy no pudimos leer los valores reales/)).toBeInTheDocument();
  });

  it('a tool field can take today’s real value, as percent text', () => {
    resetMarket(toMarketState(SNAPSHOT));
    const onUse = vi.fn();
    render(<UseRealValue id="inflation-monthly" onUse={onUse} />);
    fireEvent.click(screen.getByRole('button', { name: /Usar el último dato real: 2,2/ }));
    expect(onUse).toHaveBeenCalledWith('2,2');
  });
});
