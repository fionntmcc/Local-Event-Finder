import { Component, inject } from '@angular/core';
import {
  IonList, IonHeader, IonToolbar, IonTitle, IonContent, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
  IonButton, IonPopover, InfiniteScrollCustomEvent, IonInfiniteScroll, IonInfiniteScrollContent,
  IonChip, IonIcon,
} from '@ionic/angular/standalone';
import { NgFor, NgIf, NgStyle, TitleCasePipe } from '@angular/common';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { PredictHqService } from '../services/predict-hq/predict-hq.service'
import { finalize, catchError } from 'rxjs';
import { ApiResult, Event } from '../services/predict-hq/interfaces';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
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
    ExploreContainerComponent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonButton,
    IonPopover,
    IonChip,
    IonIcon,
    NgFor,
    NgIf,
    NgStyle,
    TitleCasePipe,
  ],
})

export class HomePage {
  // inject PredictHqService
  private predictHqService = inject(PredictHqService);

  // Necessary inits
  private currentPage: number = 1;
  public events: Event[] = [];
  public error = null;
  public id: string = "";
  public value: string = "";
  public isHelpOpen: boolean = false;
  public isLoading: boolean = false;
  
  // Add properties for location data
  public latitude: number = 0;
  public longitude: number = 0;
  public locationAvailable: boolean = false;

  constructor() { }

  ionViewWillEnter() {
    // reset variables
    this.currentPage = 1;
    this.events = [];
    this.error = null;
    this.id = "";
    this.value = "";
    this.isHelpOpen = false;
    this.isLoading = false;
    this.locationAvailable = false;

    // Get user's location first
    this.getUserLocation().then(() => {
      // load events after retrieving location
      this.loadEvents();
    }).catch(error => {
      console.error('Error getting location:', error);
      // If location retrieval fails, load events anyway with default location
      this.loadEvents();
    });
  }

  // Get the user's current location
  async getUserLocation(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.log('Geolocation is not supported by this browser');
        reject('Geolocation not supported');
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.locationAvailable = true;
          console.log(`User location: ${this.latitude}, ${this.longitude}`);
          resolve();
        },
        (error) => {
          console.error('Error getting location', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  // initialises events on page startup
  loadEvents(scroll?: InfiniteScrollCustomEvent) {

    this.error = null;

      // get events on currentPage
    this.predictHqService.getEvents(this.currentPage, this.latitude, this.longitude).pipe(
      finalize(() => {
        /* this.isLoading = false;
        if (scroll) {
          scroll.target.complete();
        } */
      }),
      // if error
      catchError((e) => {
        console.log(e);
        this.error = e.error.status_message;
        return [];
      })
    )
      // create Observable
      .subscribe({
        // use next() block
        next: (res) => {
          // print events to console
          console.log(res);
          // push event to event array
          this.events.push(...res.results);
          console.log(this.events);
          //console.log(this.events);
          // disable InfiniteScroll if total pages equals current page
          /* if (scroll) {
            scroll.target.disabled = res.total_pages === this.currentPage;
          } */
        },
      });
  } 

  // Format date for display
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
  
  // Calculate distance from user's location
  getDistance(eventLat: number, eventLng: number): string {
    if (!this.locationAvailable) {
      return 'Distance unknown';
    }
    
    // Earth's radius in km
    const R = 6371; 
    
    // Convert degrees to radians
    const dLat = this.toRad(eventLat - this.latitude);
    const dLon = this.toRad(eventLng - this.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(this.latitude)) * Math.cos(this.toRad(eventLat)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
      
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    } else {
      return `${distance.toFixed(1)} km`;
    }
  }
  
  private toRad(degrees: number): number {
    return degrees * Math.PI / 180;
  }
  
  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  // Truncate description
  truncateDescription(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
  
  // Limit the number of labels to display
  getLimitedLabels(labels: string[], limit: number): string[] {
    if (!labels) return [];
    return labels.slice(0, limit);
  }
}