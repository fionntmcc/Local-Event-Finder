// import necessary packages
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResult } from './interfaces';
import { EventCategory } from './event-category';

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
    getEvents(page = 1, latitude = 0, longitude = 0, query = "", eventCategories: string[] = [], maxDistance = 20, date?: Date): Observable<ApiResult> {
        
        // if no date, set furthest date for 3 months from now
        if (!date) {
            date = new Date();
            date.setMonth(date.getMonth() + 3);
        }

        eventCategories = Object.keys(EventCategory).filter((item) => {
            return isNaN(Number(item));
        });
        
        // Construct category string
        let categoryString = (eventCategories.length > 0 ? `&category=${eventCategories.join(',')}` : '');
        // remove all spaces from categoryString

        let url = `${API_URL}?within=${maxDistance}km@${latitude},${longitude}&active.lte=${date.toISOString().split('T')[0]}&q=${query}&page=${page}&limit=50${categoryString}`;

        console.log(url);

        return this.httpClient.get<ApiResult>(url,
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    "Accept": "application/json",
                }
            }
        );
    }

    getEventById(id: string): Observable<any> {
        return this.httpClient.get<any>(`${API_URL}?id=${id}`,
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    "Accept": "application/json",
                }
            }
        );
    }
}