import { CategoryCode } from '../config/event.config';

export type Gender = 'masculino' | 'femenino';
export type RegistrationStatus = 'pendiente' | 'confirmado' | 'cancelado';

export interface Athlete {
  id: string;
  codigo_inscripcion: string;
  nombre: string;
  apellidos: string;
  cedula: string | null;
  fecha_nacimiento: string;
  correo: string;
  celular: string;
  ciudad_municipio: string;
  genero: Gender;
  categoria: CategoryCode;
  tipo_carrera: 'cuarto_maraton' | '6k_la_pena';
  edad_al_evento: number;
  estado: RegistrationStatus;
  valor_inscripcion: number;
  created_at: string;
}

export type AthleteUpdate = Partial<
  Pick<
    Athlete,
    'nombre' | 'apellidos' | 'cedula' | 'fecha_nacimiento' | 'correo' | 'celular'
    | 'ciudad_municipio' | 'genero' | 'categoria' | 'estado'
  >
>;

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
