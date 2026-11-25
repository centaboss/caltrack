import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({ providedIn: 'root' })
export class StorageService {
  async get<T>(key: string, fallback: T): Promise<T> {
    const local = this.readLocal<T>(key);
    if (local !== undefined) {
      return local;
    }

    try {
      const { value } = await Preferences.get({ key });
      if (value !== null && value !== undefined && value !== '') {
        this.writeLocal(key, value);
        return JSON.parse(value) as T;
      }
    } catch {
      return fallback;
    }

    return fallback;
  }

  async set<T>(key: string, value: T): Promise<void> {
    const raw = JSON.stringify(value);
    this.writeLocal(key, raw);

    try {
      await Preferences.set({ key, value: raw });
    } catch {
      return;
    }
  }

  async remove(key: string): Promise<void> {
    this.removeLocal(key);

    try {
      await Preferences.remove({ key });
    } catch {
      return;
    }
  }

  private readLocal<T>(key: string): T | undefined {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null && raw !== '') {
        return JSON.parse(raw) as T;
      }
    } catch {
      this.removeLocal(key);
    }
    return undefined;
  }

  private writeLocal(key: string, raw: string): void {
    try {
      localStorage.setItem(key, raw);
    } catch {
      return;
    }
  }

  private removeLocal(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      return;
    }
  }
}
