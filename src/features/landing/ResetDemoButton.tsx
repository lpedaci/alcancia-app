import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { toast } from '@/components/ui/toast-store';
import { resetDemo } from '@/features/auth/auth-service';

/** "Restablecer demo" in the landing footer (CLAUDE.md 7), with confirmation that repeats the consequence. */
export function ResetDemoButton() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-fit rounded-sm text-left text-body-medium text-on-surface-variant underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {t('landing.footer.reset')}
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t('landing.footer.resetTitle')}
        description={t('landing.footer.resetBody')}
        confirmLabel={t('landing.footer.reset')}
        onConfirm={() => {
          resetDemo();
          toast.success(t('landing.footer.resetDone'));
        }}
      />
    </>
  );
}
