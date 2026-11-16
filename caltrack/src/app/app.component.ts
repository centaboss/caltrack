import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';

import './core/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {}
}
