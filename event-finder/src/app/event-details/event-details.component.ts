// All necessary imports
import { Component, Input, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLinkWithHref, ActivatedRoute } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonCard, IonCardHeader,
  IonCardTitle, IonCardSubtitle, IonCardContent, IonText, IonLabel, IonButtons,
  IonButton, IonBackButton, IonItem, IonNav, IonAvatar, IonToggle, IonPopover,
  IonInput, IonRadio, IonBadge, IonSpinner, IonList, IonImg
} from '@ionic/angular/standalone';
import { PredictHqService } from '../services/predict-hq/predict-hq.service';
import { LocationService } from '../services/location/location.service';
import { Browser } from '@capacitor/browser';
import { FormsModule } from '@angular/forms';
// import { Event } from '../services/predict-hq/interfaces';

@Component({
  selector: 'app-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonCard, IonCardHeader,
    IonCardTitle, IonCardSubtitle, IonCardContent, IonText, IonLabel, IonButtons,
    IonButton, IonBackButton, IonItem, DatePipe, CurrencyPipe, IonNav, IonAvatar,
    RouterLinkWithHref, IonToggle, IonPopover, IonInput, IonRadio, FormsModule,
    IonBadge, IonSpinner, IonList, IonImg
  ]
})
export class EventDetailsPage implements OnInit {
  // inject services
  private predictHqService = inject(PredictHqService);
  private locationService = inject(LocationService);
  private route = inject(ActivatedRoute);

  // Necessary inits
  public event: any = null;
  public isPopupActive: boolean = false;
  public homepage: string = "";
  public status: string = "";
  public eventId: string = "";
  public eventStatus: boolean = false;

  constructor() { }

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
        this.event = res.results[0];

        // Set homepage URL if available
        if (this.event.url) {
          this.homepage = this.event.url;
        }
      }
    });
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

  saveStatus() {
    let eventString: string = localStorage.getItem("events") || "";

    if (this.eventStatus) {
      eventString += this.eventId + ",";
    } else {
      eventString = eventString.replace(this.eventId + ",", "");
    }
    localStorage.setItem("events", eventString);

    console.log(localStorage.getItem("events"));
  }

  getDistance(): string {
    if (!this.event || !this.event.location) return 'Distance unknown';
    return this.locationService.getDistance(this.event.location[1], this.event.location[0]);
  }
}