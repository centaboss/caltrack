import { signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import type { FoodEntry } from '../core/models/food-entry.model';
import { EntryService } from '../core/services/entry.service';
import { FeedbackService } from '../core/services/feedback.service';
import { SettingsService } from '../core/services/settings.service';

import { HistoryPage } from './history.page';

function entry(overrides: Partial<FoodEntry> = {}): FoodEntry {
  const now = new Date().toISOString();
  return {
    id: 'entry-1',
    name: 'Test meal',
    calories: 600,
    protein: 30,
    carbs: 60,
    fat: 20,
    meal: 'lunch',
    notes: '',
    photo: '',
    consumedAt: now,
    createdAt: now,
    updatedAt: now,
    synced: true,
    deleted: false,
    ...overrides,
  };
}

describe('HistoryPage', () => {
  let component: HistoryPage;
  let fixture: ComponentFixture<HistoryPage>;

  const entryService = {
    entries: signal<FoodEntry[]>([entry()]),
    init: vi.fn().mockResolvedValue(undefined),
    sync: vi.fn().mockResolvedValue({ ok: true }),
  };

  const settings = {
    dailyGoal: signal(2000),
    apiBaseUrl: signal('http://localhost:3000/api'),
    hapticsEnabled: signal(true),
    ready: Promise.resolve(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryPage],
      providers: [
        provideRouter([]),
        { provide: EntryService, useValue: entryService },
        { provide: SettingsService, useValue: settings },
        {
          provide: FeedbackService,
          useValue: {
            tap: vi.fn().mockResolvedValue(undefined),
            success: vi.fn().mockResolvedValue(undefined),
            warning: vi.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('summarizes the last 7 days by default', () => {
    expect(component.series()).toHaveLength(7);
    expect(component.summary().loggedDays).toBe(1);
    expect(component.summary().totalCalories).toBe(600);
    expect(component.summary().averageCalories).toBe(600);
    expect(component.summary().adherencePercent).toBe(100);
  });

  it('switches to a 30 day window', () => {
    component.onPeriodChange({ detail: { value: '30' } } as CustomEvent<{ value: string }>);

    expect(component.period()).toBe('30');
    expect(component.series()).toHaveLength(30);
    expect(component.periodLabel()).toBe('Last 30 days');
  });
});
