import { Injectable, inject, signal } from '@angular/core';

import { StorageService } from './storage.service';

const WATER_KEY = 'caltrack.water';

@Injectable({ providedIn: 'root' })
export class WaterService {
  private readonly storage = inject(StorageService);

  readonly intake = signal<Record<string, number>>({});
  readonly ready: Promise<void>;

  constructor() {
    this.ready = this.load();
  }

  private async load(): Promise<void> {
    const stored = await this.storage.get<Record<string, number>>(WATER_KEY, {});
    this.intake.set(stored);
  }

  amountFor(dateKey: string): number {
    return this.intake()[dateKey] ?? 0;
  }

  add(dateKey: string, ml: number): Promise<number> {
    return this.setAmount(dateKey, this.amountFor(dateKey) + Math.max(0, Math.round(ml)));
  }

  remove(dateKey: string, ml: number): Promise<number> {
    return this.setAmount(dateKey, this.amountFor(dateKey) - Math.max(0, Math.round(ml)));
  }

  async reset(dateKey: string): Promise<void> {
    const next = { ...this.intake() };
    delete next[dateKey];
    this.intake.set(next);
    await this.persist();
  }

  private async setAmount(dateKey: string, amount: number): Promise<number> {
    const clamped = Math.max(0, Math.round(amount));
    const next = { ...this.intake() };

    if (clamped === 0) {
      delete next[dateKey];
    } else {
      next[dateKey] = clamped;
    }

    this.intake.set(next);
    await this.persist();
    return clamped;
  }

  private async persist(): Promise<void> {
    await this.storage.set<Record<string, number>>(WATER_KEY, this.intake());
  }
}
