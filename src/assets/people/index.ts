import diego from './diego.webp';
import kevin from './kevin.webp';
import mariana from './mariana.webp';
import paula from './paula.webp';
import ricardo from './ricardo.webp';

/**
 * Profile photos of the five demo people (D-165). Stock photos from Magnific under its free
 * license, which asks for attribution: the credit goes in the case study, the documentation and the
 * design system site (README.md of this folder, docs/visual-audit.md). Cropped square (256 px, WebP) with the same framing.
 * The 80 seed participants keep initials: they appear only in aggregated panels.
 */
export const PERSON_PHOTOS: Record<string, string> = {
  'p-mariana': mariana,
  'p-diego': diego,
  'p-kevin': kevin,
  'p-paula': paula,
  'p-ricardo': ricardo,
};
