import type { FieldError } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

/**
 * Translates a Zod/React Hook Form error (an i18n key) into the message shown under the field.
 * `params` fills placeholders such as {{min}} and {{max}} in range messages.
 */
export function useFieldError(params?: Record<string, string | number>) {
  const { t } = useTranslation();
  return (error?: FieldError): string | undefined => (error?.message ? t(error.message, params ?? {}) : undefined);
}
