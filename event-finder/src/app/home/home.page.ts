import { Component, inject } from '@angular/core';
import {
  IonList, IonHeader, IonToolbar, IonTitle, IonContent, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonPopover, InfiniteScrollCustomEvent, IonInfiniteScroll,
  IonInfiniteScrollContent,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { TicketmasterService } from '../services/ticketmaster.service';
import { ApiResult, Event } from '../services/interfaces';
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

  // Necessary inits
  private currentPage: number = 1;
  public events: Event[] = [];
  public error = null;
  public id: string = "";
  public value: string = "";
  public isHelpOpen: boolean = false;
  public isLoading: boolean = false;

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

    // load events
    this.loadEvents();

    console.log(this.events);
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
  } 
}