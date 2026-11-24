import { Injectable, inject, signal } from '@angular/core';

import { StorageService } from './storage.service';

const SETTINGS_KEY = 'caltrack.settings';

export interface AppSettings {
  dailyGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  waterGoal: number;
  hapticsEnabled: boolean;
}

const DEFAULT_GOALS = {
  dailyGoal: 2000,
  proteinGoal: 150,
  carbsGoal: 200,
  fatGoal: 67,
  waterGoal: 2000,
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly storage = inject(StorageService);

  readonly dailyGoal = signal(DEFAULT_GOALS.dailyGoal);
  readonly proteinGoal = signal(DEFAULT_GOALS.proteinGoal);
  readonly carbsGoal = signal(DEFAULT_GOALS.carbsGoal);
  readonly fatGoal = signal(DEFAULT_GOALS.fatGoal);
  readonly waterGoal = signal(DEFAULT_GOALS.waterGoal);
  readonly hapticsEnabled = signal(true);
  readonly ready: Promise<void>;

  constructor() {
    this.ready = this.load();
  }

  private async load(): Promise<void> {
    const stored = await this.storage.get<Partial<AppSettings>>(SETTINGS_KEY, {});
    this.applyNumeric(stored);
    if (typeof stored.hapticsEnabled === 'boolean') {
      this.hapticsEnabled.set(stored.hapticsEnabled);
    }
  }

  async save(settings: Partial<AppSettings>): Promise<void> {
    this.applyNumeric(settings);
    if (typeof settings.hapticsEnabled === 'boolean') {
      this.hapticsEnabled.set(settings.hapticsEnabled);
    }
    await this.persist();
  }

  private applyNumeric(settings: Partial<AppSettings>): void {
    if (typeof settings.dailyGoal === 'number' && settings.dailyGoal > 0) {
      this.dailyGoal.set(Math.round(settings.dailyGoal));
    }
    if (typeof settings.proteinGoal === 'number' && settings.proteinGoal > 0) {
      this.proteinGoal.set(Math.round(settings.proteinGoal));
    }
    if (typeof settings.carbsGoal === 'number' && settings.carbsGoal > 0) {
      this.carbsGoal.set(Math.round(settings.carbsGoal));
    }
    if (typeof settings.fatGoal === 'number' && settings.fatGoal > 0) {
      this.fatGoal.set(Math.round(settings.fatGoal));
    }
    if (typeof settings.waterGoal === 'number' && settings.waterGoal > 0) {
      this.waterGoal.set(Math.round(settings.waterGoal));
    }
  }

  private async persist(): Promise<void> {
    await this.storage.set<AppSettings>(SETTINGS_KEY, {
      dailyGoal: this.dailyGoal(),
      proteinGoal: this.proteinGoal(),
      carbsGoal: this.carbsGoal(),
      fatGoal: this.fatGoal(),
      waterGoal: this.waterGoal(),
      hapticsEnabled: this.hapticsEnabled(),
    });
  }
}
