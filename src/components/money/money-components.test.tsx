import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MINUS } from '@/lib/money';
import { MoneyInput } from './MoneyInput';
import { MoneyText } from './MoneyText';
import { PercentInput } from './PercentInput';

describe('MoneyText', () => {
  it('prints Argentine format with tabular figures and never wraps', () => {
    render(<MoneyText value="1284958.86" />);
    const text = screen.getByText('$ 1.284.958,86');
    expect(text.parentElement).toHaveClass('tabular-nums', 'whitespace-nowrap');
  });

  it('marks gains and losses with sign, icon and a word, not only color (2.1.1)', () => {
    const { container } = render(<MoneyText value="-4990" trend />);
    expect(screen.getByText(`${MINUS}$ 4.990,00`)).toBeInTheDocument();
    expect(screen.getByText(', disminución')).toHaveClass('sr-only');
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('keeps the full value accessible when the compact form is shown (2.7)', () => {
    render(<MoneyText value="12345678.90" compactBelow="xs" />);
    expect(screen.getByText('$ 12.345.678,90', { selector: '.sr-only' })).toBeInTheDocument();
    expect(screen.getByText('$ 12,3 M')).toHaveAttribute('aria-hidden');
  });
});

describe('MoneyInput (2.10)', () => {
  it('keeps the visible label and helper text linked to the field', () => {
    render(<MoneyInput label="Monto" helperText="Monto en pesos, por ejemplo: 150.000" />);
    const input = screen.getByLabelText('Monto');
    expect(input).toHaveAttribute('inputmode', 'decimal');
    expect(input).toHaveAccessibleDescription('Monto en pesos, por ejemplo: 150.000');
  });

  it('accepts a pasted "$ 1.500,50", formats it on blur and announces the final value', () => {
    render(<MoneyInput label="Monto" helperText="Monto en pesos" />);
    const input = screen.getByLabelText('Monto') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '$ 1.500,50' } });
    expect(input.value).toBe('1.500,50');
    fireEvent.change(input, { target: { value: '1500.50' } });
    fireEvent.blur(input);
    expect(input.value).toBe('1.500,50');
    expect(screen.getByText('Valor: $ 1.500,50')).toBeInTheDocument();
  });

  it('removes letters while typing', () => {
    render(<MoneyInput label="Monto" helperText="Monto en pesos" />);
    const input = screen.getByLabelText('Monto') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '12a3' } });
    expect(input.value).toBe('123');
  });
});

describe('PercentInput (2.10)', () => {
  it('accepts a comma and, when allowed, a minus sign', () => {
    render(<PercentInput label="Tasa real" helperText="Porcentaje" allowNegative />);
    const input = screen.getByLabelText('Tasa real') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '-0.04' } });
    fireEvent.blur(input);
    expect(input.value).toBe('-0,04');
    expect(screen.getByText(`Valor: ${MINUS}0,04 %`)).toBeInTheDocument();
  });
});
