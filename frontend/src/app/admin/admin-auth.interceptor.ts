import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/event.config';
import { AdminAuth } from './admin-auth.service';

const ADMIN_API = `${API_BASE_URL}/admin/`;

/** Añade el Bearer token a las llamadas admin y cierra sesión si el servidor responde 401. */
export const adminAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(ADMIN_API) || req.url.endsWith('/admin/login')) return next(req);

  const auth = inject(AdminAuth);
  const token = auth.token();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) auth.logout();
      return throwError(() => err);
    }),
  );
};
