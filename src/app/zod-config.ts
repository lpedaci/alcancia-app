import { config } from 'zod';

/**
 * Zod compiles object schemas with `new Function` when it can, and probes for it on the first parse.
 * The Content Security Policy forbids that (no 'unsafe-eval', CLAUDE.md 8.2), so the probe showed up
 * as a CSP violation on every form. `jitless` keeps Zod on its interpreted path (D-200).
 */
config({ jitless: true });
