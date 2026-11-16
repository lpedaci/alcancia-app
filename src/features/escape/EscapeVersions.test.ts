import i18n from 'i18next';
import { describe, expect, it } from 'vitest';
import '@/app/i18n';
import { badgeSvg } from './EscapeVersions';

/** D-310: the downloadable badge is a flat image with the game, the version and the date, and no personal data. */
describe('downloadable badge', () => {
  it('names the badge, the version and the date, with no data of the person', () => {
    const svg = badgeSvg('silver', i18n.t);
    expect(svg).toMatch(/^<svg [^>]*xmlns="http:\/\/www.w3.org\/2000\/svg"/);
    expect(svg).toContain('Insignia de plata');
    expect(svg).toContain('versión intermedia');
    expect(svg).toContain('16/11/2026');
    expect(svg).not.toMatch(/Mariana|Diego|@|CUIL|\$/);
    expect(svg).not.toMatch(/gradient/i); // flat, no gradients (2.2)
  });
});
