/**
 * Fuente única de verdad para los datos del evento.
 * Cambia aquí fecha, precios o categorías y se propaga a toda la app.
 */

/** Fecha y hora de salida (hora Colombia, UTC-5). */
export const EVENT_START = new Date('2027-01-09T06:45:00-05:00');

/** Día del evento (Y, M, D) usado para calcular la edad del corredor. */
export const EVENT_DAY = { year: 2027, month: 0, day: 9 } as const;

export const REGISTRATION_FEE_LABEL = '$30.000 COP';

export const EVENT_DATE_LABEL = '9 de Enero de 2027';
export const EVENT_START_TIME_LABEL = '6:45 AM';
export const EVENT_ROUTE_LABEL = 'Bolívar → Sucre';

export const API_BASE_URL =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://maraton-sucre-backend.onrender.com/api';

export type RaceType = 'cuarto' | '6k';

export type CategoryCode =
  | 'elite_18'
  | 'elite_45'
  | 'recreativa_18'
  | 'recreativa_45'
  | '6k_abierta';

export interface CategoryOption {
  value: CategoryCode;
  label: string;
  minAge: number;
  race: RaceType;
  free: boolean;
}

/**
 * NOTA: el backend (validator.js) exige actualmente 18+ para todas las categorías.
 * Si la 6K se abre a menores, bajar `minAge` aquí Y en el backend (más consentimiento del acudiente).
 */
export const CATEGORY_OPTIONS: readonly CategoryOption[] = [
  { value: 'elite_18', label: 'Elite 18+', minAge: 18, race: 'cuarto', free: false },
  { value: 'elite_45', label: 'Elite 45+', minAge: 45, race: 'cuarto', free: false },
  { value: 'recreativa_18', label: 'Recreativa 18+', minAge: 18, race: 'cuarto', free: false },
  { value: 'recreativa_45', label: 'Recreativa 45+', minAge: 45, race: 'cuarto', free: false },
  { value: '6k_abierta', label: '6K La Peña - Sucre (Gratis)', minAge: 18, race: '6k', free: true },
];

export function findCategory(code: string | null | undefined): CategoryOption | undefined {
  return CATEGORY_OPTIONS.find((c) => c.value === code);
}

/** Edad que tendrá el corredor el día del evento. `null` si la fecha es inválida. */
export function ageOnEventDay(isoDate: string | null | undefined): number | null {
  if (!isoDate) return null;
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return null;
  let age = EVENT_DAY.year - y;
  const monthDiff = EVENT_DAY.month - (m - 1);
  if (monthDiff < 0 || (monthDiff === 0 && EVENT_DAY.day < d)) age--;
  return age;
}
