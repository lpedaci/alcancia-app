// Generates the shared demo data of Andina Servicios S.A. (CLAUDE.md 7, "Datos semilla").
// Deterministic: a seeded PRNG gives the same file every time, so panels and tests are stable.
// Usage: `npm run seed`. Output: src/data/seed.json and src/data/demo-states.json.
//
// Privacy by design: this file holds LEARNING data only. No balances, movements, goals, habit
// answers, reflections or level lock states: those live in each participant's browser (D-58, D-62).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const levels = read('src/data/levels.json');
const modules = read('src/data/modules.json');

// ---------- Deterministic helpers ----------
let state = 20261116;
function rand() {
  // mulberry32
  state |= 0;
  state = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(state ^ (state >>> 15), 1 | state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = (list) => list[Math.floor(rand() * list.length)];
const between = (min, max) => min + Math.floor(rand() * (max - min + 1));
const round2 = (n) => Math.round(n * 100) / 100;
const DAY = 86400000;
const PROGRAM_START = Date.UTC(2026, 7, 3); // 03/08/2026 (D-60)
const DEMO_TODAY = Date.UTC(2026, 10, 16); // 16/11/2026 (D-60)
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);
const isoTime = (ms, hour = 10) => new Date(ms + hour * 3600000).toISOString();
const dateBetween = (from, to) => from + Math.floor(rand() * Math.max(1, (to - from) / DAY)) * DAY;

const slug = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z]+/g, '.')
    .replace(/^\.|\.$/g, '');

// ---------- Organization and program ----------
const organization = { id: 'org-andina', name: 'Andina Servicios S.A.', privacyThreshold: 5 };

const phaseAModules = modules.filter((m) => m.phase === 'A').map((m) => m.id);
const program = {
  id: 'program-2026',
  orgId: organization.id,
  name: 'Bienestar financiero 2026',
  description:
    'Programa de bienestar financiero de Andina Servicios: una billetera de práctica donde cada persona aprende a cobrar, presupuestar, ahorrar, endeudarse con criterio e invertir, con dinero ficticio.',
  mode: 'assigned',
  startDate: iso(PROGRAM_START),
  moduleIds: phaseAModules,
  requiredModuleIds: ['module-01', 'module-03', 'module-04', 'module-06', 'module-09'],
  passingScore: 0.7,
  maxAttempts: 3,
  reminderChannels: ['email', 'teams'],
  freeMode: false,
};

// ---------- People ----------
const FIRST = [
  'Agustina', 'Alejandro', 'Ana', 'Bruno', 'Camila', 'Carlos', 'Carolina', 'Cecilia', 'Claudio', 'Daniela',
  'Emiliano', 'Esteban', 'Fernanda', 'Florencia', 'Franco', 'Gabriel', 'Gabriela', 'Gonzalo', 'Graciela',
  'Hernán', 'Ignacio', 'Javier', 'Jimena', 'Jorge', 'José', 'Juan', 'Julián', 'Laura', 'Leandro', 'Lorena',
  'Lucas', 'Luciana', 'Marcela', 'Marcos', 'Martina', 'Matías', 'Mauro', 'Micaela', 'Natalia', 'Nicolás',
  'Noelia', 'Pablo', 'Patricia', 'Rocío', 'Rodrigo', 'Romina', 'Sebastián', 'Silvana', 'Silvina', 'Tomás',
  'Valeria', 'Verónica', 'Walter', 'Ximena', 'Yamila',
];
const LAST = [
  'Acosta', 'Aguirre', 'Álvarez', 'Benítez', 'Cabrera', 'Castro', 'Córdoba', 'Díaz', 'Domínguez', 'Escobar',
  'Fernández', 'Flores', 'Franco', 'Giménez', 'Godoy', 'Gutiérrez', 'Herrera', 'Ibáñez', 'Juárez', 'Ledesma',
  'Luna', 'Maldonado', 'Medina', 'Méndez', 'Miranda', 'Molina', 'Morales', 'Moreno', 'Núñez', 'Ojeda',
  'Ortiz', 'Paz', 'Peralta', 'Ponce', 'Quiroga', 'Ramírez', 'Ríos', 'Rojas', 'Romero', 'Ruiz', 'Sánchez',
  'Sosa', 'Toledo', 'Torres', 'Vega', 'Vera', 'Villalba', 'Zárate',
];

