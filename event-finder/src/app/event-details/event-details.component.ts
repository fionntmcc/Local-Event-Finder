// All necessary imports
import { Component, Input, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { RouterLinkWithHref } from '@angular/router';
import { IonContent,
   IonHeader, 
   IonTitle, 
   IonToolbar, 
   IonIcon, 
   IonCard, 
   IonCardHeader, 
   IonCardTitle, 
   IonCardSubtitle, 
   IonCardContent, 
   IonText, 
   IonLabel, 
   IonButtons, 
   IonButton, 
   IonBackButton, 
   IonItem, 
   IonNav, 
   IonAvatar,
   IonToggle,
   IonPopover,
   IonInput,
   IonRadio,
   IonBadge,
   } from '@ionic/angular/standalone';
import { PredictHqService } from '../services/predict-hq/predict-hq.service';
import { StorageService } from '../services/storage/storage.service';
import { ApiResult } from '../services/predict-hq/interfaces';
import { CurrencyPipe, DatePipe} from '@angular/common';
import { Browser } from '@capacitor/browser';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
  standalone: true,
  imports: [IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonIcon, 
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardSubtitle, 
    IonCardContent, 
    IonText, 
    IonLabel, 
    IonButtons, 
    IonButton,
    IonBackButton, 
    IonItem, 
    DatePipe, 
    CurrencyPipe, 
    IonNav, 
    IonAvatar, 
    RouterLinkWithHref,
    IonToggle,
    IonPopover,
    IonInput,
    IonRadio, 
    FormsModule,
    IonBadge,
  ]
})



export class EventDetailsPage implements OnInit {
  // inject services
  private predictHqService = inject(PredictHqService);
  private storageService = inject(StorageService);

  // Necessary inits
  public imageBaseUrl = "https://image.tmdb.org/t/p";
  public event:WritableSignal<Event | null> = signal(null);
  public isPopupActive:boolean = false;
  public homepage:string = "";
  public status:string = "";
  public eventId:string = "";

  @Input()
  set id(id:string) {
    this.predictHqService.getEventById(id).subscribe((event) => {
      console.log(event);
      this.event.set(event); 
      this.homepage = event.homepage;
      this.eventId = id;
    });
  }

  async openEventWebsite() {
    await Browser.open({url: this.homepage});
  }


  constructor() {}

  ngOnInit() {}

}