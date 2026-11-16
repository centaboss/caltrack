import type { EntryTotals, FoodEntry } from '../models/food-entry.model';

import { fromDateKey, shiftDateKey, toDateKey } from './date.utils';

export interface DailyInsight {
  dateKey: string;
  label: string;
  showLabel: boolean;
  totals: EntryTotals;
}

export interface MacroSplit {
  protein: number;
  carbs: number;
  fat: number;
}

export interface InsightsSummary {
  days: number;
  totalCalories: number;
  averageCalories: number;
  loggedDays: number;
  onTargetDays: number;
  adherencePercent: number;
  totals: EntryTotals;
  macros: MacroSplit;
  peakCalories: number;
  peakDay: DailyInsight | null;
}

function emptyTotals(): EntryTotals {
  return { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 };
}

export function buildDailySeries(entries: FoodEntry[], endDateKey: string, days: number): DailyInsight[] {
  const span = Math.max(1, Math.round(days));
  const startKey = shiftDateKey(endDateKey, -(span - 1));
  const totalsByDay = new Map<string, EntryTotals>();

  for (const entry of entries) {
    if (entry.deleted) continue;

    const key = toDateKey(new Date(entry.consumedAt));
    if (key < startKey || key > endDateKey) continue;

    const totals = totalsByDay.get(key) ?? emptyTotals();
    totals.calories += entry.calories;
    totals.protein += entry.protein;
    totals.carbs += entry.carbs;
    totals.fat += entry.fat;
    totals.count += 1;
    totalsByDay.set(key, totals);
  }

  const series: DailyInsight[] = [];
  for (let index = 0; index < span; index += 1) {
    const key = shiftDateKey(startKey, index);
    const date = fromDateKey(key);

    series.push({
      dateKey: key,
      label: span <= 7 ? date.toLocaleDateString(undefined, { weekday: 'narrow' }) : String(date.getDate()),
      showLabel: span <= 7 || index % 5 === 0 || index === span - 1,
      totals: totalsByDay.get(key) ?? emptyTotals(),
    });
  }

  return series;
}

export function summarizeSeries(series: DailyInsight[], goal: number): InsightsSummary {
  const totals = emptyTotals();
  let loggedDays = 0;
  let onTargetDays = 0;
  let peakDay: DailyInsight | null = null;

  for (const day of series) {
    totals.calories += day.totals.calories;
    totals.protein += day.totals.protein;
    totals.carbs += day.totals.carbs;
    totals.fat += day.totals.fat;
    totals.count += day.totals.count;

    if (day.totals.count === 0) continue;

    loggedDays += 1;
    if (day.totals.calories <= goal) {
      onTargetDays += 1;
    }
    if (!peakDay || day.totals.calories > peakDay.totals.calories) {
      peakDay = day;
    }
  }

  const proteinCalories = totals.protein * 4;
  const carbCalories = totals.carbs * 4;
  const fatCalories = totals.fat * 9;

  return {
    days: series.length,
    totalCalories: totals.calories,
    averageCalories: loggedDays > 0 ? Math.round(totals.calories / loggedDays) : 0,
    loggedDays,
    onTargetDays,
    adherencePercent: loggedDays > 0 ? Math.round((onTargetDays / loggedDays) * 100) : 0,
    totals,
    macros: splitMacros(proteinCalories, carbCalories, fatCalories),
    peakCalories: peakDay?.totals.calories ?? 0,
    peakDay,
  };
}

function splitMacros(proteinCalories: number, carbCalories: number, fatCalories: number): MacroSplit {
  const macroCalories = proteinCalories + carbCalories + fatCalories;
  if (macroCalories <= 0) {
    return { protein: 0, carbs: 0, fat: 0 };
  }

  const raw = [proteinCalories, carbCalories, fatCalories].map((calories) => (calories / macroCalories) * 100);
  const percents = raw.map(Math.floor);
  let remainder = 100 - percents.reduce((total, value) => total + value, 0);

  const byFraction = raw
    .map((value, index) => ({ index, fraction: value - percents[index] }))
    .sort((a, b) => b.fraction - a.fraction);

  for (const { index } of byFraction) {
    if (remainder <= 0) break;
    percents[index] += 1;
    remainder -= 1;
  }

  return { protein: percents[0], carbs: percents[1], fat: percents[2] };
}
