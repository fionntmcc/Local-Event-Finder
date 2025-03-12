import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'event/:id',
    loadComponent: () => import('./event-details/event-details.component').then(m => m.EventDetailsComponent),
  },
];
