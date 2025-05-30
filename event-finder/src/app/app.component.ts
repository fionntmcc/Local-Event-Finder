import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { LocationService } from './services/location/location.service';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(private locationService: LocationService, private storageService: StorageService) {
    // Location service will initialize and get the position
    // You can access it anywhere in the app by injecting the LocationService

    locationService.getCurrentPosition().subscribe((position) => {
      console.log('Current position', position);
      storageService.set('currentPosition', position);
    });
    
    // Check for dark mode preference on app startup
    this.initializeTheme();
  }

  // Initialize theme based on user preference
  private initializeTheme() {
    // Get dark mode preference from localStorage, default to light mode
    const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    
    // Apply the appropriate theme
    const body = document.querySelector('body');
    if (darkModeEnabled) {
      body?.classList.remove('light');
      body?.classList.add('dark');
    } else {
      body?.classList.remove('dark');
      body?.classList.add('light');
    }
  }
}
