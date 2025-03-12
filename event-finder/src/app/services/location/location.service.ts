import { Injectable } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private currentPosition = new BehaviorSubject<Position | null>(null);

  constructor() {
    this.initLocation();
  }

  private async initLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      this.currentPosition.next(coordinates);
    } catch (error) {
      console.error('Error getting location', error);
    }
  }

  async refreshLocation(): Promise<Position> {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      this.currentPosition.next(coordinates);
      return coordinates;
    } catch (error) {
      console.error('Error refreshing location', error);
      throw error;
    }
  }

  getCurrentPosition(): Observable<Position | null> {
    return this.currentPosition.asObservable();
  }

  getLastKnownPosition(): Position | null {
    return this.currentPosition.getValue();
  }
}
