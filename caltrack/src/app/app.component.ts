import { Component, inject } from '@angular/core';
import type { OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';

import './core/icons';
import { EntryService } from './core/services/entry.service';
import { SettingsService } from './core/services/settings.service';
import { WaterService } from './core/services/water.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  private readonly entryService = inject(EntryService);
  private readonly settingsService = inject(SettingsService);
  private readonly waterService = inject(WaterService);

  ngOnInit(): void {
    void this.entryService.init();
    void this.settingsService.ready;
    void this.waterService.ready;
  }
}
