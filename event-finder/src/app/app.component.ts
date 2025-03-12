import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { LocationService } from './services/location/location.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(private locationService: LocationService) {
    // Location service will initialize and get the position
    // You can access it anywhere in the app by injecting the LocationService
  }
}
