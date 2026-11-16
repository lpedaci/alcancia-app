import { AuthoringPage } from './AuthoringPage';

/** The builder in each staff area (F14, D-317): a tutor writes for her cohorts, L&D for every cohort. */
export const TutorAuthoringPage = () => <AuthoringPage role="tutor" />;
export const AdminAuthoringPage = () => <AuthoringPage role="admin" />;
