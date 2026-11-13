import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import es from '@/locales/es.json';
import { renderAt } from '@/test/render-app';

describe('design system site (G8, D-199)', () => {
  it('is public, has a single h1 and every section of the index', async () => {
    renderAt('/design-system');
    const h1s = await screen.findAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(es.designSystem.hero.highlight);
    for (const section of Object.values(es.designSystem.sections)) {
      expect(screen.getByRole('heading', { level: 2, name: section.title })).toBeInTheDocument();
    }
  });

  it('shows real components, the money section and the security section', async () => {
    renderAt('/design-system');
    await screen.findAllByRole('heading', { level: 1 });
    expect(screen.getByRole('button', { name: es.designSystem.components.filled })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: new RegExp(es.designSystem.components.alias) })).toBeInTheDocument();
    expect(screen.getAllByText(es.designSystem.money.legal).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: es.designSystem.security.who })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: new RegExp(es.designSystem.magnific) })).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
