import { screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import { renderAt } from '@/test/render-app';
import i18n from './i18n';

afterEach(async () => {
  await i18n.changeLanguage('es');
});

describe('routing (step 1)', () => {
  it('shows the landing placeholder with a single h1, in Spanish', () => {
    renderAt('/');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(es.landing.title);
    expect(document.documentElement.lang).toBe('es');
  });

  it('exposes a skip link to the main landmark', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: es.app.skipToContent })).toHaveAttribute('href', '#main-content');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  });

  it('opens external links safely (CLAUDE.md 8.2)', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: es.landing.docsLink })).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('shows the not found page for unknown routes', () => {
    renderAt('/does-not-exist');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(es.notFound.title);
  });
});

describe('locales', () => {
  const keysOf = (obj: object, prefix = ''): string[] =>
    Object.entries(obj).flatMap(([key, value]) =>
      typeof value === 'object' && value !== null ? keysOf(value, `${prefix}${key}.`) : [`${prefix}${key}`],
    );
  const valuesOf = (obj: object): string[] =>
    Object.values(obj).flatMap((value) =>
      typeof value === 'object' && value !== null ? valuesOf(value) : [String(value)],
    );

  it('Spanish and English have the same keys', () => {
    expect(keysOf(en).sort()).toEqual(keysOf(es).sort());
  });

  it('Spanish texts follow the voice rules (CLAUDE.md 2.9)', () => {
    const texts = valuesOf(es).join(' | ');
    expect(texts).not.toMatch(/—/);
    expect(texts).not.toMatch(/\b(vos|usted)\b/i);
    expect(texts).not.toMatch(/\b(loguea|dashboard|mail|móvil|ordenador|target)\b/i);
  });

  it('loads English on demand and keeps <html lang> in sync (WCAG 3.1.1)', async () => {
    await i18n.changeLanguage('en');
    await waitFor(() => expect(i18n.t('landing.title')).toBe(en.landing.title));
    expect(document.documentElement.lang).toBe('en');
  });
});
