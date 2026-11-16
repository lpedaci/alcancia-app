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

// The date as AAAA-MM-DD or DD/MM/AAAA; anything else stops the script before writing a broken date
const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
const local = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date);
if (!iso && !local) throw new Error(`Date must be AAAA-MM-DD or DD/MM/AAAA, got "${date}"`);
const [y, m, d] = iso ? [iso[1], iso[2], iso[3]] : [local[3], local[2], local[1]];
const approved = drafts.guides.filter((g) => g.review?.batch === batch);
const approvedQuestions = (drafts.questions ?? []).filter((q) => q.review?.batch === batch);
if (approved.length === 0 && approvedQuestions.length === 0) throw new Error(`Batch ${batch} has no drafts`);
const ids = new Set(published.guides.map((g) => g.id));
for (const g of approved) {
  if (ids.has(g.id)) throw new Error(`${g.id} is already published`);
  const { review: _review, ...guide } = g;
  published.guides.push(guide);
}
drafts.guides = drafts.guides.filter((g) => g.review?.batch !== batch);
if (approvedQuestions.length > 0) {
  const banks = JSON.parse(readFileSync(file('src/data/question-banks.json'), 'utf8'));
  const known = new Set(banks.questions.map((q) => q.id));
  for (const q of approvedQuestions) {
    if (known.has(q.id)) throw new Error(`${q.id} is already in the banks`);
    const { review: _review, ...question } = q;
    banks.questions.push(question);
  }
  drafts.questions = drafts.questions.filter((q) => q.review?.batch !== batch);
  writeFileSync(file('src/data/question-banks.json'), `${JSON.stringify(banks, null, 2)}\n`);
}
writeFileSync(file('src/data/guides.json'), `${JSON.stringify(published, null, 1)}\n`);
writeFileSync(file('src/data/guides-drafts.json'), `${JSON.stringify(drafts, null, 1)}\n`);

const docPath = file(`docs/content-review/tanda-${batch}.md`);
const doc = readFileSync(docPath, 'utf8')
  .replace(/^(# .+)$/m, `$1\n\n> **Aprobada por Lourdes el ${d}/${m}/${y}.** Las guías pasaron a \`src/data/guides.json\` y se ven en la app. Las ampliaciones siguen pendientes de revisión del Lic. Kevin Giampieri.`)
  .replaceAll('- **Decisión de Lourdes:** ☐ Aprobada · ☐ Con cambios · ☐ No va', `- **Decisión de Lourdes:** ☑ Aprobada (${d}/${m}/${y})`);
writeFileSync(docPath, doc);
console.log(`Batch ${batch}: ${approved.length} guides and ${approvedQuestions.length} bank questions published`);
