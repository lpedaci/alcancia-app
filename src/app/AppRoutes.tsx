import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { LandingPage } from '@/features/landing/LandingPage';
import { NotFoundPage } from '@/features/system/NotFoundPage';
import { RequireSession } from './RequireSession';

// Route-level code splitting (RNF-03, INC-03): access screens, the wallet and the staff panels load on demand.
const lazyPage = <T extends Record<string, React.ComponentType>>(load: () => Promise<T>, name: keyof T) =>
  lazy(() => load().then((m) => ({ default: m[name] as React.ComponentType })));

const LoginPage = lazyPage(() => import('@/features/auth/LoginPage'), 'LoginPage');
const SsoPage = lazyPage(() => import('@/features/auth/SsoPage'), 'SsoPage');
const VerifyPage = lazyPage(() => import('@/features/auth/VerifyPage'), 'VerifyPage');
const AccessHelpPage = lazyPage(() => import('@/features/auth/AccessHelpPage'), 'AccessHelpPage');
const ConsentPage = lazyPage(() => import('@/features/auth/ConsentPage'), 'ConsentPage');
const WalletHomePage = lazyPage(() => import('@/features/wallet/WalletHomePage'), 'WalletHomePage');
const InflationToolPage = lazyPage(() => import('@/features/simulators/ToolPage'), 'InflationToolPage');
const AdminHomePage = lazyPage(() => import('@/features/organization/AdminHomePage'), 'AdminHomePage');
const PeoplePage = lazyPage(() => import('@/features/organization/PeoplePage'), 'PeoplePage');
const ImportPage = lazyPage(() => import('@/features/organization/ImportPage'), 'ImportPage');
const ProgramPage = lazyPage(() => import('@/features/organization/ProgramPage'), 'ProgramPage');
const SponsorPage = lazyPage(() => import('@/features/sponsor/SponsorPage'), 'SponsorPage');
const InvestorProfilePage = lazyPage(() => import('@/features/levels/InvestorProfilePage'), 'InvestorProfilePage');
const MissionPage = lazyPage(() => import('@/features/missions/MissionPage'), 'MissionPage');
const WelcomePage = lazyPage(() => import('@/features/onboarding/WelcomePage'), 'WelcomePage');
const ProfilePage = lazyPage(() => import('@/features/profile/ProfilePage'), 'ProfilePage');
const LearnPage = lazyPage(() => import('@/features/learning/LearnPage'), 'LearnPage');
const GuidePage = lazyPage(() => import('@/features/learning/GuidePage'), 'GuidePage');
const ChallengePage = lazyPage(() => import('@/features/learning/ChallengePage'), 'ChallengePage');
const PayPage = lazyPage(() => import('@/features/pay/PayPage'), 'PayPage');
const BudgetPage = lazyPage(() => import('@/features/budget/BudgetPage'), 'BudgetPage');
const PocketsPage = lazyPage(() => import('@/features/pockets/PocketsPage'), 'PocketsPage');
const YieldPage = lazyPage(() => import('@/features/yield/YieldPage'), 'YieldPage');
const SourcesPage = lazyPage(() => import('@/features/learning/SourcesPage'), 'SourcesPage');
const TutorHomePage = lazyPage(() => import('@/features/tutor/TutorHomePage'), 'TutorHomePage');
const CohortPage = lazyPage(() => import('@/features/tutor/CohortPage'), 'CohortPage');
const AssignChallengePage = lazyPage(() => import('@/features/tutor/AssignChallengePage'), 'AssignChallengePage');
const AssessmentsPage = lazyPage(() => import('@/features/tutor/AssessmentsPage'), 'AssessmentsPage');
const QuestionsPage = lazyPage(() => import('@/features/tutor/QuestionsPage'), 'QuestionsPage');
const InvestPage = lazyPage(() => import('@/features/invest/InvestPage'), 'InvestPage');
const InstrumentPage = lazyPage(() => import('@/features/invest/InvestPage'), 'InstrumentPage');
const ToolsPage = lazyPage(() => import('@/features/simulators/ToolsPages'), 'ToolsPage');
const SimToolPage = lazyPage(() => import('@/features/simulators/ToolsPages'), 'SimToolPage');

// The internal style guide (CLAUDE.md 2.8) exists only in development: it is never bundled in production.
const StyleguidePage = import.meta.env.DEV ? lazyPage(() => import('@/features/styleguide/StyleguidePage'), 'StyleguidePage') : null;

/**
 * Screens of docs/information-architecture.md, section 7, added step by step. Public: G0 to G5 and
 * G7. Protected (RequireSession: session, consent and permission of the route): the wallet and the
 * homes of the other roles, whose panels arrive in steps 10 and 11.
 */
export function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/sso" element={<SsoPage />} />
        <Route path="/login/verify" element={<VerifyPage />} />
        <Route path="/access-help" element={<AccessHelpPage />} />
        <Route path="/consent" element={<ConsentPage />} />
        <Route element={<RequireSession />}>
          <Route path="/app" element={<WalletHomePage />} />
          <Route path="/app/tools/SIM-3" element={<InflationToolPage />} />
          <Route path="/app/learn/investor-profile" element={<InvestorProfilePage />} />
          <Route path="/app/learn/sources" element={<SourcesPage />} />
          {/* Wallet sections built in later steps: locked ones show what is missing (5.0) */}
          <Route path="/app/pay" element={<PayPage />} />
          <Route path="/app/pay/:flow" element={<PayPage />} />
          <Route path="/app/save/budget" element={<BudgetPage />} />
          <Route path="/app/save/pockets" element={<PocketsPage />} />
          <Route path="/app/save/yield" element={<YieldPage />} />
          <Route path="/app/invest" element={<InvestPage />} />
          <Route path="/app/invest/:instrumentId" element={<InstrumentPage />} />
          <Route path="/app/learn" element={<LearnPage />} />
          <Route path="/app/learn/guides/:guideId" element={<GuidePage />} />
          <Route path="/app/learn/challenges/:challengeId" element={<ChallengePage />} />
          <Route path="/app/tools" element={<ToolsPage />} />
          <Route path="/app/tools/:simId" element={<SimToolPage />} />
          <Route path="/app/missions/:missionId" element={<MissionPage />} />
          <Route path="/app/welcome" element={<WelcomePage />} />
          <Route path="/app/profile" element={<ProfilePage />} />
          <Route path="/tutor" element={<TutorHomePage />} />
          <Route path="/tutor/cohorts/:id" element={<CohortPage />} />
          <Route path="/tutor/cohorts/:id/challenge" element={<AssignChallengePage />} />
          <Route path="/tutor/assessments" element={<AssessmentsPage />} />
          <Route path="/tutor/questions" element={<QuestionsPage />} />
          <Route path="/admin" element={<AdminHomePage />} />
          <Route path="/admin/people" element={<PeoplePage />} />
          <Route path="/admin/people/import" element={<ImportPage />} />
          <Route path="/admin/program" element={<ProgramPage />} />
          <Route path="/sponsor" element={<SponsorPage />} />
          {/* Other routes of a role's area: not found inside the guard, so another role gets G7 first. */}
          <Route path="/app/*" element={<NotFoundPage />} />
          <Route path="/tutor/*" element={<NotFoundPage />} />
          <Route path="/admin/*" element={<NotFoundPage />} />
          <Route path="/sponsor/*" element={<NotFoundPage />} />
        </Route>
        {StyleguidePage && <Route path="/styleguide" element={<StyleguidePage />} />}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
