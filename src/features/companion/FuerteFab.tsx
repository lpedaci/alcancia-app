import { Popover as PopoverPrimitive } from 'radix-ui';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/utils';
import { Fuerte, type FuerteState } from './Fuerte';

/**
 * Fuerte as a floating button (D-160, Lourdes's request): instead of a fixed column next to the
 * content, Fuerte waits in the bottom-right corner and shows a dot when he has something to say.
 * The panel holds his message (two sentences at most, 5.0.1), "¿Por qué importa?" and an action.
 * The drawing is decorative; the button is named by its text and the message is read as text.
 */
export function FuerteFab({
  state = 'neutral',
  lights,
  message,
  why,
  children,
}: {
  state?: FuerteState;
  lights: number;
  message: string;
  why?: string;
  /** Optional action under the message (for example, the active mission). */
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  // A new message shows the dot again until it is read.
  const [readMessage, setReadMessage] = useState<string | null>(null);
  const unread = readMessage !== message;

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setReadMessage(message);
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label={unread ? t('wallet.fuerte.unread') : t('wallet.fuerte.open')}
          className="fixed right-4 bottom-20 z-30 flex size-14 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest outline-offset-2 hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-primary medium:right-6 medium:bottom-6"
        >
          <Fuerte state={state} lights={lights} size={2.5} />
          {unread && (
            <span aria-hidden className="absolute top-1 right-1 size-3 rounded-full border-2 border-surface-container-lowest bg-primary" />
          )}
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="top"
          align="end"
          sideOffset={12}
          collisionPadding={12}
          aria-label={t('wallet.fuerte.title')}
          className={cn(
            'z-40 flex w-80 max-w-[calc(100vw-1.5rem)] flex-col gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-elevation-2 outline-none',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          )}
        >
          <div className="flex items-start gap-3">
            <Fuerte state={state} lights={lights} size={3} />
            <div className="min-w-0 flex-1">
              <p className="text-title-small text-on-surface">{t('wallet.fuerte.title')}</p>
              <p className="text-body-medium text-on-surface">{message}</p>
            </div>
            <PopoverPrimitive.Close asChild>
              <IconButton icon="close" size="xs" label={t('wallet.fuerte.close')} className="-mt-1 -mr-1" />
            </PopoverPrimitive.Close>
          </div>
          {why && (
            <div className="rounded-md bg-info-container px-3 py-2 text-on-info-container">
              <p className="flex items-center gap-1.5 text-label-large">
                <Icon name="lightbulb" size={16} className="text-info" />
                {t('wallet.fuerte.whyTitle')}
              </p>
              <p className="mt-1 text-body-small">{why}</p>
            </div>
          )}
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
