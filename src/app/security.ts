/**
 * Content Security Policy (CLAUDE.md 8.2): only the app's own resources. vite.config.ts injects
 * it in the production build as a <meta> tag, because GitHub Pages cannot send headers.
 * `frame-ancestors` only works as an HTTP header: it is documented in docs/security.md.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  // Scripts stay strict (that is what stops XSS). Inline styles are allowed because Radix,
  // Motion and Recharts set style attributes and <style> blocks with runtime values.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ');
