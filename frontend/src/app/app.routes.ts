import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './guards/auth-guard';

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
    canActivate: [loginGuard],
  },
  {
    path: 'upload',
    loadComponent() {
      return import('./pages/upload/upload').then((m) => m.Upload);
    },
    canActivate: [authGuard],
  },
  {
    path: 'edit/:id',
    loadComponent() {
      return import('./pages/edit/edit').then((m) => m.Edit);
    },
    canActivate: [authGuard],
  }
];
