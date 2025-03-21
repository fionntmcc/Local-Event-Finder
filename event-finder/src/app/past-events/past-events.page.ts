import { Component } from '@angular/core';
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
  selector: 'app-past-events',
  templateUrl: 'past-events.page.html',
  styleUrls: ['past-events.page.scss'],
  imports: [
    ExploreContainerComponent,
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
  ],
})

export class PastEventsPage {
  pastEvents: { 
    id: string;
    title: string; 
    date: string; 
    location: string; 
    imageUrl: string 
    rating: number | undefined; 
  }[];
  
  constructor() {
    this.pastEvents = [
      {
        id: '1', 
        title: 'Pub Crawl',
        date: '2025-03-15', 
        location: 'Mary Mullens', 
        imageUrl: 'https://th.bing.com/th?id=OIP.UY8_4eKIWsH5wic_HOgvNAHaEg&w=298&h=180&c=10&rs=1&qlt=99&bgcl=fffffe&r=0&o=6&dpr=1.1&pid=23.1' ,
        rating: undefined,
      },
      { 
        id: '2', 
        title: 'Art Exhibition', 
        date: '2025-03-20', 
        location: 'Galway City Museum', 
        imageUrl: 'https://www.bing.com/th?id=OIP.6jl4Q0R_r19--rksPIadlQHaFR&w=176&h=185&c=8&rs=1&qlt=90&o=6&dpr=1.1&pid=3.1&rm=2',
        rating: 4,
      },
      { 
        id: '3', 
        title: 'Food Festival', 
        date: '2025-03-25', 
        location: 'Eyre Square', 
        imageUrl: 'https://th.bing.com/th?id=OIP.tvALJOlQexfmeBPRV5jr2AHaE8&w=200&h=200&c=10&o=6&dpr=1.1&pid=La+gastronomie+africaine+fait+son+festival&rm=2',
        rating: 5,
      },
    ];
  }
}