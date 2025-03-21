import { Component, OnInit } from '@angular/core';
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
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-upcoming-events',
  templateUrl: 'upcoming-events.page.html',
  styleUrls: ['upcoming-events.page.scss'],
  imports: [
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
    ExploreContainerComponent],
})
export class UpcomingEventsPage implements OnInit {

  constructor() { }

  ngOnInit(): void {
      this.upcomingEvents = [
        {
          id: '1',
          title: 'Event 1',
          date: '2022-01-01',
          location: 'Location 1',
          imageUrl: 'test',
          rating: 4.5
        },
        {
          id: '2',
          title: 'Event 2',
          date: '2022-02-02',
          location: 'Location 2',
          imageUrl: 'test',
          rating: 3.5
        },
      ];
  }

  public upcomingEvents: any[] = [];


}
