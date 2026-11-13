import { describe, expect, it } from 'vitest';

/**
 * CLAUDE.md 8.2, applied for real in the front-end (docs/security.md, D-200): the source never
 * writes raw HTML, never runs strings as code and never opens a new tab that could reach back
 * to this page. These were code-review rules; now the unit tests (and the pre-push hook) fail.
 */
const sources = import.meta.glob<string>(['../**/*.{ts,tsx}', '!../**/*.test.{ts,tsx}', '!../test/**'], {
  query: '?raw',
  import: 'default',
  eager: true,
});

const FORBIDDEN: [RegExp, string][] = [
  [/dangerouslySetInnerHTML/, 'raw HTML in React'],
  [/\.(innerHTML|outerHTML)\s*=/, 'raw HTML assignment'],
  [/insertAdjacentHTML|document\.write/, 'raw HTML insertion'],
  [/\beval\s*\(|new Function\s*\(/, 'strings run as code'],
  [/\bwindow\.open\s*\(/, 'new window without rel="noopener noreferrer"'],
  [/javascript:/, 'javascript: URL'],
];

describe('front-end safety rules (8.2)', () => {
  it('scans the whole source tree', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(100);
  });

  it('never writes raw HTML or runs strings as code', () => {
    for (const [path, code] of Object.entries(sources)) {
      for (const [rule, what] of FORBIDDEN) {
        expect(code, `${path}: ${what}`).not.toMatch(rule);
      }
    }
  });

  it('opens every new tab with rel="noopener noreferrer"', () => {
    let found = 0;
    for (const [path, code] of Object.entries(sources)) {
      for (const match of code.matchAll(/target=["{']+_blank/g)) {
        found += 1;
        // The opening tag that holds the attribute: from the last "<" before it to the next ">".
        const start = code.lastIndexOf('<', match.index);
        const end = code.indexOf('>', match.index);
        const tag = code.slice(start, end);
        expect(tag, `${path}: target="_blank" without rel`).toMatch(/rel=["{']+noopener noreferrer/);
      }
    }
    expect(found).toBeGreaterThan(0);
  });

  it('only links to https sites from the source', () => {
    for (const [path, code] of Object.entries(sources)) {
      expect(code, `${path} links to an insecure http:// site`).not.toMatch(/["'`]http:\/\/(?!localhost|www\.w3\.org\/)/);
    }
  });
});
