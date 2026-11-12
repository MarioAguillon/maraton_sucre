import { Component, inject } from '@angular/core';
import { CategoryCode } from '../../config/event.config';
import { RegistrationState } from '../../services/registration-state';

interface DistanceCard {
  tag: string;
  distance: string;
  title: string;
  price: string;
  priceNote: string;
  /** Foto del atleta (sin extensión; existen .jpg, .webp y -640.webp). */
  athletePhoto: string;
  athletePhotoAlt: string;
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
      athletePhoto: 'assets/images/atleta-10k',
      athletePhotoAlt: 'Atleta con la camiseta oficial corriendo por la carretera destapada del recorrido 10.5K',
      categoryCode: 'elite_18',
      features: [
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
      athletePhoto: 'assets/images/atleta-6k',
      athletePhotoAlt: 'Atleta sonriente con la camiseta oficial corriendo en el recorrido 6K La Peña - Sucre',
      categoryCode: '6k_abierta',
      isFree: true,
      features: [
        'Medalla oficial para todos los finalistas',
        'Puntos de hidratación en ruta y meta',
        'Asistencia de primeros auxilios',
        'Categoría abierta para todas las edades',
      ],
    },
  ];

  selectDistance(code: CategoryCode): void {
    this.registrationState.selectCategory(code);
  }
}
