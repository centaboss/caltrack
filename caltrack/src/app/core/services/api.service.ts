import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';

import type { FoodEntry } from '../models/food-entry.model';

import { SettingsService } from './settings.service';

type EntryPayload = Omit<FoodEntry, 'synced' | 'deleted'>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly settings = inject(SettingsService);

  private get baseUrl(): string {
    return this.settings.apiBaseUrl().replace(/\/+$/, '');
  }

  async health(): Promise<{ status: string; time: string }> {
    return firstValueFrom(
      this.http.get<{ status: string; time: string }>(`${this.baseUrl}/health`).pipe(timeout(6000)),
    );
  }

  async list(): Promise<FoodEntry[]> {
    const entries = await firstValueFrom(this.http.get<EntryPayload[]>(`${this.baseUrl}/entries`).pipe(timeout(8000)));
    return entries.map((entry) => this.toLocal(entry));
  }

  async create(entry: FoodEntry): Promise<FoodEntry> {
    const created = await firstValueFrom(
      this.http.post<EntryPayload>(`${this.baseUrl}/entries`, this.toPayload(entry)).pipe(timeout(8000)),
    );
    return this.toLocal(created);
  }

  async update(entry: FoodEntry): Promise<FoodEntry> {
    const updated = await firstValueFrom(
      this.http
        .put<EntryPayload>(`${this.baseUrl}/entries/${encodeURIComponent(entry.id)}`, this.toPayload(entry))
        .pipe(timeout(8000)),
    );
    return this.toLocal(updated);
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}/entries/${encodeURIComponent(id)}`).pipe(timeout(8000)),
    );
  }

  private toPayload(entry: FoodEntry): EntryPayload {
    const { synced: _synced, deleted: _deleted, ...payload } = entry;
    return payload;
  }

  private toLocal(entry: EntryPayload): FoodEntry {
    return { ...entry, synced: true, deleted: false };
  }
}
