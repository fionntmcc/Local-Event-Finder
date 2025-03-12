// import necessary packages
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResult, Event } from './interfaces';

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
    getEvents(page = 1, latitude = 0, longitude = 0, query = "", date?: Date): Observable<ApiResult> {

        if (!date) {
            date = new Date();
            date.setMonth(date.getMonth() + 1);
        }
        return this.httpClient.get<ApiResult>(`${API_URL}?within=10km@${latitude},${longitude}&active.lte=${date.toISOString().split('T')[0]}&q=${query}&page=${page}`,
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    "Accept": "application/json",
                }
            }
        );
    }
}