import { describe, expect, it } from 'vitest';
import css from './tokens.css?raw';
import { contrast as contrastRatio } from '@/lib/contrast';

/**
 * Verifies WCAG 2.2 AA contrast for every color pair the system allows (CLAUDE.md 2.1.1 and 2.8),
 * and the token architecture (2.1): system roles point to reference values. Values are read from
 * tokens.css, the single source of truth, so a change in the palette is checked automatically.
 */
const lightBlock = css.slice(css.indexOf(':root {'), css.indexOf("[data-theme='dark']"));

function rawValue(name: string): string {
  const match = lightBlock.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!match?.[1]) throw new Error(`Token --${name} not found`);
  return match[1].trim();
}

/** Resolves var(--x) chains down to a hex value. */
function token(name: string, depth = 0): string {
  const value = rawValue(name);
  const ref = value.match(/^var\(--([\w-]+)\)$/);
  if (ref?.[1]) {
    if (depth > 5) throw new Error(`Too deep: --${name}`);
    return token(ref[1], depth + 1);
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(value)) throw new Error(`--${name} is not a hex color: ${value}`);
  return value;
}

const contrast = contrastRatio;
const TEXT = 4.5;
const NON_TEXT = 3;

const roles = [
  ['md-sys-color', 'primary'],
  ['md-sys-color', 'secondary'],
  ['md-sys-color', 'tertiary'],
  ['md-sys-color', 'error'],
  ['md-custom-color', 'success'],
  ['md-custom-color', 'warning'],
  ['md-custom-color', 'info'],
] as const;

const textSurfaces = ['md-sys-color-surface', 'md-sys-color-surface-container-lowest', 'md-sys-color-surface-container'];
const surfaces = [...textSurfaces, 'md-sys-color-surface-container-high'];

describe('token architecture (CLAUDE.md 2.1)', () => {
  it('every system color role points to a reference token, never to a raw value', () => {
    const systemColors = [
      ...lightBlock.matchAll(/--((?:md-sys-color|md-custom-color|role|chart|fuerte)-[\w-]+):\s*([^;]+);/g),
    ].filter(([, name]) => !name?.endsWith('-opacity'));
    expect(systemColors.length).toBeGreaterThan(40);
    for (const [, , value] of systemColors) {
      expect(value?.trim()).toMatch(/^var\(--ref-[\w-]+\)$/);
    }
  });
});

describe('color tokens: WCAG 2.2 AA contrast', () => {
  for (const [prefix, role] of roles) {
    it(`${role}: on-${role} text on the base color`, () => {
      expect(contrast(token(`${prefix}-on-${role}`), token(`${prefix}-${role}`))).toBeGreaterThanOrEqual(TEXT);
    });

    it(`${role}: on-${role}-container text on the container`, () => {
      expect(
        contrast(token(`${prefix}-on-${role}-container`), token(`${prefix}-${role}-container`)),
      ).toBeGreaterThanOrEqual(TEXT);
    });

    // Status pills use on-*-container text; the base color is only used for the pill icon.
    it(`${role}: base color as icon on the container (3:1)`, () => {
      expect(contrast(token(`${prefix}-${role}`), token(`${prefix}-${role}-container`))).toBeGreaterThanOrEqual(
        NON_TEXT,
      );
    });

    // Base colors as text only on the three lightest surfaces; never on surface-container-high.
    for (const surface of textSurfaces) {
      it(`${role}: base color as text on ${surface}`, () => {
        expect(contrast(token(`${prefix}-${role}`), token(surface))).toBeGreaterThanOrEqual(TEXT);
      });
    }
  }

  for (const surface of surfaces) {
    it(`on-surface and on-surface-variant text on ${surface}`, () => {
      expect(contrast(token('md-sys-color-on-surface'), token(surface))).toBeGreaterThanOrEqual(TEXT);
      expect(contrast(token('md-sys-color-on-surface-variant'), token(surface))).toBeGreaterThanOrEqual(TEXT);
    });
  }

  // Fields and controls have a surface-container-lowest fill; the border is measured against that
  // fill and the page surfaces they sit on.
  for (const surface of textSurfaces) {
    it(`outline (control borders) reaches 3:1 on ${surface}`, () => {
      expect(contrast(token('md-sys-color-outline'), token(surface))).toBeGreaterThanOrEqual(NON_TEXT);
    });
  }

  it('inverse surface (tooltips and toasts) keeps text contrast', () => {
    expect(
      contrast(token('md-sys-color-inverse-on-surface'), token('md-sys-color-inverse-surface')),
    ).toBeGreaterThanOrEqual(TEXT);
  });

  it('chart series reach 3:1 against the card surface', () => {
    for (let i = 1; i <= 5; i++) {
      expect(contrast(token(`chart-${i}`), token('md-sys-color-surface-container-lowest'))).toBeGreaterThanOrEqual(
        NON_TEXT,
      );
    }
  });

  it('role colors reach 3:1 on their container and text contrast on white', () => {
    for (const role of ['org-admin', 'tutor', 'participant', 'sponsor']) {
      expect(contrast(token(`role-${role}`), token(`role-${role}-container`))).toBeGreaterThanOrEqual(NON_TEXT);
      expect(contrast(token(`role-${role}`), token('md-sys-color-surface-container-lowest'))).toBeGreaterThanOrEqual(
        TEXT,
      );
      expect(contrast(token('md-sys-color-on-surface'), token(`role-${role}-container`))).toBeGreaterThanOrEqual(TEXT);
    }
  });
});
