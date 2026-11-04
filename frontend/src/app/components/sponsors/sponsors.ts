import { Component } from '@angular/core';

interface Sponsor {
  name: string;
  logo: string;
  url: string;
  tier: 'gold' | 'silver' | 'bronze';
}

@Component({
  imports: [],
  selector: 'app-sponsors',
  styleUrl: './sponsors.scss',
  templateUrl: './sponsors.html',
})
export class Sponsors {
  sponsorTiers = [
    {
      name: 'Patrocinadores Oro',
      tier: 'gold' as const,
      sponsors: [
        { name: 'Patrocinador 1', logo: 'assets/sponsors/sponsor-placeholder.png', url: '#' },
        { name: 'Patrocinador 2', logo: 'assets/sponsors/sponsor-placeholder.png', url: '#' },
      ],
    },
    {
      name: 'Patrocinadores Plata',
      tier: 'silver' as const,
      sponsors: [
        { name: 'Patrocinador 3', logo: 'assets/sponsors/sponsor-placeholder.png', url: '#' },
        { name: 'Patrocinador 4', logo: 'assets/sponsors/sponsor-placeholder.png', url: '#' },
        { name: 'Patrocinador 5', logo: 'assets/sponsors/sponsor-placeholder.png', url: '#' },
      ],
    },
    {
      name: 'Aliados',
      tier: 'bronze' as const,
      sponsors: [
        { name: 'Aliado 1', logo: 'assets/sponsors/sponsor-placeholder.png', url: '#' },
        { name: 'Aliado 2', logo: 'assets/sponsors/sponsor-placeholder.png', url: '#' },
        { name: 'Aliado 3', logo: 'assets/sponsors/sponsor-placeholder.png', url: '#' },
        { name: 'Aliado 4', logo: 'assets/sponsors/sponsor-placeholder.png', url: '#' },
      ],
    },
  ];
}
