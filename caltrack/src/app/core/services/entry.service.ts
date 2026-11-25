import { Injectable, computed, inject, signal } from '@angular/core';

import type { EntryTotals, FoodEntry, FoodEntryDraft } from '../models/food-entry.model';
import { toDateKey } from '../utils/date.utils';

import { StorageService } from './storage.service';

const ENTRIES_KEY = 'caltrack.entries';

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalize(entry: FoodEntry): FoodEntry {
  return {
    ...entry,
    protein: Number(entry.protein) || 0,
    carbs: Number(entry.carbs) || 0,
    fat: Number(entry.fat) || 0,
    servings: Math.max(1, Math.round(Number(entry.servings) || 1)),
    notes: entry.notes ?? '',
    photo: entry.photo ?? '',
    synced: true,
    deleted: false,
  };
}

@Injectable({ providedIn: 'root' })
export class EntryService {
  private readonly storage = inject(StorageService);

  readonly entries = signal<FoodEntry[]>([]);
  readonly loading = signal(true);
  readonly syncing = signal(false);
  readonly pendingCount = computed(() => 0);

  private initPromise: Promise<void> | null = null;

  init(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.loadLocal();
    }
    return this.initPromise;
  }

  private async loadLocal(): Promise<void> {
    this.loading.set(true);
    const stored = await this.storage.get<FoodEntry[]>(ENTRIES_KEY, []);
    this.entries.set(stored.filter((entry) => !entry.deleted).map(normalize).sort((a, b) => this.sortDesc(a, b)));
    this.loading.set(false);
  }

  private async persist(): Promise<void> {
    await this.storage.set<FoodEntry[]>(ENTRIES_KEY, this.entries());
  }

  entriesForDate(dateKey: string): FoodEntry[] {
    return this.entries()
      .filter((entry) => toDateKey(new Date(entry.consumedAt)) === dateKey)
      .sort((a, b) => new Date(a.consumedAt).getTime() - new Date(b.consumedAt).getTime());
  }

  totalsForDate(dateKey: string): EntryTotals {
    return this.entriesForDate(dateKey).reduce<EntryTotals>(
      (totals, entry) => {
        totals.calories += entry.calories;
        totals.protein += entry.protein;
        totals.carbs += entry.carbs;
        totals.fat += entry.fat;
        totals.count += 1;
        return totals;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 },
    );
  }

  async create(draft: FoodEntryDraft): Promise<FoodEntry> {
    await this.init();
    const now = new Date().toISOString();
    const entry: FoodEntry = normalize({
      ...draft,
      id: createId(),
      calories: Math.round(Number(draft.calories) || 0),
      protein: Number(draft.protein) || 0,
      carbs: Number(draft.carbs) || 0,
      fat: Number(draft.fat) || 0,
      servings: Math.max(1, Math.round(Number(draft.servings) || 1)),
      createdAt: now,
      updatedAt: now,
      synced: true,
      deleted: false,
    });

    this.entries.update((entries) => [entry, ...entries].sort((a, b) => this.sortDesc(a, b)));
    await this.persist();
    return entry;
  }

  async update(id: string, draft: FoodEntryDraft): Promise<void> {
    await this.init();
    const now = new Date().toISOString();
    this.entries.update((entries) =>
      entries
        .map((entry) =>
          entry.id === id
            ? normalize({
                ...entry,
                ...draft,
                calories: Math.round(Number(draft.calories) || 0),
                protein: Number(draft.protein) || 0,
                carbs: Number(draft.carbs) || 0,
                fat: Number(draft.fat) || 0,
                servings: Math.max(1, Math.round(Number(draft.servings) || 1)),
                updatedAt: now,
                synced: true,
                deleted: false,
              })
            : entry,
        )
        .sort((a, b) => this.sortDesc(a, b)),
    );
    await this.persist();
  }

  async remove(id: string): Promise<void> {
    await this.init();
    const entry = this.entries().find((item) => item.id === id);
    if (!entry) return;

    this.entries.update((entries) => entries.filter((item) => item.id !== id));
    await this.persist();
  }

  async incrementServings(id: string): Promise<void> {
    await this.init();
    const entry = this.entries().find((item) => item.id === id);
    if (!entry) return;

    const oldServings = Math.max(1, entry.servings || 1);
    const newServings = oldServings + 1;
    const scale = newServings / oldServings;

    const draft: FoodEntryDraft = {
      name: entry.name,
      calories: Math.round(entry.calories * scale),
      protein: Math.round(entry.protein * scale * 10) / 10,
      carbs: Math.round(entry.carbs * scale * 10) / 10,
      fat: Math.round(entry.fat * scale * 10) / 10,
      servings: newServings,
      meal: entry.meal,
      notes: entry.notes,
      photo: entry.photo,
      consumedAt: entry.consumedAt,
    };

    await this.update(id, draft);
  }

  async decrementServings(id: string): Promise<void> {
    await this.init();
    const entry = this.entries().find((item) => item.id === id);
    if (!entry) return;

    const oldServings = Math.max(1, entry.servings || 1);
    if (oldServings <= 1) {
      await this.remove(id);
      return;
    }

    const newServings = oldServings - 1;
    const scale = newServings / oldServings;

    const draft: FoodEntryDraft = {
      name: entry.name,
      calories: Math.round(entry.calories * scale),
      protein: Math.round(entry.protein * scale * 10) / 10,
      carbs: Math.round(entry.carbs * scale * 10) / 10,
      fat: Math.round(entry.fat * scale * 10) / 10,
      servings: newServings,
      meal: entry.meal,
      notes: entry.notes,
      photo: entry.photo,
      consumedAt: entry.consumedAt,
    };

    await this.update(id, draft);
  }

  async clearLocalData(): Promise<void> {
    await this.init();
    this.entries.set([]);
    await this.persist();
  }

  private sortDesc(a: FoodEntry, b: FoodEntry): number {
    return new Date(b.consumedAt).getTime() - new Date(a.consumedAt).getTime();
  }
}
