import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TicketmasterService } from '../services/ticketmaster/ticketmaster.service';
import { Event } from '../services/ticketmaster/interfaces';
import { CommonModule, DatePipe } from '@angular/common'; // Add CommonModule and DatePipe
import {
  IonContent,
  IonIcon,
  IonLabel,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonChip,
  IonItem,
  IonListHeader,
  IonList,
  IonSpinner,
  IonTitle,
  IonNote,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss'],
  imports: [
    CommonModule, // Add CommonModule for NgIf and other directives
    DatePipe, // Add DatePipe for date formatting
    IonContent,
    IonIcon,
    IonLabel,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton, // Add missing component
    IonChip,
    IonItem,
    IonListHeader,
    IonList,
    IonSpinner,
    IonTitle,
    IonNote,
  ],
  standalone: true, // Make sure this component is standalone
})
export class EventDetailsPage implements OnInit {
  @ViewChild('eventHeader', { static: false }) eventHeader?: ElementRef;
  event: Event | null = null;
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private ticketmasterService: TicketmasterService
  ) { }

  ngOnInit() {
    console.log('EventDetailsPage ngOnInit');
    this.loadEventDetails();
  }

  // Add Ionic lifecycle hook for when view enters
  ionViewDidEnter() {
    // Set focus to main content element to prevent focus from staying in hidden elements
    this.setFocusToMainElement();
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

  loadEventDetails() {
    this.loading = true;
    this.error = false;

    const eventId = this.route.snapshot.paramMap.get('id');
    console.log('Event ID:', eventId);
    if (!eventId) {
      this.error = true;
      this.loading = false;
      return;
    }

    this.ticketmasterService.getEventById(eventId).subscribe({
      next: (response: Event) => {
        // The event data might be in a different structure
        console.log('Raw API response:', response);

        // Ticketmaster API often returns the data in a nested structure
        // Try this instead of direct assignment:
        if (response) {
          this.event = response;
          console.log('Event details set to:', this.event);
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
}