import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('../home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'upcoming-events',
        loadComponent: () =>
          import('../upcoming-events/upcoming-events.page').then((m) => m.UpcomingEventsPage),
      },
      /*       
      {
        path: 'past-events',
        loadComponent: () =>
          import('../past-events/past-events.page').then((m) => m.PastEventsPage),
      }, 
      */
      {
        path: 'settings',
        loadComponent: () =>
          import('../settings/settings.page').then((m) => m.SettingsPage),
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
];
