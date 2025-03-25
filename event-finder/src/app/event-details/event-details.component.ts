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
import { TicketmasterService } from '../services/ticketmaster/ticketmaster.service';
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
  // Use dependency injection for services
  // private predictHqService = inject(PredictHqService);
  private locationService = inject(LocationService);
  private ticketmasterService = inject(TicketmasterService);
  private route = inject(ActivatedRoute);

  // Track state variables
  public notificationsEnabled = false;
  public event: any = null;
  public isPopupActive: boolean = false;
  public homepage: string = "";
  public status: string = "";
  public eventId: string = "";
  public eventStatus: boolean = false; // If event is saved by user

  constructor() {
    // Check if we can show notifications on this device
    this.checkNotificationPermissions();
  }

  ngOnInit() {
    // Get the event ID from the URL
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.eventId = id;
        this.loadEventDetails(id);
      }
    });

  }

  // Fetch event details from API and check if user has saved it
  loadEventDetails(id: string) {
    // Check if this event is in the user's saved events
    this.eventStatus = (localStorage.getItem("events") || "").includes(id);

    this.ticketmasterService.getEventById(id).subscribe((res) => {
      if (res) {
        this.event = res;

        console.log('Event details:', this.event);
        // Set homepage URL if available
        if (this.event.url) {
          this.homepage = this.event.url;
        }
      }
    });
  }

  // Make sure we have permission to send notifications
  async checkNotificationPermissions() {
    const { display } = await LocalNotifications.checkPermissions();
    this.notificationsEnabled = display === 'granted';

    if (!this.notificationsEnabled) {
      const { display } = await LocalNotifications.requestPermissions();
      this.notificationsEnabled = display === 'granted';
    }
  }

  // Schedule a notification for this event
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

      // Debug code - sends a test notification 5 seconds from now
      // This is just for demo purposes, should remove in production
      const notificationTimeTest = new Date();
      notificationTimeTest.setSeconds(notificationTime.getSeconds() + 5);

      try {
        await LocalNotifications.schedule({
          notifications: [{
            id: parseInt(event.id.replace(/\D/g, '').substring(0, 8) || '1'),
            title: 'Event Today: ' + event.title,
            body: `Don't forget your event "${event.title}" is today!`,
            schedule: { at: notificationTimeTest },
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

  // Open the event website in the device browser
  async openEventWebsite() {
    if (this.homepage) {
      await Browser.open({ url: this.homepage });
    } else if (this.event && this.event.url) {
      await Browser.open({ url: this.event.url });
    }
  }

  // Open Google Maps with directions to the event
  getDirections() {
    if (!this.event || !this.event.location || !this.event.location.length) return;

    const lat = this.event.location[1];
    const lng = this.event.location[0];
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    Browser.open({ url });
  }

  // Open the native share dialog
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

  // Toggle whether this event is saved or not
  toggleEventStatus() {
    this.saveStatus();
  }

  // Update the saved events list in localStorage
  async saveStatus() {
    let eventString: string = localStorage.getItem("events") || "";

    if (this.eventStatus) {
      // Add this event to saved events
      eventString += this.eventId + ",";

      // Schedule notification if user has notifications enabled
      if (localStorage.getItem("notifications") === "true") {
        this.scheduleNotification(this.event);
      }

    } else {
      // Remove this event from saved events
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

  // Calculate the distance from user to this event
  getDistance(): string {
    if (!this.event || !this.event.location) return 'Distance unknown';
    return this.locationService.getDistance(this.event.location[1], this.event.location[0]);
  }
}