import { CategoryCode } from './event.config';

/**
 * Geografía del evento (Santander):
 *  - Mirando desde el sur: Bolívar queda a la DERECHA y Sucre a la IZQUIERDA.
 *  - Bolívar está algo más alto que Sucre → el recorrido desciende ligeramente hacia Sucre.
 *  - Ambas carreras usan la MISMA vía. La 10.5K sale de Bolívar (km 0) y la 6K sale del
 *    sector La Peña, a mitad de camino (km 4.5 de la vía).
 *
 * ⚠️ `ROAD.route` es un ESQUEMA (no a escala) y `ROAD.profile` es REFERENCIAL: respeta el
 * desnivel positivo publicado (+185 m en 10.5K, +45 m en 6K) y que Bolívar es más alto que
 * Sucre, pero no proviene de un GPX. Con el GPX oficial: reemplazar ambos arrays y poner
 * `PROFILE_VERIFIED = true` para retirar la etiqueta "Referencial".
 */

export interface CoursePoint {
  x: number; // 0–600, coordenadas del esquema
  y: number; // 0–320
}

export interface ElevationPoint {
  /** Km medido desde Bolívar sobre la vía. */
  km: number;
  /** Metros relativos al Parque Bolívar. */
  elevation: number;
}

export interface RoadWaypoint {
  /** Km medido desde Bolívar sobre la vía. */
  km: number;
  label: string;
  kind: 'hydration' | 'start-6k';
}

export interface CourseStat {
  label: string;
  value: string;
}

export interface Course {
  id: string;
  /** Km de la vía donde arranca esta carrera (0 = Bolívar). */
  offsetKm: number;
  distanceKm: number;
  distanceLabel: string;
  tag: string;
  title: string;
  description: string;
  start: string;
  finish: string;
  /** Cada cuántos km se dibuja un marcador en el esquema. */
  markerEveryKm: number;
  stats: CourseStat[];
  categoryCode: CategoryCode;
  /**
   * Origen/destino para abrir la ruta en Google Maps.
   * Puede ser una dirección o coordenadas "lat,lng" (más preciso cuando el nombre
   * del lugar es ambiguo, como "La Peña").
   */
  mapsOrigin: string;
  mapsDestination: string;
}

export const PROFILE_VERIFIED = false;

/** Vía Bolívar → Sucre compartida por ambas carreras. */
export const ROAD = {
  lengthKm: 10.5,
  // Salida a la derecha (Bolívar), meta a la izquierda (Sucre), descendiendo suavemente.
  route: [
    { x: 552, y: 92 },
    { x: 512, y: 118 },
    { x: 474, y: 100 },
    { x: 432, y: 132 },
    { x: 386, y: 124 },
    { x: 346, y: 158 },
    { x: 298, y: 150 },
    { x: 254, y: 182 },
    { x: 206, y: 172 },
    { x: 162, y: 204 },
    { x: 114, y: 198 },
    { x: 58, y: 232 },
  ] as CoursePoint[],
  profile: [
    { km: 0, elevation: 0 },
    { km: 0.8, elevation: 30 },
    { km: 1.6, elevation: 5 },
    { km: 2.6, elevation: 65 },
    { km: 3.4, elevation: 35 },
    { km: 4.2, elevation: 85 },
    { km: 4.5, elevation: 70 }, // Sector La Peña (salida 6K)
    { km: 5.2, elevation: 40 },
    { km: 6.0, elevation: 60 },
    { km: 7.2, elevation: 10 },
    { km: 8.0, elevation: 25 },
    { km: 9.2, elevation: -40 },
    { km: 9.8, elevation: -30 },
    { km: 10.5, elevation: -60 }, // Parque Sucre: más bajo que Bolívar
  ] as ElevationPoint[],
  waypoints: [
    { km: 4.5, label: 'La Peña · salida 6K', kind: 'start-6k' },
    { km: 5.2, label: 'Hidratación', kind: 'hydration' },
  ] as RoadWaypoint[],
} as const;