const usedNames = new Set(['Paula Gómez', 'Kevin Giovanni', 'Mariana López', 'Diego Suárez', 'Ricardo Benítez']);
function newName() {
  for (;;) {
    const name = `${pick(FIRST)} ${pick(LAST)}`;
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return name;
    }
  }
}

const COHORTS = [
  {
    id: 'cohort-operations',
    name: 'Operaciones · Centro de distribución y oficina',
    area: 'operations',
    size: 32,
    activeRate: 0.72,
    mobileRate: 0.8,
    jobs: ['Operario de depósito', 'Operaria de depósito', 'Auxiliar de logística', 'Supervisor de turno', 'Analista de Operaciones'],
    dueDate: '2026-12-18',
  },
  {
    id: 'cohort-administration',
    name: 'Administración',
    area: 'administration',
    size: 20,
    activeRate: 0.9,
    mobileRate: 0.15,
    jobs: ['Analista contable', 'Asistente administrativa', 'Analista de compras', 'Tesorería'],
    dueDate: '2026-12-18',
  },
  {
    id: 'cohort-technology',
    name: 'Tecnología',
    area: 'technology',
    size: 24,
    activeRate: 0.95,
    mobileRate: 0.1,
    jobs: ['Desarrollador', 'Desarrolladora', 'Analista de soporte', 'Analista de datos'],
    dueDate: '2026-12-18',
  },
  {
    // Fewer than 5 people on purpose: shows the privacy threshold (CLAUDE.md 7).
    id: 'cohort-commercial',
    name: 'Comercial',
    area: 'commercial',
    size: 4,
    activeRate: 1,
    mobileRate: 0.5,
    jobs: ['Ejecutivo de cuentas', 'Ejecutiva comercial'],
    dueDate: '2026-12-18',
  },
];

const staff = [
  { id: 'p-paula', role: 'ld_admin', name: 'Paula Gómez', jobOrProgram: 'Líder de Aprendizaje y Beneficios', area: 'administration', cohortIds: [], device: 'desktop' },
  { id: 'p-kevin', role: 'tutor', name: 'Kevin Giovanni', jobOrProgram: 'Tutor de bienestar financiero', area: 'administration', cohortIds: COHORTS.map((c) => c.id), device: 'desktop' },
  { id: 'p-ricardo', role: 'sponsor', name: 'Ricardo Benítez', jobOrProgram: 'Gerente de Compensaciones', area: 'administration', cohortIds: [], device: 'desktop' },
].map((p) => ({
  ...p,
  orgId: organization.id,
  email: `${slug(p.name)}@andina.demo`,
  status: 'active',
  invitedAt: iso(PROGRAM_START - 14 * DAY),
  activatedAt: iso(PROGRAM_START - 10 * DAY),
}));

const cohorts = COHORTS.map((c) => ({
  id: c.id,
  orgId: organization.id,
  name: c.name,
  tutorId: 'p-kevin',
  area: c.area,
  moduleIds: phaseAModules,
  startDate: iso(PROGRAM_START),
  dueDate: c.dueDate,
}));

