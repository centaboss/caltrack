import { TestBed } from '@angular/core/testing';

import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();
    service = TestBed.inject(StorageService);
  });

  it('writes data to localStorage under the plain key', async () => {
    await service.set('caltrack.entries', [{ id: 'a' }]);

    expect(localStorage.getItem('caltrack.entries')).toBe('[{"id":"a"}]');
  });

  it('mirrors data to Capacitor Preferences', async () => {
    await service.set('caltrack.entries', [{ id: 'a' }]);

    expect(localStorage.getItem('CapacitorStorage.caltrack.entries')).toBe('[{"id":"a"}]');
  });

  it('reads values back from localStorage', async () => {
    localStorage.setItem('caltrack.water', '{"2026-11-25":500}');

    await expect(service.get('caltrack.water', {})).resolves.toEqual({ '2026-11-25': 500 });
  });

  it('prefers localStorage over Preferences when both are present', async () => {
    localStorage.setItem('caltrack.entries', '[{"id":"local"}]');
    localStorage.setItem('CapacitorStorage.caltrack.entries', '[{"id":"native"}]');

    await expect(service.get('caltrack.entries', [])).resolves.toEqual([{ id: 'local' }]);
  });

  it('migrates an existing Preferences value into localStorage', async () => {
    localStorage.setItem('CapacitorStorage.caltrack.entries', '[{"id":"native"}]');

    await expect(service.get('caltrack.entries', [])).resolves.toEqual([{ id: 'native' }]);
    expect(localStorage.getItem('caltrack.entries')).toBe('[{"id":"native"}]');
  });

  it('returns the fallback when neither store has data', async () => {
    await expect(service.get('caltrack.settings', { dailyGoal: 2000 })).resolves.toEqual({
      dailyGoal: 2000,
    });
  });

  it('removes data from both stores', async () => {
    localStorage.setItem('caltrack.entries', '[{"id":"a"}]');
    localStorage.setItem('CapacitorStorage.caltrack.entries', '[{"id":"a"}]');

    await service.remove('caltrack.entries');

    expect(localStorage.getItem('caltrack.entries')).toBeNull();
    expect(localStorage.getItem('CapacitorStorage.caltrack.entries')).toBeNull();
  });
});
