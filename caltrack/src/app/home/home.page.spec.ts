import { signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { vi } from 'vitest';

import { CameraService } from '../core/services/camera.service';
import { EntryService } from '../core/services/entry.service';
import { FeedbackService } from '../core/services/feedback.service';
import { SettingsService } from '../core/services/settings.service';
import { WaterService } from '../core/services/water.service';

import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  const entryService = {
    entries: signal([]),
    loading: signal(false),
    syncing: signal(false),
    pendingCount: signal(0),
    init: vi.fn().mockResolvedValue(undefined),
    sync: vi.fn().mockResolvedValue({ ok: true }),
    totalsForDate: vi.fn().mockReturnValue({
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      count: 0,
    }),
    entriesForDate: vi.fn().mockReturnValue([]),
    create: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  };

  const settings = {
    dailyGoal: signal(2000),
    proteinGoal: signal(150),
    carbsGoal: signal(200),
    fatGoal: signal(67),
    waterGoal: signal(2000),
    apiBaseUrl: signal('http://localhost:3000/api'),
    hapticsEnabled: signal(true),
    ready: Promise.resolve(),
  };

  const water = {
    intake: signal({}),
    amountFor: vi.fn().mockReturnValue(0),
    add: vi.fn().mockResolvedValue(250),
    remove: vi.fn().mockResolvedValue(0),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideRouter([]),
        { provide: EntryService, useValue: entryService },
        { provide: SettingsService, useValue: settings },
        { provide: WaterService, useValue: water },
        { provide: CameraService, useValue: { displayUrl: vi.fn() } },
        {
          provide: FeedbackService,
          useValue: {
            tap: vi.fn().mockResolvedValue(undefined),
            success: vi.fn().mockResolvedValue(undefined),
            warning: vi.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: AlertController,
          useValue: { create: vi.fn().mockResolvedValue({ present: vi.fn() }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('computes the daily calorie goal', () => {
    expect(component.goal()).toBe(2000);
    expect(component.remaining()).toBe(2000);
  });
});
