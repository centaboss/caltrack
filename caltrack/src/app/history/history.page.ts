import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import { EntryService } from '../core/services/entry.service';
import { FeedbackService } from '../core/services/feedback.service';
import { SettingsService } from '../core/services/settings.service';
import { todayKey } from '../core/utils/date.utils';
import type { DailyInsight } from '../core/utils/insights.utils';
import { buildDailySeries, summarizeSeries } from '../core/utils/insights.utils';

type Period = '7' | '30';

@Component({
  selector: 'app-history',
  templateUrl: 'history.page.html',
  styleUrls: ['history.page.scss'],
  imports: [
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar,
  ],
})
export class HistoryPage {
  readonly entryService = inject(EntryService);
  readonly settings = inject(SettingsService);
  private readonly feedback = inject(FeedbackService);
  private readonly router = inject(Router);

  readonly period = signal<Period>('7');
  readonly today = todayKey();

  readonly series = computed(() => buildDailySeries(this.entryService.entries(), todayKey(), Number(this.period())));
  readonly summary = computed(() => summarizeSeries(this.series(), this.settings.dailyGoal()));
  readonly goal = computed(() => this.settings.dailyGoal());
  readonly chartMax = computed(() => Math.max(this.goal(), ...this.series().map((day) => day.totals.calories), 1));
  readonly goalLine = computed(() => (this.goal() / this.chartMax()) * 100);
  readonly hasData = computed(() => this.summary().loggedDays > 0);
  readonly periodLabel = computed(() => (this.period() === '7' ? 'Last 7 days' : 'Last 30 days'));
  readonly adherenceGradient = computed(
    () => `conic-gradient(#ffd4a8 ${this.summary().adherencePercent}%, rgba(255, 255, 255, 0.16) 0)`,
  );

  constructor() {
    void this.refresh();
  }

  ionViewWillEnter(): void {
    void this.refresh();
  }

  private async refresh(): Promise<void> {
    await this.entryService.init();
  }

  onPeriodChange(event: CustomEvent<{ value?: string | number | null }>): void {
    const next: Period = String(event.detail.value ?? '7') === '30' ? '30' : '7';
    if (next === this.period()) return;

    this.period.set(next);
    void this.feedback.tap();
  }

  barHeight(day: DailyInsight): number {
    return Math.max(day.totals.count > 0 ? 5 : 2, (day.totals.calories / this.chartMax()) * 100);
  }

  isOver(day: DailyInsight): boolean {
    return day.totals.calories > this.goal();
  }

  goHome(): void {
    void this.router.navigate(['/home'], { queryParams: { log: '1' } });
    void this.feedback.tap();
  }
}
