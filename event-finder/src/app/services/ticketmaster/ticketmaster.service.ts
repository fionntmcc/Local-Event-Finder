// import necessary packages
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TicketmasterResult, Event } from './interfaces';

const API_KEY = environment.ticketmaster_api_key;
const API_URL = environment.ticketmaster_api_url;

@Injectable({
  providedIn: 'root'
})
export class TicketmasterService {
  // inject HttpClient
  private httpClient = inject(HttpClient);
  
  constructor() { }

  // return top movies on given page
  getEvents(
    page = 1,
    options?: {
      lat?: number,
      long?: number,
      keyword?: string,
      date?: string,
      radius?: number,
      eventType?: string,
      countryCode?: string
    }
  ): Observable<TicketmasterResult> {
    let url = `${API_URL}?apikey=${API_KEY}`;
    
    // Add optional parameters if provided
    if (options) {
      if (options.lat && options.long) {
        url += `&latlong=${options.lat},${options.long}`;
      }
      
      if (options.keyword) {
        url += `&keyword=${encodeURIComponent(options.keyword)}`;
      }
      
      if (options.date) {
        url += `&startDateTime=${encodeURIComponent(options.date)}`;
      }
      
      if (options.radius) {
        url += `&radius=${options.radius}`;
      }
      
      if (options.eventType) {
        url += `&classificationName=${encodeURIComponent(options.eventType)}`;
      }
    }
    
    // Add page parameter
    url += `&page=${page}`;
    
    // debug
    //console.log('Making API request to:', url);

    return this.httpClient.get<TicketmasterResult>(url);
  }
  
  // Get a specific event by its ID
  getEventById(eventId: string): Observable<Event> {
    // Change to the correct Ticketmaster event details endpoint format
    const url = `https://app.ticketmaster.com/discovery/v2/events/${eventId}?apikey=${API_KEY}`;
    
    return this.httpClient.get<Event>(url);
  }
}