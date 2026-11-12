import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-about',
  styleUrl: './about.scss',
  templateUrl: './about.html',
})
export class About {
  pillars = [
    {
      photo: 'assets/images/pilar-paisaje.webp',
      alt: 'Montañas y carretera destapada de la provincia de Vélez',
      title: 'Paisaje y Tradición',
      desc: 'Corremos por la hermosa provincia de Vélez, uniendo la calidez y el patrimonio histórico de Bolívar y Sucre, Santander.',
    },
    {
      photo: 'assets/images/pilar-espiritu.webp',
      alt: 'Atletas en la salida de la carrera',
      title: 'Espíritu Deportivo',
      desc: 'Un desafío atlético de primer nivel tanto para corredores élite como para aficionados y familias que aman el running.',
    },
    {
      photo: 'assets/images/pilar-comunidad.webp',
      alt: 'Viviendas campesinas junto a la ruta entre Bolívar y Sucre',
      title: 'Impacto Comunitario',
      desc: 'Fomentamos el turismo deportivo, la economía local de los campesinos y el desarrollo integral de la juventud santandereana.',
    },
  ];
}

