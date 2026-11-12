import { Route, Routes } from 'react-router';
import { LandingPlaceholder } from '@/features/landing/LandingPlaceholder';
import { NotFoundPage } from '@/features/system/NotFoundPage';

/**
 * Step 1 (setup) only has the landing placeholder and the not found page. The screens of
 * docs/information-architecture.md, section 7, are added step by step.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPlaceholder />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
