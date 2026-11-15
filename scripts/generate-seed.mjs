// Generates the shared demo data of the three contexts of use (CLAUDE.md 7 and 5.5, D-74): Andina
// Servicios S.A. (organization), Instituto Superior Ceibo (education, 18 or older, D-83) and Hornero
// (product, fictitious partner, D-84). Deterministic: each organization has its own seeded PRNG, so
// Andina's data does not change when the other two are added, and panels and tests are stable.
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

// Names of the demo people of the new contexts, kept out of the random pool.
const DEMO_NAMES = ['Lucía Ferreyra', 'Martín Quiroga', 'Silvia Herrera', 'Héctor Ramos', 'Joaquín Paredes', 'Sofía Cabral', 'Nicolás Vidal'];

// ---------- Deterministic helpers ----------
let state = 0;
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

const usedNames = new Set(['Paula Gómez', 'Kevin Giovanni', 'Mariana López', 'Diego Suárez', 'Ricardo Benítez', ...DEMO_NAMES]);
function newName() {
  for (;;) {
    const name = `${pick(FIRST)} ${pick(LAST)}`;
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return name;
    }
  }
}

const phaseAModules = modules.filter((m) => m.phase === 'A').map((m) => m.id);
const levelsA = levels.filter((l) => l.phase === 'A');
const guideLevels = levelsA.filter((l) => l.order >= 1);
const DIMENSIONS = ['budget', 'savings', 'debt', 'inflation_rates', 'goals'];

const banks = read('src/data/question-banks.json').questions;
const challengeDefs = read('src/data/challenges.json').challenges;
let itemState = 0;
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

