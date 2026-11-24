import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonDatetime,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonModal,
  IonNote,
  IonThumbnail,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular';

import { EntryFormComponent } from '../components/entry-form/entry-form.component';
import type { EntryTotals, FoodEntry, FoodEntryDraft, MealType } from '../core/models/food-entry.model';
import { MEALS, MEAL_TARGET_SHARE } from '../core/models/food-entry.model';
import { CameraService } from '../core/services/camera.service';
import { EntryService } from '../core/services/entry.service';
import { FeedbackService } from '../core/services/feedback.service';
import { SettingsService } from '../core/services/settings.service';
import { WaterService } from '../core/services/water.service';
import { friendlyDate, longDate, shiftDateKey, timeLabel, todayKey } from '../core/utils/date.utils';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    EntryFormComponent,
    IonButton,
    IonButtons,
    IonChip,
    IonContent,
    IonDatetime,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonList,
    IonModal,
    IonNote,
    IonThumbnail,
    IonTitle,
    IonToast,
    IonToolbar,
  ],
})
export class HomePage {
  readonly entryService = inject(EntryService);
  readonly settings = inject(SettingsService);
  readonly water = inject(WaterService);
  private readonly camera = inject(CameraService);
  private readonly feedback = inject(FeedbackService);
  private readonly alertController = inject(AlertController);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly meals = MEALS;
  readonly selectedDate = signal(todayKey());
  readonly datePickerOpen = signal(false);
  readonly formOpen = signal(false);
  readonly editingEntry = signal<FoodEntry | null>(null);
  readonly presetMeal = signal<MealType | null>(null);
  readonly toastOpen = signal(false);
  readonly toastMessage = signal('');
  readonly toastColor = signal('success');

  readonly totals = computed(() => this.entryService.totalsForDate(this.selectedDate()));
  readonly goal = computed(() => this.settings.dailyGoal());
  readonly remaining = computed(() => this.goal() - this.totals().calories);
  readonly progressPercent = computed(() =>
    Math.min(100, Math.round((this.totals().calories / Math.max(1, this.goal())) * 100)),
  );
  readonly ringGradient = computed(
    () => `conic-gradient(var(--ion-color-calories) ${this.progressPercent()}%, rgba(255, 255, 255, 0.16) 0)`,
  );
  readonly friendly = computed(() => friendlyDate(this.selectedDate()));
  readonly long = computed(() => longDate(this.selectedDate()));
  readonly isToday = computed(() => this.selectedDate() === todayKey());
  readonly remainingLabel = computed(() => (this.remaining() >= 0 ? 'Calories remaining' : 'Over your target'));
  readonly remainingValue = computed(() => Math.abs(this.remaining()));
  readonly macroStats = computed(() => {
    const totals = this.totals();
    return [
      { key: 'protein', label: 'Protein', value: totals.protein, goal: this.settings.proteinGoal() },
      { key: 'carbs', label: 'Carbs', value: totals.carbs, goal: this.settings.carbsGoal() },
      { key: 'fat', label: 'Fat', value: totals.fat, goal: this.settings.fatGoal() },
    ].map((macro) => {
      const remaining = Math.max(0, macro.goal - macro.value);
      return {
        ...macro,
        remaining,
        percent: macro.goal > 0 ? Math.min(100, Math.round((macro.value / macro.goal) * 100)) : 0,
      };
    });
  });
  readonly waterIntake = computed(() => this.water.amountFor(this.selectedDate()));
  readonly waterGoal = computed(() => this.settings.waterGoal());
  readonly waterPercent = computed(() =>
    Math.min(100, Math.round((this.waterIntake() / Math.max(1, this.waterGoal())) * 100)),
  );
  readonly waterLiters = computed(() => (this.waterIntake() / 1000).toFixed(2));
  readonly waterGoalLiters = computed(() => (this.waterGoal() / 1000).toFixed(1));

  constructor() {
    void this.bootstrap();
    this.openFormFromNavigation();
  }

