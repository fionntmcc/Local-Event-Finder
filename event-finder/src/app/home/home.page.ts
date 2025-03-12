import { Component, inject, OnInit } from '@angular/core';
import {
  IonList, IonHeader, IonToolbar, IonTitle, IonContent, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonButton, IonPopover, InfiniteScrollCustomEvent, IonInfiniteScroll, IonInfiniteScrollContent,
  IonChip,
  IonLabel, 
  IonIcon, IonSearchbar, IonSpinner
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, NgStyle, TitleCasePipe } from '@angular/common';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { PredictHqService } from '../services/predict-hq/predict-hq.service'
import { finalize, catchError } from 'rxjs';
import { Event } from '../services/predict-hq/interfaces';
import { LocationService } from '../services/location/location.service';
import { StorageService } from '../services/storage/storage.service';

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
    FormsModule
  ],
})

export class HomePage implements OnInit {
  // inject PredictHqService
  private predictHqService = inject(PredictHqService);
  private locationService = inject(LocationService);
  private storageService = inject(StorageService);

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

  // Location data now managed by LocationService
  public locationAvailable: boolean = false;
  private mapInitialized = false;
  private markers: any[] = [];

  // Search properties
  public searchTerm: string = '';

  // Add pagination tracking variables
  private hasMorePages: boolean = true;

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
  }

  // Load Google Maps API script dynamically
  private loadGoogleMapsScript() {
    if (!document.querySelectorAll(`[src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA_hp1omiThAyvMfBxpdThM57Rl_JCyYek&loading=async&callback=initMap"]`).length) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA_hp1omiThAyvMfBxpdThM57Rl_JCyYek&loading=async&callback=initMap`;
      script.async = true;
      script.defer = true;
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

    // Use the location service to refresh location, then load events
    this.locationService.refreshLocation()
      .then(() => {
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
    if (mapElement && window.google) {
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

      // Add a marker for the user's location
      if (this.locationAvailable) {
        new window.google.maps.Marker({
          position: center,
          map: this.map,
          title: 'Your Location',
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 10,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        });
      }

      // Add event markers when events are loaded
      this.addEventMarkersToMap();
    }
  }

  // Add event markers to map
  private addEventMarkersToMap() {
    this.updateMapMarkersForSearch();
  }

  // initialises events on page startup
  loadEvents(scroll?: InfiniteScrollCustomEvent) {
    this.error = null;
    this.isLoading = true;

    // Use location service to get coordinates for API call
    const latitude = this.locationService.getLatitude();
    const longitude = this.locationService.getLongitude();

    // get events on currentPage, now including search term
    this.predictHqService.getEvents(this.currentPage, latitude, longitude, this.searchTerm).pipe(
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
    
    // loadEvents will now use the current searchTerm
    this.loadEvents();
  }
  
  // Update map markers to display only filtered results
  updateMapMarkersForSearch() {
    if (!this.map || !window.google) return;
    
    // Clear existing markers
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
    
    // Get events to display (filtered or all)
    
    // Add new markers for filtered events
    this.events.forEach(event => {
      if (event.location && event.location.length >= 2) {
        const marker = new window.google.maps.Marker({
          position: { lat: event.location[1], lng: event.location[0] },
          map: this.map,
          title: event.title,
          animation: window.google.maps.Animation.DROP
        });
        
        // Add click listener to open info window
        const infowindow = new window.google.maps.InfoWindow({
          content: `
          <div style="color: black;">
            <h3>${event.title}</h3>
            <p>${this.formatDate(event.start_local)}</p>
            <p>${this.getDistance(event.location[1], event.location[0])}</p>
            <p>${event.description || ''}</p>
            <p>${event.labels?.join(', ') || ''}</p>
          </div>
          `
        });

        
        marker.addListener('click', () => {
          if (this.openWindow) {
            this.openWindow.close();
          }
          this.openWindow = infowindow;
          infowindow.open(this.map, marker);
        });
        
        // Close popup if clicked outside
        window.google.maps.event.addListener(this.map, 'click', function() {
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
  
  // Clear search and reset to all events
  clearSearch() {
    this.searchTerm = '';
    this.events = [];
    this.currentPage = 1; // Reset to first page
    this.hasMorePages = true; // Reset pagination state
    this.loadEvents(); // Will load events without search term
  }
}