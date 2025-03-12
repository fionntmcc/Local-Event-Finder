import { Component, inject } from '@angular/core';
import {
  IonList, IonHeader, IonToolbar, IonTitle, IonContent, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonPopover, InfiniteScrollCustomEvent, IonInfiniteScroll,
  IonInfiniteScrollContent,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { TicketmasterService } from '../services/ticketmaster/ticketmaster.service';
import { PredictHqService } from '../services/predict-hq/predict-hq.service';
import { ApiResult, Event } from '../services/ticketmaster/interfaces';
import { finalize, catchError } from 'rxjs';

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
  ],
})

export class HomePage {
  // inject TicketmasterService
  private ticketmasterService = inject(TicketmasterService);
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
    this.ticketmasterService.getEvents(this.currentPage).pipe(
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
        next: (res: ApiResult) => {
          // print events to console
          console.log(res);
          // push event to event array
          this.events.push(...res._embedded.events);
          console.log(this.events);
          // disable InfiniteScroll if total pages equals current page
          /* if (scroll) {
            scroll.target.disabled = res.total_pages === this.currentPage;
          } */
        },
      });

      // get events on currentPage
    this.predictHqService.getEvents(0, this.latitude, this.longitude).pipe(
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
          console.log("PredictHq result: ");
          console.log(res);
          // push event to event array
          //this.events.push(...res._embedded.events);
          //console.log(this.events);
          // disable InfiniteScroll if total pages equals current page
          /* if (scroll) {
            scroll.target.disabled = res.total_pages === this.currentPage;
          } */
        },
      });
  } 
}