import { Injectable, inject } from '@angular/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly settings = inject(SettingsService);

  async tap(): Promise<void> {
    if (!this.settings.hapticsEnabled()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // Haptics are unavailable on some browsers and desktop devices.
    }
  }

  async success(): Promise<void> {
    if (!this.settings.hapticsEnabled()) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch {
      // Haptics are unavailable on some browsers and desktop devices.
    }
  }

  async warning(): Promise<void> {
    if (!this.settings.hapticsEnabled()) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch {
      // Haptics are unavailable on some browsers and desktop devices.
    }
  }
}
