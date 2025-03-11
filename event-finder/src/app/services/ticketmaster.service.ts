// import necessary packages
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResult } from './interfaces';

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
  getEvents(page = 1): Observable<ApiResult> {
    return this.httpClient.get<ApiResult>(`${API_URL}?countryCode=US&apikey=${API_KEY}`);
  }
}
/* ${API_URL}?countryCode=US&api_key=${API_KEY} */