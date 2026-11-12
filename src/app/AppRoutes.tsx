import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { LandingPage } from '@/features/landing/LandingPage';
import { NotFoundPage } from '@/features/system/NotFoundPage';

// Route-level code splitting (RNF-03): the wallet loads on demand.
const WalletHomePage = lazy(() => import('@/features/wallet/WalletHomePage').then((m) => ({ default: m.WalletHomePage })));
const InflationToolPage = lazy(() => import('@/features/simulators/ToolPage').then((m) => ({ default: m.InflationToolPage })));

// The internal style guide (CLAUDE.md 2.8) exists only in development: it is never bundled in production.
const StyleguidePage = import.meta.env.DEV
  ? lazy(() => import('@/features/styleguide/StyleguidePage').then((m) => ({ default: m.StyleguidePage })))
  : null;

/**
 * Screens of docs/information-architecture.md, section 7, added step by step. Visual pilot
 * (step 4): G0, P1 and SIM-3. Access and route guards arrive in step 5.
 */
export function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<WalletHomePage />} />
        <Route path="/app/tools/SIM-3" element={<InflationToolPage />} />
        {StyleguidePage && <Route path="/styleguide" element={<StyleguidePage />} />}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