const participants = [];
for (const c of COHORTS) {
  for (let i = 0; i < c.size; i += 1) {
    let name;
    let id;
    let job;
    let device;
    let forced;
    if (c.id === 'cohort-operations' && i === 0) {
      name = 'Mariana López';
      id = 'p-mariana';
      job = 'Analista de Operaciones';
      device = 'desktop';
      forced = 'active';
    } else if (c.id === 'cohort-operations' && i === 1) {
      name = 'Diego Suárez';
      id = 'p-diego';
      job = 'Operario de depósito';
      device = 'mobile';
      forced = 'active';
    } else {
      name = newName();
      id = `p-${slug(name).replace(/\./g, '-')}`;
      job = pick(c.jobs);
      device = rand() < c.mobileRate ? 'mobile' : 'desktop';
    }
    const status = forced ?? (rand() < c.activeRate ? 'active' : rand() < 0.85 ? 'invited' : 'inactive');
    const invitedAt = PROGRAM_START - between(3, 10) * DAY;
    participants.push({
      id,
      orgId: organization.id,
      role: 'participant',
      name,
      email: `${slug(name)}@andina.demo`,
      jobOrProgram: job,
      area: c.area,
      cohortIds: [c.id],
      status,
      device,
      invitedAt: iso(invitedAt),
      ...(status === 'active' ? { activatedAt: iso(dateBetween(PROGRAM_START, PROGRAM_START + 40 * DAY)) } : {}),
    });
  }
}

// ---------- Learning progress ----------
const levelsA = levels.filter((l) => l.phase === 'A');
const guideLevels = levelsA.filter((l) => l.order >= 1);
const DIMENSIONS = ['budget', 'savings', 'debt', 'inflation_rates', 'goals'];

/** How far each person got: index of the current level (1..7). Office areas go further. */
function reachedLevel(p) {
  if (p.id === 'p-diego') return 2;
  if (p.id === 'p-mariana') return 6;
  const base = { operations: 2.4, administration: 3.6, technology: 4.4, commercial: 3.2 }[p.area];
  return Math.max(1, Math.min(7, Math.round(base + (rand() - 0.5) * 4)));
}

const guideProgress = [];
const challengeAttempts = [];
const missionCompletions = [];
const diagnostics = [];
const followUps = [];
const levelLearning = [];
const unlockRecords = [];

const missionDay = (activatedMs, levelOrder) => activatedMs + (levelOrder * 9 + between(0, 6)) * DAY;

