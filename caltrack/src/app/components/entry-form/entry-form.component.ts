import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { SafeUrl } from '@angular/platform-browser';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonNote,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import type { FoodCategory, FoodPreset } from '../../core/data/food-catalog';
import { FOOD_CATEGORIES, FOOD_PRESETS } from '../../core/data/food-catalog';
import type { FoodEntry, FoodEntryDraft, MealType } from '../../core/models/food-entry.model';
import { MEALS } from '../../core/models/food-entry.model';
import { CameraService } from '../../core/services/camera.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { fromDateKey } from '../../core/utils/date.utils';

@Component({
  selector: 'app-entry-form',
  templateUrl: 'entry-form.component.html',
  styleUrls: ['entry-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonNote,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonTitle,
    IonToolbar,
  ],
})
export class EntryFormComponent {
  readonly entry = input<FoodEntry | null>(null);
  readonly date = input.required<string>();
  readonly defaultMeal = input<MealType | null>(null);
  readonly saved = output<FoodEntryDraft>();
  readonly deleted = output<FoodEntry>();
  readonly cancelled = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly camera = inject(CameraService);
  private readonly feedback = inject(FeedbackService);

  readonly meals = MEALS;
  readonly presets = FOOD_PRESETS;
  readonly categories = FOOD_CATEGORIES;
  readonly photo = signal<string | null>(null);
  readonly capturing = signal(false);
  readonly error = signal<string | null>(null);
  readonly search = signal('');
  readonly category = signal<FoodCategory | 'all'>('all');
  readonly filteredPresets = computed(() => {
    const term = this.search().trim().toLowerCase();
    const category = this.category();

    return this.presets.filter(
      (preset) =>
        (category === 'all' || preset.category === category) && (!term || preset.name.toLowerCase().includes(term)),
    );
  });

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    calories: [0, [Validators.required, Validators.min(0), Validators.max(50000)]],
    protein: [0, [Validators.min(0), Validators.max(5000)]],
    carbs: [0, [Validators.min(0), Validators.max(10000)]],
    fat: [0, [Validators.min(0), Validators.max(5000)]],
    servings: [1, [Validators.required, Validators.min(1), Validators.max(50)]],
    meal: ['breakfast' as MealType, Validators.required],
    notes: [''],
    photo: [''],
    consumedAt: [new Date().toISOString()],
  });

  constructor() {
    effect(() => {
      const entry = this.entry();
      const date = this.date();

      if (entry) {
        this.form.reset({
          name: entry.name,
          calories: entry.calories,
          protein: entry.protein,
          carbs: entry.carbs,
          fat: entry.fat,
          servings: entry.servings ?? 1,
          meal: entry.meal,
          notes: entry.notes,
          photo: entry.photo,
          consumedAt: entry.consumedAt,
        });
        this.photo.set(entry.photo || null);
      } else {
        this.form.reset({
          name: '',
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          servings: 1,
          meal: this.defaultMeal() ?? this.mealForNow(),
          notes: '',
          photo: '',
          consumedAt: this.dateAtCurrentTime(date),
        });
        this.photo.set(null);
      }

      this.error.set(null);
    });
  }

  setCategory(category: FoodCategory | 'all'): void {
    this.category.set(category);
    void this.feedback.tap();
  }

  onSearch(event: CustomEvent<{ value?: string | null }>): void {
    this.search.set(event.detail.value ?? '');
  }

  async capturePhoto(): Promise<void> {
    this.capturing.set(true);
    this.error.set(null);

    try {
      const uri = await this.camera.captureMealPhoto();
      if (uri) {
        this.photo.set(uri);
        this.form.controls.photo.setValue(uri);
        void this.feedback.tap();
      }
    } catch {
      this.error.set('Could not open the camera. Check camera permissions and try again.');
    } finally {
      this.capturing.set(false);
    }
  }

  removePhoto(): void {
    this.photo.set(null);
    this.form.controls.photo.setValue('');
    void this.feedback.tap();
  }

  adjustFormServings(delta: number): void {
    const current = Math.max(1, this.form.controls.servings.value || 1);
    const next = Math.max(1, current + delta);
    if (next === current) return;

    const scale = next / current;
    const c = Math.round((Number(this.form.controls.calories.value) || 0) * scale);
    const p = Math.round((Number(this.form.controls.protein.value) || 0) * scale * 10) / 10;
    const carbs = Math.round((Number(this.form.controls.carbs.value) || 0) * scale * 10) / 10;
    const f = Math.round((Number(this.form.controls.fat.value) || 0) * scale * 10) / 10;

    this.form.patchValue({
      servings: next,
      calories: c,
      protein: p,
      carbs: carbs,
      fat: f,
    });
    void this.feedback.tap();
  }

  applyPreset(preset: FoodPreset): void {
    const servings = Math.max(1, this.form.controls.servings.value || 1);
    this.form.patchValue({
      name: preset.name,
      calories: preset.calories * servings,
      protein: preset.protein * servings,
      carbs: preset.carbs * servings,
      fat: preset.fat * servings,
    });
    void this.feedback.tap();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.saved.emit({
      name: value.name.trim(),
      calories: Number(value.calories) || 0,
      protein: Number(value.protein) || 0,
      carbs: Number(value.carbs) || 0,
      fat: Number(value.fat) || 0,
      servings: Number(value.servings) || 1,
      meal: value.meal,
      notes: value.notes.trim(),
      photo: value.photo,
      consumedAt: this.combineDateAndTime(this.date(), value.consumedAt),
    });
  }

  deleteEntry(): void {
    const entry = this.entry();
    if (entry) {
      this.deleted.emit(entry);
    }
  }

  cancel(): void {
    this.cancelled.emit();
  }

  displayUrl(photo: string | null): SafeUrl | string | null {
    return this.camera.displayUrl(photo);
  }

  private combineDateAndTime(dateKey: string, iso: string): string {
    const time = new Date(iso);
    const date = fromDateKey(dateKey);
    date.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), 0);
    return date.toISOString();
  }

  private dateAtCurrentTime(dateKey: string): string {
    const date = fromDateKey(dateKey);
    const now = new Date();
    date.setHours(now.getHours(), now.getMinutes(), 0, 0);
    return date.toISOString();
  }

  private mealForNow(): MealType {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 15) return 'lunch';
    if (hour < 20) return 'dinner';
    return 'snack';
  }
}
