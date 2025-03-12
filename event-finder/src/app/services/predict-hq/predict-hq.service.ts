// import necessary packages
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
// import { ApiResult } from './interfaces';

const API_KEY = environment.event_finder_api_key;
const API_URL = environment.event_finder_api_url;

@Injectable({
    providedIn: 'root'
})
export class PredictHqService {
    // inject HttpClient
    private httpClient = inject(HttpClient);

    constructor() { }

    // return top movies on given page
    getEvents(page = 1, latitude = 0, longitude = 0): Observable<any> {
        return this.httpClient.get<any>(`${API_URL}?location_around.origin=${latitude},${longitude}`
            , {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    "Accept": "application/json",
                },
                /* params: {
                    "q": "taylor swift",
                } */
            }
        );
    }
}