for (const p of participants.filter((x) => x.status !== 'invited')) {
  const activated = Date.parse(p.activatedAt ?? iso(PROGRAM_START + 20 * DAY));
  const current = reachedLevel(p);
  // Inactive people stopped early.
  const reached = p.status === 'inactive' ? Math.min(current, 2) : current;
  const strength = 0.55 + rand() * 0.4; // how well the person does, 0.55 to 0.95

  // Conocerte: knowledge part only (D-62).
  const initialScores = Object.fromEntries(DIMENSIONS.map((d) => [d, round2(Math.min(1, Math.max(0, strength - 0.25 + (rand() - 0.5) * 0.3)))]));
  diagnostics.push({ personId: p.id, kind: 'initial', takenAt: iso(activated), scores: initialScores });
  if (reached >= 6 && p.id !== 'p-mariana' && rand() < 0.6) {
    const finalScores = Object.fromEntries(
      DIMENSIONS.map((d) => [d, round2(Math.min(1, initialScores[d] + 0.15 + rand() * 0.2))]),
    );
    diagnostics.push({ personId: p.id, kind: 'final', takenAt: iso(Math.min(DEMO_TODAY - DAY, activated + 85 * DAY)), scores: finalScores });
  }

  // Mission of level 0 (security) for everyone who opened the account.
  missionCompletions.push({ personId: p.id, missionId: 'mission-security', attempts: 1, completedAt: iso(activated) });

  for (const level of guideLevels) {
    const finished = level.order < reached || (p.id === 'p-mariana' && level.order === 6);
    const inProgress = level.order === reached && !finished;
    if (!finished && !inProgress) continue;
    const day = Math.min(DEMO_TODAY - DAY, missionDay(activated, level.order));
    const guidesTotal = level.guideModuleIds.length;
    const guidesRead = finished ? guidesTotal : p.id === 'p-diego' ? 1 : between(0, guidesTotal);

    level.guideModuleIds.forEach((moduleId, index) => {
      if (index >= guidesRead) return;
      guideProgress.push({
        personId: p.id,
        moduleId,
        guideIdsDone: [`${moduleId}-guide-1`],
        ...(rand() < 0.7 ? { satisfaction: Math.max(2, Math.min(5, Math.round(3.4 + strength * 1.6 + (rand() - 0.5) * 1.5))) } : {}),
        completedAt: iso(day - between(1, 4) * DAY),
      });
    });

    let challenge = 'not_started';
    let attempts = 0;
    let firstScore;
    let bestScore;
    if (finished && level.challengeId) {
      attempts = rand() < 0.75 ? 1 : 2;
      for (let n = 1; n <= attempts; n += 1) {
        const passedThis = n === attempts;
        const score = passedThis ? round2(0.7 + rand() * 0.3) : round2(0.4 + rand() * 0.29);
        const moduleScores = Object.fromEntries(level.guideModuleIds.map((m) => [m, round2(Math.min(1, Math.max(0, score + (rand() - 0.5) * 0.2)))]));
        challengeAttempts.push({
          personId: p.id,
          challengeId: level.challengeId,
          number: n,
          score,
          moduleScores,
          startedAt: isoTime(day - (attempts - n) * DAY, 9),
          finishedAt: isoTime(day - (attempts - n) * DAY, 10),
        });
        if (n === 1) firstScore = score;
        bestScore = Math.max(bestScore ?? 0, score);
      }
      challenge = 'passed';
    } else if (inProgress && level.challengeId && guidesRead === guidesTotal && rand() < 0.5) {
      // Some people are trying the challenge of their current level.
      attempts = rand() < 0.15 ? 3 : 1;
      for (let n = 1; n <= attempts; n += 1) {
        const score = round2(0.35 + rand() * 0.34);
        challengeAttempts.push({
          personId: p.id,
          challengeId: level.challengeId,
          number: n,
          score,
          moduleScores: Object.fromEntries(level.guideModuleIds.map((m) => [m, score])),
          startedAt: isoTime(day + n * DAY, 9),
          finishedAt: isoTime(day + n * DAY, 10),
        });
        if (n === 1) firstScore = score;
        bestScore = Math.max(bestScore ?? 0, score);
      }
      challenge = attempts >= program.maxAttempts ? 'attempts_exhausted' : 'in_progress';
    }

    if (finished) {
      for (const missionId of level.missionIds) {
        if (rand() < 0.85 || missionId === 'mission-1') {
          missionCompletions.push({ personId: p.id, missionId, attempts: rand() < 0.7 ? 1 : 2, completedAt: iso(day - DAY) });
        }
      }
    }

    levelLearning.push({
      personId: p.id,
      levelId: level.id,
      guidesRead,
      guidesTotal,
      challenge,
      ...(firstScore !== undefined ? { firstScore, bestScore } : {}),
      attempts,
      completed: finished && challenge === 'passed',
    });
  }

  if (reached >= 5 && rand() < 0.55) {
    followUps.push({
      personId: p.id,
      answeredAt: iso(Math.min(DEMO_TODAY - DAY, activated + 60 * DAY)),
      applied: { budget: rand() < 0.75, emergencyFund: rand() < 0.55, fullCardPayment: rand() < 0.45 },
    });
  }
}

// A tutor enabled a level for one person with intentos agotados, with a reason (5.0).
const exhausted = levelLearning.find((l) => l.challenge === 'attempts_exhausted');
if (exhausted) {
  const levelOrder = Number(exhausted.levelId.split('-')[1]);
  const next = `level-${levelOrder + 1}`;
  unlockRecords.push({
    id: 'unlock-1',
    levelId: next,
    target: { kind: 'person', personId: exhausted.personId },
    tutorId: 'p-kevin',
    reason: 'Agotó los intentos y repasamos juntos los temas en el encuentro del 05/11/2026.',
    at: '2026-11-06T15:00:00.000Z',
  });
  exhausted.enabledBy = undefined;
}

