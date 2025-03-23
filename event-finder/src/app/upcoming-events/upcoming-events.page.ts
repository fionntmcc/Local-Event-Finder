import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonList,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonPopover,
  IonItem,
  IonBadge,
  IonLabel,
  IonAvatar,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { PredictHqService } from '../services/predict-hq/predict-hq.service';
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
    IonText,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonPopover,
    IonItem,
    IonBadge,
    IonLabel,
    IonAvatar,
    IonIcon,
    IonSpinner,
    ExploreContainerComponent],
})
export class UpcomingEventsPage implements OnInit {

  predictHqService = new PredictHqService();
  notificationsEnabled = false;

  constructor() { 
    this.checkNotificationPermissions();
  }

  public upcomingEvents: any[] = [];
  public eventIds: string[] = [];

  async checkNotificationPermissions() {
    const { display } = await LocalNotifications.checkPermissions();
    this.notificationsEnabled = display === 'granted';
    
    if (!this.notificationsEnabled) {
      const { display } = await LocalNotifications.requestPermissions();
      this.notificationsEnabled = display === 'granted';
    }
  }

  ngOnInit(): void {
    this.eventIds = (localStorage.getItem('events') || "").split(",").filter((id: string) => id !== "");
    console.log("Event ids:");
    console.log(this.eventIds);
    console.log("Upcoming events:");
    console.log(this.upcomingEvents);

    this.eventIds.forEach((id: string) => {
      this.predictHqService.getEventById(id).subscribe((event: any) => {
        this.upcomingEvents.push(event.results[0]);
        this.scheduleNotification(event.results[0]);
      });
    });
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
    }
  }

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

  async removeEvent(eventId: string) {
    console.log("Removing event with ID: " + eventId);
    this.eventIds = this.eventIds.filter((id: string) => id !== eventId);
    localStorage.setItem('events', this.eventIds.join(","));
    this.upcomingEvents = this.upcomingEvents.filter((event: any) => event.id !== eventId);
    
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
