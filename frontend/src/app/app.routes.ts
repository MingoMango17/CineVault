import { Routes } from '@angular/router';
import { authGuard } from './auth-guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => {
      return import('./pages/home/home').then((m) => m.Home);
    },
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent() {
      return import('./pages/login/login').then((m) => m.Login);
    },
  },
  {
    path: 'upload',
    loadComponent() {
      return import('./pages/upload/upload').then((m) => m.Upload);
    },
    canActivate: [authGuard],
  },
];
