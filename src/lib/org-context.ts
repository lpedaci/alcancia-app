import { useOrganization } from '@/store/data-store';
import type { OrganizationKind } from '@/types/domain';

/**
 * Context of use of the signed-in person's organization (5.5, D-74). Texts that change by context
 * use i18next's context: `t('roles.sponsor', { context: kind })` reads `sponsor_education` when it
 * exists and falls back to the base key, which is the organization's (employer) wording.
 */
export function useOrgKind(): OrganizationKind {
  return useOrganization().kind;
}

/** Context option for i18next: the employer wording is the base key, so it needs none. */
export const ctx = (kind: OrganizationKind) => (kind === 'employer' ? undefined : kind);
