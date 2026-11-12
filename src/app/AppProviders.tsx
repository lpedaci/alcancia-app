import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';

/** App-wide providers. `reducedMotion="user"` makes Motion respect the OS setting (CLAUDE.md 2.6). */
export function AppProviders({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
