import { REPO_URL } from './links';
import { sourceById } from './sources';

/**
 * What each source code of the content means (CLAUDE.md 1.1, docs/content.md), so "Fuentes" shows
 * full names and never bare codes: T is Lourdes's workshop, A-xx a slide of Lic. Kevin Giampieri's
 * presentation (Annex A), B-xx an official source (Annex B) and F-xx a hand-checked case of
 * docs/formulas.md.
 */
export const WORKSHOP_URL = 'https://lpedaci.github.io/taller-primerempleo/';
export const FORMULAS_URL = `${REPO_URL}/blob/main/docs/formulas.md`;
/** Date of Annex B, for official data whose document has no link of its own in sources.ts. */
const ANNEX_B_VERIFIED = '2026-11-11';

/** Annex B code → official source of sources.ts, or a name when the document has no public link of its own. */
const OFFICIAL: Record<string, string | { name: string }> = {
  'B-01': 'bcra-a8407',
  'B-02': { name: 'BCRA, normas "Depósitos e inversiones a plazo"' },
  'B-03': { name: 'BCRA, Comunicación "A" 8246: plazo fijo UVA' },
  'B-04': 'bcra-tasas',
  'B-05': 'ley-25065',
  'B-06': 'gob-usuarios-financieros',
  'B-10': 'bcra-a6885',
  'B-11': { name: 'BCRA, Comunicación "A" 6859: fondos de las cuentas de pago' },
  'B-12': 'bcra-a6885',
  'B-13': { name: 'BCRA, Comunicación "A" 7825: remuneración de las cuentas de pago' },
  'B-14': 'gob-fci',
  'B-15': 'bcra-transferencias',
  'B-16': 'bcra-transferencias',
  'B-17': 'bcra-pagos-minoristas',
  'B-18': { name: 'BCRA, Comunicación "A" 7759: cuentas de pago y criptoactivos' },
  'B-19': 'bcra-registro-psp',
  'B-20': 'gob-agentes',
  'B-21': 'cnv-agentes',
  'B-22': 'gob-agentes',
  'B-23': 'gob-agentes',
  'B-24': 'cnv-alertas',
  'B-25': 'gob-fci',
  'B-26': 'gob-fci',
  'B-27': 'cnv-psav',
  'B-30': 'byma-cedears',
  'B-31': 'byma-cedears',
  'B-32': 'byma-cedears',
  'B-33': 'cajval-cedears',
  'B-34': 'byma-cedears',
  'B-35': 'byma-horarios',
  'B-36': 'byma-cedears',
  'B-40': 'indec',
};

export interface ContentSource {
  key: string;
  kind: 'workshop' | 'presentation' | 'official' | 'formula';
  name: string;
  /** Short label for the compact chips: "Taller", "BCRA", "Cálculo F-14". */
  short: string;
  url?: string;
  /** ISO date when the official data was checked. */
  verifiedAt?: string;
}

/**
 * Turns a list of codes into the sources to show, in a fixed order (workshop, presentation, official,
 * formulas), joining the slides of the presentation in one entry and repeated official documents.
 */
export function describeSources(codes: string[]): ContentSource[] {
  const unique = [...new Set(codes)];
  const out: ContentSource[] = [];
  if (unique.includes('T')) {
    out.push({ key: 'T', kind: 'workshop', name: 'Taller "Del aula al primer trabajo", de Lourdes Pedaci', short: 'Taller', url: WORKSHOP_URL });
  }
  const slides = unique.filter((c) => c.startsWith('A-')).map((c) => Number(c.slice(2)));
  if (slides.length > 0) {
    const list = slides.sort((a, b) => a - b).join(', ');
    out.push({
      key: 'A',
      kind: 'presentation',
      name: `Presentación "Educación financiera: transformá tu relación con el dinero", del Lic. Kevin Giampieri (${slides.length === 1 ? 'diapositiva' : 'diapositivas'} ${list})`,
      short: 'Presentación del taller',
    });
  }
  const seen = new Set<string>();
  for (const code of unique.filter((c) => c.startsWith('B-'))) {
    const entry = OFFICIAL[code];
    if (!entry) continue;
    if (typeof entry === 'string') {
      const source = sourceById(entry);
      if (!source || seen.has(entry)) continue;
      seen.add(entry);
      out.push({ key: entry, kind: 'official', name: source.name, short: shortName(source.name), url: source.url, verifiedAt: source.verifiedAt });
    } else if (!seen.has(entry.name)) {
      seen.add(entry.name);
      out.push({ key: code, kind: 'official', name: entry.name, short: shortName(entry.name), verifiedAt: ANNEX_B_VERIFIED });
    }
  }
  const cases = unique.filter((c) => c.startsWith('F-'));
  if (cases.length > 0) {
    out.push({
      key: 'F',
      kind: 'formula',
      name: `Cálculo verificado a mano: ${cases.length === 1 ? 'caso' : 'casos'} ${cases.join(', ')} de las fórmulas del proyecto`,
      short: `Cálculo ${cases.join(', ')}`,
      url: FORMULAS_URL,
    });
  }
  return out;
}

/** The organism of an official source, for its chip: "BCRA", "CNV", "argentina.gob.ar", "Ley 25.065". */
function shortName(name: string): string {
  const law = /^Ley [\d.]+/.exec(name);
  if (law) return law[0];
  return name.split(/[,:]/)[0]!.trim();
}

/** Every official source with its full name, link and date, for the Fuentes page. */
export function allOfficialSources(): ContentSource[] {
  return describeSources(Object.keys(OFFICIAL));
}

/** Every code used in content must be known here (checked by a test). */
export const isKnownSourceCode = (code: string) => code === 'T' || /^A-\d+$/.test(code) || /^F-\d+$/.test(code) || code in OFFICIAL;
