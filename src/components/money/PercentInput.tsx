import { type FocusEvent, forwardRef, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextField, type TextFieldProps } from '@/components/ui/TextField';
import { percentMask } from '@/lib/input-masks';
import { MINUS, NBSP, parseDecimalInput } from '@/lib/money';

export interface PercentInputProps extends Omit<TextFieldProps, 'mask' | 'trailing' | 'inputMode' | 'type'> {
  /** Allows a leading minus (for example, a negative real rate). */
  allowNegative?: boolean;
}

/**
 * Percentage field (CLAUDE.md 2.10): digits, one comma and, if allowed, a minus sign. The value is
 * the percentage as typed ("3" means 3 %); convert to a fraction before calculating. The label must
 * say the period ("Inflación mensual"), because a percentage without a period means nothing (2.9).
 */
export const PercentInput = forwardRef<HTMLInputElement, PercentInputProps>(function PercentInput(
  { allowNegative = false, onBlur, ...props },
  ref,
) {
  const { t } = useTranslation();
  const [announce, setAnnounce] = useState('');
  const mask = useMemo(() => percentMask({ allowNegative }), [allowNegative]);

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const input = event.target;
    const parsed = parseDecimalInput(input.value, { allowNegative });
    if (parsed !== null) {
      const formatted = parsed.replace('.', ',');
      if (formatted !== input.value) {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        setter?.call(input, formatted);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      setAnnounce(t('ui.valueAnnounce', { value: `${formatted.replace('-', MINUS)}${NBSP}%` }));
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
      mask={mask}
      trailing={
        <span aria-hidden className="pr-3 text-body-large text-on-surface-variant md:text-body-medium">
          %
        </span>
      }
      className="tabular-nums"
      announce={announce}
      onBlur={handleBlur}
      {...props}
    />
  );
});
