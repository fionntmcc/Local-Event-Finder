import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TicketmasterService } from '../../services/ticketmaster/ticketmaster.service';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.page.html',
  styleUrls: ['./event-details.page.scss'],
})
export class EventDetailsPage implements OnInit {
  event: any;
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
      next: (response: any) => {
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