// ---------- Weekly challenges ----------
const WEEKLY = [
  ['Registra tus gastos durante 7 días', '2026-09-07', '2026-09-14'],
  ['Calcula el CFT de tu tarjeta con el resumen de este mes', '2026-10-05', '2026-10-12'],
  ['Separa el 10 % de tu próximo cobro antes de gastar', '2026-11-09', '2026-11-23'],
];
const weeklyChallenges = [];
const weeklyReports = [];
for (const c of cohorts) {
  WEEKLY.forEach(([title, assignedAt, dueDate], index) => {
    const id = `weekly-${c.area}-${index + 1}`;
    weeklyChallenges.push({ id, cohortId: c.id, title, assignedAt, dueDate });
    for (const p of participants.filter((x) => x.cohortIds.includes(c.id) && x.status === 'active')) {
      const open = Date.parse(dueDate) > DEMO_TODAY;
      // Demo states (CLAUDE.md 7): Diego did one weekly challenge, Mariana has one pending.
      if (p.id === 'p-diego') {
        if (index === 0) weeklyReports.push({ challengeId: id, personId: p.id, result: 'done', reportedAt: '2026-09-12' });
        continue;
      }
      if (p.id === 'p-mariana') {
        if (!open) weeklyReports.push({ challengeId: id, personId: p.id, result: 'done', reportedAt: iso(Date.parse(dueDate) - DAY) });
        continue;
      }
      const reportRate = open ? 0.35 : 0.75;
      if (rand() < reportRate) {
        const r = rand();
        weeklyReports.push({
          challengeId: id,
          personId: p.id,
          result: r < 0.6 ? 'done' : r < 0.85 ? 'partial' : 'not_done',
          reportedAt: iso(Math.min(DEMO_TODAY - DAY, Date.parse(dueDate) - between(0, 5) * DAY)),
        });
      }
    }
  });
}

// ---------- Questions to the tutor (no amounts, F6) ----------
const QUESTIONS = [
  ['module-01', '¿Por qué la suma no remunerativa no tiene descuento de jubilación?', '¡Buena pregunta! Las sumas no remunerativas no forman parte de la base de aportes: por eso el 11 % se calcula solo sobre lo remunerativo. Lo vemos en el encuentro del jueves.'],
  ['module-17', '¿Cómo me doy cuenta si mi billetera tiene CVU o CBU?', 'Fíjate en los datos de la cuenta dentro de la app y en la leyenda legal del pie. En la ficha "Billeteras y fintech" de Aprender tienes el paso a paso.'],
  ['module-03', '¿La regla 50/30/20 sirve si pago alquiler?', null],
  ['module-06', 'En el resumen aparecen TNA y CFT, ¿cuál tengo que mirar para comparar?', 'El CFT: incluye la tasa, las comisiones y los cargos. Es el que te dice cuánto cuesta de verdad.'],
  ['module-10', 'No entiendo por qué la TEA es más alta que la TNA.', null],
  ['module-02', '¿La regla de las 48 horas aplica a compras chicas?', null],
];
const askers = participants.filter((p) => p.status === 'active' && p.id !== 'p-mariana' && p.id !== 'p-diego');
const tutorQuestions = QUESTIONS.map(([moduleId, text, answer], index) => {
  const p = askers[(index * 7) % askers.length];
  const askedAt = DEMO_TODAY - (20 - index * 3) * DAY;
  return {
    id: `question-${index + 1}`,
    personId: p.id,
    cohortId: p.cohortIds[0],
    moduleId,
    text,
    askedAt: isoTime(askedAt, 11),
    ...(answer ? { answer: { text: answer, answeredAt: isoTime(askedAt + DAY, 16) } } : {}),
  };
});

