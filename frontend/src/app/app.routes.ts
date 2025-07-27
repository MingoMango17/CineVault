import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent: () => {
            return import('./pages/home/home').then(
                (m) => m.Home
            )
        }
    },
    {
        path: 'login',
        loadComponent() {
            return import('./pages/login/login').then(
                (m) => m.Login
            )
        },
    },
    {
        path: 'upload',
        loadComponent() {
            return import('./pages/upload/upload').then(
                (m) => m.Upload
            )
        },
    }
];
