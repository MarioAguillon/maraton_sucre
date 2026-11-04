import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegistrationData {
  nombre: string;
  apellidos: string;
  fecha_nacimiento: string;
  correo: string;
  celular: string;
  ciudad_municipio: string;
  genero: string;
  categoria: string;
  website?: string;
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
  private apiUrl = 'http://localhost:3000/api/inscripciones';

  constructor(private http: HttpClient) {}

  register(data: RegistrationData): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(this.apiUrl, data);
  }

  getStats(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(`${this.apiUrl}/stats`);
  }
}
