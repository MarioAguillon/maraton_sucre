import { Component } from '@angular/core';
import { CONTACT } from '../../config/contact.config';

/** Sección de la camiseta oficial (se vende aparte de la inscripción). */
@Component({
  selector: 'app-jersey',
  templateUrl: './jersey.html',
  styleUrl: './jersey.scss',
})
export class Jersey {
  readonly whatsappUrl = `${CONTACT.whatsappUrl}?text=${encodeURIComponent(
    'Hola, quiero información sobre la camiseta oficial de la ¼ Maratón Bolívar - Sucre',
  )}`;

  readonly features = [
    'Blanca, con el logo oficial de la ¼ Maratón Bolívar - Sucre',
    'Para los atletas de 10.5K y 6K',
    'Se adquiere por separado de la inscripción',
  ];
}
