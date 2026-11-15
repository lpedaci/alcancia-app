// Publishes an approved batch of guide drafts (step 27, D-276): moves its guides from
// src/data/guides-drafts.json to src/data/guides.json, without the review notes, and marks the review
// document as approved. Usage: `node scripts/guides-publish.mjs 2 2026-11-15`
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const batch = Number(process.argv[2]);
const date = process.argv[3] ?? new Date().toISOString().slice(0, 10);
const file = (p) => join(root, p);
const drafts = JSON.parse(readFileSync(file('src/data/guides-drafts.json'), 'utf8'));
const published = JSON.parse(readFileSync(file('src/data/guides.json'), 'utf8'));

const approved = drafts.guides.filter((g) => g.review?.batch === batch);
if (approved.length === 0) throw new Error(`Batch ${batch} has no drafts`);
const ids = new Set(published.guides.map((g) => g.id));
for (const g of approved) {
  if (ids.has(g.id)) throw new Error(`${g.id} is already published`);
  const { review: _review, ...guide } = g;
  published.guides.push(guide);
}
drafts.guides = drafts.guides.filter((g) => g.review?.batch !== batch);
writeFileSync(file('src/data/guides.json'), `${JSON.stringify(published, null, 1)}\n`);
writeFileSync(file('src/data/guides-drafts.json'), `${JSON.stringify(drafts, null, 1)}\n`);

const [y, m, d] = date.split('-');
const docPath = file(`docs/content-review/tanda-${batch}.md`);
const doc = readFileSync(docPath, 'utf8')
  .replace(/^(# .+)$/m, `$1\n\n> **Aprobada por Lourdes el ${d}/${m}/${y}.** Las guías pasaron a \`src/data/guides.json\` y se ven en la app. Las ampliaciones siguen pendientes de revisión del Lic. Kevin Giampieri.`)
  .replaceAll('- **Decisión de Lourdes:** ☐ Aprobada · ☐ Con cambios · ☐ No va', `- **Decisión de Lourdes:** ☑ Aprobada (${d}/${m}/${y})`);
writeFileSync(docPath, doc);
console.log(`Batch ${batch}: ${approved.length} guides published`);