  private openFormFromNavigation(): void {
    if (this.route.snapshot.queryParamMap.get('log') !== '1') return;

    this.openAdd();
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { log: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private async bootstrap(): Promise<void> {
    await this.entryService.init();
  }

  mealEntries(meal: MealType): FoodEntry[] {
    return this.entryService.entriesForDate(this.selectedDate()).filter((entry) => entry.meal === meal);
  }

  mealCalories(meal: MealType): number {
    return this.mealEntries(meal).reduce((total, entry) => total + entry.calories, 0);
  }

  mealTotals(meal: MealType): EntryTotals {
    return this.mealEntries(meal).reduce<EntryTotals>(
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

  mealTarget(meal: MealType): number {
    return Math.round(this.goal() * MEAL_TARGET_SHARE[meal]);
  }

  mealPercent(meal: MealType): number {
    return Math.min(100, Math.round((this.mealCalories(meal) / Math.max(1, this.mealTarget(meal))) * 100));
  }

  async addWater(ml: number): Promise<void> {
    await this.water.add(this.selectedDate(), ml);
    void this.feedback.tap();
  }

  async removeWater(ml: number): Promise<void> {
    await this.water.remove(this.selectedDate(), ml);
    void this.feedback.tap();
  }

  shiftDay(days: number): void {
    this.selectedDate.set(shiftDateKey(this.selectedDate(), days));
    void this.feedback.tap();
  }

  goToday(): void {
    this.selectedDate.set(todayKey());
    void this.feedback.tap();
  }

  onDateChange(event: CustomEvent<{ value?: string | string[] | null }>): void {
    const value = event.detail.value;
    const first = Array.isArray(value) ? value[0] : value;
    if (first) {
      this.selectedDate.set(first.slice(0, 10));
      this.datePickerOpen.set(false);
    }
  }

  openHistory(): void {
    void this.router.navigate(['/history']);
    void this.feedback.tap();
  }

  openSettings(): void {
    void this.router.navigate(['/settings']);
    void this.feedback.tap();
  }

  openAdd(): void {
    this.presetMeal.set(null);
    this.editingEntry.set(null);
    this.formOpen.set(true);
    void this.feedback.tap();
  }

  openAddForMeal(meal: MealType): void {
    this.presetMeal.set(meal);
    this.editingEntry.set(null);
    this.formOpen.set(true);
    void this.feedback.tap();
  }

  editEntry(entry: FoodEntry): void {
    this.presetMeal.set(null);
    this.editingEntry.set(entry);
    this.formOpen.set(true);
    void this.feedback.tap();
  }

  async incrementEntry(entry: FoodEntry): Promise<void> {
    await this.entryService.incrementServings(entry.id);
    void this.feedback.tap();
  }

  async decrementEntry(entry: FoodEntry): Promise<void> {
    if ((entry.servings || 1) <= 1) {
      await this.confirmDelete(entry);
    } else {
      await this.entryService.decrementServings(entry.id);
      void this.feedback.tap();
    }
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.editingEntry.set(null);
    this.presetMeal.set(null);
  }

  async onSaved(draft: FoodEntryDraft): Promise<void> {
    const editing = this.editingEntry();
    if (editing) {
      await this.entryService.update(editing.id, draft);
    } else {
      await this.entryService.create(draft);
    }
    this.closeForm();
    void this.feedback.success();
    this.showToast(editing ? 'Meal updated' : 'Meal logged', 'success');
  }

  async confirmDelete(entry: FoodEntry): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete meal?',
      message: `Remove "${entry.name}" from this day?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            void this.deleteEntry(entry);
          },
        },
      ],
    });
    await alert.present();
  }

  private async deleteEntry(entry: FoodEntry): Promise<void> {
    await this.entryService.remove(entry.id);
    if (this.editingEntry()?.id === entry.id) {
      this.closeForm();
    }
    void this.feedback.warning();
    this.showToast('Meal deleted', 'medium');
  }

  photoUrl(photo: string): string | null {
    return this.camera.displayUrl(photo);
  }

  time(iso: string): string {
    return timeLabel(iso);
  }

  private showToast(message: string, color: string): void {
    this.toastMessage.set(message);
    this.toastColor.set(color);
    this.toastOpen.set(true);
  }
}
