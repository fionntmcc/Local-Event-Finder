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
    ExploreContainerComponent],
})
export class UpcomingEventsPage implements OnInit {

  predictHqService = new PredictHqService();

  constructor() { }

  ngOnInit(): void {
    this.eventIds = (localStorage.getItem('events') || "").split(",").filter((id: string) => id !== "");
    console.log(this.eventIds);

    this.eventIds.forEach((id: string) => {
      this.predictHqService.getEventById(id).subscribe((event: any) => {
        this.upcomingEvents.push(event.results[0]);
        console.log(this.upcomingEvents);
      });
    });
  }

  public upcomingEvents: any[] = [];
  public eventIds: string[] = [];

}
