/**
 * Domain types (CLAUDE.md 7). Step 2 only needs the roles for avatars and role colors; step 3
 * adds the rest of the data model with the seed data.
 */
export type Role = 'ld_admin' | 'tutor' | 'participant' | 'sponsor';

export type Dimension = 'budget' | 'savings' | 'debt' | 'inflation_rates' | 'goals';
