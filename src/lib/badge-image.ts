/**
 * Downloadable badges (F12, D-310, D-315): a flat SVG image with the palette's tertiary tokens, read
 * from the page so there are no loose values (2.1), a mark in the medal (a number), the badge name and
 * two lines of context. It never carries the person's name or any money (privacy by design); Open
 * Badges metadata stays as a future line.
 */

/** A color token resolved by the browser. */
const token = (name: string, fallback: string) =>
  (typeof window !== 'undefined' && getComputedStyle(document.documentElement).getPropertyValue(`--md-sys-color-${name}`).trim()) || fallback;

const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export interface BadgeImage {
  /** Short mark inside the medal, such as the version or module number. */
  mark: string;
  name: string;
  line: string;
  foot: string;
}

export function badgeSvg({ mark, name, line, foot }: BadgeImage): string {
  const paper = token('surface-container-lowest', 'white');
  const container = token('tertiary-container', 'lightcyan');
  const accent = token('tertiary', 'teal');
  const ink = token('on-tertiary-container', 'darkslategray');
  const font = 'font-family="Inter, Arial, sans-serif" text-anchor="middle"';
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" role="img" aria-label="${escapeXml(name)}">`,
    `<rect width="600" height="600" rx="48" fill="${paper}"/>`,
    `<rect x="24" y="24" width="552" height="552" rx="36" fill="${container}"/>`,
    `<circle cx="300" cy="210" r="104" fill="${accent}"/>`,
    `<circle cx="300" cy="210" r="80" fill="none" stroke="${paper}" stroke-width="6"/>`,
    `<text x="300" y="232" ${font} font-size="64" font-weight="600" fill="${paper}">${escapeXml(mark)}</text>`,
    `<path d="M244 300 L220 390 L262 372 L284 406 L300 316 Z M356 300 L380 390 L338 372 L316 406 L300 316 Z" fill="${accent}"/>`,
    `<text x="300" y="456" ${font} font-size="34" font-weight="600" fill="${ink}">${escapeXml(name)}</text>`,
    `<text x="300" y="496" ${font} font-size="20" fill="${ink}">${escapeXml(line)}</text>`,
    `<text x="300" y="532" ${font} font-size="16" fill="${ink}">${escapeXml(foot)}</text>`,
    '</svg>',
  ].join('');
}

/** Saves a text file through a temporary link (no network, no third parties). */
export function downloadSvg(svg: string, fileName: string) {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.svg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