// ---------- Item responses for the tutor's item statistics (T4) ----------
// A second PRNG, so adding this block does not change any value generated above. Each attempt draws
// its questions from the banks of its level (D-57) and answers each one right with the probability
// of its module score, shifted by a fixed difficulty per question; a wrong single-choice answer
// picks one of the wrong options. Only learning data: what was answered, never money (D-58).
const banks = read('src/data/question-banks.json').questions;
const challengeDefs = read('src/data/challenges.json').challenges;
let itemState = 20261117;
function itemRand() {
  itemState |= 0;
  itemState = (itemState + 0x6d2b79f5) | 0;
  let t = Math.imul(itemState ^ (itemState >>> 15), 1 | itemState);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const difficulty = (id) => {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return ((Math.abs(h) % 100) / 100) * 0.4 - 0.25; // from -0.25 (hard) to +0.15 (easy)
};
const itemResponses = [];
for (const attempt of challengeAttempts) {
  const def = challengeDefs.find((c) => c.id === attempt.challengeId);
  if (!def) continue;
  for (const [moduleId, count] of Object.entries(def.questionsPerModule)) {
    const bank = banks.filter((q) => q.moduleId === moduleId);
    const chosen = [...bank].sort(() => itemRand() - 0.5).slice(0, count);
    for (const q of chosen) {
      const p = Math.min(0.98, Math.max(0.05, (attempt.moduleScores[moduleId] ?? attempt.score) + difficulty(q.id)));
      const correct = itemRand() < p;
      const response = { personId: attempt.personId, challengeId: attempt.challengeId, questionId: q.id, correct };
      if (q.type === 'single' || q.type === 'true_false_why') {
        const wrong = q.options.filter((o) => !q.correctOptionIds.includes(o.id)).map((o) => o.id);
        response.optionIds = correct ? q.correctOptionIds : [wrong[Math.floor(itemRand() * wrong.length)]];
      }
      itemResponses.push(response);
    }
  }
}

const seed = {
  generatedFor: iso(DEMO_TODAY),
  note: 'Learning data only. Wallet data, habit answers, reflections and level lock states never leave the participant browser (D-58, D-62).',
  organization,
  program,
  cohorts,
  people: [...staff, ...participants],
  diagnostics,
  guideProgress,
  challengeAttempts,
  itemResponses,
  levelLearning,
  unlockRecords,
  missionCompletions,
  weeklyChallenges,
  weeklyReports,
  followUps,
  tutorQuestions,
};
writeFileSync(join(root, 'src/data/seed.json'), `${JSON.stringify(seed, null, 1)}\n`);

// ---------- Demo states of the two participants (local to their browser, 5.0 demo mode) ----------
const lockStates = (personId, current) =>
  levelsA.map((l) => ({
    personId,
    levelId: l.id,
    status: l.order < current ? 'completed' : l.order === current ? 'unlocked' : 'locked',
    ...(l.order <= current ? { unlockedBy: 'rule' } : {}),
  }));
const demoStates = {
  note: 'Local to each participant (5.0 demo mode). The wallet part is generated by the wallet engine in step 6.',
  'p-diego': { currentLevelId: 'level-2', levelProgress: lockStates('p-diego', 2) },
  'p-mariana': {
    currentLevelId: 'level-6',
    // Level 6 challenge passed; Invertir stays locked by the wallet: emergency fund at 2 of 3 months.
    levelProgress: lockStates('p-mariana', 6).map((l) => (l.levelId === 'level-6' ? { ...l, status: 'completed' } : l)),
  },
};
writeFileSync(join(root, 'src/data/demo-states.json'), `${JSON.stringify(demoStates, null, 1)}\n`);

const count = (list) => list.length;
console.log(
  `Seed: ${count(participants)} participants, ${count(cohorts)} cohorts, ${count(guideProgress)} guides, ` +
    `${count(challengeAttempts)} attempts, ${count(missionCompletions)} missions, ${count(weeklyReports)} weekly reports.`,
);
