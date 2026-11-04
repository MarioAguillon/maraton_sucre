import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-footer',
  styleUrl: './footer.scss',
  templateUrl: './footer.html',
})
export class Footer {
  currentYear = new Date().getFullYear();

  socialLinks = [
    { name: 'Instagram', icon: '📷', url: '#' },
    { name: 'Facebook', icon: '📘', url: '#' },
    { name: 'WhatsApp', icon: '📱', url: '#' },
    { name: 'TikTok', icon: '🎵', url: '#' },
  ];

  quickLinks = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Distancias', href: '#categorias' },
    { label: 'Ruta', href: '#ruta' },
    { label: 'Quiénes Somos', href: '#quienes-somos' },
    { label: 'Inscripción', href: '#inscripcion' },
    { label: 'Patrocinadores', href: '#patrocinadores' },
  ];
}
