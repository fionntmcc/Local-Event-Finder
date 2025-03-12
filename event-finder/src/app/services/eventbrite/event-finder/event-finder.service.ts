// import necessary packages
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
// import { ApiResult } from './interfaces';

const API_KEY = environment.event_finder_api_key;
const API_URL = environment.event_finder_api_url;
const CITY = 'Galway';

@Injectable({
  providedIn: 'root'
})
export class EventFinderService {
  // inject HttpClient
  private httpClient = inject(HttpClient);
  
  constructor() { }

  
  getEvents(page = 1): Observable<any> {
    const url = `https://api.predicthq.com/v1/events/`;
    const headers = {
      'Authorization': `Bearer ${API_KEY}`,
      "Accept": "application/json",
    },
    params = {
      "q": "taylor swift",
    };
    return this.httpClient.get<any>(url, { headers, params });
  }

  
}