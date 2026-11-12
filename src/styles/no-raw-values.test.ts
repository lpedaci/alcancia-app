import { describe, expect, it } from 'vitest';

/**
 * CLAUDE.md 2.1: no component uses a loose value. Colors, shadows and radii come from the tokens
 * through the Tailwind theme. This test reads the source of every component and screen.
 */
const sources = import.meta.glob<string>(['../components/**/*.tsx', '../features/**/*.tsx'], {
  query: '?raw',
  import: 'default',
  eager: true,
});

const RULES: [string, RegExp][] = [
  ['raw hex color', /#[0-9a-fA-F]{3,8}\b(?![\w-])/],
  ['arbitrary color class', /\b(?:bg|text|border|ring|fill|stroke|outline)-\[(?:#|rgb|hsl)/],
  ['arbitrary shadow', /\bshadow-\[/],
  ['gradient', /\bbg-(?:linear|radial|conic)-|\bbg-gradient-|linear-gradient\(/],
];

describe('components use tokens only', () => {
  it('finds the sources', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(20);
  });

  for (const [path, code] of Object.entries(sources)) {
    it(`${path.replace('../', 'src/')} has no loose colors, shadows or gradients`, () => {
      // Comments may mention hex values (for example, a decision about a color).
      const withoutComments = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      for (const [name, rule] of RULES) {
        expect(withoutComments, name).not.toMatch(rule);
      }
    });
  }
});
