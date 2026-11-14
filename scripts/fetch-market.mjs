#!/usr/bin/env node
/**
 * Real market values for the starting point of the scenarios (CLAUDE.md 5.6, D-79). Step 20:
 * a local test only, not connected to the interface. Phase B runs it once a day in GitHub Actions.
 *
 * It reads the BCRA monetary statistics API v4.0 (public, no key), validates every answer with Zod
 * and writes a snapshot with each value, its date and its source. If a variable fails, it keeps the
 * last valid value with its original date (marked `stale`), or leaves it out so the app falls back
 * to the example scenario and says so. The build never breaks because of a source.
 *
 * Usage: node scripts/fetch-market.mjs [output path]   (default: public/market/snapshot.json)
 *        npm run market -- [output path]
 * Documentation: docs/market-data.md
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import Decimal from 'decimal.js';
import { z } from 'zod';

// BCRA_API only exists to test the fallback locally (a wrong host simulates a source that fails).
const API = process.env.BCRA_API ?? 'https://api.bcra.gob.ar/estadisticas/v4.0/monetarias';
const OUTPUT = process.argv[2] ?? 'public/market/snapshot.json';
const TIMEOUT_MS = 20_000;
const ATTEMPTS = 2;

/**
 * Variables of 5.6, with the identifier verified in the API on 14/11/2026 (docs/market-data.md).
 * `percent` values are stored as fractions (CLAUDE.md 3: rates as 0.03), as decimal text.
 */
const VARIABLES = [
  { id: 'term-deposit-30d', idVariable: 12, label: 'Tasa de depósitos a 30 días (TNA)', unit: 'percent', sourceId: 'bcra-api', maxAgeDays: 10 },
  { id: 'term-deposit-people', idVariable: 1190, label: 'Tasa de plazo fijo en pesos de personas humanas (TNA)', unit: 'percent', sourceId: 'bcra-api', maxAgeDays: 10 },
  { id: 'term-deposit-uva', idVariable: 1227, label: 'Tasa adicional del plazo fijo UVA (TNA)', unit: 'percent', sourceId: 'bcra-api', maxAgeDays: 10 },
  { id: 'badlar', idVariable: 7, label: 'Tasa BADLAR de bancos privados (TNA)', unit: 'percent', sourceId: 'bcra-api', maxAgeDays: 10 },
  { id: 'personal-loans', idVariable: 14, label: 'Tasa de préstamos personales (TNA)', unit: 'percent', sourceId: 'bcra-api', maxAgeDays: 10 },
  { id: 'uva', idVariable: 31, label: 'Unidad de valor adquisitivo (UVA)', unit: 'ARS', sourceId: 'bcra-api', maxAgeDays: 10 },
  { id: 'cer', idVariable: 30, label: 'Coeficiente de estabilización de referencia (CER)', unit: 'index', sourceId: 'bcra-api', maxAgeDays: 10 },
  { id: 'fx-wholesale', idVariable: 5, label: 'Tipo de cambio mayorista de referencia', unit: 'ARS', sourceId: 'bcra-api', maxAgeDays: 10 },
  { id: 'fx-retail', idVariable: 4, label: 'Tipo de cambio minorista (promedio vendedor)', unit: 'ARS', sourceId: 'bcra-api', maxAgeDays: 10 },
  { id: 'inflation-monthly', idVariable: 27, label: 'Inflación mensual (IPC, INDEC)', unit: 'percent', sourceId: 'indec-via-bcra', maxAgeDays: 70 },
  { id: 'inflation-yearly', idVariable: 28, label: 'Inflación interanual (IPC, INDEC)', unit: 'percent', sourceId: 'indec-via-bcra', maxAgeDays: 70 },
];

const ISO_DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** The API answer for one variable (GET /monetarias/{id}?limit=1): the latest value first. */
const SeriesAnswer = z.object({
  status: z.literal(200),
  results: z
    .array(
      z.object({
        idVariable: z.number().int(),
        detalle: z.array(z.object({ fecha: ISO_DATE, valor: z.number().finite() })).min(1),
      }),
    )
    .length(1),
});

/** One value of the snapshot (MarketValue of CLAUDE.md 7, plus `stale`). */
const MarketValue = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string().regex(/^-?\d+(\.\d+)?$/),
  unit: z.enum(['percent', 'ARS', 'index']),
  date: ISO_DATE,
  sourceId: z.string(),
  stale: z.boolean().optional(),
});

const Snapshot = z.object({
  generatedAt: z.string(),
  values: z.array(MarketValue),
  missing: z.array(z.string()),
  note: z.string(),
});

/** Plausible ranges, to catch a wrong identifier or unit before it reaches the app. */
const RANGE = {
  percent: [-0.5, 10], // as a fraction: from -50 % to 1000 %
  ARS: [0.0001, 1e7],
  index: [0.0001, 1e7],
};

async function fetchJson(url) {
  let lastError;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function readPrevious() {
  try {
    return Snapshot.parse(JSON.parse(await readFile(OUTPUT, 'utf8')));
  } catch {
    return null;
  }
}

const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

async function fetchVariable(v, today) {
  // `hasta` = today: the BCRA publishes UVA and CER ahead (up to the 15th of next month), and the
  // starting point must be today's value, never a future one.
  const answer = SeriesAnswer.parse(await fetchJson(`${API}/${v.idVariable}?hasta=${today}&limit=1`));
  const result = answer.results[0];
  if (result.idVariable !== v.idVariable) throw new Error(`answered ${result.idVariable}`);
  const { fecha, valor } = result.detalle[0];
  // The API sends numbers; decimal.js keeps the value exact from its text (CLAUDE.md 3).
  const raw = new Decimal(String(valor));
  const value = v.unit === 'percent' ? raw.div(100) : raw;
  const [min, max] = RANGE[v.unit];
  if (value.lt(min) || value.gt(max)) throw new Error(`out of range: ${value.toString()}`);
  if (fecha > today) throw new Error(`future date: ${fecha}`);
  if (daysBetween(fecha, today) > v.maxAgeDays) throw new Error(`too old: ${fecha}`);
  return MarketValue.parse({ id: v.id, label: v.label, value: value.toString(), unit: v.unit, date: fecha, sourceId: v.sourceId });
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  const previous = await readPrevious();
  const values = [];
  const missing = [];
  for (const v of VARIABLES) {
    try {
      values.push(await fetchVariable(v, today));
      console.log(`ok     ${v.id.padEnd(18)} variable ${v.idVariable}`);
    } catch (error) {
      const kept = previous?.values.find((x) => x.id === v.id);
      if (kept) {
        values.push({ ...kept, stale: true });
        console.warn(`stale  ${v.id.padEnd(18)} kept the value of ${kept.date} (${error.message})`);
      } else {
        missing.push(v.id);
        console.warn(`miss   ${v.id.padEnd(18)} falls back to the example scenario (${error.message})`);
      }
    }
  }
  const snapshot = Snapshot.parse({
    generatedAt: new Date().toISOString(),
    values,
    missing,
    note: 'Valores reales con fecha y fuente para el punto de partida; el dinero es ficticio y el futuro es un escenario (D-79).',
  });
  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`\n${values.length} values, ${missing.length} missing -> ${OUTPUT}`);
}

main().catch((error) => {
  // Never break the build because of a source (5.6).
  console.error(`fetch-market: ${error.message}`);
  process.exitCode = 0;
});
