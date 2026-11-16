import type { FoodEntry } from '../models/food-entry.model';

import { buildDailySeries, summarizeSeries } from './insights.utils';

function entryAt(dateKey: string, overrides: Partial<FoodEntry> = {}): FoodEntry {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0);
  const iso = date.toISOString();

  return {
    id: `${dateKey}-${overrides.name ?? 'meal'}`,
    name: 'Test meal',
    calories: 100,
    protein: 0,
    carbs: 0,
    fat: 0,
    meal: 'lunch',
    notes: '',
    photo: '',
    consumedAt: iso,
    createdAt: iso,
    updatedAt: iso,
    synced: true,
    deleted: false,
    ...overrides,
  };
}

describe('insights utils', () => {
  it('builds a daily series ending on the requested date', () => {
    const series = buildDailySeries(
      [
        entryAt('2026-03-09', { calories: 500, protein: 20, carbs: 40, fat: 10 }),
        entryAt('2026-03-10', { calories: 700, protein: 30, carbs: 60, fat: 20 }),
      ],
      '2026-03-10',
      7,
    );

    expect(series).toHaveLength(7);
    expect(series[0].dateKey).toBe('2026-03-04');
    expect(series[6].dateKey).toBe('2026-03-10');
    expect(series[5].totals).toMatchObject({ calories: 500, protein: 20, carbs: 40, fat: 10, count: 1 });
    expect(series[6].totals).toMatchObject({ calories: 700, protein: 30, carbs: 60, fat: 20, count: 1 });
  });

  it('ignores deleted entries and days outside the range', () => {
    const series = buildDailySeries(
      [
        entryAt('2026-03-01', { calories: 900 }),
        entryAt('2026-03-10', { calories: 300, deleted: true }),
        entryAt('2026-03-10', { calories: 250 }),
      ],
      '2026-03-10',
      7,
    );

    expect(series[6].totals).toMatchObject({ calories: 250, count: 1 });
    expect(series.reduce((total, day) => total + day.totals.calories, 0)).toBe(250);
  });

  it('summarizes averages, adherence, and macro split', () => {
    const series = buildDailySeries(
      [
        entryAt('2026-03-09', { calories: 1000, protein: 50, carbs: 100, fat: 20 }),
        entryAt('2026-03-10', { calories: 2200, protein: 10, carbs: 10, fat: 10 }),
      ],
      '2026-03-10',
      7,
    );

    const summary = summarizeSeries(series, 2000);

    expect(summary.totalCalories).toBe(3200);
    expect(summary.averageCalories).toBe(1600);
    expect(summary.loggedDays).toBe(2);
    expect(summary.onTargetDays).toBe(1);
    expect(summary.adherencePercent).toBe(50);
    expect(summary.peakCalories).toBe(2200);
    expect(summary.peakDay?.dateKey).toBe('2026-03-10');
    expect(summary.totals).toMatchObject({ protein: 60, carbs: 110, fat: 30, count: 2 });
    expect(summary.macros.protein + summary.macros.carbs + summary.macros.fat).toBe(100);
  });

  it('returns zeroed values when there are no entries', () => {
    const series = buildDailySeries([], '2026-03-10', 7);
    const summary = summarizeSeries(series, 2000);

    expect(summary.loggedDays).toBe(0);
    expect(summary.averageCalories).toBe(0);
    expect(summary.adherencePercent).toBe(0);
    expect(summary.peakDay).toBeNull();
    expect(summary.macros).toEqual({ protein: 0, carbs: 0, fat: 0 });
  });
});
