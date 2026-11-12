import Decimal from 'decimal.js';
import { type FocusEvent, forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextField, type TextFieldProps } from '@/components/ui/TextField';
import { moneyMask } from '@/lib/input-masks';
import { formatMoney, formatNumber, parseDecimalInput } from '@/lib/money';

export interface MoneyInputProps extends Omit<TextFieldProps, 'mask' | 'leading' | 'inputMode' | 'type'> {
  currency?: 'ARS' | 'USD';
}

/**
 * Amount field (CLAUDE.md 2.10): only digits, dots and one comma; accepts pasting "$ 1.500,50" or
 * "1500.50"; on blur it normalizes and formats the thousands ("1.500,50") and the screen reader
 * hears the final value. The helper text says the range and gives an example, for instance
 * "Monto en pesos, por ejemplo: 150.000". Read the value with `parseDecimalInput`.
 */
export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(function MoneyInput(
  { currency = 'ARS', onBlur, ...props },
  ref,
) {
  const { t } = useTranslation();
  const [announce, setAnnounce] = useState('');

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const input = event.target;
    const parsed = parseDecimalInput(input.value);
    if (parsed !== null) {
      const decimals = new Decimal(parsed).isInteger() ? 0 : 2;
      const formatted = formatNumber(parsed, decimals);
      if (formatted !== input.value) {
        // Native setter + input event, so React Hook Form and controlled parents see the change.
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        setter?.call(input, formatted);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      setAnnounce(t('ui.valueAnnounce', { value: formatMoney(parsed, { currency, decimals }) }));
    } else {
      setAnnounce('');
    }
    onBlur?.(event);
  };

  return (
    <TextField
      ref={ref}
      inputMode="decimal"
      autoComplete="off"
      mask={moneyMask}
      leading={currency === 'ARS' ? '$' : 'USD'}
      className="tabular-nums"
      announce={announce}
      onBlur={handleBlur}
      {...props}
    />
  );
});
