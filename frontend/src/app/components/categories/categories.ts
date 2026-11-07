import { Component, inject } from '@angular/core';
import { CategoryCode } from '../../config/event.config';
import { RegistrationState } from '../../services/registration-state';

interface DistanceCard {
  tag: string;
  distance: string;
  title: string;
  price: string;
  priceNote: string;
  athleteImg: string;
  categoryCode: CategoryCode;
  isFree?: boolean;
  features: string[];
}

@Component({
  imports: [],
  selector: 'app-categories',
  styleUrl: './categories.scss',
  templateUrl: './categories.html',
})
export class Categories {
  private readonly registrationState = inject(RegistrationState);

  distances: DistanceCard[] = [
    {
      tag: 'RESISTENCIA & VELOCIDAD',
      distance: '10.5K',
      title: '¼ MARATÓN BOLÍVAR - SUCRE',
      price: '$30.000',
      priceNote: 'PRECIO OFICIAL · CUPOS LIMITADOS',
      athleteImg: 'assets/images/athlete-10k.svg',
      categoryCode: 'elite_18',
      features: [
        'Cronometraje electrónico con chip',
        'Camiseta oficial del evento',
        'Medalla de finalista conmemorativa',
        'Puntos de hidratación y asistencia médica',
        'Premiación en efectivo: $3.200.000 COP en podio',
      ],
    },
    {
      tag: 'RECREATIVA & FAMILIAR',
      distance: '6K',
      title: 'LA PEÑA - SUCRE',
      price: 'GRATIS',
      priceNote: 'INSCRIPCIÓN ABIERTA · INCLUYE MEDALLA',
      athleteImg: 'assets/images/athlete-6k.svg',
      categoryCode: '6k_abierta',
      isFree: true,
      features: [
        'Medalla oficial para todos los finalistas',
        'Puntos de hidratación en ruta y meta',
        'Asistencia de primeros auxilios',
        'Integración comunitaria y recreativa',
        'Categoría abierta para todas las edades',
      ],
    },
  ];

  selectDistance(code: CategoryCode): void {
    this.registrationState.selectCategory(code);
  }
}
