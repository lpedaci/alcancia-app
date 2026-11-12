import { describe, expect, it } from 'vitest';
import { CONTENT_SECURITY_POLICY } from './security';

describe('Content Security Policy (CLAUDE.md 8.2)', () => {
  it('keeps scripts strict and allows no external origin', () => {
    expect(CONTENT_SECURITY_POLICY).toContain("script-src 'self'");
    expect(CONTENT_SECURITY_POLICY).not.toMatch(/script-src[^;]*unsafe/);
    expect(CONTENT_SECURITY_POLICY).not.toMatch(/https?:/);
    expect(CONTENT_SECURITY_POLICY).toContain("object-src 'none'");
  });
});
