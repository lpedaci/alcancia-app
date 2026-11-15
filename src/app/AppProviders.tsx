import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';
import { Toaster } from '@/components/ui/Toaster';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { ScrollToTop } from './ScrollToTop';

/** App-wide providers. `reducedMotion="user"` makes Motion respect the OS setting (CLAUDE.md 2.6). */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={300}>
        <ScrollToTop />
        {children}
        <Toaster />
      </TooltipProvider>
    </MotionConfig>
  );
}
