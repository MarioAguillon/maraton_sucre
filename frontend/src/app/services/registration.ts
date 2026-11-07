import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, CategoryCode } from '../config/event.config';

export interface RegistrationData {
  nombre: string;
  apellidos: string;
  fecha_nacimiento: string;
  correo: string;
  celular: string;
  ciudad_municipio: string;
  genero: string;
  categoria: CategoryCode | '';
  website?: string;
  terminos: boolean;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  data?: {
    codigo: string;
    nombre: string;
    categoria: string;
    genero: string;
    tipo_carrera: string;
    valor: number;
    estado: string;
  };
}

export interface ValidationErrorResponse {
  success: false;
  message: string;
  errors?: { campo: string; mensaje: string }[];
}

export interface StatsResponse {
  success: boolean;
  data: {
    total: number;
    porCategoria: Record<string, number>;
    porGenero: Record<string, number>;
    porCarrera: Record<string, number>;
  };
}

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/inscripciones`;

  register(data: RegistrationData): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(this.apiUrl, data);
  }

  getStats(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(`${this.apiUrl}/stats`);
  }
}
