import diego from './diego.webp';
import hector from './hector.webp';
import joaquin from './joaquin.webp';
import kevin from './kevin.webp';
import lucia from './lucia.webp';
import mariana from './mariana.webp';
import martin from './martin.webp';
import nicolas from './nicolas.webp';
import juana from './juana.webp';
import julieta from './julieta.webp';
import ricardo from './ricardo.webp';
import bettyna from './bettyna.webp';
import sofia from './sofia.webp';

/**
 * Profile photos of the demo people (D-165). Stock photos from Magnific under its free
 * license, which asks for "Designed by Magnific" with a link (D-71): in the landing footer, the case
 * study, the documentation and the design system site (README.md of this folder). Cropped square (256 px, WebP) with the same framing.
 * The 80 seed participants keep initials: they appear only in aggregated panels.
 */
export const PERSON_PHOTOS: Record<string, string> = {
  'p-mariana': mariana,
  'p-diego': diego,
  'p-juana': juana,
  'p-kevin': kevin,
  'p-julieta': julieta,
  'p-ricardo': ricardo,
  // Contexts of use (step 23): Instituto Superior Ceibo and Hornero (README.md of this folder).
  'p-lucia': lucia,
  'p-martin': martin,
  'p-bettyna': bettyna,
  'p-hector': hector,
  'p-sofia': sofia,
  'p-nicolas': nicolas,
  'p-joaquin': joaquin,
};
