import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuth } from './admin-auth.service';

/** Protege /admin: sin sesión válida redirige al login. */
export const adminGuard: CanActivateFn = () =>
  inject(AdminAuth).isAuthenticated() || inject(Router).parseUrl('/admin/login');

/** Evita mostrar el login si ya hay sesión activa. */
export const guestGuard: CanActivateFn = () =>
  !inject(AdminAuth).isAuthenticated() || inject(Router).parseUrl('/admin');
