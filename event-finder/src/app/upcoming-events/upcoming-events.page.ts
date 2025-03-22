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

  constructor() { }

  public upcomingEvents: any[] = [];
  public eventIds: string[] = [];

  ngOnInit(): void {
    this.eventIds = (localStorage.getItem('events') || "").split(",").filter((id: string) => id !== "");
    console.log("Event ids:");
    console.log(this.eventIds);
    console.log("Upcoming events:");
    console.log(this.upcomingEvents);

    this.eventIds.forEach((id: string) => {
      this.predictHqService.getEventById(id).subscribe((event: any) => {
        this.upcomingEvents.push(event.results[0]);
      });
    });
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

  removeEvent(eventId: string) {
    console.log("Removing event with ID: " + eventId);
    this.eventIds = this.eventIds.filter((id: string) => id !== eventId);
    localStorage.setItem('events', this.eventIds.join(","));
    this.upcomingEvents = this.upcomingEvents.filter((event: any) => event.id !== eventId);
  }


}
