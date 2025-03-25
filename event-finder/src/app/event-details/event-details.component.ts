import { Component, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TicketmasterService } from '../services/ticketmaster/ticketmaster.service';
import { Event } from '../services/ticketmaster/interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Add this import
import {
  IonContent,
  IonLabel,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonItem,
  IonList,
  IonSpinner,
  IonTitle,
  IonNote,
  IonToggle,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss'],
  imports: [
    CommonModule,
    FormsModule, // Add FormsModule to the imports array
    IonContent,
    IonLabel,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonItem,
    IonList,
    IonSpinner,
    IonTitle,
    IonNote,
    IonToggle,
  ],
  standalone: true,
})
export class EventDetailsPage {
  @ViewChild('eventHeader', { static: false }) eventHeader?: ElementRef;
  event: Event | null = null;
  loading = true;
  error = false;
  eventStatus: boolean = false;
  eventIds: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private ticketmasterService: TicketmasterService
  ) { }


  // Add Ionic lifecycle hook for when view enters
  ionViewWillEnter() {
    // Set focus to main content element to prevent focus from staying in hidden elements
    this.setFocusToMainElement();
    this.eventIds = (localStorage.getItem('events') || '').split(',').filter((id: string) => id !== '');

    // Call loadEventDetails to fetch the event data
    this.loadEventDetails();
  }

  // Method to set focus to first focusable element in the component
  setFocusToMainElement() {
    setTimeout(() => {
      if (this.eventHeader) {
        this.eventHeader.nativeElement.focus();
      } else {
        const focusableElements = document.querySelector('app-event-details')
          ?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements && focusableElements.length > 0) {
          (focusableElements[0] as HTMLElement).focus();
        }
      }
    }, 150); // Small delay to ensure elements are rendered
  }

  toggleEventStatus() {

    // Update the event status in the local storage
    if (this.event) {
      if (this.eventStatus) {
        this.eventIds.push(this.event.id);
      } else {
        this.eventIds = this.eventIds.filter((id) => id !== this.event?.id);
      }

      localStorage.setItem('events', this.eventIds.join(','));
    }
  }

  loadEventDetails() {
    this.loading = true;
    this.error = false;

    const eventId = this.route.snapshot.paramMap.get('id');
    if (!eventId) {
      this.error = true;
      this.loading = false;
      return;
    }

    this.ticketmasterService.getEventById(eventId).subscribe({
      next: (response: Event) => {

        // Ticketmaster API often returns the data in a nested structure
        // Try this instead of direct assignment:
        if (response) {
          this.event = response;
          
          // Set the eventStatus based on whether this event ID is in the saved events
          this.eventStatus = this.eventIds.includes(this.event.id);
        } else {
          console.error('No event data in the response');
          this.error = true;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching event details:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  // Open native share dialog to share event with friends
  shareEvent(event: any) {
    if (!event) return;

    const title = event.title;
    const url = event.url || `https://event-finder-123.firebaseapp.com/event/${event.id}`;
    const text = `Check out this event: ${title} - ${url}`;

    if (navigator.share) {
      navigator.share({
        title,
        text,
        url
      });
    }
  }
}