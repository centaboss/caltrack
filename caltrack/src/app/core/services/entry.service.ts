import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import type { EntryTotals, FoodEntry, FoodEntryDraft, SyncResult } from '../models/food-entry.model';
import { toDateKey } from '../utils/date.utils';

import { ApiService } from './api.service';
import { SettingsService } from './settings.service';
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
    synced: entry.synced ?? true,
    deleted: entry.deleted ?? false,
  };
}

@Injectable({ providedIn: 'root' })
export class EntryService {
  private readonly storage = inject(StorageService);
  private readonly api = inject(ApiService);
  private readonly settings = inject(SettingsService);

  readonly entries = signal<FoodEntry[]>([]);
  readonly loading = signal(true);
  readonly syncing = signal(false);
  readonly pendingCount = computed(() => this.entries().filter((entry) => !entry.synced || entry.deleted).length);

  private initPromise: Promise<void> | null = null;
  private syncPromise: Promise<SyncResult> | null = null;
  private syncRequested = false;

  init(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.loadLocal();
    }
    return this.initPromise;
  }

  private async loadLocal(): Promise<void> {
    this.loading.set(true);
    const stored = await this.storage.get<FoodEntry[]>(ENTRIES_KEY, []);
    this.entries.set(stored.map(normalize).sort((a, b) => this.sortDesc(a, b)));
    this.loading.set(false);
  }

  private async persist(): Promise<void> {
    await this.storage.set<FoodEntry[]>(ENTRIES_KEY, this.entries());
  }

  entriesForDate(dateKey: string): FoodEntry[] {
    return this.entries()
      .filter((entry) => !entry.deleted && toDateKey(new Date(entry.consumedAt)) === dateKey)
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
      synced: false,
      deleted: false,
    });

    this.entries.update((entries) => [entry, ...entries]);
    await this.persist();
    void this.sync();
    return entry;
  }

  async update(id: string, draft: FoodEntryDraft): Promise<void> {
    const now = new Date().toISOString();
    this.entries.update((entries) =>
      entries.map((entry) =>
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
              synced: false,
            })
          : entry,
      ),
    );
    await this.persist();
    void this.sync();
  }

  async remove(id: string): Promise<void> {
    const entry = this.entries().find((item) => item.id === id);
    if (!entry) return;

    this.entries.update((entries) =>
      entries.map((item) => (item.id === id ? { ...item, deleted: true, updatedAt: new Date().toISOString() } : item)),
    );

    await this.persist();
    void this.sync();
  }

  async incrementServings(id: string): Promise<void> {
    const entry = this.entries().find((item) => item.id === id && !item.deleted);
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
    const entry = this.entries().find((item) => item.id === id && !item.deleted);
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

  sync(): Promise<SyncResult> {
    if (this.syncPromise) {
      this.syncRequested = true;
      return this.syncPromise;
    }
    this.syncPromise = this.runSync().finally(() => {
      this.syncPromise = null;
      if (this.syncRequested) {
        this.syncRequested = false;
        void this.sync();
      }
    });
    return this.syncPromise;
  }

  private async runSync(): Promise<SyncResult> {
    await this.init();
    await this.settings.ready;
    this.syncing.set(true);

    try {
      await this.pushPending();
      await this.pullRemote();
      return { ok: true };
    } catch (error) {
      return { ok: false, message: this.errorMessage(error) };
    } finally {
      this.syncing.set(false);
    }
  }

  private async pushPending(): Promise<void> {
    const pending = this.entries().filter((entry) => !entry.synced || entry.deleted);
    if (!pending.length) return;

    for (const entry of pending) {
      if (entry.deleted) {
        try {
          await this.api.remove(entry.id);
        } catch (error) {
          if (!this.isNotFound(error)) throw error;
        }
        this.entries.update((entries) => entries.filter((item) => item.id !== entry.id));
        continue;
      }

      try {
        await this.api.update(entry);
      } catch (error) {
        if (this.isNotFound(error)) {
          try {
            await this.api.create(entry);
          } catch (createError) {
            if (this.isConflict(createError)) {
              await this.api.update(entry);
            } else {
              throw createError;
            }
          }
        } else {
          throw error;
        }
      }

      const current = this.entries().find((item) => item.id === entry.id);
      if (current && current.updatedAt === entry.updatedAt) {
        this.entries.update((entries) =>
          entries.map((item) => (item.id === entry.id ? { ...item, synced: true } : item)),
        );
      }
    }

    await this.persist();
  }

  private async pullRemote(): Promise<void> {
    const remote = await this.api.list();
    const local = this.entries();
    const localById = new Map(local.map((entry) => [entry.id, entry]));
    const merged: FoodEntry[] = [];

    for (const entry of remote) {
      const localEntry = localById.get(entry.id);
      if (localEntry && (!localEntry.synced || localEntry.deleted)) {
        merged.push(localEntry);
      } else {
        merged.push(entry);
      }
      localById.delete(entry.id);
    }

    for (const localEntry of localById.values()) {
      if (localEntry.deleted) continue;
      merged.push({ ...localEntry, synced: false });
    }

    merged.sort((a, b) => this.sortDesc(a, b));
    this.entries.set(merged);
    await this.persist();
  }

  async clearLocalData(): Promise<void> {
    this.entries.set([]);
    await this.persist();
  }

  private sortDesc(a: FoodEntry, b: FoodEntry): number {
    return new Date(b.consumedAt).getTime() - new Date(a.consumedAt).getTime();
  }

  private isNotFound(error: unknown): boolean {
    return error instanceof HttpErrorResponse && error.status === 404;
  }

  private isConflict(error: unknown): boolean {
    return error instanceof HttpErrorResponse && error.status === 409;
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Server unreachable. Changes are saved on this device and will sync later.';
      }
      const serverMessage =
        typeof error.error === 'object' && error.error && 'error' in error.error ? String(error.error.error) : '';
      return serverMessage || `Sync failed (${error.status}).`;
    }
    return error instanceof Error ? error.message : 'Sync failed.';
  }
}
