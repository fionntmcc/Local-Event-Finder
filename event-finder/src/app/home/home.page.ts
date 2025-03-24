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
  // inject PredictHqService
  private predictHqService = inject(PredictHqService);
  private locationService = inject(LocationService);
  private storageService = inject(StorageService);
  private router = inject(Router);

  // Necessary inits
  private currentPage: number = 1;
  public events: Event[] = [];
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

  // Location data now managed by LocationService
  public locationAvailable: boolean = false;
  private mapInitialized = false;
  private markers: any[] = [];

  // Search properties
  public searchTerm: string = '';

  // Add pagination tracking variables
  private hasMorePages: boolean = true;

  // Add a flag to track if we're updating via marker drag
  private updatingViaMarkerDrag: boolean = false;

  // Add a property to control the help toast
  public showDragHelpToast: boolean = true;

  // Add property to track the current sort method
  public currentSortMethod: string = 'none'; // Options: 'none', 'alphabetical', 'date', 'category'

  // Add new properties
  public mapLoadError: boolean = false;
  public mapLoadErrorMessage: string = '';

  constructor() {
    // Initialize the map callback function
    window.initMap = () => {
      this.initializeMap();
    };

    // Subscribe to location availability
    this.locationService.isLocationAvailable().subscribe(available => {
      this.locationAvailable = available;
    });
  }

  ngOnInit() {
    this.loadGoogleMapsScript();

    // Subscribe to position changes
    this.locationService.getCurrentPosition().subscribe(position => {
      if (position) {
        this.updateUserMarkerPosition(position);
      }
    });
  }

  // Load Google Maps API script dynamically
  public loadGoogleMapsScript() {
    if (!document.querySelectorAll(`[src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA_hp1omiThAyvMfBxpdThM57Rl_JCyYek&loading=async&callback=initMap"]`).length) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA_hp1omiThAyvMfBxpdThM57Rl_JCyYek&loading=async&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      // Add error handling for the script
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        this.mapLoadError = true;
        this.mapLoadErrorMessage = 'Unable to load Google Maps. If you are using an ad blocker, please disable it for this site.';
      };
      
      // Add timeout to detect when Google Maps fails silently
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

  ionViewWillEnter() {
    // reset variables
    this.currentPage = 1;
    this.events = [];
    this.searchTerm = '';
    this.error = null;
    this.id = "";
    this.value = "";
    this.isHelpOpen = false;
    this.isLoading = true;
    this.categories = Object.keys(EventCategory).filter((item) => {
      return isNaN(parseInt(item));
    });
    this.activeCategories = this.categories.map(() => false);
    this.currentSortMethod = 'none'; // Reset sort method

    // Use the location service to refresh location, then load events
    this.locationService.refreshLocation()
      .then((position) => {
        // Update user marker position and map center if initialized
        this.updateUserMarkerPosition(position);
        this.loadEvents();
      })
      .catch(error => {
        console.error('Error getting location:', error);
        this.loadEvents(); // Load events anyway with default location
      });
  }

  ionViewDidEnter() {
    // If the map script has already loaded, manually initialize the map
    if (window.google && !this.mapInitialized) {
      this.initializeMap();
    }
  }

  private initializeMap() {
    const mapElement = document.getElementById('map');
    if (mapElement && window.google && window.google.maps) {
      try {
        this.mapInitialized = true;

        // Use location service to get coordinates
        const center = {
          lat: this.locationService.getLatitude(),
          lng: this.locationService.getLongitude()
        };

        this.map = new window.google.maps.Map(mapElement, {
          center: center,
          zoom: 12,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ],
          mapTypeControl: false,
          streetViewControl: false
        });

        // Add a marker for the user's location and store reference
        this.userMarker = new window.google.maps.Marker({
          position: center,
          map: this.map,
          title: 'Your Location',
          draggable: true, // Make the marker draggable
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 10,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        });

        // Add drag end event listener to the user marker
        window.google.maps.event.addListener(this.userMarker, 'dragend', (event: any) => {
          this.handleMarkerDrag(event);
        });

        // Add event markers when events are loaded
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

  // Handle marker drag and update location
  private handleMarkerDrag(event: any) {
    const newPosition = {
      coords: {
        latitude: event.latLng.lat(),
        longitude: event.latLng.lng()
      },
      timestamp: new Date().getTime()
    };

    // Set the flag to prevent multiple refreshes
    this.updatingViaMarkerDrag = true;

    // Update the map center
    this.map.setCenter({
      lat: newPosition.coords.latitude,
      lng: newPosition.coords.longitude
    });

    // Update the location service with new coordinates
    this.locationService.setManualLocation(newPosition.coords.latitude, newPosition.coords.longitude);

    // Reset events and reload with new location
    this.events = [];
    this.currentPage = 1;
    this.hasMorePages = true;
    this.loadEvents();

    // Save the updated location to storage
    this.storageService.set('userLocation', {
      latitude: newPosition.coords.latitude,
      longitude: newPosition.coords.longitude,
      timestamp: newPosition.timestamp
    });

    // Reset the flag
    this.updatingViaMarkerDrag = false;
  }

  // Modify updateUserMarkerPosition to avoid position updates while dragging
  private updateUserMarkerPosition(position: any) {
    if (this.mapLoadError || !this.map || !this.mapInitialized || this.updatingViaMarkerDrag) return;

    const newPosition = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };

    // Update user marker position
    if (this.userMarker) {
      this.userMarker.setPosition(newPosition);
    }

    // Update map center
    this.map.setCenter(newPosition);

    // Save the current location to storage
    this.storageService.set('userLocation', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: position.timestamp
    });
  }

  // Add event markers to map
  private addEventMarkersToMap() {
    if (this.mapLoadError || !this.map || !window.google || !window.google.maps) {
      console.warn('Map not available, skipping marker update');
      return;
    }
    this.updateMapMarkersForSearch();
  }

  // initialises events on page startup
  loadEvents(scroll?: InfiniteScrollCustomEvent) {
    this.error = null;
    this.isLoading = true;

    // Use location service to get coordinates for API call
    const latitude = this.locationService.getLatitude();
    const longitude = this.locationService.getLongitude();

    let currentActiveCategories : string[] = [];
    this.activeCategories.forEach((active, index) => {
      if (active) {
        currentActiveCategories.push(this.categories[index]); 
      }
    });
    console.log('Current active categories:', currentActiveCategories); 

    // get events on currentPage, now including search term
    this.predictHqService.getEvents(this.currentPage, latitude, longitude, this.searchTerm, currentActiveCategories).pipe(
      finalize(() => {
        this.isLoading = false;
        if (scroll) {
          scroll.target.complete();
        }
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
          
          // Apply sorting if a sort method is active
          if (this.currentSortMethod !== 'none') {
            this.sortAndUpdateEvents();
          }
          
          console.log(this.events);
          // Add markers to map if map is initialized
          this.addEventMarkersToMap();

          // Check if we've reached the last page
          if (res.next) {
            this.hasMorePages = true;
          } else {
            this.hasMorePages = false;
          }

          // disable InfiniteScroll if we've reached the last page
          if (scroll) {
            scroll.target.disabled = !this.hasMorePages;
          }
        },
      });
  }

  // Handle the infinite scroll event
  loadMoreEvents(event: InfiniteScrollCustomEvent) {
    if (!this.hasMorePages) {
      event.target.disabled = true;
      return;
    }

    // Increment the page number
    this.currentPage++;

    // Load the next page
    this.loadEvents(event);
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

  // Use LocationService for distance calculation
  getDistance(eventLat: number, eventLng: number): string {
    return this.locationService.getDistance(eventLat, eventLng);
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

  // Limit the number of labels to display
  getLimitedLabels(labels: string[], limit: number): string[] {
    if (!labels) return [];
    return labels.slice(0, limit);
  }

  // Search events based on searchTerm
  public searchEvents() {
    if (!this.searchTerm.trim()) {
      this.searchTerm = '';
      this.events = [];
      this.currentPage = 1; // Reset to first page
      this.hasMorePages = true; // Reset pagination state
      this.loadEvents(); // Will load events without search term
      return;
    }

    this.events = []; // Clear current events
    this.currentPage = 1; // Reset to first page
    this.hasMorePages = true; // Reset pagination state
    console.log('Searching for:', this.searchTerm);

    // loadEvents will now use the current searchTerm
    this.loadEvents();
  }

  // Update map markers to display only filtered results
  updateMapMarkersForSearch() {
    if (this.mapLoadError || !this.map || !window.google || !window.google.maps) {
      console.warn('Map not available, skipping marker update');
      return;
    }

    // Clear existing markers
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];

    // Add new markers for filtered events
    this.events.forEach(event => {
      if (event.location && event.location.length >= 2) {
        const marker = new window.google.maps.Marker({
          position: { lat: event.location[1], lng: event.location[0] },
          map: this.map,
          title: event.title,
          animation: window.google.maps.Animation.DROP
        });

        // Add click listener to open info window with improved styling
        const infowindow = new window.google.maps.InfoWindow({
          content: `
          <div style="color: black; max-width: 250px; overflow: hidden;">
            <h6 style="margin: 8px 0; font-size: 16px; font-weight: 600;">${event.title}</h6>
            <p style="margin: 4px 0; font-size: 14px;"><strong>${this.formatDate(event.start_local)}</strong></p>
            <p style="margin: 4px 0; font-size: 14px; color: #666;"><ion-icon name="location"></ionicon> ${this.getDistance(event.location[1], event.location[0])} away</p>
            <p style="margin: 6px 0; font-size: 13px; line-height: 1.3; max-height: 60px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">
              ${ event.description.length == 26 ? "No description" : event.description.replace('Sourced from predicthq.com - ', '')}
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

        marker.addListener('click', () => {
          if (this.openWindow) {
            this.openWindow.close();
          }
          this.openWindow = infowindow;
          infowindow.open(this.map, marker);

          // Add click event after info window is opened
          setTimeout(() => {
            const detailsBtn = document.getElementById(`view-details-${event.id}`);
            if (detailsBtn) {
              detailsBtn.addEventListener('click', () => {
                this.navigateToEventDetails(event.id);
              });
            }
          }, 300);
        });

        // Close popup if clicked outside
        window.google.maps.event.addListener(this.map, 'click', function () {
          infowindow.close();
        });

        this.markers.push(marker);
      }
    });

    // If we have filtered events and there are results, center the map on the first result
    if (this.searchTerm && this.events.length > 0 &&
      this.events[0].location &&
      this.events[0].location.length >= 2) {
      this.map.setCenter({
        lat: this.events[0].location[1],
        lng: this.events[0].location[0]
      });
      this.map.setZoom(13);
    }
  }

  applyFilters() {
    this.events = [];
    this.currentPage = 1; // Reset to first page
    this.hasMorePages = true; // Reset pagination state
    this.loadEvents(); // Will load events with selected categories
  }

  // Clear search and reset to all events
  clearSearch() {
    this.searchTerm = '';
    this.events = [];
    this.currentPage = 1; // Reset to first page
    this.hasMorePages = true; // Reset pagination state
    this.loadEvents(); // Will load events without search term
  }

  toggleCategory(category: string) {
    const index = this.categories.indexOf(category);
    if (index > -1) {
      this.activeCategories[index] = !this.activeCategories[index];
      console.log('Active categories:', this.activeCategories);
    }
  }

  // Add a method to navigate to event details
  navigateToEventDetails(eventId: string) {
    this.router.navigate(['/event', eventId]);
  }

  // Function to get a user-friendly label for the current sort method
  getSortMethodLabel(): string {
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

  // Reset sorting to default
  resetSorting(): void {
    this.currentSortMethod = 'none';
    this.sortAndUpdateEvents();
  }

  // Sort events based on the selected method
  sortEvents(method: string): void {
    this.currentSortMethod = method;
    this.sortAndUpdateEvents();
  }

  // Apply the current sort method to the events array
  sortAndUpdateEvents(): void {
    if (!this.events || this.events.length === 0) return;

    switch (this.currentSortMethod) {
      case 'alphabetical':
        this.events.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'date':
        this.events.sort((a, b) => new Date(a.start_local).getTime() - new Date(b.start_local).getTime());
        break;
      case 'category':
        this.events.sort((a, b) => {
          const catA = a.labels && a.labels.length > 0 ? a.labels[0] : 'zzz'; // 'zzz' to sort events without category last
          const catB = b.labels && b.labels.length > 0 ? b.labels[0] : 'zzz';
          return catA.localeCompare(catB);
        });
        break;
      case 'distance':
        // Sort by distance to user's location
        this.events.sort((a, b) => {
          // Skip events without location
          if (!a.location || a.location.length < 2) return 1;
          if (!b.location || b.location.length < 2) return -1;
          
          // Calculate distances using our helper method
          const distA = this.calculateDistanceInKm(a.location[1], a.location[0]);
          const distB = this.calculateDistanceInKm(b.location[1], b.location[0]);
          
          // Sort by distance (ascending - closest first)
          return distA - distB;
        });
        break;
      default:
        // No sorting (keep the order from the API)
        break;
    }
  }

  // Helper method to calculate distance in km between user and event location
  private calculateDistanceInKm(eventLat: number, eventLng: number): number {
    const userLat = this.locationService.getLatitude();
    const userLng = this.locationService.getLongitude();
    
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(eventLat - userLat);
    const dLng = this.toRad(eventLng - userLng);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(userLat)) * Math.cos(this.toRad(eventLat)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  }
}