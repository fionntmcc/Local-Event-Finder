import { Injectable } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private currentPosition = new BehaviorSubject<Position | null>(null);
  private locationAvailable = new BehaviorSubject<boolean>(false);

  constructor() {
    this.initLocation();
  }

  private async initLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      this.currentPosition.next(coordinates);
      this.locationAvailable.next(true);
    } catch (error) {
      console.error('Error getting location', error);
      this.locationAvailable.next(false);
    }
  }

  async refreshLocation(): Promise<Position> {
    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
      this.currentPosition.next(coordinates);
      this.locationAvailable.next(true);
      return coordinates;
    } catch (error) {
      console.error('Error refreshing location', error);
      this.locationAvailable.next(false);
      throw error;
    }
  }

  getCurrentPosition(): Observable<Position | null> {
    return this.currentPosition.asObservable();
  }

  getLastKnownPosition(): Position | null {
    return this.currentPosition.getValue();
  }

  isLocationAvailable(): Observable<boolean> {
    return this.locationAvailable.asObservable();
  }

  getLatitude(): number {
    return this.currentPosition.getValue()?.coords.latitude || 53.350140; // Default to Dublin
  }

  getLongitude(): number {
    return this.currentPosition.getValue()?.coords.longitude || -6.266155; // Default to Dublin
  }

  // Calculate distance from user's location to a point
  getDistance(eventLat: number, eventLng: number): string {
    const position = this.getLastKnownPosition();
    
    if (!position) {
      return 'Distance unknown';
    }

    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;

    // Earth's radius in km
    const R = 6371;

    // Convert degrees to radians
    const dLat = this.toRad(eventLat - userLat);
    const dLon = this.toRad(eventLng - userLng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(userLat)) * Math.cos(this.toRad(eventLat)) *
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

  /**
   * Initialize location from storage data
   * @param lat Latitude from storage
   * @param lng Longitude from storage
   */
  setLocationFromStorage(lat: number, lng: number): void {
    if (lat && lng) {
      const mockPosition: Position = {
        coords: {
          latitude: lat,
          longitude: lng,
          accuracy: 0,
          altitudeAccuracy: null,
          altitude: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      };
      
      this.currentPosition.next(mockPosition);
      this.locationAvailable.next(true);
      console.log('Location initialized from storage:', lat, lng);
    }
  }

  // Add a new method to set manual location
  public setManualLocation(latitude: number, longitude: number): void {
    // Update the current position with the manual coordinates
    const manualPosition: Position = {
      coords: {
        latitude: latitude,
        longitude: longitude,
        accuracy: 0,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null
      },
      timestamp: new Date().getTime()
    };

    // Emit the new position to all subscribers
    this.currentPosition.next(manualPosition);
    
    // Update location availability
    this.locationAvailable.next(true);
  }
}
