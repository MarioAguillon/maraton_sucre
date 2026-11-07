import { Component, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { COURSES, Course, CourseStat, ROUTE_VIDEO, elevationSummary } from '../../config/course.config';
import { CategoryCode } from '../../config/event.config';
import { RegistrationState } from '../../services/registration-state';
import { CourseDiagram } from '../course-diagram/course-diagram';

@Component({
  imports: [CourseDiagram],
  selector: 'app-route-map',
  styleUrl: './route-map.scss',
  templateUrl: './route-map.html',
})
export class RouteMap {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly registrationState = inject(RegistrationState);

  /** Estadísticas por circuito; el desnivel se calcula del perfil para no contradecir el gráfico. */
  readonly courses = COURSES.map((course) => {
    const e = elevationSummary(course);
    const elevation: CourseStat = {
      label: 'Desnivel',
      value: `+${e.gain} m / −${e.loss} m`,
    };
    return { ...course, stats: [course.stats[0], elevation, ...course.stats.slice(1)] };
  });
  readonly routeVideo = ROUTE_VIDEO;
  private readonly mainCourse = COURSES[0];

  /** Fachada: el iframe de Google Maps (~1 MB de JS) solo se carga al pedirlo. */
  readonly mapLoaded = signal(false);

  /** Embed sin API key con la ruta Bolívar → Sucre. URL constante, sin datos de usuario. */
  readonly mapEmbedUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    `https://maps.google.com/maps?saddr=${encodeURIComponent(this.mainCourse.mapsOrigin)}` +
      `&daddr=${encodeURIComponent(this.mainCourse.mapsDestination)}&hl=es&output=embed`,
  );

  directionsUrl(course: Course): string {
    return (
      'https://www.google.com/maps/dir/?api=1' +
      `&origin=${encodeURIComponent(course.mapsOrigin)}` +
      `&destination=${encodeURIComponent(course.mapsDestination)}&travelmode=walking`
    );
  }

  loadMap(): void {
    this.mapLoaded.set(true);
  }

  selectCircuit(code: CategoryCode): void {
    this.registrationState.selectCategory(code);
  }
}
