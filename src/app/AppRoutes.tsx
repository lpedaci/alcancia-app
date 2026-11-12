import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { LandingPlaceholder } from '@/features/landing/LandingPlaceholder';
import { NotFoundPage } from '@/features/system/NotFoundPage';

// The internal style guide (CLAUDE.md 2.8) exists only in development: it is never bundled in production.
const StyleguidePage = import.meta.env.DEV
  ? lazy(() => import('@/features/styleguide/StyleguidePage').then((m) => ({ default: m.StyleguidePage })))
  : null;

/**
 * Screens of docs/information-architecture.md, section 7, are added step by step.
 */
export function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<LandingPlaceholder />} />
        {StyleguidePage && <Route path="/styleguide" element={<StyleguidePage />} />}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
