import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { MoneyInput } from '@/components/money/MoneyInput';
import { PercentInput } from '@/components/money/PercentInput';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { toast } from '@/components/ui/toast-store';
import { dateMask, digitsMask, noSpacesMask } from '@/lib/input-masks';
import { useFieldError } from '@/lib/use-field-error';
import { dateField, emailField, moneyField, otpField, percentField } from '@/lib/validation';

const AMOUNT_MAX = '100000000';
const schema = z.object({
  email: emailField,
  date: dateField,
  amount: moneyField({ min: '1', max: AMOUNT_MAX }),
  inflation: percentField({ min: '0', max: '50' }),
  code: otpField,
});

type DemoValues = z.infer<typeof schema>;

const codeMask = digitsMask(6);

/**
 * Working example of the form pattern used across Alcancía (CLAUDE.md 2.10), dev-only:
 * - masks block characters that do not belong in a field (letters in amounts, dates or codes)
 * - amounts accept pasting "$ 1.500,50" or "1500.50" and are formatted on blur
 * - first validation on blur or submit, never while typing for the first time
 * - after an error, the field revalidates on every change and the message disappears when fixed
 * - values are never cleared on error; focus moves to the first field with an error
 */
export function ValidationDemoForm() {
  const fieldError = useFieldError();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DemoValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { email: '', date: '', amount: '', inflation: '', code: '' },
  });

  const onSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    toast.success('Datos validados');
  };

  return (
    <form className="flex flex-col gap-5" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <MoneyInput
          label="Monto a guardar"
          required
          helperText="Monto en pesos, entre 1 y 100.000.000, por ejemplo: 150.000. Puedes pegar “$ 1.500,50”"
          error={fieldError(errors.amount)}
          {...register('amount')}
        />
        <PercentInput
          label="Inflación mensual"
          required
          helperText="Porcentaje mensual entre 0 y 50, por ejemplo: 3 o 2,5"
          error={fieldError(errors.inflation)}
          {...register('inflation')}
        />
        <TextField
          label="Fecha"
          required
          inputMode="numeric"
          mask={dateMask}
          placeholder="DD/MM/AAAA"
          helperText="Formato DD/MM/AAAA, por ejemplo: 16/11/2026. Las barras se agregan solas"
          error={fieldError(errors.date)}
          {...register('date')}
        />
        <TextField
          label="Correo de trabajo"
          type="email"
          autoComplete="email"
          required
          mask={noSpacesMask}
          helperText="Tu correo de trabajo, por ejemplo: nombre.apellido@andina.demo"
          error={fieldError(errors.email)}
          {...register('email')}
        />
        <TextField
          label="Código de verificación"
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          mask={codeMask}
          helperText="Los 6 dígitos de tu app autenticadora. Puedes pegarlo"
          error={fieldError(errors.code)}
          {...register('code')}
        />
        <TextField label="Área" disabled defaultValue="Operaciones" helperText="Se completa según tu cohorte" />
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="submit" loading={isSubmitting} loadingText="Validando…">
          Validar datos
        </Button>
      </div>
    </form>
  );
}
