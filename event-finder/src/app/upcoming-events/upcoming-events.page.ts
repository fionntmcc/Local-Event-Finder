import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonList,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonItem,
  IonBadge,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';

import { TicketmasterService } from '../services/ticketmaster/ticketmaster.service';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-upcoming-events',
  templateUrl: 'upcoming-events.page.html',
  styleUrls: ['upcoming-events.page.scss'],
  imports: [
    CommonModule,
    RouterLink,
    IonList,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonItem,
    IonBadge,
    IonIcon,
    IonSpinner,
  ],
})
export class UpcomingEventsPage {

  ticketmasterService = new TicketmasterService();
  notificationsEnabled = false;

  constructor() { }

  // Store user's saved events
  public events: any[] = [];
  public eventIds: string[] = [];
  public loading = true;
  public error = false;


  // Runs every time the page becomes active
  ionViewWillEnter() {
    // Get saved event IDs from local storage
    this.eventIds = (localStorage.getItem('events') || "").split(",").filter((id: string) => id !== "");
    console.log("Event ids:");
    console.log(this.eventIds);
    this.events = [];

    // Fetch details for each saved event
    this.eventIds.forEach((id: string) => {
      console.log("Fetching event with ID: " + id);
      this.ticketmasterService.getEventById(id).subscribe({
            next: (response: any) => {
      
              // Ticketmaster API often returns the data in a nested structure
              // Try this instead of direct assignment:
              if (response) {
                this.events.push(response);
              } else {
                console.error('No event data in the response');
                this.error = true;
              }
              this.loading = false;
            },
            error: (err) => {
              console.error('Error fetching event details:', err);
              this.error = true;
              this.loading = false;
            }
          });
    });
  }

  // Set up notifications for events on the day they happen
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
            // Create a unique ID from the event ID (hacky but works)
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

  // Open native share dialog to share event with friends
  shareEvent(event: any) {
    console.log("Sharing event with ID: " + event.id);
    if (!event) return;

    const title = event.title;
    const url = event.url || `https://event-finder.com/event/${event.id}`;
    const text = `Check out this event: ${title} - ${url}`;

    if (navigator.share) {
      navigator.share({
        title,
        text,
        url
      });
    }
  }

  // Remove event from saved list and cancel its notification
  async removeEvent(eventId: string) {
    console.log("Removing event with ID: " + eventId);
    this.eventIds = this.eventIds.filter((id: string) => id !== eventId);
    localStorage.setItem('events', this.eventIds.join(","));
    this.events = this.events.filter((event: any) => event.id !== eventId);

    // Cancel notification when event is removed
    if (this.notificationsEnabled) {
      try {
        const notificationId = parseInt(eventId.replace(/\D/g, '').substring(0, 8) || '1');
        await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
        console.log(`Cancelled notification for event ${eventId}`);
      } catch (error) {
        console.error('Error cancelling notification:', error);
      }
    }
  }
}
