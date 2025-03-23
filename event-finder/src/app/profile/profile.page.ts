import { Component, OnInit } from '@angular/core';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonContent, 
  IonAvatar, 
  IonNote,
  IonToggle,
 } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ExploreContainerComponent,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonAvatar, 
    IonNote,
    IonToggle,
  ],
})
export class ProfilePage implements OnInit {
  // Toggle states
  notificationsEnabled: boolean = true;
  darkModeEnabled: boolean = false;
  locationEnabled: boolean = true;
  

  constructor() {}

  ngOnInit() {
    // Initialize dark mode from stored preference
    this.darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    this.applyDarkMode(this.darkModeEnabled);
  }

  // Toggle handlers
  toggleNotifications() {
    console.log('Notifications toggled:', this.notificationsEnabled);
    // Add your notification toggle logic here
  }

  toggleDarkMode() {
    console.log('Dark mode toggled:', this.darkModeEnabled);
    this.applyDarkMode(this.darkModeEnabled);
    // Save preference to localStorage
    localStorage.setItem('darkMode', this.darkModeEnabled.toString());
  }

  toggleLocation() {
    console.log('Location services toggled:', this.locationEnabled);
    // Add your \location services toggle logic here
  }
  
  // Apply dark mode to the entire application
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
