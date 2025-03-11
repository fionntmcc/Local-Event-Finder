import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-upcoming-events',
  templateUrl: 'upcoming-events.page.html',
  styleUrls: ['upcoming-events.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent],
})
export class UpcomingEventsPage {
  constructor() {}
}
