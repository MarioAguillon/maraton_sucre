import { Component } from '@angular/core';
import { SPONSORSHIP_WHATSAPP_URL } from '../../config/contact.config';
import { SPONSOR_TIERS, Sponsor } from '../../config/sponsors.config';
import { WHATSAPP_ICON_PATH } from '../../shared/brand-icons';

type TierCard = { kind: 'sponsor'; sponsor: Sponsor } | { kind: 'available'; index: number };

@Component({
  imports: [],
  selector: 'app-sponsors',
  styleUrl: './sponsors.scss',
  templateUrl: './sponsors.html',
})
export class Sponsors {
  readonly sponsorshipUrl = SPONSORSHIP_WHATSAPP_URL;
  readonly whatsappIcon = WHATSAPP_ICON_PATH;

  /** Cada nivel con sus patrocinadores reales + huecos disponibles hasta completar `slots`. */
  readonly tiers = SPONSOR_TIERS.map((tier) => {
    const cards: TierCard[] = tier.sponsors.map((sponsor) => ({ kind: 'sponsor', sponsor }));
    for (let i = cards.length; i < tier.slots; i++) cards.push({ kind: 'available', index: i });
    return { ...tier, cards };
  });
}
