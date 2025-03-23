// All necessary imports
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLinkWithHref, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonText,
  IonLabel,
  IonButtons,
  IonButton,
  IonBackButton,
  IonItem,
  IonNav,
  IonAvatar,
  IonToggle,
  IonPopover,
  IonInput,
  IonRadio,
  IonBadge,
  IonSpinner,
  IonList,
  IonImg
} from '@ionic/angular/standalone';
import { PredictHqService } from '../services/predict-hq/predict-hq.service';
import { LocationService } from '../services/location/location.service';
import { Browser } from '@capacitor/browser';
import { LocalNotifications } from '@capacitor/local-notifications';
// import { Event } from '../services/predict-hq/interfaces';

@Component({
  selector: 'app-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,  // Move FormsModule earlier in the array for clarity
    DatePipe,
    CurrencyPipe,
    RouterLinkWithHref,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonText,
    IonLabel,
    IonButtons,
    IonButton,
    IonBackButton,
    IonItem,
    IonNav,
    IonAvatar,
    IonToggle,
    IonPopover,
    IonInput,
    IonRadio,
    IonBadge,
    IonSpinner,
    IonList,
    IonImg
  ]
})
export class EventDetailsPage implements OnInit {
  // inject services
  private predictHqService = inject(PredictHqService);
  private locationService = inject(LocationService);
  private route = inject(ActivatedRoute);

  // Necessary inits
  public notificationsEnabled = false;
  public event: any = null;
  public isPopupActive: boolean = false;
  public homepage: string = "";
  public status: string = "";
  public eventId: string = "";
  public eventStatus: boolean = false;

  constructor() {
    this.checkNotificationPermissions();
  }

  ngOnInit() {
    // Get event ID from route parameters
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.eventId = id;
        this.loadEventDetails(id);
      }
    });
  }

  loadEventDetails(id: string) {
    this.eventStatus = (localStorage.getItem("events") || "").includes(id);

    this.predictHqService.getEventById(id).subscribe((res) => {
      if (res && res.results && res.results.length > 0) {
        res.results[0].description.replace('Sourced from predicthq.com', '');
        this.event = res.results[0];

        // Set homepage URL if available
        if (this.event.url) {
          this.homepage = this.event.url;
        }
      }
    });
  }

  async checkNotificationPermissions() {
    const { display } = await LocalNotifications.checkPermissions();
    this.notificationsEnabled = display === 'granted';

    if (!this.notificationsEnabled) {
      const { display } = await LocalNotifications.requestPermissions();
      this.notificationsEnabled = display === 'granted';
    }
  }

  async scheduleNotification(event: any) {
    if (!this.notificationsEnabled || !event) return;

    // Parse the event start date
    const eventDate = new Date(event.start);
    const today = new Date();

    // Only schedule if the event is in the future
    if (eventDate > today) {
      // Set notification for 9:00 AM on the event day
      const notificationTime = new Date(eventDate);
      notificationTime.setHours(9, 0, 0, 0);

      try {
        await LocalNotifications.schedule({
          notifications: [{
            id: parseInt(event.id.replace(/\D/g, '').substring(0, 8) || '1'),
            title: 'Event Today: ' + event.title,
            body: `Don't forget your event "${event.title}" is today!`,
            schedule: { at: notificationTime },
            actionTypeId: '',
            extra: { eventId: event.id }
          }]
        });
        console.log(`Notification scheduled for event ${event.id} on ${notificationTime}`);
      } catch (error) {
        console.error('Error scheduling notification:', error);
      }

      // Test nofification for demo purposes
      // Set notification for 9:00 AM on the event day
      const notificationTimeTest = new Date();
      notificationTime.setMinutes(notificationTime.getMinutes() + 1);

      try {
        await LocalNotifications.schedule({
          notifications: [{
            id: parseInt(event.id.replace(/\D/g, '').substring(0, 8) || '1'),
            title: 'Event Today: ' + event.title,
            body: `Don't forget your event "${event.title}" is today!`,
            schedule: { at: notificationTime },
            actionTypeId: '',
            extra: { eventId: event.id }
          }]
        });
        console.log(`Notification scheduled for event ${event.id} on ${notificationTime}`);
      } catch (error) {
        console.error('Error scheduling notification:', error);
      }
    }
  }

  async openEventWebsite() {
    if (this.homepage) {
      await Browser.open({ url: this.homepage });
    } else if (this.event && this.event.url) {
      await Browser.open({ url: this.event.url });
    }
  }

  getDirections() {
    if (!this.event || !this.event.location || !this.event.location.length) return;

    const lat = this.event.location[1];
    const lng = this.event.location[0];
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    Browser.open({ url });
  }

  shareEvent() {
    if (!this.event) return;

    const title = this.event.title;
    const url = this.event.url || `https://event-finder.com/event/${this.event.id}`;
    const text = `Check out this event: ${title} - ${url}`;

    if (navigator.share) {
      navigator.share({
        title,
        text,
        url
      });
    }
  }

  toggleEventStatus() {
    this.saveStatus();
  }

  async saveStatus() {
    let eventString: string = localStorage.getItem("events") || "";

    if (this.eventStatus) {
      eventString += this.eventId + ",";

      if (localStorage.getItem("notifications") === "true") {
        this.scheduleNotification(this.event);
      }

    } else {
      eventString = eventString.replace(this.eventId + ",", "");

      // Cancel notification when event is removed
      if (this.notificationsEnabled) {
        try {
          const notificationId = parseInt(this.eventId.replace(/\D/g, '').substring(0, 8) || '1');
          await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
          console.log(`Cancelled notification for event ${this.eventId}`);
        } catch (error) {
          console.error('Error cancelling notification:', error);
        }
      }
    }
    localStorage.setItem("events", eventString);

    console.log(localStorage.getItem("events"));
  }

  getDistance(): string {
    if (!this.event || !this.event.location) return 'Distance unknown';
    return this.locationService.getDistance(this.event.location[1], this.event.location[0]);
  }
}