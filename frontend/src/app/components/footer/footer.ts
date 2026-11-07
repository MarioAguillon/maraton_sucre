import { Component } from '@angular/core';
import { CONTACT, DEVELOPER, SOCIAL } from '../../config/contact.config';
import { FACEBOOK_ICON_PATH, WHATSAPP_ICON_PATH } from '../../shared/brand-icons';

@Component({
  imports: [],
  selector: 'app-footer',
  styleUrl: './footer.scss',
  templateUrl: './footer.html',
})
export class Footer {
  readonly currentYear = new Date().getFullYear();
  readonly contact = CONTACT;
  readonly social = SOCIAL;
  readonly developer = DEVELOPER;
  readonly icons = { whatsapp: WHATSAPP_ICON_PATH, facebook: FACEBOOK_ICON_PATH };

  readonly quickLinks = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Distancias', href: '#categorias' },
    { label: 'Ruta', href: '#ruta' },
    { label: 'Quiénes Somos', href: '#quienes-somos' },
    { label: 'Inscripción', href: '#inscripcion' },
    { label: 'Patrocinadores', href: '#patrocinadores' },
  ];
}
