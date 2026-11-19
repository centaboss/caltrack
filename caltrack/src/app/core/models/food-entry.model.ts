export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servings?: number;
  meal: MealType;
  notes: string;
  photo: string;
  consumedAt: string;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
  deleted: boolean;
}

export interface FoodEntryDraft {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servings?: number;
  meal: MealType;
  notes: string;
  photo: string;
  consumedAt: string;
}

export interface EntryTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  count: number;
}

export interface SyncResult {
  ok: boolean;
  message?: string;
}

export const MEALS: { value: MealType; label: string; icon: string }[] = [
  { value: 'breakfast', label: 'Breakfast', icon: 'sunny-outline' },
  { value: 'lunch', label: 'Lunch', icon: 'restaurant-outline' },
  { value: 'dinner', label: 'Dinner', icon: 'moon-outline' },
  { value: 'snack', label: 'Snacks', icon: 'cafe-outline' },
];

export const MEAL_TARGET_SHARE: Record<MealType, number> = {
  breakfast: 0.25,
  lunch: 0.35,
  dinner: 0.3,
  snack: 0.1,
};
