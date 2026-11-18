import { Component, signal } from '@angular/core';
import { CONTACT } from '../../config/contact.config';

type JerseyView = 'front' | 'back';

interface JerseyModel {
  readonly id: string;
  readonly index: string;
  readonly name: string;
  readonly highlight: string;
  readonly tag: string;
  readonly description: string;
  readonly price: string;
  readonly front: string;
  readonly back: string;
  readonly whatsappUrl: string;
}

const whatsappFor = (model: string): string =>
  `${CONTACT.whatsappUrl}?text=${encodeURIComponent(
    `Hola, quiero pedir la camiseta oficial ${model} de la ¼ Maratón Bolívar - Sucre. Talla: ___ · Nombre para la espalda: ___`,
  )}`;

/** Colección de camisetas oficiales (se venden aparte de la inscripción). */
@Component({
  selector: 'app-jersey',
  templateUrl: './jersey.html',
  styleUrl: './jersey.scss',
})
export class Jersey {
  readonly models: readonly JerseyModel[] = [
    {
      id: 'sisa',
      index: '01',
      name: 'Manga',
      highlight: 'Sisa',
      tag: 'Máxima ventilación',
      description: 'Libertad total de brazos para ir a tu ritmo, kilómetro a kilómetro.',
      price: '36.000',
      front: 'assets/images/camiseta-manga-sisa-frente.webp',
      back: 'assets/images/camiseta-manga-sisa-espalda.webp',
      whatsappUrl: whatsappFor('manga sisa ($36.000 COP)'),
    },
    {
      id: 'corta',
      index: '02',
      name: 'Manga',
      highlight: 'Corta',
      tag: 'La clásica de carrera',
      description: 'El corte de siempre: cómoda en la largada y lista para la foto en la meta.',
      price: '40.000',
      front: 'assets/images/camiseta-manga-corta-frente.webp',
      back: 'assets/images/camiseta-manga-corta-espalda.webp',
      whatsappUrl: whatsappFor('manga corta ($40.000 COP)'),
    },
    {
      id: 'larga',
      index: '03',
      name: 'Manga',
      highlight: 'Larga',
      tag: 'Para las mañanas frías',
      description: 'Cubre los brazos en la salida temprana sin perder el estilo de carrera.',
      price: '50.000',
      front: 'assets/images/camiseta-manga-larga-frente.webp',
      back: 'assets/images/camiseta-manga-larga-espalda.webp',
      whatsappUrl: whatsappFor('manga larga ($50.000 COP)'),
    },
  ];

  private readonly views = signal<Record<string, JerseyView>>({});

  view(id: string): JerseyView {
    return this.views()[id] ?? 'front';
  }

  setView(id: string, view: JerseyView): void {
    this.views.update((v) => ({ ...v, [id]: view }));
  }

  flip(id: string): void {
    this.setView(id, this.view(id) === 'front' ? 'back' : 'front');
  }
}
