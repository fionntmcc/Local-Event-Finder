import { Component, inject, OnInit } from '@angular/core';
import { RouterLinkWithHref } from '@angular/router';
import {
  IonList,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText,
  IonCard,
  IonCardHeader, IonCardTitle,
  IonCardContent,
  IonButton,
  IonPopover,
  InfiniteScrollCustomEvent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonChip,
  IonLabel,
  IonListHeader,
  IonItem,
  IonCheckbox,
  IonIcon,
  IonSearchbar,
  IonSpinner,
  IonBadge,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, NgStyle, TitleCasePipe } from '@angular/common';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { PredictHqService } from '../services/predict-hq/predict-hq.service'
import { finalize, catchError } from 'rxjs';
import { Event } from '../services/predict-hq/interfaces';
import { LocationService } from '../services/location/location.service';
import { StorageService } from '../services/storage.service';
import { Router } from '@angular/router';
import { EventCategory } from '../services/predict-hq/event-category';
import { TicketmasterService } from '../services/ticketmaster/ticketmaster.service';
import { ApiResult } from '../services/predict-hq/interfaces';
import { TicketmasterResult } from '../services/ticketmaster/interfaces';

// Tell TypeScript about Google Maps global variables
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

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
    IonLabel,
    IonIcon,
    NgFor,
    NgIf,
    NgStyle,
    TitleCasePipe,
    IonSearchbar,
    IonSpinner,
    FormsModule,
    IonCheckbox,
    RouterLinkWithHref,
    IonListHeader,
    IonItem,
    IonBadge,
  ],
})

export class HomePage implements OnInit {
  // Use dependency injection for services
  private predictHqService = inject(PredictHqService);
  private locationService = inject(LocationService);
  private storageService = inject(StorageService);
  private router = inject(Router);

  // Ticketmaster service
  private ticketmasterService = inject(TicketmasterService);

  // Core variables for app functionality
  private currentPage: number = 1;
  public events: any[] = []; // Changed type to any for Ticketmaster events
  public error = null;
  public id: string = "";
  public value: string = "";
  public isHelpOpen: boolean = false;
  public isLoading: boolean = false;
  public map: any;
  public openWindow: any = null;
  public categories: string[] = [];
  public activeCategories: boolean[] = [];
  public center: any = null;
  public userMarker: any = null;

  // Location tracking variables
  public locationAvailable: boolean = false;
  private mapInitialized = false;
  private markers: any[] = [];

  private ticketmasterEvents: any[] = [];

  // Search functionality
  public searchTerm: string = '';

  // Pagination control
  private hasMorePages: boolean = true;

  // Flag to prevent location updates during marker drag
  private updatingViaMarkerDrag: boolean = false;

  // Help toast visibility control
  public showDragHelpToast: boolean = true;

  // Sorting functionality
  public currentSortMethod: string = 'alphabetical'; // Options: 'none', 'alphabetical', 'date', 'category'

  // Map error handling
  public mapLoadError: boolean = false;
  public mapLoadErrorMessage: string = '';

  constructor() {
    // Set up the callback for Google Maps
    window.initMap = () => {
      this.initializeMap();
    };

    // Monitor location availability changes
    this.locationService.isLocationAvailable().subscribe(available => {
      this.locationAvailable = available;
    });
  }

  ngOnInit() {
    // Start loading the map
    this.loadGoogleMapsScript();

    // Track user position changes
    this.locationService.getCurrentPosition().subscribe(position => {
      if (position) {
        this.updateUserMarkerPosition(position);
      }
    });
  }

