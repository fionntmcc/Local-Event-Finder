// import necessary packages
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TicketmasterResult } from './interfaces';

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
  getEvents(page = 1): Observable<TicketmasterResult> {
    return this.httpClient.get<TicketmasterResult>(`${API_URL}?countryCode=US&apikey=${API_KEY}`);
  }
}