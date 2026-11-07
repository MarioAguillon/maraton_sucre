import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../config/event.config';
import { ApiResponse, Athlete, AthleteUpdate } from './admin.models';

@Injectable({ providedIn: 'root' })
export class AdminApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE_URL}/admin/inscripciones`;

  list(): Observable<Athlete[]> {
    return this.http.get<ApiResponse<Athlete[]>>(this.base).pipe(map((r) => r.data));
  }

  update(id: string, changes: AthleteUpdate): Observable<Athlete> {
    return this.http.put<ApiResponse<Athlete>>(`${this.base}/${id}`, changes).pipe(map((r) => r.data));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<ApiResponse<unknown>>(`${this.base}/${id}`).pipe(map(() => undefined));
  }
}