/** One organization's learning data. `cfg` describes its context; see the three configs below. */
function generateOrg(cfg) {
  state = cfg.seed;
  itemState = cfg.seed + 1;
  // ---------- Organization and program ----------
  const organization = cfg.organization;

  const program = {
    id: cfg.program.id,
    orgId: organization.id,
    name: cfg.program.name,
    description: cfg.program.description,
    mode: cfg.program.mode,
    startDate: iso(PROGRAM_START),
    moduleIds: phaseAModules,
    requiredModuleIds: cfg.program.requiredModuleIds,
    passingScore: 0.7,
    maxAttempts: 3,
    reminderChannels: cfg.program.reminderChannels,
    freeMode: false,
  };


  const COHORTS = cfg.cohorts;

  const staff = cfg.staff.map((p) => ({
    ...p,
    orgId: organization.id,
    email: `${slug(p.name)}@${cfg.domain}`,
    status: 'active',
    invitedAt: iso(PROGRAM_START - 14 * DAY),
    activatedAt: iso(PROGRAM_START - 10 * DAY),
  }));

  const cohorts = COHORTS.map((c) => ({
    id: c.id,
    orgId: organization.id,
    name: c.name,
    ...(cfg.tutorId ? { tutorId: cfg.tutorId } : {}),
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
      const demo = cfg.forced.find((f) => f.cohortId === c.id && f.index === i);
      if (demo) {
        ({ name, id, job, device } = demo);
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
        email: `${slug(name)}@${cfg.domain}`,
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

  /** How far each person got: index of the current level (1..7). Office areas go further. */
  function reachedLevel(p) {
    if (p.id === 'p-diego') return 2;
    if (p.id === 'p-mariana') return 6;
    const base = cfg.levelBase[p.area];
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

  // Demo people of the new contexts start their account in the demo itself: no learning data yet.
  const fresh = (p) => cfg.freshIds.includes(p.id);
  for (const p of participants.filter((x) => x.status !== 'invited' && !fresh(x))) {
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
  if (exhausted && cfg.tutorId) {
    const levelOrder = Number(exhausted.levelId.split('-')[1]);
    const next = `level-${levelOrder + 1}`;
    unlockRecords.push({
      id: `${cfg.idPrefix}unlock-1`,
      levelId: next,
      target: { kind: 'person', personId: exhausted.personId },
      tutorId: cfg.tutorId,
      reason: 'Agotó los intentos y repasamos juntos los temas en el encuentro del 05/11/2026.',
      at: '2026-11-06T15:00:00.000Z',
    });
    exhausted.enabledBy = undefined;
  }

  // ---------- Weekly challenges ----------
  const WEEKLY = cfg.weekly;
  const weeklyChallenges = [];
  const weeklyReports = [];
  for (const c of cohorts) {
    WEEKLY.forEach(([title, assignedAt, dueDate], index) => {
      const id = `weekly-${c.area}-${index + 1}`;
      weeklyChallenges.push({ id, cohortId: c.id, title, assignedAt, dueDate });
      for (const p of participants.filter((x) => x.cohortIds.includes(c.id) && x.status === 'active' && !fresh(x))) {
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
  const QUESTIONS = cfg.questions;
  const askers = participants.filter((p) => p.status === 'active' && p.id !== 'p-mariana' && p.id !== 'p-diego' && !fresh(p));
  const tutorQuestions = QUESTIONS.map(([moduleId, text, answer], index) => {
    const p = askers[(index * 7) % askers.length];
    const askedAt = DEMO_TODAY - (20 - index * 3) * DAY;
    return {
      id: `${cfg.idPrefix}question-${index + 1}`,
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

  // ---------- Final Conocerte for Kirkpatrick 2 (F7, D-62) ----------
  // Some people who completed at least 4 levels repeat Conocerte at the end (knowledge part only),
  // with the same separate PRNG, so the rest of the data does not change. Their improvement grows with
  // the levels they completed; nobody gets the same gain in every dimension.
  for (const p of participants.filter((x) => x.status === 'active' && x.id !== 'p-mariana' && x.id !== 'p-diego' && !fresh(x))) {
    if (diagnostics.some((d) => d.personId === p.id && d.kind === 'final')) continue;
    const completed = levelLearning.filter((l) => l.personId === p.id && l.completed).length;
    if (completed < 4 || itemRand() > 0.55) continue;
    const initial = diagnostics.find((d) => d.personId === p.id && d.kind === 'initial');
    if (!initial) continue;
    const scores = Object.fromEntries(
      Object.entries(initial.scores).map(([d, v]) => [d, round2(Math.min(1, v + 0.04 * completed * (0.6 + itemRand() * 0.6)))]),
    );
    diagnostics.push({ personId: p.id, kind: 'final', takenAt: iso(DEMO_TODAY - (3 + Math.floor(itemRand() * 20)) * DAY), scores });
  }


  // ---------- Collective goal (D-80) and the cohort's space (F20), step 26 ----------
  // Built after everything else and without the PRNG, so no earlier value changes.
  const collectiveGoals = (cfg.goals ?? []).map((g, i) => ({ id: `${cfg.idPrefix}goal-${i + 1}`, createdBy: cfg.tutorId, createdAt: '2026-11-02', ...g }));
  const cohortPosts = [];
  (cfg.forum ?? []).forEach((thread, ti) => {
    const pool = participants.filter((p) => p.cohortIds.includes(thread.cohortId) && p.status === 'active' && !fresh(p) && p.id !== 'p-mariana' && p.id !== 'p-diego');
    const author = (k) => pool[(ti * 5 + k * 3) % pool.length].id;
    const rootId = `${cfg.idPrefix}post-${ti + 1}`;
    cohortPosts.push({ id: rootId, cohortId: thread.cohortId, personId: author(0), anonymous: Boolean(thread.anonymous), text: thread.text, at: thread.at });
    thread.replies.forEach((r, ri) =>
      cohortPosts.push({
        id: `${rootId}-${ri + 1}`,
        cohortId: thread.cohortId,
        personId: r.tutor ? cfg.tutorId : author(ri + 1),
        anonymous: Boolean(r.anonymous),
        text: r.text,
        at: r.at,
        parentId: rootId,
        ...(r.endorsed ? { endorsed: true } : {}),
      }),
    );
  });

  return {
    collectiveGoals,
    cohortPosts,
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
}

// ---------- The three contexts of use (CLAUDE.md 5.5, D-74) ----------

/** Organization: Andina Servicios S.A. (4.1). Its PRNG seed keeps the data of every earlier step. */
const ANDINA = {
  seed: 20261116,
  idPrefix: '',
  organization: { id: 'org-andina', name: 'Andina Servicios S.A.', kind: 'employer', privacyThreshold: 5 },
  program: {
    id: 'program-2026',
    name: 'Bienestar financiero 2026',
    description:
      'Programa de bienestar financiero de Andina Servicios: una billetera de práctica donde cada persona aprende a cobrar, presupuestar, ahorrar, endeudarse con criterio e invertir, con dinero ficticio.',
    mode: 'assigned',
    requiredModuleIds: ['module-01', 'module-03', 'module-04', 'module-06', 'module-09'],
    reminderChannels: ['email', 'teams'],
  },
  domain: 'andina.demo',
  tutorId: 'p-kevin',
  cohorts: [
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
  ],
  staff: [
    { id: 'p-paula', role: 'ld_admin', name: 'Paula Gómez', jobOrProgram: 'Líder de Aprendizaje y Beneficios', area: 'administration', cohortIds: [], device: 'desktop' },
    { id: 'p-kevin', role: 'tutor', name: 'Kevin Giovanni', jobOrProgram: 'Tutor de bienestar financiero', area: 'administration', cohortIds: ['cohort-operations', 'cohort-administration', 'cohort-technology', 'cohort-commercial'], device: 'desktop' },
    { id: 'p-ricardo', role: 'sponsor', name: 'Ricardo Benítez', jobOrProgram: 'Gerente de Compensaciones', area: 'administration', cohortIds: [], device: 'desktop' },
  ],
  forced: [
    { cohortId: 'cohort-operations', index: 0, id: 'p-mariana', name: 'Mariana López', job: 'Analista de Operaciones', device: 'desktop' },
    { cohortId: 'cohort-operations', index: 1, id: 'p-diego', name: 'Diego Suárez', job: 'Operario de depósito', device: 'mobile' },
  ],
  freshIds: [],
  levelBase: { operations: 2.4, administration: 3.6, technology: 4.4, commercial: 3.2 },
  goals: [
    { cohortId: 'cohort-operations', kind: 'mission', targetId: 'mission-emergency-fund', targetShare: 0.6, dueDate: '2026-12-18' },
    { cohortId: 'cohort-technology', kind: 'level', targetId: 'level-5', targetShare: 0.7, dueDate: '2026-12-18' },
  ],
  forum: [
    {
      cohortId: 'cohort-operations',
      text: '¿Alguien armó el presupuesto con la regla 70/20/10? Me cuesta ubicar los gastos fijos.',
      at: '2026-11-10T13:05:00.000Z',
      replies: [
        { text: 'Yo empecé anotando todo durante un mes, como dice la guía. Recién ahí vi qué era fijo y qué no.', at: '2026-11-10T15:40:00.000Z' },
        { tutor: true, endorsed: true, text: 'Buen camino. La 70/20/10 es un punto de partida: si tus gastos fijos son altos, ajusta los porcentajes y mira cómo cambia mes a mes.', at: '2026-11-11T12:00:00.000Z' },
      ],
    },
    {
      cohortId: 'cohort-operations',
      anonymous: true,
      text: 'Me llegó un mensaje de un supuesto soporte que pedía el código de verificación. No lo pasé, ¿hice bien?',
      at: '2026-11-12T09:20:00.000Z',
      replies: [
        { tutor: true, endorsed: true, text: 'Hiciste muy bien. Ningún soporte real te pide códigos. En la vida real, repórtalo desde la app y bloquea el contacto.', at: '2026-11-12T11:00:00.000Z' },
      ],
    },
  ],
  weekly: [
    ['Registra tus gastos durante 7 días', '2026-09-07', '2026-09-14'],
    ['Calcula el CFT de tu tarjeta con el resumen de este mes', '2026-10-05', '2026-10-12'],
    ['Separa el 10 % de tu próximo cobro antes de gastar', '2026-11-09', '2026-11-23'],
  ],
  questions: [
    ['module-01', '¿Por qué la suma no remunerativa no tiene descuento de jubilación?', '¡Buena pregunta! Las sumas no remunerativas no forman parte de la base de aportes: por eso el 11 % se calcula solo sobre lo remunerativo. Lo vemos en el encuentro del jueves.'],
    ['module-17', '¿Cómo me doy cuenta si mi billetera tiene CVU o CBU?', 'Fíjate en los datos de la cuenta dentro de la app y en la leyenda legal del pie. En la ficha "Billeteras y fintech" de Aprender tienes el paso a paso.'],
    ['module-03', '¿La regla 50/30/20 sirve si pago alquiler?', null],
    ['module-06', 'En el resumen aparecen TNA y CFT, ¿cuál tengo que mirar para comparar?', 'El CFT: incluye la tasa, las comisiones y los cargos. Es el que te dice cuánto cuesta de verdad.'],
    ['module-10', 'No entiendo por qué la TEA es más alta que la TNA.', null],
    ['module-02', '¿La regla de las 48 horas aplica a compras chicas?', null],
  ],
};

/**
 * Education: Instituto Superior Ceibo (D-84), higher education and vocational training, only people
 * aged 18 or older (D-83). Lucía starts her account in the demo itself, so she has no learning data yet.
 */
const CEIBO_COHORTS = [
  {
    id: 'cohort-ceibo-logistics',
    name: 'Tecnicatura en Logística · 1.er año',
    area: 'logistics',
    size: 22,
    activeRate: 0.8,
    mobileRate: 0.75,
    jobs: ['Estudiante de la Tecnicatura en Logística · 1.er año'],
    dueDate: '2026-12-04',
  },
  {
    id: 'cohort-ceibo-administration',
    name: 'Tecnicatura en Administración · 2.º año',
    area: 'business_admin',
    size: 18,
    activeRate: 0.85,
    mobileRate: 0.6,
    jobs: ['Estudiante de la Tecnicatura en Administración · 2.º año'],
    dueDate: '2026-12-04',
  },
  {
    id: 'cohort-ceibo-accounting',
    name: 'Formación profesional · Auxiliar contable',
    area: 'accounting',
    size: 12,
    activeRate: 0.75,
    mobileRate: 0.7,
    jobs: ['Estudiante de Auxiliar contable'],
    dueDate: '2026-12-04',
  },
];
const CEIBO = {
  seed: 20261201,
  idPrefix: 'ceibo-',
  organization: { id: 'org-ceibo', name: 'Instituto Superior Ceibo', kind: 'education', privacyThreshold: 5 },
  program: {
    id: 'program-ceibo-2026',
    name: 'Finanzas personales para empezar 2026',
    description:
      'Taller de finanzas personales del Instituto Superior Ceibo para sus estudiantes: una billetera de práctica donde cada persona aprende a organizar su beca o su primer ingreso, presupuestar, ahorrar, endeudarse con criterio e invertir, con dinero ficticio.',
    mode: 'assigned',
    requiredModuleIds: ['module-01', 'module-03', 'module-04', 'module-06', 'module-09'],
    reminderChannels: ['email', 'campus'],
  },
  domain: 'ceibo.demo',
  tutorId: 'p-martin',
  cohorts: CEIBO_COHORTS,
  staff: [
    { id: 'p-silvia', role: 'ld_admin', name: 'Silvia Herrera', jobOrProgram: 'Coordinadora académica', area: 'business_admin', cohortIds: [], device: 'desktop' },
    { id: 'p-martin', role: 'tutor', name: 'Martín Quiroga', jobOrProgram: 'Tutor de finanzas personales', area: 'business_admin', cohortIds: CEIBO_COHORTS.map((c) => c.id), device: 'desktop' },
    { id: 'p-hector', role: 'sponsor', name: 'Héctor Ramos', jobOrProgram: 'Director de estudios', area: 'business_admin', cohortIds: [], device: 'desktop' },
  ],
  forced: [
    { cohortId: 'cohort-ceibo-logistics', index: 0, id: 'p-lucia', name: 'Lucía Ferreyra', job: 'Estudiante de la Tecnicatura en Logística · 1.er año', device: 'mobile' },
  ],
  freshIds: ['p-lucia'],
  levelBase: { logistics: 2.6, business_admin: 3.4, accounting: 3 },
  goals: [{ cohortId: 'cohort-ceibo-logistics', kind: 'level', targetId: 'level-2', targetShare: 0.7, dueDate: '2026-12-04' }],
  forum: [
    {
      cohortId: 'cohort-ceibo-logistics',
      text: '¿El fondo de emergencia también sirve si vivo con mi familia?',
      at: '2026-11-09T18:10:00.000Z',
      replies: [
        { text: 'Yo lo pienso con mis gastos básicos propios, aunque sean menos que los de una casa.', at: '2026-11-09T21:30:00.000Z' },
        { tutor: true, endorsed: true, text: 'Exacto: calcúlalo con tus gastos esenciales. Lo vemos en la próxima clase.', at: '2026-11-10T12:00:00.000Z' },
      ],
    },
  ],
  weekly: [
    ['Anota tus gastos durante 7 días', '2026-09-07', '2026-09-14'],
    ['Arma el presupuesto del mes con tu beca o tu ingreso', '2026-10-05', '2026-10-12'],
    ['Separa el 10 % de lo que recibas este mes antes de gastar', '2026-11-09', '2026-11-23'],
  ],
  questions: [
    ['module-03', '¿Cómo armo un presupuesto si lo que recibo cambia cada mes?', 'Empieza por el mes más flojo de los últimos tres: si el presupuesto cierra con ese, los meses mejores te dejan ahorro. Lo vemos en la próxima clase.'],
    ['module-17', '¿Qué diferencia hay entre una cuenta con CVU y una caja de ahorros?', 'La caja de ahorros es una cuenta bancaria con CBU y tiene la garantía de los depósitos; la cuenta con CVU es de pago y no la tiene. En la ficha "Billeteras y fintech" de Aprender está el detalle.'],
    ['module-04', '¿Cuánto tendría que tener en el fondo de emergencia si vivo con mi familia?', null],
    ['module-02', '¿La regla de las 48 horas sirve para las compras online?', null],
  ],
};

/**
 * Product: Hornero, the fictitious partner wallet of the integrated mode (D-75, D-84). No tutor and no
 * cohorts for its users: the product team sees the same aggregated metrics through two segments.
 */
const HORNERO = {
  seed: 20261301,
  idPrefix: 'hornero-',
  organization: { id: 'org-hornero', name: 'Hornero', kind: 'product', privacyThreshold: 5 },
  program: {
    id: 'program-hornero',
    name: 'Alcancía en Hornero',
    description:
      'Alcancía integrada en la app de Hornero, una billetera ficticia: sus usuarios aprenden finanzas personales con una billetera de práctica, con dinero ficticio y sin un segundo inicio de sesión.',
    mode: 'voluntary',
    requiredModuleIds: [],
    reminderChannels: ['app'],
  },
  domain: 'hornero.demo',
  tutorId: undefined,
  cohorts: [
    { id: 'segment-hornero-new', name: 'Usuarios nuevos · desde agosto de 2026', area: 'new_users', size: 36, activeRate: 0.6, mobileRate: 0.95, jobs: ['Usuario de Hornero', 'Usuaria de Hornero'] },
    { id: 'segment-hornero-regular', name: 'Usuarios con más de 6 meses', area: 'regular_users', size: 28, activeRate: 0.7, mobileRate: 0.9, jobs: ['Usuario de Hornero', 'Usuaria de Hornero'] },
  ],
  staff: [
    { id: 'p-sofia', role: 'ld_admin', name: 'Sofía Cabral', jobOrProgram: 'Líder de producto de Hornero', area: 'new_users', cohortIds: [], device: 'desktop' },
    { id: 'p-nicolas', role: 'sponsor', name: 'Nicolás Vidal', jobOrProgram: 'Analista de producto de Hornero', area: 'new_users', cohortIds: [], device: 'desktop' },
  ],
  forced: [{ cohortId: 'segment-hornero-new', index: 0, id: 'p-joaquin', name: 'Joaquín Paredes', job: 'Usuario de Hornero', device: 'mobile' }],
  freshIds: ['p-joaquin'],
  levelBase: { new_users: 2.2, regular_users: 3 },
  weekly: [],
  questions: [],
};

const orgs = [ANDINA, CEIBO, HORNERO].map(generateOrg);
const seed = {
  generatedFor: iso(DEMO_TODAY),
  note: 'Learning data only. Wallet data, habit answers, reflections and level lock states never leave the participant browser (D-58, D-62).',
  organizations: orgs.map((o) => o.organization),
  programs: orgs.map((o) => o.program),
};
for (const key of [
  'cohorts', 'people', 'diagnostics', 'guideProgress', 'challengeAttempts', 'itemResponses', 'levelLearning',
  'unlockRecords', 'missionCompletions', 'weeklyChallenges', 'weeklyReports', 'followUps', 'tutorQuestions',
  'collectiveGoals', 'cohortPosts',
]) {
  seed[key] = orgs.flatMap((o) => o[key]);
}
writeFileSync(join(root, 'src/data/seed.json'), `${JSON.stringify(seed, null, 1)}\n`);

// ---------- Demo states of the two participants (local to their browser, 5.0 demo mode) ----------
const levelsAll = levels.filter((l) => l.phase === 'A');
const lockStates = (personId, current) =>
  levelsAll.map((l) => ({
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

for (const o of orgs) {
  const participants = o.people.filter((p) => p.role === 'participant');
  console.log(
    `${o.organization.name}: ${participants.length} participants, ${o.cohorts.length} cohorts, ${o.guideProgress.length} guides, ` +
      `${o.challengeAttempts.length} attempts, ${o.missionCompletions.length} missions, ${o.weeklyReports.length} weekly reports.`,
  );
}
