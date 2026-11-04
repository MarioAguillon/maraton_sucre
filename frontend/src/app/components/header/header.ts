import { Component, signal, HostListener } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  isScrolled = signal<boolean>(false);
  mobileMenuOpen = signal<boolean>(false);

  navLinks = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Distancias', href: '#categorias' },
    { label: 'Rutas', href: '#ruta' },
    { label: 'Quiénes Somos', href: '#quienes-somos' },
    { label: 'Patrocinadores', href: '#patrocinadores' },
    { label: 'Contacto', href: '#contacto' },
  ];

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 40);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }
}