  // Dynamically load Google Maps JavaScript API
  public loadGoogleMapsScript() {
    // Only load script if it's not already loaded
    if (!document.querySelectorAll(`[src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA_hp1omiThAyvMfBxpdThM57Rl_JCyYek&loading=async&callback=initMap"]`).length) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA_hp1omiThAyvMfBxpdThM57Rl_JCyYek&loading=async&callback=initMap`;
      script.async = true;
      script.defer = true;

      // Handle script loading errors
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        this.mapLoadError = true;
        this.mapLoadErrorMessage = 'Unable to load Google Maps. If you are using an ad blocker, please disable it for this site.';
      };

      // Set a timeout to catch silent failures
      const timeoutId = setTimeout(() => {
        if (!window.google || !window.google.maps) {
          console.error('Google Maps API failed to initialize');
          this.mapLoadError = true;
          this.mapLoadErrorMessage = 'Unable to load Google Maps. If you are using an ad blocker, please disable it for this site.';
        }
      }, 10000); // 10 second timeout

      // Clear timeout if maps loads successfully
      window.initMap = () => {
        clearTimeout(timeoutId);
        this.initializeMap();
      };

      document.body.appendChild(script);
    }
  }

  // This runs every time the page becomes active (tab change, navigation)
  ionViewWillEnter() {
    // Reset to default state
    this.currentPage = 1;
    this.events = [];
    this.searchTerm = '';
    this.error = null;
    this.id = "";
    this.value = "";
    this.isHelpOpen = false;
    this.isLoading = true;

    // Get all available event categories
    this.categories = Object.keys(EventCategory).filter((item) => {
      return isNaN(parseInt(item));
    });

    // Initialize all categories as inactive (no filters)
    this.activeCategories = this.categories.map(() => false);
    this.currentSortMethod = 'none'; // Reset sort method

    // Update user location, then load events
    this.locationService.refreshLocation()
      .then((position) => {
        // Update user marker position and map center
        this.updateUserMarkerPosition(position);
        this.loadEvents();
      })
      .catch(error => {
        console.error('Error getting location:', error);
        this.loadEvents(); // Load events anyway with default location
      });
  }

  // This runs after the view is fully initialized
  ionViewDidEnter() {
    // Initialize map if Google Maps API is loaded but map isn't initialized yet
    if (window.google && !this.mapInitialized) {
      this.initializeMap();
    }
  }

  // Create and configure the Google Map
  private initializeMap() {
    const mapElement = document.getElementById('map');
    if (mapElement && window.google && window.google.maps) {
      try {
        this.mapInitialized = true;

        // Use the user's current location as map center
        const center = {
          lat: this.locationService.getLatitude(),
          lng: this.locationService.getLongitude()
        };

        // Create the map with custom options
        this.map = new window.google.maps.Map(mapElement, {
          center: center,
          zoom: 12,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }] // Hide points of interest labels to reduce clutter
            }
          ],
          mapTypeControl: false, // Hide the map/satellite toggle
          streetViewControl: false // Hide street view
        });

        // Add a marker for the user's location
        this.userMarker = new window.google.maps.Marker({
          position: center,
          map: this.map,
          title: 'Your Location',
          draggable: true, // User can drag to set a new location
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 10,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        });

        // Handle when user drags the location marker
        window.google.maps.event.addListener(this.userMarker, 'dragend', (event: any) => {
          this.handleMarkerDrag(event);
        });

        // Add markers for all currently loaded events
        this.addEventMarkersToMap();

        // Reset error state if map loads successfully
        this.mapLoadError = false;
        this.mapLoadErrorMessage = '';
      } catch (error) {
        console.error('Error initializing map:', error);
        this.mapLoadError = true;
        this.mapLoadErrorMessage = 'Error initializing Google Maps. Please refresh the page or try again later.';
      }
    } else if (!window.google || !window.google.maps) {
      this.mapLoadError = true;
      this.mapLoadErrorMessage = 'Google Maps could not be loaded. This may be due to an ad blocker or network issue.';
    }
  }

  // Process marker drag to update user location
  private handleMarkerDrag(event: any) {
    const newPosition = {
      coords: {
        latitude: event.latLng.lat(),
        longitude: event.latLng.lng()
      },
      timestamp: new Date().getTime()
    };

    // Set flag to prevent other location updates during this process
    this.updatingViaMarkerDrag = true;

    // Update the map to center on the new position
    this.map.setCenter({
      lat: newPosition.coords.latitude,
      lng: newPosition.coords.longitude
    });

    // Update the app's location data
    this.locationService.setManualLocation(newPosition.coords.latitude, newPosition.coords.longitude);

    // Reset and reload events for the new location
    this.events = [];
    this.currentPage = 1;
    this.hasMorePages = true;
    this.loadEvents();

    // Save the location so it persists between app sessions
    this.storageService.set('userLocation', {
      latitude: newPosition.coords.latitude,
      longitude: newPosition.coords.longitude,
      timestamp: newPosition.timestamp
    });

    // Now allow other location updates
    this.updatingViaMarkerDrag = false;
  }

  // Update the marker when user position changes (e.g. GPS update)
  private updateUserMarkerPosition(position: any) {
    // Skip updates if map isn't ready or we're in the middle of a marker drag
    if (this.mapLoadError || !this.map || !this.mapInitialized || this.updatingViaMarkerDrag) return;

    const newPosition = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };

    // Move the marker to the new position
    if (this.userMarker) {
      this.userMarker.setPosition(newPosition);
    }

    // Recenter the map on the user
    this.map.setCenter(newPosition);

    // Remember this location
    this.storageService.set('userLocation', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: position.timestamp
    });
  }

  // Create map markers for all events
  private addEventMarkersToMap() {
    if (this.mapLoadError || !this.map || !window.google || !window.google.maps) {
      console.warn('Map not available, skipping marker update');
      return;
    }
    this.updateMapMarkersForSearch();
  }

  // Main function to load events from the API
  loadEvents(scroll?: InfiniteScrollCustomEvent) {
    this.error = null;
    this.isLoading = true;

    // Get user coordinates for the API call
    const latitude = this.locationService.getLatitude();
    const longitude = this.locationService.getLongitude();

    // Build list of active category filters
    let currentActiveCategories: string[] = [];
    this.activeCategories.forEach((active, index) => {
      if (active) {
        currentActiveCategories.push(this.categories[index]);
      }
    });
    console.log('Current active categories:', currentActiveCategories);

    // Create options object for Ticketmaster API
    const ticketmasterOptions = {
      lat: latitude,
      long: longitude,
      keyword: this.searchTerm || undefined,
      radius: 200, // Default radius in miles
      eventType: currentActiveCategories.length > 0 ? currentActiveCategories.join(',') : undefined
    };

    // Call the Ticketmaster API
    this.ticketmasterService.getEvents(
      this.currentPage, 
      ticketmasterOptions
    ).pipe(
      finalize(() => {
        // Always run this when request completes (success or error)
        this.isLoading = false;
        if (scroll) {
          scroll.target.complete();
        }
      }),
      // Handle errors from the API
      catchError((e) => {
        console.log(e);
        this.error = e.error ? e.error.message || 'Unknown error' : 'Error loading events';
        return [];
      })
    )
    .subscribe({
      next: (res) => {
        // Log the response for debugging
        console.log('Ticketmaster events:', res);

        // Process and add events from Ticketmaster
        if (res && res._embedded && res._embedded.events) {
          // Add new events to our list
          this.events.push(...res._embedded.events);

          // Apply sorting if a sort method is active
          if (this.currentSortMethod !== 'none') {
            this.sortAndUpdateEvents();
          }

          // Add markers to map for new events
          this.addEventMarkersToMap();

          // Check if we've reached the last page of results
          if (res.page && res.page.totalPages > res.page.number) {
            this.hasMorePages = true;
          } else {
            this.hasMorePages = false;
          }
        } else {
          this.hasMorePages = false;
        }

        // Update infinite scroll component state
        if (scroll) {
          scroll.target.disabled = !this.hasMorePages;
        }
      },
    });
  }

  // Load the next page of events when user scrolls to bottom
  loadMoreEvents(event: InfiniteScrollCustomEvent) {
    if (!this.hasMorePages) {
      event.target.disabled = true;
      return;
    }

    // Increment the page number for the next API call
    this.currentPage++;

    // Load the next page
    this.loadEvents(event);
  }

  // Format date for display in event cards
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

  // Calculate distance from user to event
  getDistance(event: any): string {
    if (event._embedded && event._embedded.venues && event._embedded.venues.length > 0) {
      const venue = event._embedded.venues[0];
      if (venue.location && venue.location.latitude && venue.location.longitude) {
        const latitude = parseFloat(venue.location.latitude);
        const longitude = parseFloat(venue.location.longitude);
        return this.locationService.getDistance(latitude, longitude);
      }
    }
    return 'Unknown distance';
  }

  // Helper for distance calculations
  private toRad(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  // Format currency values consistently
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Limit number of category labels shown for each event
  getLimitedLabels(labels: string[], limit: number): string[] {
    if (!labels) return [];
    return labels.slice(0, limit);
  }

  // Handle search feature
  public searchEvents() {
    // If search is cleared, reset everything
    if (!this.searchTerm.trim()) {
      this.searchTerm = '';
      this.events = [];
      this.currentPage = 1;
      this.hasMorePages = true;
      this.loadEvents();
      return;
    }

    // Start a new search
    this.events = []; // Clear current events
    this.currentPage = 1; // Reset to first page
    this.hasMorePages = true; // Reset pagination state
    console.log('Searching for:', this.searchTerm);

    // Load events matching the search term
    this.loadEvents();
  }

  // Update map to show only search-filtered events
  updateMapMarkersForSearch() {
    if (this.mapLoadError || !this.map || !window.google || !window.google.maps) {
      console.warn('Map not available, skipping marker update');
      return;
    }

    // Remove all existing event markers
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];

    // Add markers for current filtered events
    this.events.forEach(event => {
      // Extract location information from Ticketmaster event
      if (event._embedded && event._embedded.venues && event._embedded.venues.length > 0) {
        const venue = event._embedded.venues[0];
        if (venue.location && venue.location.latitude && venue.location.longitude) {
          const latitude = parseFloat(venue.location.latitude);
          const longitude = parseFloat(venue.location.longitude);
          
          const marker = new window.google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: this.map,
            title: event.name,
            animation: window.google.maps.Animation.DROP
          });

          // Create an info window with event details
          const infowindow = new window.google.maps.InfoWindow({
            content: `
            <div style="color: black; max-width: 250px; overflow: hidden;">
              <h6 style="margin: 8px 0; font-size: 16px; font-weight: 600;">${event.name}</h6>
              <p style="margin: 4px 0; font-size: 14px;"><strong>${this.formatDate(event.dates.start.dateTime || event.dates.start.localDate)}</strong></p>
              <p style="margin: 4px 0; font-size: 14px; color: #666;"><ion-icon name="location"></ionicon> ${venue.name}</p>
              <p style="margin: 6px 0; font-size: 13px; line-height: 1.3; max-height: 60px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">
                ${event.info || event.pleaseNote || 'No description available'}
              </p>
              <button id="view-details-${event.id}" style="background-color: #3880ff; color: white; border: none; padding: 8px 12px; border-radius: 4px; font-size: 14px; cursor: pointer; width: 100%; margin-top: 8px;">
                View Details
              </button>
            </div>
            `,
            disableAutoPan: false,
            maxWidth: 270, // Limit max width
            pixelOffset: new window.google.maps.Size(0, 0)
          });

          // Show info window when marker is clicked
          marker.addListener('click', () => {
            // Close any other open info windows
            if (this.openWindow) {
              this.openWindow.close();
            }
            this.openWindow = infowindow;
            infowindow.open(this.map, marker);

            // Add click event handler for the "View Details" button
            setTimeout(() => {
              const detailsBtn = document.getElementById(`view-details-${event.id}`);
              if (detailsBtn) {
                detailsBtn.addEventListener('click', () => {
                  this.navigateToEventDetails(event.id);
                });
              }
            }, 300);
          });

          // Close popup if user clicks elsewhere on the map
          window.google.maps.event.addListener(this.map, 'click', function () {
            infowindow.close();
          });

          this.markers.push(marker);
        }
      }
    });

    // If we're searching and have results, zoom to the first result
    if (this.searchTerm && this.events.length > 0 && 
        this.events[0]._embedded && this.events[0]._embedded.venues && 
        this.events[0]._embedded.venues.length > 0) {
      const venue = this.events[0]._embedded.venues[0];
      if (venue.location && venue.location.latitude && venue.location.longitude) {
        this.map.setCenter({
          lat: parseFloat(venue.location.latitude),
          lng: parseFloat(venue.location.longitude)
        });
        this.map.setZoom(13);
      }
    }
  }

  // Apply category filters
  applyFilters() {
    this.events = [];
    this.currentPage = 1;
    this.hasMorePages = true;
    this.loadEvents();
  }

  // Reset search to show all events
  clearSearch() {
    this.searchTerm = '';
    this.events = [];
    this.currentPage = 1;
    this.hasMorePages = true;
    this.loadEvents();
  }

  // Toggle a category filter on/off
  toggleCategory(category: string) {
    const index = this.categories.indexOf(category);
    if (index > -1) {
      this.activeCategories[index] = !this.activeCategories[index];
      console.log('Active categories:', this.activeCategories);
    }
  }

  // Navigate to event details page
  navigateToEventDetails(eventId: string) {
    this.router.navigate(['/event', eventId]);
  }

  // Get user-friendly name for the current sort method
  public getSortMethodLabel(): string {
    switch (this.currentSortMethod) {
      case 'alphabetical':
        return 'Alphabetical';
      case 'date':
        return 'Date';
      case 'category':
        return 'Category';
      case 'distance':
        return 'Distance';
      default:
        return '';
    }
  }

  // Reset to default sorting
  resetSorting(): void {
    this.currentSortMethod = 'alphabetical';
    this.sortAndUpdateEvents();
  }

  // Change sorting method
  sortEvents(method: string): void {
    this.currentSortMethod = method;
    this.sortAndUpdateEvents();
  }

  // Apply current sort method to events list
  sortAndUpdateEvents(): void {
    if (!this.events || this.events.length === 0) return;

    switch (this.currentSortMethod) {
      case 'alphabetical':
        // Sort alphabetically by title
        this.events.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'date':
        // Sort by start date (earliest first)
        this.events.sort((a, b) => {
          const dateA = a.dates && a.dates.start ? new Date(a.dates.start.dateTime || a.dates.start.localDate).getTime() : 0;
          const dateB = b.dates && b.dates.start ? new Date(b.dates.start.dateTime || b.dates.start.localDate).getTime() : 0;
          return dateA - dateB;
        });
        break;
      case 'category':
        // Sort by primary category
        /* this.events.sort((a, b) => {
          const catA = this.getPrimaryCategory(a);
          const catB = this.getPrimaryCategory(b);
          return catA.localeCompare(catB);
        }); */
        break;
      case 'distance':
        // Sort by distance to user (closest first)
        this.events.sort((a, b) => {
          let distA = Number.MAX_VALUE;
          let distB = Number.MAX_VALUE;
          
          if (a._embedded && a._embedded.venues && a._embedded.venues.length > 0) {
            const venueA = a._embedded.venues[0];
            if (venueA.location && venueA.location.latitude && venueA.location.longitude) {
              distA = this.calculateDistanceInKm(
                parseFloat(venueA.location.latitude),
                parseFloat(venueA.location.longitude)
              );
            }
          }
          
          if (b._embedded && b._embedded.venues && b._embedded.venues.length > 0) {
            const venueB = b._embedded.venues[0];
            if (venueB.location && venueB.location.latitude && venueB.location.longitude) {
              distB = this.calculateDistanceInKm(
                parseFloat(venueB.location.latitude),
                parseFloat(venueB.location.longitude)
              );
            }
          }
          
          return distA - distB;
        });
        break;
      default:
        // No sorting
        break;
    }
  }

  // Calculate distance between user and event
  private calculateDistanceInKm(eventLat: number, eventLng: number): number {
    const userLat = this.locationService.getLatitude();
    const userLng = this.locationService.getLongitude();

    // Use Haversine formula to calculate distance on a sphere
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(eventLat - userLat);
    const dLng = this.toRad(eventLng - userLng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(userLat)) * Math.cos(this.toRad(eventLat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }
}