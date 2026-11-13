import { describe, expect, it } from 'vitest';
import { DIMENSIONS, habitAnswers, HABITS, KNOWLEDGE, levelOf, QUESTIONS, route, scoreKnowledge } from './conocerte';

const allRight = Object.fromEntries(KNOWLEDGE.map((q) => [q.id, q.correct!]));

describe('Conocerte questions (F2, content.md)', () => {
  it('has 12 questions: 5 habits without a right answer and 7 knowledge questions with one', () => {
    expect(QUESTIONS).toHaveLength(12);
    expect(HABITS).toHaveLength(5);
    expect(HABITS.every((q) => q.correct === undefined)).toBe(true);
    expect(KNOWLEDGE).toHaveLength(7);
    for (const q of KNOWLEDGE) {
      expect(q.options.map((o) => o.id)).toContain(q.correct);
      expect(q.explanation).toBeTruthy();
    }
  });

  it('covers the five dimensions with habits and knowledge', () => {
    for (const d of DIMENSIONS) {
      expect(HABITS.some((q) => q.dimension === d)).toBe(true);
      expect(KNOWLEDGE.some((q) => q.dimension === d)).toBe(true);
    }
  });
});

describe('scores, levels and route (D-167)', () => {
  it('scores only knowledge answers, by dimension', () => {
    expect(scoreKnowledge(allRight)).toEqual({ budget: 1, savings: 1, debt: 1, inflation_rates: 1, goals: 1 });
    const halfDebt = { ...allRight, 'k-minimum': 'a' };
    expect(scoreKnowledge(halfDebt).debt).toBe(0.5);
    expect(scoreKnowledge({})).toEqual({ budget: 0, savings: 0, debt: 0, inflation_rates: 0, goals: 0 });
  });

  it('habit answers never change the score', () => {
    const withHabits = { ...allRight, 'h-card': 'minimum', 'h-unexpected': 'unsure' };
    expect(scoreKnowledge(withHabits)).toEqual(scoreKnowledge(allRight));
  });

  it('maps a score to a level', () => {
    expect(levelOf(0)).toBe('beginner');
    expect(levelOf(0.49)).toBe('beginner');
    expect(levelOf(0.5)).toBe('intermediate');
    expect(levelOf(0.79)).toBe('intermediate');
    expect(levelOf(0.8)).toBe('advanced');
  });

  it('starts the route with the weakest dimensions and keeps the program order on ties', () => {
    expect(route({ budget: 0.55, savings: 0.32, debt: 0.32, inflation_rates: 0.5, goals: 0.42 })).toEqual([
      'savings',
      'debt',
      'goals',
      'inflation_rates',
      'budget',
    ]);
    expect(route({ budget: 1, savings: 1, debt: 1, inflation_rates: 1, goals: 1 })).toEqual(DIMENSIONS);
  });

  it('keeps only habit answers for the browser (D-62)', () => {
    expect(habitAnswers({ ...allRight, 'h-goal': 'idea' })).toEqual({ 'h-goal': 'idea' });
  });
});