export const COURSES: readonly Course[] = [
  {
    id: '10k',
    offsetKm: 0,
    distanceKm: 10.5,
    distanceLabel: '10.5K',
    tag: 'RESISTENCIA',
    title: 'CIRCUITO BOLÍVAR - SUCRE',
    description:
      'Recorrido desafiante por carretera destapada que conecta el municipio de Bolívar con Sucre. Diseñado para corredores que buscan ritmo, resistencia y una experiencia escénica inolvidable entre las montañas de la provincia de Vélez.',
    start: 'Parque Bolívar',
    finish: 'Parque Sucre',
    markerEveryKm: 2,
    stats: [
      { label: 'Horario salida', value: '6:45 a.m. (calentamiento 6:30)' },
      { label: 'Salida → Llegada', value: 'Parque Bolívar → Parque Sucre' },
    ],
    categoryCode: 'elite_18',
    mapsOrigin: 'Parque Principal, Bolívar, Santander, Colombia',
    mapsDestination: 'Parque Principal, Sucre, Santander, Colombia',
  },
  {
    id: '6k',
    offsetKm: 4.5,
    distanceKm: 6,
    distanceLabel: '6K',
    tag: 'VELOCIDAD & FAMILIAR',
    title: 'CIRCUITO LA PEÑA - SUCRE',
    description:
      'Un trazado dinámico y accesible que parte desde el sector de La Peña, a mitad de camino entre Bolívar y Sucre. Ideal para principiantes, jóvenes y familias que desean vivir la fiesta del atletismo y recibir su medalla oficial de finalista.',
    start: 'Sector La Peña',
    finish: 'Parque Sucre',
    markerEveryKm: 1,
    stats: [
      { label: 'Horario salida', value: '6:45 a.m.' },
      { label: 'Salida → Llegada', value: 'Sector La Peña → Parque Sucre' },
    ],
    categoryCode: '6k_abierta',
    // Salida del 6K (sector La Peña) sobre la vía Bolívar → Sucre, marcada manualmente
    // por la organización en Google Maps. Se usan coordenadas porque Google confunde
    // "La Peña" con otros lugares fuera de la ruta.
    mapsOrigin: '5.934646,-73.790666',
    mapsDestination: 'Parque Principal, Sucre, Santander, Colombia',
  },
];

/** Vídeo aéreo del trayecto. `null` oculta el bloque hasta tener el archivo real. */
export const ROUTE_VIDEO: { src: string; poster: string } | null = null;

// ─── Utilidades de perfil ─────────────────────────────────────────────

export function elevationAt(km: number): number {
  const p = ROAD.profile;
  const i = p.findIndex((pt) => pt.km >= km);
  if (i <= 0) return p[0].elevation;
  const a = p[i - 1];
  const b = p[i];
  return a.elevation + ((b.elevation - a.elevation) * (km - a.km)) / (b.km - a.km || 1);
}

/** Tramo del perfil que corre una carrera, con km y altura relativos a SU salida. */
export function courseProfile(course: Course): ElevationPoint[] {
  const from = course.offsetKm;
  const to = course.offsetKm + course.distanceKm;
  const base = elevationAt(from);
  const inner = ROAD.profile.filter((p) => p.km > from && p.km < to);
  return [
    { km: 0, elevation: 0 },
    ...inner.map((p) => ({ km: round1(p.km - from), elevation: p.elevation - base })),
    { km: course.distanceKm, elevation: round1(elevationAt(to) - base) },
  ];
}

export interface ElevationSummary {
  gain: number;
  loss: number;
  net: number;
}

export function elevationSummary(course: Course): ElevationSummary {
  const pts = courseProfile(course);
  let gain = 0;
  let loss = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = pts[i].elevation - pts[i - 1].elevation;
    if (d > 0) gain += d;
    else loss -= d;
  }
  return { gain: Math.round(gain), loss: Math.round(loss), net: Math.round(pts.at(-1)!.elevation) };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
