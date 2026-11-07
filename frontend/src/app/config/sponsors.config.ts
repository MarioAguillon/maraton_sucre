/**
 * Patrocinadores por nivel. Para añadir uno: agrégalo al array `sponsors` de su nivel
 * (logo en public/assets/sponsors/, idealmente SVG o PNG transparente horizontal).
 * Los huecos hasta completar `slots` se muestran como "Espacio disponible".
 */

export type SponsorTierId = 'gold' | 'silver' | 'allies';

export interface Sponsor {
  name: string;
  logo: string;
  url?: string;
}

export interface SponsorTier {
  id: SponsorTierId;
  name: string;
  tagline: string;
  slots: number;
  sponsors: Sponsor[];
}

export const SPONSOR_TIERS: readonly SponsorTier[] = [
  { id: 'gold', name: 'Patrocinadores Oro', tagline: 'Socios principales', slots: 2, sponsors: [] },
  { id: 'silver', name: 'Patrocinadores Plata', tagline: 'Socios oficiales', slots: 3, sponsors: [] },
  { id: 'allies', name: 'Aliados', tagline: 'Apoyo institucional y comunitario', slots: 4, sponsors: [] },
];
