import { Component, computed, input } from '@angular/core';
import {
  Course,
  CoursePoint,
  PROFILE_VERIFIED,
  ROAD,
  courseProfile,
  elevationSummary,
} from '../../config/course.config';

interface Sample extends CoursePoint {
  length: number;
}

interface Tick {
  pos: number;
  label: string;
}

/** Área del perfil altimétrico dentro del viewBox 600×190. */
const PROFILE = { left: 70, right: 572, top: 34, bottom: 150 } as const;
const SAMPLES_PER_SEGMENT = 16;

/** Curva de la vía completa (se calcula una sola vez: es la misma para ambas carreras). */
const ROAD_CURVE = buildCurve(ROAD.route);

/**
 * Infografía del circuito, vista desde el sur: Bolívar a la derecha, Sucre a la izquierda.
 * Dibuja la vía completa y resalta el tramo que corre cada carrera, más su perfil altimétrico
 * con el mismo sentido de lectura (salida a la derecha).
 */
@Component({
  selector: 'app-course-diagram',
  templateUrl: './course-diagram.html',
  styleUrl: './course-diagram.scss',
})
export class CourseDiagram {
  readonly course = input.required<Course>();

  readonly uid = computed(() => `course-${this.course().id}`);
  readonly verified = PROFILE_VERIFIED;
  readonly profile = PROFILE;

  // ─── Esquema ─────────────────────────────────────────────────────
  /** Vía completa (tenue) como referencia geográfica. */
  readonly roadPath = ROAD_CURVE.d;
  readonly bolivar = ROAD.route[0];
  readonly sucre = ROAD.route.at(-1)!;

  private readonly fromFraction = computed(() => this.course().offsetKm / ROAD.lengthKm);
  private readonly toFraction = computed(
    () => (this.course().offsetKm + this.course().distanceKm) / ROAD.lengthKm,
  );

  /** Tramo activo de esta carrera (polilínea densa sobre la curva). */
  readonly activePath = computed(() =>
    slicePath(ROAD_CURVE.samples, this.fromFraction(), this.toFraction()),
  );
  readonly start = computed(() => pointAt(ROAD_CURVE.samples, this.fromFraction()));
  readonly finish = computed(() => pointAt(ROAD_CURVE.samples, this.toFraction()));
  readonly startsMidRoad = computed(() => this.course().offsetKm > 0);

  readonly kmMarkers = computed(() => {
    const { distanceKm, markerEveryKm, offsetKm } = this.course();
    const markers: (CoursePoint & { km: number })[] = [];
    for (let km = markerEveryKm; km < distanceKm - markerEveryKm / 3; km += markerEveryKm) {
      markers.push({ km, ...pointAt(ROAD_CURVE.samples, (offsetKm + km) / ROAD.lengthKm) });
    }
    return markers;
  });

  /** Puntos de servicio dentro del tramo (km relativo a la salida de esta carrera). */
  readonly waypoints = computed(() => {
    const { offsetKm, distanceKm } = this.course();
    return ROAD.waypoints
      .filter((w) => w.km > offsetKm && w.km <= offsetKm + distanceKm)
      .map((w) => ({
        ...w,
        courseKm: round1(w.km - offsetKm),
        ...pointAt(ROAD_CURVE.samples, w.km / ROAD.lengthKm),
      }));
  });

  // ─── Perfil (km 0 a la DERECHA) ──────────────────────────────────
  private readonly points = computed(() => courseProfile(this.course()));
  readonly summary = computed(() => elevationSummary(this.course()));

  private readonly yDomain = computed(() => {
    const els = this.points().map((p) => p.elevation);
    const step = Math.max(...els) - Math.min(...els) <= 80 ? 20 : 50;
    return {
      step,
      min: Math.floor(Math.min(0, ...els) / step) * step,
      max: Math.ceil(Math.max(0, ...els) / step) * step || step,
    };
  });

  private xFor(km: number): number {
    return PROFILE.right - (km / this.course().distanceKm) * (PROFILE.right - PROFILE.left);
  }

  private yFor(elevation: number): number {
    const { min, max } = this.yDomain();
    return PROFILE.bottom - ((elevation - min) / (max - min)) * (PROFILE.bottom - PROFILE.top);
  }

  readonly profileLine = computed(() =>
    this.points()
      .map((p, i) => `${i ? 'L' : 'M'}${r(this.xFor(p.km))} ${r(this.yFor(p.elevation))}`)
      .join(' '),
  );

  readonly profileArea = computed(() => {
    const pts = this.points();
    return `${this.profileLine()} L${r(this.xFor(pts.at(-1)!.km))} ${PROFILE.bottom} L${r(this.xFor(0))} ${PROFILE.bottom} Z`;
  });

  readonly xTicks = computed<Tick[]>(() => {
    const { distanceKm, markerEveryKm } = this.course();
    const ticks: Tick[] = [];
    for (let km = 0; km < distanceKm - markerEveryKm / 3; km += markerEveryKm) {
      ticks.push({ pos: this.xFor(km), label: `${km}` });
    }
    ticks.push({ pos: this.xFor(distanceKm), label: `${distanceKm}` });
    return ticks;
  });

