import { Component } from '@angular/core';
import { CONTACT } from '../../config/contact.config';
import { WHATSAPP_ICON_PATH } from '../../shared/brand-icons';

/** Botón flotante de WhatsApp: atención al atleta. */
@Component({
  selector: 'app-whatsapp-fab',
  styleUrl: './whatsapp-fab.scss',
  template: `
    <a
      class="fab"
      [href]="url"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp: atención al atleta (se abre en una pestaña nueva)"
    >
      <span class="fab__pulse" aria-hidden="true"></span>
      <svg class="fab__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path [attr.d]="iconPath" />
      </svg>
      <span class="fab__label" aria-hidden="true">¿Dudas? Escríbenos</span>
    </a>
  `,
})
export class WhatsappFab {
  readonly url = CONTACT.whatsappUrl;
  readonly iconPath = WHATSAPP_ICON_PATH;
}
