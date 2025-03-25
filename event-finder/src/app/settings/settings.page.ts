import { Component, OnInit } from '@angular/core';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonContent, 
  IonToggle,
 } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonToggle,
  ],
})
export class SettingsPage implements OnInit {
  // Default states for settings toggles
  notificationsEnabled: boolean = true;
  darkModeEnabled: boolean = false;
  

  constructor() {}

  ngOnInit() {
    // Get dark mode preference from storage, or use default (light mode)
    this.darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    this.applyDarkMode(this.darkModeEnabled);
  }

  // Handle notification preference changes
  toggleNotifications() {
    localStorage.setItem('notifications', this.notificationsEnabled.toString());
  }

  // Switch between light/dark themes
  toggleDarkMode() {
    this.applyDarkMode(this.darkModeEnabled);
    // Save user preference for next time they open the app
    localStorage.setItem('darkMode', this.darkModeEnabled.toString());
  }

  // Change theme by adding/removing CSS classes
  private applyDarkMode(enable: boolean) {
    const body = document.querySelector('body');
    if (enable) {
      body?.classList.remove('light');
      body?.classList.add('dark');
    } else {
      body?.classList.remove('dark');
      body?.classList.add('light');
    }
  }
}