  readonly yTicks = computed<Tick[]>(() => {
    const { min, max, step } = this.yDomain();
    const ticks: Tick[] = [];
    for (let e = min; e <= max; e += step) {
      ticks.push({ pos: this.yFor(e), label: e === 0 ? '0 m' : `${e > 0 ? '+' : '−'}${Math.abs(e)} m` });
    }
    return ticks;
  });

  readonly zeroY = computed(() => this.yFor(0));

  readonly profileWaypoints = computed(() => {
    const pts = this.points();
    return this.waypoints().map((w) => ({
      ...w,
      px: this.xFor(w.courseKm),
      py: this.yFor(interpolate(pts, w.courseKm)),
    }));
  });

  readonly profileEnds = computed(() => {
    const pts = this.points();
    return {
      start: { x: this.xFor(0), y: this.yFor(0) },
      finish: { x: this.xFor(pts.at(-1)!.km), y: this.yFor(pts.at(-1)!.elevation) },
    };
  });

  // ─── Textos accesibles ───────────────────────────────────────────
  readonly mapDescription = computed(() => {
    const c = this.course();
    const wp = this.waypoints()
      .map((w) => `${w.label} en el km ${w.courseKm}`)
      .join(', ');
    const mid = this.startsMidRoad() ? `, a mitad de la vía Bolívar - Sucre,` : '';
    return `Esquema del recorrido de ${c.distanceLabel} visto desde el sur, no a escala. Sale de ${c.start}${mid} a la derecha y avanza hacia la izquierda, descendiendo hasta la meta en ${c.finish}.${wp ? ' ' + wp + '.' : ''}`;
  });

  readonly profileDescription = computed(() => {
    const c = this.course();
    const s = this.summary();
    return `Perfil altimétrico ${this.verified ? '' : 'referencial '}de ${c.distanceLabel}: desnivel positivo ${s.gain} m, negativo ${s.loss} m; la meta en ${c.finish} queda ${Math.abs(s.net)} m ${s.net < 0 ? 'por debajo' : 'por encima'} de la salida.`;
  });
}

// ─── Geometría ──────────────────────────────────────────────────────

function r(n: number): number {
  return Math.round(n * 10) / 10;
}
const round1 = r;

/** Catmull-Rom → Bézier cúbica que pasa por todos los puntos, más muestras para medir longitud. */
function buildCurve(points: readonly CoursePoint[]): { d: string; samples: Sample[] } {
  let d = `M${points[0].x} ${points[0].y}`;
  const samples: Sample[] = [{ ...points[0], length: 0 }];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${r(c1.x)} ${r(c1.y)} ${r(c2.x)} ${r(c2.y)} ${p2.x} ${p2.y}`;

    for (let s = 1; s <= SAMPLES_PER_SEGMENT; s++) {
      const pt = bezier(p1, c1, c2, p2, s / SAMPLES_PER_SEGMENT);
      const prev = samples[samples.length - 1];
      samples.push({ ...pt, length: prev.length + Math.hypot(pt.x - prev.x, pt.y - prev.y) });
    }
  }
  return { d, samples };
}

function bezier(p0: CoursePoint, c1: CoursePoint, c2: CoursePoint, p1: CoursePoint, t: number): CoursePoint {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p1.x,
    y: u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p1.y,
  };
}

/** Punto a una fracción (0–1) de la longitud total de la curva. */
function pointAt(samples: Sample[], fraction: number): CoursePoint {
  const target = samples[samples.length - 1].length * Math.min(Math.max(fraction, 0), 1);
  const i = samples.findIndex((s) => s.length >= target);
  if (i <= 0) return { x: samples[0].x, y: samples[0].y };
  const a = samples[i - 1];
  const b = samples[i];
  const t = (target - a.length) / (b.length - a.length || 1);
  return { x: r(a.x + (b.x - a.x) * t), y: r(a.y + (b.y - a.y) * t) };
}

/** Polilínea del tramo [from, to] (fracciones de la longitud total). */
function slicePath(samples: Sample[], from: number, to: number): string {
  const total = samples[samples.length - 1].length;
  const a = pointAt(samples, from);
  const b = pointAt(samples, to);
  const inner = samples.filter((s) => s.length > total * from && s.length < total * to);
  return [a, ...inner, b].map((p, i) => `${i ? 'L' : 'M'}${r(p.x)} ${r(p.y)}`).join(' ');
}

function interpolate(pts: { km: number; elevation: number }[], km: number): number {
  const i = pts.findIndex((p) => p.km >= km);
  if (i <= 0) return pts[0].elevation;
  const a = pts[i - 1];
  const b = pts[i];
  return a.elevation + ((b.elevation - a.elevation) * (km - a.km)) / (b.km - a.km || 1);
}
