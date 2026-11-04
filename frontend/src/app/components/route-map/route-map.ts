import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface CircuitCard {
  distance: string;
  tag: string;
  circuitTitle: string;
  description: string;
  circuitImg: string;
  stat1Label: string;
  stat1Value: string;
  stat2Label: string;
  stat2Value: string;
  stat3Label: string;
  stat3Value: string;
  categoryCode: string;
}

@Component({
  imports: [],
  selector: 'app-route-map',
  styleUrl: './route-map.scss',
  templateUrl: './route-map.html',
})
export class RouteMap {
  private sanitizer = inject(DomSanitizer);

  safeMapUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d63450!2d-73.80!3d5.95!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e0!4m5!1s0x8e6a0d4c1b2c3d4f%3A0x12345678!2sBol%C3%ADvar%2C+Santander!3m2!1d5.9961!2d-73.7744!4m5!1s0x8e6a123456789abc%3A0x87654321!2sSucre%2C+Santander!3m2!1d5.9147!2d-73.7997!5e0!3m2!1ses!2sco!4v1700000000000'
  );

  circuits: CircuitCard[] = [
    {
      distance: '10.5K',
      tag: 'RESISTENCIA',
      circuitTitle: 'CIRCUITO BOLÍVAR - SUCRE',
      description:
        'Recorrido desafiante y mayormente pavimentado que conecta el municipio de Bolívar con Sucre. Diseñado para corredores que buscan ritmo, resistencia y una experiencia escénica inolvidable entre las montañas y valles de Santander.',
      circuitImg: 'assets/images/circuit-10k.svg',
      stat1Label: 'HORARIO SALIDA',
      stat1Value: '6:45 a.m. (Calentamiento 6:30 a.m.)',
      stat2Label: 'DESNIVEL',
      stat2Value: 'Positivo 185m',
      stat3Label: 'SALIDA / LLEGADA',
      stat3Value: 'Parque Bolívar → Parque Sucre',
      categoryCode: 'elite_18',
    },
    {
      distance: '6K',
      tag: 'VELOCIDAD & FAMILIAR',
      circuitTitle: 'CIRCUITO LA PEÑA - SUCRE',
      description:
        'Un trazado dinámico y accesible que parte desde el sector de La Peña con destino a Sucre. Ideal para principiantes, jóvenes y familias que desean vivir la fiesta del atletismo y recibir su medalla oficial de finalista.',
      circuitImg: 'assets/images/circuit-6k.svg',
      stat1Label: 'HORARIO SALIDA',
      stat1Value: '6:45 a.m.',
      stat2Label: 'DESNIVEL',
      stat2Value: 'Positivo 45m',
      stat3Label: 'SALIDA / LLEGADA',
      stat3Value: 'Sector La Peña → Parque Sucre',
      categoryCode: '6k_abierta',
    },
  ];

  selectCircuit(code: string): void {
    const regSection = document.getElementById('inscripcion');
    if (regSection) {
      regSection.scrollIntoView({ behavior: 'smooth' });
    }
    const selectElem = document.getElementById('categoria') as HTMLSelectElement | null;
    if (selectElem) {
      selectElem.value = code;
      selectElem.dispatchEvent(new Event('change'));
    }
  }
}
