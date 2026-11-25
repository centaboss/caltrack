import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AlertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonTitle,
  IonToast,
  IonToggle,
  IonToolbar,
} from '@ionic/angular';

import { EntryService } from '../core/services/entry.service';
import { FeedbackService } from '../core/services/feedback.service';
import { SettingsService } from '../core/services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  imports: [
    ReactiveFormsModule,
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonTitle,
    IonToast,
    IonToggle,
    IonToolbar,
  ],
})
export class SettingsPage {
  readonly settings = inject(SettingsService);
  readonly entryService = inject(EntryService);
  private readonly feedback = inject(FeedbackService);
  private readonly alertController = inject(AlertController);
  private readonly fb = inject(FormBuilder);

  readonly toastOpen = signal(false);
  readonly toastMessage = signal('');
  readonly toastColor = signal('success');

  readonly form = this.fb.nonNullable.group({
    dailyGoal: [2000, [Validators.required, Validators.min(500), Validators.max(10000)]],
    proteinGoal: [150, [Validators.required, Validators.min(0), Validators.max(1000)]],
    carbsGoal: [200, [Validators.required, Validators.min(0), Validators.max(1000)]],
    fatGoal: [67, [Validators.required, Validators.min(0), Validators.max(1000)]],
    waterGoal: [2000, [Validators.required, Validators.min(500), Validators.max(8000)]],
    hapticsEnabled: [true],
  });

  constructor() {
    void this.load();
  }

  ionViewWillEnter(): void {
    void this.load();
  }

  private async load(): Promise<void> {
    await this.settings.ready;
    this.form.setValue({
      dailyGoal: this.settings.dailyGoal(),
      proteinGoal: this.settings.proteinGoal(),
      carbsGoal: this.settings.carbsGoal(),
      fatGoal: this.settings.fatGoal(),
      waterGoal: this.settings.waterGoal(),
      hapticsEnabled: this.settings.hapticsEnabled(),
    });
  }

  async saveSettings(): Promise<void> {
    try {
      await this.persistForm();
      void this.feedback.success();
      this.showToast('Settings saved', 'success');
    } catch {
      this.showToast('Check the values and try again', 'warning');
    }
  }

  async clearLocalData(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Clear local data?',
      message: 'All meals and entries stored on this device will be permanently removed.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Clear',
          role: 'destructive',
          handler: () => {
            void this.performClearLocalData();
          },
        },
      ],
    });
    await alert.present();
  }

  private async performClearLocalData(): Promise<void> {
    await this.entryService.clearLocalData();
    void this.feedback.warning();
    this.showToast('Local data cleared', 'medium');
  }

  private async persistForm(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      throw new Error('Invalid settings');
    }
    await this.settings.save(this.form.getRawValue());
  }

  private showToast(message: string, color: string): void {
    this.toastMessage.set(message);
    this.toastColor.set(color);
    this.toastOpen.set(true);
  }
}
