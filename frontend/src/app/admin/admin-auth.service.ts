import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { API_BASE_URL } from '../config/event.config';
import { ApiResponse } from './admin.models';

interface Session {
  token: string;
  usuario: string;
  expiresAt: string;
}

const STORAGE_KEY = 'mbs-admin-session';

/** Sesión del organizador. Se guarda en sessionStorage (se borra al cerrar la pestaña). */
@Injectable({ providedIn: 'root' })
export class AdminAuth {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly session = signal<Session | null>(this.restore());

  readonly token = computed(() => this.session()?.token ?? null);
  readonly username = computed(() => this.session()?.usuario ?? '');

  isAuthenticated(): boolean {
    const s = this.session();
    if (!s) return false;
    if (new Date(s.expiresAt).getTime() <= Date.now()) {
      this.clear();
      return false;
    }
    return true;
  }

  login(usuario: string, contrasena: string): Observable<void> {
    return this.http
      .post<ApiResponse<Session>>(`${API_BASE_URL}/admin/login`, { usuario, contrasena })
      .pipe(
        tap(({ data }) => {
          this.session.set(data);
          try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          } catch {
            /* storage no disponible: la sesión vive solo en memoria */
          }
        }),
        map(() => undefined),
      );
  }

  logout(): void {
    this.clear();
    this.router.navigateByUrl('/admin/login');
  }

  private clear(): void {
    this.session.set(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }

  private restore(): Session | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  }
}
