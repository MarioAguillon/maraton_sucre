import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { adminGuard, guestGuard } from './admin/admin.guard';

export const routes: Routes = [
  { path: '', component: Landing, title: '¼ Maratón Bolívar - Sucre · 9 de Enero 2027' },
  {
    path: 'admin/login',
    canActivate: [guestGuard],
    loadComponent: () => import('./admin/login/admin-login').then((m) => m.AdminLogin),
    title: 'Acceso organizador · Maratón Bolívar - Sucre',
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./admin/dashboard/admin-dashboard').then((m) => m.AdminDashboard),
    title: 'Panel del organizador · Maratón Bolívar - Sucre',
  },
  { path: '**', redirectTo: '' },
];
