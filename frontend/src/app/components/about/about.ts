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
      icon: '🏔️',
      title: 'Paisaje y Tradición',
      desc: 'Corremos por la hermosa provincia de Vélez, uniendo la calidez y el patrimonio histórico de Bolívar y Sucre, Santander.',
    },
    {
      icon: '⚡',
      title: 'Espíritu Deportivo',
      desc: 'Un desafío atlético de primer nivel tanto para corredores élite como para aficionados y familias que aman el running.',
    },
    {
      icon: '🤝',
      title: 'Impacto Comunitario',
      desc: 'Fomentamos el turismo deportivo, la economía local de los campesinos y el desarrollo integral de la juventud santandereana.',
    },
  ];
}

