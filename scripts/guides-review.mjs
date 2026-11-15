// Writes the review document of a batch of guide drafts (step 27, D-276), so Lourdes and Lic. Kevin
// Giampieri read the guides as text, with what is validated and what is an extension.
// Usage: `node scripts/guides-review.mjs 1` → docs/content-review/tanda-1.md
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const batch = Number(process.argv[2] ?? 1);
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const { guides } = read('src/data/guides-drafts.json');
const modules = read('src/data/modules.json');
const list = guides.filter((g) => g.review?.batch === batch);
if (list.length === 0) {
  // An approved batch already left the drafts: its review document stays as the record.
  console.log(`Batch ${batch} has no drafts (already approved?): docs/content-review/tanda-${batch}.md is kept as is.`);
  process.exit(0);
}

const question = (q) => {
  const lines = [`**${q.prompt}**`, ''];
  if (q.type === 'reflection') lines.push(...q.options.map((o) => `- ${o.text}: _${q.feedback[o.id]}_`));
  if (q.type === 'single') lines.push(...q.options.map((o) => `- ${q.correctOptionIds.includes(o.id) ? '✔' : '✖'} ${o.text}: _${q.feedback[o.id]}_`));
  if (q.type === 'true_false_why') {
    lines.push(`- Respuesta: ${q.options.find((o) => o.id === q.correctOptionIds[0]).text}`);
    lines.push(...q.why.options.map((o) => `- ${o.id === q.why.correct ? '✔' : '✖'} ${o.text}`));
    lines.push(`- Correcta: _${q.feedback.correct}_`, `- Incorrecta: _${q.feedback.incorrect}_`);
  }
  if (q.type === 'numeric') lines.push(`- Respuesta: ${q.numeric.answer} (tolerancia ${q.numeric.tolerance})`, `- Correcta: _${q.feedback.correct}_`, `- Incorrecta: _${q.feedback.incorrect}_`);
  if (q.type === 'categorize') {
    for (const c of q.categorize.categories) lines.push(`- ${c.label}: ${q.categorize.items.filter((i) => i.categoryId === c.id).map((i) => i.text).join(', ')}`);
    lines.push(`- Correcta: _${q.feedback.correct}_`, `- Incorrecta: _${q.feedback.incorrect}_`);
  }
  return lines;
};

const out = [
  `# Tanda ${batch} del paso 27: guías para revisar`,
  '',
  '> Borradores de `src/data/guides-drafts.json`, generados con `node scripts/guides-review.mjs ' + batch + '`. **No se muestran en la app** hasta que Lourdes los apruebe; las ampliaciones quedan marcadas para el Lic. Kevin Giampieri (D-276).',
  '',
  'Cómo revisar: marca en cada guía "Aprobada", "Con cambios" (y cuáles) o "No va". Lo validado viene del taller o de la presentación y no cambia datos; las ampliaciones son lo nuevo.',
  '',
];
for (const g of list) {
  const m = modules.find((x) => x.id === g.moduleId);
  out.push(`## Módulo ${m.order} · ${m.title}: "${g.title}" (${g.minutes} min)`, '');
  out.push(`- **Id:** \`${g.id}\` · **Fuentes:** ${g.sourceIds.join(', ')}`);
  out.push(`- **Validado (sin cambiar datos):** ${g.review.validated.join('; ') || 'nada'}`);
  out.push(`- **Ampliación, pendiente del Lic. Kevin Giampieri:** ${g.review.extensions.join('; ') || 'nada'}`);
  out.push('- **Decisión de Lourdes:** ☐ Aprobada · ☐ Con cambios · ☐ No va', '');
  for (const b of g.blocks) {
    if (b.type === 'hook') out.push('**Situación:** ' + b.body, '');
    if (b.type === 'objective') out.push('**Objetivo:** ' + b.body, '');
    if (b.type === 'recall') out.push('**Para empezar**', '', ...question(b.question), '');
    if (b.type === 'text') out.push(`### ${b.title}`, '', b.body, '');
    if (b.type === 'example') out.push(`### ${b.title}`, '', ...b.steps.map((s, i) => `${i + 1}. ${s}`), '');
    if (b.type === 'practice') out.push('**Práctica**', '', ...question(b.question), '');
    if (b.type === 'takeaway') out.push('**' + b.body.replace(/^Para tu vida:/, 'Para tu vida:**'), '');
  }
  out.push('---', '');
}
mkdirSync(join(root, 'docs/content-review'), { recursive: true });
writeFileSync(join(root, `docs/content-review/tanda-${batch}.md`), out.join('\n'));
console.log(`docs/content-review/tanda-${batch}.md: ${list.length} guides`);
